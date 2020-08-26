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

var ColorComponent,
    LabeledInlineComponent,
    LayeredChartCompiler,
    LayeredChartDesignerComponent,
    LayeredChartLayerDesignerComponent,
    PropTypes,
    R,
    React,
    TabbedComponent,
    ThresholdComponent,
    ThresholdsComponent,
    _,
    ui,
    uiComponents,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

_ = require('lodash');
PropTypes = require('prop-types');
React = require('react');
R = React.createElement;
LayeredChartLayerDesignerComponent = require('./LayeredChartLayerDesignerComponent');
LayeredChartCompiler = require('./LayeredChartCompiler');
TabbedComponent = require('react-library/lib/TabbedComponent');
uiComponents = require('../../../UIComponents');
ColorComponent = require('../../../ColorComponent');
ui = require('react-library/lib/bootstrap');

module.exports = LayeredChartDesignerComponent = function () {
  var LayeredChartDesignerComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(LayeredChartDesignerComponent, _React$Component);

    var _super = _createSuper(LayeredChartDesignerComponent);

    function LayeredChartDesignerComponent() {
      var _this;

      (0, _classCallCheck2["default"])(this, LayeredChartDesignerComponent);
      _this = _super.apply(this, arguments);
      _this.handleTypeChange = _this.handleTypeChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleTransposeChange = _this.handleTransposeChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleStackedChange = _this.handleStackedChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleProportionalChange = _this.handleProportionalChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleLabelsChange = _this.handleLabelsChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handlePolarOrderChange = _this.handlePolarOrderChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleYThresholdsChange = _this.handleYThresholdsChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleLayerChange = _this.handleLayerChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleRemoveLayer = _this.handleRemoveLayer.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleAddLayer = _this.handleAddLayer.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleXAxisLabelTextChange = _this.handleXAxisLabelTextChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleYAxisLabelTextChange = _this.handleYAxisLabelTextChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleToggleXAxisLabelClick = _this.handleToggleXAxisLabelClick.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleToggleYAxisLabelClick = _this.handleToggleYAxisLabelClick.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleYMinChange = _this.handleYMinChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleYMaxChange = _this.handleYMaxChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.renderLayer = _this.renderLayer.bind((0, _assertThisInitialized2["default"])(_this));
      return _this;
    } // Determine if axes labels needed


    (0, _createClass2["default"])(LayeredChartDesignerComponent, [{
      key: "areAxesLabelsNeeded",
      value: function areAxesLabelsNeeded(layer) {
        var ref;
        return (ref = this.props.design.type) !== 'pie' && ref !== 'donut';
      } // Updates design with the specified changes

    }, {
      key: "updateDesign",
      value: function updateDesign(changes) {
        var design;
        design = _.extend({}, this.props.design, changes);
        return this.props.onDesignChange(design);
      }
    }, {
      key: "handleTypeChange",
      value: function handleTypeChange(type) {
        boundMethodCheck(this, LayeredChartDesignerComponent);
        return this.updateDesign({
          type: type
        });
      }
    }, {
      key: "handleTransposeChange",
      value: function handleTransposeChange(ev) {
        boundMethodCheck(this, LayeredChartDesignerComponent);
        return this.updateDesign({
          transpose: ev.target.checked
        });
      }
    }, {
      key: "handleStackedChange",
      value: function handleStackedChange(ev) {
        boundMethodCheck(this, LayeredChartDesignerComponent);
        return this.updateDesign({
          stacked: ev.target.checked
        });
      }
    }, {
      key: "handleProportionalChange",
      value: function handleProportionalChange(ev) {
        boundMethodCheck(this, LayeredChartDesignerComponent);
        return this.updateDesign({
          proportional: ev.target.checked
        });
      }
    }, {
      key: "handleLabelsChange",
      value: function handleLabelsChange(ev) {
        boundMethodCheck(this, LayeredChartDesignerComponent);
        return this.updateDesign({
          labels: ev.target.checked
        });
      }
    }, {
      key: "handlePolarOrderChange",
      value: function handlePolarOrderChange(ev) {
        boundMethodCheck(this, LayeredChartDesignerComponent);
        return this.updateDesign({
          polarOrder: ev.target.checked ? "desc" : "natural"
        });
      }
    }, {
      key: "handleYThresholdsChange",
      value: function handleYThresholdsChange(yThresholds) {
        boundMethodCheck(this, LayeredChartDesignerComponent);
        return this.updateDesign({
          yThresholds: yThresholds
        });
      }
    }, {
      key: "handleLayerChange",
      value: function handleLayerChange(index, layer) {
        var layers;
        boundMethodCheck(this, LayeredChartDesignerComponent);
        layers = this.props.design.layers.slice();
        layers[index] = layer;
        return this.updateDesign({
          layers: layers
        });
      }
    }, {
      key: "handleRemoveLayer",
      value: function handleRemoveLayer(index) {
        var layers;
        boundMethodCheck(this, LayeredChartDesignerComponent);
        layers = this.props.design.layers.slice();
        layers.splice(index, 1);
        return this.updateDesign({
          layers: layers
        });
      }
    }, {
      key: "handleAddLayer",
      value: function handleAddLayer() {
        var layers;
        boundMethodCheck(this, LayeredChartDesignerComponent);
        layers = this.props.design.layers.slice();
        layers.push({});
        return this.updateDesign({
          layers: layers
        });
      }
    }, {
      key: "handleXAxisLabelTextChange",
      value: function handleXAxisLabelTextChange(ev) {
        boundMethodCheck(this, LayeredChartDesignerComponent);
        return this.updateDesign({
          xAxisLabelText: ev.target.value
        });
      }
    }, {
      key: "handleYAxisLabelTextChange",
      value: function handleYAxisLabelTextChange(ev) {
        boundMethodCheck(this, LayeredChartDesignerComponent);
        return this.updateDesign({
          yAxisLabelText: ev.target.value
        });
      }
    }, {
      key: "handleToggleXAxisLabelClick",
      value: function handleToggleXAxisLabelClick(ev) {
        boundMethodCheck(this, LayeredChartDesignerComponent);
        return this.updateDesign({
          xAxisLabelText: this.props.design.xAxisLabelText != null ? null : ""
        });
      }
    }, {
      key: "handleToggleYAxisLabelClick",
      value: function handleToggleYAxisLabelClick(ev) {
        boundMethodCheck(this, LayeredChartDesignerComponent);
        return this.updateDesign({
          yAxisLabelText: this.props.design.yAxisLabelText != null ? null : ""
        });
      }
    }, {
      key: "handleYMinChange",
      value: function handleYMinChange(yMin) {
        boundMethodCheck(this, LayeredChartDesignerComponent);
        return this.updateDesign({
          yMin: yMin
        });
      }
    }, {
      key: "handleYMaxChange",
      value: function handleYMaxChange(yMax) {
        boundMethodCheck(this, LayeredChartDesignerComponent);
        return this.updateDesign({
          yMax: yMax
        });
      }
    }, {
      key: "renderLabels",
      value: function renderLabels() {
        var compiler;

        if (!this.props.design.type) {
          return;
        }

        compiler = new LayeredChartCompiler({
          schema: this.props.schema
        });
        return R('div', null, R('p', {
          className: "help-block"
        }, "To edit title of chart, click on it directly"), this.areAxesLabelsNeeded() ? R('div', {
          className: "form-group"
        }, R('span', null, R('label', {
          className: "text-muted"
        }, this.props.design.transpose ? "Vertical Axis Label" : "Horizontal Axis Label"), " ", R('button', {
          className: "btn btn-default btn-xs",
          onClick: this.handleToggleXAxisLabelClick
        }, this.props.design.xAxisLabelText != null ? "Hide" : "Show")), this.props.design.xAxisLabelText != null ? R('input', {
          type: "text",
          className: "form-control input-sm",
          value: this.props.design.xAxisLabelText,
          onChange: this.handleXAxisLabelTextChange,
          placeholder: compiler.compileDefaultXAxisLabelText(this.props.design)
        }) : void 0) : void 0, this.areAxesLabelsNeeded() ? R('div', {
          className: "form-group"
        }, R('span', null, R('label', {
          className: "text-muted"
        }, !this.props.design.transpose ? "Vertical Axis Label" : "Horizontal Axis Label"), " ", R('button', {
          className: "btn btn-default btn-xs",
          onClick: this.handleToggleYAxisLabelClick
        }, this.props.design.yAxisLabelText != null ? "Hide" : "Show")), this.props.design.yAxisLabelText != null ? R('input', {
          type: "text",
          className: "form-control input-sm",
          value: this.props.design.yAxisLabelText,
          onChange: this.handleYAxisLabelTextChange,
          placeholder: compiler.compileDefaultYAxisLabelText(this.props.design)
        }) : void 0) : void 0);
      }
    }, {
      key: "renderType",
      value: function renderType() {
        var _this2 = this;

        var chartTypes, current;
        chartTypes = [{
          id: "bar",
          name: "Bar",
          desc: "Best for most charts"
        }, {
          id: "pie",
          name: "Pie",
          desc: "Compare ratios of one variable"
        }, {
          id: "donut",
          name: "Donut",
          desc: "Pie chart with center removed"
        }, {
          id: "line",
          name: "Line",
          desc: "Show how data changes smoothly over time"
        }, {
          id: "spline",
          name: "Smoothed Line",
          desc: "For noisy data over time"
        }, {
          id: "scatter",
          name: "Scatter",
          desc: "Show correlation between two number variables"
        }, {
          id: "area",
          name: "Area",
          desc: "For cumulative data over time"
        }];
        current = _.findWhere(chartTypes, {
          id: this.props.design.type
        });
        return R(uiComponents.SectionComponent, {
          icon: "glyphicon-th",
          label: "Chart Type"
        }, R(uiComponents.ToggleEditComponent, {
          forceOpen: !this.props.design.type,
          label: current ? current.name : "",
          editor: function editor(onClose) {
            return R(uiComponents.OptionListComponent, {
              hint: "Select a Chart Type",
              items: _.map(chartTypes, function (ct) {
                return {
                  name: ct.name,
                  desc: ct.desc,
                  onClick: function onClick() {
                    onClose(); // Close editor first

                    return _this2.handleTypeChange(ct.id);
                  }
                };
              })
            });
          }
        }), this.renderOptions());
      }
    }, {
      key: "renderLayer",
      value: function renderLayer(index) {
        var style;
        boundMethodCheck(this, LayeredChartDesignerComponent);
        style = {
          paddingTop: 10,
          paddingBottom: 10
        };
        return R('div', {
          style: style,
          key: index
        }, R(LayeredChartLayerDesignerComponent, {
          design: this.props.design,
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          index: index,
          filters: this.props.filters,
          onChange: this.handleLayerChange.bind(null, index),
          onRemove: this.handleRemoveLayer.bind(null, index)
        }));
      }
    }, {
      key: "renderLayers",
      value: function renderLayers() {
        var _this3 = this;

        if (!this.props.design.type) {
          return;
        }

        return R('div', null, _.map(this.props.design.layers, function (layer, i) {
          return _this3.renderLayer(i); // Only add if last has table
        }), this.props.design.layers.length > 0 && _.last(this.props.design.layers).table ? R('button', {
          className: "btn btn-link",
          type: "button",
          onClick: this.handleAddLayer
        }, R('span', {
          className: "glyphicon glyphicon-plus"
        }), " Add Another Series") : void 0);
      }
    }, {
      key: "renderOptions",
      value: function renderOptions() {
        var canStack, canTranspose, design, ref, ref1, ref2;
        design = this.props.design;

        if (!design.type) {
          return;
        } // Can only stack if multiple series or one with color and not polar


        canStack = (ref = design.type) !== 'pie' && ref !== 'donut' && design.layers.length > 0;

        if (design.layers.length === 1 && !design.layers[0].axes.color) {
          canStack = false;
        } // Don't include if transpose


        canTranspose = (ref1 = design.type) !== 'pie' && ref1 !== 'donut';
        return R('div', {
          className: "text-muted"
        }, canTranspose ? R('label', {
          className: "checkbox-inline",
          key: "transpose"
        }, R('input', {
          type: "checkbox",
          checked: design.transpose,
          onChange: this.handleTransposeChange
        }), "Horizontal") : void 0, canStack ? R('label', {
          className: "checkbox-inline",
          key: "stacked"
        }, R('input', {
          type: "checkbox",
          checked: design.stacked,
          onChange: this.handleStackedChange
        }), "Stacked") : void 0, canStack ? R('label', {
          className: "checkbox-inline",
          key: "proportional"
        }, R('input', {
          type: "checkbox",
          checked: design.proportional,
          onChange: this.handleProportionalChange
        }), "Proportional") : void 0, R('label', {
          className: "checkbox-inline",
          key: "labels"
        }, R('input', {
          type: "checkbox",
          checked: design.labels || false,
          onChange: this.handleLabelsChange
        }), "Show Values"), (ref2 = design.type) === 'pie' || ref2 === 'donut' ? R('label', {
          className: "checkbox-inline",
          key: "polarOrder"
        }, R('input', {
          type: "checkbox",
          checked: (design.polarOrder || "desc") === "desc",
          onChange: this.handlePolarOrderChange
        }), "Descending Order") : void 0);
      }
    }, {
      key: "renderThresholds",
      value: function renderThresholds() {
        var ref; // Doesn't apply to polar

        if (this.props.design.type && (ref = this.props.design.type) !== 'pie' && ref !== 'donut') {
          return R(uiComponents.SectionComponent, {
            label: "Y Threshold Lines"
          }, R(ThresholdsComponent, {
            thresholds: this.props.design.yThresholds,
            onThresholdsChange: this.handleYThresholdsChange,
            showHighlightColor: this.props.design.type === "bar"
          }));
        }
      }
    }, {
      key: "renderYRange",
      value: function renderYRange() {
        var ref; // Doesn't apply to polar

        if (this.props.design.type && (ref = this.props.design.type) !== 'pie' && ref !== 'donut') {
          return R(uiComponents.SectionComponent, {
            label: "Y Axis Range"
          }, R(LabeledInlineComponent, {
            key: "min",
            label: "Min:"
          }, R(ui.NumberInput, {
            decimal: true,
            style: {
              display: "inline-block"
            },
            size: "sm",
            value: this.props.design.yMin,
            onChange: this.handleYMinChange,
            placeholder: "Auto"
          })), "  ", R(LabeledInlineComponent, {
            key: "label",
            label: "Max:"
          }, R(ui.NumberInput, {
            decimal: true,
            style: {
              display: "inline-block"
            },
            size: "sm",
            value: this.props.design.yMax,
            onChange: this.handleYMaxChange,
            placeholder: "Auto"
          })));
        }
      }
    }, {
      key: "render",
      value: function render() {
        var tabs;
        tabs = [];
        tabs.push({
          id: "design",
          label: "Design",
          elem: R('div', {
            style: {
              paddingBottom: 200
            }
          }, R('br'), this.renderType(), this.renderLayers(), this.renderThresholds(), this.renderYRange())
        });

        if (this.props.design.type) {
          tabs.push({
            id: "labels",
            label: "Labels",
            elem: R('div', null, R('br'), this.renderLabels())
          });
        }

        return R(TabbedComponent, {
          initialTabId: "design",
          tabs: tabs
        });
      }
    }]);
    return LayeredChartDesignerComponent;
  }(React.Component);

  ;
  LayeredChartDesignerComponent.propTypes = {
    design: PropTypes.object.isRequired,
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func.isRequired,
    filters: PropTypes.array // array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct

  };
  return LayeredChartDesignerComponent;
}.call(void 0);

