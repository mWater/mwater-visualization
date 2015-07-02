var BarChart, BarChartDesignerComponent, BarChartViewComponent, Chart, ExpressionBuilder, ExpressionCompiler, H, React, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

Chart = require('./Chart');

ExpressionBuilder = require('./ExpressionBuilder');

ExpressionCompiler = require('./ExpressionCompiler');

BarChartDesignerComponent = require('./BarChartDesignerComponent');

BarChartViewComponent = require('./BarChartViewComponent');


/*
Design is:

table: base table of design

aesthetics:
  x:
    expr: expression
    scale: scale
  y: 
    expr: expression
    scale: scale
    aggr: aggregation function to apply
  color:
    expr: expression
    scale: scale

filter: expression that filters table

stacked: true/false
 */

module.exports = BarChart = (function(superClass) {
  extend(BarChart, superClass);

  function BarChart(schema) {
    this.schema = schema;
    this.exprBuilder = new ExpressionBuilder(this.schema);
  }

  BarChart.prototype.cleanDesign = function(design) {
    var aes, aggrs, i, idCol, len, ref, value;
    design.aesthetics = design.aesthetics || {};
    design.annotations = design.annotations || {};
    design = _.cloneDeep(design);
    ref = ['y', 'x', 'color'];
    for (i = 0, len = ref.length; i < len; i++) {
      aes = ref[i];
      value = design.aesthetics[aes];
      if (!value || !value.expr) {
        continue;
      }
      value.expr = this.exprBuilder.cleanExpr(value.expr, design.table);
    }
    if (!design.aesthetics.y || !design.aesthetics.y.expr) {
      if (design.table) {
        idCol = _.findWhere(this.schema.getColumns(design.table), {
          type: "id"
        });
        if (idCol) {
          design.aesthetics.y = {
            expr: {
              type: "scalar",
              table: design.table,
              joins: [],
              expr: {
                type: "field",
                table: design.table,
                column: idCol.id
              }
            },
            aggr: "count"
          };
        }
      }
    }
    if (design.aesthetics.y && design.aesthetics.y.expr && !design.aesthetics.y.aggr) {
      aggrs = this.exprBuilder.getAggrs(design.aesthetics.y.expr);
      aggrs = _.filter(aggrs, function(aggr) {
        return aggr.id !== "last";
      });
      design.aesthetics.y.aggr = aggrs[0].id;
    }
    if (design.filter) {
      design.filter = this.exprBuilder.cleanExpr(design.filter, design.table);
    }
    return design;
  };

  BarChart.prototype.validateDesign = function(design) {
    var error;
    if (!design.table) {
      return "Missing Table";
    }
    if (!design.aesthetics.x || !design.aesthetics.x.expr) {
      return "Missing X Axis";
    }
    if (!design.aesthetics.y || !design.aesthetics.y.expr) {
      return "Missing Y Axis";
    }
    error = null;
    if (!design.aesthetics.y.aggr) {
      error = "Missing Y aggregation";
    }
    error = error || this.exprBuilder.validateExpr(design.aesthetics.x.expr);
    error = error || this.exprBuilder.validateExpr(design.aesthetics.y.expr);
    error = error || this.exprBuilder.validateExpr(design.filter);
    return error;
  };

  BarChart.prototype.createDesignerElement = function(options) {
    var props;
    props = {
      schema: this.schema,
      design: this.cleanDesign(options.design),
      onDesignChange: (function(_this) {
        return function(design) {
          design = _this.cleanDesign(design);
          return options.onDesignChange(design);
        };
      })(this)
    };
    return React.createElement(BarChartDesignerComponent, props);
  };

  BarChart.prototype.createQueries = function(design, filters) {
    var expr, exprCompiler, filter, i, len, query, relevantFilters, whereClauses;
    exprCompiler = new ExpressionCompiler(this.schema);
    query = {
      type: "query",
      selects: [],
      from: {
        type: "table",
        table: design.table,
        alias: "main"
      },
      groupBy: [1],
      limit: 1000
    };
    query.selects.push({
      type: "select",
      expr: exprCompiler.compileExpr({
        expr: design.aesthetics.x.expr,
        tableAlias: "main"
      }),
      alias: "x"
    });
    expr = exprCompiler.compileExpr({
      expr: design.aesthetics.y.expr,
      tableAlias: "main"
    });
    query.selects.push({
      type: "select",
      expr: {
        type: "op",
        op: design.aesthetics.y.aggr,
        exprs: [expr]
      },
      alias: "y"
    });
    if (design.filter) {
      query.where = exprCompiler.compileExpr({
        expr: design.filter,
        tableAlias: "main"
      });
    }
    if (filters && filters.length > 0) {
      relevantFilters = _.where(filters, {
        table: design.table
      });
      if (relevantFilters.length > 0) {
        whereClauses = [];
        if (query.where) {
          whereClauses.push(query.where);
        }
        for (i = 0, len = relevantFilters.length; i < len; i++) {
          filter = relevantFilters[i];
          whereClauses.push(exprCompiler.compileExpr({
            expr: filter,
            tableAlias: "main"
          }));
        }
        if (whereClauses.length > 1) {
          query.where = {
            type: "op",
            op: "and",
            exprs: whereClauses
          };
        } else {
          query.where = whereClauses[0];
        }
      }
    }
    return {
      main: query
    };
  };

  BarChart.prototype.createViewElement = function(options) {
    var props;
    props = {
      schema: this.schema,
      design: this.cleanDesign(options.design),
      data: options.data,
      width: options.width,
      height: options.height,
      scope: options.scope,
      onScopeChange: options.onScopeChange
    };
    return React.createElement(BarChartViewComponent, props);
  };

  return BarChart;

})(Chart);
