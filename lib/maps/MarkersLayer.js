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
  table: table to get data from
  axes: axes (see below)
  filter: optional logical expression to filter by
  color: color of layer (e.g. #FF8800). Color axis overrides
  symbol: symbol to use for layer. e.g. "font-awesome/bell". Will be converted on server to proper uri.
  popup: contains items: which is BlocksLayoutManager items. Will be displayed when the marker is clicked

LEGACY: sublayers array that contains above design

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
      layers: [
        {
          id: "layer0",
          jsonql: this.createJsonQL(design, schema, filters)
        }
      ],
      css: this.createCss(design, schema),
      interactivity: {
        layer: "layer0",
        fields: ["id"]
      }
    };
    return layerDef;
  };

  MarkersLayer.prototype.createJsonQL = function(design, schema, filters) {
    var axisBuilder, cluster, colorExpr, exprCompiler, filter, geometryExpr, i, innerquery, len, outerquery, relevantFilters, whereClauses;
    axisBuilder = new AxisBuilder({
      schema: schema
    });
    exprCompiler = new ExprCompiler(schema);
    geometryExpr = axisBuilder.compileAxis({
      axis: design.axes.geometry,
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
            column: schema.getTable(design.table).primaryKey
          },
          alias: "id"
        }, {
          type: "select",
          expr: geometryExpr,
          alias: "the_geom_webmercator"
        }, cluster
      ],
      from: exprCompiler.compileTable(design.table, "innerquery")
    };
    if (design.axes.color) {
      colorExpr = axisBuilder.compileAxis({
        axis: design.axes.color,
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
    if (design.filter) {
      whereClauses.push(exprCompiler.compileExpr({
        expr: design.filter,
        tableAlias: "innerquery"
      }));
    }
    relevantFilters = _.where(filters, {
      table: design.table
    });
    for (i = 0, len = relevantFilters.length; i < len; i++) {
      filter = relevantFilters[i];
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
    if (design.axes.color) {
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
    var css, i, item, len, ref, symbol;
    css = "";
    if (design.symbol) {
      symbol = "marker-file: url(" + design.symbol + ");";
    } else {
      symbol = "marker-type: ellipse;";
    }
    css += '#layer0 {\n  marker-fill: ' + (design.color || "#666666") + ';\nmarker-width: 10;\nmarker-line-color: white;\nmarker-line-width: 1;\nmarker-line-opacity: 0.6;\nmarker-placement: point;' + symbol + '  marker-allow-overlap: true;\n}\n';
    if (design.axes.color && design.axes.color.colorMap) {
      ref = design.axes.color.colorMap;
      for (i = 0, len = ref.length; i < len; i++) {
        item = ref[i];
        css += "#layer0 [color=" + (JSON.stringify(item.value)) + "] { marker-fill: " + item.color + " }\n";
      }
    }
    return css;
  };

  MarkersLayer.prototype.onGridClick = function(ev, clickOptions) {
    var BlocksLayoutManager, DirectWidgetDataSource, WidgetFactory;
    if (ev.data && ev.data.id) {
      if (clickOptions.design.popup) {
        BlocksLayoutManager = require('../layouts/blocks/BlocksLayoutManager');
        WidgetFactory = require('../widgets/WidgetFactory');
        DirectWidgetDataSource = require('../widgets/DirectWidgetDataSource');
        return new BlocksLayoutManager().renderLayout({
          items: clickOptions.design.popup.items,
          renderWidget: (function(_this) {
            return function(options) {
              var filters, table, widget, widgetDataSource;
              widget = WidgetFactory.createWidget(options.type);
              table = clickOptions.design.table;
              filters = [
                {
                  table: table,
                  jsonql: {
                    type: "op",
                    op: "=",
                    exprs: [
                      {
                        type: "field",
                        tableAlias: "{alias}",
                        column: clickOptions.schema.getTable(table).primaryKey
                      }, ev.data.id
                    ]
                  }
                }
              ];
              widgetDataSource = new DirectWidgetDataSource({
                apiUrl: "https://api.mwater.co/v3/",
                widget: widget,
                design: options.design,
                schema: clickOptions.schema,
                dataSource: clickOptions.dataSource,
                client: null
              });
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
                standardWidth: null
              });
            };
          })(this)
        });
      }
      return [clickOptions.design.table, ev.data.id];
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
    var axisBuilder, categories, colors, exprUtils, legendGroupProps, symbol;
    axisBuilder = new AxisBuilder({
      schema: schema
    });
    exprUtils = new ExprUtils(schema);
    if (design.axes.color && design.axes.color.colorMap) {
      categories = axisBuilder.getCategories(design.axes.color);
      colors = _.map(design.axes.color.colorMap, (function(_this) {
        return function(colorItem) {
          return {
            color: colorItem.color,
            name: ExprUtils.localizeString(_.find(categories, {
              value: colorItem.value
            }).label)
          };
        };
      })(this));
    } else {
      colors = [];
    }
    symbol = design.symbol ? design.symbol : 'font-awesome/circle';
    legendGroupProps = {
      symbol: symbol,
      items: colors,
      key: design.axes.geometry.expr.table,
      defaultColor: design.color,
      name: name
    };
    return H.div(null, React.createElement(LegendGroup, legendGroupProps));
  };

  MarkersLayer.prototype.getFilterableTables = function(design, schema) {
    return [design.table];
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
    var axisBuilder, exprCleaner, ref;
    exprCleaner = new ExprCleaner(schema);
    axisBuilder = new AxisBuilder({
      schema: schema
    });
    design = _.cloneDeep(design);
    if ((ref = design.sublayers) != null ? ref[0] : void 0) {
      design = _.extend({}, design, design.sublayers[0]);
    }
    delete design.sublayers;
    design.axes = design.axes || {};
    design.color = design.color || "#0088FF";
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

  MarkersLayer.prototype.validateDesign = function(design, schema) {
    var axisBuilder, error;
    axisBuilder = new AxisBuilder({
      schema: schema
    });
    if (!design.table) {
      return "Missing table";
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
    return null;
  };

  MarkersLayer.prototype.createKMLExportJsonQL = function(design, schema, filters) {
    var axisBuilder, cluster, colorExpr, exprCompiler, filter, geometryExpr, i, innerquery, len, outerquery, relevantFilters, whereClauses;
    axisBuilder = new AxisBuilder({
      schema: schema
    });
    exprCompiler = new ExprCompiler(schema);
    geometryExpr = axisBuilder.compileAxis({
      axis: design.axes.geometry,
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
            column: schema.getTable(design.table).primaryKey
          },
          alias: "id"
        }, {
          type: "select",
          expr: geometryExpr,
          alias: "the_geom_webmercator"
        }, cluster
      ],
      from: exprCompiler.compileTable(design.table, "innerquery")
    };
    if (design.axes.color) {
      colorExpr = axisBuilder.compileAxis({
        axis: design.axes.color,
        tableAlias: "innerquery"
      });
      innerquery.selects.push({
        type: "select",
        expr: colorExpr,
        alias: "color"
      });
    }
    whereClauses = [];
    if (design.filter) {
      whereClauses.push(exprCompiler.compileExpr({
        expr: design.filter,
        tableAlias: "innerquery"
      }));
    }
    relevantFilters = _.where(filters, {
      table: design.table
    });
    for (i = 0, len = relevantFilters.length; i < len; i++) {
      filter = relevantFilters[i];
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
    if (design.axes.color) {
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

  MarkersLayer.prototype.createKMLExportStyleInfo = function(design, schema, filters) {
    var style, symbol;
    if (design.symbol) {
      symbol = design.symbol;
    } else {
      symbol = "font-awesome/circle";
    }
    style = {
      color: design.color,
      symbol: symbol
    };
    if (design.axes.color && design.axes.color.colorMap) {
      style.colorMap = design.axes.color.colorMap;
    }
    return style;
  };

  MarkersLayer.prototype.getKMLExportJsonQL = function(design, schema, filters) {
    var layerDef;
    layerDef = {
      layers: [
        {
          id: "layer0",
          jsonql: this.createKMLExportJsonQL(design, schema, filters),
          style: this.createKMLExportStyleInfo(design, schema, filters)
        }
      ]
    };
    return layerDef;
  };

  MarkersLayer.prototype.acceptKmlVisitorForRow = function(visitor, row) {
    return visitor.addPoint(row.latitude, row.longitude, null, null, row.color);
  };

  return MarkersLayer;

})(Layer);