ThresholdsComponent = function () {
  // Thresholds are lines that are added at certain values
  var ThresholdsComponent = /*#__PURE__*/function (_React$Component2) {
    (0, _inherits2["default"])(ThresholdsComponent, _React$Component2);

    var _super2 = _createSuper(ThresholdsComponent);

    function ThresholdsComponent() {
      var _this4;

      (0, _classCallCheck2["default"])(this, ThresholdsComponent);
      _this4 = _super2.apply(this, arguments);
      _this4.handleAdd = _this4.handleAdd.bind((0, _assertThisInitialized2["default"])(_this4));
      _this4.handleChange = _this4.handleChange.bind((0, _assertThisInitialized2["default"])(_this4));
      _this4.handleRemove = _this4.handleRemove.bind((0, _assertThisInitialized2["default"])(_this4));
      return _this4;
    }

    (0, _createClass2["default"])(ThresholdsComponent, [{
      key: "handleAdd",
      value: function handleAdd() {
        var thresholds;
        boundMethodCheck(this, ThresholdsComponent);
        thresholds = (this.props.thresholds || []).slice();
        thresholds.push({
          value: null,
          label: "",
          highlightColor: null
        });
        return this.props.onThresholdsChange(thresholds);
      }
    }, {
      key: "handleChange",
      value: function handleChange(index, value) {
        var thresholds;
        boundMethodCheck(this, ThresholdsComponent);
        thresholds = (this.props.thresholds || []).slice();
        thresholds[index] = value;
        return this.props.onThresholdsChange(thresholds);
      }
    }, {
      key: "handleRemove",
      value: function handleRemove(index) {
        var thresholds;
        boundMethodCheck(this, ThresholdsComponent);
        thresholds = (this.props.thresholds || []).slice();
        thresholds.splice(index, 1);
        return this.props.onThresholdsChange(thresholds);
      }
    }, {
      key: "render",
      value: function render() {
        var _this5 = this;

        return R('div', null, _.map(this.props.thresholds, function (threshold, index) {
          return R(ThresholdComponent, {
            threshold: threshold,
            onThresholdChange: _this5.handleChange.bind(null, index),
            onRemove: _this5.handleRemove.bind(null, index),
            showHighlightColor: _this5.props.showHighlightColor
          });
        }), R('button', {
          type: "button",
          className: "btn btn-xs btn-link",
          onClick: this.handleAdd
        }, R('i', {
          className: "fa fa-plus"
        }), " Add Y Threshold"));
      }
    }]);
    return ThresholdsComponent;
  }(React.Component);

  ;
  ThresholdsComponent.propTypes = {
    thresholds: PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.number,
      label: PropTypes.string,
      highlightColor: PropTypes.string
    })),
    onThresholdsChange: PropTypes.func.isRequired,
    showHighlightColor: PropTypes.bool.isRequired // True to show highlight color

  };
  return ThresholdsComponent;
}.call(void 0);

