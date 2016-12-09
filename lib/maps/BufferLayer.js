var AxisBuilder, BufferLayer, ExprCleaner, ExprCompiler, ExprUtils, H, Layer, LayerLegendComponent, LegendGroup, React, _, injectTableAlias,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

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

LayerLegendComponent = require('./LayerLegendComponent');


/*
Layer which draws a buffer around geometries (i.e. a radius circle around points)

Design is:
  table: table to get data from
  axes: axes (see below)
  filter: optional logical expression to filter by
  color: color of layer (e.g. #FF8800). Color axis overrides
  fillOpacity: Opacity to fill the circles (0-1)
  radius: radius to draw in meters
  minZoom: minimum zoom level
  maxZoom: maximum zoom level

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
      css: this.createCss(design, schema, filters),
      interactivity: {
        layer: "layer0",
        fields: ["id"]
      }
    };
    return layerDef;
  };

  BufferLayer.prototype.createJsonQL = function(design, schema, filters) {
    var axisBuilder, boundingBox, cases, categories, colorExpr, exprCompiler, filter, geometryExpr, j, len, order, query, radiusDeg, relevantFilters, selects, whereClauses, widthExpr;
    axisBuilder = new AxisBuilder({
      schema: schema
    });
    exprCompiler = new ExprCompiler(schema);

    /*
    Query:
      select
      <primary key> as id,
      [<color axis> as color,
      st_transform(<geometry axis>, 3857) as the_geom_webmercator,
      radius * 2 / (!pixel_width! * cos(st_y(st_transform(geometryExpr, 4326)) * 0.017453293) as width
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
    geometryExpr = {
      type: "op",
      op: "ST_Transform",
      exprs: [geometryExpr, 3857]
    };
    widthExpr = {
      type: "op",
      op: "+",
      exprs: [
        {
          type: "op",
          op: "/",
          exprs: [
            {
              type: "op",
              op: "*",
              exprs: [design.radius, 2]
            }, {
              type: "op",
              op: "*",
              exprs: [
                {
                  type: "token",
                  token: "!pixel_height!"
                }, {
                  type: "op",
                  op: "cos",
                  exprs: [
                    {
                      type: "op",
                      op: "*",
                      exprs: [
                        {
                          type: "op",
                          op: "ST_Y",
                          exprs: [
                            {
                              type: "op",
                              op: "ST_Transform",
                              exprs: [geometryExpr, 4326]
                            }
                          ]
                        }, 0.017453293
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }, 2
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
        expr: geometryExpr,
        alias: "the_geom_webmercator"
      }, {
        type: "select",
        expr: widthExpr,
        alias: "width"
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
    if (design.axes.color && design.axes.color.colorMap) {
      order = design.axes.color.drawOrder || _.pluck(design.axes.color.colorMap, "value");
      categories = axisBuilder.getCategories(design.axes.color, order);
      cases = _.map(categories, (function(_this) {
        return function(category, i) {
          return {
            when: category.value != null ? {
              type: "op",
              op: "=",
              exprs: [colorExpr, category.value]
            } : {
              type: "op",
              op: "is null",
              exprs: [colorExpr]
            },
            then: order.indexOf(category.value) || -1
          };
        };
      })(this));
      query.orderBy = [
        {
          expr: {
            type: "case",
            cases: cases
          },
          direction: "desc"
        }
      ];
    }
    return query;
  };

  BufferLayer.prototype.createCss = function(design, schema) {
    var css, item, j, len, ref, ref1;
    css = '#layer0 {\n  marker-fill-opacity: ' + design.fillOpacity + ';\nmarker-type: ellipse;\nmarker-width: [width];\nmarker-line-width: 0;\nmarker-allow-overlap: true;\nmarker-ignore-placement: true;\nmarker-fill: ' + (design.color || "transparent") + ';\n}';
    if ((ref = design.axes.color) != null ? ref.colorMap : void 0) {
      ref1 = design.axes.color.colorMap;
      for (j = 0, len = ref1.length; j < len; j++) {
        item = ref1[j];
        if (_.includes(design.axes.color.excludedValues, item.value)) {
          css += "#layer0 [color=" + (JSON.stringify(item.value)) + "] { marker-fill-opacity: 0; }\n";
        } else {
          css += "#layer0 [color=" + (JSON.stringify(item.value)) + "] { marker-fill: " + item.color + "; }\n";
        }
      }
    }
    return css;
  };

  BufferLayer.prototype.onGridClick = function(ev, clickOptions) {
    var BlocksLayoutManager, WidgetFactory, filter, ids, ref, results, table;
    if (ev.data && ev.data.id) {
      table = clickOptions.design.table;
      results = {};
      if (ev.event.originalEvent.shiftKey) {
        ids = clickOptions.scopeData || [];
        if (ref = ev.data.id, indexOf.call(ids, ref) >= 0) {
          ids = _.without(ids, ev.data.id);
        } else {
          ids = ids.concat([ev.data.id]);
        }
        filter = {
          table: table,
          jsonql: {
            type: "op",
            op: "=",
            modifier: "any",
            exprs: [
              {
                type: "field",
                tableAlias: "{alias}",
                column: clickOptions.schema.getTable(table).primaryKey
              }, {
                type: "literal",
                value: ids
              }
            ]
          }
        };
        if (ids.length > 0) {
          results.scope = {
            name: "Selected " + ids.length + " Circle(s)",
            filter: filter,
            data: ids
          };
        } else {
          results.scope = null;
        }
      }
      if (clickOptions.design.popup && !ev.event.originalEvent.shiftKey) {
        BlocksLayoutManager = require('../layouts/blocks/BlocksLayoutManager');
        WidgetFactory = require('../widgets/WidgetFactory');
        results.popup = new BlocksLayoutManager().renderLayout({
          items: clickOptions.design.popup.items,
          style: "popup",
          renderWidget: (function(_this) {
            return function(options) {
              var filters, widget, widgetDataSource;
              widget = WidgetFactory.createWidget(options.type);
              filter = {
                table: table,
                jsonql: {
                  type: "op",
                  op: "=",
                  exprs: [
                    {
                      type: "field",
                      tableAlias: "{alias}",
                      column: clickOptions.schema.getTable(table).primaryKey
                    }, {
                      type: "literal",
                      value: ev.data.id
                    }
                  ]
                }
              };
              filters = clickOptions.filters.concat([filter]);
              widgetDataSource = clickOptions.layerDataSource.getPopupWidgetDataSource(clickOptions.design, options.id);
              return widget.createViewElement({
                schema: clickOptions.schema,
                dataSource: clickOptions.dataSource,
                widgetDataSource: widgetDataSource,
                design: options.design,
                scope: null,
                filters: filters,
                onScopeChange: null,
                onDesignChange: null,
                width: options.width,
                height: options.height,
                standardWidth: options.standardWidth
              });
            };
          })(this)
        });
      } else if (!ev.event.originalEvent.shiftKey) {
        results.row = {
          tableId: table,
          primaryKey: ev.data.id
        };
      }
      return results;
    } else {
      return null;
    }
  };

  BufferLayer.prototype.getBounds = function(design, schema, dataSource, filters, callback) {
    return this.getBoundsFromExpr(schema, dataSource, design.table, design.axes.geometry.expr, design.filter, filters, callback);
  };

  BufferLayer.prototype.getMinZoom = function(design) {
    return design.minZoom;
  };

  BufferLayer.prototype.getMaxZoom = function(design) {
    return design.maxZoom;
  };

  BufferLayer.prototype.getLegend = function(design, schema, name) {
    var axisBuilder;
    axisBuilder = new AxisBuilder({
      schema: schema
    });
    return React.createElement(LayerLegendComponent, {
      schema: schema,
      name: name,
      axis: axisBuilder.cleanAxis({
        axis: design.axes.color,
        table: design.table,
        types: ['enum', 'text', 'boolean', 'date'],
        aggrNeed: "none"
      }),
      radiusLayer: true,
      defaultColor: design.color
    });
  };

  BufferLayer.prototype.getFilterableTables = function(design, schema) {
    if (design.table) {
      return [design.table];
    } else {
      return [];
    }
  };

  BufferLayer.prototype.isEditable = function() {
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
    design.color = design.color || "#0088FF";
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
      types: ['enum', 'text', 'boolean', 'date'],
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
    var axisBuilder, bufferedGeometry, cases, categories, colorExpr, column, exprCompiler, extraFields, field, filter, geometryExpr, j, k, len, len1, order, query, radiusDeg, relevantFilters, selects, valueExpr, whereClauses;
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
    extraFields = ["code", "name", "desc", "type", "photos"];
    for (j = 0, len = extraFields.length; j < len; j++) {
      field = extraFields[j];
      column = schema.getColumn(design.table, field);
      if (column) {
        selects.push({
          type: "select",
          expr: {
            type: "field",
            tableAlias: "main",
            column: field
          },
          alias: field
        });
      }
    }
    if (design.axes.color) {
      valueExpr = exprCompiler.compileExpr({
        expr: design.axes.color.expr,
        tableAlias: "main"
      });
      colorExpr = axisBuilder.compileAxis({
        axis: design.axes.color,
        tableAlias: "main"
      });
      selects.push({
        type: "select",
        expr: valueExpr,
        alias: "value"
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
    for (k = 0, len1 = relevantFilters.length; k < len1; k++) {
      filter = relevantFilters[k];
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
      categories = axisBuilder.getCategories(design.axes.color, _.pluck(design.axes.color.colorMap, "value"));
      cases = _.map(categories, (function(_this) {
        return function(category, i) {
          return {
            when: category.value != null ? {
              type: "op",
              op: "=",
              exprs: [colorExpr, category.value]
            } : {
              type: "op",
              op: "is null",
              exprs: [colorExpr]
            },
            then: order.indexOf(category.value) || -1
          };
        };
      })(this));
      query.orderBy = [
        {
          expr: {
            type: "case",
            cases: cases
          },
          direction: "desc"
        }
      ];
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
    return visitor.addPolygon(list.join(" "), row.color, false, row.name, visitor.buildDescription(row));
  };

  return BufferLayer;

})(Layer);
