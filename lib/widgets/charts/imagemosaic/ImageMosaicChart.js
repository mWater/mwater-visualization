"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var AxisBuilder, Chart, ExprCleaner, ExprCompiler, ImageMosaicChart, R, React, _, injectTableAlias, original, produce;

_ = require('lodash');
React = require('react');
R = React.createElement;
produce = require('immer')["default"];
original = require('immer').original;
injectTableAlias = require('mwater-expressions').injectTableAlias;
Chart = require('../Chart');
ExprCleaner = require('mwater-expressions').ExprCleaner;
ExprCompiler = require('mwater-expressions').ExprCompiler;
AxisBuilder = require('../../../axes/AxisBuilder');
/*
Design is:

  table: table to use for data source
  titleText: title text
  imageAxis: image axis to use
  filter: optional logical expression to filter by

*/

module.exports = ImageMosaicChart = /*#__PURE__*/function (_Chart) {
  (0, _inherits2["default"])(ImageMosaicChart, _Chart);

  var _super = _createSuper(ImageMosaicChart);

  function ImageMosaicChart() {
    (0, _classCallCheck2["default"])(this, ImageMosaicChart);
    return _super.apply(this, arguments);
  }

  (0, _createClass2["default"])(ImageMosaicChart, [{
    key: "cleanDesign",
    value: function cleanDesign(design, schema) {
      var axisBuilder, exprCleaner;
      exprCleaner = new ExprCleaner(schema);
      axisBuilder = new AxisBuilder({
        schema: schema
      });
      design = produce(design, function (draft) {
        // Fill in defaults
        draft.version = design.version || 1; // Clean axis

        draft.imageAxis = axisBuilder.cleanAxis({
          axis: design.imageAxis,
          table: design.table,
          aggrNeed: "none",
          types: ["image", "imagelist"]
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

      if (!design.imageAxis) {
        error = error || "Missing image";
      }

      error = error || axisBuilder.validateAxis({
        axis: design.imageAxis
      });
      return error;
    }
  }, {
    key: "isEmpty",
    value: function isEmpty(design) {
      return !design.imageAxis;
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

      var ImageMosaicChartDesignerComponent, props; // Require here to prevent server require problems

      ImageMosaicChartDesignerComponent = require('./ImageMosaicChartDesignerComponent');
      props = {
        schema: options.schema,
        design: this.cleanDesign(options.design, options.schema),
        dataSource: options.dataSource,
        filters: options.filters,
        onDesignChange: function onDesignChange(design) {
          // Clean design
          design = _this.cleanDesign(design, options.schema);
          return options.onDesignChange(design);
        }
      };
      return React.createElement(ImageMosaicChartDesignerComponent, props);
    } // Get data for the chart asynchronously 
    // design: design of the chart
    // schema: schema to use
    // dataSource: data source to get data from
    // filters: array of { table: table id, jsonql: jsonql condition with {alias} for tableAlias }
    // callback: (error, data)

  }, {
    key: "getData",
    value: function getData(design, schema, dataSource, filters, callback) {
      var axisBuilder, exprCompiler, imageExpr, query, whereClauses;
      exprCompiler = new ExprCompiler(schema);
      axisBuilder = new AxisBuilder({
        schema: schema
      }); // Create shell of query

      query = {
        type: "query",
        selects: [],
        from: exprCompiler.compileTable(design.table, "main"),
        limit: 500
      }; // Add image axis

      imageExpr = axisBuilder.compileAxis({
        axis: design.imageAxis,
        tableAlias: "main"
      });
      query.selects.push({
        type: "select",
        expr: imageExpr,
        alias: "image"
      }); // Add primary key

      query.selects.push({
        type: "select",
        expr: {
          type: "field",
          tableAlias: "main",
          column: schema.getTable(design.table).primaryKey
        },
        alias: "id"
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
      } // Add null filter for image


      whereClauses.push({
        type: "op",
        op: "is not null",
        exprs: [imageExpr]
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
    //   width, height, standardWidth: size of the chart view
    //   scope: current scope of the view element
    //   onScopeChange: called when scope changes with new scope
    //   onRowClick: Called with (tableId, rowId) when item is clicked

  }, {
    key: "createViewElement",
    value: function createViewElement(options) {
      var ImageMosaicChartViewComponent, props; // Require here to prevent server require problems

      ImageMosaicChartViewComponent = require('./ImageMosaicChartViewComponent'); // Create chart

      props = {
        schema: options.schema,
        design: this.cleanDesign(options.design, options.schema),
        data: options.data,
        dataSource: options.dataSource,
        width: options.width,
        height: options.height,
        standardWidth: options.standardWidth,
        scope: options.scope,
        onScopeChange: options.onScopeChange,
        onRowClick: options.onRowClick
      };
      return React.createElement(ImageMosaicChartViewComponent, props);
    }
  }, {
    key: "createDataTable",
    value: function createDataTable(design, schema, dataSource, data) {
      alert("Not available for Image Mosaics");
      return null;
    } // TODO
    // renderHeaderCell = (column) =>
    //   column.headerText or @axisBuilder.summarizeAxis(column.textAxis)
    // header = _.map(design.columns, renderHeaderCell)
    // table = [header]
    // renderRow = (record) =>
    //   renderCell = (column, columnIndex) =>
    //     value = record["c#{columnIndex}"]
    //     return @axisBuilder.formatValue(column.textAxis, value)
    //   return _.map(design.columns, renderCell)
    // table = table.concat(_.map(data.main, renderRow))
    // return table
    // Get a list of table ids that can be filtered on

  }, {
    key: "getFilterableTables",
    value: function getFilterableTables(design, schema) {
      return _.compact([design.table]);
    } // Get the chart placeholder icon. fa-XYZ or glyphicon-XYZ

  }, {
    key: "getPlaceholderIcon",
    value: function getPlaceholderIcon() {
      return "fa-th";
    }
  }]);
  return ImageMosaicChart;
}(Chart);