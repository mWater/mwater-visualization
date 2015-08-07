var Chart, ExpressionBuilder, ExpressionCompiler, H, React, TableChart, TableChartDesignerComponent, TableChartViewComponent, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ = require('lodash');

React = require('react');

H = React.DOM;

Chart = require('./Chart');

ExpressionBuilder = require('./../../expressions/ExpressionBuilder');

ExpressionCompiler = require('./../../expressions/ExpressionCompiler');

TableChartDesignerComponent = require('./TableChartDesignerComponent');

TableChartViewComponent = require('./TableChartViewComponent');


/*
Design is:
  
  table: table to use for data source
  titleText: title text
  columns: array of columns
  filter: optional logical expression to filter by

column:
  headerText: heaer text
  expr: expression for column value
  aggr: aggregation function if needed
 */

module.exports = TableChart = (function(superClass) {
  extend(TableChart, superClass);

  function TableChart(options) {
    this.compileExpr = bind(this.compileExpr, this);
    this.schema = options.schema;
    this.exprBuilder = new ExpressionBuilder(this.schema);
  }

  TableChart.prototype.cleanDesign = function(design) {
    var aggrs, column, columnId, i, ref, ref1;
    design = _.cloneDeep(design);
    design.columns = design.columns || [];
    if (design.columns.length === 0) {
      design.columns.push({});
    }
    for (columnId = i = 0, ref = design.columns.length; 0 <= ref ? i < ref : i > ref; columnId = 0 <= ref ? ++i : --i) {
      column = design.columns[columnId];
      column.expr = this.exprBuilder.cleanExpr(column.expr, design.table);
      if (column.expr) {
        aggrs = this.exprBuilder.getAggrs(column.expr);
        if (column.aggr && (ref1 = column.aggr, indexOf.call(_.pluck(aggrs, "id"), ref1) < 0)) {
          delete column.aggr;
        }
        if (!column.aggr && !this.exprBuilder.getExprType(column.expr)) {
          column.aggr = "count";
        }
      }
    }
    if (design.filter) {
      design.filter = this.exprBuilder.cleanExpr(design.filter, design.table);
    }
    return design;
  };

  TableChart.prototype.validateDesign = function(design) {
    var column, error, i, len, ref;
    if (!design.table) {
      return "Missing data source";
    }
    error = null;
    ref = design.columns;
    for (i = 0, len = ref.length; i < len; i++) {
      column = ref[i];
      if (!column.expr) {
        error = error || "Missing expression";
      }
      error = error || this.exprBuilder.validateExpr(column.xExpr);
    }
    error = error || this.exprBuilder.validateExpr(design.filter);
    return error;
  };

  TableChart.prototype.createDesignerElement = function(options) {
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
    return React.createElement(TableChartDesignerComponent, props);
  };

  TableChart.prototype.createQueries = function(design, filters) {
    var colNum, column, expr, i, query, ref;
    query = {
      type: "query",
      selects: [],
      from: {
        type: "table",
        table: design.table,
        alias: "main"
      },
      groupBy: [],
      orderBy: [],
      limit: 1000
    };
    for (colNum = i = 0, ref = design.columns.length; 0 <= ref ? i < ref : i > ref; colNum = 0 <= ref ? ++i : --i) {
      column = design.columns[colNum];
      if (column.aggr) {
        expr = this.compileExpr(column.expr);
        query.selects.push({
          type: "select",
          expr: {
            type: "op",
            op: column.aggr,
            exprs: expr ? [expr] : []
          },
          alias: "c" + colNum
        });
      } else {
        query.selects.push({
          type: "select",
          expr: this.compileExpr(column.expr),
          alias: "c" + colNum
        });
      }
      if (!column.aggr) {
        query.groupBy.push(colNum + 1);
      }
    }
    filters = _.where(filters || [], {
      table: design.table
    });
    if (design.filter) {
      filters.push(design.filter);
    }
    filters = _.map(filters, this.compileExpr);
    if (filters.length > 1) {
      query.where = {
        type: "op",
        op: "and",
        exprs: filters
      };
    } else {
      query.where = filters[0];
    }
    return {
      main: query
    };
  };

  TableChart.prototype.createViewElement = function(options) {
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
    return React.createElement(TableChartViewComponent, props);
  };

  TableChart.prototype.compileExpr = function(expr) {
    var exprCompiler;
    exprCompiler = new ExpressionCompiler(this.schema);
    return exprCompiler.compileExpr({
      expr: expr,
      tableAlias: "main"
    });
  };

  TableChart.prototype.createDataTable = function(design, data) {
    var header, renderHeaderCell, renderRow, table;
    renderHeaderCell = (function(_this) {
      return function(column) {
        return column.headerText || _this.exprBuilder.summarizeAggrExpr(column.expr, column.aggr);
      };
    })(this);
    header = _.map(design.columns, renderHeaderCell);
    table = [header];
    renderRow = (function(_this) {
      return function(record) {
        var renderCell;
        renderCell = function(column, columnIndex) {
          var value;
          value = record["c" + columnIndex];
          return _this.exprBuilder.stringifyExprLiteral(column.expr, value);
        };
        return _.map(design.columns, renderCell);
      };
    })(this);
    table = table.concat(_.map(data.main, renderRow));
    return table;
  };

  return TableChart;

})(Chart);
