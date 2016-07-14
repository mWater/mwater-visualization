var AdminChoroplethLayerDesigner, AxisComponent, ColorComponent, ExprComponent, ExprUtils, FilterExprComponent, H, Rcslider, React, ReactSelect, TableSelectComponent, _, updt,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

updt = require('../updt');

FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent;

ExprComponent = require("mwater-expressions-ui").ExprComponent;

ExprUtils = require('mwater-expressions').ExprUtils;

AxisComponent = require('./../axes/AxisComponent');

TableSelectComponent = require('../TableSelectComponent');

ReactSelect = require('react-select');

ColorComponent = require('../ColorComponent');

Rcslider = require('rc-slider');

module.exports = AdminChoroplethLayerDesigner = (function(superClass) {
  extend(AdminChoroplethLayerDesigner, superClass);

  function AdminChoroplethLayerDesigner() {
    this.handleScopeAndDetailLevelChange = bind(this.handleScopeAndDetailLevelChange, this);
    return AdminChoroplethLayerDesigner.__super__.constructor.apply(this, arguments);
  }

  AdminChoroplethLayerDesigner.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func.isRequired
  };

  AdminChoroplethLayerDesigner.prototype.handleScopeAndDetailLevelChange = function(scope, detailLevel) {
    return this.props.onDesignChange(_.extend({}, this.props.design, {
      scope: scope,
      detailLevel: detailLevel
    }));
  };

  AdminChoroplethLayerDesigner.prototype.renderTable = function() {
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, H.i({
      className: "fa fa-database"
    }), " ", "Data Source"), ": ", React.createElement(TableSelectComponent, {
      schema: this.props.schema,
      value: this.props.design.table,
      onChange: updt(this.props.onDesignChange, this.props.design, "table")
    }));
  };

  AdminChoroplethLayerDesigner.prototype.renderAdminRegionExpr = function() {
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
      onChange: updt(this.props.onDesignChange, this.props.design, "adminRegionExpr"),
      table: this.props.design.table,
      types: ["id"],
      idTable: "admin_regions",
      value: this.props.design.adminRegionExpr
    })));
  };

  AdminChoroplethLayerDesigner.prototype.renderRegionAndDetailLevel = function() {
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

  AdminChoroplethLayerDesigner.prototype.renderDisplayNames = function() {
    return H.div({
      className: "form-group"
    }, H.div({
      className: "checkbox"
    }, H.label(null, H.input({
      type: "checkbox",
      checked: this.props.design.displayNames,
      onChange: (function(_this) {
        return function(ev) {
          return updt(_this.props.onDesignChange, _this.props.design, "displayNames", ev.target.checked);
        };
      })(this)
    }), "Display Region Names")));
  };

  AdminChoroplethLayerDesigner.prototype.renderColor = function() {
    if (!this.props.design.table) {
      return;
    }
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, H.span({
      className: "glyphicon glyphicon glyphicon-tint"
    }), this.props.design.axes.color ? " Default Color" : " Color"), H.div({
      style: {
        marginLeft: 8
      }
    }, React.createElement(ColorComponent, {
      color: this.props.design.color,
      onChange: updt(this.props.onDesignChange, this.props.design, "color")
    })));
  };

  AdminChoroplethLayerDesigner.prototype.renderColorAxis = function() {
    var title;
    if (!this.props.design.table) {
      return;
    }
    title = H.span(null, H.span({
      className: "glyphicon glyphicon glyphicon-tint"
    }), " Color By");
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
      types: ["text", "enum", "boolean"],
      aggrNeed: "required",
      value: this.props.design.axes.color,
      showColorMap: true,
      onChange: updt(this.props.onDesignChange, this.props.design, ["axes", "color"])
    })));
  };

  AdminChoroplethLayerDesigner.prototype.renderFillOpacity = function() {
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, "Fill Opacity (%)"), ": ", React.createElement(Rcslider, {
      min: 0,
      max: 100,
      step: 1,
      tipTransitionName: "rc-slider-tooltip-zoom-down",
      value: this.props.design.fillOpacity * 100,
      onChange: (function(_this) {
        return function(val) {
          return updt(_this.props.onDesignChange, _this.props.design, "fillOpacity", val / 100);
        };
      })(this)
    }));
  };

  AdminChoroplethLayerDesigner.prototype.renderFilter = function() {
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
      onChange: updt(this.props.onDesignChange, this.props.design, "filter"),
      table: this.props.design.table,
      value: this.props.design.filter
    })));
  };

  AdminChoroplethLayerDesigner.prototype.render = function() {
    return H.div(null, this.renderRegionAndDetailLevel(), this.renderTable(), this.renderAdminRegionExpr(), this.renderDisplayNames(), this.renderColor(), this.renderColorAxis(), this.renderFillOpacity(), this.renderFilter());
  };

  return AdminChoroplethLayerDesigner;

})(React.Component);
