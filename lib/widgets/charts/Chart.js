"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

// Common interface for all charts
var Chart;

module.exports = Chart =
/*#__PURE__*/
function () {
  function Chart() {
    (0, _classCallCheck2.default)(this, Chart);
  }

  (0, _createClass2.default)(Chart, [{
    key: "cleanDesign",
    // Removes any invalid values from a design. Returns cleaned design
    value: function cleanDesign(design, schema) {
      throw new Error("Not implemented");
    } // Determines if design is valid. Null/undefined for yes, error string for no

  }, {
    key: "validateDesign",
    value: function validateDesign(design, schema) {
      throw new Error("Not implemented");
    } // True if a design is empty and so to display the editor immediately

  }, {
    key: "isEmpty",
    value: function isEmpty(design) {
      return false;
    } // Determine if widget is auto-height, which means that a vertical height is not required.

  }, {
    key: "isAutoHeight",
    value: function isAutoHeight() {
      return false;
    } // True if designer should have a preview pane to the left

  }, {
    key: "hasDesignerPreview",
    value: function hasDesignerPreview() {
      return true;
    } // Label for the edit gear dropdown

  }, {
    key: "getEditLabel",
    value: function getEditLabel() {
      return "Edit";
    } // Creates a design element with specified options
    // options include:
    //   schema: schema to use
    //   dataSource: dataSource to use
    //   design: design 
    //   onDesignChange: function

  }, {
    key: "createDesignerElement",
    value: function createDesignerElement(options) {
      throw new Error("Not implemented");
    } // Get data for the chart asynchronously. Charts should not call this directly!
    // Instead they should use the widgetDataSource provided to the chart view.
    //   design: design of the chart
    //   schema: schema to use
    //   dataSource: data source to get data from
    //   filters: array of { table: table id, jsonql: jsonql condition with {alias} for tableAlias }
    //   callback: (error, data)

  }, {
    key: "getData",
    value: function getData(design, schema, dataSource, filters, callback) {
      throw new Error("Not implemented");
    } // Create a view element for the chart
    // Options include:
    //   schema: schema to use
    //   dataSource: dataSource to use
    //   design: design of the chart
    //   onDesignChange: when design changes
    //   data: results from queries
    //   width, height, standardWidth: size of the chart view
    //   scope: current scope of the view element
    //   onScopeChange: called when scope changes with new scope
    //   onRowClick: Called with (tableId, rowId) when item is clicked

  }, {
    key: "createViewElement",
    value: function createViewElement(options) {
      throw new Error("Not implemented");
    } // Creates the dropdown menu items of shape {label, action}
    //   design: design of the chart
    //   schema: schema to use
    //   widgetDataSource: widget data source to use 
    //   filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
    // Returns an empty list by default

  }, {
    key: "createDropdownItems",
    value: function createDropdownItems(design, schema, widgetDataSource, filters) {
      return [];
    } // Creates a table form of the chart data. Array of arrays

  }, {
    key: "createDataTable",
    value: function createDataTable(design, schema, dataSource, data, locale) {
      throw new Error("Not implemented");
    } // Get a list of table ids that can be filtered on

  }, {
    key: "getFilterableTables",
    value: function getFilterableTables(design, schema) {
      throw new Error("Not implemented");
    } // Get the chart placeholder icon. fa-XYZ or glyphicon-XYZ

  }, {
    key: "getPlaceholderIcon",
    value: function getPlaceholderIcon() {
      return "";
    }
  }]);
  return Chart;
}();