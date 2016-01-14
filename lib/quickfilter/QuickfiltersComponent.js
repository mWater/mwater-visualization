var EnumQuickfilterComponent, ExprUtils, H, QuickfiltersComponent, React, ReactSelect, TextLiteralComponent, TextQuickfilterComponent,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

React = require('react');

H = React.DOM;

ReactSelect = require('react-select');

ExprUtils = require('mwater-expressions').ExprUtils;

TextLiteralComponent = require('./TextLiteralComponent');

module.exports = QuickfiltersComponent = (function(superClass) {
  extend(QuickfiltersComponent, superClass);

  function QuickfiltersComponent() {
    return QuickfiltersComponent.__super__.constructor.apply(this, arguments);
  }

  QuickfiltersComponent.propTypes = {
    design: React.PropTypes.array,
    values: React.PropTypes.array,
    onValuesChange: React.PropTypes.func.isRequired,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired
  };

  QuickfiltersComponent.prototype.renderQuickfilter = function(item, index) {
    var itemValue, type, values;
    values = this.props.values || [];
    itemValue = values[index];
    type = new ExprUtils(this.props.schema).getExprType(item.expr);
    if (type === "enum") {
      return React.createElement(EnumQuickfilterComponent, {
        key: index,
        label: item.label,
        expr: item.expr,
        schema: this.props.schema,
        options: new ExprUtils(this.props.schema).getExprEnumValues(item.expr),
        value: itemValue,
        onValueChange: (function(_this) {
          return function(v) {
            values = (_this.props.values || []).slice();
            values[index] = v;
            return _this.props.onValuesChange(values);
          };
        })(this)
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
        onValueChange: (function(_this) {
          return function(v) {
            values = (_this.props.values || []).slice();
            values[index] = v;
            return _this.props.onValuesChange(values);
          };
        })(this)
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
        paddingTop: 5,
        paddingBottom: 5
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
    label: React.PropTypes.string.isRequired,
    schema: React.PropTypes.object.isRequired,
    options: React.PropTypes.arrayOf(React.PropTypes.shape({
      id: React.PropTypes.string.isRequired,
      name: React.PropTypes.object.isRequired
    })).isRequired,
    value: React.PropTypes.any,
    onValueChange: React.PropTypes.func.isRequired
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
      options: _.map(this.props.options, function(opt) {
        return {
          value: opt.id,
          label: opt.name.en
        };
      }),
      onChange: this.handleChange
    })));
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
    onValueChange: React.PropTypes.func.isRequired
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
    })));
  };

  return TextQuickfilterComponent;

})(React.Component);
