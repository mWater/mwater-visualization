"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var HoverComponent,
    React,
    ReactDOM,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

React = require('react');
ReactDOM = require('react-dom');

module.exports = HoverComponent = /*#__PURE__*/function (_React$Component) {
  (0, _inherits2["default"])(HoverComponent, _React$Component);

  var _super = _createSuper(HoverComponent);

  function HoverComponent(props) {
    var _this;

    (0, _classCallCheck2["default"])(this, HoverComponent);
    _this = _super.call(this, props);
    _this.onOver = _this.onOver.bind((0, _assertThisInitialized2["default"])(_this));
    _this.onOut = _this.onOut.bind((0, _assertThisInitialized2["default"])(_this));
    _this.state = {
      hovered: false
    };
    return _this;
  }

  (0, _createClass2["default"])(HoverComponent, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      ReactDOM.findDOMNode(this.main).addEventListener("mouseover", this.onOver);
      return ReactDOM.findDOMNode(this.main).addEventListener("mouseout", this.onOut);
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      ReactDOM.findDOMNode(this.main).removeEventListener("mouseover", this.onOver);
      return ReactDOM.findDOMNode(this.main).removeEventListener("mouseout", this.onOut);
    }
  }, {
    key: "onOver",
    value: function onOver() {
      boundMethodCheck(this, HoverComponent);
      return this.setState({
        hovered: true
      });
    }
  }, {
    key: "onOut",
    value: function onOut() {
      boundMethodCheck(this, HoverComponent);
      return this.setState({
        hovered: false
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      return React.cloneElement(React.Children.only(this.props.children), {
        ref: function ref(c) {
          return _this2.main = c;
        },
        hovered: this.state.hovered
      });
    }
  }]);
  return HoverComponent;
}(React.Component);