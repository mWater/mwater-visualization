var ExprCompiler, H, PropTypes, R, React, ReactSelect, TextLiteralComponent, _, escapeRegex, injectTableAlias,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

PropTypes = require('prop-types');

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
    value: PropTypes.string,
    onChange: PropTypes.func,
    schema: PropTypes.object.isRequired,
    quickfiltersDataSource: PropTypes.object.isRequired,
    expr: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    filters: PropTypes.arrayOf(PropTypes.shape({
      table: PropTypes.string.isRequired,
      jsonql: PropTypes.object.isRequired
    }))
  };

  TextLiteralComponent.prototype.handleChange = function(val) {
    var value;
    value = val ? val : null;
    return this.props.onChange(value);
  };

  TextLiteralComponent.prototype.getOptions = function(input, cb) {
    var exprCompiler, filters;
    exprCompiler = new ExprCompiler(this.props.schema);
    filters = (this.props.filters || []).concat({
      table: this.props.expr.table,
      jsonql: {
        type: "op",
        op: "~*",
        exprs: [
          exprCompiler.compileExpr({
            expr: this.props.expr,
            tableAlias: "{alias}"
          }), "^" + escapeRegex(input)
        ]
      }
    });
    this.props.quickfiltersDataSource.getValues(this.props.index, this.props.expr, filters, null, 250, (function(_this) {
      return function(err, values) {
        if (err) {
          cb(err);
          return;
        }
        values = _.filter(values, function(value) {
          return value;
        });
        return cb(null, {
          options: _.map(values, function(value) {
            return {
              value: value,
              label: value
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

escapeRegex = function(s) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};
