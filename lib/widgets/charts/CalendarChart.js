var AxisBuilder, CalendarChart, CalendarChartDesignerComponent, CalendarChartViewComponent, Chart, ExprCleaner, ExprCompiler, H, React, _, injectTableAlias,
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

CalendarChartDesignerComponent = require('./CalendarChartDesignerComponent');

CalendarChartViewComponent = require('./CalendarChartViewComponent');


/*
Design is:
  
  table: table to use for data source
  titleText: title text
  dateAxis: date axis to use
  valueAxis: axis for value
  filter: optional logical expression to filter by
 */

module.exports = CalendarChart = (function(superClass) {
  extend(CalendarChart, superClass);

  function CalendarChart(options) {
    this.schema = options.schema;
    this.dataSource = options.dataSource;
    this.exprCleaner = new ExprCleaner(this.schema);
    this.axisBuilder = new AxisBuilder({
      schema: this.schema
    });
  }

  CalendarChart.prototype.cleanDesign = function(design) {
    design = _.cloneDeep(design);
    design.version = design.version || 1;
    design.dateAxis = this.axisBuilder.cleanAxis({
      axis: design.dateAxis,
      table: design.table,
      aggrNeed: "none",
      types: ["date"]
    });
    design.valueAxis = this.axisBuilder.cleanAxis({
      axis: design.dateAxis,
      table: design.table,
      aggrNeed: "required",
      types: ["number"]
    });
    if (!design.valueAxis && design.dateAxis) {
      design.valueAxis = {
        expr: {
          type: "id",
          table: design.table
        },
        aggr: "count",
        xform: null
      };
    }
    design.filter = this.exprCleaner.cleanExpr(design.filter, {
      table: design.table,
      types: ["boolean"]
    });
    return design;
  };

  CalendarChart.prototype.validateDesign = function(design) {
    var error;
    if (!design.table) {
      return "Missing data source";
    }
    error = null;
    if (!design.dateAxis) {
      error = error || "Missing date";
    }
    if (!design.valueAxis) {
      error = error || "Missing value";
    }
    error = error || this.axisBuilder.validateAxis({
      axis: design.dateAxis
    });
    error = error || this.axisBuilder.validateAxis({
      axis: design.valueAxis
    });
    return error;
  };

  CalendarChart.prototype.isEmpty = function(design) {
    return !design.dateAxis || !design.valueAxis;
  };

  CalendarChart.prototype.createDesignerElement = function(options) {
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
    return React.createElement(CalendarChartDesignerComponent, props);
  };

  CalendarChart.prototype.getData = function(design, filters, callback) {
    var dateExpr, exprCompiler, query, whereClauses;
    exprCompiler = new ExprCompiler(this.schema);
    query = {
      type: "query",
      selects: [],
      from: exprCompiler.compileTable(design.table, "main"),
      groupBy: [1],
      orderBy: [
        {
          ordinal: 1
        }
      ],
      limit: 5000
    };
    dateExpr = this.axisBuilder.compileAxis({
      axis: design.dateAxis,
      tableAlias: "main"
    });
    query.selects.push({
      type: "select",
      expr: dateExpr,
      alias: "date"
    });
    query.selects.push({
      type: "select",
      expr: this.axisBuilder.compileAxis({
        axis: design.valueAxis,
        tableAlias: "main"
      }),
      alias: "value"
    });
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
    whereClauses.push({
      type: "op",
      op: "is not null",
      exprs: [dateExpr]
    });
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
    return this.dataSource.performQuery(query, callback);
  };

  CalendarChart.prototype.createViewElement = function(options) {
    var props;
    props = {
      schema: this.schema,
      design: this.cleanDesign(options.design),
      data: options.data,
      width: options.width,
      height: options.height,
      standardWidth: options.standardWidth,
      scope: options.scope,
      onScopeChange: options.onScopeChange,
      cellStrokeColor: "#DDD"
    };
    return React.createElement(CalendarChartViewComponent, props);
  };

  CalendarChart.prototype.createDataTable = function(design, data) {
    return CalendarChart.__super__.createDataTable.apply(this, arguments);
  };

  return CalendarChart;

})(Chart);
