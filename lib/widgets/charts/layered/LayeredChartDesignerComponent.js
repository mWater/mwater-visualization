var LabeledInlineComponent, LayeredChartCompiler, LayeredChartDesignerComponent, LayeredChartLayerDesignerComponent, PropTypes, R, React, TabbedComponent, ThresholdComponent, ThresholdsComponent, ui, uiComponents,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

React = require('react');

R = React.createElement;

LayeredChartLayerDesignerComponent = require('./LayeredChartLayerDesignerComponent');

LayeredChartCompiler = require('./LayeredChartCompiler');

TabbedComponent = require('react-library/lib/TabbedComponent');

uiComponents = require('../../../UIComponents');

ui = require('react-library/lib/bootstrap');

module.exports = LayeredChartDesignerComponent = (function(superClass) {
  extend(LayeredChartDesignerComponent, superClass);

  function LayeredChartDesignerComponent() {
    this.renderLayer = bind(this.renderLayer, this);
    this.handleToggleYAxisLabelClick = bind(this.handleToggleYAxisLabelClick, this);
    this.handleToggleXAxisLabelClick = bind(this.handleToggleXAxisLabelClick, this);
    this.handleYAxisLabelTextChange = bind(this.handleYAxisLabelTextChange, this);
    this.handleXAxisLabelTextChange = bind(this.handleXAxisLabelTextChange, this);
    this.handleAddLayer = bind(this.handleAddLayer, this);
    this.handleRemoveLayer = bind(this.handleRemoveLayer, this);
    this.handleLayerChange = bind(this.handleLayerChange, this);
    this.handleYThresholdsChange = bind(this.handleYThresholdsChange, this);
    this.handleLabelsChange = bind(this.handleLabelsChange, this);
    this.handleProportionalChange = bind(this.handleProportionalChange, this);
    this.handleStackedChange = bind(this.handleStackedChange, this);
    this.handleTransposeChange = bind(this.handleTransposeChange, this);
    this.handleTypeChange = bind(this.handleTypeChange, this);
    return LayeredChartDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  LayeredChartDesignerComponent.propTypes = {
    design: PropTypes.object.isRequired,
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func.isRequired,
    filters: PropTypes.array
  };

  LayeredChartDesignerComponent.prototype.areAxesLabelsNeeded = function(layer) {
    var ref;
    return (ref = this.props.design.type) !== 'pie' && ref !== 'donut';
  };

  LayeredChartDesignerComponent.prototype.updateDesign = function(changes) {
    var design;
    design = _.extend({}, this.props.design, changes);
    return this.props.onDesignChange(design);
  };

  LayeredChartDesignerComponent.prototype.handleTypeChange = function(type) {
    return this.updateDesign({
      type: type
    });
  };

  LayeredChartDesignerComponent.prototype.handleTransposeChange = function(ev) {
    return this.updateDesign({
      transpose: ev.target.checked
    });
  };

  LayeredChartDesignerComponent.prototype.handleStackedChange = function(ev) {
    return this.updateDesign({
      stacked: ev.target.checked
    });
  };

  LayeredChartDesignerComponent.prototype.handleProportionalChange = function(ev) {
    return this.updateDesign({
      proportional: ev.target.checked
    });
  };

  LayeredChartDesignerComponent.prototype.handleLabelsChange = function(ev) {
    return this.updateDesign({
      labels: ev.target.checked
    });
  };

  LayeredChartDesignerComponent.prototype.handleYThresholdsChange = function(yThresholds) {
    return this.updateDesign({
      yThresholds: yThresholds
    });
  };

  LayeredChartDesignerComponent.prototype.handleLayerChange = function(index, layer) {
    var layers;
    layers = this.props.design.layers.slice();
    layers[index] = layer;
    return this.updateDesign({
      layers: layers
    });
  };

  LayeredChartDesignerComponent.prototype.handleRemoveLayer = function(index) {
    var layers;
    layers = this.props.design.layers.slice();
    layers.splice(index, 1);
    return this.updateDesign({
      layers: layers
    });
  };

  LayeredChartDesignerComponent.prototype.handleAddLayer = function() {
    var layers;
    layers = this.props.design.layers.slice();
    layers.push({});
    return this.updateDesign({
      layers: layers
    });
  };

  LayeredChartDesignerComponent.prototype.handleXAxisLabelTextChange = function(ev) {
    return this.updateDesign({
      xAxisLabelText: ev.target.value
    });
  };

  LayeredChartDesignerComponent.prototype.handleYAxisLabelTextChange = function(ev) {
    return this.updateDesign({
      yAxisLabelText: ev.target.value
    });
  };

  LayeredChartDesignerComponent.prototype.handleToggleXAxisLabelClick = function(ev) {
    return this.updateDesign({
      xAxisLabelText: this.props.design.xAxisLabelText != null ? null : ""
    });
  };

  LayeredChartDesignerComponent.prototype.handleToggleYAxisLabelClick = function(ev) {
    return this.updateDesign({
      yAxisLabelText: this.props.design.yAxisLabelText != null ? null : ""
    });
  };

  LayeredChartDesignerComponent.prototype.renderLabels = function() {
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
  };

  LayeredChartDesignerComponent.prototype.renderType = function() {
    var chartTypes, current;
    chartTypes = [
      {
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
      }
    ];
    current = _.findWhere(chartTypes, {
      id: this.props.design.type
    });
    return R(uiComponents.SectionComponent, {
      icon: "glyphicon-th",
      label: "Chart Type"
    }, R(uiComponents.ToggleEditComponent, {
      forceOpen: !this.props.design.type,
      label: current ? current.name : "",
      editor: (function(_this) {
        return function(onClose) {
          return R(uiComponents.OptionListComponent, {
            hint: "Select a Chart Type",
            items: _.map(chartTypes, function(ct) {
              return {
                name: ct.name,
                desc: ct.desc,
                onClick: function() {
                  onClose();
                  return _this.handleTypeChange(ct.id);
                }
              };
            })
          });
        };
      })(this)
    }), this.renderOptions());
  };

  LayeredChartDesignerComponent.prototype.renderLayer = function(index) {
    var style;
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
  };

  LayeredChartDesignerComponent.prototype.renderLayers = function() {
    if (!this.props.design.type) {
      return;
    }
    return R('div', null, _.map(this.props.design.layers, (function(_this) {
      return function(layer, i) {
        return _this.renderLayer(i);
      };
    })(this)), this.props.design.layers.length > 0 && _.last(this.props.design.layers).table ? R('button', {
      className: "btn btn-link",
      type: "button",
      onClick: this.handleAddLayer
    }, R('span', {
      className: "glyphicon glyphicon-plus"
    }), " Add Another Series") : void 0);
  };

  LayeredChartDesignerComponent.prototype.renderOptions = function() {
    var canStack, canTranspose, design, ref, ref1;
    design = this.props.design;
    if (!design.type) {
      return;
    }
    canStack = ((ref = design.type) !== 'pie' && ref !== 'donut') && design.layers.length > 0;
    if (design.layers.length === 1 && !design.layers[0].axes.color) {
      canStack = false;
    }
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
    }), "Show Values"));
  };

  LayeredChartDesignerComponent.prototype.renderThresholds = function() {
    var ref;
    if ((ref = this.props.design.type) !== 'pie' && ref !== 'donut') {
      return R(uiComponents.SectionComponent, {
        label: "Y Threshold Lines"
      }, R(ThresholdsComponent, {
        thresholds: this.props.design.yThresholds,
        onThresholdsChange: this.handleYThresholdsChange
      }));
    }
  };

  LayeredChartDesignerComponent.prototype.render = function() {
    var tabs;
    tabs = [];
    tabs.push({
      id: "design",
      label: "Design",
      elem: R('div', null, R('br'), this.renderType(), this.renderLayers(), this.renderThresholds())
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
  };

  return LayeredChartDesignerComponent;

})(React.Component);

