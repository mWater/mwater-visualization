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
    this.handleMultipleChange = bind(this.handleMultipleChange, this);
    this.handleSingleChange = bind(this.handleSingleChange, this);
    return TextLiteralComponent.__super__.constructor.apply(this, arguments);
  }

  TextLiteralComponent.propTypes = {
    value: PropTypes.any,
    onChange: PropTypes.func,
    schema: PropTypes.object.isRequired,
    quickfiltersDataSource: PropTypes.object.isRequired,
    expr: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    multi: PropTypes.bool,
    filters: PropTypes.arrayOf(PropTypes.shape({
      table: PropTypes.string.isRequired,
      jsonql: PropTypes.object.isRequired
    }))
  };

  TextLiteralComponent.prototype.handleSingleChange = function(val) {
    var value;
    value = val ? val : null;
    return this.props.onChange(value);
  };

  TextLiteralComponent.prototype.handleMultipleChange = function(val) {
    var value;
    value = val ? val.split("\n") : [];
    if (value.length > 0) {
      return this.props.onChange(value);
    } else {
      return this.props.onChange(null);
    }
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

  TextLiteralComponent.prototype.renderSingle = function() {
    return R(ReactSelect, {
      key: JSON.stringify(this.props.filters),
      placeholder: "All",
      value: this.props.value || "",
      asyncOptions: this.getOptions,
      onChange: this.props.onChange ? this.handleSingleChange : void 0,
      disabled: this.props.onChange == null
    });
  };

  TextLiteralComponent.prototype.renderMultiple = function() {
    return R(ReactSelect, {
      placeholder: "All",
      value: (this.props.value || []).join("\n"),
      key: JSON.stringify(this.props.filters),
      multi: true,
      delimiter: "\n",
      asyncOptions: this.getOptions,
      onChange: this.props.onChange ? this.handleMultipleChange : void 0,
      disabled: this.props.onChange == null
    });
  };

  TextLiteralComponent.prototype.render = function() {
    return H.div({
      style: {
        width: "100%"
      }
    }, this.props.multi ? this.renderMultiple() : this.renderSingle());
  };

  return TextLiteralComponent;

})(React.Component);

escapeRegex = function(s) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};
