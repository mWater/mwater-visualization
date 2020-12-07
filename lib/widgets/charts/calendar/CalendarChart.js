"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var AxisBuilder, CalendarChart, Chart, ExprCleaner, ExprCompiler, R, React, _, injectTableAlias, moment, produce;

_ = require('lodash');
React = require('react');
R = React.createElement;
moment = require('moment');
produce = require('immer')["default"];
injectTableAlias = require('mwater-expressions').injectTableAlias;
Chart = require('../Chart');
ExprCleaner = require('mwater-expressions').ExprCleaner;
ExprCompiler = require('mwater-expressions').ExprCompiler;
AxisBuilder = require('../../../axes/AxisBuilder');
/*
Design is:

  table: table to use for data source
  titleText: title text
  dateAxis: date axis to use
  valueAxis: axis for value
  filter: optional logical expression to filter by

*/

module.exports = CalendarChart = /*#__PURE__*/function (_Chart) {
  (0, _inherits2["default"])(CalendarChart, _Chart);

  var _super = _createSuper(CalendarChart);

  function CalendarChart() {
    (0, _classCallCheck2["default"])(this, CalendarChart);
    return _super.apply(this, arguments);
  }

  (0, _createClass2["default"])(CalendarChart, [{
    key: "cleanDesign",
    value: function cleanDesign(design, schema) {
      var axisBuilder, exprCleaner;
      exprCleaner = new ExprCleaner(schema);
      axisBuilder = new AxisBuilder({
        schema: schema
      });
      design = produce(design, function (draft) {
        // Fill in defaults
        draft.version = design.version || 1; // Clean axes

        draft.dateAxis = axisBuilder.cleanAxis({
          axis: design.dateAxis,
          table: design.table,
          aggrNeed: "none",
          types: ["date"]
        });
        draft.valueAxis = axisBuilder.cleanAxis({
          axis: design.valueAxis,
          table: design.table,
          aggrNeed: "required",
          types: ["number"]
        }); // Clean filter

        draft.filter = exprCleaner.cleanExpr(design.filter, {
          table: design.table,
          types: ["boolean"]
        });
      });
      return design;
    }
  }, {
    key: "validateDesign",
    value: function validateDesign(design, schema) {
      var axisBuilder, error;
      axisBuilder = new AxisBuilder({
        schema: schema
      }); // Check that has table

      if (!design.table) {
        return "Missing data source";
      } // Check that has axes


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
    }
  }, {
    key: "isEmpty",
    value: function isEmpty(design) {
      return !design.dateAxis || !design.valueAxis;
    } // Creates a design element with specified options
    // options include:
    //   schema: schema to use
    //   dataSource: dataSource to use
    //   design: design 
    //   onDesignChange: function
    //   filters: array of filters

  }, {
    key: "createDesignerElement",
    value: function createDesignerElement(options) {
      var _this = this;

      var CalendarChartDesignerComponent, props; // Require here to prevent server require problems

      CalendarChartDesignerComponent = require('./CalendarChartDesignerComponent');
      props = {
        schema: options.schema,
        design: this.cleanDesign(options.design, options.schema),
        dataSource: options.dataSource,
        filters: options.filter,
        onDesignChange: function onDesignChange(design) {
          // Clean design
          design = _this.cleanDesign(design, options.schema);
          return options.onDesignChange(design);
        }
      };
      return React.createElement(CalendarChartDesignerComponent, props);
    } // Get data for the chart asynchronously 
    // design: design of the chart
    // schema: schema to use
    // dataSource: data source to get data from
    // filters: array of { table: table id, jsonql: jsonql condition with {alias} for tableAlias }
    // callback: (error, data)

  }, {
    key: "getData",
    value: function getData(design, schema, dataSource, filters, callback) {
      var axisBuilder, dateExpr, exprCompiler, query, whereClauses;
      exprCompiler = new ExprCompiler(schema);
      axisBuilder = new AxisBuilder({
        schema: schema
      }); // Create shell of query

      query = {
        type: "query",
        selects: [],
        from: exprCompiler.compileTable(design.table, "main"),
        groupBy: [1],
        orderBy: [{
          ordinal: 1
        }],
        limit: 5000
      }; // Add date axis

      dateExpr = axisBuilder.compileAxis({
        axis: design.dateAxis,
        tableAlias: "main"
      });
      query.selects.push({
        type: "select",
        expr: dateExpr,
        alias: "date"
      }); // Add value axis

      query.selects.push({
        type: "select",
        expr: axisBuilder.compileAxis({
          axis: design.valueAxis,
          tableAlias: "main"
        }),
        alias: "value"
      }); // Get relevant filters

      filters = _.where(filters || [], {
        table: design.table
      });
      whereClauses = _.map(filters, function (f) {
        return injectTableAlias(f.jsonql, "main");
      }); // Compile filter

      if (design.filter) {
        whereClauses.push(exprCompiler.compileExpr({
          expr: design.filter,
          tableAlias: "main"
        }));
      } // Add null filter for date


      whereClauses.push({
        type: "op",
        op: "is not null",
        exprs: [dateExpr]
      });
      whereClauses = _.compact(whereClauses); // Wrap if multiple

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
    } // Create a view element for the chart
    // Options include:
    //   schema: schema to use
    //   dataSource: dataSource to use
    //   design: design of the chart
    //   data: results from queries
    //   width, height: size of the chart view
    //   scope: current scope of the view element
    //   onScopeChange: called when scope changes with new scope

  }, {
    key: "createViewElement",
    value: function createViewElement(options) {
      var CalendarChartViewComponent, props; // Require here to prevent server require problems

      CalendarChartViewComponent = require('./CalendarChartViewComponent'); // Create chart

      props = {
        schema: options.schema,
        design: this.cleanDesign(options.design, options.schema),
        data: options.data,
        width: options.width,
        height: options.height,
        scope: options.scope,
        onScopeChange: options.onScopeChange,
        cellStrokeColor: "#DDD"
      };
      return React.createElement(CalendarChartViewComponent, props);
    }
  }, {
    key: "createDataTable",
    value: function createDataTable(design, schema, dataSource, data) {
      var header, rows;
      header = ["Date", "Value"];
      rows = _.map(data, function (row) {
        return [moment(row.date).format("YYYY-MM-DD"), row.value];
      });
      return [header].concat(rows);
    } // Get a list of table ids that can be filtered on

  }, {
    key: "getFilterableTables",
    value: function getFilterableTables(design, schema) {
      return _.compact([design.table]);
    } // Get the chart placeholder icon. fa-XYZ or glyphicon-XYZ

  }, {
    key: "getPlaceholderIcon",
    value: function getPlaceholderIcon() {
      return "fa-calendar";
    }
  }]);
  return CalendarChart;
}(Chart);