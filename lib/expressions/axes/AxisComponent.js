var AxisComponent, EditableLinkComponent, ExpressionBuilder, H, React, ScalarExprComponent,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

ScalarExprComponent = require('../ScalarExprComponent');

ExpressionBuilder = require('../ExpressionBuilder');

EditableLinkComponent = require('../../EditableLinkComponent');

module.exports = AxisComponent = (function(superClass) {
  extend(AxisComponent, superClass);

  function AxisComponent() {
    this.handleAggrChange = bind(this.handleAggrChange, this);
    this.handleExprChange = bind(this.handleExprChange, this);
    return AxisComponent.__super__.constructor.apply(this, arguments);
  }

  AxisComponent.propTypes = {
    editorTitle: React.PropTypes.any.isRequired,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    table: React.PropTypes.string,
    types: React.PropTypes.array,
    aggrNeed: React.PropTypes.oneOf(['none', 'optional', 'required']).isRequired,
    value: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired
  };

  AxisComponent.prototype.handleExprChange = function(expr) {
    return this.props.onChange(_.extend({}, this.props.value, {
      expr: expr
    }));
  };

  AxisComponent.prototype.handleAggrChange = function(aggr) {
    return this.props.onChange(_.extend({}, this.props.value, {
      aggr: aggr
    }));
  };

  AxisComponent.prototype.renderAggr = function() {
    var aggrs, currentAggr, exprBuilder;
    if (this.props.aggrNeed === "none") {
      return;
    }
    exprBuilder = new ExpressionBuilder(this.props.schema);
    if (this.props.value && exprBuilder.getExprType(this.props.value.expr) !== "count") {
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
      }, currentAggr ? currentAggr.name : void 0);
    }
  };

  AxisComponent.prototype.render = function() {
    return H.div({
      style: {
        display: "inline-block"
      }
    }, this.renderAggr(), React.createElement(ScalarExprComponent, {
      editorTitle: this.props.editorTitle,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.table,
      types: this.props.types,
      onChange: this.handleExprChange,
      includeCount: this.props.aggrNeed !== "none",
      value: this.props.value ? this.props.value.expr : void 0
    }));
  };

  return AxisComponent;

})(React.Component);
