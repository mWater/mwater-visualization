var DateExprComponent, DateQuickfilterComponent, EnumQuickfilterComponent, ExprCleaner, ExprUtils, H, PropTypes, QuickfiltersComponent, R, React, ReactSelect, TextLiteralComponent, TextQuickfilterComponent,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

PropTypes = require('prop-types');

React = require('react');

H = React.DOM;

R = React.createElement;

ReactSelect = require('react-select');

ExprUtils = require('mwater-expressions').ExprUtils;

ExprCleaner = require('mwater-expressions').ExprCleaner;

TextLiteralComponent = require('./TextLiteralComponent');

DateExprComponent = require('./DateExprComponent');

module.exports = QuickfiltersComponent = (function(superClass) {
  extend(QuickfiltersComponent, superClass);

  function QuickfiltersComponent() {
    return QuickfiltersComponent.__super__.constructor.apply(this, arguments);
  }

  QuickfiltersComponent.propTypes = {
    design: PropTypes.arrayOf(PropTypes.shape({
      expr: PropTypes.object.isRequired,
      label: PropTypes.string
    })),
    values: PropTypes.array,
    onValuesChange: PropTypes.func.isRequired,
    locks: PropTypes.arrayOf(PropTypes.shape({
      expr: PropTypes.object.isRequired,
      value: PropTypes.any
    })),
    schema: PropTypes.object.isRequired,
    quickfiltersDataSource: PropTypes.object.isRequired,
    filters: PropTypes.arrayOf(PropTypes.shape({
      table: PropTypes.string.isRequired,
      jsonql: PropTypes.object.isRequired
    }))
  };

  QuickfiltersComponent.prototype.renderQuickfilter = function(item, index) {
    var expr, itemValue, lock, onValueChange, type, values;
    values = this.props.values || [];
    itemValue = values[index];
    expr = new ExprCleaner(this.props.schema).cleanExpr(item.expr);
    if (!expr) {
      return null;
    }
    type = new ExprUtils(this.props.schema).getExprType(expr);
    lock = _.find(this.props.locks, function(lock) {
      return _.isEqual(lock.expr, expr);
    });
    if (lock) {
      itemValue = lock.value;
      onValueChange = null;
    } else {
      onValueChange = (function(_this) {
        return function(v) {
          values = (_this.props.values || []).slice();
          values[index] = v;
          return _this.props.onValuesChange(values);
        };
      })(this);
    }
    if (type === "enum") {
      return R(EnumQuickfilterComponent, {
        key: index,
        label: item.label,
        expr: expr,
        schema: this.props.schema,
        options: new ExprUtils(this.props.schema).getExprEnumValues(expr),
        value: itemValue,
        onValueChange: onValueChange
      });
    }
    if (type === "text") {
      return R(TextQuickfilterComponent, {
        key: index,
        index: index,
        label: item.label,
        expr: expr,
        schema: this.props.schema,
        quickfiltersDataSource: this.props.quickfiltersDataSource,
        value: itemValue,
        onValueChange: onValueChange,
        filters: this.props.filters
      });
    }
    if (type === "date" || type === "datetime") {
      return R(DateQuickfilterComponent, {
        key: index,
        label: item.label,
        expr: expr,
        schema: this.props.schema,
        value: itemValue,
        onValueChange: onValueChange
      });
    }
  };

  QuickfiltersComponent.prototype.render = function() {
    if (!this.props.design || this.props.design.length === 0) {
      return null;
    }
    return H.div({
      style: {
        borderTop: "solid 1px #E8E8E8",
        borderBottom: "solid 1px #E8E8E8",
        padding: 5
      }
    }, _.map(this.props.design, (function(_this) {
      return function(item, i) {
        return _this.renderQuickfilter(item, i);
      };
    })(this)));
  };

  return QuickfiltersComponent;

})(React.Component);

