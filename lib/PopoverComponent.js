"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var $, PopoverComponent, PropTypes, React, ReactDOM, _;

_ = require('lodash');
$ = require('jquery');
PropTypes = require('prop-types');
React = require('react');
ReactDOM = require('react-dom'); // Wraps a child with an optional popover

module.exports = PopoverComponent = function () {
  var PopoverComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(PopoverComponent, _React$Component);

    var _super = _createSuper(PopoverComponent);

    function PopoverComponent() {
      (0, _classCallCheck2["default"])(this, PopoverComponent);
      return _super.apply(this, arguments);
    }

    (0, _createClass2["default"])(PopoverComponent, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        return this.updatePopover(this.props, null);
      }
    }, {
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        return this.updatePopover(null, this.props);
      }
    }, {
      key: "componentDidUpdate",
      value: function componentDidUpdate(prevProps) {
        if (!_.isEqual(prevProps.content, this.props.content) || prevProps.visible !== this.props.visible || prevProps.placement !== this.props.placement) {
          return this.updatePopover(this.props, prevProps);
        }
      }
    }, {
      key: "updatePopover",
      value: function updatePopover(props, oldProps) {
        var _this = this;

        var div; // Destroy old popover

        if (oldProps && oldProps.visible) {
          $(ReactDOM.findDOMNode(this)).popover("destroy");
        }

        if (props && props.visible) {
          div = document.createElement("div");
          return ReactDOM.render(this.props.content, div, function () {
            $(ReactDOM.findDOMNode(_this)).popover({
              content: function content() {
                return $(div);
              },
              html: true,
              trigger: "manual",
              placement: _this.props.placement
            });
            return $(ReactDOM.findDOMNode(_this)).popover("show");
          });
        }
      }
    }, {
      key: "render",
      value: function render() {
        return React.Children.only(this.props.children);
      }
    }]);
    return PopoverComponent;
  }(React.Component);

  ;
  PopoverComponent.propTypes = {
    content: PropTypes.node.isRequired,
    // contents of popover
    placement: PropTypes.string,
    // See http://getbootstrap.com/javascript/#popovers
    visible: PropTypes.bool.isRequired
  };
  return PopoverComponent;
}.call(void 0);