ThresholdsComponent = (function(superClass) {
  extend(ThresholdsComponent, superClass);

  function ThresholdsComponent() {
    this.handleRemove = bind(this.handleRemove, this);
    this.handleChange = bind(this.handleChange, this);
    this.handleAdd = bind(this.handleAdd, this);
    return ThresholdsComponent.__super__.constructor.apply(this, arguments);
  }

  ThresholdsComponent.propTypes = {
    thresholds: PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.number,
      label: PropTypes.string
    })),
    onThresholdsChange: PropTypes.func.isRequired
  };

  ThresholdsComponent.prototype.handleAdd = function() {
    var thresholds;
    thresholds = (this.props.thresholds || []).slice();
    thresholds.push({
      value: null,
      label: ""
    });
    return this.props.onThresholdsChange(thresholds);
  };

  ThresholdsComponent.prototype.handleChange = function(index, value) {
    var thresholds;
    thresholds = (this.props.thresholds || []).slice();
    thresholds[index] = value;
    return this.props.onThresholdsChange(thresholds);
  };

  ThresholdsComponent.prototype.handleRemove = function(index) {
    var thresholds;
    thresholds = (this.props.thresholds || []).slice();
    thresholds.splice(index, 1);
    return this.props.onThresholdsChange(thresholds);
  };

  ThresholdsComponent.prototype.render = function() {
    return R('div', null, _.map(this.props.thresholds, (function(_this) {
      return function(threshold, index) {
        return R(ThresholdComponent, {
          threshold: threshold,
          onThresholdChange: _this.handleChange.bind(null, index),
          onRemove: _this.handleRemove.bind(null, index)
        });
      };
    })(this)), R('button', {
      type: "button",
      className: "btn btn-xs btn-link",
      onClick: this.handleAdd
    }, R('i', {
      className: "fa fa-plus"
    }), " Add Y Threshold"));
  };

  return ThresholdsComponent;

})(React.Component);

ThresholdComponent = (function(superClass) {
  extend(ThresholdComponent, superClass);

  function ThresholdComponent() {
    return ThresholdComponent.__super__.constructor.apply(this, arguments);
  }

  ThresholdComponent.propTypes = {
    threshold: PropTypes.shape({
      value: PropTypes.number,
      label: PropTypes.string
    }).isRequired,
    onThresholdChange: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired
  };

  ThresholdComponent.prototype.render = function() {
    return R('div', null, R(LabeledInlineComponent, {
      key: "value",
      label: "Value:"
    }, R(ui.NumberInput, {
      style: {
        display: "inline-block"
      },
      size: "sm",
      value: this.props.threshold.value,
      onChange: (function(_this) {
        return function(v) {
          return _this.props.onThresholdChange(_.extend({}, _this.props.threshold, {
            value: v
          }));
        };
      })(this)
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
      onChange: (function(_this) {
        return function(v) {
          return _this.props.onThresholdChange(_.extend({}, _this.props.threshold, {
            label: v
          }));
        };
      })(this)
    })), "  ", R('button', {
      className: "btn btn-xs btn-link",
      onClick: this.props.onRemove
    }, R('i', {
      className: "fa fa-remove"
    })));
  };

  return ThresholdComponent;

})(React.Component);

LabeledInlineComponent = function(props) {
  return R('div', {
    style: {
      display: "inline-block"
    }
  }, R('label', {
    className: "text-muted"
  }, props.label), props.children);
};
