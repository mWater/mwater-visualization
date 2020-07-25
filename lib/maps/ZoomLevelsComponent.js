"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var NumberInputComponent, PropTypes, R, React, ZoomLevelsComponent, _;

PropTypes = require('prop-types');
_ = require('lodash');
React = require('react');
R = React.createElement;
NumberInputComponent = require('react-library/lib/NumberInputComponent'); // Zoom level min and max control

module.exports = ZoomLevelsComponent = function () {
  var ZoomLevelsComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(ZoomLevelsComponent, _React$Component);

    var _super = _createSuper(ZoomLevelsComponent);

    function ZoomLevelsComponent(props) {
      var _this;

      (0, _classCallCheck2["default"])(this, ZoomLevelsComponent);
      _this = _super.call(this, props);
      _this.state = {
        expanded: false
      };
      return _this;
    }

    (0, _createClass2["default"])(ZoomLevelsComponent, [{
      key: "render",
      value: function render() {
        var _this2 = this;

        if (!this.state.expanded) {
          return R('div', null, R('a', {
            className: "btn btn-link btn-xs",
            onClick: function onClick() {
              return _this2.setState({
                expanded: true
              });
            }
          }, "Advanced options..."));
        }

        return R('div', {
          className: "form-group"
        }, R('label', {
          className: "text-muted"
        }, "Advanced"), R('div', {
          key: "min"
        }, R('span', {
          className: "text-muted"
        }, "Minimum Zoom Level:"), " ", R(NumberInputComponent, {
          small: true,
          style: {
            display: "inline-block"
          },
          placeholder: "None",
          value: this.props.design.minZoom,
          onChange: function onChange(v) {
            return _this2.props.onDesignChange(_.extend({}, _this2.props.design, {
              minZoom: v
            }));
          }
        })), R('div', {
          key: "max"
        }, R('span', {
          className: "text-muted"
        }, "Maximum Zoom Level: "), " ", R(NumberInputComponent, {
          small: true,
          style: {
            display: "inline-block"
          },
          placeholder: "None",
          value: this.props.design.maxZoom,
          onChange: function onChange(v) {
            return _this2.props.onDesignChange(_.extend({}, _this2.props.design, {
              maxZoom: v
            }));
          }
        })));
      }
    }]);
    return ZoomLevelsComponent;
  }(React.Component);

  ;
  ZoomLevelsComponent.propTypes = {
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func.isRequired
  };
  return ZoomLevelsComponent;
}.call(void 0);