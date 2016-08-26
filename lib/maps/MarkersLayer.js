var AxisBuilder, ExprCleaner, ExprCompiler, ExprUtils, H, Layer, LayerLegendComponent, LegendGroup, MarkersLayer, React, _, injectTableAlias,
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
    var css, i, item, len, ref, stroke, symbol;
    css = "";
    if (design.symbol) {
      symbol = "marker-file: url(" + design.symbol + ");";
      stroke = "marker-line-width: 60;";
    } else {
      symbol = "marker-type: ellipse;";
      stroke = "marker-line-width: 1;";
    }
    css += '#layer0 {\n  marker-fill: ' + (design.color || "#666666") + ';\nmarker-width: 10;\nmarker-line-color: white;' + stroke + 'marker-line-opacity: 0.6;\nmarker-placement: point;' + symbol + '  marker-allow-overlap: true;\n}\n';
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
            name: "Selected " + ids.length + " Markers(s)",
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
              filters = [filter];
              widgetDataSource = clickOptions.layerDataSource.getPopupWidgetDataSource(options.id);
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

  MarkersLayer.prototype.getMinZoom = function(design) {
    return null;
  };

  MarkersLayer.prototype.getMaxZoom = function(design) {
    return null;
  };

  MarkersLayer.prototype.getLegend = function(design, schema, name) {
    var axisBuilder;
    axisBuilder = new AxisBuilder({
      schema: schema
    });
    return React.createElement(LayerLegendComponent, {
      schema: schema,
      defaultColor: design.color,
      symbol: design.symbol || 'font-awesome/circle',
      name: name,
      axis: axisBuilder.cleanAxis({
        axis: design.axes.color,
        table: design.table,
        types: ['enum', 'text', 'boolean', 'date'],
        aggrNeed: "none"
      })
    });
  };

  MarkersLayer.prototype.getFilterableTables = function(design, schema) {
    if (design.table) {
      return [design.table];
    } else {
      return [];
    }
  };

  MarkersLayer.prototype.isEditable = function() {
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
      types: ['enum', 'text', 'boolean', 'date'],
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
