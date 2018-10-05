var DetailLevelSelectComponent, PropTypes, R, React, ReactSelect, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

R = React.createElement;

ReactSelect = require('react-select')["default"];

module.exports = DetailLevelSelectComponent = (function(superClass) {
  extend(DetailLevelSelectComponent, superClass);

  DetailLevelSelectComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    scope: PropTypes.string.isRequired,
    scopeLevel: PropTypes.number.isRequired,
    detailLevel: PropTypes.number,
    onChange: PropTypes.func.isRequired
  };

  function DetailLevelSelectComponent(props) {
    DetailLevelSelectComponent.__super__.constructor.call(this, props);
    this.state = {
      options: null
    };
  }

  DetailLevelSelectComponent.prototype.componentWillMount = function() {
    return this.loadLevels(this.props);
  };

  DetailLevelSelectComponent.prototype.componentWillReceiveProps = function(nextProps) {
    if (nextProps.scope !== this.props.scope) {
      return this.loadLevels(nextProps);
    }
  };

  DetailLevelSelectComponent.prototype.loadLevels = function(props) {
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
          alert("Error loading detail levels");
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
            alert("Error loading detail levels");
            return;
          }
          rows = _.filter(rows, function(r) {
            return r.level > props.scopeLevel;
          });
          if (_this.props.detailLevel <= _this.props.scopeLevel && rows.length > 0) {
            _this.props.onChange(rows[0].level);
          }
          options = _.map(rows, function(r) {
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

  DetailLevelSelectComponent.prototype.render = function() {
    if (this.state.options) {
      return R(ReactSelect, {
        value: _.findWhere(this.state.options, {
          value: this.props.detailLevel
        }),
        options: this.state.options,
        onChange: (function(_this) {
          return function(opt) {
            return _this.props.onChange(opt.value);
          };
        })(this)
      });
    } else {
      return R('div', {
        className: "text-muted"
      }, R('i', {
        className: "fa fa-spinner fa-spin"
      }), " Loading...");
    }
  };

  return DetailLevelSelectComponent;

})(React.Component);
