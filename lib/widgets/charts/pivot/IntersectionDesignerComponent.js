"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var AxisComponent,
    BackgroundColorConditionComponent,
    BackgroundColorConditionsComponent,
    ColorComponent,
    ExprComponent,
    FilterExprComponent,
    IntersectionDesignerComponent,
    PropTypes,
    R,
    Rcslider,
    React,
    _,
    ui,
    _update,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

PropTypes = require('prop-types');
_ = require('lodash');
React = require('react');
R = React.createElement;
ui = require('react-library/lib/bootstrap');
_update = require('react-library/lib/update');
Rcslider = require('rc-slider')["default"];
AxisComponent = require('../../../axes/AxisComponent');
ColorComponent = require('../../../ColorComponent');
FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent;
ExprComponent = require("mwater-expressions-ui").ExprComponent; // Design an intersection of a pivot table

module.exports = IntersectionDesignerComponent = function () {
  var IntersectionDesignerComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2["default"])(IntersectionDesignerComponent, _React$Component);

    function IntersectionDesignerComponent() {
      var _this;

      (0, _classCallCheck2["default"])(this, IntersectionDesignerComponent);
      _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(IntersectionDesignerComponent).apply(this, arguments)); // Updates intersection with the specified changes

      _this.update = _this.update.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleBackgroundColorAxisChange = _this.handleBackgroundColorAxisChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleBackgroundColorChange = _this.handleBackgroundColorChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleBackgroundColorConditionsChange = _this.handleBackgroundColorConditionsChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleBackgroundColorOpacityChange = _this.handleBackgroundColorOpacityChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleFilterChange = _this.handleFilterChange.bind((0, _assertThisInitialized2["default"])(_this));
      return _this;
    }

    (0, _createClass2["default"])(IntersectionDesignerComponent, [{
      key: "update",
      value: function update() {
        boundMethodCheck(this, IntersectionDesignerComponent);
        return _update(this.props.intersection, this.props.onChange, arguments);
      }
    }, {
      key: "handleBackgroundColorAxisChange",
      value: function handleBackgroundColorAxisChange(backgroundColorAxis) {
        var opacity;
        boundMethodCheck(this, IntersectionDesignerComponent);
        opacity = this.props.intersection.backgroundColorOpacity || 1;
        return this.update({
          backgroundColorAxis: backgroundColorAxis,
          backgroundColorOpacity: opacity
        });
      }
    }, {
      key: "handleBackgroundColorChange",
      value: function handleBackgroundColorChange(backgroundColor) {
        var opacity;
        boundMethodCheck(this, IntersectionDesignerComponent);
        opacity = this.props.intersection.backgroundColorOpacity || 1;
        return this.update({
          backgroundColor: backgroundColor,
          backgroundColorOpacity: opacity
        });
      }
    }, {
      key: "handleBackgroundColorConditionsChange",
      value: function handleBackgroundColorConditionsChange(backgroundColorConditions) {
        var opacity;
        boundMethodCheck(this, IntersectionDesignerComponent);
        opacity = this.props.intersection.backgroundColorOpacity || 1;
        return this.update({
          backgroundColorConditions: backgroundColorConditions,
          backgroundColorOpacity: opacity
        });
      }
    }, {
      key: "handleBackgroundColorOpacityChange",
      value: function handleBackgroundColorOpacityChange(newValue) {
        boundMethodCheck(this, IntersectionDesignerComponent);
        return this.update({
          backgroundColorOpacity: newValue / 100
        });
      }
    }, {
      key: "handleFilterChange",
      value: function handleFilterChange(filter) {
        boundMethodCheck(this, IntersectionDesignerComponent);
        return this.update({
          filter: filter
        });
      }
    }, {
      key: "renderValueAxis",
      value: function renderValueAxis() {
        return R(ui.FormGroup, {
          labelMuted: true,
          label: "Calculation",
          help: "This is the calculated value that is displayed. Leave as blank to make an empty section"
        }, R(AxisComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.table,
          types: ["enum", "text", "boolean", "date", "number"],
          aggrNeed: "required",
          value: this.props.intersection.valueAxis,
          onChange: this.update("valueAxis"),
          showFormat: true,
          filters: this.props.filters
        }));
      }
    }, {
      key: "renderNullValue",
      value: function renderNullValue() {
        if (this.props.intersection.valueAxis) {
          return R(ui.FormGroup, {
            labelMuted: true,
            label: "Show Empty Cells as"
          }, R(ui.TextInput, {
            value: this.props.intersection.valueAxis.nullLabel,
            emptyNull: true,
            onChange: this.update("valueAxis.nullLabel"),
            placeholder: "Blank"
          }));
        }
      }
    }, {
      key: "renderFilter",
      value: function renderFilter() {
        return R(ui.FormGroup, {
          labelMuted: true,
          label: [R(ui.Icon, {
            id: "glyphicon-filter"
          }), " Filters"]
        }, R(FilterExprComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          onChange: this.handleFilterChange,
          table: this.props.table,
          value: this.props.intersection.filter
        }));
      }
    }, {
      key: "renderStyling",
      value: function renderStyling() {
        return R(ui.FormGroup, {
          labelMuted: true,
          key: "styling",
          label: "Styling"
        }, R(ui.Checkbox, {
          key: "bold",
          inline: true,
          value: this.props.intersection.bold,
          onChange: this.update("bold")
        }, "Bold"), R(ui.Checkbox, {
          key: "italic",
          inline: true,
          value: this.props.intersection.italic,
          onChange: this.update("italic")
        }, "Italic"));
      }
    }, {
      key: "renderBackgroundColorConditions",
      value: function renderBackgroundColorConditions() {
        return R(BackgroundColorConditionsComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.table,
          colorConditions: this.props.intersection.backgroundColorConditions,
          onChange: this.handleBackgroundColorConditionsChange
        });
      }
    }, {
      key: "renderBackgroundColorAxis",
      value: function renderBackgroundColorAxis() {
        return R(ui.FormGroup, {
          labelMuted: true,
          label: "Background Color From Values",
          help: "This is an optional background color to set on cells that is controlled by the data"
        }, R(AxisComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.table,
          types: ["enum", "text", "boolean", "date"],
          aggrNeed: "required",
          value: this.props.intersection.backgroundColorAxis,
          onChange: this.handleBackgroundColorAxisChange,
          showColorMap: true,
          filters: this.props.filters
        }));
      }
    }, {
      key: "renderBackgroundColor",
      value: function renderBackgroundColor() {
        if (this.props.intersection.backgroundColorAxis) {
          return;
        }

        return R(ui.FormGroup, {
          labelMuted: true,
          label: "Background Color",
          help: "This is an optional background color to set on all cells"
        }, R(ColorComponent, {
          color: this.props.intersection.backgroundColor,
          onChange: this.handleBackgroundColorChange
        }));
      }
    }, {
      key: "renderBackgroundColorOpacityControl",
      value: function renderBackgroundColorOpacityControl() {
        var ref;

        if (!this.props.intersection.backgroundColorAxis && !this.props.intersection.backgroundColor && !((ref = this.props.intersection.backgroundColorConditions) != null ? ref[0] : void 0)) {
          return;
        }

        return R(ui.FormGroup, {
          labelMuted: true,
          label: "Background Opacity: ".concat(Math.round(this.props.intersection.backgroundColorOpacity * 100), "%")
        }, R(Rcslider, {
          min: 0,
          max: 100,
          step: 1,
          tipTransitionName: "rc-slider-tooltip-zoom-down",
          value: this.props.intersection.backgroundColorOpacity * 100,
          onChange: this.handleBackgroundColorOpacityChange
        }));
      }
    }, {
      key: "render",
      value: function render() {
        return R('div', null, this.renderValueAxis(), this.renderNullValue(), this.renderFilter(), this.renderStyling(), this.renderBackgroundColorAxis(), this.renderBackgroundColorConditions(), this.renderBackgroundColor(), this.renderBackgroundColorOpacityControl());
      }
    }]);
    return IntersectionDesignerComponent;
  }(React.Component);

  ;
  IntersectionDesignerComponent.propTypes = {
    intersection: PropTypes.object.isRequired,
    table: PropTypes.string.isRequired,
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    filters: PropTypes.array // array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct

  };
  return IntersectionDesignerComponent;
}.call(void 0);

