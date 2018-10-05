var AxisBuilder, AxisComponent, ColorComponent, ExprCompiler, ExprUtils, FilterExprComponent, LayeredChartCompiler, LayeredChartLayerDesignerComponent, LayeredChartUtils, PropTypes, R, React, TableSelectComponent, ui,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

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

ui = require('../../../UIComponents');

TableSelectComponent = require('../../../TableSelectComponent');

module.exports = LayeredChartLayerDesignerComponent = (function(superClass) {
  extend(LayeredChartLayerDesignerComponent, superClass);

  function LayeredChartLayerDesignerComponent() {
    this.handleStackedChange = bind(this.handleStackedChange, this);
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
    design: PropTypes.object.isRequired,
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    filters: PropTypes.array
  };

  LayeredChartLayerDesignerComponent.prototype.isLayerPolar = function(layer) {
    var ref;
    return (ref = layer.type || this.props.design.type) === 'pie' || ref === 'donut';
  };

  LayeredChartLayerDesignerComponent.prototype.doesLayerNeedGrouping = function(layer) {
    var ref;
    return (ref = layer.type || this.props.design.type) !== 'scatter';
  };

  LayeredChartLayerDesignerComponent.prototype.isXAxisRequired = function(layer) {
    return !this.isLayerPolar(layer);
  };

  LayeredChartLayerDesignerComponent.prototype.getAxisTypes = function(layer, axisKey) {
    return LayeredChartUtils.getAxisTypes(this.props.design, layer, axisKey);
  };

  LayeredChartLayerDesignerComponent.prototype.getAxisLabel = function(icon, label) {
    return R('span', null, R('span', {
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
    var axesChanges, layer, ref;
    layer = this.props.design.layers[this.props.index];
    axesChanges = {
      x: axis
    };
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
  };

  LayeredChartLayerDesignerComponent.prototype.handleColorAxisChange = function(axis) {
    var axesChanges, layer, ref;
    layer = this.props.design.layers[this.props.index];
    axesChanges = {
      color: axis
    };
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

  LayeredChartLayerDesignerComponent.prototype.handleStackedChange = function(ev) {
    return this.updateLayer({
      stacked: ev.target.checked
    });
  };

  LayeredChartLayerDesignerComponent.prototype.renderName = function() {
    var layer;
    if (this.props.design.layers.length <= 1) {
      return;
    }
    layer = this.props.design.layers[this.props.index];
    return R('input', {
      type: "text",
      className: "form-control input-sm",
      value: layer.name,
      onChange: this.handleNameChange,
      placeholder: "Series " + (this.props.index + 1)
    });
  };

  LayeredChartLayerDesignerComponent.prototype.renderRemove = function() {
    if (this.props.design.layers.length > 1) {
      return R('button', {
        className: "btn btn-xs btn-link pull-right",
        type: "button",
        onClick: this.props.onRemove
      }, R('span', {
        className: "glyphicon glyphicon-remove"
      }));
    }
  };

  LayeredChartLayerDesignerComponent.prototype.renderTable = function() {
    var layer;
    layer = this.props.design.layers[this.props.index];
    return R(ui.SectionComponent, {
      icon: "fa-database",
      label: "Data Source"
    }, R(TableSelectComponent, {
      schema: this.props.schema,
      value: layer.table,
      onChange: this.handleTableChange,
      filter: layer.filter,
      onFilterChange: this.handleFilterChange
    }));
  };

  LayeredChartLayerDesignerComponent.prototype.renderXAxis = function() {
    var exprCompiler, filters, jsonql, layer, title;
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
    return R(ui.SectionComponent, {
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
      allowExcludedValues: new LayeredChartCompiler({
        schema: this.props.schema
      }).isCategoricalX(this.props.design)
    }));
  };

  LayeredChartLayerDesignerComponent.prototype.renderColorAxis = function() {
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
  };

  LayeredChartLayerDesignerComponent.prototype.renderYAxis = function() {
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
  };

  LayeredChartLayerDesignerComponent.prototype.renderCumulative = function() {
    var axisBuilder, layer, ref;
    layer = this.props.design.layers[this.props.index];
    axisBuilder = new AxisBuilder({
      schema: this.props.schema
    });
    if (!layer.axes.y || !layer.axes.x || ((ref = axisBuilder.getAxisType(layer.axes.x)) !== 'date' && ref !== 'number')) {
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
  };

  LayeredChartLayerDesignerComponent.prototype.renderStacked = function() {
    var layer, stacked;
    layer = this.props.design.layers[this.props.index];
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
  };

  LayeredChartLayerDesignerComponent.prototype.renderColor = function() {
    var layer;
    layer = this.props.design.layers[this.props.index];
    if (!layer.table) {
      return;
    }
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
      onChange: this.handleColorChange
    })));
  };

  LayeredChartLayerDesignerComponent.prototype.renderFilter = function() {
    var layer;
    layer = this.props.design.layers[this.props.index];
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
  };

  LayeredChartLayerDesignerComponent.prototype.render = function() {
    var layer;
    layer = this.props.design.layers[this.props.index];
    return R('div', null, this.props.index > 0 ? R('hr') : void 0, this.renderRemove(), this.renderTable(), this.isLayerPolar(layer) ? this.renderColorAxis() : void 0, this.renderXAxis(), layer.axes.x || layer.axes.color ? this.renderYAxis() : void 0, layer.axes.x && layer.axes.y && !this.isLayerPolar(layer) ? this.renderColorAxis() : void 0, !this.isLayerPolar(layer) ? layer.axes.y ? this.renderColor() : void 0 : void 0, layer.axes.y ? this.renderFilter() : void 0, layer.axes.y ? this.renderName() : void 0);
  };

  return LayeredChartLayerDesignerComponent;

})(React.Component);
