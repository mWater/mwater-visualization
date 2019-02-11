"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

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
  var DragSourceComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2.default)(DragSourceComponent, _React$Component);

    function DragSourceComponent() {
      (0, _classCallCheck2.default)(this, DragSourceComponent);
      return (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(DragSourceComponent).apply(this, arguments));
    }

    (0, _createClass2.default)(DragSourceComponent, [{
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