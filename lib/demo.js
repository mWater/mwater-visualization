var ComparisonExprComponent, H, ListComponent, LogicalExprComponent, React, ScalarExprComponent, Schema, SimpleWidgetFactory, WidgetFactory, createSchema, literalComponents,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ListComponent = require('./ListComponent');

React = require('react');

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

WidgetFactory = require('./WidgetFactory');

SimpleWidgetFactory = (function(superClass) {
  extend(SimpleWidgetFactory, superClass);

  function SimpleWidgetFactory(schema, dataSource) {
    this.schema = schema;
    this.dataSource = dataSource;
  }

  SimpleWidgetFactory.prototype.createWidget = function(type, version, design) {
    var chart;
    if (type !== "BarChart") {
      throw new Error("Unknown widget type " + type);
    }
    chart = new BarChart(schema);
    return new ChartWidget(chart, design, dataSource);
  };

  return SimpleWidgetFactory;

})(WidgetFactory);

$(function() {
  var expr, sample, schema;
  schema = createSchema();
  expr = null;
  sample = H.div({
    className: "container-fluid"
  }, React.createElement(require("./DashboardTestComponent")));
  return React.render(sample, document.getElementById('root'));
});
