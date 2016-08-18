var AxisBuilder, BufferLayer, ExprCleaner, ExprCompiler, ExprUtils, H, Layer, LegendGroup, React, _, injectTableAlias,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

Layer = require('./Layer');

ExprCompiler = require('mwater-expressions').ExprCompiler;

injectTableAlias = require('mwater-expressions').injectTableAlias;

ExprCleaner = require('mwater-expressions').ExprCleaner;

ExprUtils = require('mwater-expressions').ExprUtils;

AxisBuilder = require('../axes/AxisBuilder');

LegendGroup = require('./LegendGroup');


/*
Layer which draws a buffer around geometries (i.e. a radius circle around points)

Design is:
  table: table to get data from
  axes: axes (see below)
  filter: optional logical expression to filter by
  color: color of layer (e.g. #FF8800). Color axis overrides
  fillOpacity: Opacity to fill the circles (0-1)
  radius: radius to draw in meters

  popup: contains items: which is BlocksLayoutManager items. Will be displayed when the circle is clicked

axes:
  geometry: where to draw buffers around
  color: color axis
 */

module.exports = BufferLayer = (function(superClass) {
  extend(BufferLayer, superClass);

  function BufferLayer() {
    return BufferLayer.__super__.constructor.apply(this, arguments);
  }

  BufferLayer.prototype.getJsonQLCss = function(design, schema, filters) {
    var layerDef;
    layerDef = {
      layers: [
        {
          id: "layer0",
          jsonql: this.createJsonQL(design, schema, filters)
        }
      ],
      css: this.createCss(design, schema, filters)
    };
    return layerDef;
  };

  BufferLayer.prototype.createJsonQL = function(design, schema, filters) {
    var axisBuilder, boundingBox, bufferedGeometry, colorExpr, exprCompiler, filter, geometryExpr, j, len, query, radiusDeg, relevantFilters, selects, whereClauses;
    axisBuilder = new AxisBuilder({
      schema: schema
    });
    exprCompiler = new ExprCompiler(schema);

    /* 
    Query:
      select 
      <primary key> as id,
      [<color axis> as color,
      st_transform(st_buffer(st_transform(<geometry axis>, 4326)::geography, <radius>)::geometry, 3857) as the_geom_webmercator
      from <table> as main
      where
        <geometry axis> is not null
         * Bounding box filter for speed 
      and <geometry axis> && 
      ST_Transform(ST_Expand(
         * Prevent 3857 overflow (i.e. > 85 degrees lat) 
        ST_Intersection(
          ST_Transform(!bbox!, 4326),
          ST_Expand(ST_MakeEnvelope(-180, -85, 180, 85, 4326), -<radius in degrees>))
        , <radius in degrees>})
      , 3857)
      and <other filters>
     */
    geometryExpr = axisBuilder.compileAxis({
      axis: design.axes.geometry,
      tableAlias: "main"
    });
    bufferedGeometry = {
      type: "op",
      op: "ST_Transform",
      exprs: [
        {
          type: "op",
          op: "::geometry",
          exprs: [
            {
              type: "op",
              op: "ST_Buffer",
              exprs: [
                {
                  type: "op",
                  op: "::geography",
                  exprs: [
                    {
                      type: "op",
                      op: "ST_Transform",
                      exprs: [geometryExpr, 4326]
                    }
                  ]
                }, design.radius
              ]
            }
          ]
        }, 3857
      ]
    };
    selects = [
      {
        type: "select",
        expr: {
          type: "field",
          tableAlias: "main",
          column: schema.getTable(design.table).primaryKey
        },
        alias: "id"
      }, {
        type: "select",
        expr: bufferedGeometry,
        alias: "the_geom_webmercator"
      }
    ];
    if (design.axes.color) {
      colorExpr = axisBuilder.compileAxis({
        axis: design.axes.color,
        tableAlias: "main"
      });
      selects.push({
        type: "select",
        expr: colorExpr,
        alias: "color"
      });
    }
    query = {
      type: "query",
      selects: selects,
      from: exprCompiler.compileTable(design.table, "main")
    };
    radiusDeg = design.radius / 100000;
    boundingBox = {
      type: "op",
      op: "ST_Transform",
      exprs: [
        {
          type: "op",
          op: "ST_Expand",
          exprs: [
            {
              type: "op",
              op: "ST_Intersection",
              exprs: [
                {
                  type: "op",
                  op: "ST_Transform",
                  exprs: [
                    {
                      type: "token",
                      token: "!bbox!"
                    }, 4326
                  ]
                }, {
                  type: "op",
                  op: "ST_Expand",
                  exprs: [
                    {
                      type: "op",
                      op: "ST_MakeEnvelope",
                      exprs: [-180, -85, 180, 85, 4326]
                    }, -radiusDeg
                  ]
                }
              ]
            }, radiusDeg
          ]
        }, 3857
      ]
    };
    whereClauses = [
      {
        type: "op",
        op: "is not null",
        exprs: [geometryExpr]
      }, {
        type: "op",
        op: "&&",
        exprs: [geometryExpr, boundingBox]
      }
    ];
    if (design.filter) {
      whereClauses.push(exprCompiler.compileExpr({
        expr: design.filter,
        tableAlias: "main"
      }));
    }
    relevantFilters = _.where(filters, {
      table: design.table
    });
    for (j = 0, len = relevantFilters.length; j < len; j++) {
      filter = relevantFilters[j];
      whereClauses.push(injectTableAlias(filter.jsonql, "main"));
    }
    whereClauses = _.compact(whereClauses);
    if (whereClauses.length > 1) {
      query.where = {
        type: "op",
        op: "and",
        exprs: whereClauses
      };
    } else {
      query.where = whereClauses[0];
    }
    return query;
  };

  BufferLayer.prototype.createCss = function(design, schema) {
    var actualOrder, css, i, item, iteratee, j, len, order;
    css = "";
    if (design.color) {
      css += '#layer0 {\n  opacity: ' + design.fillOpacity + ';\npolygon-fill: ' + design.color + ';\n}';
    }
    if (design.axes.color && design.axes.color.colorMap) {
      iteratee = design.axes.color.colorMap;
      order = design.axes.color.drawOrder || _.pluck(design.axes.color.colorMap, "value");
      actualOrder = _(order).reverse().value();
      iteratee = _.sortBy(design.axes.color.colorMap, (function(_this) {
        return function(item) {
          return _.indexOf(actualOrder, item.value);
        };
      })(this));
      for (i = j = 0, len = iteratee.length; j < len; i = ++j) {
        item = iteratee[i];
        css += "#layer0::" + i + " [color=" + (JSON.stringify(item.value)) + "] { polygon-fill: " + item.color + "; opacity: " + design.fillOpacity + "; }\n";
      }
    }
    return css;
  };

  BufferLayer.prototype.onGridClick = function(ev, options) {
    return null;
  };

  BufferLayer.prototype.getMinZoom = function(design) {
    if (design.radius) {
      return Math.ceil(Math.log(40000000 * 5 / (2 * design.radius * 256)) / Math.log(2));
    } else {
      return null;
    }
  };

  BufferLayer.prototype.getMaxZoom = function(design) {
    return null;
  };

  BufferLayer.prototype.getLegend = function(design, schema, name) {
    var axisBuilder, categories, colors, exprUtils, legendGroupProps;
    axisBuilder = new AxisBuilder({
      schema: schema
    });
    exprUtils = new ExprUtils(schema);
    if (design.axes.color && design.axes.color.colorMap) {
      categories = axisBuilder.getCategories(design.axes.color);
      colors = _.map(design.axes.color.colorMap, (function(_this) {
        return function(colorItem) {
          var _name, category;
          category = _.find(categories, {
            value: colorItem.value
          });
          _name = category ? ExprUtils.localizeString(category.label) : colorItem.value;
          return {
            color: colorItem.color,
            name: _name
          };
        };
      })(this));
    } else {
      colors = [];
    }
    legendGroupProps = {
      items: colors,
      key: design.axes.geometry.expr.table,
      defaultColor: design.color,
      name: name,
      radiusLayer: true
    };
    return H.div(null, React.createElement(LegendGroup, legendGroupProps));
  };

  BufferLayer.prototype.getFilterableTables = function(design, schema) {
    if (design.table) {
      return [design.table];
    } else {
      return [];
    }
  };

  BufferLayer.prototype.isEditable = function(design, schema) {
    return true;
  };

  BufferLayer.prototype.isIncomplete = function(design, schema) {
    return this.validateDesign(design, schema) != null;
  };

  BufferLayer.prototype.createDesignerElement = function(options) {
    var BufferLayerDesignerComponent;
    BufferLayerDesignerComponent = require('./BufferLayerDesignerComponent');
    return React.createElement(BufferLayerDesignerComponent, {
      schema: options.schema,
      dataSource: options.dataSource,
      design: this.cleanDesign(options.design, options.schema),
      onDesignChange: (function(_this) {
        return function(design) {
          return options.onDesignChange(_this.cleanDesign(design, options.schema));
        };
      })(this)
    });
  };

  BufferLayer.prototype.cleanDesign = function(design, schema) {
    var axisBuilder, exprCleaner;
    exprCleaner = new ExprCleaner(schema);
    axisBuilder = new AxisBuilder({
      schema: schema
    });
    design = _.cloneDeep(design);
    design.axes = design.axes || {};
    design.radius = design.radius || 1000;
    design.fillOpacity = design.fillOpacity != null ? design.fillOpacity : 0.5;
    design.axes.geometry = axisBuilder.cleanAxis({
      axis: design.axes.geometry,
      table: design.table,
      types: ['geometry'],
      aggrNeed: "none"
    });
    design.axes.color = axisBuilder.cleanAxis({
      axis: design.axes.color,
      table: design.table,
      types: ['enum', 'text', 'boolean'],
      aggrNeed: "none"
    });
    design.filter = exprCleaner.cleanExpr(design.filter, {
      table: design.table
    });
    return design;
  };

  BufferLayer.prototype.validateDesign = function(design, schema) {
    var axisBuilder, error;
    axisBuilder = new AxisBuilder({
      schema: schema
    });
    if (!design.table) {
      return "Missing table";
    }
    if (design.radius == null) {
      return "Missing radius";
    }
    if (!design.axes || !design.axes.geometry) {
      return "Missing axes";
    }
    error = axisBuilder.validateAxis({
      axis: design.axes.geometry
    });
    if (error) {
      return error;
    }
    error = axisBuilder.validateAxis({
      axis: design.axes.color
    });
    if (error) {
      return error;
    }
    return null;
  };

  BufferLayer.prototype.createKMLExportJsonQL = function(design, schema, filters) {
    var actualOrder, axisBuilder, bufferedGeometry, cases, colorExpr, exprCompiler, filter, geometryExpr, j, len, order, outerQuery, query, radiusDeg, relevantFilters, selects, whereClauses;
    axisBuilder = new AxisBuilder({
      schema: schema
    });
    exprCompiler = new ExprCompiler(schema);
    geometryExpr = axisBuilder.compileAxis({
      axis: design.axes.geometry,
      tableAlias: "main"
    });
    bufferedGeometry = {
      type: "op",
      op: "ST_AsGeoJson",
      exprs: [
        {
          type: "op",
          op: "::geometry",
          exprs: [
            {
              type: "op",
              op: "ST_Buffer",
              exprs: [
                {
                  type: "op",
                  op: "::geography",
                  exprs: [
                    {
                      type: "op",
                      op: "ST_Transform",
                      exprs: [geometryExpr, 4326]
                    }
                  ]
                }, design.radius
              ]
            }
          ]
        }
      ]
    };
    selects = [
      {
        type: "select",
        expr: {
          type: "field",
          tableAlias: "main",
          column: schema.getTable(design.table).primaryKey
        },
        alias: "id"
      }, {
        type: "select",
        expr: bufferedGeometry,
        alias: "the_geom_webmercator"
      }
    ];
    if (design.axes.color) {
      colorExpr = axisBuilder.compileAxis({
        axis: design.axes.color,
        tableAlias: "main"
      });
      selects.push({
        type: "select",
        expr: colorExpr,
        alias: "color"
      });
    }
    query = {
      type: "query",
      selects: selects,
      from: exprCompiler.compileTable(design.table, "main")
    };
    radiusDeg = design.radius / 100000;
    whereClauses = [
      {
        type: "op",
        op: "is not null",
        exprs: [geometryExpr]
      }
    ];
    if (design.filter) {
      whereClauses.push(exprCompiler.compileExpr({
        expr: design.filter,
        tableAlias: "main"
      }));
    }
    relevantFilters = _.where(filters, {
      table: design.table
    });
    for (j = 0, len = relevantFilters.length; j < len; j++) {
      filter = relevantFilters[j];
      whereClauses.push(injectTableAlias(filter.jsonql, "main"));
    }
    whereClauses = _.compact(whereClauses);
    if (whereClauses.length > 1) {
      query.where = {
        type: "op",
        op: "and",
        exprs: whereClauses
      };
    } else {
      query.where = whereClauses[0];
    }
    if (design.axes.color && design.axes.color.colorMap) {
      order = design.axes.color.drawOrder || _.pluck(design.axes.color.colorMap, "value");
      actualOrder = _(order).reverse().value();
      cases = _.map(actualOrder, (function(_this) {
        return function(value, i) {
          return {
            when: value,
            then: i
          };
        };
      })(this));
      outerQuery = {
        type: "query",
        selects: [
          {
            type: "select",
            expr: {
              type: "field",
              tableAlias: "outer",
              column: "id"
            },
            alias: "id"
          }, {
            type: "select",
            expr: {
              type: "field",
              tableAlias: "outer",
              column: "the_geom_webmercator"
            },
            alias: "the_geom_webmercator"
          }, {
            type: "select",
            expr: {
              type: "field",
              tableAlias: "outer",
              column: "color"
            },
            alias: "color"
          }
        ],
        from: {
          type: "subquery",
          query: query,
          alias: "outer"
        },
        orderBy: [
          {
            expr: {
              type: "case",
              input: {
                type: "field",
                tableAlias: "outer",
                column: "color"
              },
              cases: cases
            }
          }
        ]
      };
      return outerQuery;
    }
    return query;
  };

  BufferLayer.prototype.getKMLExportJsonQL = function(design, schema, filters) {
    var layerDef, style;
    style = {
      color: design.color,
      opacity: design.fillOpacity
    };
    if (design.axes.color && design.axes.color.colorMap) {
      style.colorMap = design.axes.color.colorMap;
    }
    layerDef = {
      layers: [
        {
          id: "layer0",
          jsonql: this.createKMLExportJsonQL(design, schema, filters),
          style: style
        }
      ]
    };
    return layerDef;
  };

  BufferLayer.prototype.acceptKmlVisitorForRow = function(visitor, row) {
    var data, inner, list, outer;
    data = JSON.parse(row.the_geom_webmercator);
    outer = data.coordinates[0];
    inner = data.coordinates.slice(1);
    list = _.map(outer, function(coordinates) {
      return coordinates.join(",");
    });
    return visitor.addPolygon(list.join(" "), row.color);
  };

  return BufferLayer;

})(Layer);
