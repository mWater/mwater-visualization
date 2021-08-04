"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var GridLayoutComponent, LegoLayoutEngine, PropTypes, R, React, WidgetContainerComponent, _;

PropTypes = require('prop-types');
_ = require('lodash');
React = require('react');
R = React.createElement;
WidgetContainerComponent = require('./WidgetContainerComponent');
LegoLayoutEngine = require('./LegoLayoutEngine');

module.exports = GridLayoutComponent = function () {
  var GridLayoutComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(GridLayoutComponent, _React$Component);

    var _super = _createSuper(GridLayoutComponent);

    function GridLayoutComponent() {
      (0, _classCallCheck2["default"])(this, GridLayoutComponent);
      return _super.apply(this, arguments);
    }

    (0, _createClass2["default"])(GridLayoutComponent, [{
      key: "renderPageBreaks",
      value: function renderPageBreaks(layoutEngine, layouts) {
        var elems, height, i, j, number, pageHeight, ref; // Get height

        height = layoutEngine.calculateHeight(layouts); // Page breaks are 8.5x11 with 0.5" margin 

        pageHeight = this.props.width / 7.5 * 10;
        number = Math.floor(height / pageHeight);
        elems = [];

        if (number > 0) {
          for (i = j = 1, ref = number; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
            elems.push(R('div', {
              className: "mwater-visualization-page-break",
              key: "page".concat(i),
              style: {
                position: "absolute",
                top: i * pageHeight
              }
            }));
          }
        }

        return elems;
      }
    }, {
      key: "render",
      value: function render() {
        var layoutEngine, layouts, style; // Create layout engine

        layoutEngine = new LegoLayoutEngine(this.props.width, 24); // Get layouts indexed by id

        layouts = _.mapValues(this.props.items, "layout");
        style = {
          height: "100%",
          position: "relative"
        }; // Render widget container

        return R('div', {
          style: style
        }, R(WidgetContainerComponent, {
          layoutEngine: layoutEngine,
          items: this.props.items,
          onItemsChange: this.props.onItemsChange,
          renderWidget: this.props.renderWidget,
          width: this.props.width
        }), this.renderPageBreaks(layoutEngine, layouts));
      }
    }]);
    return GridLayoutComponent;
  }(React.Component);

  ;
  GridLayoutComponent.propTypes = {
    width: PropTypes.number.isRequired,
    items: PropTypes.any,
    onItemsChange: PropTypes.func,
    renderWidget: PropTypes.func.isRequired
  };
  return GridLayoutComponent;
}.call(void 0);