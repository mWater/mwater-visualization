var AxisBuilder, CalendarChart, Chart, ExprCleaner, ExprCompiler, H, React, _, injectTableAlias, moment,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

moment = require('moment');

injectTableAlias = require('mwater-expressions').injectTableAlias;

Chart = require('./Chart');

ExprCleaner = require('mwater-expressions').ExprCleaner;

ExprCompiler = require('mwater-expressions').ExprCompiler;

AxisBuilder = require('./../../axes/AxisBuilder');


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

  function CalendarChart() {
    return CalendarChart.__super__.constructor.apply(this, arguments);
  }

  CalendarChart.prototype.cleanDesign = function(design, schema) {
    var axisBuilder, exprCleaner;
    exprCleaner = new ExprCleaner(schema);
    axisBuilder = new AxisBuilder({
      schema: schema
    });
    design = _.cloneDeep(design);
    design.version = design.version || 1;
    design.dateAxis = axisBuilder.cleanAxis({
      axis: design.dateAxis,
      table: design.table,
      aggrNeed: "none",
      types: ["date"]
    });
    design.valueAxis = axisBuilder.cleanAxis({
      axis: design.valueAxis,
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
    design.filter = exprCleaner.cleanExpr(design.filter, {
      table: design.table,
      types: ["boolean"]
    });
    return design;
  };

  CalendarChart.prototype.validateDesign = function(design, schema) {
    var axisBuilder, error;
    axisBuilder = new AxisBuilder({
      schema: schema
    });
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
    error = error || axisBuilder.validateAxis({
      axis: design.dateAxis
    });
    error = error || axisBuilder.validateAxis({
      axis: design.valueAxis
    });
    return error;
  };

  CalendarChart.prototype.isEmpty = function(design) {
    return !design.dateAxis || !design.valueAxis;
  };

  CalendarChart.prototype.createDesignerElement = function(options) {
    var CalendarChartDesignerComponent, props;
    CalendarChartDesignerComponent = require('./CalendarChartDesignerComponent');
    props = {
      schema: options.schema,
      design: this.cleanDesign(options.design, options.schema),
      dataSource: options.dataSource,
      onDesignChange: (function(_this) {
        return function(design) {
          design = _this.cleanDesign(design, options.schema);
          return options.onDesignChange(design);
        };
      })(this)
    };
    return React.createElement(CalendarChartDesignerComponent, props);
  };

  CalendarChart.prototype.getData = function(design, schema, dataSource, filters, callback) {
    var axisBuilder, dateExpr, exprCompiler, query, whereClauses;
    exprCompiler = new ExprCompiler(schema);
    axisBuilder = new AxisBuilder({
      schema: schema
    });
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
    dateExpr = axisBuilder.compileAxis({
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
      expr: axisBuilder.compileAxis({
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
    return dataSource.performQuery(query, callback);
  };

  CalendarChart.prototype.createViewElement = function(options) {
    var CalendarChartViewComponent, props;
    CalendarChartViewComponent = require('./CalendarChartViewComponent');
    props = {
      schema: options.schema,
      design: this.cleanDesign(options.design, options.schema),
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

  CalendarChart.prototype.createDataTable = function(design, schema, data) {
    var header, rows;
    header = ["Date", "Value"];
    rows = _.map(data, function(row) {
      return [moment(row.date).format("YYYY-MM-DD"), row.value];
    });
    return [header].concat(rows);
  };

  return CalendarChart;

})(Chart);
