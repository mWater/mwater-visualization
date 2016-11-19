var DateExprComponent, DateQuickfilterComponent, EnumQuickfilterComponent, ExprUtils, H, QuickfiltersComponent, React, ReactSelect, TextLiteralComponent, TextQuickfilterComponent, moment,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

React = require('react');

H = React.DOM;

ReactSelect = require('react-select');

ExprUtils = require('mwater-expressions').ExprUtils;

TextLiteralComponent = require('./TextLiteralComponent');

moment = require('moment');

module.exports = QuickfiltersComponent = (function(superClass) {
  extend(QuickfiltersComponent, superClass);

  function QuickfiltersComponent() {
    return QuickfiltersComponent.__super__.constructor.apply(this, arguments);
  }

  QuickfiltersComponent.propTypes = {
    design: React.PropTypes.arrayOf(React.PropTypes.shape({
      expr: React.PropTypes.object.isRequired,
      label: React.PropTypes.string
    })),
    values: React.PropTypes.array,
    onValuesChange: React.PropTypes.func.isRequired,
    locks: React.PropTypes.arrayOf(React.PropTypes.shape({
      expr: React.PropTypes.object.isRequired,
      value: React.PropTypes.any
    })),
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired
  };

  QuickfiltersComponent.prototype.renderQuickfilter = function(item, index) {
    var itemValue, lock, onValueChange, type, values;
    values = this.props.values || [];
    itemValue = values[index];
    type = new ExprUtils(this.props.schema).getExprType(item.expr);
    lock = _.find(this.props.locks, function(lock) {
      return _.isEqual(lock.expr, item.expr);
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
      return React.createElement(EnumQuickfilterComponent, {
        key: index,
        label: item.label,
        expr: item.expr,
        schema: this.props.schema,
        options: new ExprUtils(this.props.schema).getExprEnumValues(item.expr),
        value: itemValue,
        onValueChange: onValueChange
      });
    }
    if (type === "text") {
      return React.createElement(TextQuickfilterComponent, {
        key: index,
        label: item.label,
        expr: item.expr,
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        value: itemValue,
        onValueChange: onValueChange
      });
    }
    if (type === "date" || type === "datetime") {
      return React.createElement(DateQuickfilterComponent, {
        key: index,
        label: item.label,
        expr: item.expr,
        schema: this.props.schema,
        dataSource: this.props.dataSource,
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
    label: React.PropTypes.string,
    schema: React.PropTypes.object.isRequired,
    options: React.PropTypes.arrayOf(React.PropTypes.shape({
      id: React.PropTypes.string.isRequired,
      name: React.PropTypes.object.isRequired
    })).isRequired,
    value: React.PropTypes.any,
    onValueChange: React.PropTypes.func
  };

  EnumQuickfilterComponent.contextTypes = {
    locale: React.PropTypes.string
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
    }, React.createElement(ReactSelect, {
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
    label: React.PropTypes.string.isRequired,
    schema: React.PropTypes.object.isRequired,
    expr: React.PropTypes.object.isRequired,
    value: React.PropTypes.any,
    onValueChange: React.PropTypes.func
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
    }, React.createElement(TextLiteralComponent, {
      value: this.props.value,
      onChange: this.props.onValueChange,
      refExpr: this.props.expr,
      schema: this.props.schema,
      dataSource: this.props.dataSource
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
    label: React.PropTypes.string,
    schema: React.PropTypes.object.isRequired,
    expr: React.PropTypes.object.isRequired,
    value: React.PropTypes.any,
    onValueChange: React.PropTypes.func.isRequired
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
    }, React.createElement(DateExprComponent, {
      type: new ExprUtils(this.props.schema).getExprType(this.props.expr),
      value: this.props.value,
      onValueChange: this.props.onValueChange
    })), !this.props.onValueChange ? H.i({
      className: "text-warning fa fa-fw fa-lock"
    }) : void 0);
  };

  return DateQuickfilterComponent;

})(React.Component);

DateExprComponent = (function(superClass) {
  extend(DateExprComponent, superClass);

  function DateExprComponent() {
    this.handleChange = bind(this.handleChange, this);
    return DateExprComponent.__super__.constructor.apply(this, arguments);
  }

  DateExprComponent.propTypes = {
    type: React.PropTypes.string.isRequired,
    value: React.PropTypes.any,
    onValueChange: React.PropTypes.func
  };

  DateExprComponent.prototype.handleChange = function(val) {
    if (val) {
      return this.props.onValueChange(JSON.parse(val));
    } else {
      return this.props.onValueChange(null);
    }
  };

  DateExprComponent.prototype.render = function() {
    var i, j, options;
    options = [
      {
        value: JSON.stringify({
          op: "thisyear",
          exprs: []
        }),
        label: 'This Year'
      }, {
        value: JSON.stringify({
          op: "lastyear",
          exprs: []
        }),
        label: 'Last Year'
      }, {
        value: JSON.stringify({
          op: "thismonth",
          exprs: []
        }),
        label: 'This Month'
      }, {
        value: JSON.stringify({
          op: "lastmonth",
          exprs: []
        }),
        label: 'Last Month'
      }, {
        value: JSON.stringify({
          op: "today",
          exprs: []
        }),
        label: 'Today'
      }, {
        value: JSON.stringify({
          op: "yesterday",
          exprs: []
        }),
        label: 'Yesterday'
      }, {
        value: JSON.stringify({
          op: "last7days",
          exprs: []
        }),
        label: 'In Last 7 Days'
      }, {
        value: JSON.stringify({
          op: "last30days",
          exprs: []
        }),
        label: 'In Last 30 Days'
      }, {
        value: JSON.stringify({
          op: "last365days",
          exprs: []
        }),
        label: 'In Last 365 Days'
      }
    ];
    for (i = j = 1; j <= 24; i = ++j) {
      if (this.props.type === "date") {
        options.push({
          value: JSON.stringify({
            op: "between",
            exprs: [
              {
                type: "literal",
                valueType: this.props.type,
                value: moment().startOf("month").subtract(i, 'months').format("YYYY-MM-DD")
              }, {
                type: "literal",
                valueType: this.props.type,
                value: moment().startOf("month").subtract(i - 1, 'months').subtract(1, "days").format("YYYY-MM-DD")
              }
            ]
          }),
          label: moment().startOf("month").subtract(i, 'months').format("MMM YYYY")
        });
      } else if (this.props.type === "datetime") {
        options.push({
          value: JSON.stringify({
            op: "between",
            exprs: [
              {
                type: "literal",
                valueType: this.props.type,
                value: moment().startOf("month").subtract(i, 'months').toISOString()
              }, {
                type: "literal",
                valueType: this.props.type,
                value: moment().startOf("month").subtract(i - 1, 'months').subtract(1, "milliseconds").toISOString()
              }
            ]
          }),
          label: moment().startOf("month").subtract(i, 'months').format("MMM YYYY")
        });
      }
    }
    return H.div({
      style: {
        display: "inline-block",
        minWidth: "20em",
        verticalAlign: "middle"
      }
    }, React.createElement(ReactSelect, {
      placeholder: "All",
      value: this.props.value ? JSON.stringify(this.props.value) : "",
      multi: false,
      options: options,
      onChange: this.props.onValueChange ? this.handleChange : void 0,
      disabled: this.props.onValueChange == null
    }));
  };

  return DateExprComponent;

})(React.Component);
