var AsyncReactSelect, ExprCompiler, PropTypes, R, React, TextLiteralComponent, _, escapeRegex, injectTableAlias,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

PropTypes = require('prop-types');

React = require('react');

R = React.createElement;

AsyncReactSelect = require('react-select/lib/Async')["default"];

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
    value = val ? val.value || null : null;
    return this.props.onChange(value);
  };

  TextLiteralComponent.prototype.handleMultipleChange = function(val) {
    var value;
    value = val ? _.pluck(val, "value") : [];
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
          return;
        }
        values = _.filter(values, function(value) {
          return value;
        });
        return cb(_.map(values, function(value) {
          return {
            value: value,
            label: value
          };
        }));
      };
    })(this));
  };

  TextLiteralComponent.prototype.renderSingle = function() {
    var currentValue;
    currentValue = this.props.value ? {
      value: this.props.value,
      label: this.props.value
    } : null;
    return R(AsyncReactSelect, {
      key: JSON.stringify(this.props.filters),
      placeholder: "All",
      value: currentValue,
      loadOptions: this.getOptions,
      onChange: this.props.onChange ? this.handleSingleChange : void 0,
      isClearable: true,
      isDisabled: this.props.onChange == null,
      noOptionsMessage: (function(_this) {
        return function() {
          return "Type to search";
        };
      })(this),
      styles: {
        menu: (function(_this) {
          return function(style) {
            return _.extend({}, style, {
              zIndex: 2
            });
          };
        })(this)
      }
    });
  };

  TextLiteralComponent.prototype.renderMultiple = function() {
    var currentValue;
    currentValue = this.props.value ? _.map(this.props.value, (function(_this) {
      return function(v) {
        return {
          value: v,
          label: v
        };
      };
    })(this)) : null;
    return R(AsyncReactSelect, {
      placeholder: "All",
      value: currentValue,
      key: JSON.stringify(this.props.filters),
      isMulti: true,
      loadOptions: this.getOptions,
      onChange: this.props.onChange ? this.handleMultipleChange : void 0,
      isClearable: true,
      isDisabled: this.props.onChange == null,
      noOptionsMessage: (function(_this) {
        return function() {
          return "Type to search";
        };
      })(this),
      styles: {
        menu: (function(_this) {
          return function(style) {
            return _.extend({}, style, {
              zIndex: 2
            });
          };
        })(this)
      }
    });
  };

  TextLiteralComponent.prototype.render = function() {
    return R('div', {
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
