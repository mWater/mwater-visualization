var AxisComponent, ColorComponent, EditPopupComponent, ExprCompiler, ExprUtils, FilterExprComponent, MarkerSymbolSelectComponent, MarkersLayerDesignerComponent, PopupFilterJoinsUtils, PropTypes, R, React, TableSelectComponent, ZoomLevelsComponent, _, ui,
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

EditPopupComponent = require('./EditPopupComponent');

ZoomLevelsComponent = require('./ZoomLevelsComponent');

MarkerSymbolSelectComponent = require('./MarkerSymbolSelectComponent');

PopupFilterJoinsUtils = require('./PopupFilterJoinsUtils');

ui = require('react-library/lib/bootstrap');

module.exports = MarkersLayerDesignerComponent = (function(superClass) {
  extend(MarkersLayerDesignerComponent, superClass);

  function MarkersLayerDesignerComponent() {
    this.handleMarkerSizeChange = bind(this.handleMarkerSizeChange, this);
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

  MarkersLayerDesignerComponent.prototype.handleMarkerSizeChange = function(markerSize) {
    return this.update({
      markerSize: markerSize
    });
  };

  MarkersLayerDesignerComponent.prototype.renderTable = function() {
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

  MarkersLayerDesignerComponent.prototype.renderGeometryAxis = function() {
    var exprCompiler, filters, jsonql, title;
    if (!this.props.design.table) {
      return;
    }
    title = R('span', null, R('span', {
      className: "glyphicon glyphicon-map-marker"
    }), " Marker Position");
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
    }, R(AxisComponent, {
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

  MarkersLayerDesignerComponent.prototype.renderColor = function() {
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
    return R('div', null, !this.props.design.axes.color ? R('div', {
      className: "form-group"
    }, R('label', {
      className: "text-muted"
    }, R('span', {
      className: "glyphicon glyphicon glyphicon-tint"
    }), "Marker Color"), R('div', null, R(ColorComponent, {
      color: this.props.design.color,
      onChange: this.handleColorChange
    }))) : void 0, R('div', {
      className: "form-group"
    }, R('label', {
      className: "text-muted"
    }, R('span', {
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

  MarkersLayerDesignerComponent.prototype.renderSymbol = function() {
    if (!this.props.design.axes.geometry) {
      return;
    }
    return R(MarkerSymbolSelectComponent, {
      symbol: this.props.design.symbol,
      onChange: this.handleSymbolChange
    });
  };

  MarkersLayerDesignerComponent.prototype.renderMarkerSize = function() {
    if (!this.props.design.axes.geometry) {
      return;
    }
    return R('div', {
      className: "form-group"
    }, R('label', {
      className: "text-muted"
    }, "Marker Size"), R(ui.Select, {
      value: this.props.design.markerSize || 10,
      options: [
        {
          value: 5,
          label: "Extra small"
        }, {
          value: 8,
          label: "Small"
        }, {
          value: 10,
          label: "Normal"
        }, {
          value: 13,
          label: "Large"
        }, {
          value: 16,
          label: "Extra large"
        }
      ],
      onChange: this.handleMarkerSizeChange
    }));
  };

  MarkersLayerDesignerComponent.prototype.renderFilter = function() {
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
      table: this.props.design.table,
      idTable: this.props.design.table,
      defaultPopupFilterJoins: PopupFilterJoinsUtils.createDefaultPopupFilterJoins(this.props.design.table)
    });
  };

  MarkersLayerDesignerComponent.prototype.render = function() {
    return R('div', null, this.renderTable(), this.renderGeometryAxis(), this.renderColor(), this.renderSymbol(), this.renderMarkerSize(), this.renderFilter(), this.renderPopup(), this.props.design.table ? R(ZoomLevelsComponent, {
      design: this.props.design,
      onDesignChange: this.props.onDesignChange
    }) : void 0);
  };

  return MarkersLayerDesignerComponent;

})(React.Component);