BackgroundColorConditionsComponent = function () {
  // Displays background color conditions
  var BackgroundColorConditionsComponent =
  /*#__PURE__*/
  function (_React$Component2) {
    (0, _inherits2["default"])(BackgroundColorConditionsComponent, _React$Component2);

    function BackgroundColorConditionsComponent() {
      var _this2;

      (0, _classCallCheck2["default"])(this, BackgroundColorConditionsComponent);
      _this2 = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(BackgroundColorConditionsComponent).apply(this, arguments));
      _this2.handleAdd = _this2.handleAdd.bind((0, _assertThisInitialized2["default"])(_this2));
      _this2.handleChange = _this2.handleChange.bind((0, _assertThisInitialized2["default"])(_this2));
      _this2.handleRemove = _this2.handleRemove.bind((0, _assertThisInitialized2["default"])(_this2));
      return _this2;
    }

    (0, _createClass2["default"])(BackgroundColorConditionsComponent, [{
      key: "handleAdd",
      value: function handleAdd() {
        var colorConditions;
        boundMethodCheck(this, BackgroundColorConditionsComponent);
        colorConditions = (this.props.colorConditions || []).slice();
        colorConditions.push({});
        return this.props.onChange(colorConditions);
      }
    }, {
      key: "handleChange",
      value: function handleChange(index, colorCondition) {
        var colorConditions;
        boundMethodCheck(this, BackgroundColorConditionsComponent);
        colorConditions = this.props.colorConditions.slice();
        colorConditions[index] = colorCondition;
        return this.props.onChange(colorConditions);
      }
    }, {
      key: "handleRemove",
      value: function handleRemove(index) {
        var colorConditions;
        boundMethodCheck(this, BackgroundColorConditionsComponent);
        colorConditions = this.props.colorConditions.slice();
        colorConditions.splice(index, 1);
        return this.props.onChange(colorConditions);
      }
    }, {
      key: "render",
      value: function render() {
        var _this3 = this;

        // List conditions
        return R(ui.FormGroup, {
          label: "Color Conditions",
          labelMuted: true,
          help: "Add conditions that, if met, set the color of the cell. Useful for flagging certain values"
        }, _.map(this.props.colorConditions, function (colorCondition, i) {
          return R(BackgroundColorConditionComponent, {
            key: i,
            colorCondition: colorCondition,
            table: _this3.props.table,
            schema: _this3.props.schema,
            dataSource: _this3.props.dataSource,
            onChange: _this3.handleChange.bind(null, i),
            onRemove: _this3.handleRemove.bind(null, i)
          });
        }), R(ui.Button, {
          type: "link",
          size: "sm",
          onClick: this.handleAdd
        }, R(ui.Icon, {
          id: "fa-plus"
        }), " Add Condition"));
      }
    }]);
    return BackgroundColorConditionsComponent;
  }(React.Component);

  ;
  BackgroundColorConditionsComponent.propTypes = {
    colorConditions: PropTypes.array,
    table: PropTypes.string.isRequired,
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
  };
  return BackgroundColorConditionsComponent;
}.call(void 0);

