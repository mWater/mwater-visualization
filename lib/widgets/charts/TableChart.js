var AxisBuilder, Chart, ExprCleaner, ExprCompiler, H, React, TableChart, TableChartDesignerComponent, TableChartViewComponent, _, injectTableAlias,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

injectTableAlias = require('mwater-expressions').injectTableAlias;

Chart = require('./Chart');

ExprCleaner = require('mwater-expressions').ExprCleaner;

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
    this.exprCleaner = new ExprCleaner(this.schema);
    this.axisBuilder = new AxisBuilder({
      schema: this.schema
    });
  }

  TableChart.prototype.cleanDesign = function(design) {
    var column, columnId, j, k, len, ordering, ref, ref1;
    design = _.cloneDeep(design);
    design.version = design.version || 1;
    design.columns = design.columns || [];
    if (design.columns.length === 0) {
      design.columns.push({});
    }
    design.orderings = design.orderings || [];
    for (columnId = j = 0, ref = design.columns.length; 0 <= ref ? j < ref : j > ref; columnId = 0 <= ref ? ++j : --j) {
      column = design.columns[columnId];
      column.textAxis = this.axisBuilder.cleanAxis({
        axis: column.textAxis,
        table: design.table,
        aggrNeed: "optional"
      });
    }
    ref1 = design.orderings;
    for (k = 0, len = ref1.length; k < len; k++) {
      ordering = ref1[k];
      ordering.axis = this.axisBuilder.cleanAxis({
        axis: ordering.axis,
        table: design.table,
        aggrNeed: "optional"
      });
    }
    if (design.filter) {
      design.filter = this.exprCleaner.cleanExpr(design.filter, {
        table: design.table,
        types: ['boolean']
      });
    }
    return design;
  };

  TableChart.prototype.validateDesign = function(design) {
    var column, error, j, k, len, len1, ordering, ref, ref1;
    if (!design.table) {
      return "Missing data source";
    }
    error = null;
    ref = design.columns;
    for (j = 0, len = ref.length; j < len; j++) {
      column = ref[j];
      if (!column.textAxis) {
        error = error || "Missing text";
      }
      error = error || this.axisBuilder.validateAxis({
        axis: column.textAxis
      });
    }
    ref1 = design.orderings;
    for (k = 0, len1 = ref1.length; k < len1; k++) {
      ordering = ref1[k];
      if (!ordering.axis) {
        error = error || "Missing order expression";
      }
      error = error || this.axisBuilder.validateAxis({
        axis: ordering.axis
      });
    }
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

  TableChart.prototype.getData = function(design, filters, callback) {
    var colNum, column, expr, exprCompiler, i, j, k, len, ordering, query, ref, ref1, whereClauses;
    exprCompiler = new ExprCompiler(this.schema);
    query = {
      type: "query",
      selects: [],
      from: exprCompiler.compileTable(design.table, "main"),
      groupBy: [],
      orderBy: [],
      limit: 1000
    };
    for (colNum = j = 0, ref = design.columns.length; 0 <= ref ? j < ref : j > ref; colNum = 0 <= ref ? ++j : --j) {
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
    ref1 = design.orderings || [];
    for (i = k = 0, len = ref1.length; k < len; i = ++k) {
      ordering = ref1[i];
      query.selects.push({
        type: "select",
        expr: this.axisBuilder.compileAxis({
          axis: ordering.axis,
          tableAlias: "main"
        }),
        alias: "o" + i
      });
      query.orderBy.push({
        ordinal: design.columns.length + i + 1,
        direction: ordering.direction
      });
      if (!ordering.axis.aggr) {
        query.groupBy.push(design.columns.length + i + 1);
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
    return this.dataSource.performQuery(query, (function(_this) {
      return function(error, data) {
        return callback(error, {
          main: data
        });
      };
    })(this));
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

  TableChart.prototype.createDataTable = function(design, data, locale) {
    var header, renderHeaderCell, renderRow, table;
    renderHeaderCell = (function(_this) {
      return function(column) {
        return column.headerText || _this.axisBuilder.summarizeAxis(column.textAxis, locale);
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
          return _this.axisBuilder.formatValue(column.textAxis, value, locale);
        };
        return _.map(design.columns, renderCell);
      };
    })(this);
    table = table.concat(_.map(data.main, renderRow));
    return table;
  };

  return TableChart;

})(Chart);
