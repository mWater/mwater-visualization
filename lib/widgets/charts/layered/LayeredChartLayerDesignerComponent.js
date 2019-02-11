"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var AxisBuilder,
    AxisComponent,
    ColorComponent,
    ExprCompiler,
    ExprUtils,
    FilterExprComponent,
    LayeredChartCompiler,
    LayeredChartLayerDesignerComponent,
    LayeredChartUtils,
    PropTypes,
    R,
    React,
    TableSelectComponent,
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
AxisComponent = require('../../../axes/AxisComponent');
AxisBuilder = require('../../../axes/AxisBuilder');
FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent;
ExprUtils = require('mwater-expressions').ExprUtils;
ExprCompiler = require('mwater-expressions').ExprCompiler;
ColorComponent = require('../../../ColorComponent');
LayeredChartUtils = require('./LayeredChartUtils');
LayeredChartCompiler = require('./LayeredChartCompiler');
uiComponents = require('../../../UIComponents');
TableSelectComponent = require('../../../TableSelectComponent');
ui = require('react-library/lib/bootstrap');

module.exports = LayeredChartLayerDesignerComponent = function () {
  var LayeredChartLayerDesignerComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2.default)(LayeredChartLayerDesignerComponent, _React$Component);

    function LayeredChartLayerDesignerComponent() {
      var _this;

      (0, _classCallCheck2.default)(this, LayeredChartLayerDesignerComponent);
      _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(LayeredChartLayerDesignerComponent).apply(this, arguments));
      _this.handleNameChange = _this.handleNameChange.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleTableChange = _this.handleTableChange.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleXAxisChange = _this.handleXAxisChange.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleXColorMapChange = _this.handleXColorMapChange.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleColorAxisChange = _this.handleColorAxisChange.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleYAxisChange = _this.handleYAxisChange.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleFilterChange = _this.handleFilterChange.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleColorChange = _this.handleColorChange.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleCumulativeChange = _this.handleCumulativeChange.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleStackedChange = _this.handleStackedChange.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      return _this;
    }

    (0, _createClass2.default)(LayeredChartLayerDesignerComponent, [{
      key: "isLayerPolar",
      value: function isLayerPolar(layer) {
        var ref;
        return (ref = layer.type || this.props.design.type) === 'pie' || ref === 'donut';
      }
    }, {
      key: "doesLayerNeedGrouping",
      value: function doesLayerNeedGrouping(layer) {
        var ref;
        return (ref = layer.type || this.props.design.type) !== 'scatter';
      } // Determine if x-axis required

    }, {
      key: "isXAxisRequired",
      value: function isXAxisRequired(layer) {
        return !this.isLayerPolar(layer);
      }
    }, {
      key: "getAxisTypes",
      value: function getAxisTypes(layer, axisKey) {
        return LayeredChartUtils.getAxisTypes(this.props.design, layer, axisKey);
      }
    }, {
      key: "getAxisLabel",
      value: function getAxisLabel(icon, label) {
        return R('span', null, R('span', {
          className: "glyphicon glyphicon-" + icon
        }), " " + label);
      } // Determine icon/label for color axis

    }, {
      key: "getXAxisLabel",
      value: function getXAxisLabel(layer) {
        if (this.props.design.transpose) {
          return this.getAxisLabel("resize-vertical", "Vertical Axis");
        } else {
          return this.getAxisLabel("resize-horizontal", "Horizontal Axis");
        }
      } // Determine icon/label for color axis

    }, {
      key: "getYAxisLabel",
      value: function getYAxisLabel(layer) {
        if (this.isLayerPolar(layer)) {
          return this.getAxisLabel("repeat", "Angle Axis");
        } else if (this.props.design.transpose) {
          return this.getAxisLabel("resize-horizontal", "Horizontal Axis");
        } else {
          return this.getAxisLabel("resize-vertical", "Vertical Axis");
        }
      } // Determine icon/label for color axis

    }, {
      key: "getColorAxisLabel",
      value: function getColorAxisLabel(layer) {
        if (this.isLayerPolar(layer)) {
          return this.getAxisLabel("text-color", "Label Axis");
        } else {
          return this.getAxisLabel("equalizer", "Split Axis");
        }
      } // Updates layer with the specified changes

    }, {
      key: "updateLayer",
      value: function updateLayer(changes) {
        var layer;
        layer = _.extend({}, this.props.design.layers[this.props.index], changes);
        return this.props.onChange(layer);
      } // Update axes with specified changes

    }, {
      key: "updateAxes",
      value: function updateAxes(changes) {
        var axes;
        axes = _.extend({}, this.props.design.layers[this.props.index].axes, changes);
        return this.updateLayer({
          axes: axes
        });
      }
    }, {
      key: "handleNameChange",
      value: function handleNameChange(ev) {
        boundMethodCheck(this, LayeredChartLayerDesignerComponent);
        return this.updateLayer({
          name: ev.target.value
        });
      }
    }, {
      key: "handleTableChange",
      value: function handleTableChange(table) {
        boundMethodCheck(this, LayeredChartLayerDesignerComponent);
        return this.updateLayer({
          table: table
        });
      }
    }, {
      key: "handleXAxisChange",
      value: function handleXAxisChange(axis) {
        var axesChanges, layer, ref;
        boundMethodCheck(this, LayeredChartLayerDesignerComponent);
        layer = this.props.design.layers[this.props.index];
        axesChanges = {
          x: axis
        }; // Default y to count if x or color present and not scatter

        if (axis && this.doesLayerNeedGrouping(layer) && !((ref = layer.axes) != null ? ref.y : void 0)) {
          axesChanges.y = {
            expr: {
              type: "op",
              op: "count",
              table: layer.table,
              exprs: []
            }
          };
        }

        return this.updateAxes(axesChanges);
      }
    }, {
      key: "handleXColorMapChange",
      value: function handleXColorMapChange(xColorMap) {
        var layer;
        boundMethodCheck(this, LayeredChartLayerDesignerComponent);
        layer = this.props.design.layers[this.props.index];
        return this.updateLayer({
          xColorMap: xColorMap
        });
      }
    }, {
      key: "handleColorAxisChange",
      value: function handleColorAxisChange(axis) {
        var axesChanges, layer, ref;
        boundMethodCheck(this, LayeredChartLayerDesignerComponent);
        layer = this.props.design.layers[this.props.index];
        axesChanges = {
          color: axis
        }; // Default y to count if x or color present and not scatter

        if (axis && this.doesLayerNeedGrouping(layer) && !((ref = layer.axes) != null ? ref.y : void 0)) {
          axesChanges.y = {
            expr: {
              type: "op",
              op: "count",
              table: layer.table,
              exprs: []
            }
          };
        }

        return this.updateAxes(axesChanges);
      }
    }, {
      key: "handleYAxisChange",
      value: function handleYAxisChange(axis) {
        boundMethodCheck(this, LayeredChartLayerDesignerComponent);
        return this.updateAxes({
          y: axis
        });
      }
    }, {
      key: "handleFilterChange",
      value: function handleFilterChange(filter) {
        boundMethodCheck(this, LayeredChartLayerDesignerComponent);
        return this.updateLayer({
          filter: filter
        });
      }
    }, {
      key: "handleColorChange",
      value: function handleColorChange(color) {
        boundMethodCheck(this, LayeredChartLayerDesignerComponent);
        return this.updateLayer({
          color: color
        });
      }
    }, {
      key: "handleCumulativeChange",
      value: function handleCumulativeChange(ev) {
        boundMethodCheck(this, LayeredChartLayerDesignerComponent);
        return this.updateLayer({
          cumulative: ev.target.checked
        });
      }
    }, {
      key: "handleStackedChange",
      value: function handleStackedChange(ev) {
        boundMethodCheck(this, LayeredChartLayerDesignerComponent);
        return this.updateLayer({
          stacked: ev.target.checked
        });
      }
    }, {
      key: "renderName",
      value: function renderName() {
        var layer;
        layer = this.props.design.layers[this.props.index]; // R 'div', className: "form-group",
        //   R 'label', className: "text-muted", "Series Name"

        return R('input', {
          type: "text",
          className: "form-control input-sm",
          value: layer.name,
          onChange: this.handleNameChange,
          placeholder: "Series ".concat(this.props.index + 1)
        });
      }
    }, {
      key: "renderRemove",
      value: function renderRemove() {
        if (this.props.design.layers.length > 1) {
          return R('button', {
            className: "btn btn-xs btn-link pull-right",
            type: "button",
            onClick: this.props.onRemove
          }, R('span', {
            className: "glyphicon glyphicon-remove"
          }));
        }
      }
    }, {
      key: "renderTable",
      value: function renderTable() {
        var layer;
        layer = this.props.design.layers[this.props.index];
        return R(uiComponents.SectionComponent, {
          icon: "fa-database",
          label: "Data Source"
        }, R(TableSelectComponent, {
          schema: this.props.schema,
          value: layer.table,
          onChange: this.handleTableChange,
          filter: layer.filter,
          onFilterChange: this.handleFilterChange
        }));
      }
    }, {
      key: "renderXAxis",
      value: function renderXAxis() {
        var categoricalX, exprCompiler, filters, jsonql, layer, title;
        layer = this.props.design.layers[this.props.index];

        if (!layer.table) {
          return;
        }

        if (!this.isXAxisRequired(layer)) {
          return;
        }

        title = this.getXAxisLabel(layer);
        filters = _.clone(this.props.filters) || [];

        if (layer.filter != null) {
          exprCompiler = new ExprCompiler(this.props.schema);
          jsonql = exprCompiler.compileExpr({
            expr: layer.filter,
            tableAlias: "{alias}"
          });

          if (jsonql) {
            filters.push({
              table: layer.filter.table,
              jsonql: jsonql
            });
          }
        }

        categoricalX = new LayeredChartCompiler({
          schema: this.props.schema
        }).isCategoricalX(this.props.design);
        return R(uiComponents.SectionComponent, {
          label: title
        }, R(AxisComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: layer.table,
          types: this.getAxisTypes(layer, "x"),
          aggrNeed: "none",
          required: true,
          value: layer.axes.x,
          onChange: this.handleXAxisChange,
          filters: filters,
          // Only show x color map if no color axis and is categorical and enabled
          showColorMap: layer.xColorMap && categoricalX && !layer.axes.color,
          autosetColors: false,
          // Categorical X can exclude values
          allowExcludedValues: categoricalX
        }));
      }
    }, {
      key: "renderColorAxis",
      value: function renderColorAxis() {
        var layer, title;
        layer = this.props.design.layers[this.props.index];

        if (!layer.table) {
          return;
        }

        title = this.getColorAxisLabel(layer);
        return R('div', {
          className: "form-group"
        }, R('label', {
          className: "text-muted"
        }, title), R('div', {
          style: {
            marginLeft: 10
          }
        }, R(AxisComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: layer.table,
          types: this.getAxisTypes(layer, "color"),
          aggrNeed: "none",
          required: this.isLayerPolar(layer),
          showColorMap: true,
          value: layer.axes.color,
          onChange: this.handleColorAxisChange,
          allowExcludedValues: true,
          filters: this.props.filters
        })));
      }
    }, {
      key: "renderYAxis",
      value: function renderYAxis() {
        var layer, title;
        layer = this.props.design.layers[this.props.index];

        if (!layer.table) {
          return;
        }

        title = this.getYAxisLabel(layer);
        return R('div', {
          className: "form-group"
        }, R('label', {
          className: "text-muted"
        }, title), R('div', {
          style: {
            marginLeft: 10
          }
        }, R(AxisComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: layer.table,
          types: this.getAxisTypes(layer, "y"),
          aggrNeed: this.doesLayerNeedGrouping(layer) ? "required" : "none",
          value: layer.axes.y,
          required: true,
          filters: this.props.filters,
          showFormat: true,
          onChange: this.handleYAxisChange
        }), this.renderCumulative(), this.renderStacked()));
      }
    }, {
      key: "renderCumulative",
      value: function renderCumulative() {
        var axisBuilder, layer, ref;
        layer = this.props.design.layers[this.props.index]; // Can only cumulative if non-polar and y axis determined and x axis is date or number

        axisBuilder = new AxisBuilder({
          schema: this.props.schema
        });

        if (!layer.axes.y || !layer.axes.x || (ref = axisBuilder.getAxisType(layer.axes.x)) !== 'date' && ref !== 'number') {
          return;
        }

        return R('div', {
          key: "cumulative"
        }, R('label', {
          className: "checkbox-inline"
        }, R('input', {
          type: "checkbox",
          checked: layer.cumulative,
          onChange: this.handleCumulativeChange
        }), "Cumulative"));
      }
    }, {
      key: "renderStacked",
      value: function renderStacked() {
        var layer, stacked;
        layer = this.props.design.layers[this.props.index]; // Only if has color axis and there are more than one layer

        if (layer.axes.color && this.props.design.layers.length > 1) {
          stacked = layer.stacked != null ? layer.stacked : true;
          return R('div', {
            key: "stacked"
          }, R('label', {
            className: "checkbox-inline"
          }, R('input', {
            type: "checkbox",
            checked: stacked,
            onChange: this.handleStackedChange
          }), "Stacked"));
        }

        return null;
      }
    }, {
      key: "renderColor",
      value: function renderColor() {
        var categoricalX, layer;
        layer = this.props.design.layers[this.props.index]; // If not table do nothing

        if (!layer.table) {
          return;
        }

        categoricalX = new LayeredChartCompiler({
          schema: this.props.schema
        }).isCategoricalX(this.props.design);
        return R('div', {
          className: "form-group"
        }, R('label', {
          className: "text-muted"
        }, layer.axes.color ? "Default Color" : "Color"), R('div', {
          style: {
            marginLeft: 8
          }
        }, R(ColorComponent, {
          color: layer.color,
          onChange: this.handleColorChange // Allow toggling of colors

        }), layer.axes.x && categoricalX && !layer.axes.color ? R(ui.Checkbox, {
          value: layer.xColorMap,
          onChange: this.handleXColorMapChange
        }, "Set Individual Colors") : void 0));
      }
    }, {
      key: "renderFilter",
      value: function renderFilter() {
        var layer;
        layer = this.props.design.layers[this.props.index]; // If no table, hide

        if (!layer.table) {
          return null;
        }

        return R('div', {
          className: "form-group"
        }, R('label', {
          className: "text-muted"
        }, R('span', {
          className: "glyphicon glyphicon-filter"
        }), " ", "Filters"), R('div', {
          style: {
            marginLeft: 8
          }
        }, R(FilterExprComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          onChange: this.handleFilterChange,
          table: layer.table,
          value: layer.filter
        })));
      }
    }, {
      key: "render",
      value: function render() {
        var layer;
        layer = this.props.design.layers[this.props.index]; // Color axis first for pie
        // No default color for polar

        return R('div', null, this.props.index > 0 ? R('hr') : void 0, this.renderRemove(), this.renderTable(), this.isLayerPolar(layer) ? this.renderColorAxis() : void 0, this.renderXAxis(), layer.axes.x || layer.axes.color ? this.renderYAxis() : void 0, layer.axes.x && layer.axes.y && !this.isLayerPolar(layer) ? this.renderColorAxis() : void 0, !this.isLayerPolar(layer) ? layer.axes.y ? this.renderColor() : void 0 : void 0, layer.axes.y ? this.renderFilter() : void 0, layer.axes.y ? this.renderName() : void 0);
      }
    }]);
    return LayeredChartLayerDesignerComponent;
  }(React.Component);

  ;
  LayeredChartLayerDesignerComponent.propTypes = {
    design: PropTypes.object.isRequired,
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    filters: PropTypes.array // array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct

  };
  return LayeredChartLayerDesignerComponent;
}.call(void 0);