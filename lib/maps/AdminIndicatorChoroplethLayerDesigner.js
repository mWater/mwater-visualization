var AdminIndicatorChoroplethLayerDesigner, ExprComponent, ExprUtils, FilterExprComponent, H, React, ReactSelect, TableSelectComponent, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent;

ExprComponent = require("mwater-expressions-ui").ExprComponent;

ExprUtils = require('mwater-expressions').ExprUtils;

TableSelectComponent = require('../TableSelectComponent');

ReactSelect = require('react-select');

module.exports = AdminIndicatorChoroplethLayerDesigner = (function(superClass) {
  extend(AdminIndicatorChoroplethLayerDesigner, superClass);

  function AdminIndicatorChoroplethLayerDesigner() {
    this.handleBasisChange = bind(this.handleBasisChange, this);
    this.handleConditionChange = bind(this.handleConditionChange, this);
    this.handleAdminRegionExprChange = bind(this.handleAdminRegionExprChange, this);
    this.handleTableChange = bind(this.handleTableChange, this);
    this.handleScopeAndDetailLevelChange = bind(this.handleScopeAndDetailLevelChange, this);
    return AdminIndicatorChoroplethLayerDesigner.__super__.constructor.apply(this, arguments);
  }

  AdminIndicatorChoroplethLayerDesigner.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func.isRequired
  };

  AdminIndicatorChoroplethLayerDesigner.prototype.update = function(updates) {
    return this.props.onDesignChange(_.extend({}, this.props.design, updates));
  };

  AdminIndicatorChoroplethLayerDesigner.prototype.handleScopeAndDetailLevelChange = function(scope, detailLevel) {
    return this.update({
      scope: scope,
      detailLevel: detailLevel
    });
  };

  AdminIndicatorChoroplethLayerDesigner.prototype.handleTableChange = function(table) {
    return this.update({
      table: table
    });
  };

  AdminIndicatorChoroplethLayerDesigner.prototype.handleAdminRegionExprChange = function(expr) {
    return this.update({
      adminRegionExpr: expr
    });
  };

  AdminIndicatorChoroplethLayerDesigner.prototype.handleConditionChange = function(expr) {
    return this.update({
      condition: expr
    });
  };

  AdminIndicatorChoroplethLayerDesigner.prototype.handleBasisChange = function(expr) {
    return this.update({
      basis: expr
    });
  };

  AdminIndicatorChoroplethLayerDesigner.prototype.renderTable = function() {
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, H.span({
      className: "glyphicon glyphicon-file"
    }), " ", "Data Source"), ": ", React.createElement(TableSelectComponent, {
      schema: this.props.schema,
      value: this.props.design.table,
      onChange: this.handleTableChange
    }));
  };

  AdminIndicatorChoroplethLayerDesigner.prototype.renderAdminRegionExpr = function() {
    if (!this.props.design.table) {
      return null;
    }
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, H.span({
      className: "glyphicon glyphicon-map-marker"
    }), " Location"), H.div({
      style: {
        marginLeft: 8
      }
    }, React.createElement(ExprComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      onChange: this.handleAdminRegionExprChange,
      table: this.props.design.table,
      types: ["id"],
      idTable: "admin_regions",
      value: this.props.design.adminRegionExpr
    })));
  };

  AdminIndicatorChoroplethLayerDesigner.prototype.renderCondition = function() {
    if (!this.props.design.table) {
      return null;
    }
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, H.span({
      className: "glyphicon glyphicon-scale"
    }), " Condition (numerator)"), H.div({
      style: {
        marginLeft: 8
      }
    }, React.createElement(FilterExprComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      onChange: this.handleConditionChange,
      table: this.props.design.table,
      value: this.props.design.condition
    })));
  };

  AdminIndicatorChoroplethLayerDesigner.prototype.renderBasis = function() {
    if (!this.props.design.table) {
      return null;
    }
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, H.span({
      className: "glyphicon glyphicon-filter"
    }), " Basis (denominator)"), H.div({
      style: {
        marginLeft: 8
      }
    }, React.createElement(FilterExprComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      onChange: this.handleBasisChange,
      table: this.props.design.table,
      value: this.props.design.basis
    })));
  };

  AdminIndicatorChoroplethLayerDesigner.prototype.renderRegionAndDetailLevel = function() {
    var getOptions;
    getOptions = (function(_this) {
      return function(input, cb) {
        var query;
        query = {
          type: "query",
          selects: [
            {
              type: "select",
              expr: {
                type: "field",
                tableAlias: "main",
                column: "country_id"
              },
              alias: "country_id"
            }, {
              type: "select",
              expr: {
                type: "field",
                tableAlias: "main",
                column: "country"
              },
              alias: "country"
            }, {
              type: "select",
              expr: {
                type: "field",
                tableAlias: "main",
                column: "level"
              },
              alias: "level"
            }, {
              type: "select",
              expr: {
                type: "field",
                tableAlias: "main",
                column: "name"
              },
              alias: "name"
            }
          ],
          from: {
            type: "table",
            table: "admin_region_levels",
            alias: "main"
          }
        };
        _this.props.dataSource.performQuery(query, function(err, rows) {
          if (err) {
            cb(err);
            return;
          }
          return cb(null, {
            options: [
              {
                value: ":0",
                label: "Countries"
              }
            ].concat(_.map(rows, function(r) {
              return {
                value: r.country_id + ":" + r.level,
                label: r.name + " (" + r.country + ")"
              };
            })),
            complete: true
          });
        });
      };
    })(this);
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, "Detail Level"), React.createElement(ReactSelect, {
      placeholder: "Select...",
      value: this.props.design.detailLevel != null ? (this.props.design.scope || "") + ":" + this.props.design.detailLevel : "",
      asyncOptions: getOptions,
      clearable: false,
      onChange: (function(_this) {
        return function(value) {
          return _this.handleScopeAndDetailLevelChange(value.split(":")[0] || null, parseInt(value.split(":")[1]));
        };
      })(this)
    }));
  };

  AdminIndicatorChoroplethLayerDesigner.prototype.render = function() {
    return H.div(null, this.renderRegionAndDetailLevel(), this.renderTable(), this.renderAdminRegionExpr(), this.renderCondition(), this.renderBasis());
  };

  return AdminIndicatorChoroplethLayerDesigner;

})(React.Component);
