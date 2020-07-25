"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var LegendGroup, LegendItem, PropTypes, R, React, _;

PropTypes = require('prop-types');
React = require('react');
R = React.createElement;
_ = require('lodash');

module.exports = LegendGroup = function () {
  var LegendGroup = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(LegendGroup, _React$Component);

    var _super = _createSuper(LegendGroup);

    function LegendGroup() {
      (0, _classCallCheck2["default"])(this, LegendGroup);
      return _super.apply(this, arguments);
    }

    (0, _createClass2["default"])(LegendGroup, [{
      key: "render",
      value: function render() {
        var _this = this;

        return R('div', {
          style: {
            marginBottom: 5
          }
        }, React.createElement(LegendItem, {
          hasChildren: this.props.items.length > 0,
          symbol: this.props.symbol,
          markerSize: this.props.markerSize,
          color: this.props.defaultColor,
          name: this.props.name,
          key: this.props.name,
          radiusLayer: this.props.radiusLayer
        }), _.map(this.props.items, function (item) {
          return React.createElement(LegendItem, {
            isChild: true,
            symbol: _this.props.symbol,
            markerSize: _this.props.markerSize,
            color: item.color,
            name: item.name,
            key: item.name,
            radiusLayer: _this.props.radiusLayer
          });
        }));
      }
    }]);
    return LegendGroup;
  }(React.Component);

  ;
  LegendGroup.propTypes = {
    items: PropTypes.array,
    radiusLayer: PropTypes.bool,
    defaultColor: PropTypes.string,
    name: PropTypes.string,
    symbol: PropTypes.string,
    markerSize: PropTypes.number
  };
  LegendGroup.defaultProps = {
    items: [],
    radiusLayer: false,
    symbol: null
  };
  return LegendGroup;
}.call(void 0);

LegendItem = function () {
  var LegendItem = /*#__PURE__*/function (_React$Component2) {
    (0, _inherits2["default"])(LegendItem, _React$Component2);

    var _super2 = _createSuper(LegendItem);

    function LegendItem() {
      (0, _classCallCheck2["default"])(this, LegendItem);
      return _super2.apply(this, arguments);
    }

    (0, _createClass2["default"])(LegendItem, [{
      key: "renderSymbol",
      value: function renderSymbol() {
        var className, symbolStyle;
        symbolStyle = {
          color: this.props.color,
          display: 'inline-block',
          marginRight: 4,
          fontSize: this.props.markerSize
        };
        className = this.props.symbol.replace('font-awesome/', 'fa fa-');
        return R('span', {
          className: className,
          style: symbolStyle
        }, "");
      }
    }, {
      key: "renderColorIndicator",
      value: function renderColorIndicator() {
        var indicatorStyle;
        indicatorStyle = {
          height: 10,
          width: 10,
          backgroundColor: this.props.color,
          display: 'inline-block',
          marginRight: 4
        };

        if (this.props.radiusLayer) {
          indicatorStyle['borderRadius'] = 5;
        }

        return R('span', {
          style: indicatorStyle
        }, "");
      }
    }, {
      key: "renderIndicator",
      value: function renderIndicator() {
        if (this.props.symbol) {
          return this.renderSymbol();
        } else {
          return this.renderColorIndicator();
        }
      }
    }, {
      key: "render",
      value: function render() {
        var containerStyle, titleStyle;
        titleStyle = {};

        if (!this.props.isChild) {
          titleStyle = {
            margin: 2,
            fontWeight: 'bold'
          };
        }

        containerStyle = {
          paddingLeft: this.props.isChild ? 5 : 0
        };
        return R('div', {
          style: containerStyle
        }, !this.props.hasChildren ? this.renderIndicator() : void 0, R('span', {
          style: titleStyle
        }, this.props.name));
      }
    }]);
    return LegendItem;
  }(React.Component);

  ;
  LegendItem.propTypes = {
    color: PropTypes.string,
    name: PropTypes.string,
    radiusLayer: PropTypes.bool,
    symbol: PropTypes.string,
    markerSize: PropTypes.number,
    hasChildren: PropTypes.bool,
    isChild: PropTypes.bool
  };
  LegendItem.defaultProps = {
    radiusLayer: false,
    hasChildren: false,
    isChild: false
  };
  return LegendItem;
}.call(void 0);