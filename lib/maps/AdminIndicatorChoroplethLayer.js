var AdminIndicatorChoroplethLayer, AxisBuilder, ExprCleaner, ExprCompiler, ExprUtils, H, Layer, React, injectTableAlias,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

Layer = require('./Layer');

ExprCompiler = require('mwater-expressions').ExprCompiler;

ExprUtils = require('mwater-expressions').ExprUtils;

injectTableAlias = require('mwater-expressions').injectTableAlias;

ExprCleaner = require('mwater-expressions').ExprCleaner;

AxisBuilder = require('../axes/AxisBuilder');


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

  function AdminIndicatorChoroplethLayer() {
    return AdminIndicatorChoroplethLayer.__super__.constructor.apply(this, arguments);
  }

  AdminIndicatorChoroplethLayer.prototype.getJsonQLCss = function(design, schema, filters) {
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

  AdminIndicatorChoroplethLayer.prototype.createJsonQL = function(design, schema, filters) {
    var axisBuilder, compiledAdminRegionExpr, compiledBasis, compiledCondition, exprCompiler, filter, j, len, query, relevantFilters, valueQuery, whereClauses, wheres;
    axisBuilder = new AxisBuilder({
      schema: schema
    });
    exprCompiler = new ExprCompiler(schema);
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
            compiledAdminRegionExpr, {
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
          expr: {
            type: "field",
            tableAlias: "admin_regions",
            column: "name"
          },
          alias: "name"
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

  AdminIndicatorChoroplethLayer.prototype.createCss = function(design, schema, filters) {
    var colors, css, i, j;
    css = '#layer0 {\n  line-color: #000;\n  line-width: 1.5;\n  line-opacity: 0.5;\n  polygon-opacity: 0.7;\n  polygon-fill: #ffffff;\n  text-name: [name];\n  text-face-name: \'Arial Regular\'; \n  text-halo-radius: 2;\n  text-halo-opacity: 0.5;\n  text-halo-fill: #FFF;\n}';
    colors = ["#f7fbff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#08519c", "#08306b"];
    for (i = j = 0; j < 9; i = ++j) {
      css += "\n#layer0 [value >= " + (i / 9) + "][value <= " + ((i + 1) / 9) + "] { polygon-fill: " + colors[i] + " }";
    }
    return css;
  };

  AdminIndicatorChoroplethLayer.prototype.onGridClick = function(ev, options) {
    return null;
  };

  AdminIndicatorChoroplethLayer.prototype.getMinZoom = function(design) {
    return null;
  };

  AdminIndicatorChoroplethLayer.prototype.getMaxZoom = function(design) {
    return null;
  };

  AdminIndicatorChoroplethLayer.prototype.getLegend = function(design, schema) {
    return null;
  };

  AdminIndicatorChoroplethLayer.prototype.getFilterableTables = function(design, schema) {
    return [design.table];
  };

  AdminIndicatorChoroplethLayer.prototype.isEditable = function(design, schema) {
    return true;
  };

  AdminIndicatorChoroplethLayer.prototype.cleanDesign = function(design, schema) {
    var exprCleaner;
    exprCleaner = new ExprCleaner(schema);
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

  AdminIndicatorChoroplethLayer.prototype.validateDesign = function(design, schema) {
    var exprUtils;
    exprUtils = new ExprUtils(schema);
    if (!design.table) {
      return "Missing table";
    }
    if (design.detailLevel == null) {
      return "Missing detail level";
    }
    if (!design.adminRegionExpr || exprUtils.getExprType(design.adminRegionExpr) !== "id") {
      return "Missing admin region expr";
    }
    if (!design.condition) {
      return "Missing condition";
    }
    return null;
  };

  AdminIndicatorChoroplethLayer.prototype.createDesignerElement = function(options) {
    var AdminIndicatorChoroplethLayerDesigner;
    AdminIndicatorChoroplethLayerDesigner = require('./AdminIndicatorChoroplethLayerDesigner');
    return React.createElement(AdminIndicatorChoroplethLayerDesigner, {
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

  return AdminIndicatorChoroplethLayer;

})(Layer);
