var ComparisonExprComponent, H, HoverMixin, ListComponent, LogicalExprComponent, React, ScalarExprComponent, Schema, createSchema, literalComponents;

ListComponent = require('./ListComponent');

React = require('react');

HoverMixin = require('./HoverMixin');

H = React.DOM;

Schema = require('./Schema');

ScalarExprComponent = require('./ScalarExprComponent');

literalComponents = require('./literalComponents');

ComparisonExprComponent = require('./ComparisonExprComponent');

LogicalExprComponent = require('./LogicalExprComponent');

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
    type: "id"
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
  schema.addColumn("a", {
    id: "b",
    name: "A to B",
    type: "join",
    join: {
      fromTable: "a",
      fromColumn: "x",
      toTable: "b",
      toColumn: "q",
      op: "=",
      multiple: true
    }
  });
  schema.addTable({
    id: "b",
    name: "B"
  });
  schema.addColumn("b", {
    id: "q",
    name: "Q",
    type: "id"
  });
  schema.addColumn("b", {
    id: "r",
    name: "R",
    type: "integer"
  });
  schema.addColumn("b", {
    id: "s",
    name: "S",
    type: "text"
  });
  return schema;
};

$(function() {
  var expr, sample, schema;
  schema = createSchema();
  expr = null;
  sample = H.div({
    className: "container"
  }, React.createElement(require("./ChartTestComponent"), {
    schema: createSchema()
  }));
  return React.render(sample, document.getElementById('root'));
});
