"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var ColorPaletteCollectionComponent,
    ColorPaletteComponent,
    ColorSchemeFactory,
    PropTypes,
    R,
    React,
    _,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

_ = require('lodash');
PropTypes = require('prop-types');
React = require('react');
R = React.createElement;
ColorSchemeFactory = require('../ColorSchemeFactory');

module.exports = ColorPaletteCollectionComponent = function () {
  var ColorPaletteCollectionComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2["default"])(ColorPaletteCollectionComponent, _React$Component);

    function ColorPaletteCollectionComponent() {
      var _this;

      (0, _classCallCheck2["default"])(this, ColorPaletteCollectionComponent);
      _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(ColorPaletteCollectionComponent).apply(this, arguments));
      _this.onPaletteSelected = _this.onPaletteSelected.bind((0, _assertThisInitialized2["default"])(_this));
      _this.renderCancel = _this.renderCancel.bind((0, _assertThisInitialized2["default"])(_this));
      return _this;
    }

    (0, _createClass2["default"])(ColorPaletteCollectionComponent, [{
      key: "onPaletteSelected",
      value: function onPaletteSelected(index) {
        var colorMap, scheme;
        boundMethodCheck(this, ColorPaletteCollectionComponent); // Generate color map

        scheme = ColorSchemeFactory.createColorScheme({
          type: ColorPaletteCollectionComponent.palettes[index].type,
          // Null doesn't count to length
          number: _.any(this.props.categories, function (c) {
            return c.value == null;
          }) ? this.props.categories.length - 1 : this.props.categories.length,
          reversed: ColorPaletteCollectionComponent.palettes[index].reversed
        });
        colorMap = _.map(this.props.categories, function (category, i) {
          return {
            value: category.value,
            color: category.value === null ? "#aaaaaa" : scheme[i % scheme.length]
          };
        });
        return this.props.onPaletteSelected(colorMap);
      }
    }, {
      key: "renderCancel",
      value: function renderCancel() {
        boundMethodCheck(this, ColorPaletteCollectionComponent);

        if (this.props.axis.colorMap) {
          return R('div', null, R('a', {
            style: {
              cursor: "pointer"
            },
            onClick: this.props.onCancel,
            key: "cancel-customize"
          }, "Cancel"));
        }
      }
    }, {
      key: "render",
      value: function render() {
        var _this2 = this;

        return R('div', null, R('p', null, "Please select a color scheme"), _.map(ColorPaletteCollectionComponent.palettes, function (config, index) {
          return R(ColorPaletteComponent, {
            key: index,
            index: index,
            colorSet: ColorSchemeFactory.createColorScheme({
              type: config.type,
              number: Math.min(_this2.props.categories.length - 1, 6),
              reversed: config.reversed
            }),
            onPaletteSelected: _this2.onPaletteSelected,
            number: _this2.props.categories.length
          });
        }), this.renderCancel());
      }
    }]);
    return ColorPaletteCollectionComponent;
  }(React.Component);

  ;
  ColorPaletteCollectionComponent.propTypes = {
    onPaletteSelected: PropTypes.func.isRequired,
    axis: PropTypes.object.isRequired,
    categories: PropTypes.array.isRequired,
    onCancel: PropTypes.func.isRequired
  };
  ColorPaletteCollectionComponent.palettes = [{
    type: "schemeSet1",
    reversed: false
  }, {
    type: "schemeSet2",
    reversed: false
  }, {
    type: "schemeSet3",
    reversed: false
  }, {
    type: "schemeAccent",
    reversed: false
  }, {
    type: "schemeDark2",
    reversed: false
  }, {
    type: "schemePaired",
    reversed: false
  }, {
    type: "schemePastel1",
    reversed: false
  }, {
    type: "schemePastel2",
    reversed: false
  }, {
    type: "interpolateSpectral",
    reversed: false
  }, {
    type: "interpolateSpectral",
    reversed: true
  }, {
    type: "interpolateBlues",
    reversed: false
  }, {
    type: "interpolateBlues",
    reversed: true
  }, {
    type: "interpolateGreens",
    reversed: false
  }, {
    type: "interpolateGreens",
    reversed: true
  }, {
    type: "interpolateGreys",
    reversed: false
  }, {
    type: "interpolateGreys",
    reversed: true
  }, {
    type: "interpolateOranges",
    reversed: false
  }, {
    type: "interpolateOranges",
    reversed: true
  }, {
    type: "interpolatePurples",
    reversed: false
  }, {
    type: "interpolatePurples",
    reversed: true
  }, {
    type: "interpolateReds",
    reversed: false
  }, {
    type: "interpolateReds",
    reversed: true
  }, {
    type: "interpolateBuGn",
    reversed: false
  }, {
    type: "interpolateBuGn",
    reversed: true
  }, {
    type: "interpolateBuPu",
    reversed: false
  }, {
    type: "interpolateBuPu",
    reversed: true
  }, {
    type: "interpolateGnBu",
    reversed: false
  }, {
    type: "interpolateGnBu",
    reversed: true
  }, {
    type: "interpolateOrRd",
    reversed: false
  }, {
    type: "interpolateOrRd",
    reversed: true
  }, {
    type: "interpolatePuBuGn",
    reversed: false
  }, {
    type: "interpolatePuBuGn",
    reversed: true
  }, {
    type: "interpolatePuBu",
    reversed: false
  }, {
    type: "interpolatePuBu",
    reversed: true
  }, {
    type: "interpolatePuRd",
    reversed: false
  }, {
    type: "interpolatePuRd",
    reversed: true
  }, {
    type: "interpolateRdPu",
    reversed: false
  }, {
    type: "interpolateRdPu",
    reversed: true
  }, {
    type: "interpolateYlGnBu",
    reversed: false
  }, {
    type: "interpolateYlGnBu",
    reversed: true
  }, {
    type: "interpolateYlGn",
    reversed: false
  }, {
    type: "interpolateYlGn",
    reversed: true
  }, {
    type: "interpolateYlOrBr",
    reversed: false
  }, {
    type: "interpolateYlOrBr",
    reversed: true
  }, {
    type: "interpolateYlOrRd",
    reversed: false
  }, {
    type: "interpolateYlOrRd",
    reversed: true
  }, {
    type: "interpolateBrBG",
    reversed: false
  }, {
    type: "interpolateBrBG",
    reversed: true
  }, {
    type: "interpolatePRGn",
    reversed: false
  }, {
    type: "interpolatePRGn",
    reversed: true
  }, {
    type: "interpolatePiYG",
    reversed: false
  }, {
    type: "interpolatePiYG",
    reversed: true
  }, {
    type: "interpolatePuOr",
    reversed: false
  }, {
    type: "interpolatePuOr",
    reversed: true
  }, {
    type: "interpolateRdBu",
    reversed: false
  }, {
    type: "interpolateRdBu",
    reversed: true
  }, {
    type: "interpolateRdGy",
    reversed: false
  }, {
    type: "interpolateRdGy",
    reversed: true
  }, {
    type: "interpolateRdYlBu",
    reversed: false
  }, {
    type: "interpolateRdYlBu",
    reversed: true
  }, {
    type: "interpolateRdYlGn",
    reversed: false
  }, {
    type: "interpolateRdYlGn",
    reversed: true
  }];
  return ColorPaletteCollectionComponent;
}.call(void 0);

