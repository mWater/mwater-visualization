var AdminIndicatorChoroplethLayer, AdminIndicatorChoroplethLayerDesigner, AxisBuilder, ExprCleaner, ExprCompiler, H, Layer, React, injectTableAlias,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

Layer = require('./Layer');

ExprCompiler = require('mwater-expressions').ExprCompiler;

injectTableAlias = require('mwater-expressions').injectTableAlias;

ExprCleaner = require('mwater-expressions').ExprCleaner;

AxisBuilder = require('../axes/AxisBuilder');

AdminIndicatorChoroplethLayerDesigner = require('./AdminIndicatorChoroplethLayerDesigner');


/*
Layer that is composed of administrative regions colored by an indicator
Design is:
  scope: _id of overall admin region. Null for whole world.
  detailLevel: admin level to disaggregate to 

  table: table to get data from
  adminRegionExpr: expression to get admin region id for calculations

  condition: filter for numerator
  basis: optional filter for numerator and denominator
  factor: optional value to use for calculating
 */

module.exports = AdminIndicatorChoroplethLayer = (function(superClass) {
  extend(AdminIndicatorChoroplethLayer, superClass);

  function AdminIndicatorChoroplethLayer(options) {
    this.design = options.design;
    this.client = options.client;
    this.apiUrl = options.apiUrl;
    this.schema = options.schema;
    this.dataSource = options.dataSource;
    this.onMarkerClick = options.onMarkerClick;
  }

  AdminIndicatorChoroplethLayer.prototype.getTileUrl = function(filters) {
    var design;
    design = this.cleanDesign(this.design);
    if (this.validateDesign(design)) {
      return null;
    }
    return this.createUrl("png", design, filters);
  };

  AdminIndicatorChoroplethLayer.prototype.getUtfGridUrl = function(filters) {
    var design;
    design = this.cleanDesign(this.design);
    if (this.validateDesign(design)) {
      return null;
    }
    return this.createUrl("grid.json", design, filters);
  };

  AdminIndicatorChoroplethLayer.prototype.onGridClick = function(ev) {};

  AdminIndicatorChoroplethLayer.prototype.createUrl = function(extension, design, filters) {
    var mapDesign, query, url;
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
      css: this.createCss()
    };
    query += "&design=" + encodeURIComponent(JSON.stringify(mapDesign));
    url = (this.apiUrl + "maps/tiles/{z}/{x}/{y}." + extension + "?") + query;
    if (url.match(/^https:\/\/api\.mwater\.co\//)) {
      url = url.replace(/^https:\/\/api\.mwater\.co\//, "https://{s}-api.mwater.co/");
    }
    return url;
  };

  AdminIndicatorChoroplethLayer.prototype.createJsonQL = function(design, filters) {
    var axisBuilder, compiledAdminRegionExpr, compiledBasis, compiledCondition, exprCompiler, filter, j, len, query, relevantFilters, valueQuery, whereClauses, wheres;
    axisBuilder = new AxisBuilder({
      schema: this.schema
    });
    exprCompiler = new ExprCompiler(this.schema);
    compiledAdminRegionExpr = exprCompiler.compileExpr({
      expr: design.adminRegionExpr,
      tableAlias: "innerquery"
    });
    compiledCondition = exprCompiler.compileExpr({
      expr: design.condition,
      tableAlias: "innerquery"
    });
    compiledBasis = exprCompiler.compileExpr({
      expr: design.basis,
      tableAlias: "innerquery"
    });
    valueQuery = {
      type: "scalar",
      expr: {
        type: "op",
        op: "/",
        exprs: [
          {
            type: "op",
            op: "::decimal",
            exprs: [
              {
                type: "op",
                op: "sum",
                exprs: [
                  {
                    type: "case",
                    cases: [
                      {
                        when: compiledCondition,
                        then: 1
                      }
                    ],
                    "else": 0
                  }
                ]
              }
            ]
          }, {
            type: "op",
            op: "sum",
            exprs: [1]
          }
        ]
      },
      from: {
        type: "join",
        left: exprCompiler.compileTable(design.table, "innerquery"),
        right: {
          type: "table",
          table: "admin_region_subtrees",
          alias: "admin_region_subtrees"
        },
        kind: "inner",
        on: {
          type: "op",
          op: "=",
          exprs: [
            {
              type: "field",
              tableAlias: "innerquery",
              column: "admin_region"
            }, {
              type: "field",
              tableAlias: "admin_region_subtrees",
              column: "descendant"
            }
          ]
        }
      }
    };
    whereClauses = [
      {
        type: "op",
        op: "=",
        exprs: [
          {
            type: "field",
            tableAlias: "admin_region_subtrees",
            column: "ancestor"
          }, {
            type: "field",
            tableAlias: "admin_regions",
            column: "_id"
          }
        ]
      }
    ];
    if (compiledBasis) {
      whereClauses.push(compiledBasis);
    }
    relevantFilters = _.where(filters, {
      table: design.table
    });
    for (j = 0, len = relevantFilters.length; j < len; j++) {
      filter = relevantFilters[j];
      whereClauses.push(injectTableAlias(filter.jsonql, "innerquery"));
    }
    whereClauses = _.compact(whereClauses);
    valueQuery.where = {
      type: "op",
      op: "and",
      exprs: whereClauses
    };
    wheres = [
      {
        type: "op",
        op: "&&",
        exprs: [
          {
            type: "field",
            tableAlias: "admin_regions",
            column: "shape"
          }, {
            type: "token",
            token: "!bbox!"
          }
        ]
      }
    ];
    if (design.scope) {
      wheres.push({
        type: "op",
        op: "=",
        exprs: [
          {
            type: "op",
            op: "->>",
            exprs: [
              {
                type: "field",
                tableAlias: "admin_regions",
                column: "path"
              }, 0
            ]
          }, design.scope
        ]
      });
    }
    wheres.push({
      type: "op",
      op: "=",
      exprs: [
        {
          type: "field",
          tableAlias: "admin_regions",
          column: "level"
        }, design.detailLevel
      ]
    });
    query = {
      type: "query",
      selects: [
        {
          type: "select",
          expr: {
            type: "field",
            tableAlias: "admin_regions",
            column: "_id"
          },
          alias: "id"
        }, {
          type: "select",
          expr: {
            type: "field",
            tableAlias: "admin_regions",
            column: "shape_simplified"
          },
          alias: "the_geom_webmercator"
        }, {
          type: "select",
          expr: valueQuery,
          alias: "value"
        }
      ],
      from: {
        type: "table",
        table: "admin_regions",
        alias: "admin_regions"
      },
      where: {
        type: "op",
        op: "and",
        exprs: wheres
      }
    };
    return query;
  };

  AdminIndicatorChoroplethLayer.prototype.createCss = function() {
    var colors, css, i, j;
    css = '#layer0 {\n  line-color: #000;\n  line-width: 1.5;\n  line-opacity: 0.5;\n  polygon-opacity: 0.7;\n  polygon-fill: #ffffff;\n}';
    colors = ["#f7fbff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#08519c", "#08306b"];
    for (i = j = 0; j < 9; i = ++j) {
      css += "\n#layer0 [value >= " + (i / 9) + "][value <= " + ((i + 1) / 9) + "] { polygon-fill: " + colors[i] + " }";
    }
    return css;
  };

  AdminIndicatorChoroplethLayer.prototype.getFilterableTables = function() {
    return [this.design.table];
  };

  AdminIndicatorChoroplethLayer.prototype.isEditable = function() {
    return true;
  };

  AdminIndicatorChoroplethLayer.prototype.isIncomplete = function() {
    return this.validateDesign(this.cleanDesign(this.design));
  };

  AdminIndicatorChoroplethLayer.prototype.cleanDesign = function(design) {
    var exprCleaner;
    exprCleaner = new ExprCleaner(this.schema);
    design = _.cloneDeep(design);
    design.condition = exprCleaner.cleanExpr(design.condition, {
      table: design.table,
      types: ['boolean']
    });
    design.basis = exprCleaner.cleanExpr(design.basis, {
      table: design.table,
      types: ['boolean']
    });
    design.adminRegionExpr = exprCleaner.cleanExpr(design.adminRegionExpr, {
      table: design.table,
      types: ["id"],
      idTable: "admin_regions"
    });
    design.factor = exprCleaner.cleanExpr(design.factor, {
      table: design.table,
      types: ["number"]
    });
    return design;
  };

  AdminIndicatorChoroplethLayer.prototype.validateDesign = function(design) {
    if (!design.table) {
      return "Missing table";
    }
    if (design.detailLevel == null) {
      return "Missing detail level";
    }
    if (!design.adminRegionExpr) {
      return "Missing admin region expr";
    }
    if (!design.condition) {
      return "Missing condition";
    }
    return null;
  };

  AdminIndicatorChoroplethLayer.prototype.createDesignerElement = function(options) {
    return React.createElement(AdminIndicatorChoroplethLayerDesigner, {
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

  return AdminIndicatorChoroplethLayer;

})(Layer);
