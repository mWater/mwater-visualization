"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var DirectDashboardDataSource, DirectWidgetDataSource, LayoutManager, QuickfilterUtils, WidgetFactory;
WidgetFactory = require('../widgets/WidgetFactory');
DirectWidgetDataSource = require('../widgets/DirectWidgetDataSource');
LayoutManager = require('../layouts/LayoutManager');
QuickfilterUtils = require('../quickfilter/QuickfilterUtils'); // Uses direct DataSource queries

module.exports = DirectDashboardDataSource =
/*#__PURE__*/
function () {
  // Create dashboard data source that uses direct jsonql calls
  // options:
  //   schema: schema to use
  //   dataSource: data source to use
  //   design: design of entire dashboard
  //   apiUrl: API url to use for talking to mWater server
  //   client: client id to use for talking to mWater server
  function DirectDashboardDataSource(options) {
    (0, _classCallCheck2["default"])(this, DirectDashboardDataSource);
    this.options = options;
  } // Gets the widget data source for a specific widget


  (0, _createClass2["default"])(DirectDashboardDataSource, [{
    key: "getWidgetDataSource",
    value: function getWidgetDataSource(widgetId) {
      var design, type, widget; // Get widget type and design from layout manager

      var _LayoutManager$create = LayoutManager.createLayoutManager(this.options.design.layout).getWidgetTypeAndDesign(this.options.design.items, widgetId);

      type = _LayoutManager$create.type;
      design = _LayoutManager$create.design;
      widget = WidgetFactory.createWidget(type);
      return new DirectWidgetDataSource({
        apiUrl: this.options.apiUrl,
        client: this.options.client,
        widget: widget,
        schema: this.options.schema,
        dataSource: this.options.dataSource
      });
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
  return DirectDashboardDataSource;
}();