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

var AxisBuilder,
    AxisColorEditorComponent,
    CategoryMapComponent,
    ColorPaletteCollectionComponent,
    ColorSchemeFactory,
    PropTypes,
    R,
    React,
    _,
    update,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

PropTypes = require('prop-types');
_ = require('lodash');
React = require('react');
R = React.createElement;
CategoryMapComponent = require('./CategoryMapComponent');
ColorSchemeFactory = require('../ColorSchemeFactory');
ColorPaletteCollectionComponent = require('./ColorPaletteCollectionComponent');
update = require('update-object');
AxisBuilder = require('./AxisBuilder'); // Color editor for axis. Allows switching between editing individial colors (using CategoryMapComponent) 
// and setting the colors from a palette (using ColorPaletteCollectionComponent)

module.exports = AxisColorEditorComponent = function () {
  var AxisColorEditorComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(AxisColorEditorComponent, _React$Component);

    var _super = _createSuper(AxisColorEditorComponent);

    function AxisColorEditorComponent(props) {
      var _this;

      (0, _classCallCheck2["default"])(this, AxisColorEditorComponent);
      _this = _super.call(this, props);
      _this.handleSelectPalette = _this.handleSelectPalette.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleResetPalette = _this.handleResetPalette.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handlePaletteChange = _this.handlePaletteChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleCancelCustomize = _this.handleCancelCustomize.bind((0, _assertThisInitialized2["default"])(_this));
      _this.state = {
        mode: "normal"
      };
      return _this;
    }

    (0, _createClass2["default"])(AxisColorEditorComponent, [{
      key: "componentWillMount",
      value: function componentWillMount() {
        return this.updateColorMap();
      }
    }, {
      key: "componentDidUpdate",
      value: function componentDidUpdate() {
        return this.updateColorMap();
      } // Update color map if categories no longer match

    }, {
      key: "updateColorMap",
      value: function updateColorMap() {
        var axisBuilder, colorMap, existing;
        axisBuilder = new AxisBuilder({
          schema: this.props.schema
        }); // If no categories, can't do anything

        if (!this.props.categories) {
          return;
        } // If no color map or color map values have changed


        if (!this.props.axis.colorMap || !_.isEqual(_.pluck(this.props.axis.colorMap, "value").sort(), _.pluck(this.props.categories, "value").sort())) {
          if (this.props.autosetColors) {
            colorMap = ColorSchemeFactory.createColorMapForCategories(this.props.categories, axisBuilder.isCategorical(this.props.axis));
          } else {
            // Keep existing 
            existing = _.indexBy(this.props.axis.colorMap || [], "value");
            colorMap = _.map(this.props.categories, function (category, i) {
              return {
                value: category.value,
                color: existing[category.value] ? existing[category.value].color : null
              };
            });
          }

          this.handlePaletteChange(colorMap);
          return this.setState({
            mode: "normal"
          });
        }
      }
    }, {
      key: "handleSelectPalette",
      value: function handleSelectPalette() {
        boundMethodCheck(this, AxisColorEditorComponent);
        return this.setState({
          mode: "palette"
        });
      }
    }, {
      key: "handleResetPalette",
      value: function handleResetPalette() {
        var colorMap;
        boundMethodCheck(this, AxisColorEditorComponent); // Completely reset

        colorMap = _.map(this.props.categories, function (category, i) {
          return {
            value: category.value,
            color: null
          };
        });
        this.handlePaletteChange(colorMap);
        return this.setState({
          mode: "normal"
        });
      }
    }, {
      key: "handlePaletteChange",
      value: function handlePaletteChange(palette) {
        boundMethodCheck(this, AxisColorEditorComponent);
        this.props.onChange(update(this.props.axis, {
          colorMap: {
            $set: palette
          },
          drawOrder: {
            $set: _.pluck(palette, "value")
          }
        }));
        return this.setState({
          mode: "normal"
        });
      }
    }, {
      key: "handleCancelCustomize",
      value: function handleCancelCustomize() {
        boundMethodCheck(this, AxisColorEditorComponent);
        return this.setState({
          mode: "normal"
        });
      }
    }, {
      key: "renderPreview",
      value: function renderPreview() {
        var _this2 = this;

        return R('div', {
          className: "axis-palette"
        }, _.map(this.props.categories.slice(0, 6), function (category, i) {
          var cellStyle, color;
          color = _.find(_this2.props.axis.colorMap, {
            value: category.value
          });
          cellStyle = {
            display: 'inline-block',
            height: 20,
            width: 20,
            backgroundColor: color ? color.color : _this2.props.defaultColor
          };
          return R('div', {
            style: cellStyle,
            key: i
          }, " ");
        }));
      }
    }, {
      key: "render",
      value: function render() {
        return R('div', null, this.state.mode === "palette" ? this.props.categories ? R(ColorPaletteCollectionComponent, {
          onPaletteSelected: this.handlePaletteChange,
          axis: this.props.axis,
          categories: this.props.categories,
          onCancel: this.handleCancelCustomize
        }) : void 0 : void 0, this.state.mode === "normal" ? R('div', null, R('p', null, R('a', {
          style: {
            cursor: "pointer"
          },
          onClick: this.handleSelectPalette,
          key: "select-palette"
        }, "Change color scheme"), !this.props.autosetColors ? R('a', {
          style: {
            cursor: "pointer",
            marginLeft: 10
          },
          onClick: this.handleResetPalette,
          key: "reset-palette"
        }, "Reset colors") : void 0), this.props.axis.colorMap ? R('div', {
          key: "selected-palette"
        }, R('div', null, R(CategoryMapComponent, {
          schema: this.props.schema,
          axis: this.props.axis,
          onChange: this.props.onChange,
          categories: this.props.categories,
          key: "colorMap",
          reorderable: this.props.reorderable,
          allowExcludedValues: this.props.allowExcludedValues,
          showColorMap: true,
          initiallyExpanded: this.props.initiallyExpanded
        }))) : void 0) : void 0);
      }
    }]);
    return AxisColorEditorComponent;
  }(React.Component);

  ;
  AxisColorEditorComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    axis: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    // Called with new axis
    categories: PropTypes.array,
    // Categories of the axis
    reorderable: PropTypes.bool,
    // is the color map reorderable
    defaultColor: PropTypes.string,
    allowExcludedValues: PropTypes.bool,
    // True to allow excluding of values via checkboxes
    initiallyExpanded: PropTypes.bool,
    // True to start values expanded
    autosetColors: PropTypes.bool // True to automatically set the colors if blank

  };
  AxisColorEditorComponent.defaultProps = {
    reorderable: false,
    autosetColors: true
  };
  return AxisColorEditorComponent;
}.call(void 0);