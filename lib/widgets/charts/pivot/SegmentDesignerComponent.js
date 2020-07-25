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

var AxisComponent,
    BorderComponent,
    ColorComponent,
    ExprComponent,
    FilterExprComponent,
    PropTypes,
    R,
    React,
    SegmentDesignerComponent,
    _,
    ui,
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
AxisComponent = require('../../../axes/AxisComponent');
ColorComponent = require('../../../ColorComponent');
ExprComponent = require("mwater-expressions-ui").ExprComponent;
FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent; // Design a single segment of a pivot table

module.exports = SegmentDesignerComponent = function () {
  var SegmentDesignerComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(SegmentDesignerComponent, _React$Component);

    var _super = _createSuper(SegmentDesignerComponent);

    function SegmentDesignerComponent(props) {
      var _this;

      (0, _classCallCheck2["default"])(this, SegmentDesignerComponent);
      _this = _super.call(this, props);
      _this.handleSingleMode = _this.handleSingleMode.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleMultipleMode = _this.handleMultipleMode.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleValueAxisChange = _this.handleValueAxisChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleLabelChange = _this.handleLabelChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleFilterChange = _this.handleFilterChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleOrderExprChange = _this.handleOrderExprChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleOrderDirChange = _this.handleOrderDirChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.state = {
        // Mode switcher to make UI clearer
        mode: props.segment.label == null && !props.segment.valueAxis ? null : props.segment.valueAxis ? "multiple" : "single"
      };
      return _this;
    }

    (0, _createClass2["default"])(SegmentDesignerComponent, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        var ref;
        return (ref = this.labelElem) != null ? ref.focus() : void 0;
      } // Updates segment with the specified changes

    }, {
      key: "update",
      value: function update(changes) {
        var segment;
        segment = _.extend({}, this.props.segment, changes);
        return this.props.onChange(segment);
      }
    }, {
      key: "handleSingleMode",
      value: function handleSingleMode() {
        boundMethodCheck(this, SegmentDesignerComponent);
        this.update({
          valueAxis: null
        });
        return this.setState({
          mode: "single"
        });
      }
    }, {
      key: "handleMultipleMode",
      value: function handleMultipleMode() {
        boundMethodCheck(this, SegmentDesignerComponent);
        return this.setState({
          mode: "multiple"
        });
      }
    }, {
      key: "handleValueAxisChange",
      value: function handleValueAxisChange(valueAxis) {
        boundMethodCheck(this, SegmentDesignerComponent);
        return this.update({
          valueAxis: valueAxis
        });
      }
    }, {
      key: "handleLabelChange",
      value: function handleLabelChange(ev) {
        boundMethodCheck(this, SegmentDesignerComponent);
        return this.update({
          label: ev.target.value
        });
      }
    }, {
      key: "handleFilterChange",
      value: function handleFilterChange(filter) {
        boundMethodCheck(this, SegmentDesignerComponent);
        return this.update({
          filter: filter
        });
      }
    }, {
      key: "handleOrderExprChange",
      value: function handleOrderExprChange(orderExpr) {
        boundMethodCheck(this, SegmentDesignerComponent);
        return this.update({
          orderExpr: orderExpr
        });
      }
    }, {
      key: "handleOrderDirChange",
      value: function handleOrderDirChange(orderDir) {
        boundMethodCheck(this, SegmentDesignerComponent);
        return this.update({
          orderDir: orderDir
        });
      }
    }, {
      key: "renderMode",
      value: function renderMode() {
        return R(ui.FormGroup, {
          labelMuted: true,
          label: "Type"
        }, R('div', {
          key: "single",
          className: "radio"
        }, R('label', null, R('input', {
          type: "radio",
          checked: this.state.mode === "single",
          onChange: this.handleSingleMode
        }), "Single ".concat(this.props.segmentType), R('span', {
          className: "text-muted"
        }, " - used for summary ".concat(this.props.segmentType, "s and empty ").concat(this.props.segmentType, "s")))), R('div', {
          key: "multiple",
          className: "radio"
        }, R('label', null, R('input', {
          type: "radio",
          checked: this.state.mode === "multiple",
          onChange: this.handleMultipleMode
        }), "Multiple ".concat(this.props.segmentType, "s"), R('span', {
          className: "text-muted"
        }, " - disaggregate data by a field"))));
      }
    }, {
      key: "renderLabel",
      value: function renderLabel() {
        var _this2 = this;

        return R(ui.FormGroup, {
          labelMuted: true,
          label: "Label",
          help: this.state.mode === "multiple" ? "Optional label for the ".concat(this.props.segmentType, "s") : void 0
        }, R('input', {
          ref: function ref(elem) {
            return _this2.labelElem = elem;
          },
          type: "text",
          className: "form-control",
          value: this.props.segment.label || "",
          onChange: this.handleLabelChange
        }));
      }
    }, {
      key: "renderValueAxis",
      value: function renderValueAxis() {
        return R(ui.FormGroup, {
          labelMuted: true,
          label: "Field",
          help: "Field to disaggregate data by"
        }, R('div', {
          style: {
            marginLeft: 8
          }
        }, R(AxisComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.table,
          types: ["enum", "text", "boolean", "date"],
          aggrNeed: "none",
          value: this.props.segment.valueAxis,
          onChange: this.handleValueAxisChange,
          allowExcludedValues: true,
          filters: this.props.filters
        })));
      }
    }, {
      key: "renderFilter",
      value: function renderFilter() {
        return R(ui.FormGroup, {
          labelMuted: true,
          label: [R(ui.Icon, {
            id: "glyphicon-filter"
          }), " Filters"],
          hint: "Filters all data associated with this ".concat(this.props.segmentType)
        }, R(FilterExprComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          onChange: this.handleFilterChange,
          table: this.props.table,
          value: this.props.segment.filter
        }));
      }
    }, {
      key: "renderStyling",
      value: function renderStyling() {
        var _this3 = this;

        return R(ui.FormGroup, {
          labelMuted: true,
          label: "Styling"
        }, R('label', {
          className: "checkbox-inline",
          key: "bold"
        }, R('input', {
          type: "checkbox",
          checked: this.props.segment.bold === true,
          onChange: function onChange(ev) {
            return _this3.update({
              bold: ev.target.checked
            });
          }
        }), "Bold"), R('label', {
          className: "checkbox-inline",
          key: "italic"
        }, R('input', {
          type: "checkbox",
          checked: this.props.segment.italic === true,
          onChange: function onChange(ev) {
            return _this3.update({
              italic: ev.target.checked
            });
          }
        }), "Italic"), this.props.segment.valueAxis && this.props.segment.label ? R('label', {
          className: "checkbox-inline",
          key: "valueLabelBold"
        }, R('input', {
          type: "checkbox",
          checked: this.props.segment.valueLabelBold === true,
          onChange: function onChange(ev) {
            return _this3.update({
              valueLabelBold: ev.target.checked
            });
          }
        }), "Header Bold") : void 0, this.props.segment.valueAxis && this.props.segment.label ? R('div', {
          style: {
            paddingTop: 5
          }
        }, "Shade filler cells: ", R(ColorComponent, {
          color: this.props.segment.fillerColor,
          onChange: function onChange(color) {
            return _this3.update({
              fillerColor: color
            });
          }
        })) : void 0);
      }
    }, {
      key: "renderBorders",
      value: function renderBorders() {
        var _this4 = this;

        return R(ui.FormGroup, {
          labelMuted: true,
          label: "Borders"
        }, R('div', {
          key: "before"
        }, this.props.segmentType === "row" ? "Top: " : "Left: "), R(BorderComponent, {
          value: this.props.segment.borderBefore,
          defaultValue: 2,
          onChange: function onChange(value) {
            return _this4.update({
              borderBefore: value
            });
          }
        }), R('div', {
          key: "within"
        }, "Within: "), R(BorderComponent, {
          value: this.props.segment.borderWithin,
          defaultValue: 1,
          onChange: function onChange(value) {
            return _this4.update({
              borderWithin: value
            });
          }
        }), R('div', {
          key: "after"
        }, this.props.segmentType === "row" ? "Bottom: " : "Right: "), R(BorderComponent, {
          value: this.props.segment.borderAfter,
          defaultValue: 2,
          onChange: function onChange(value) {
            return _this4.update({
              borderAfter: value
            });
          }
        }));
      }
    }, {
      key: "renderOrderExpr",
      value: function renderOrderExpr() {
        return R(ui.FormGroup, {
          labelMuted: true,
          label: [R(ui.Icon, {
            id: "fa-sort-amount-asc"
          }), " Sort"],
          hint: "Sorts the display of this ".concat(this.props.segmentType)
        }, R(ExprComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          onChange: this.handleOrderExprChange,
          table: this.props.table,
          types: ["enum", "text", "boolean", "date", "datetime", "number"],
          aggrStatuses: ["aggregate"],
          value: this.props.segment.orderExpr
        }), this.props.segment.orderExpr ? R("div", null, R(ui.Radio, {
          value: this.props.segment.orderDir || "asc",
          radioValue: "asc",
          onChange: this.handleOrderDirChange,
          inline: true
        }, "Ascending"), R(ui.Radio, {
          value: this.props.segment.orderDir || "asc",
          radioValue: "desc",
          onChange: this.handleOrderDirChange,
          inline: true
        }, "Descending")) : void 0);
      }
    }, {
      key: "render",
      value: function render() {
        return R('div', null, this.renderMode(), this.state.mode ? this.renderLabel() : void 0, this.state.mode === "multiple" ? this.renderValueAxis() : void 0, this.state.mode ? this.renderFilter() : void 0, this.state.mode === "multiple" ? this.renderOrderExpr() : void 0, this.state.mode ? this.renderStyling() : void 0, this.state.mode ? this.renderBorders() : void 0);
      }
    }]);
    return SegmentDesignerComponent;
  }(React.Component);

  ;
  SegmentDesignerComponent.propTypes = {
    segment: PropTypes.object.isRequired,
    table: PropTypes.string.isRequired,
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    segmentType: PropTypes.string.isRequired,
    // "row" or "column"
    onChange: PropTypes.func.isRequired,
    filters: PropTypes.array // array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct

  };
  return SegmentDesignerComponent;
}.call(void 0);

