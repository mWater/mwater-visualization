"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

// Data source for a dashboard that allows client-server model that supports sharing of dashboards
var DashboardDataSource;

module.exports = DashboardDataSource =
/*#__PURE__*/
function () {
  function DashboardDataSource() {
    (0, _classCallCheck2["default"])(this, DashboardDataSource);
  }

  (0, _createClass2["default"])(DashboardDataSource, [{
    key: "getWidgetDataSource",
    // Gets the widget data source for a specific widget
    value: function getWidgetDataSource(widgetId) {
      throw new Error("Not implemented");
    } // Gets the quickfilters data source

  }, {
    key: "getQuickfiltersDataSource",
    value: function getQuickfiltersDataSource() {
      throw new Error("Not implemented");
    }
  }]);
  return DashboardDataSource;
}();