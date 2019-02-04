"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var DragSourceComponent, PaletteItemComponent, PropTypes, R, React;
PropTypes = require('prop-types');
React = require('react');
R = React.createElement;
DragSourceComponent = require('../DragSourceComponent')("block-move"); // Item in a palette that can be dragged to add a widget or other item

module.exports = PaletteItemComponent = function () {
  var PaletteItemComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2.default)(PaletteItemComponent, _React$Component);

    function PaletteItemComponent() {
      (0, _classCallCheck2.default)(this, PaletteItemComponent);
      return (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(PaletteItemComponent).apply(this, arguments));
    }

    (0, _createClass2.default)(PaletteItemComponent, [{
      key: "render",
      value: function render() {
        return R(DragSourceComponent, {
          createDragItem: this.props.createItem
        }, R('div', {
          className: "mwater-visualization-palette-item"
        }, R('div', {
          className: "title",
          key: "title"
        }, this.props.title), R('div', {
          className: "subtitle",
          key: "subtitle"
        }, this.props.subtitle)));
      }
    }]);
    return PaletteItemComponent;
  }(React.Component);

  ;
  PaletteItemComponent.propTypes = {
    createItem: PropTypes.func.isRequired,
    // Create the drag item
    title: PropTypes.any,
    subtitle: PropTypes.any
  };
  return PaletteItemComponent;
}.call(void 0);