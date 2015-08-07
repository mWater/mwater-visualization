var ComparisonExprComponent, DesignValidator, H, HoverMixin, ListComponent, LogicalExprComponent, React, SaveCancelModalComponent, ScalarExprComponent, Schema, createSchema, literalComponents;

SaveCancelModalComponent = require('./SaveCancelModalComponent');

ListComponent = require('./ListComponent');

React = require('react');

HoverMixin = require('./HoverMixin');

H = React.DOM;

DesignValidator = require('./DesignValidator');

Schema = require('./Schema');

ScalarExprComponent = require('./expressions/ScalarExprComponent');

literalComponents = require('./expressions/literalComponents');

ComparisonExprComponent = require('./expressions/ComparisonExprComponent');

LogicalExprComponent = require('./expressions/LogicalExprComponent');

createSchema = function() {
  var schema;
  schema = new Schema();
  schema.addTable({
    id: "a",
    name: "A"
  });
  schema.addColumn("a", {
    id: "x",
    name: "X",
    type: "uuid"
  });
  schema.addColumn("a", {
    id: "y",
    name: "Y",
    type: "text"
  });
  schema.addColumn("a", {
    id: "integer",
    name: "Integer",
    type: "integer"
  });
  schema.addColumn("a", {
    id: "decimal",
    name: "Decimal",
    type: "decimal"
  });
  schema.addColumn("a", {
    id: "enum",
    name: "Enum",
    type: "enum",
    values: [
      {
        id: "apple",
        name: "Apple"
      }, {
        id: "banana",
        name: "Banana"
      }
    ]
  });
  schema.addTable({
    id: "b",
    name: "B"
  });
  schema.addColumn("b", {
    id: "q",
    name: "Q",
    type: "uuid",
    primary: true
  });
  schema.addColumn("b", {
    id: "r",
    name: "R",
    type: "text"
  });
  schema.addColumn("b", {
    id: "s",
    name: "S",
    type: "uuid"
  });
  schema.addJoin({
    id: "ab",
    name: "AB",
    fromTableId: "a",
    fromColumnId: "x",
    toTableId: "b",
    toColumnId: "s",
    op: "=",
    oneToMany: true
  });
  schema.addJoin({
    id: "ba",
    name: "BA",
    fromTableId: "b",
    fromColumnId: "s",
    toTableId: "a",
    toColumnId: "x",
    op: "=",
    oneToMany: false
  });
  return schema;
};

$(function() {
  var Holder, designValidator, expr, sample, schema;
  schema = createSchema();
  designValidator = new DesignValidator(schema);
  expr = null;
  Holder = React.createClass({
    getInitialState: function() {
      return {
        expr: this.props.initialExpr
      };
    },
    handleChange: function(expr) {
      expr = designValidator.cleanExpr(expr);
      return this.setState({
        expr: expr
      });
    },
    render: function() {
      return H.div(null, React.createElement(LogicalExprComponent, {
        schema: schema,
        baseTableId: "a",
        expr: this.state.expr,
        onChange: this.handleChange
      }), H.pre(null, JSON.stringify(this.state.expr, null, 2)));
    }
  });
  sample = React.createElement(Holder, {
    initialExpr: expr
  });
  return React.render(sample, document.getElementById('root'));
});
