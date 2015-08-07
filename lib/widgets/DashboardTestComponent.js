var Dashboard, DashboardTestComponent, DataSource, H, React, Schema, SimpleDataSource, WidgetFactory, chartDesign, createSchema, dashboardDesign, data,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

Dashboard = require('./Dashboard');

WidgetFactory = require('./WidgetFactory');

module.exports = DashboardTestComponent = (function(superClass) {
  extend(DashboardTestComponent, superClass);

  function DashboardTestComponent() {
    DashboardTestComponent.__super__.constructor.apply(this, arguments);
  }

  DashboardTestComponent.prototype.componentDidMount = function() {
    var dataSource, schema;
    schema = createSchema();
    dataSource = new SimpleDataSource();
    this.dashboard = new Dashboard({
      design: dashboardDesign,
      viewNode: React.findDOMNode(this.refs.view),
      isDesigning: true,
      onShowDesigner: (function(_this) {
        return function() {
          return React.findDOMNode(_this.refs.designer);
        };
      })(this),
      onHideDesigner: (function(_this) {
        return function() {
          return alert("Designer hidden");
        };
      })(this),
      width: 800,
      widgetFactory: new WidgetFactory(schema, dataSource)
    });
    console.log("Rendering dashboard");
    return this.dashboard.render();
  };

  DashboardTestComponent.prototype.render = function() {
    return H.div({
      className: "row",
      style: {}
    }, H.div({
      className: "col-xs-8",
      ref: "view"
    }), H.div({
      className: "col-xs-4",
      ref: "designer"
    }));
  };

  return DashboardTestComponent;

})(React.Component);

data = {
  "main": [
    {
      "x": "broken",
      "y": "48520"
    }, {
      "x": null,
      "y": "2976"
    }, {
      "x": "ok",
      "y": "173396"
    }, {
      "x": "maint",
      "y": "12103"
    }, {
      "x": "missing",
      "y": "3364"
    }
  ]
};

chartDesign = {
  "aesthetics": {
    "x": {
      "expr": {
        "type": "scalar",
        "table": "a",
        "joins": [],
        "expr": {
          "type": "field",
          "table": "a",
          "column": "enum"
        }
      }
    },
    "y": {
      "expr": {
        "type": "scalar",
        "table": "a",
        "joins": [],
        "expr": {
          "type": "field",
          "table": "a",
          "column": "decimal"
        }
      },
      "aggr": "sum"
    }
  },
  "table": "a",
  "filter": {
    "type": "logical",
    "table": "a",
    "op": "and",
    "exprs": [
      {
        "type": "comparison",
        "table": "a",
        "lhs": {
          "type": "scalar",
          "table": "a",
          "joins": [],
          "expr": {
            "type": "field",
            "table": "a",
            "column": "integer"
          }
        },
        "op": "=",
        "rhs": {
          "type": "literal",
          "valueType": "integer",
          "value": 5
        }
      }
    ]
  }
};

dashboardDesign = {
  items: {
    a: {
      layout: {
        x: 0,
        y: 0,
        w: 12,
        h: 12
      },
      widget: {
        type: "BarChart",
        version: "0.0.0",
        design: chartDesign
      }
    },
    b: {
      layout: {
        x: 12,
        y: 0,
        w: 12,
        h: 12
      },
      widget: {
        type: "BarChart",
        version: "0.0.0",
        design: _.cloneDeep(chartDesign)
      }
    }
  }
};

DataSource = require('./../DataSource');

SimpleDataSource = (function(superClass) {
  extend(SimpleDataSource, superClass);

  function SimpleDataSource() {
    return SimpleDataSource.__super__.constructor.apply(this, arguments);
  }

  SimpleDataSource.prototype.performQueries = function(queries, cb) {
    return cb(null, data);
  };

  return SimpleDataSource;

})(DataSource);

Schema = require('./../Schema');

createSchema = function() {
  var schema;
  schema = new Schema();
  schema.addTable({
    id: "a",
    name: "A"
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
