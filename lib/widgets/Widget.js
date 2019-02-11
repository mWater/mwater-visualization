"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

// All logic needed to display and design a particular widget
// Scopes are a feature of widgets that allow a widget to apply filters to another widget. See WidgetScoper for more details
var Widget;

module.exports = Widget =
/*#__PURE__*/
function () {
  function Widget() {
    (0, _classCallCheck2.default)(this, Widget);
  }

  (0, _createClass2.default)(Widget, [{
    key: "createViewElement",
    // Creates a React element that is a view of the widget 
    // options:
    //  schema: schema to use
    //  dataSource: data source to use. Only used when designing, for display uses widgetDataSource
    //  widgetDataSource: Gives data to the widget in a way that allows client-server separation and secure sharing. See definition in WidgetDataSource.
    //  design: widget design
    //  scope: scope of the widget (when the widget self-selects a particular scope)
    //  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
    //  onScopeChange: called with scope of widget
    //  onDesignChange: called with new design. null/undefined for readonly
    //  width: width in pixels on screen
    //  height: height in pixels on screen
    //  standardWidth: standard width of the widget in pixels. If greater than width, widget should scale up, if less, should scale down.
    //  singleRowTable: optional table name of table that will be filtered to have a single row present. Widget designer should optionally account for this
    //  onRowClick: Called with (tableId, rowId) when item is clicked
    //  namedStrings: optional lookup of string name to value. Used for {{branding}} and other replacement strings in text widget
    value: function createViewElement(options) {
      throw new Error("Not implemented");
    } // Get the data that the widget needs. This will be called on the server, typically.
    //   design: design of the chart
    //   schema: schema to use
    //   dataSource: data source to get data from
    //   filters: array of { table: table id, jsonql: jsonql condition with {alias} for tableAlias }
    //   callback: (error, data)

  }, {
    key: "getData",
    value: function getData(design, schema, dataSource, filters, callback) {
      throw new Error("Not implemented");
    } // Determine if widget is auto-height, which means that a vertical height is not required.

  }, {
    key: "isAutoHeight",
    value: function isAutoHeight() {
      return false;
    } // Get a list of table ids that can be filtered on

  }, {
    key: "getFilterableTables",
    value: function getFilterableTables(design, schema) {
      return [];
    } // Get table of contents entries for the widget, entries that should be displayed in the TOC.
    // returns `[{ id: "id that is unique within widget", text: "text of TOC entry", level: 1, 2, etc. }]

  }, {
    key: "getTOCEntries",
    value: function getTOCEntries(design, namedStrings) {
      return [];
    }
  }]);
  return Widget;
}();