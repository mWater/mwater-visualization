var AxisBuilder, ExprCleaner, ExprCompiler, ExprUtils, H, Layer, LegendGroup, MarkersLayer, React, _, injectTableAlias,
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
Layer that is composed of markers
Design is:
  sublayers: array of sublayers

sublayer:
  table: table to get data from
  axes: axes (see below)
  filter: optional logical expression to filter by
  color: color of layer (e.g. #FF8800). Color axis overrides
  symbol: symbol to use for layer. e.g. "font-awesome/bell". Will be converted on server to proper uri.

axes:
  geometry: where to place markers
  color: color axis (to split into series based on a color)
 */

module.exports = MarkersLayer = (function(superClass) {
  extend(MarkersLayer, superClass);

  function MarkersLayer() {
    return MarkersLayer.__super__.constructor.apply(this, arguments);
  }

  MarkersLayer.prototype.getJsonQLCss = function(design, schema, filters) {
    var layerDef;
    layerDef = {
      layers: _.map(design.sublayers, (function(_this) {
        return function(sublayer, i) {
          return {
            id: "layer" + i,
            jsonql: _this.createJsonQL(sublayer, schema, filters)
          };
        };
      })(this)),
      css: this.createCss(design, schema),
      interactivity: {
        layer: "layer0",
        fields: ["id"]
      }
    };
    return layerDef;
  };

  MarkersLayer.prototype.createJsonQL = function(sublayer, schema, filters) {
    var axisBuilder, cluster, colorExpr, exprCompiler, filter, geometryExpr, innerquery, j, len, outerquery, relevantFilters, whereClauses;
    axisBuilder = new AxisBuilder({
      schema: schema
    });
    exprCompiler = new ExprCompiler(schema);
    geometryExpr = axisBuilder.compileAxis({
      axis: sublayer.axes.geometry,
      tableAlias: "innerquery"
    });
    geometryExpr = {
      type: "op",
      op: "ST_Transform",
      exprs: [geometryExpr, 3857]
    };
    cluster = {
      type: "select",
      expr: {
        type: "op",
        op: "row_number",
        exprs: []
      },
      over: {
        partitionBy: [
          {
            type: "op",
            op: "ST_SnapToGrid",
            exprs: [
              geometryExpr, {
                type: "op",
                op: "*",
                exprs: [
                  {
                    type: "token",
                    token: "!pixel_width!"
                  }, 5
                ]
              }, {
                type: "op",
                op: "*",
                exprs: [
                  {
                    type: "token",
                    token: "!pixel_height!"
                  }, 5
                ]
              }
            ]
          }
        ]
      },
      alias: "r"
    };
    innerquery = {
      type: "query",
      selects: [
        {
          type: "select",
          expr: {
            type: "field",
            tableAlias: "innerquery",
            column: schema.getTable(sublayer.table).primaryKey
          },
          alias: "id"
        }, {
          type: "select",
          expr: geometryExpr,
          alias: "the_geom_webmercator"
        }, cluster
      ],
      from: exprCompiler.compileTable(sublayer.table, "innerquery")
    };
    if (sublayer.axes.color) {
      colorExpr = axisBuilder.compileAxis({
        axis: sublayer.axes.color,
        tableAlias: "innerquery"
      });
      innerquery.selects.push({
        type: "select",
        expr: colorExpr,
        alias: "color"
      });
    }
    whereClauses = [
      {
        type: "op",
        op: "&&",
        exprs: [
          geometryExpr, {
            type: "token",
            token: "!bbox!"
          }
        ]
      }
    ];
    if (sublayer.filter) {
      whereClauses.push(exprCompiler.compileExpr({
        expr: sublayer.filter,
        tableAlias: "innerquery"
      }));
    }
    relevantFilters = _.where(filters, {
      table: sublayer.table
    });
    for (j = 0, len = relevantFilters.length; j < len; j++) {
      filter = relevantFilters[j];
      whereClauses.push(injectTableAlias(filter.jsonql, "innerquery"));
    }
    whereClauses = _.compact(whereClauses);
    if (whereClauses.length > 1) {
      innerquery.where = {
        type: "op",
        op: "and",
        exprs: whereClauses
      };
    } else {
      innerquery.where = whereClauses[0];
    }
    outerquery = {
      type: "query",
      selects: [
        {
          type: "select",
          expr: {
            type: "op",
            op: "::text",
            exprs: [
              {
                type: "field",
                tableAlias: "innerquery",
                column: "id"
              }
            ]
          },
          alias: "id"
        }, {
          type: "select",
          expr: {
            type: "field",
            tableAlias: "innerquery",
            column: "the_geom_webmercator"
          },
          alias: "the_geom_webmercator"
        }
      ],
      from: {
        type: "subquery",
        query: innerquery,
        alias: "innerquery"
      },
      where: {
        type: "op",
        op: "<=",
        exprs: [
          {
            type: "field",
            tableAlias: "innerquery",
            column: "r"
          }, 3
        ]
      }
    };
    if (sublayer.axes.color) {
      outerquery.selects.push({
        type: "select",
        expr: {
          type: "field",
          tableAlias: "innerquery",
          column: "color"
        },
        alias: "color"
      });
    }
    return outerquery;
  };

  MarkersLayer.prototype.createCss = function(design, schema) {
    var css;
    css = "";
    _.each(design.sublayers, (function(_this) {
      return function(sublayer, index) {
        var item, j, len, ref, results, symbol;
        if (sublayer.symbol) {
          symbol = "marker-file: url(" + sublayer.symbol + ");";
        } else {
          symbol = "marker-type: ellipse;";
        }
        css += '#layer' + index + ' {\nmarker-fill: ' + (sublayer.color || "#666666") + ';\nmarker-width: 10;\nmarker-line-color: white;\nmarker-line-width: 1;\nmarker-line-opacity: 0.6;\nmarker-placement: point;' + symbol + '  marker-allow-overlap: true;\n}\n';
        if (sublayer.axes.color && sublayer.axes.color.colorMap) {
          ref = sublayer.axes.color.colorMap;
          results = [];
          for (j = 0, len = ref.length; j < len; j++) {
            item = ref[j];
            results.push(css += "#layer" + index + " [color=" + (JSON.stringify(item.value)) + "] { marker-fill: " + item.color + " }\n");
          }
          return results;
        }
      };
    })(this));
    return css;
  };

  MarkersLayer.prototype.onGridClick = function(ev, options) {
    if (ev.data && ev.data.id) {
      return [options.design.sublayers[0].table, ev.data.id];
    }
    return null;
  };

  MarkersLayer.prototype.getMinZoom = function(design) {
    return null;
  };

  MarkersLayer.prototype.getMaxZoom = function(design) {
    return null;
  };

  MarkersLayer.prototype.getLegend = function(design, schema, name) {
    var exprUtils, items, layerTitleStyle;
    exprUtils = new ExprUtils(schema);
    console.log(schema);
    items = _.map(design.sublayers, (function(_this) {
      return function(sublayer, i) {
        var colors, enums, title, titleStyle;
        title = ExprUtils.localizeString(schema.getTable(sublayer.axes.geometry.expr.table).name);
        if (sublayer.axes.color && sublayer.axes.color.colorMap) {
          enums = exprUtils.getExprEnumValues(sublayer.axes.color.expr);
          colors = _.map(sublayer.axes.color.colorMap, function(colorItem) {
            return {
              color: colorItem.color,
              name: ExprUtils.localizeString(_.find(enums, {
                id: colorItem.value
              }).name)
            };
          });
          colors.push({
            color: sublayer.color,
            name: "None"
          });
        } else {
          colors = [
            {
              color: sublayer.color,
              name: "None"
            }
          ];
        }
        titleStyle = {
          margin: 2,
          fontWeight: 'bold'
        };
        return H.div(null, H.p({
          key: 'legend-group-title',
          style: titleStyle
        }, title), React.createElement(LegendGroup, {
          items: colors,
          key: sublayer.axes.geometry.expr.table
        }));
      };
    })(this));
    layerTitleStyle = {
      margin: 2,
      fontWeight: 'bold',
      borderBottom: '1px solid #cecece'
    };
    return H.div(null, H.p({
      style: layerTitleStyle
    }, name), items);
  };

  MarkersLayer.prototype.getFilterableTables = function(design, schema) {
    return [];
  };

  MarkersLayer.prototype.isEditable = function(design, schema) {
    return true;
  };

  MarkersLayer.prototype.createDesignerElement = function(options) {
    var MarkersLayerDesignerComponent;
    MarkersLayerDesignerComponent = require('./MarkersLayerDesignerComponent');
    return React.createElement(MarkersLayerDesignerComponent, {
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

  MarkersLayer.prototype.cleanDesign = function(design, schema) {
    var axisBuilder, exprCleaner, j, len, ref, sublayer;
    exprCleaner = new ExprCleaner(schema);
    axisBuilder = new AxisBuilder({
      schema: schema
    });
    design = _.cloneDeep(design);
    design.sublayers = design.sublayers || [{}];
    ref = design.sublayers;
    for (j = 0, len = ref.length; j < len; j++) {
      sublayer = ref[j];
      sublayer.axes = sublayer.axes || {};
      sublayer.color = sublayer.color || "#0088FF";
      sublayer.axes.geometry = axisBuilder.cleanAxis({
        axis: sublayer.axes.geometry,
        table: sublayer.table,
        types: ['geometry'],
        aggrNeed: "none"
      });
      sublayer.axes.color = axisBuilder.cleanAxis({
        axis: sublayer.axes.color,
        table: sublayer.table,
        types: ['enum', 'text', 'boolean'],
        aggrNeed: "none"
      });
      sublayer.filter = exprCleaner.cleanExpr(sublayer.filter, {
        table: sublayer.table
      });
    }
    return design;
  };

  MarkersLayer.prototype.validateDesign = function(design, schema) {
    var axisBuilder, error, j, len, ref, sublayer;
    axisBuilder = new AxisBuilder({
      schema: schema
    });
    if (design.sublayers.length < 1) {
      return "No sublayers";
    }
    ref = design.sublayers;
    for (j = 0, len = ref.length; j < len; j++) {
      sublayer = ref[j];
      if (!sublayer.axes || !sublayer.axes.geometry) {
        return "Missing axes";
      }
      error = axisBuilder.validateAxis({
        axis: sublayer.axes.geometry
      });
      if (error) {
        return error;
      }
    }
    return null;
  };

  MarkersLayer.prototype.createKMLExportJsonQL = function(sublayer, schema, filters) {
    var axisBuilder, cluster, colorExpr, exprCompiler, filter, geometryExpr, innerquery, j, len, outerquery, relevantFilters, whereClauses;
    axisBuilder = new AxisBuilder({
      schema: schema
    });
    exprCompiler = new ExprCompiler(schema);
    geometryExpr = axisBuilder.compileAxis({
      axis: sublayer.axes.geometry,
      tableAlias: "innerquery"
    });
    geometryExpr = {
      type: "op",
      op: "ST_Transform",
      exprs: [geometryExpr, 4326]
    };
    cluster = {
      type: "select",
      expr: {
        type: "op",
        op: "row_number",
        exprs: []
      },
      over: {
        partitionBy: [geometryExpr]
      },
      alias: "r"
    };
    innerquery = {
      type: "query",
      selects: [
        {
          type: "select",
          expr: {
            type: "field",
            tableAlias: "innerquery",
            column: schema.getTable(sublayer.table).primaryKey
          },
          alias: "id"
        }, {
          type: "select",
          expr: geometryExpr,
          alias: "the_geom_webmercator"
        }, cluster
      ],
      from: exprCompiler.compileTable(sublayer.table, "innerquery")
    };
    if (sublayer.axes.color) {
      colorExpr = axisBuilder.compileAxis({
        axis: sublayer.axes.color,
        tableAlias: "innerquery"
      });
      innerquery.selects.push({
        type: "select",
        expr: colorExpr,
        alias: "color"
      });
    }
    whereClauses = [];
    if (sublayer.filter) {
      whereClauses.push(exprCompiler.compileExpr({
        expr: sublayer.filter,
        tableAlias: "innerquery"
      }));
    }
    relevantFilters = _.where(filters, {
      table: sublayer.table
    });
    for (j = 0, len = relevantFilters.length; j < len; j++) {
      filter = relevantFilters[j];
      whereClauses.push(injectTableAlias(filter.jsonql, "innerquery"));
    }
    whereClauses = _.compact(whereClauses);
    if (whereClauses.length > 1) {
      innerquery.where = {
        type: "op",
        op: "and",
        exprs: whereClauses
      };
    } else {
      innerquery.where = whereClauses[0];
    }
    outerquery = {
      type: "query",
      selects: [
        {
          type: "select",
          expr: {
            type: "op",
            op: "::text",
            exprs: [
              {
                type: "field",
                tableAlias: "innerquery",
                column: "id"
              }
            ]
          },
          alias: "id"
        }, {
          type: "select",
          expr: {
            type: "op",
            op: "ST_X",
            exprs: [
              {
                type: "field",
                tableAlias: "innerquery",
                column: "the_geom_webmercator"
              }
            ]
          },
          alias: "longitude"
        }, {
          type: "select",
          expr: {
            type: "op",
            op: "ST_Y",
            exprs: [
              {
                type: "field",
                tableAlias: "innerquery",
                column: "the_geom_webmercator"
              }
            ]
          },
          alias: "latitude"
        }
      ],
      from: {
        type: "subquery",
        query: innerquery,
        alias: "innerquery"
      },
      where: {
        type: "op",
        op: "<=",
        exprs: [
          {
            type: "field",
            tableAlias: "innerquery",
            column: "r"
          }, 3
        ]
      }
    };
    if (sublayer.axes.color) {
      outerquery.selects.push({
        type: "select",
        expr: {
          type: "field",
          tableAlias: "innerquery",
          column: "color"
        },
        alias: "color"
      });
    }
    return outerquery;
  };

  MarkersLayer.prototype.createKMLExportStyleInfo = function(sublayer, schema, filters) {
    var style, symbol;
    if (sublayer.symbol) {
      symbol = sublayer.symbol;
    } else {
      symbol = "font-awesome/circle";
    }
    style = {
      color: sublayer.color,
      symbol: symbol
    };
    if (sublayer.axes.color && sublayer.axes.color.colorMap) {
      style.colorMap = sublayer.axes.color.colorMap;
    }
    return style;
  };

  MarkersLayer.prototype.getKMLExportJsonQL = function(design, schema, filters) {
    var layerDef;
    layerDef = {
      layers: _.map(design.sublayers, (function(_this) {
        return function(sublayer, i) {
          return {
            id: "layer" + i,
            jsonql: _this.createKMLExportJsonQL(sublayer, schema, filters),
            style: _this.createKMLExportStyleInfo(sublayer, schema, filters)
          };
        };
      })(this))
    };
    return layerDef;
  };

  MarkersLayer.prototype.acceptKmlVisitorForRow = function(visitor, row) {
    return visitor.addPoint(row.latitude, row.longitude, null, null, row.color);
  };

  return MarkersLayer;

})(Layer);
