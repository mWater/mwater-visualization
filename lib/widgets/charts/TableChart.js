var AxisBuilder, Chart, ExprCompiler, ExprUtils, H, React, TableChart, TableChartDesignerComponent, TableChartViewComponent, _, injectTableAlias,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

injectTableAlias = require('mwater-expressions').injectTableAlias;

Chart = require('./Chart');

ExprUtils = require('mwater-expressions').ExprUtils;

ExprCompiler = require('mwater-expressions').ExprCompiler;

AxisBuilder = require('./../../axes/AxisBuilder');

TableChartDesignerComponent = require('./TableChartDesignerComponent');

TableChartViewComponent = require('./TableChartViewComponent');


/*
Design is:
  
  table: table to use for data source
  titleText: title text
  columns: array of columns
  filter: optional logical expression to filter by
  orderings: array of orderings

column:
  headerText: header text
  textAxis: axis that creates the text value of the column

ordering:
  axis: axis that creates the order expression
  direction: "asc"/"desc"
 */

module.exports = TableChart = (function(superClass) {
  extend(TableChart, superClass);

  function TableChart(options) {
    this.schema = options.schema;
    this.dataSource = options.dataSource;
    this.exprBuilder = new ExprUtils(this.schema);
    this.axisBuilder = new AxisBuilder({
      schema: this.schema
    });
  }

  TableChart.prototype.cleanDesign = function(design) {
    var column, columnId, i, j, len, ordering, ref, ref1;
    design = _.cloneDeep(design);
    design.version = design.version || 1;
    design.columns = design.columns || [];
    if (design.columns.length === 0) {
      design.columns.push({});
    }
    design.orderings = design.orderings || [];
    for (columnId = i = 0, ref = design.columns.length; 0 <= ref ? i < ref : i > ref; columnId = 0 <= ref ? ++i : --i) {
      column = design.columns[columnId];
      column.textAxis = this.axisBuilder.cleanAxis({
        axis: column.textAxis,
        table: design.table,
        aggrNeed: "optional"
      });
    }
    ref1 = design.orderings;
    for (j = 0, len = ref1.length; j < len; j++) {
      ordering = ref1[j];
      ordering.axis = this.axisBuilder.cleanAxis({
        axis: ordering.axis,
        table: design.table,
        aggrNeed: "optional"
      });
    }
    if (design.filter) {
      design.filter = this.exprBuilder.cleanExpr(design.filter, design.table);
    }
    return design;
  };

  TableChart.prototype.validateDesign = function(design) {
    var column, error, i, j, len, len1, ordering, ref, ref1;
    if (!design.table) {
      return "Missing data source";
    }
    error = null;
    ref = design.columns;
    for (i = 0, len = ref.length; i < len; i++) {
      column = ref[i];
      if (!column.textAxis) {
        error = error || "Missing text";
      }
      error = error || this.axisBuilder.validateAxis({
        axis: column.textAxis
      });
    }
    ref1 = design.orderings;
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      ordering = ref1[j];
      if (!ordering.axis) {
        error = error || "Missing order expression";
      }
      error = error || this.axisBuilder.validateAxis({
        axis: ordering.axis
      });
    }
    error = error || this.exprBuilder.validateExpr(design.filter);
    return error;
  };

  TableChart.prototype.isEmpty = function(design) {
    return !design.columns || !design.columns[0] || !design.columns[0].textAxis;
  };

  TableChart.prototype.createDesignerElement = function(options) {
    var props;
    props = {
      schema: this.schema,
      design: this.cleanDesign(options.design),
      dataSource: this.dataSource,
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
    var colNum, column, expr, exprCompiler, i, j, len, ordering, query, ref, ref1, whereClauses;
    exprCompiler = new ExprCompiler(this.schema);
    query = {
      type: "query",
      selects: [],
      from: exprCompiler.compileTable(design.table, "main"),
      groupBy: [],
      orderBy: [],
      limit: 1000
    };
    for (colNum = i = 0, ref = design.columns.length; 0 <= ref ? i < ref : i > ref; colNum = 0 <= ref ? ++i : --i) {
      column = design.columns[colNum];
      expr = this.axisBuilder.compileAxis({
        axis: column.textAxis,
        tableAlias: "main"
      });
      query.selects.push({
        type: "select",
        expr: expr,
        alias: "c" + colNum
      });
      if (!column.textAxis.aggr) {
        query.groupBy.push(colNum + 1);
      }
    }
    ref1 = design.orderings;
    for (j = 0, len = ref1.length; j < len; j++) {
      ordering = ref1[j];
      query.orderBy.push({
        expr: this.axisBuilder.compileAxis({
          axis: ordering.axis,
          tableAlias: "main"
        }),
        direction: ordering.direction
      });
      if (!ordering.axis.aggr) {
        query.groupBy.push(this.axisBuilder.compileAxis({
          axis: ordering.axis,
          tableAlias: "main"
        }));
      }
    }
    filters = _.where(filters || [], {
      table: design.table
    });
    whereClauses = _.map(filters, function(f) {
      return injectTableAlias(f.jsonql, "main");
    });
    if (design.filter) {
      whereClauses.push(exprCompiler.compileExpr({
        expr: design.filter,
        tableAlias: "main"
      }));
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
      standardWidth: options.standardWidth,
      scope: options.scope,
      onScopeChange: options.onScopeChange
    };
    return React.createElement(TableChartViewComponent, props);
  };

  TableChart.prototype.createDataTable = function(design, data) {
    var header, renderHeaderCell, renderRow, table;
    renderHeaderCell = (function(_this) {
      return function(column) {
        return column.headerText || _this.axisBuilder.summarizeAxis(column.textAxis);
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
          return _this.axisBuilder.formatValue(column.textAxis, value);
        };
        return _.map(design.columns, renderCell);
      };
    })(this);
    table = table.concat(_.map(data.main, renderRow));
    return table;
  };

  return TableChart;

})(Chart);