BackgroundColorConditionComponent = function () {
  // Displays single background color condition
  var BackgroundColorConditionComponent =
  /*#__PURE__*/
  function (_React$Component3) {
    (0, _inherits2["default"])(BackgroundColorConditionComponent, _React$Component3);

    function BackgroundColorConditionComponent() {
      var _this4;

      (0, _classCallCheck2["default"])(this, BackgroundColorConditionComponent);
      _this4 = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(BackgroundColorConditionComponent).apply(this, arguments)); // Updates intersection with the specified changes

      _this4.update = _this4.update.bind((0, _assertThisInitialized2["default"])(_this4));
      return _this4;
    }

    (0, _createClass2["default"])(BackgroundColorConditionComponent, [{
      key: "update",
      value: function update() {
        boundMethodCheck(this, BackgroundColorConditionComponent);
        return _update(this.props.colorCondition, this.props.onChange, arguments);
      }
    }, {
      key: "render",
      value: function render() {
        return R('div', {
          className: "panel panel-default"
        }, R('div', {
          className: "panel-body"
        }, R(ui.FormGroup, {
          labelMuted: true,
          label: "Condition"
        }, R(ExprComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          onChange: this.update("condition"),
          types: ['boolean'],
          aggrStatuses: ["aggregate", "literal"],
          table: this.props.table,
          value: this.props.colorCondition.condition
        })), R(ui.FormGroup, {
          labelMuted: true,
          label: "Color",
          hint: "Color to display when condition is met"
        }, R(ColorComponent, {
          color: this.props.colorCondition.color,
          onChange: this.update("color")
        }))));
      }
    }]);
    return BackgroundColorConditionComponent;
  }(React.Component);

  ;
  BackgroundColorConditionComponent.propTypes = {
    colorCondition: PropTypes.object.isRequired,
    table: PropTypes.string.isRequired,
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
  };
  return BackgroundColorConditionComponent;
}.call(void 0);