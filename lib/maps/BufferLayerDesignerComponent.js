var AxisComponent, BufferLayerDesignerComponent, ColorComponent, EditPopupComponent, ExprCompiler, ExprUtils, FilterExprComponent, H, NumberInputComponent, PopupFilterJoinsUtils, PropTypes, R, Rcslider, React, TableSelectComponent, ZoomLevelsComponent, _,
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

ExprCompiler = require('mwater-expressions').ExprCompiler;

NumberInputComponent = require('react-library/lib/NumberInputComponent');

AxisComponent = require('./../axes/AxisComponent');

ColorComponent = require('../ColorComponent');

TableSelectComponent = require('../TableSelectComponent');

Rcslider = require('rc-slider');

EditPopupComponent = require('./EditPopupComponent');

ZoomLevelsComponent = require('./ZoomLevelsComponent');

PopupFilterJoinsUtils = require('./PopupFilterJoinsUtils');

module.exports = BufferLayerDesignerComponent = (function(superClass) {
  extend(BufferLayerDesignerComponent, superClass);

  function BufferLayerDesignerComponent() {
    this.handleFillOpacityChange = bind(this.handleFillOpacityChange, this);
    this.handleColorAxisChange = bind(this.handleColorAxisChange, this);
    this.handleColorChange = bind(this.handleColorChange, this);
    this.handleFilterChange = bind(this.handleFilterChange, this);
    this.handleGeometryAxisChange = bind(this.handleGeometryAxisChange, this);
    this.handleRadiusChange = bind(this.handleRadiusChange, this);
    this.handleTableChange = bind(this.handleTableChange, this);
    return BufferLayerDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  BufferLayerDesignerComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func.isRequired,
    filters: PropTypes.array
  };

  BufferLayerDesignerComponent.prototype.update = function(updates) {
    return this.props.onDesignChange(_.extend({}, this.props.design, updates));
  };

  BufferLayerDesignerComponent.prototype.updateAxes = function(changes) {
    var axes;
    axes = _.extend({}, this.props.design.axes, changes);
    return this.update({
      axes: axes
    });
  };

  BufferLayerDesignerComponent.prototype.handleTableChange = function(table) {
    return this.update({
      table: table
    });
  };

  BufferLayerDesignerComponent.prototype.handleRadiusChange = function(radius) {
    return this.update({
      radius: radius
    });
  };

  BufferLayerDesignerComponent.prototype.handleGeometryAxisChange = function(axis) {
    return this.updateAxes({
      geometry: axis
    });
  };

  BufferLayerDesignerComponent.prototype.handleFilterChange = function(expr) {
    return this.update({
      filter: expr
    });
  };

  BufferLayerDesignerComponent.prototype.handleColorChange = function(color) {
    return this.update({
      color: color
    });
  };

  BufferLayerDesignerComponent.prototype.handleColorAxisChange = function(axis) {
    return this.updateAxes({
      color: axis
    });
  };

  BufferLayerDesignerComponent.prototype.handleFillOpacityChange = function(fillOpacity) {
    return this.update({
      fillOpacity: fillOpacity / 100
    });
  };

  BufferLayerDesignerComponent.prototype.renderTable = function() {
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
      onChange: this.handleTableChange,
      filter: this.props.design.filter,
      onFilterChange: this.handleFilterChange
    })));
  };

  BufferLayerDesignerComponent.prototype.renderGeometryAxis = function() {
    var exprCompiler, filters, jsonql, title;
    if (!this.props.design.table) {
      return;
    }
    title = H.span(null, H.span({
      className: "glyphicon glyphicon-map-marker"
    }), " Circle Centers");
    filters = _.clone(this.props.filters) || [];
    if (this.props.design.filter != null) {
      exprCompiler = new ExprCompiler(this.props.schema);
      jsonql = exprCompiler.compileExpr({
        expr: this.props.design.filter,
        tableAlias: "{alias}"
      });
      if (jsonql) {
        filters.push({
          table: this.props.design.filter.table,
          jsonql: jsonql
        });
      }
    }
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, title), H.div({
      style: {
        marginLeft: 10
      }
    }, React.createElement(AxisComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.design.table,
      types: ["geometry"],
      aggrNeed: "none",
      value: this.props.design.axes.geometry,
      onChange: this.handleGeometryAxisChange,
      filters: filters
    })));
  };

  BufferLayerDesignerComponent.prototype.renderRadius = function() {
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, "Radius (meters)"), ": ", React.createElement(NumberInputComponent, {
      value: this.props.design.radius,
      onChange: this.handleRadiusChange
    }));
  };

  BufferLayerDesignerComponent.prototype.renderColor = function() {
    var exprCompiler, filters, jsonql;
    if (!this.props.design.axes.geometry) {
      return;
    }
    filters = _.clone(this.props.filters) || [];
    if (this.props.design.filter != null) {
      exprCompiler = new ExprCompiler(this.props.schema);
      jsonql = exprCompiler.compileExpr({
        expr: this.props.design.filter,
        tableAlias: "{alias}"
      });
      if (jsonql) {
        filters.push({
          table: this.props.design.filter.table,
          jsonql: jsonql
        });
      }
    }
    return H.div(null, !this.props.design.axes.color ? H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, H.span({
      className: "glyphicon glyphicon glyphicon-tint"
    }), "Circle Color"), H.div(null, R(ColorComponent, {
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
      filters: filters
    })));
  };

  BufferLayerDesignerComponent.prototype.renderFillOpacity = function() {
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, "Circle Opacity (%)"), ": ", React.createElement(Rcslider, {
      min: 0,
      max: 100,
      step: 1,
      tipTransitionName: "rc-slider-tooltip-zoom-down",
      value: this.props.design.fillOpacity * 100,
      onChange: this.handleFillOpacityChange
    }));
  };

  BufferLayerDesignerComponent.prototype.renderFilter = function() {
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
    }, React.createElement(FilterExprComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      onChange: this.handleFilterChange,
      table: this.props.design.table,
      value: this.props.design.filter
    })));
  };

  BufferLayerDesignerComponent.prototype.renderPopup = function() {
    if (!this.props.design.table) {
      return null;
    }
    return R(EditPopupComponent, {
      design: this.props.design,
      onDesignChange: this.props.onDesignChange,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.design.table,
      idTable: this.props.design.table,
      defaultPopupFilterJoins: PopupFilterJoinsUtils.createDefaultPopupFilterJoins(this.props.design.table)
    });
  };

  BufferLayerDesignerComponent.prototype.render = function() {
    return H.div(null, this.renderTable(), this.renderGeometryAxis(), this.renderRadius(), this.renderColor(), this.renderFillOpacity(), this.renderFilter(), this.renderPopup(), this.props.design.table ? R(ZoomLevelsComponent, {
      design: this.props.design,
      onDesignChange: this.props.onDesignChange
    }) : void 0);
  };

  return BufferLayerDesignerComponent;

})(React.Component);
