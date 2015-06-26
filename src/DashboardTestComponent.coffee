React = require 'react'
H = React.DOM
Dashboard = require './Dashboard'

# Playground for a dashboard
module.exports = class DashboardTestComponent extends React.Component
  constructor: ->
    super

  componentDidMount: ->
    schema = createSchema()
    dataSource = new SimpleDataSource()

    # Create dashboard
    @dashboard = new Dashboard({
      design: dashboardDesign
      viewNode: React.findDOMNode(@refs.view)
      isDesigning: true
      onShowDesigner: => React.findDOMNode(@refs.designer)
      onHideDesigner: => alert("Designer hidden")
      width: 800
      height: 600
      widgetFactory: new SimpleWidgetFactory(schema, dataSource)
    })

    @dashboard.render()

  render: ->
    H.div className: "row",
      H.div className: "col-xs-6", ref: "view"
      H.div className: "col-xs-6", ref: "designer"

data = {"main":[{"x":"broken","y":"48520"},{"x":null,"y":"2976"},{"x":"ok","y":"173396"},{"x":"maint","y":"12103"},{"x":"missing","y":"3364"}]}    

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
}


dashboardDesign = {
  items: {
    "1": {
      layout: { x: 4, y: 0, w: 6, h: 6 }
      widget: {
        type: "BarChart"
        version: "0.0.0"
        design: chartDesign
      }
    }
  }
}

DataSource = require './DataSource'

class SimpleDataSource extends DataSource 
  fetchData: (queries, cb) ->
    cb(null, data)

WidgetFactory = require './WidgetFactory'
BarChart = require './BarChart'
ChartWidget = require './ChartWidget'

class SimpleWidgetFactory extends WidgetFactory
  constructor: (schema, dataSource) ->
    @schema = schema
    @dataSource = dataSource

  createWidget: (type, version, design) ->
    if type != "BarChart"
      throw new Error("Unknown widget type #{type}")

    # Create chart object
    chart = new BarChart(@schema)  
    return new ChartWidget(chart, design, @dataSource)


Schema = require './Schema'

createSchema = ->
  # Create simple schema with subtree
  schema = new Schema()
  schema.addTable({ id: "a", name: "A" })
  schema.addColumn("a", { id: "x", name: "X", type: "id" })
  schema.addColumn("a", { id: "y", name: "Y", type: "text" })
  schema.addColumn("a", { id: "integer", name: "Integer", type: "integer" })
  schema.addColumn("a", { id: "decimal", name: "Decimal", type: "decimal" })
  schema.addColumn("a", { id: "enum", name: "Enum", type: "enum", values: [
    { id: "apple", name: "Apple" }
    { id: "banana", name: "Banana" }
    ] })
  schema.addColumn("a", 
    { id: "b", name: "A to B", type: "join", join: {
      fromTable: "a", fromColumn: "x", toTable: "b", toColumn: "q", op: "=", multiple: true }})

  schema.addTable({ id: "b", name: "B" })
  schema.addColumn("b", { id: "q", name: "Q", type: "id" }) 
  schema.addColumn("b", { id: "r", name: "R", type: "integer" })
  schema.addColumn("b", { id: "s", name: "S", type: "text" })
  return schema
