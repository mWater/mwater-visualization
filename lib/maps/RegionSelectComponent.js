var IdLiteralComponent, PropTypes, R, React, RegionSelectComponent, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

R = React.createElement;

IdLiteralComponent = require('mwater-expressions-ui').IdLiteralComponent;

module.exports = RegionSelectComponent = (function(superClass) {
  extend(RegionSelectComponent, superClass);

  function RegionSelectComponent() {
    this.handleChange = bind(this.handleChange, this);
    return RegionSelectComponent.__super__.constructor.apply(this, arguments);
  }

  RegionSelectComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    region: PropTypes.number,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    regionsTable: PropTypes.string.isRequired,
    maxLevel: PropTypes.number
  };

  RegionSelectComponent.defaultProps = {
    placeholder: "All Countries",
    regionsTable: "admin_regions"
  };

  RegionSelectComponent.prototype.handleChange = function(id) {
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
        table: this.props.regionsTable,
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
          console.log("Error getting regions: " + (err != null ? err.message : void 0));
          return;
        }
        return _this.props.onChange(id, rows[0].level);
      };
    })(this));
  };

  RegionSelectComponent.prototype.render = function() {
    var filter;
    filter = null;
    if (this.props.maxLevel != null) {
      filter = {
        type: "op",
        op: "<=",
        exprs: [
          {
            type: "field",
            tableAlias: "main",
            column: "level"
          }, this.props.maxLevel
        ]
      };
    }
    return R(IdLiteralComponent, {
      value: this.props.region,
      onChange: this.handleChange,
      idTable: this.props.regionsTable,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      placeholder: this.props.placeholder,
      orderBy: [
        {
          expr: {
            type: "field",
            tableAlias: "main",
            column: "level"
          },
          direction: "asc"
        }
      ],
      filter: filter
    });
  };

  return RegionSelectComponent;

})(React.Component);
