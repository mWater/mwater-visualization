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

  BarChartDesignerComponent.prototype.renderYAesthetic = function() {
    return React.createElement(AestheticComponent, {
      title: "Value (Y) Axis",
      schema: this.props.schema,
      table: this.props.design.table,
      aggrRequired: true,
      value: this.props.design.aesthetics.y,
      onChange: this.handleAestheticChange.bind(this, "y")
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
    return H.div(null, this.renderXAesthetic(), this.renderYAesthetic(), this.renderFilter());
  };

  return BarChartDesignerComponent;

})(React.Component);

AestheticComponent = (function(superClass) {
  extend(AestheticComponent, superClass);

  function AestheticComponent() {
    this.handleAggrChange = bind(this.handleAggrChange, this);
    this.handleExprChange = bind(this.handleExprChange, this);
    return AestheticComponent.__super__.constructor.apply(this, arguments);
  }

  AestheticComponent.propTypes = {
    title: React.PropTypes.string.isRequired,
    schema: React.PropTypes.object.isRequired,
    table: React.PropTypes.string,
    types: React.PropTypes.array,
    value: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired,
    aggrRequired: React.PropTypes.bool
  };

  AestheticComponent.prototype.handleExprChange = function(expr) {
    return this.props.onChange(_.extend({}, this.props.value, {
      expr: expr
    }));
  };

  AestheticComponent.prototype.handleAggrChange = function(ev) {
    return this.props.onChange(_.extend({}, this.props.value, {
      aggr: ev.target.value
    }));
  };

  AestheticComponent.prototype.renderAggr = function() {
    var aggrs, currentAggr, exprBuilder;
    if (this.props.value && this.props.aggrRequired && this.props.value.expr) {
      exprBuilder = new ExpressionBuilder(this.props.schema);
      aggrs = exprBuilder.getAggrs(this.props.value.expr);
      aggrs = _.filter(aggrs, function(aggr) {
        return aggr.id !== "last";
      });
      currentAggr = _.findWhere(aggrs, {
        id: this.props.value.aggr
      });
      return H.div({
        style: {
          display: "inline-block"
        }
      }, H.div({
        className: "dropdown",
        style: {
          display: "inline-block"
        }
      }, H.span({
        "data-toggle": "dropdown",
        className: "editable-link"
      }, currentAggr ? currentAggr.name : void 0), H.ul({
        className: "dropdown-menu"
      }, _.map(aggrs, function(aggr) {
        return H.li(null, H.a({
          key: aggr.id
        }, aggr.name));
      }))), H.span({
        className: "text-muted"
      }, "\u00A0of\u00A0"));
    }
  };

  AestheticComponent.prototype.render = function() {
    return H.div({
      className: "form-group"
    }, H.label(null, this.props.title), H.div(null, this.renderAggr(), React.createElement(ScalarExprComponent, {
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
