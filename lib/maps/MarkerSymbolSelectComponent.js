"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var MarkerSymbolSelectComponent, PropTypes, R, React, ReactSelect, _, mapSymbols;

PropTypes = require('prop-types');
_ = require('lodash');
React = require('react');
R = React.createElement;
ReactSelect = require('react-select')["default"];
mapSymbols = require('./mapSymbols').mapSymbols; // Allows selecting of map marker symbol

module.exports = MarkerSymbolSelectComponent = function () {
  var MarkerSymbolSelectComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(MarkerSymbolSelectComponent, _React$Component);

    var _super = _createSuper(MarkerSymbolSelectComponent);

    function MarkerSymbolSelectComponent() {
      (0, _classCallCheck2["default"])(this, MarkerSymbolSelectComponent);
      return _super.apply(this, arguments);
    }

    (0, _createClass2["default"])(MarkerSymbolSelectComponent, [{
      key: "render",
      value: function render() {
        var _this = this;

        var optionRenderer, options; // Create options

        options = mapSymbols;

        optionRenderer = function optionRenderer(option) {
          return R('span', null, R('i', {
            className: "fa fa-".concat(option.value.substr(13))
          }), " ".concat(option.label));
        };

        return R('div', {
          className: "form-group"
        }, R('label', {
          className: "text-muted"
        }, R('span', {
          className: "fa fa-star"
        }), " ", "Symbol"), R(ReactSelect, {
          placeholder: "Circle",
          value: _.findWhere(options, {
            value: this.props.symbol
          }) || null,
          options: options,
          formatOptionLabel: optionRenderer,
          isClearable: true,
          onChange: function onChange(opt) {
            return _this.props.onChange((opt != null ? opt.value : void 0) || null);
          }
        }));
      }
    }]);
    return MarkerSymbolSelectComponent;
  }(React.Component);

  ;
  MarkerSymbolSelectComponent.propTypes = {
    symbol: PropTypes.string,
    onChange: PropTypes.func.isRequired
  };
  return MarkerSymbolSelectComponent;
}.call(void 0);