ThresholdComponent = function () {
  var ThresholdComponent = /*#__PURE__*/function (_React$Component3) {
    (0, _inherits2["default"])(ThresholdComponent, _React$Component3);

    var _super3 = _createSuper(ThresholdComponent);

    function ThresholdComponent() {
      (0, _classCallCheck2["default"])(this, ThresholdComponent);
      return _super3.apply(this, arguments);
    }

    (0, _createClass2["default"])(ThresholdComponent, [{
      key: "render",
      value: function render() {
        var _this6 = this;

        return R('div', null, R(LabeledInlineComponent, {
          key: "value",
          label: "Value:"
        }, R(ui.NumberInput, {
          decimal: true,
          style: {
            display: "inline-block"
          },
          size: "sm",
          value: this.props.threshold.value,
          onChange: function onChange(v) {
            return _this6.props.onThresholdChange(_.extend({}, _this6.props.threshold, {
              value: v
            }));
          }
        })), "  ", R(LabeledInlineComponent, {
          key: "label",
          label: "Label:"
        }, R(ui.TextInput, {
          style: {
            display: "inline-block",
            width: "8em"
          },
          size: "sm",
          value: this.props.threshold.label,
          onChange: function onChange(v) {
            return _this6.props.onThresholdChange(_.extend({}, _this6.props.threshold, {
              label: v
            }));
          }
        })), "  ", this.props.showHighlightColor ? R(LabeledInlineComponent, {
          key: "color",
          label: "Highlight color:"
        }, R('div', {
          style: {
            verticalAlign: "middle",
            display: "inline-block"
          }
        }, R(ColorComponent, {
          color: this.props.threshold.highlightColor,
          onChange: function onChange(v) {
            return _this6.props.onThresholdChange(_.extend({}, _this6.props.threshold, {
              highlightColor: v
            }));
          }
        }))) : void 0, "  ", R('button', {
          className: "btn btn-xs btn-link",
          onClick: this.props.onRemove
        }, R('i', {
          className: "fa fa-remove"
        })));
      }
    }]);
    return ThresholdComponent;
  }(React.Component);

  ;
  ThresholdComponent.propTypes = {
    threshold: PropTypes.shape({
      value: PropTypes.number,
      label: PropTypes.string,
      highlightColor: PropTypes.string
    }).isRequired,
    onThresholdChange: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    showHighlightColor: PropTypes.bool.isRequired // True to show highlight color

  };
  return ThresholdComponent;
}.call(void 0);

LabeledInlineComponent = function LabeledInlineComponent(props) {
  return R('div', {
    style: {
      display: "inline-block"
    }
  }, R('label', {
    className: "text-muted"
  }, props.label), " ", props.children);
};