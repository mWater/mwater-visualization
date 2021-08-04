"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var DragSourceComponent, PaletteItemComponent, PropTypes, R, React;
PropTypes = require('prop-types');
React = require('react');
R = React.createElement;
DragSourceComponent = require('../DragSourceComponent')("visualization-block"); // Item in a palette that can be dragged to add a widget or other item

module.exports = PaletteItemComponent = function () {
  var PaletteItemComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(PaletteItemComponent, _React$Component);

    var _super = _createSuper(PaletteItemComponent);

    function PaletteItemComponent() {
      (0, _classCallCheck2["default"])(this, PaletteItemComponent);
      return _super.apply(this, arguments);
    }

    (0, _createClass2["default"])(PaletteItemComponent, [{
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