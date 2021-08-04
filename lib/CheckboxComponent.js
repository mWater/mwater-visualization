"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var CheckboxComponent,
    PropTypes,
    R,
    React,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

PropTypes = require('prop-types');
React = require('react');
R = React.createElement; // Pretty checkbox component

module.exports = CheckboxComponent = function () {
  var CheckboxComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(CheckboxComponent, _React$Component);

    var _super = _createSuper(CheckboxComponent);

    function CheckboxComponent() {
      var _this;

      (0, _classCallCheck2["default"])(this, CheckboxComponent);
      _this = _super.apply(this, arguments);
      _this.handleClick = _this.handleClick.bind((0, _assertThisInitialized2["default"])(_this));
      return _this;
    }

    (0, _createClass2["default"])(CheckboxComponent, [{
      key: "handleClick",
      value: function handleClick() {
        boundMethodCheck(this, CheckboxComponent);

        if (this.props.onChange) {
          this.props.onChange(!this.props.checked);
        }

        if (this.props.onClick) {
          return this.props.onClick();
        }
      }
    }, {
      key: "render",
      value: function render() {
        return R('div', {
          className: this.props.checked ? "mwater-visualization-checkbox checked" : "mwater-visualization-checkbox",
          onClick: this.handleClick
        }, this.props.children);
      }
    }]);
    return CheckboxComponent;
  }(React.Component);

  ;
  CheckboxComponent.propTypes = {
    checked: PropTypes.bool,
    // True to check
    onClick: PropTypes.func,
    // Called when clicked
    onChange: PropTypes.func // Called with new value

  };
  return CheckboxComponent;
}.call(void 0);