BorderComponent = function () {
  // Allows setting border heaviness
  var BorderComponent = /*#__PURE__*/function (_React$Component2) {
    (0, _inherits2["default"])(BorderComponent, _React$Component2);

    var _super2 = _createSuper(BorderComponent);

    function BorderComponent() {
      (0, _classCallCheck2["default"])(this, BorderComponent);
      return _super2.apply(this, arguments);
    }

    (0, _createClass2["default"])(BorderComponent, [{
      key: "render",
      value: function render() {
        var _this5 = this;

        var value;
        value = this.props.value != null ? this.props.value : this.props.defaultValue;
        return R('span', null, R('label', {
          className: "radio-inline"
        }, R('input', {
          type: "radio",
          checked: value === 0,
          onClick: function onClick() {
            return _this5.props.onChange(0);
          }
        }), "None"), R('label', {
          className: "radio-inline"
        }, R('input', {
          type: "radio",
          checked: value === 1,
          onClick: function onClick() {
            return _this5.props.onChange(1);
          }
        }), "Light"), R('label', {
          className: "radio-inline"
        }, R('input', {
          type: "radio",
          checked: value === 2,
          onClick: function onClick() {
            return _this5.props.onChange(2);
          }
        }), "Medium"), R('label', {
          className: "radio-inline"
        }, R('input', {
          type: "radio",
          checked: value === 3,
          onClick: function onClick() {
            return _this5.props.onChange(3);
          }
        }), "Heavy"));
      }
    }]);
    return BorderComponent;
  }(React.Component);

  ;
  BorderComponent.propTypes = {
    value: PropTypes.number,
    defaultValue: PropTypes.number,
    onChange: PropTypes.func.isRequired
  };
  return BorderComponent;
}.call(void 0);