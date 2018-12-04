var AdminChoroplethLayerDesigner, AdminScopeAndDetailLevelComponent, AxisComponent, ColorComponent, EditPopupComponent, ExprCompiler, ExprComponent, ExprUtils, FilterExprComponent, PropTypes, R, Rcslider, React, ScopeAndDetailLevelComponent, TableSelectComponent, ZoomLevelsComponent, _, ui,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

R = React.createElement;

FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent;

ExprComponent = require("mwater-expressions-ui").ExprComponent;

ExprCompiler = require('mwater-expressions').ExprCompiler;

ExprUtils = require('mwater-expressions').ExprUtils;

AxisComponent = require('./../axes/AxisComponent');

TableSelectComponent = require('../TableSelectComponent');

ColorComponent = require('../ColorComponent');

Rcslider = require('rc-slider')["default"];

EditPopupComponent = require('./EditPopupComponent');

ZoomLevelsComponent = require('./ZoomLevelsComponent');

ui = require('react-library/lib/bootstrap');

AdminScopeAndDetailLevelComponent = require('./AdminScopeAndDetailLevelComponent');

ScopeAndDetailLevelComponent = require('./ScopeAndDetailLevelComponent');

module.exports = AdminChoroplethLayerDesigner = (function(superClass) {
  extend(AdminChoroplethLayerDesigner, superClass);

  function AdminChoroplethLayerDesigner() {
    this.handleFilterChange = bind(this.handleFilterChange, this);
    this.handleColorAxisChange = bind(this.handleColorAxisChange, this);
    this.handleColorChange = bind(this.handleColorChange, this);
    this.handleTableChange = bind(this.handleTableChange, this);
    this.handleScopeAndDetailLevelChange = bind(this.handleScopeAndDetailLevelChange, this);
    return AdminChoroplethLayerDesigner.__super__.constructor.apply(this, arguments);
  }

  AdminChoroplethLayerDesigner.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func.isRequired,
    filters: PropTypes.array
  };

  AdminChoroplethLayerDesigner.prototype.update = function(updates) {
    return this.props.onDesignChange(_.extend({}, this.props.design, updates));
  };

  AdminChoroplethLayerDesigner.prototype.updateAxes = function(changes) {
    var axes;
    axes = _.extend({}, this.props.design.axes, changes);
    return this.update({
      axes: axes
    });
  };

  AdminChoroplethLayerDesigner.prototype.handleScopeAndDetailLevelChange = function(scope, scopeLevel, detailLevel) {
    return this.props.onDesignChange(_.extend({}, this.props.design, {
      scope: scope,
      scopeLevel: scopeLevel,
      detailLevel: detailLevel
    }));
  };

  AdminChoroplethLayerDesigner.prototype.handleTableChange = function(table) {
    var adminRegionExpr, column, i, len, ref, regionsTable;
    adminRegionExpr = null;
    regionsTable = this.props.design.regionsTable || "admin_regions";
    if (table) {
      ref = this.props.schema.getColumns(table);
      for (i = 0, len = ref.length; i < len; i++) {
        column = ref[i];
        if (column.type === "join" && column.join.type === "n-1" && column.join.toTable === regionsTable) {
          adminRegionExpr = {
            type: "field",
            table: table,
            column: column.id
          };
          break;
        }
      }
    }
    return this.props.onDesignChange(_.extend({}, this.props.design, {
      table: table,
      adminRegionExpr: adminRegionExpr
    }));
  };

  AdminChoroplethLayerDesigner.prototype.handleColorChange = function(color) {
    return this.update({
      color: color
    });
  };

  AdminChoroplethLayerDesigner.prototype.handleColorAxisChange = function(axis) {
    return this.updateAxes({
      color: axis
    });
  };

  AdminChoroplethLayerDesigner.prototype.handleFilterChange = function(expr) {
    return this.update({
      filter: expr
    });
  };

  AdminChoroplethLayerDesigner.prototype.renderTable = function() {
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

  AdminChoroplethLayerDesigner.prototype.renderRegionsTable = function() {
    return R('div', {
      className: "form-group"
    }, R('label', {
      className: "text-muted"
    }, "Regions Type"), R('div', {
      style: {
        marginLeft: 8
      }
    }, R(ui.Select, {
      value: this.props.design.regionsTable,
      onChange: (function(_this) {
        return function(value) {
          return _this.update({
            regionsTable: value,
            scope: null,
            scopeLevel: null,
            detailLevel: 0,
            adminRegionExpr: null
          });
        };
      })(this),
      options: _.map(_.filter(this.props.schema.getTables(), (function(_this) {
        return function(table) {
          return table.id.startsWith("regions.");
        };
      })(this)), (function(_this) {
        return function(table) {
          return {
            value: table.id,
            label: table.name.en
          };
        };
      })(this)),
      nullLabel: "Administrative Regions"
    })));
  };

  AdminChoroplethLayerDesigner.prototype.renderAdminRegionExpr = function() {
    var regionsTable;
    if (!this.props.design.table) {
      return null;
    }
    regionsTable = this.props.design.regionsTable || "admin_regions";
    return R('div', {
      className: "form-group"
    }, R('label', {
      className: "text-muted"
    }, R('span', {
      className: "glyphicon glyphicon-map-marker"
    }), " Location"), R('div', {
      style: {
        marginLeft: 8
      }
    }, R(ExprComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      onChange: (function(_this) {
        return function(expr) {
          return _this.update({
            adminRegionExpr: expr
          });
        };
      })(this),
      table: this.props.design.table,
      types: ["id"],
      idTable: regionsTable,
      value: this.props.design.adminRegionExpr
    })));
  };

  AdminChoroplethLayerDesigner.prototype.renderScopeAndDetailLevel = function() {
    var regionsTable;
    regionsTable = this.props.design.regionsTable || "admin_regions";
    if (regionsTable === "admin_regions") {
      return R(AdminScopeAndDetailLevelComponent, {
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        scope: this.props.design.scope,
        scopeLevel: this.props.design.scopeLevel || 0,
        detailLevel: this.props.design.detailLevel,
        onScopeAndDetailLevelChange: this.handleScopeAndDetailLevelChange
      });
    } else {
      return R(ScopeAndDetailLevelComponent, {
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        scope: this.props.design.scope,
        scopeLevel: this.props.design.scopeLevel,
        detailLevel: this.props.design.detailLevel,
        onScopeAndDetailLevelChange: this.handleScopeAndDetailLevelChange,
        regionsTable: regionsTable
      });
    }
  };

  AdminChoroplethLayerDesigner.prototype.renderDisplayNames = function() {
    return R('div', {
      className: "form-group"
    }, R('div', {
      className: "checkbox"
    }, R('label', null, R('input', {
      type: "checkbox",
      checked: this.props.design.displayNames,
      onChange: (function(_this) {
        return function(ev) {
          return _this.update({
            displayNames: ev.target.checked
          });
        };
      })(this)
    }), "Display Region Names")));
  };

  AdminChoroplethLayerDesigner.prototype.renderColor = function() {
    var exprCompiler, filters, jsonql;
    if (!this.props.design.table) {
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
    }), "Fill Color"), R('div', null, R(ColorComponent, {
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
      aggrNeed: "required",
      value: this.props.design.axes.color,
      defaultColor: this.props.design.color,
      showColorMap: true,
      onChange: this.handleColorAxisChange,
      allowExcludedValues: true,
      filters: filters
    })));
  };

  AdminChoroplethLayerDesigner.prototype.renderFillOpacity = function() {
    return R('div', {
      className: "form-group"
    }, R('label', {
      className: "text-muted"
    }, "Fill Opacity (%)"), ": ", R(Rcslider, {
      min: 0,
      max: 100,
      step: 1,
      tipTransitionName: "rc-slider-tooltip-zoom-down",
      value: this.props.design.fillOpacity * 100,
      onChange: (function(_this) {
        return function(val) {
          return _this.update({
            fillOpacity: val / 100
          });
        };
      })(this)
    }));
  };

  AdminChoroplethLayerDesigner.prototype.renderFilter = function() {
    if (!this.props.design.table) {
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

  AdminChoroplethLayerDesigner.prototype.renderPopup = function() {
    var defaultPopupFilterJoins, regionsTable;
    if (!this.props.design.table) {
      return null;
    }
    regionsTable = this.props.design.regionsTable || "admin_regions";
    defaultPopupFilterJoins = {};
    if (this.props.design.adminRegionExpr) {
      defaultPopupFilterJoins[this.props.design.table] = this.props.design.adminRegionExpr;
    }
    return R(EditPopupComponent, {
      design: this.props.design,
      onDesignChange: this.props.onDesignChange,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.design.table,
      idTable: regionsTable,
      defaultPopupFilterJoins: defaultPopupFilterJoins
    });
  };

  AdminChoroplethLayerDesigner.prototype.render = function() {
    return R('div', null, this.renderTable(), this.renderRegionsTable(), this.renderAdminRegionExpr(), this.renderScopeAndDetailLevel(), this.renderDisplayNames(), this.renderColor(), this.renderFillOpacity(), this.renderFilter(), this.renderPopup(), this.props.design.table ? R(ZoomLevelsComponent, {
      design: this.props.design,
      onDesignChange: this.props.onDesignChange
    }) : void 0);
  };

  return AdminChoroplethLayerDesigner;

})(React.Component);
