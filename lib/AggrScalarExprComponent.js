var AggrScalarExprComponent, EditableLinkComponent, ExpressionBuilder, H, React, ScalarExprComponent,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

ScalarExprComponent = require('./ScalarExprComponent');

ExpressionBuilder = require('./ExpressionBuilder');

EditableLinkComponent = require('./EditableLinkComponent');

module.exports = AggrScalarExprComponent = (function(superClass) {
  extend(AggrScalarExprComponent, superClass);

  function AggrScalarExprComponent() {
    this.handleAggrChange = bind(this.handleAggrChange, this);
    this.handleExprChange = bind(this.handleExprChange, this);
    return AggrScalarExprComponent.__super__.constructor.apply(this, arguments);
  }

  AggrScalarExprComponent.propTypes = {
    title: React.PropTypes.string.isRequired,
    schema: React.PropTypes.object.isRequired,
    table: React.PropTypes.string,
    types: React.PropTypes.array,
    value: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired
  };

  AggrScalarExprComponent.prototype.handleExprChange = function(expr) {
    return this.props.onChange(_.extend({}, this.props.value, {
      expr: expr
    }));
  };

  AggrScalarExprComponent.prototype.handleAggrChange = function(aggr) {
    return this.props.onChange(_.extend({}, this.props.value, {
      aggr: aggr
    }));
  };

  AggrScalarExprComponent.prototype.renderAggr = function() {
    var aggrs, currentAggr, exprBuilder;
    exprBuilder = new ExpressionBuilder(this.props.schema);
    if (this.props.value && this.props.value.expr && exprBuilder.getExprType(this.props.value.expr)) {
      exprBuilder = new ExpressionBuilder(this.props.schema);
      aggrs = exprBuilder.getAggrs(this.props.value.expr);
      aggrs = _.filter(aggrs, function(aggr) {
        return aggr.id !== "last";
      });
      currentAggr = _.findWhere(aggrs, {
        id: this.props.value.aggr
      });
      return React.createElement(EditableLinkComponent, {
        dropdownItems: aggrs,
        onDropdownItemClicked: this.handleAggrChange
      }, currentAggr ? currentAggr.name + " of\u00A0" : void 0);
    }
  };

  AggrScalarExprComponent.prototype.render = function() {
    return H.div({
      style: {
        display: "inline-block"
      }
    }, this.renderAggr(), React.createElement(ScalarExprComponent, {
      editorTitle: this.props.title,
      schema: this.props.schema,
      table: this.props.table,
      types: this.props.types,
      onChange: this.handleExprChange,
      includeCount: true,
      value: this.props.value ? this.props.value.expr : void 0
    }));
  };

  return AggrScalarExprComponent;

})(React.Component);
