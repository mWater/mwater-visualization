"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var DragSource, DragSourceComponent, PropTypes, R, React, _, collectSource, sourceSpec;

PropTypes = require('prop-types');
_ = require('lodash');
React = require('react');
R = React.createElement;
DragSource = require('react-dnd').DragSource; // Draggable sample that becomes a block when dragged on

sourceSpec = {
  beginDrag: function beginDrag(props, monitor, component) {
    return props.createDragItem();
  }
};

collectSource = function collectSource(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview()
  };
};

DragSourceComponent = function () {
  // Simple drag source that runs a function to get the drag item.
  var DragSourceComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(DragSourceComponent, _React$Component);

    var _super = _createSuper(DragSourceComponent);

    function DragSourceComponent() {
      (0, _classCallCheck2["default"])(this, DragSourceComponent);
      return _super.apply(this, arguments);
    }

    (0, _createClass2["default"])(DragSourceComponent, [{
      key: "render",
      value: function render() {
        return this.props.connectDragPreview(this.props.connectDragSource(this.props.children));
      }
    }]);
    return DragSourceComponent;
  }(React.Component);

  ;
  DragSourceComponent.propTypes = {
    createDragItem: PropTypes.func.isRequired,
    // Created DnD item when dragged.
    connectDragSource: PropTypes.func.isRequired,
    // the drag source connector, supplied by React DND
    connectDragPreview: PropTypes.func.isRequired // the drag preview connector, supplied by React DND

  };
  return DragSourceComponent;
}.call(void 0);

module.exports = function (type) {
  return DragSource(type, sourceSpec, collectSource)(DragSourceComponent);
};