var AxisBuilder, ExpressionBuilder, ExpressionCompiler, H, Layer, MarkersLayer, MarkersLayerDesignerComponent, React, injectTableAlias,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

Layer = require('./Layer');

ExpressionCompiler = require('../expressions/ExpressionCompiler');

injectTableAlias = require('../injectTableAlias');

MarkersLayerDesignerComponent = require('./MarkersLayerDesignerComponent');

ExpressionBuilder = require('../expressions/ExpressionBuilder');

AxisBuilder = require('../expressions/axes/AxisBuilder');


/*
Layer that is composed of markers
Design is:
  table: table to get data from
  axes: axes (see below)
  filter: optional logical expression to filter by
  color: color of layer (e.g. #FF8800). Color axis overrides

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
  }

  MarkersLayer.prototype.getTileUrl = function(filters) {
    var design;
    design = this.cleanDesign(this.design);
    if (!design.axes || !design.axes.geometry) {
      return null;
    }
    return this.createUrl("png", design, filters);
  };

  MarkersLayer.prototype.getUtfGridUrl = function(filters) {
    return null;
  };

  MarkersLayer.prototype.createUrl = function(extension, design, filters) {
    var mapDesign, query;
    query = "type=jsonql";
    if (this.client) {
      query += "&client=" + this.client;
    }
    mapDesign = {
      layers: [
        {
          id: "layer0",
          jsonql: this.createJsonQL(design, filters)
        }
      ],
      css: this.createCss(design)
    };
    query += "&design=" + encodeURIComponent(JSON.stringify(mapDesign));
    return (this.apiUrl + "maps/tiles/{z}/{x}/{y}." + extension + "?") + query;
  };

  MarkersLayer.prototype.createJsonQL = function(design, filters) {
    var axisBuilder, cluster, exprBuilder, exprCompiler, filter, geometryExpr, i, innerquery, len, outerquery, relevantFilters, whereClauses;
    axisBuilder = new AxisBuilder({
      schema: this.schema
    });
    exprCompiler = new ExpressionCompiler(this.schema);
    exprBuilder = new ExpressionBuilder(this.schema);
    geometryExpr = axisBuilder.compileAxis({
      axis: design.axes.geometry,
      tableAlias: "innerquery"
    });
    cluster = {
      type: "select",
      expr: {
        type: "op",
        op: "row_number"
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
          expr: geometryExpr,
          alias: "the_geom_webmercator"
        }, cluster
      ],
      from: exprCompiler.compileTable(design.table, "innerquery")
    };
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
    return outerquery;
  };

  MarkersLayer.prototype.createCss = function(design) {
    return '#layer0 {\n  marker-fill: ' + (design.color || "#666666") + ';\n  marker-width: 10;\n  marker-line-color: white;\n  marker-line-width: 1;\n  marker-line-opacity: 0.6;\n  marker-placement: point;\n  marker-type: ellipse;\n  marker-allow-overlap: true;\n}';
  };

  MarkersLayer.prototype.getFilterableTables = function() {
    if (this.design.table) {
      return [this.design.table];
    } else {
      return [];
    }
  };

  MarkersLayer.prototype.getLegend = function() {};

  MarkersLayer.prototype.isEditable = function() {
    return true;
  };

  MarkersLayer.prototype.cleanDesign = function(design) {
    var axis, axisBuilder, axisKey, exprBuilder, ref;
    exprBuilder = new ExpressionBuilder(this.schema);
    axisBuilder = new AxisBuilder({
      schema: this.schema
    });
    design = _.cloneDeep(design);
    design.axes = design.axes || {};
    design.color = design.color || "#0088FF";
    ref = design.axes;
    for (axisKey in ref) {
      axis = ref[axisKey];
      design.axes[axisKey] = axisBuilder.cleanAxis(axis, design.table, "none");
    }
    design.filter = exprBuilder.cleanExpr(design.filter, design.table);
    return design;
  };

  MarkersLayer.prototype.createDesignerElement = function(options) {
    return React.createElement(MarkersLayerDesignerComponent, {
      schema: this.schema,
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
