"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

// Responsible for laying out items, rendering widgets and holding them in a data structure that is layout manager specific
var LayoutManager;

module.exports = LayoutManager =
/*#__PURE__*/
function () {
  function LayoutManager() {
    (0, _classCallCheck2["default"])(this, LayoutManager);
  }

  (0, _createClass2["default"])(LayoutManager, [{
    key: "renderLayout",
    // Renders the layout as a react element
    // options:
    //  width: width of layout
    //  items: opaque items object that layout manager understands
    //  onItemsChange: Called when items changes
    //  renderWidget: called with ({ id:, type:, design:, onDesignChange:, width:, height:  })
    //  style: style to use for layout. null for default
    //  disableMaps: true to disable maps
    value: function renderLayout(options) {
      return null;
    } // Tests if dashboard has any items

  }, {
    key: "isEmpty",
    value: function isEmpty(items) {
      return true;
    } // Gets { type, design } of a widget

  }, {
    key: "getWidgetTypeAndDesign",
    value: function getWidgetTypeAndDesign(items, widgetId) {
      return null;
    } // Gets all widgets in items as array of { id, type, design }

  }, {
    key: "getAllWidgets",
    value: function getAllWidgets(items) {
      return [];
    }
  }], [{
    key: "createLayoutManager",
    value: function createLayoutManager(type) {
      var BlocksLayoutManager, GridLayoutManager; // Default is old grid type

      type = type || "grid";

      switch (type) {
        case "grid":
          // Old one
          GridLayoutManager = require('./grid/GridLayoutManager');
          return new GridLayoutManager();

        case "blocks":
          // New one
          BlocksLayoutManager = require('./blocks/BlocksLayoutManager');
          return new BlocksLayoutManager();

        default:
          throw new Error("Unknown layout manager type ".concat(type));
      }

      return {
        addWidget: function addWidget(items, widgetType, widgetDesign) {
          throw new Error("Not implemented");
        }
      };
    }
  }]);
  return LayoutManager;
}();