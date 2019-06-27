"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var AxisBuilder, Chart, ExprCompiler, ExprUtils, R, React, TableChart, TableChartViewComponent, _, injectTableAlias, uuid;

_ = require('lodash');
React = require('react');
R = React.createElement;
uuid = require('uuid');
injectTableAlias = require('mwater-expressions').injectTableAlias;
Chart = require('../Chart');
ExprUtils = require('mwater-expressions').ExprUtils;
ExprCompiler = require('mwater-expressions').ExprCompiler;
AxisBuilder = require('../../../axes/AxisBuilder');
TableChartViewComponent = require('./TableChartViewComponent');
/*
Design is:

  table: table to use for data source
  titleText: title text
  columns: array of columns
  filter: optional logical expression to filter by
  orderings: array of orderings
  limit: optional limit to number of rows

column:
  id: unique id of column (uuid v4)
  headerText: header text
  textAxis: axis that creates the text value of the column. NOTE: now no longer using as an axis, but only using expression within!
  format: optional d3-format format for numeric values. Default if null is ","

ordering:
  axis: axis that creates the order expression. NOTE: now no longer using as an axis, but only using expression within!
  direction: "asc"/"desc"

*/

module.exports = TableChart =
/*#__PURE__*/
function (_Chart) {
  (0, _inherits2["default"])(TableChart, _Chart);

  function TableChart() {
    (0, _classCallCheck2["default"])(this, TableChart);
    return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(TableChart).apply(this, arguments));
  }

  (0, _createClass2["default"])(TableChart, [{
    key: "cleanDesign",
    value: function cleanDesign(design, schema) {
      var ExprCleaner, axisBuilder, column, columnId, exprCleaner, j, k, len, ordering, ref, ref1;
      ExprCleaner = require('mwater-expressions').ExprCleaner;
      exprCleaner = new ExprCleaner(schema);
      axisBuilder = new AxisBuilder({
        schema: schema
      }); // Clone deep for now # TODO

      design = _.cloneDeep(design);
      design.version = design.version || 1; // Always have at least one column

      design.columns = design.columns || [];

      if (design.columns.length === 0) {
        design.columns.push({
          id: uuid()
        });
      }

      design.orderings = design.orderings || []; // Clean each column

      for (columnId = j = 0, ref = design.columns.length; 0 <= ref ? j < ref : j > ref; columnId = 0 <= ref ? ++j : --j) {
        column = design.columns[columnId];

        if (!column.id) {
          column.id = uuid();
        } // Clean textAxis


        column.textAxis = axisBuilder.cleanAxis({
          axis: column.textAxis,
          table: design.table,
          aggrNeed: "optional"
        });
      }

      ref1 = design.orderings; // Clean orderings

      for (k = 0, len = ref1.length; k < len; k++) {
        ordering = ref1[k];
        ordering.axis = axisBuilder.cleanAxis({
          axis: ordering.axis,
          table: design.table,
          aggrNeed: "optional"
        });
      }

      if (design.filter) {
        design.filter = exprCleaner.cleanExpr(design.filter, {
          table: design.table,
          types: ['boolean']
        });
      } // Limit 


      if (design.limit && design.limit > 1000) {
        delete design.limit;
      }

      return design;
    }
  }, {
    key: "validateDesign",
    value: function validateDesign(design, schema) {
      var axisBuilder, column, error, j, k, len, len1, ordering, ref, ref1;
      axisBuilder = new AxisBuilder({
        schema: schema
      }); // Check that has table

      if (!design.table) {
        return "Missing data source";
      }

      error = null;
      ref = design.columns;

      for (j = 0, len = ref.length; j < len; j++) {
        column = ref[j]; // Check that has textAxis

        if (!column.textAxis) {
          error = error || "Missing text";
        }

        error = error || axisBuilder.validateAxis({
          axis: column.textAxis
        });
      }

      ref1 = design.orderings;

      for (k = 0, len1 = ref1.length; k < len1; k++) {
        ordering = ref1[k];

        if (!ordering.axis) {
          error = error || "Missing order expression";
        }

        error = error || axisBuilder.validateAxis({
          axis: ordering.axis
        });
      }

      return error;
    }
  }, {
    key: "isEmpty",
    value: function isEmpty(design) {
      return !design.columns || !design.columns[0] || !design.columns[0].textAxis;
    } // Creates a design element with specified options
    // options include:
    //   schema: schema to use
    //   dataSource: dataSource to use
    //   design: design
    //   onDesignChange: function

  }, {
    key: "createDesignerElement",
    value: function createDesignerElement(options) {
      var _this = this;

      var TableChartDesignerComponent, props; // Require here to prevent server require problems

      TableChartDesignerComponent = require('./TableChartDesignerComponent');
      props = {
        schema: options.schema,
        design: this.cleanDesign(options.design, options.schema),
        dataSource: options.dataSource,
        onDesignChange: function onDesignChange(design) {
          // Clean design
          design = _this.cleanDesign(design, options.schema);
          return options.onDesignChange(design);
        }
      };
      return React.createElement(TableChartDesignerComponent, props);
    } // Get data for the chart asynchronously
    // design: design of the chart
    // schema: schema to use
    // dataSource: data source to get data from
    // filters: array of { table: table id, jsonql: jsonql condition with {alias} for tableAlias }
    // callback: (error, data)

  }, {
    key: "getData",
    value: function getData(design, schema, dataSource, filters, callback) {
      var axisBuilder, colNum, column, compiledExpr, exprCompiler, exprType, exprUtils, i, isAggr, j, k, len, ordering, query, ref, ref1, ref2, ref3, ref4, ref5, whereClauses;
      exprUtils = new ExprUtils(schema);
      exprCompiler = new ExprCompiler(schema);
      axisBuilder = new AxisBuilder({
        schema: schema
      }); // Create shell of query

      query = {
        type: "query",
        selects: [],
        from: exprCompiler.compileTable(design.table, "main"),
        groupBy: [],
        orderBy: [],
        limit: Math.min(design.limit || 1000, 1000)
      }; // Determine if any aggregate

      isAggr = _.any(design.columns, function (column) {
        return axisBuilder.isAxisAggr(column.textAxis);
      }) || _.any(design.orderings, function (ordering) {
        return axisBuilder.isAxisAggr(ordering.textAxis);
      }); // For each column

      for (colNum = j = 0, ref = design.columns.length; 0 <= ref ? j < ref : j > ref; colNum = 0 <= ref ? ++j : --j) {
        column = design.columns[colNum];
        exprType = exprUtils.getExprType((ref1 = column.textAxis) != null ? ref1.expr : void 0);
        compiledExpr = exprCompiler.compileExpr({
          expr: (ref2 = column.textAxis) != null ? ref2.expr : void 0,
          tableAlias: "main"
        }); // Handle special case of geometry, converting to GeoJSON

        if (exprType === "geometry") {
          // Convert to 4326 (lat/long). Force ::geometry for null
          compiledExpr = {
            type: "op",
            op: "ST_AsGeoJSON",
            exprs: [{
              type: "op",
              op: "ST_Transform",
              exprs: [{
                type: "op",
                op: "::geometry",
                exprs: [compiledExpr]
              }, 4326]
            }]
          };
        }

        query.selects.push({
          type: "select",
          expr: compiledExpr,
          alias: "c".concat(colNum)
        }); // Add group by if not aggregate

        if (isAggr && !axisBuilder.isAxisAggr(column.textAxis)) {
          query.groupBy.push(colNum + 1);
        }
      }

      ref3 = design.orderings || []; // Compile orderings

      for (i = k = 0, len = ref3.length; k < len; i = ++k) {
        ordering = ref3[i]; // Add as select so we can use ordinals. Prevents https://github.com/mWater/mwater-visualization/issues/165

        query.selects.push({
          type: "select",
          expr: exprCompiler.compileExpr({
            expr: (ref4 = ordering.axis) != null ? ref4.expr : void 0,
            tableAlias: "main"
          }),
          alias: "o".concat(i)
        });
        query.orderBy.push({
          ordinal: design.columns.length + i + 1,
          direction: ordering.direction,
          nulls: ordering.direction === "desc" ? "last" : "first"
        }); // Add group by if non-aggregate

        if (isAggr && exprUtils.getExprAggrStatus((ref5 = ordering.axis) != null ? ref5.expr : void 0) === "individual") {
          query.groupBy.push(design.columns.length + i + 1);
        }
      } // Add id if non-aggr


      if (!isAggr) {
        query.selects.push({
          type: "select",
          expr: {
            type: "field",
            tableAlias: "main",
            column: schema.getTable(design.table).primaryKey
          },
          alias: "id"
        });
      } // Get relevant filters


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
      }

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

      return dataSource.performQuery(query, function (error, data) {
        return callback(error, {
          main: data
        });
      });
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
      var props; // Create chart

      props = {
        schema: options.schema,
        dataSource: options.dataSource,
        design: this.cleanDesign(options.design, options.schema),
        data: options.data,
        width: options.width,
        height: options.height,
        standardWidth: options.standardWidth,
        scope: options.scope,
        onScopeChange: options.onScopeChange,
        onRowClick: options.onRowClick
      };
      return React.createElement(TableChartViewComponent, props);
    }
  }, {
    key: "createDataTable",
    value: function createDataTable(design, schema, dataSource, data, locale) {
      var exprUtils, header, renderHeaderCell, renderRow, table;
      exprUtils = new ExprUtils(schema);

      renderHeaderCell = function renderHeaderCell(column) {
        var ref;
        return column.headerText || exprUtils.summarizeExpr((ref = column.textAxis) != null ? ref.expr : void 0, locale);
      };

      header = _.map(design.columns, renderHeaderCell);
      table = [header];

      renderRow = function renderRow(record) {
        var renderCell;

        renderCell = function renderCell(column, columnIndex) {
          var exprType, ref, ref1, value;
          value = record["c".concat(columnIndex)]; // Handle empty as "" not "None"

          if (value == null) {
            return "";
          }

          exprUtils = new ExprUtils(schema);
          exprType = exprUtils.getExprType((ref = column.textAxis) != null ? ref.expr : void 0); // Special case for images

          if (exprType === "image" && value) {
            return dataSource.getImageUrl(value.id);
          }

          if (exprType === "imagelist" && value) {
            return _.map(value, function (img) {
              return dataSource.getImageUrl(img.id);
            }).join(" ");
          }

          return exprUtils.stringifyExprLiteral((ref1 = column.textAxis) != null ? ref1.expr : void 0, value, locale);
        };

        return _.map(design.columns, renderCell);
      };

      table = table.concat(_.map(data.main, renderRow));
      return table;
    } // Get a list of table ids that can be filtered on

  }, {
    key: "getFilterableTables",
    value: function getFilterableTables(design, schema) {
      return _.compact([design.table]);
    } // Get the chart placeholder icon. fa-XYZ or glyphicon-XYZ

  }, {
    key: "getPlaceholderIcon",
    value: function getPlaceholderIcon() {
      return "fa-table";
    }
  }]);
  return TableChart;
}(Chart);