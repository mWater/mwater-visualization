var AxisBuilder, AxisComponent, ColorComponent, EditableLinkComponent, ExpressionBuilder, H, LayeredChartLayerDesignerComponent, LayeredChartUtils, LogicalExprComponent, R, React, ui,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

R = React.createElement;

AxisComponent = require('./../../axes/AxisComponent');

AxisBuilder = require('../../axes/AxisBuilder');

LogicalExprComponent = require('./../../expressions/LogicalExprComponent');

ExpressionBuilder = require('./../../expressions/ExpressionBuilder');

EditableLinkComponent = require('./../../EditableLinkComponent');

ColorComponent = require('../../ColorComponent');

LayeredChartUtils = require('./LayeredChartUtils');

ui = require('../../UIComponents');

module.exports = LayeredChartLayerDesignerComponent = (function(superClass) {
  extend(LayeredChartLayerDesignerComponent, superClass);

  function LayeredChartLayerDesignerComponent() {
    this.handleCumulativeChange = bind(this.handleCumulativeChange, this);
    this.handleColorChange = bind(this.handleColorChange, this);
    this.handleFilterChange = bind(this.handleFilterChange, this);
    this.handleYAxisChange = bind(this.handleYAxisChange, this);
    this.handleColorAxisChange = bind(this.handleColorAxisChange, this);
    this.handleXAxisChange = bind(this.handleXAxisChange, this);
    this.handleTableChange = bind(this.handleTableChange, this);
    this.handleNameChange = bind(this.handleNameChange, this);
    return LayeredChartLayerDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  LayeredChartLayerDesignerComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    index: React.PropTypes.number.isRequired,
    onChange: React.PropTypes.func.isRequired,
    onRemove: React.PropTypes.func.isRequired
  };

  LayeredChartLayerDesignerComponent.prototype.isLayerPolar = function(layer) {
    var ref;
    return (ref = layer.type || this.props.design.type) === 'pie' || ref === 'donut';
  };

  LayeredChartLayerDesignerComponent.prototype.isXAxisRequired = function(layer) {
    return !this.isLayerPolar(layer);
  };

  LayeredChartLayerDesignerComponent.prototype.getAxisTypes = function(layer, axisKey) {
    return LayeredChartUtils.getAxisTypes(this.props.design, layer, axisKey);
  };

  LayeredChartLayerDesignerComponent.prototype.getAxisLabel = function(icon, label) {
    return H.span(null, H.span({
      className: "glyphicon glyphicon-" + icon
    }), " " + label);
  };

  LayeredChartLayerDesignerComponent.prototype.getXAxisLabel = function(layer) {
    if (this.props.design.transpose) {
      return this.getAxisLabel("resize-vertical", "Vertical Axis");
    } else {
      return this.getAxisLabel("resize-horizontal", "Horizontal Axis");
    }
  };

  LayeredChartLayerDesignerComponent.prototype.getYAxisLabel = function(layer) {
    if (this.isLayerPolar(layer)) {
      return this.getAxisLabel("repeat", "Angle Axis");
    } else if (this.props.design.transpose) {
      return this.getAxisLabel("resize-horizontal", "Horizontal Axis");
    } else {
      return this.getAxisLabel("resize-vertical", "Vertical Axis");
    }
  };

  LayeredChartLayerDesignerComponent.prototype.getColorAxisLabel = function(layer) {
    if (this.isLayerPolar(layer)) {
      return this.getAxisLabel("text-color", "Label Axis");
    } else {
      return this.getAxisLabel("equalizer", "Split Axis");
    }
  };

  LayeredChartLayerDesignerComponent.prototype.updateLayer = function(changes) {
    var layer;
    layer = _.extend({}, this.props.design.layers[this.props.index], changes);
    return this.props.onChange(layer);
  };

  LayeredChartLayerDesignerComponent.prototype.updateAxes = function(changes) {
    var axes;
    axes = _.extend({}, this.props.design.layers[this.props.index].axes, changes);
    return this.updateLayer({
      axes: axes
    });
  };

  LayeredChartLayerDesignerComponent.prototype.handleNameChange = function(ev) {
    return this.updateLayer({
      name: ev.target.value
    });
  };

  LayeredChartLayerDesignerComponent.prototype.handleTableChange = function(table) {
    return this.updateLayer({
      table: table
    });
  };

  LayeredChartLayerDesignerComponent.prototype.handleXAxisChange = function(axis) {
    return this.updateAxes({
      x: axis
    });
  };

  LayeredChartLayerDesignerComponent.prototype.handleColorAxisChange = function(axis) {
    return this.updateAxes({
      color: axis
    });
  };

  LayeredChartLayerDesignerComponent.prototype.handleYAxisChange = function(axis) {
    return this.updateAxes({
      y: axis
    });
  };

  LayeredChartLayerDesignerComponent.prototype.handleFilterChange = function(filter) {
    return this.updateLayer({
      filter: filter
    });
  };

  LayeredChartLayerDesignerComponent.prototype.handleColorChange = function(color) {
    return this.updateLayer({
      color: color
    });
  };

  LayeredChartLayerDesignerComponent.prototype.handleCumulativeChange = function(ev) {
    return this.updateLayer({
      cumulative: ev.target.checked
    });
  };

  LayeredChartLayerDesignerComponent.prototype.renderName = function() {
    var layer;
    if (this.props.design.layers.length <= 1) {
      return;
    }
    layer = this.props.design.layers[this.props.index];
    return H.input({
      type: "text",
      className: "form-control input-sm",
      value: layer.name,
      onChange: this.handleNameChange,
      placeholder: "Series " + (this.props.index + 1)
    });
  };

  LayeredChartLayerDesignerComponent.prototype.renderRemove = function() {
    if (this.props.design.layers.length > 1) {
      return H.button({
        className: "btn btn-xs btn-link pull-right",
        type: "button",
        onClick: this.props.onRemove
      }, H.span({
        className: "glyphicon glyphicon-remove"
      }));
    }
  };

  LayeredChartLayerDesignerComponent.prototype.renderTable = function() {
    var layer;
    layer = this.props.design.layers[this.props.index];
    return R(ui.SectionComponent, {
      icon: "file",
      label: "Data Source"
    }, this.props.schema.createTableSelectElement(layer.table, this.handleTableChange));
  };

  LayeredChartLayerDesignerComponent.prototype.renderXAxis = function() {
    var layer, title;
    layer = this.props.design.layers[this.props.index];
    if (!layer.table) {
      return;
    }
    if (!this.isXAxisRequired(layer)) {
      return;
    }
    title = this.getXAxisLabel(layer);
    return R(ui.SectionComponent, {
      label: title
    }, R(AxisComponent, {
      editorTitle: title,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: layer.table,
      types: this.getAxisTypes(layer, "x"),
      aggrNeed: "none",
      required: true,
      value: layer.axes.x,
      onChange: this.handleXAxisChange
    }));
  };

  LayeredChartLayerDesignerComponent.prototype.renderColorAxis = function() {
    var layer, title;
    layer = this.props.design.layers[this.props.index];
    if (!layer.table) {
      return;
    }
    title = this.getColorAxisLabel(layer);
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, title), H.div({
      style: {
        marginLeft: 10
      }
    }, R(AxisComponent, {
      editorTitle: title,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: layer.table,
      types: this.getAxisTypes(layer, "color"),
      aggrNeed: "none",
      required: this.isLayerPolar(layer),
      value: layer.axes.color,
      onChange: this.handleColorAxisChange
    })));
  };

  LayeredChartLayerDesignerComponent.prototype.renderYAxis = function() {
    var layer, title;
    layer = this.props.design.layers[this.props.index];
    if (!layer.table) {
      return;
    }
    title = this.getYAxisLabel(layer);
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, title), H.div({
      style: {
        marginLeft: 10
      }
    }, R(AxisComponent, {
      editorTitle: title,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: layer.table,
      types: this.getAxisTypes(layer, "y"),
      aggrNeed: "required",
      value: layer.axes.y,
      required: true,
      onChange: this.handleYAxisChange
    }), this.renderCumulative()));
  };

  LayeredChartLayerDesignerComponent.prototype.renderCumulative = function() {
    var axisBuilder, layer, ref;
    layer = this.props.design.layers[this.props.index];
    axisBuilder = new AxisBuilder({
      schema: this.props.schema
    });
    if (!layer.axes.y || !layer.axes.x || ((ref = axisBuilder.getAxisType(layer.axes.x)) !== 'date' && ref !== 'decimal' && ref !== 'integer')) {
      return;
    }
    return H.div({
      key: "cumulative"
    }, H.label({
      className: "checkbox-inline"
    }, H.input({
      type: "checkbox",
      checked: layer.cumulative,
      onChange: this.handleCumulativeChange
    }), "Cumulative"));
  };

  LayeredChartLayerDesignerComponent.prototype.renderColor = function() {
    var layer;
    layer = this.props.design.layers[this.props.index];
    if (!layer.table || layer.axes.color) {
      return;
    }
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, "Color"), H.div({
      style: {
        marginLeft: 8
      }
    }, R(ColorComponent, {
      color: layer.color,
      onChange: this.handleColorChange
    })));
  };

  LayeredChartLayerDesignerComponent.prototype.renderFilter = function() {
    var layer;
    layer = this.props.design.layers[this.props.index];
    if (!layer.table) {
      return null;
    }
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, H.span({
      className: "glyphicon glyphicon-filter"
    }), " ", "Filters"), H.div({
      style: {
        marginLeft: 8
      }
    }, R(LogicalExprComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      onChange: this.handleFilterChange,
      table: layer.table,
      value: layer.filter
    })));
  };

  LayeredChartLayerDesignerComponent.prototype.render = function() {
    var layer;
    layer = this.props.design.layers[this.props.index];
    return H.div(null, this.props.index > 0 ? H.hr() : void 0, this.renderRemove(), this.renderTable(), this.isLayerPolar(layer) ? this.renderColorAxis() : void 0, this.renderXAxis(), layer.axes.x || layer.axes.color ? this.renderYAxis() : void 0, layer.axes.x && layer.axes.y && !this.isLayerPolar(layer) ? this.renderColorAxis() : void 0, layer.axes.y ? this.renderColor() : void 0, layer.axes.y ? this.renderFilter() : void 0, layer.axes.y ? this.renderName() : void 0);
  };

  return LayeredChartLayerDesignerComponent;

})(React.Component);
