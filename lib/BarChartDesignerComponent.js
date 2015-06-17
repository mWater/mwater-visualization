var AestheticComponent, BarChartDesignerComponent, ExpressionBuilder, H, LogicalExprComponent, React, ScalarExprComponent,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

ScalarExprComponent = require('./ScalarExprComponent');

LogicalExprComponent = require('./LogicalExprComponent');

ExpressionBuilder = require('./ExpressionBuilder');

module.exports = BarChartDesignerComponent = (function(superClass) {
  extend(BarChartDesignerComponent, superClass);

  function BarChartDesignerComponent() {
    this.handleFilterChange = bind(this.handleFilterChange, this);
    this.handleAestheticChange = bind(this.handleAestheticChange, this);
    return BarChartDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  BarChartDesignerComponent.prototype.handleAestheticChange = function(aes, val) {
    var aesthetics;
    aesthetics = _.clone(this.props.design.aesthetics);
    aesthetics[aes] = val;
    return this.props.onChange(_.extend({}, this.props.design, {
      aesthetics: aesthetics
    }));
  };

  BarChartDesignerComponent.prototype.handleFilterChange = function(val) {
    return this.props.onChange(_.extend({}, this.props.design, {
      filter: val
    }));
  };

  BarChartDesignerComponent.prototype.renderYAesthetic = function() {
    return React.createElement(AestheticComponent, {
      title: "Value (Y) Axis",
      schema: this.props.schema,
      table: this.props.design.table,
      types: ["decimal", "integer"],
      value: this.props.design.aesthetics.y,
      onChange: this.handleAestheticChange.bind(this, "y")
    });
  };

  BarChartDesignerComponent.prototype.renderXAesthetic = function() {
    return React.createElement(AestheticComponent, {
      title: "Category (X) Axis",
      schema: this.props.schema,
      table: this.props.design.table,
      types: ["enum", "text"],
      value: this.props.design.aesthetics.x,
      onChange: this.handleAestheticChange.bind(this, "x")
    });
  };

  BarChartDesignerComponent.prototype.renderFilter = function() {
    if (!this.props.design.table) {
      return null;
    }
    return H.div({
      className: "form-group"
    }, H.label(null, "Filter"), React.createElement(LogicalExprComponent, {
      schema: this.props.schema,
      onChange: this.handleFilterChange,
      table: this.props.design.table,
      value: this.props.design.filter
    }));
  };

  BarChartDesignerComponent.prototype.render = function() {
    return H.div(null, this.renderYAesthetic(), this.renderXAesthetic(), this.renderFilter());
  };

  return BarChartDesignerComponent;

})(React.Component);

AestheticComponent = (function(superClass) {
  extend(AestheticComponent, superClass);

  function AestheticComponent() {
    this.handleExprChange = bind(this.handleExprChange, this);
    return AestheticComponent.__super__.constructor.apply(this, arguments);
  }

  AestheticComponent.prototype.handleExprChange = function(expr) {
    return this.props.onChange(_.extend({}, this.props.value, {
      expr: expr
    }));
  };

  AestheticComponent.prototype.render = function() {
    return H.div({
      className: "form-group"
    }, H.label(null, this.props.title), H.div(null, React.createElement(ScalarExprComponent, {
      editorTitle: this.props.title,
      schema: this.props.schema,
      table: this.props.table,
      types: this.props.types,
      onChange: this.handleExprChange,
      value: this.props.value ? this.props.value.expr : void 0
    })));
  };

  return AestheticComponent;

})(React.Component);
