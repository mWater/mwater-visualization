"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var BlocksLayoutManager, LayoutManager, R, React, _, uuid;

_ = require('lodash');
React = require('react');
R = React.createElement;
uuid = require('uuid');
LayoutManager = require('../LayoutManager');

module.exports = BlocksLayoutManager =
/*#__PURE__*/
function (_LayoutManager) {
  (0, _inherits2.default)(BlocksLayoutManager, _LayoutManager);

  function BlocksLayoutManager() {
    (0, _classCallCheck2.default)(this, BlocksLayoutManager);
    return (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(BlocksLayoutManager).apply(this, arguments));
  }

  (0, _createClass2.default)(BlocksLayoutManager, [{
    key: "renderLayout",
    // Renders the layout as a react element
    // options:
    //  width: width of layout (ignored here) TODO use for printing? standardWidth?
    //  items: opaque items object that layout manager understands
    //  onItemsChange: Called when items changes
    //  renderWidget: called with ({ id:, type:, design:, onDesignChange:, width:, height:  })
    //  style: style to use for layout. null for default
    //  disableMaps: true to disable maps
    //  clipboard: clipboard contents
    //  onClipboardChange: called when clipboard is changed
    //  cantPasteMesssage: message to display if clipboard can't be pasted into current dashboard
    value: function renderLayout(options) {
      var BlocksDisplayComponent;
      BlocksDisplayComponent = require('./BlocksDisplayComponent');
      return R(BlocksDisplayComponent, {
        items: options.items || {
          id: "root",
          type: "root",
          blocks: []
        },
        onItemsChange: options.onItemsChange,
        style: options.style,
        renderWidget: options.renderWidget,
        disableMaps: options.disableMaps,
        clipboard: options.clipboard,
        onClipboardChange: options.onClipboardChange,
        cantPasteMessage: options.cantPasteMessage
      });
    } // Tests if dashboard has any items

  }, {
    key: "isEmpty",
    value: function isEmpty(items) {
      var ref;
      return !items || ((ref = items.blocks) != null ? ref.length : void 0) === 0;
    } // Gets { type, design } of a widget

  }, {
    key: "getWidgetTypeAndDesign",
    value: function getWidgetTypeAndDesign(items, widgetId) {
      var block, i, len, ref, value;

      if (items.type === "widget" && items.id === widgetId) {
        return {
          type: items.widgetType,
          design: items.design
        };
      }

      if (items.blocks) {
        ref = items.blocks;

        for (i = 0, len = ref.length; i < len; i++) {
          block = ref[i];
          value = this.getWidgetTypeAndDesign(block, widgetId);

          if (value) {
            return value;
          }
        }
      }

      return null;
    } // Gets all widgets in items as array of { id, type, design }

  }, {
    key: "getAllWidgets",
    value: function getAllWidgets(items) {
      var _this = this;

      if (items.type === "widget") {
        return [{
          id: items.id,
          type: items.widgetType,
          design: items.design
        }];
      }

      if (items.blocks) {
        return _.flatten(_.map(items.blocks, function (item) {
          return _this.getAllWidgets(item);
        }));
      }

      return [];
    } // Add a widget, returning new items

  }, {
    key: "addWidget",
    value: function addWidget(items, widgetType, widgetDesign) {
      // Add to root block
      items = items || {
        type: "root",
        id: "root",
        blocks: []
      };
      items.blocks.push({
        type: "widget",
        id: uuid(),
        widgetType: widgetType,
        design: widgetDesign,
        aspectRatio: 1.4
      });
      return items;
    }
  }]);
  return BlocksLayoutManager;
}(LayoutManager);