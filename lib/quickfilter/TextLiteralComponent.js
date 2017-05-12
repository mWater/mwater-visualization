var ExprCompiler, H, R, React, ReactSelect, TextLiteralComponent, injectTableAlias,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

R = React.createElement;

ReactSelect = require('react-select');

ExprCompiler = require('mwater-expressions').ExprCompiler;

injectTableAlias = require('mwater-expressions').injectTableAlias;

module.exports = TextLiteralComponent = (function(superClass) {
  extend(TextLiteralComponent, superClass);

  function TextLiteralComponent() {
    this.getOptions = bind(this.getOptions, this);
    this.handleChange = bind(this.handleChange, this);
    return TextLiteralComponent.__super__.constructor.apply(this, arguments);
  }

  TextLiteralComponent.propTypes = {
    value: React.PropTypes.string,
    onChange: React.PropTypes.func,
    refExpr: React.PropTypes.object.isRequired,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    filters: React.PropTypes.arrayOf(React.PropTypes.shape({
      table: React.PropTypes.string.isRequired,
      jsonql: React.PropTypes.object.isRequired
    }))
  };

  TextLiteralComponent.prototype.handleChange = function(val) {
    var value;
    value = val ? val : null;
    return this.props.onChange(value);
  };

  TextLiteralComponent.prototype.escapeRegex = function(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  };

  TextLiteralComponent.prototype.getOptions = function(input, cb) {
    var exprCompiler, filter, i, len, query, ref;
    exprCompiler = new ExprCompiler(this.props.schema);
    query = {
      type: "query",
      selects: [
        {
          type: "select",
          expr: exprCompiler.compileExpr({
            expr: this.props.refExpr,
            tableAlias: "main"
          }),
          alias: "value"
        }, {
          type: "select",
          expr: {
            type: "op",
            op: "count",
            exprs: []
          },
          alias: "number"
        }
      ],
      from: exprCompiler.compileTable(this.props.refExpr.table, "main"),
      where: {
        type: "op",
        op: "and",
        exprs: [
          {
            type: "op",
            op: "~*",
            exprs: [
              exprCompiler.compileExpr({
                expr: this.props.refExpr,
                tableAlias: "main"
              }), "^" + this.escapeRegex(input)
            ]
          }
        ]
      },
      groupBy: [1],
      orderBy: [
        {
          ordinal: 2,
          direction: "desc"
        }, {
          ordinal: 1,
          direction: "asc"
        }
      ],
      limit: 250
    };
    ref = this.props.filters || [];
    for (i = 0, len = ref.length; i < len; i++) {
      filter = ref[i];
      if (filter.table === this.props.refExpr.table) {
        query.where.exprs.push(injectTableAlias(filter.jsonql, "main"));
      }
    }
    this.props.dataSource.performQuery(query, (function(_this) {
      return function(err, rows) {
        if (err) {
          cb(err);
          return;
        }
        rows = _.filter(rows, function(r) {
          return r.value;
        });
        return cb(null, {
          options: _.map(rows, function(r) {
            return {
              value: r.value,
              label: r.value
            };
          }),
          complete: false
        });
      };
    })(this));
  };

  TextLiteralComponent.prototype.render = function() {
    var value;
    value = this.props.value || "";
    return H.div({
      style: {
        width: "100%"
      }
    }, R(ReactSelect, {
      placeholder: "All",
      value: value,
      asyncOptions: this.getOptions,
      onChange: this.props.onChange ? this.handleChange : void 0,
      disabled: this.props.onChange == null
    }));
  };

  return TextLiteralComponent;

})(React.Component);
