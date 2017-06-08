var AxisComponent, ColorComponent, EditPopupComponent, ExprUtils, FilterExprComponent, H, MarkerSymbolSelectComponent, MarkersLayerDesignerComponent, PropTypes, R, React, ReactSelect, TableSelectComponent, ZoomLevelsComponent, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent;

ExprUtils = require('mwater-expressions').ExprUtils;

AxisComponent = require('./../axes/AxisComponent');

ColorComponent = require('../ColorComponent');

TableSelectComponent = require('../TableSelectComponent');

ReactSelect = require('react-select');

EditPopupComponent = require('./EditPopupComponent');

ZoomLevelsComponent = require('./ZoomLevelsComponent');

MarkerSymbolSelectComponent = require('./MarkerSymbolSelectComponent');

module.exports = MarkersLayerDesignerComponent = (function(superClass) {
  extend(MarkersLayerDesignerComponent, superClass);

  function MarkersLayerDesignerComponent() {
    this.handleNameChange = bind(this.handleNameChange, this);
    this.handleSymbolChange = bind(this.handleSymbolChange, this);
    this.handleColorChange = bind(this.handleColorChange, this);
    this.handleFilterChange = bind(this.handleFilterChange, this);
    this.handleColorAxisChange = bind(this.handleColorAxisChange, this);
    this.handleGeometryAxisChange = bind(this.handleGeometryAxisChange, this);
    this.handleTableChange = bind(this.handleTableChange, this);
    return MarkersLayerDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  MarkersLayerDesignerComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func.isRequired,
    filters: PropTypes.array
  };

  MarkersLayerDesignerComponent.prototype.update = function(updates) {
    return this.props.onDesignChange(_.extend({}, this.props.design, updates));
  };

  MarkersLayerDesignerComponent.prototype.updateAxes = function(changes) {
    var axes;
    axes = _.extend({}, this.props.design.axes, changes);
    return this.update({
      axes: axes
    });
  };

  MarkersLayerDesignerComponent.prototype.handleTableChange = function(table) {
    return this.update({
      table: table
    });
  };

  MarkersLayerDesignerComponent.prototype.handleGeometryAxisChange = function(axis) {
    return this.updateAxes({
      geometry: axis
    });
  };

  MarkersLayerDesignerComponent.prototype.handleColorAxisChange = function(axis) {
    return this.updateAxes({
      color: axis
    });
  };

  MarkersLayerDesignerComponent.prototype.handleFilterChange = function(expr) {
    return this.update({
      filter: expr
    });
  };

  MarkersLayerDesignerComponent.prototype.handleColorChange = function(color) {
    return this.update({
      color: color
    });
  };

  MarkersLayerDesignerComponent.prototype.handleSymbolChange = function(symbol) {
    return this.update({
      symbol: symbol
    });
  };

  MarkersLayerDesignerComponent.prototype.handleNameChange = function(e) {
    return this.update({
      name: e.target.value
    });
  };

  MarkersLayerDesignerComponent.prototype.renderTable = function() {
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, H.i({
      className: "fa fa-database"
    }), " ", "Data Source"), H.div({
      style: {
        marginLeft: 10
      }
    }, R(TableSelectComponent, {
      schema: this.props.schema,
      value: this.props.design.table,
      onChange: this.handleTableChange
    })));
  };

  MarkersLayerDesignerComponent.prototype.renderGeometryAxis = function() {
    var title;
    if (!this.props.design.table) {
      return;
    }
    title = H.span(null, H.span({
      className: "glyphicon glyphicon-map-marker"
    }), " Marker Position");
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, title), H.div({
      style: {
        marginLeft: 10
      }
    }, R(AxisComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.design.table,
      types: ["geometry"],
      aggrNeed: "none",
      value: this.props.design.axes.geometry,
      onChange: this.handleGeometryAxisChange,
      filters: this.props.filters
    })));
  };

  MarkersLayerDesignerComponent.prototype.renderColor = function() {
    if (!this.props.design.axes.geometry) {
      return;
    }
    return H.div(null, !this.props.design.axes.color ? H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, H.span({
      className: "glyphicon glyphicon glyphicon-tint"
    }), "Marker Color"), H.div(null, R(ColorComponent, {
      color: this.props.design.color,
      onChange: this.handleColorChange
    }))) : void 0, H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, H.span({
      className: "glyphicon glyphicon glyphicon-tint"
    }), "Color By Data"), R(AxisComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.design.table,
      types: ["text", "enum", "boolean", 'date'],
      aggrNeed: "none",
      value: this.props.design.axes.color,
      defaultColor: this.props.design.color,
      showColorMap: true,
      onChange: this.handleColorAxisChange,
      allowExcludedValues: true,
      filters: this.props.filters
    })));
  };

  MarkersLayerDesignerComponent.prototype.renderSymbol = function() {
    if (!this.props.design.axes.geometry) {
      return;
    }
    return R(MarkerSymbolSelectComponent, {
      symbol: this.props.design.symbol,
      onChange: this.handleSymbolChange
    });
  };

  MarkersLayerDesignerComponent.prototype.renderFilter = function() {
    if (!this.props.design.axes.geometry) {
      return null;
    }
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, H.span({
      className: "glyphicon glyphicon-filter"
    }), " Filters"), H.div({
      style: {
        marginLeft: 8
      }
    }, R(FilterExprComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      onChange: this.handleFilterChange,
      table: this.props.design.table,
      value: this.props.design.filter
    })));
  };

  MarkersLayerDesignerComponent.prototype.renderPopup = function() {
    if (!this.props.design.table) {
      return null;
    }
    return R(EditPopupComponent, {
      design: this.props.design,
      onDesignChange: this.props.onDesignChange,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.design.table
    });
  };

  MarkersLayerDesignerComponent.prototype.render = function() {
    return H.div(null, this.renderTable(), this.renderGeometryAxis(), this.renderColor(), this.renderSymbol(), this.renderFilter(), this.renderPopup(), this.props.design.table ? R(ZoomLevelsComponent, {
      design: this.props.design,
      onDesignChange: this.props.onDesignChange
    }) : void 0);
  };

  return MarkersLayerDesignerComponent;

})(React.Component);
