var AdminChoroplethLayerDesigner, AxisComponent, ColorAxisComponent, ColorComponent, DetailLevelComponent, EditPopupComponent, ExprComponent, ExprUtils, FilterExprComponent, H, IdLiteralComponent, R, Rcslider, React, ReactSelect, RegionComponent, ScopeAndDetailLevelComponent, TableSelectComponent, _, updt,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

updt = require('../updt');

FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent;

ExprComponent = require("mwater-expressions-ui").ExprComponent;

ExprUtils = require('mwater-expressions').ExprUtils;

AxisComponent = require('./../axes/AxisComponent');

TableSelectComponent = require('../TableSelectComponent');

ReactSelect = require('react-select');

ColorComponent = require('../ColorComponent');

Rcslider = require('rc-slider');

EditPopupComponent = require('./EditPopupComponent');

ColorAxisComponent = require('../axes/ColorAxisComponent');

IdLiteralComponent = require('mwater-expressions-ui').IdLiteralComponent;

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

  AdminChoroplethLayerDesigner.prototype.handleScopeAndDetailLevelChange = function(scope, scopeLevel, detailLevel) {
    return this.props.onDesignChange(_.extend({}, this.props.design, {
      scope: scope,
      scopeLevel: scopeLevel,
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
    }), " ", "Data Source"), ": ", R(TableSelectComponent, {
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
    }, R(ExprComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      onChange: updt(this.props.onDesignChange, this.props.design, "adminRegionExpr"),
      table: this.props.design.table,
      types: ["id"],
      idTable: "admin_regions",
      value: this.props.design.adminRegionExpr
    })));
  };

  AdminChoroplethLayerDesigner.prototype.renderScopeAndDetailLevel = function() {
    return R(ScopeAndDetailLevelComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      scope: this.props.design.scope,
      scopeLevel: this.props.design.scopeLevel || 0,
      detailLevel: this.props.design.detailLevel,
      onScopeAndDetailLevelChange: this.handleScopeAndDetailLevelChange
    });
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
    }), "Color"), H.div({
      style: {
        marginLeft: 8
      }
    }, R(ColorAxisComponent, {
      defaultColor: this.props.design.color,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      axis: this.props.design.axes.color,
      table: this.props.design.table,
      onColorChange: updt(this.props.onDesignChange, this.props.design, "color"),
      onColorAxisChange: updt(this.props.onDesignChange, this.props.design, ["axes", "color"]),
      table: this.props.design.table,
      showColorMap: true,
      types: ["text", "enum", "boolean"],
      aggrNeed: "required"
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
    }, R(AxisComponent, {
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
    }, "Fill Opacity (%)"), ": ", R(Rcslider, {
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
    }, R(FilterExprComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      onChange: updt(this.props.onDesignChange, this.props.design, "filter"),
      table: this.props.design.table,
      value: this.props.design.filter
    })));
  };

  AdminChoroplethLayerDesigner.prototype.renderPopup = function() {
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

  AdminChoroplethLayerDesigner.prototype.render = function() {
    return H.div(null, this.renderScopeAndDetailLevel(), this.renderTable(), this.renderAdminRegionExpr(), this.renderDisplayNames(), this.renderColor(), this.renderFillOpacity(), this.renderFilter(), this.renderPopup());
  };

  return AdminChoroplethLayerDesigner;

})(React.Component);

ScopeAndDetailLevelComponent = (function(superClass) {
  extend(ScopeAndDetailLevelComponent, superClass);

  function ScopeAndDetailLevelComponent() {
    this.handleDetailLevelChange = bind(this.handleDetailLevelChange, this);
    this.handleScopeChange = bind(this.handleScopeChange, this);
    return ScopeAndDetailLevelComponent.__super__.constructor.apply(this, arguments);
  }

  ScopeAndDetailLevelComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    scope: React.PropTypes.string,
    scopeLevel: React.PropTypes.number,
    detailLevel: React.PropTypes.number,
    onScopeAndDetailLevelChange: React.PropTypes.func.isRequired
  };

  ScopeAndDetailLevelComponent.prototype.handleScopeChange = function(scope, scopeLevel) {
    if (scope) {
      return this.props.onScopeAndDetailLevelChange(scope, scopeLevel, scopeLevel + 1);
    } else {
      return this.props.onScopeAndDetailLevelChange(null, null, 0);
    }
  };

  ScopeAndDetailLevelComponent.prototype.handleDetailLevelChange = function(detailLevel) {
    return this.props.onScopeAndDetailLevelChange(this.props.scope, this.props.scopeLevel, detailLevel);
  };

  ScopeAndDetailLevelComponent.prototype.render = function() {
    return H.div(null, H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, "Region to Map"), R(RegionComponent, {
      region: this.props.scope,
      onChange: this.handleScopeChange,
      schema: this.props.schema,
      dataSource: this.props.dataSource
    })), (this.props.scope != null) && (this.props.detailLevel != null) ? H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, "Detail Level"), R(DetailLevelComponent, {
      scope: this.props.scope,
      scopeLevel: this.props.scopeLevel,
      detailLevel: this.props.detailLevel,
      onChange: this.handleDetailLevelChange,
      schema: this.props.schema,
      dataSource: this.props.dataSource
    })) : void 0);
  };

  return ScopeAndDetailLevelComponent;

})(React.Component);

