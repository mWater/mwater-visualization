var DetailLevelSelectComponent, H, R, React, ReactSelect, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

ReactSelect = require('react-select');

module.exports = DetailLevelSelectComponent = (function(superClass) {
  extend(DetailLevelSelectComponent, superClass);

  DetailLevelSelectComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    scope: React.PropTypes.string.isRequired,
    scopeLevel: React.PropTypes.number.isRequired,
    detailLevel: React.PropTypes.number,
    onChange: React.PropTypes.func.isRequired
  };

  function DetailLevelSelectComponent() {
    DetailLevelSelectComponent.__super__.constructor.apply(this, arguments);
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

  return DetailLevelSelectComponent;

})(React.Component);
