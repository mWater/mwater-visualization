"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var DatagridDataSource, DatagridQueryBuilder, DirectDatagridDataSource, QuickfilterUtils;
DatagridDataSource = require('./DatagridDataSource');
DatagridQueryBuilder = require('./DatagridQueryBuilder');
QuickfilterUtils = require('../quickfilter/QuickfilterUtils'); // Uses direct DataSource queries

module.exports = DirectDatagridDataSource =
/*#__PURE__*/
function () {
  // Create dashboard data source that uses direct jsonql calls
  // options:
  //   schema: schema to use
  //   dataSource: data source to use
  function DirectDatagridDataSource(options) {
    (0, _classCallCheck2.default)(this, DirectDatagridDataSource);
    this.options = options;
  } // Gets the rows specified


  (0, _createClass2.default)(DirectDatagridDataSource, [{
    key: "getRows",
    value: function getRows(design, offset, limit, filters, callback) {
      var query, queryBuilder;
      queryBuilder = new DatagridQueryBuilder(this.options.schema); // Create query to get the page of rows at the specific offset

      query = queryBuilder.createQuery(design, {
        offset: offset,
        limit: limit,
        extraFilters: filters
      });
      return this.options.dataSource.performQuery(query, callback);
    } // Gets the quickfilters data source

  }, {
    key: "getQuickfiltersDataSource",
    value: function getQuickfiltersDataSource() {
      var _this = this;

      return {
        getValues: function getValues(index, expr, filters, offset, limit, callback) {
          // Perform query
          return QuickfilterUtils.findExprValues(expr, _this.options.schema, _this.options.dataSource, filters, offset, limit, callback);
        }
      };
    }
  }]);
  return DirectDatagridDataSource;
}();