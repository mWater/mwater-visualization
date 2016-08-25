var AdminScopeAndDetailLevelComponent, DetailLevelComponent, H, IdLiteralComponent, R, React, ReactSelect, RegionComponent, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

ReactSelect = require('react-select');

IdLiteralComponent = require('mwater-expressions-ui').IdLiteralComponent;

module.exports = AdminScopeAndDetailLevelComponent = (function(superClass) {
  extend(AdminScopeAndDetailLevelComponent, superClass);

  function AdminScopeAndDetailLevelComponent() {
    this.handleDetailLevelChange = bind(this.handleDetailLevelChange, this);
    this.handleScopeChange = bind(this.handleScopeChange, this);
    return AdminScopeAndDetailLevelComponent.__super__.constructor.apply(this, arguments);
  }

  AdminScopeAndDetailLevelComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    scope: React.PropTypes.string,
    scopeLevel: React.PropTypes.number,
    detailLevel: React.PropTypes.number,
    onScopeAndDetailLevelChange: React.PropTypes.func.isRequired
  };

  AdminScopeAndDetailLevelComponent.prototype.handleScopeChange = function(scope, scopeLevel) {
    if (scope) {
      return this.props.onScopeAndDetailLevelChange(scope, scopeLevel, scopeLevel + 1);
    } else {
      return this.props.onScopeAndDetailLevelChange(null, null, 0);
    }
  };

  AdminScopeAndDetailLevelComponent.prototype.handleDetailLevelChange = function(detailLevel) {
    return this.props.onScopeAndDetailLevelChange(this.props.scope, this.props.scopeLevel, detailLevel);
  };

  AdminScopeAndDetailLevelComponent.prototype.render = function() {
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

  return AdminScopeAndDetailLevelComponent;

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
