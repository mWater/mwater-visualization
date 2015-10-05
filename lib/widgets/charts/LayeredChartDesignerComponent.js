var H, LayeredChartCompiler, LayeredChartDesignerComponent, LayeredChartLayerDesignerComponent, R, React, TabbedComponent, ui,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

R = React.createElement;

LayeredChartLayerDesignerComponent = require('./LayeredChartLayerDesignerComponent');

LayeredChartCompiler = require('./LayeredChartCompiler');

TabbedComponent = require("../../TabbedComponent");

ui = require('../../UIComponents');

module.exports = LayeredChartDesignerComponent = (function(superClass) {
  extend(LayeredChartDesignerComponent, superClass);

  function LayeredChartDesignerComponent() {
    this.renderLayer = bind(this.renderLayer, this);
    this.handleYAxisLabelTextChange = bind(this.handleYAxisLabelTextChange, this);
    this.handleXAxisLabelTextChange = bind(this.handleXAxisLabelTextChange, this);
    this.handleTitleTextChange = bind(this.handleTitleTextChange, this);
    this.handleAddLayer = bind(this.handleAddLayer, this);
    this.handleRemoveLayer = bind(this.handleRemoveLayer, this);
    this.handleLayerChange = bind(this.handleLayerChange, this);
    this.handleProportionalChange = bind(this.handleProportionalChange, this);
    this.handleStackedChange = bind(this.handleStackedChange, this);
    this.handleTransposeChange = bind(this.handleTransposeChange, this);
    this.handleTypeChange = bind(this.handleTypeChange, this);
    return LayeredChartDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  LayeredChartDesignerComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func.isRequired
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

  LayeredChartDesignerComponent.prototype.handleTitleTextChange = function(ev) {
    return this.updateDesign({
      titleText: ev.target.value
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

  LayeredChartDesignerComponent.prototype.renderLabels = function() {
    var compiler;
    if (!this.props.design.type) {
      return;
    }
    compiler = new LayeredChartCompiler({
      schema: this.props.schema
    });
    return H.div(null, H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, "Title"), H.input({
      type: "text",
      className: "form-control input-sm",
      value: this.props.design.titleText,
      onChange: this.handleTitleTextChange,
      placeholder: compiler.compileDefaultTitleText(this.props.design)
    })), this.areAxesLabelsNeeded() ? H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, this.props.design.transpose ? "Vertical Axis Label" : "Horizontal Axis Label"), H.input({
      type: "text",
      className: "form-control input-sm",
      value: this.props.design.xAxisLabelText,
      onChange: this.handleXAxisLabelTextChange,
      placeholder: compiler.compileDefaultXAxisLabelText(this.props.design)
    })) : void 0, this.areAxesLabelsNeeded() ? H.div(null, H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, !this.props.design.transpose ? "Vertical Axis Label" : "Horizontal Axis Label"), H.input({
      type: "text",
      className: "form-control input-sm",
      value: this.props.design.yAxisLabelText,
      onChange: this.handleYAxisLabelTextChange,
      placeholder: compiler.compileDefaultYAxisLabelText(this.props.design)
    }))) : void 0);
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
    return R(ui.SectionComponent, {
      icon: "th",
      label: "Chart Type"
    }, R(ui.ToggleEditComponent, {
      forceOpen: !this.props.design.type,
      label: current ? current.name : "",
      editor: (function(_this) {
        return function(onClose) {
          return R(ui.BigOptionsComponent, {
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
    return H.div({
      style: style,
      key: index
    }, R(LayeredChartLayerDesignerComponent, {
      design: this.props.design,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      index: index,
      onChange: this.handleLayerChange.bind(null, index),
      onRemove: this.handleRemoveLayer.bind(null, index)
    }));
  };

  LayeredChartDesignerComponent.prototype.renderLayers = function() {
    if (!this.props.design.type) {
      return;
    }
    return H.div(null, _.map(this.props.design.layers, (function(_this) {
      return function(layer, i) {
        return _this.renderLayer(i);
      };
    })(this)), H.button({
      className: "btn btn-link",
      type: "button",
      onClick: this.handleAddLayer
    }, H.span({
      className: "glyphicon glyphicon-plus"
    }), " Add Another Series"));
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
    return H.div({
      className: "text-muted"
    }, canTranspose ? H.label({
      className: "checkbox-inline"
    }, H.input({
      type: "checkbox",
      checked: design.transpose,
      onChange: this.handleTransposeChange,
      key: "transpose"
    }, "Horizontal")) : void 0, canStack ? (H.label({
      className: "checkbox-inline",
      key: "stacked"
    }, H.input({
      type: "checkbox",
      checked: design.stacked,
      onChange: this.handleStackedChange
    }), "Stacked"), H.label({
      className: "checkbox-inline",
      key: "proportional"
    }, H.input({
      type: "checkbox",
      checked: design.proportional,
      onChange: this.handleProportionalChange
    }, "Proportional"))) : void 0);
  };

  LayeredChartDesignerComponent.prototype.render = function() {
    var tabs;
    tabs = [];
    tabs.push({
      id: "design",
      label: "Design",
      elem: H.div(null, H.br(), this.renderType(), this.renderLayers())
    });
    if (this.props.design.type) {
      tabs.push({
        id: "labels",
        label: "Labels",
        elem: H.div(null, H.br(), this.renderLabels())
      });
    }
    return R(TabbedComponent, {
      initialTabId: "design",
      tabs: tabs
    });
  };

  return LayeredChartDesignerComponent;

})(React.Component);
