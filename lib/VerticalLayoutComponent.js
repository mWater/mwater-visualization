"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var $, PropTypes, R, React, ReactDOM, VerticalLayoutComponent, _;

$ = require('jquery');
PropTypes = require('prop-types');
React = require('react');
ReactDOM = require('react-dom');
R = React.createElement;
_ = require('lodash'); // Lays out divs vertically, allowing fractional allocation combined with auto-sized ones
// Children must all have keys
// Children will be cloned with height: prop set in case of fractional ones

module.exports = VerticalLayoutComponent = function () {
  var VerticalLayoutComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2["default"])(VerticalLayoutComponent, _React$Component);

    function VerticalLayoutComponent(props) {
      var _this;

      (0, _classCallCheck2["default"])(this, VerticalLayoutComponent);
      _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(VerticalLayoutComponent).call(this, props));
      _this.state = {
        availableHeight: 0
      };
      _this.childRefs = {};
      return _this;
    }

    (0, _createClass2["default"])(VerticalLayoutComponent, [{
      key: "componentWillReceiveProps",
      value: function componentWillReceiveProps(nextProps) {
        if (nextProps.height !== this.props.height || !_.isEqual(nextProps.relativeHeights, this.props.relativeHeights)) {
          return this.recalculateSize(nextProps);
        }
      }
    }, {
      key: "componentDidMount",
      value: function componentDidMount() {
        return this.recalculateSize(this.props);
      }
    }, {
      key: "recalculateSize",
      value: function recalculateSize(props) {
        var availableHeight, child, i, len, node, ref; // Calculate available height 

        availableHeight = props.height;
        ref = props.children;

        for (i = 0, len = ref.length; i < len; i++) {
          child = ref[i];

          if (!child) {
            continue;
          }

          if (props.relativeHeights[child.key]) {
            continue;
          }

          node = ReactDOM.findDOMNode(this.childRefs[child.key]);
          availableHeight -= $(node).outerHeight();
        }

        return this.setState({
          availableHeight: availableHeight
        });
      } // Get a subcomponent

    }, {
      key: "getComponent",
      value: function getComponent(key) {
        return this.childRefs[key];
      }
    }, {
      key: "render",
      value: function render() {
        var _this2 = this;

        // Calculate scaling
        return R('div', {
          style: {
            height: this.props.height
          }
        }, React.Children.map(this.props.children, function (child) {
          var height;

          if (!child) {
            return;
          } // If variable height


          if (child.key && _this2.props.relativeHeights[child.key]) {
            // If available height is known, render variable
            if (_this2.state.availableHeight) {
              height = _this2.state.availableHeight * _this2.props.relativeHeights[child.key];
              return R('div', {
                style: {
                  height: height,
                  position: "relative"
                }
              }, R('div', {
                style: {
                  height: height
                },
                ref: function ref(c) {
                  return _this2.childRefs[child.key] = c;
                }
              }, React.cloneElement(child, {
                height: height
              })));
            } // Otherwise don't show until available height is known


            return null;
          }

          return R('div', {
            ref: function ref(c) {
              return _this2.childRefs[child.key] = c;
            }
          }, child);
        }));
      }
    }]);
    return VerticalLayoutComponent;
  }(React.Component);

  ;
  VerticalLayoutComponent.propTypes = {
    height: PropTypes.number.isRequired,
    relativeHeights: PropTypes.object.isRequired // Fraction to allocate for fractional heights. Should total 1.0. Keyed by key

  };
  return VerticalLayoutComponent;
}.call(void 0);