RegionComponent = (function(superClass) {
  extend(RegionComponent, superClass);

  function RegionComponent() {
    this.handleChange = bind(this.handleChange, this);
    return RegionComponent.__super__.constructor.apply(this, arguments);
  }

  RegionComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    region: React.PropTypes.string,
    onChange: React.PropTypes.func.isRequired
  };

  RegionComponent.prototype.handleChange = function(id) {
    var query;
    if (!id) {
      this.props.onChange(null, null);
      return;
    }
    query = {
      type: "query",
      selects: [
        {
          type: "select",
          expr: {
            type: "field",
            tableAlias: "main",
            column: "level"
          },
          alias: "level"
        }
      ],
      from: {
        type: "table",
        table: "admin_regions",
        alias: "main"
      },
      where: {
        type: "op",
        op: "=",
        exprs: [
          {
            type: "field",
            tableAlias: "main",
            column: "_id"
          }, id
        ]
      }
    };
    return this.props.dataSource.performQuery(query, (function(_this) {
      return function(err, rows) {
        if (err) {
          cb(err);
          return;
        }
        return _this.props.onChange(id, rows[0].level);
      };
    })(this));
  };

  RegionComponent.prototype.render = function() {
    return R(IdLiteralComponent, {
      value: this.props.region,
      onChange: this.handleChange,
      idTable: "admin_regions",
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      placeholder: "All Countries",
      orderBy: [
        {
          expr: {
            type: "field",
            tableAlias: "main",
            column: "level"
          },
          direction: "asc"
        }
      ]
    });
  };

  return RegionComponent;

})(React.Component);

DetailLevelComponent = (function(superClass) {
  extend(DetailLevelComponent, superClass);

  DetailLevelComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    scope: React.PropTypes.string.isRequired,
    scopeLevel: React.PropTypes.number.isRequired,
    detailLevel: React.PropTypes.number,
    onChange: React.PropTypes.func.isRequired
  };

  function DetailLevelComponent() {
    DetailLevelComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      options: null
    };
  }

  DetailLevelComponent.prototype.componentWillMount = function() {
    return this.loadLevels(this.props);
  };

  DetailLevelComponent.prototype.componentWillReceiveProps = function(nextProps) {
    if (nextProps.scope !== this.props.scope) {
      return this.loadLevels(nextProps);
    }
  };

  DetailLevelComponent.prototype.loadLevels = function(props) {
    var query;
    query = {
      type: "query",
      selects: [
        {
          type: "select",
          expr: {
            type: "field",
            tableAlias: "main",
            column: "level0"
          },
          alias: "level0"
        }
      ],
      from: {
        type: "table",
        table: "admin_regions",
        alias: "main"
      },
      where: {
        type: "op",
        op: "=",
        exprs: [
          {
            type: "field",
            tableAlias: "main",
            column: "_id"
          }, props.scope
        ]
      }
    };
    return props.dataSource.performQuery(query, (function(_this) {
      return function(err, rows) {
        var countryId;
        if (err) {
          cb(err);
          return;
        }
        countryId = rows[0].level0;
        query = {
          type: "query",
          selects: [
            {
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
          },
          where: {
            type: "op",
            op: "=",
            exprs: [
              {
                type: "field",
                tableAlias: "main",
                column: "country_id"
              }, countryId
            ]
          },
          orderBy: [
            {
              ordinal: 1,
              direction: "asc"
            }
          ]
        };
        return props.dataSource.performQuery(query, function(err, rows) {
          var options;
          if (err) {
            cb(err);
            return;
          }
          console.log(rows);
          options = _.map(_.filter(rows, function(r) {
            return r.level > props.scopeLevel;
          }), function(r) {
            return {
              value: r.level,
              label: r.name
            };
          });
          return _this.setState({
            options: options
          });
        });
      };
    })(this));
  };

  DetailLevelComponent.prototype.render = function() {
    if (this.state.options) {
      return R(ReactSelect, {
        value: this.props.detailLevel || "",
        options: this.state.options,
        clearable: false,
        onChange: (function(_this) {
          return function(value) {
            return _this.props.onChange(parseInt(value));
          };
        })(this)
      });
    } else {
      return H.div({
        className: "text-muted"
      }, H.i({
        className: "fa fa-spinner fa-spin"
      }), " Loading...");
    }
  };

  return DetailLevelComponent;

})(React.Component);
