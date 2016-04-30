var AxisBuilder, ExprCleaner, ExprCompiler, H, Layer, MarkersLayer, MarkersLayerDesignerComponent, React, injectTableAlias,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

Layer = require('./Layer');

ExprCompiler = require('mwater-expressions').ExprCompiler;

injectTableAlias = require('mwater-expressions').injectTableAlias;

MarkersLayerDesignerComponent = require('./MarkersLayerDesignerComponent');

ExprCleaner = require('mwater-expressions').ExprCleaner;

AxisBuilder = require('../axes/AxisBuilder');


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

  function MarkersLayer(options) {
    this.design = options.design;
    this.client = options.client;
    this.apiUrl = options.apiUrl;
    this.schema = options.schema;
    this.dataSource = options.dataSource;
    this.onMarkerClick = options.onMarkerClick;
  }

  MarkersLayer.prototype.getTileUrl = function(filters) {
    var design;
    design = this.cleanDesign(this.design);
    if (this.validateDesign(design)) {
      return null;
    }
    return this.createUrl("png", design, filters);
  };

  MarkersLayer.prototype.getUtfGridUrl = function(filters) {
    var design;
    design = this.cleanDesign(this.design);
    if (this.validateDesign(design)) {
      return null;
    }
    return this.createUrl("grid.json", design, filters);
  };

  MarkersLayer.prototype.onGridClick = function(ev) {
    if (this.onMarkerClick && ev.data && ev.data.id) {
      return this.onMarkerClick(this.design.sublayers[0].table, ev.data.id);
    }
  };

  MarkersLayer.prototype.createUrl = function(extension, design, filters) {
    var mapDesign, query, url;
    query = "type=jsonql";
    if (this.client) {
      query += "&client=" + this.client;
    }
    mapDesign = {
      layers: _.map(design.sublayers, (function(_this) {
        return function(sublayer, i) {
          return {
            id: "layer" + i,
            jsonql: _this.createJsonQL(sublayer, filters)
          };
        };
      })(this)),
      css: this.createCss(),
      interactivity: {
        layer: "layer0",
        fields: ["id"]
      }
    };
    query += "&design=" + encodeURIComponent(JSON.stringify(mapDesign));
    url = (this.apiUrl + "maps/tiles/{z}/{x}/{y}." + extension + "?") + query;
    if (url.match(/^https:\/\/api\.mwater\.co\//)) {
      url = url.replace(/^https:\/\/api\.mwater\.co\//, "https://{s}-api.mwater.co/");
    }
    return url;
  };

  MarkersLayer.prototype.createJsonQL = function(sublayer, filters) {
    var axisBuilder, cluster, colorExpr, exprCompiler, filter, geometryExpr, innerquery, j, len, outerquery, relevantFilters, whereClauses;
    axisBuilder = new AxisBuilder({
      schema: this.schema
    });
    exprCompiler = new ExprCompiler(this.schema);
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
            column: this.schema.getTable(sublayer.table).primaryKey
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

  MarkersLayer.prototype.createCss = function() {
    var css;
    css = "";
    _.each(this.design.sublayers, (function(_this) {
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

  MarkersLayer.prototype.getFilterableTables = function() {
    return _.uniq(_.compact(_.pluck(this.design.sublayers, "table")));
  };

  MarkersLayer.prototype.getLegend = function() {};

  MarkersLayer.prototype.isEditable = function() {
    return true;
  };

  MarkersLayer.prototype.isIncomplete = function() {
    return this.validateDesign(this.cleanDesign(this.design));
  };

  MarkersLayer.prototype.cleanDesign = function(design) {
    var axisBuilder, exprCleaner, j, len, ref, sublayer;
    exprCleaner = new ExprCleaner(this.schema);
    axisBuilder = new AxisBuilder({
      schema: this.schema
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

  MarkersLayer.prototype.validateDesign = function(design) {
    var axisBuilder, error, j, len, ref, sublayer;
    axisBuilder = new AxisBuilder({
      schema: this.schema
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

  MarkersLayer.prototype.createDesignerElement = function(options) {
    return React.createElement(MarkersLayerDesignerComponent, {
      schema: this.schema,
      dataSource: this.dataSource,
      design: this.cleanDesign(this.design),
      onDesignChange: (function(_this) {
        return function(design) {
          return options.onDesignChange(_this.cleanDesign(design));
        };
      })(this)
    });
  };

  return MarkersLayer;

})(Layer);
