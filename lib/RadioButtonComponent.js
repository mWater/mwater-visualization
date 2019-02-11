"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var PropTypes,
    R,
    RadioButtonComponent,
    React,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

PropTypes = require('prop-types');
React = require('react');
R = React.createElement; // Pretty radio button component

module.exports = RadioButtonComponent = function () {
  var RadioButtonComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2.default)(RadioButtonComponent, _React$Component);

    function RadioButtonComponent() {
      var _this;

      (0, _classCallCheck2.default)(this, RadioButtonComponent);
      _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(RadioButtonComponent).apply(this, arguments));
      _this.handleClick = _this.handleClick.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      return _this;
    }

    (0, _createClass2.default)(RadioButtonComponent, [{
      key: "handleClick",
      value: function handleClick() {
        boundMethodCheck(this, RadioButtonComponent);

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
          className: this.props.checked ? "mwater-visualization-radio checked" : "mwater-visualization-radio",
          onClick: this.handleClick
        }, this.props.children);
      }
    }]);
    return RadioButtonComponent;
  }(React.Component);

  ;
  RadioButtonComponent.propTypes = {
    checked: PropTypes.bool,
    // True to check
    onClick: PropTypes.func,
    // Called when clicked
    onChange: PropTypes.func // Called with new value

  };
  return RadioButtonComponent;
}.call(void 0);