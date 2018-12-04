var AxisComponent, ClusterLayerDesignerComponent, ColorComponent, ExprCompiler, ExprUtils, FilterExprComponent, PropTypes, R, React, TableSelectComponent, ZoomLevelsComponent, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

R = React.createElement;

FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent;

ExprUtils = require('mwater-expressions').ExprUtils;

ExprCompiler = require('mwater-expressions').ExprCompiler;

AxisComponent = require('./../axes/AxisComponent');

ColorComponent = require('../ColorComponent');

TableSelectComponent = require('../TableSelectComponent');

ZoomLevelsComponent = require('./ZoomLevelsComponent');

module.exports = ClusterLayerDesignerComponent = (function(superClass) {
  extend(ClusterLayerDesignerComponent, superClass);

  function ClusterLayerDesignerComponent() {
    this.handleFillColorChange = bind(this.handleFillColorChange, this);
    this.handleTextColorChange = bind(this.handleTextColorChange, this);
    this.handleFilterChange = bind(this.handleFilterChange, this);
    this.handleGeometryAxisChange = bind(this.handleGeometryAxisChange, this);
    this.handleTableChange = bind(this.handleTableChange, this);
    return ClusterLayerDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  ClusterLayerDesignerComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func.isRequired,
    filters: PropTypes.array
  };

  ClusterLayerDesignerComponent.prototype.update = function(updates) {
    return this.props.onDesignChange(_.extend({}, this.props.design, updates));
  };

  ClusterLayerDesignerComponent.prototype.updateAxes = function(changes) {
    var axes;
    axes = _.extend({}, this.props.design.axes, changes);
    return this.update({
      axes: axes
    });
  };

  ClusterLayerDesignerComponent.prototype.handleTableChange = function(table) {
    return this.update({
      table: table
    });
  };

  ClusterLayerDesignerComponent.prototype.handleGeometryAxisChange = function(axis) {
    return this.updateAxes({
      geometry: axis
    });
  };

  ClusterLayerDesignerComponent.prototype.handleFilterChange = function(expr) {
    return this.update({
      filter: expr
    });
  };

  ClusterLayerDesignerComponent.prototype.handleTextColorChange = function(color) {
    return this.update({
      textColor: color
    });
  };

  ClusterLayerDesignerComponent.prototype.handleFillColorChange = function(color) {
    return this.update({
      fillColor: color
    });
  };

  ClusterLayerDesignerComponent.prototype.renderTable = function() {
    return R('div', {
      className: "form-group"
    }, R('label', {
      className: "text-muted"
    }, R('i', {
      className: "fa fa-database"
    }), " ", "Data Source"), R('div', {
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

  ClusterLayerDesignerComponent.prototype.renderGeometryAxis = function() {
    var exprCompiler, filters, jsonql, title;
    if (!this.props.design.table) {
      return;
    }
    title = R('span', null, R('span', {
      className: "glyphicon glyphicon-map-marker"
    }), " Locations to Cluster");
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
    return R('div', {
      className: "form-group"
    }, R('label', {
      className: "text-muted"
    }, title), R('div', {
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

  ClusterLayerDesignerComponent.prototype.renderTextColor = function() {
    if (!this.props.design.axes.geometry) {
      return;
    }
    return R('div', {
      className: "form-group"
    }, R('label', {
      className: "text-muted"
    }, R('span', {
      className: "glyphicon glyphicon glyphicon-tint"
    }), "Text Color"), R('div', null, R(ColorComponent, {
      color: this.props.design.textColor,
      onChange: this.handleTextColorChange
    })));
  };

  ClusterLayerDesignerComponent.prototype.renderFillColor = function() {
    if (!this.props.design.axes.geometry) {
      return;
    }
    return R('div', {
      className: "form-group"
    }, R('label', {
      className: "text-muted"
    }, R('span', {
      className: "glyphicon glyphicon glyphicon-tint"
    }), "Marker Color"), R('div', null, R(ColorComponent, {
      color: this.props.design.fillColor,
      onChange: this.handleFillColorChange
    })));
  };

  ClusterLayerDesignerComponent.prototype.renderFilter = function() {
    if (!this.props.design.axes.geometry) {
      return null;
    }
    return R('div', {
      className: "form-group"
    }, R('label', {
      className: "text-muted"
    }, R('span', {
      className: "glyphicon glyphicon-filter"
    }), " Filters"), R('div', {
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

  ClusterLayerDesignerComponent.prototype.render = function() {
    return R('div', null, this.renderTable(), this.renderGeometryAxis(), this.renderTextColor(), this.renderFillColor(), this.renderFilter(), this.props.design.table ? R(ZoomLevelsComponent, {
      design: this.props.design,
      onDesignChange: this.props.onDesignChange
    }) : void 0);
  };

  return ClusterLayerDesignerComponent;

})(React.Component);
