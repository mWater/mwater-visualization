var ExpressionBuilder, H, React, ReactSelect, ScalarExprEditorComponent, ScalarExprTreeBuilder, ScalarExprTreeComponent,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

ReactSelect = require('react-select');

ScalarExprTreeBuilder = require('./ScalarExprTreeBuilder');

ScalarExprTreeComponent = require('./ScalarExprTreeComponent');

ExpressionBuilder = require('./ExpressionBuilder');

module.exports = ScalarExprEditorComponent = (function(superClass) {
  extend(ScalarExprEditorComponent, superClass);

  function ScalarExprEditorComponent() {
    this.handleWhereChange = bind(this.handleWhereChange, this);
    this.handleAggrChange = bind(this.handleAggrChange, this);
    this.handleTreeChange = bind(this.handleTreeChange, this);
    return ScalarExprEditorComponent.__super__.constructor.apply(this, arguments);
  }

  ScalarExprEditorComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    value: React.PropTypes.object,
    table: React.PropTypes.string
  };

  ScalarExprEditorComponent.prototype.handleTreeChange = function(val) {
    return this.props.onChange(_.extend({}, this.props.value || {
      type: "scalar"
    }, val));
  };

  ScalarExprEditorComponent.prototype.handleAggrChange = function(aggr) {
    return this.props.onChange(_.extend({}, this.props.value, {
      aggr: aggr
    }));
  };

  ScalarExprEditorComponent.prototype.handleWhereChange = function(where) {
    return this.props.onChange(_.extend({}, this.props.value, {
      where: where
    }));
  };

  ScalarExprEditorComponent.prototype.renderTree = function() {
    var tree, treeBuilder;
    treeBuilder = new ScalarExprTreeBuilder(this.props.schema);
    tree = treeBuilder.getTree({
      table: this.props.table
    });
    return React.createElement(ScalarExprTreeComponent, {
      tree: tree,
      value: _.pick(this.props.value, "table", "joins", "expr"),
      onChange: this.handleTreeChange
    });
  };

  ScalarExprEditorComponent.prototype.renderAggr = function() {
    var exprBuilder, options;
    exprBuilder = new ExpressionBuilder(this.props.schema);
    if (this.props.value && this.props.value.aggr) {
      if (exprBuilder.getExprType(this.props.value.expr) === "id") {
        return;
      }
      options = _.map(exprBuilder.getAggrs(this.props.value.expr), function(aggr) {
        return {
          value: aggr.id,
          label: aggr.name
        };
      });
      return H.div(null, H.br(), H.label(null, "Aggregate by"), React.createElement(ReactSelect, {
        value: this.props.value.aggr,
        options: options,
        onChange: this.handleAggrChange
      }));
    }
  };

  ScalarExprEditorComponent.prototype.renderWhere = function() {
    var LogicalExprComponent, exprBuilder;
    exprBuilder = new ExpressionBuilder(this.props.schema);
    if (this.props.value && this.props.value.aggr) {
      LogicalExprComponent = require('./LogicalExprComponent');
      return H.div(null, H.br(), H.label(null, "Filter Aggregation"), React.createElement(LogicalExprComponent, {
        schema: this.props.schema,
        table: this.props.value.expr.table,
        value: this.props.value.where,
        onChange: this.handleWhereChange
      }));
    }
  };

  ScalarExprEditorComponent.prototype.render = function() {
    var exprBuilder;
    exprBuilder = new ExpressionBuilder(this.props.schema);
    return H.div(null, H.label(null, "Select Field"), H.div({
      style: {
        overflowY: "scroll",
        height: 350,
        border: "solid 1px #CCC"
      }
    }, this.renderTree()), this.renderAggr(), this.renderWhere());
  };

  return ScalarExprEditorComponent;

})(React.Component);
