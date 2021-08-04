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

var ClickOutHandler,
    ColorComponent,
    PropTypes,
    R,
    React,
    SketchPicker,
    SwatchesPicker,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

PropTypes = require('prop-types');
React = require('react');
R = React.createElement;
ClickOutHandler = require('react-onclickout');
SketchPicker = require("react-color").SketchPicker;
SwatchesPicker = require('react-color').SwatchesPicker; // Simple color well with popup

module.exports = ColorComponent = function () {
  var ColorComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(ColorComponent, _React$Component);

    var _super = _createSuper(ColorComponent);

    function ColorComponent(props) {
      var _this;

      (0, _classCallCheck2["default"])(this, ColorComponent);
      _this = _super.call(this, props);
      _this.handleClick = _this.handleClick.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleClose = _this.handleClose.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleReset = _this.handleReset.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleTransparent = _this.handleTransparent.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleAdvanced = _this.handleAdvanced.bind((0, _assertThisInitialized2["default"])(_this));
      _this.state = {
        open: false,
        advanced: false
      };
      return _this;
    }

    (0, _createClass2["default"])(ColorComponent, [{
      key: "handleClick",
      value: function handleClick() {
        boundMethodCheck(this, ColorComponent);
        return this.setState({
          open: !this.state.open,
          advanced: false
        });
      }
    }, {
      key: "handleClose",
      value: function handleClose(color) {
        boundMethodCheck(this, ColorComponent);
        return this.props.onChange(color.hex);
      }
    }, {
      key: "handleReset",
      value: function handleReset() {
        boundMethodCheck(this, ColorComponent);
        this.setState({
          open: false
        });
        return this.props.onChange(null);
      }
    }, {
      key: "handleTransparent",
      value: function handleTransparent() {
        boundMethodCheck(this, ColorComponent);
        this.setState({
          open: false
        });
        return this.props.onChange("transparent");
      }
    }, {
      key: "handleAdvanced",
      value: function handleAdvanced() {
        boundMethodCheck(this, ColorComponent);
        return this.setState({
          advanced: !this.state.advanced
        });
      }
    }, {
      key: "render",
      value: function render() {
        var _this2 = this;

        var popupPosition, style;
        style = {
          height: 20,
          width: 20,
          border: "solid 2px #888",
          borderRadius: 4,
          backgroundColor: this.props.color,
          cursor: "pointer",
          display: "inline-block"
        };

        if (!this.props.color) {
          // http://lea.verou.me/css3patterns/#diagonal-stripes
          style.backgroundColor = "#AAA";
          style.backgroundImage = "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,.7) 2px, rgba(255,255,255,.7) 4px)";
        }

        popupPosition = {
          position: 'absolute',
          top: 0,
          left: 30,
          zIndex: 1000,
          backgroundColor: "white",
          border: "solid 1px #DDD",
          borderRadius: 3
        };
        return R('div', {
          style: {
            position: "relative",
            display: "inline-block"
          }
        }, R('div', {
          style: style,
          onClick: this.handleClick
        }), this.state.open ? React.createElement(ClickOutHandler, {
          onClickOut: function onClickOut() {
            return _this2.setState({
              open: false
            });
          }
        }, R('div', {
          style: popupPosition
        }, R('button', {
          type: "button",
          className: "btn btn-link btn-sm",
          onClick: this.handleReset
        }, R('i', {
          className: "fa fa-undo" // R 'button', type: "button", className: "btn btn-link btn-sm", onClick: @handleTransparent,
          //   R 'i', className: "fa fa-ban"
          //   " None"

        }), " Reset Color"), R('button', {
          type: "button",
          className: "btn btn-link btn-sm",
          onClick: this.handleAdvanced
        }, this.state.advanced ? "Basic" : "Advanced"), this.state.advanced ? React.createElement(SketchPicker, {
          color: this.props.color || void 0,
          disableAlpha: true,
          onChangeComplete: this.handleClose
        }) : React.createElement(SwatchesPicker, {
          color: this.props.color || void 0,
          onChangeComplete: this.handleClose
        }))) : void 0);
      }
    }]);
    return ColorComponent;
  }(React.Component);

  ;
  ColorComponent.propTypes = {
    color: PropTypes.string,
    onChange: PropTypes.func
  };
  return ColorComponent;
}.call(void 0);