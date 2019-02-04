"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var ClickOutHandler,
    ColorPaletteComponent,
    FontSizePaletteItem,
    PropTypes,
    R,
    React,
    _,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

PropTypes = require('prop-types');
React = require('react');
R = React.createElement;
_ = require('lodash');
ClickOutHandler = require('react-onclickout'); // Palette item that allows picking a size from dropdown

module.exports = FontSizePaletteItem = function () {
  var FontSizePaletteItem =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2.default)(FontSizePaletteItem, _React$Component);

    function FontSizePaletteItem(props) {
      var _this;

      (0, _classCallCheck2.default)(this, FontSizePaletteItem);
      _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(FontSizePaletteItem).call(this, props));
      _this.handleMouseDown = _this.handleMouseDown.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.state = {
        open: false
      };
      return _this;
    }

    (0, _createClass2.default)(FontSizePaletteItem, [{
      key: "handleMouseDown",
      value: function handleMouseDown(ev) {
        boundMethodCheck(this, FontSizePaletteItem); // Don't lose focus from editor

        ev.preventDefault();
        return this.setState({
          open: !this.state.open
        });
      }
    }, {
      key: "renderSize",
      value: function renderSize(label, value) {
        var _this2 = this;

        return R('div', {
          className: "font-size-palette-menu-item",
          onMouseDown: function onMouseDown(ev) {
            ev.preventDefault();

            _this2.props.onSetSize(value);

            return _this2.setState({
              open: false
            });
          },
          key: value
        }, label);
      }
    }, {
      key: "renderSizes",
      value: function renderSizes() {
        return R('div', null, this.renderSize("Tiny", "50%"), this.renderSize("Small", "66%"), this.renderSize("Normal", "100%"), this.renderSize("Large", "150%"), this.renderSize("Huge", "200%"));
      }
    }, {
      key: "render",
      value: function render() {
        var _this3 = this;

        var popupPosition;
        popupPosition = {
          position: 'absolute',
          left: 0,
          zIndex: 1000,
          backgroundColor: "white",
          border: "solid 1px #AAA",
          borderRadius: 3
        };

        if (this.props.position === "under") {
          popupPosition['top'] = 26;
        } else {
          popupPosition['bottom'] = 26;
        }

        return R(ClickOutHandler, {
          onClickOut: function onClickOut() {
            return _this3.setState({
              open: false
            });
          }
        }, R('div', {
          className: "mwater-visualization-text-palette-item",
          onMouseDown: this.handleMouseDown,
          style: {
            position: "relative"
          }
        }, R('style', null, '.font-size-palette-menu-item {\n  color: black;\n  background-color: white;\n  text-align: left;\n  padding: 5px 15px 5px 15px;\n  cursor: pointer;\n}\n.font-size-palette-menu-item:hover {\n  background-color: #DDD;\n}'), this.state.open ? R('div', {
          style: popupPosition
        }, this.renderSizes()) : void 0, R('i', {
          className: "fa fa-arrows-v"
        })));
      }
    }]);
    return FontSizePaletteItem;
  }(React.Component);

  ;
  FontSizePaletteItem.propTypes = {
    onSetSize: PropTypes.func.isRequired,
    // Called with "125%", etc.
    position: PropTypes.string // should the popup be under or over?

  };
  FontSizePaletteItem.defaultProps = {
    position: "under"
  };
  return FontSizePaletteItem;
}.call(void 0);

ColorPaletteComponent = function () {
  var ColorPaletteComponent =
  /*#__PURE__*/
  function (_React$Component2) {
    (0, _inherits2.default)(ColorPaletteComponent, _React$Component2);

    function ColorPaletteComponent() {
      (0, _classCallCheck2.default)(this, ColorPaletteComponent);
      return (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(ColorPaletteComponent).apply(this, arguments));
    }

    (0, _createClass2.default)(ColorPaletteComponent, [{
      key: "renderColor",
      value: function renderColor(color) {
        var _this4 = this;

        return R('td', null, R('div', {
          style: {
            width: 16,
            height: 15,
            backgroundColor: color,
            margin: 1
          },
          onMouseDown: function onMouseDown(ev) {
            ev.preventDefault();
            return _this4.props.onSetColor.bind(null, color);
          }
        }));
      }
    }, {
      key: "render",
      value: function render() {
        var _this5 = this;

        var baseColors;
        baseColors = ["#FF0000", // red
        "#FFAA00", // orange
        "#FFFF00", // yellow
        "#00FF00", // green
        "#00FFFF", // cyan
        "#0000FF", // blue
        "#9900FF", // purple
        "#FF00FF" // magenta
        ];
        return R('div', {
          style: {
            padding: 5 // Grey shades

          }
        }, R('table', null, R('tbody', null, R('tr', null, _.map(_.range(0, 8), function (i) {
          return _this5.renderColor(Color({
            r: i * 255 / 7,
            g: i * 255 / 7,
            b: i * 255 / 7
          }).hex());
        })), R('tr', {
          style: {
            height: 5 // Base colors

          }
        }), R('tr', null, _.map(baseColors, function (c) {
          return _this5.renderColor(c);
        })), R('tr', {
          style: {
            height: 5
          }
        }), R('tr', null, _.map(baseColors, function (c) {
          return _this5.renderColor(Color(c).lighten(0.7).hex());
        })), R('tr', null, _.map(baseColors, function (c) {
          return _this5.renderColor(Color(c).lighten(0.5).hex());
        })), R('tr', null, _.map(baseColors, function (c) {
          return _this5.renderColor(Color(c).lighten(0.3).hex());
        })), R('tr', null, _.map(baseColors, function (c) {
          return _this5.renderColor(Color(c).darken(0.3).hex());
        })), R('tr', null, _.map(baseColors, function (c) {
          return _this5.renderColor(Color(c).darken(0.5).hex());
        })), R('tr', null, _.map(baseColors, function (c) {
          return _this5.renderColor(Color(c).darken(0.7).hex());
        })))));
      }
    }]);
    return ColorPaletteComponent;
  }(React.Component);

  ;
  ColorPaletteComponent.propTypes = {
    onSetColor: PropTypes.func.isRequired
  };
  return ColorPaletteComponent;
}.call(void 0);