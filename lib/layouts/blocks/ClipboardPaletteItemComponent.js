"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var ClipboardPaletteItemComponent,
    DragSourceComponent,
    DropTarget,
    PropTypes,
    R,
    React,
    _,
    blockTargetSpec,
    collectTarget,
    uuid,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

_ = require('lodash');
PropTypes = require('prop-types');
React = require('react');
R = React.createElement;
uuid = require('uuid');
DragSourceComponent = require('../DragSourceComponent')("block");
DropTarget = require('react-dnd').DropTarget;

ClipboardPaletteItemComponent = function () {
  // Clipboard item in a palette that has special properties
  var ClipboardPaletteItemComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2["default"])(ClipboardPaletteItemComponent, _React$Component);

    function ClipboardPaletteItemComponent() {
      var _this;

      (0, _classCallCheck2["default"])(this, ClipboardPaletteItemComponent);
      _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(ClipboardPaletteItemComponent).apply(this, arguments));
      _this.createItem = _this.createItem.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleClear = _this.handleClear.bind((0, _assertThisInitialized2["default"])(_this));
      return _this;
    }

    (0, _createClass2["default"])(ClipboardPaletteItemComponent, [{
      key: "createItem",
      value: function createItem() {
        boundMethodCheck(this, ClipboardPaletteItemComponent);
        return {
          // Add unique id
          block: _.extend({}, this.props.clipboard, {
            id: uuid()
          })
        };
      }
    }, {
      key: "handleClear",
      value: function handleClear() {
        boundMethodCheck(this, ClipboardPaletteItemComponent);

        if (confirm("Clear clipboard?")) {
          return this.props.onClipboardChange(null);
        }
      }
    }, {
      key: "render",
      value: function render() {
        var elem;
        elem = this.props.connectDropTarget(R('div', {
          className: this.props.clipboard && !this.props.cantPasteMessage ? "mwater-visualization-palette-item" : "mwater-visualization-palette-item disabled",
          style: this.props.isOver ? {
            backgroundColor: "#2485dd"
          } : void 0
        }, R('div', {
          className: "title",
          key: "title"
        }, this.props.isOver ? R('i', {
          className: "fa fa-clone"
        }) : R('i', {
          className: "fa fa-clipboard"
        })), R('div', {
          className: "subtitle",
          key: "subtitle"
        }, this.props.isOver ? "Copy" : "Clipboard"), this.props.cantPasteMessage ? R('div', {
          className: "tooltiptext"
        }, this.props.cantPasteMessage) : R('div', {
          className: "tooltiptext"
        }, "Clipboard allows copying widgets for pasting on this dashboard or another dashboard. Drag a widget on to this clipboard to copy it."), this.props.clipboard ? R('div', {
          className: "clearclipboard",
          onClick: this.handleClear
        }, R('i', {
          className: "fa fa-trash-o"
        })) : void 0));

        if (this.props.clipboard && !this.props.cantPasteMessage) {
          elem = R(DragSourceComponent, {
            createDragItem: this.createItem
          }, elem);
        }

        return elem;
      }
    }]);
    return ClipboardPaletteItemComponent;
  }(React.Component);

  ;
  ClipboardPaletteItemComponent.propTypes = {
    clipboard: PropTypes.object,
    onClipboardChange: PropTypes.func,
    cantPasteMessage: PropTypes.string // Set if can't paste current contents (usually because missing extra tables)

  };
  return ClipboardPaletteItemComponent;
}.call(void 0);

blockTargetSpec = {
  canDrop: function canDrop(props, monitor) {
    return true;
  },
  drop: function drop(props, monitor, component) {
    // Check that not from a nested one
    if (monitor.didDrop()) {
      return;
    }

    props.onClipboardChange(monitor.getItem().block);
  }
};

collectTarget = function collectTarget(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver({
      shallow: true
    }),
    canDrop: monitor.canDrop()
  };
};

module.exports = _.flow(DropTarget("block", blockTargetSpec, collectTarget))(ClipboardPaletteItemComponent);