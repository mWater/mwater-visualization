var DateExprComponent, DateQuickfilterComponent, EnumQuickfilterComponent, ExprCleaner, ExprUtils, PropTypes, QuickfilterCompiler, QuickfiltersComponent, R, React, ReactSelect, TextLiteralComponent, TextQuickfilterComponent,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

PropTypes = require('prop-types');

React = require('react');

R = React.createElement;

ReactSelect = require('react-select')["default"];

ExprUtils = require('mwater-expressions').ExprUtils;

ExprCleaner = require('mwater-expressions').ExprCleaner;

TextLiteralComponent = require('./TextLiteralComponent');

DateExprComponent = require('./DateExprComponent');

QuickfilterCompiler = require('./QuickfilterCompiler');

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
    var compiler, expr, filters, itemValue, lock, onValueChange, otherDesign, otherLocks, otherQuickFilterFilters, otherValues, type, values;
    if (item.merged) {
      return null;
    }
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
          var i, j, ref, ref1;
          values = (_this.props.values || []).slice();
          values[index] = v;
          for (i = j = ref = index + 1, ref1 = _this.props.design.length; ref <= ref1 ? j < ref1 : j > ref1; i = ref <= ref1 ? ++j : --j) {
            if (_this.props.design[i].merged) {
              values[i] = v;
            }
          }
          return _this.props.onValuesChange(values);
        };
      })(this);
    }
    compiler = new QuickfilterCompiler(this.props.schema);
    otherDesign = (this.props.design || []).slice();
    otherValues = (this.props.values || []).slice();
    otherLocks = (this.props.locks || []).slice();
    otherDesign.splice(index, 1);
    otherValues.splice(index, 1);
    otherLocks.splice(index, 1);
    otherQuickFilterFilters = compiler.compile(otherDesign, otherValues, otherLocks);
    filters = (this.props.filters || []).concat(otherQuickFilterFilters);
    if (type === "enum" || type === "enumset") {
      return R(EnumQuickfilterComponent, {
        key: JSON.stringify(item),
        label: item.label,
        expr: expr,
        schema: this.props.schema,
        options: new ExprUtils(this.props.schema).getExprEnumValues(expr),
        value: itemValue,
        onValueChange: onValueChange,
        multi: item.multi
      });
    }
    if (type === "text") {
      return R(TextQuickfilterComponent, {
        key: JSON.stringify(item),
        index: index,
        label: item.label,
        expr: expr,
        schema: this.props.schema,
        quickfiltersDataSource: this.props.quickfiltersDataSource,
        value: itemValue,
        onValueChange: onValueChange,
        filters: filters,
        multi: item.multi
      });
    }
    if (type === "date" || type === "datetime") {
      return R(DateQuickfilterComponent, {
        key: JSON.stringify(item),
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
    return R('div', {
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
    this.handleMultiChange = bind(this.handleMultiChange, this);
    this.handleSingleChange = bind(this.handleSingleChange, this);
    return EnumQuickfilterComponent.__super__.constructor.apply(this, arguments);
  }

  EnumQuickfilterComponent.propTypes = {
    label: PropTypes.string,
    schema: PropTypes.object.isRequired,
    options: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.object.isRequired
    })).isRequired,
    multi: PropTypes.bool,
    value: PropTypes.any,
    onValueChange: PropTypes.func
  };

  EnumQuickfilterComponent.contextTypes = {
    locale: PropTypes.string
  };

  EnumQuickfilterComponent.prototype.handleSingleChange = function(val) {
    if (val) {
      return this.props.onValueChange(val);
    } else {
      return this.props.onValueChange(null);
    }
  };

  EnumQuickfilterComponent.prototype.handleMultiChange = function(val) {
    if ((val != null ? val.length : void 0) > 0) {
      return this.props.onValueChange(_.pluck(val, "value"));
    } else {
      return this.props.onValueChange(null);
    }
  };

  EnumQuickfilterComponent.prototype.renderSingleSelect = function() {
    var options;
    options = _.map(this.props.options, (function(_this) {
      return function(opt) {
        return {
          value: opt.id,
          label: ExprUtils.localizeString(opt.name, _this.context.locale)
        };
      };
    })(this));
    return R(ReactSelect, {
      placeholder: "All",
      value: _.findWhere(options, {
        value: this.props.value
      }) || null,
      options: options,
      isClearable: true,
      onChange: (function(_this) {
        return function(value) {
          if (_this.props.onValueChange) {
            return _this.handleSingleChange(value != null ? value.value : void 0);
          }
        };
      })(this),
      isDisabled: this.props.onValueChange == null,
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

  EnumQuickfilterComponent.prototype.renderMultiSelect = function() {
    var options;
    options = _.map(this.props.options, (function(_this) {
      return function(opt) {
        return {
          value: opt.id,
          label: ExprUtils.localizeString(opt.name, _this.context.locale)
        };
      };
    })(this));
    return R(ReactSelect, {
      placeholder: "All",
      value: _.map(this.props.value, (function(_this) {
        return function(v) {
          return _.find(options, function(o) {
            return o.value === v;
          });
        };
      })(this)),
      isClearable: true,
      isMulti: true,
      options: options,
      onChange: this.props.onValueChange ? this.handleMultiChange : void 0,
      isDisabled: this.props.onValueChange == null,
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

  EnumQuickfilterComponent.prototype.render = function() {
    return R('div', {
      style: {
        display: "inline-block",
        paddingRight: 10
      }
    }, this.props.label ? R('span', {
      style: {
        color: "gray"
      }
    }, this.props.label + ":\u00a0") : void 0, R('div', {
      style: {
        display: "inline-block",
        minWidth: "20em",
        verticalAlign: "middle"
      }
    }, this.props.multi ? this.renderMultiSelect() : this.renderSingleSelect()), !this.props.onValueChange ? R('i', {
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
    multi: PropTypes.bool,
    filters: PropTypes.arrayOf(PropTypes.shape({
      table: PropTypes.string.isRequired,
      jsonql: PropTypes.object.isRequired
    }))
  };

  TextQuickfilterComponent.prototype.render = function() {
    return R('div', {
      style: {
        display: "inline-block",
        paddingRight: 10
      }
    }, this.props.label ? R('span', {
      style: {
        color: "gray"
      }
    }, this.props.label + ":\u00a0") : void 0, R('div', {
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
      multi: this.props.multi,
      quickfiltersDataSource: this.props.quickfiltersDataSource,
      filters: this.props.filters
    })), !this.props.onValueChange ? R('i', {
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
    return R('div', {
      style: {
        display: "inline-block",
        paddingRight: 10
      }
    }, this.props.label ? R('span', {
      style: {
        color: "gray"
      }
    }, this.props.label + ":\u00a0") : void 0, R('div', {
      style: {
        display: "inline-block",
        minWidth: "20em",
        verticalAlign: "middle"
      }
    }, R(DateExprComponent, {
      datetime: (new ExprUtils(this.props.schema).getExprType(this.props.expr)) === "datetime",
      value: this.props.value,
      onChange: this.props.onValueChange
    })), !this.props.onValueChange ? R('i', {
      className: "text-warning fa fa-fw fa-lock"
    }) : void 0);
  };

  return DateQuickfilterComponent;

})(React.Component);