ColorPaletteComponent = function () {
  var ColorPaletteComponent =
  /*#__PURE__*/
  function (_React$Component2) {
    (0, _inherits2["default"])(ColorPaletteComponent, _React$Component2);

    function ColorPaletteComponent() {
      var _this3;

      (0, _classCallCheck2["default"])(this, ColorPaletteComponent);
      _this3 = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(ColorPaletteComponent).apply(this, arguments));
      _this3.handleSelect = _this3.handleSelect.bind((0, _assertThisInitialized2["default"])(_this3));
      return _this3;
    }

    (0, _createClass2["default"])(ColorPaletteComponent, [{
      key: "handleSelect",
      value: function handleSelect() {
        boundMethodCheck(this, ColorPaletteComponent);
        return this.props.onPaletteSelected(this.props.index);
      }
    }, {
      key: "render",
      value: function render() {
        return R('div', {
          onClick: this.handleSelect,
          className: "axis-palette"
        }, _.map(this.props.colorSet.slice(0, this.props.number), function (color, i) {
          var cellStyle;
          cellStyle = {
            display: 'inline-block',
            height: 20,
            width: 20,
            backgroundColor: color
          };
          return R('div', {
            style: cellStyle,
            key: i
          }, " ");
        }));
      }
    }]);
    return ColorPaletteComponent;
  }(React.Component);

  ;
  ColorPaletteComponent.propTypes = {
    index: PropTypes.number.isRequired,
    colorSet: PropTypes.array.isRequired,
    onPaletteSelected: PropTypes.func.isRequired,
    number: PropTypes.number
  };
  ColorPaletteComponent.defaultProps = {
    number: 6
  };
  return ColorPaletteComponent;
}.call(void 0);