EnumQuickfilterComponent = (function(superClass) {
  extend(EnumQuickfilterComponent, superClass);

  function EnumQuickfilterComponent() {
    this.handleChange = bind(this.handleChange, this);
    return EnumQuickfilterComponent.__super__.constructor.apply(this, arguments);
  }

  EnumQuickfilterComponent.propTypes = {
    label: PropTypes.string,
    schema: PropTypes.object.isRequired,
    options: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.object.isRequired
    })).isRequired,
    value: PropTypes.any,
    onValueChange: PropTypes.func
  };

  EnumQuickfilterComponent.contextTypes = {
    locale: PropTypes.string
  };

  EnumQuickfilterComponent.prototype.handleChange = function(val) {
    if (val) {
      return this.props.onValueChange(val);
    } else {
      return this.props.onValueChange(null);
    }
  };

  EnumQuickfilterComponent.prototype.render = function() {
    return H.div({
      style: {
        display: "inline-block",
        paddingRight: 10
      }
    }, this.props.label ? H.span({
      style: {
        color: "gray"
      }
    }, this.props.label + ":\u00a0") : void 0, H.div({
      style: {
        display: "inline-block",
        minWidth: "20em",
        verticalAlign: "middle"
      }
    }, R(ReactSelect, {
      placeholder: "All",
      value: this.props.value,
      multi: false,
      options: _.map(this.props.options, (function(_this) {
        return function(opt) {
          return {
            value: opt.id,
            label: ExprUtils.localizeString(opt.name, _this.context.locale)
          };
        };
      })(this)),
      onChange: this.props.onValueChange ? this.handleChange : void 0,
      disabled: this.props.onValueChange == null
    })), !this.props.onValueChange ? H.i({
      className: "text-warning fa fa-fw fa-lock"
    }) : void 0);
  };

  return EnumQuickfilterComponent;

})(React.Component);

TextQuickfilterComponent = (function(superClass) {
  extend(TextQuickfilterComponent, superClass);

  function TextQuickfilterComponent() {
    return TextQuickfilterComponent.__super__.constructor.apply(this, arguments);
  }

  TextQuickfilterComponent.propTypes = {
    label: PropTypes.string.isRequired,
    schema: PropTypes.object.isRequired,
    quickfiltersDataSource: PropTypes.object.isRequired,
    expr: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    value: PropTypes.any,
    onValueChange: PropTypes.func,
    filters: PropTypes.arrayOf(PropTypes.shape({
      table: PropTypes.string.isRequired,
      jsonql: PropTypes.object.isRequired
    }))
  };

  TextQuickfilterComponent.prototype.render = function() {
    return H.div({
      style: {
        display: "inline-block",
        paddingRight: 10
      }
    }, this.props.label ? H.span({
      style: {
        color: "gray"
      }
    }, this.props.label + ":\u00a0") : void 0, H.div({
      style: {
        display: "inline-block",
        minWidth: "20em",
        verticalAlign: "middle"
      }
    }, R(TextLiteralComponent, {
      value: this.props.value,
      onChange: this.props.onValueChange,
      schema: this.props.schema,
      expr: this.props.expr,
      index: this.props.index,
      quickfiltersDataSource: this.props.quickfiltersDataSource,
      filters: this.props.filters
    })), !this.props.onValueChange ? H.i({
      className: "text-warning fa fa-fw fa-lock"
    }) : void 0);
  };

  return TextQuickfilterComponent;

})(React.Component);

DateQuickfilterComponent = (function(superClass) {
  extend(DateQuickfilterComponent, superClass);

  function DateQuickfilterComponent() {
    return DateQuickfilterComponent.__super__.constructor.apply(this, arguments);
  }

  DateQuickfilterComponent.propTypes = {
    label: PropTypes.string,
    schema: PropTypes.object.isRequired,
    expr: PropTypes.object.isRequired,
    value: PropTypes.any,
    onValueChange: PropTypes.func.isRequired
  };

  DateQuickfilterComponent.prototype.render = function() {
    return H.div({
      style: {
        display: "inline-block",
        paddingRight: 10
      }
    }, this.props.label ? H.span({
      style: {
        color: "gray"
      }
    }, this.props.label + ":\u00a0") : void 0, H.div({
      style: {
        display: "inline-block",
        minWidth: "20em",
        verticalAlign: "middle"
      }
    }, R(DateExprComponent, {
      datetime: (new ExprUtils(this.props.schema).getExprType(this.props.expr)) === "datetime",
      value: this.props.value,
      onValueChange: this.props.onValueChange
    })), !this.props.onValueChange ? H.i({
      className: "text-warning fa fa-fw fa-lock"
    }) : void 0);
  };

  return DateQuickfilterComponent;

})(React.Component);
