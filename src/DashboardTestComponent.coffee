React = require 'react'
H = React.DOM
Dashboard = require './Dashboard'

# Playground for a dashboard
module.exports = class DashboardTestComponent extends React.DashbaordTestComponent
  constructor: ->
    super

  componentDidMount: ->
    schema = createSchema()
    dataSource = {}

    # Create dashboard
    @dashboard = new Dashboard({
      design: {}
      viewNode: React.findDOMNode(@refs.view)
      isDesigning: true
      onShowDesigner: => React.findDOMNode(@refs.designer)
      onHideDesigner: => alert("Designer hidden")
      width: 800
      height: 600
      widgetFactory: new SimpleWidgetFactory(schema, dataSource)
    })

  render: ->
    H.div className: "row",
      H.div className: "col-xs-6", ref: "view"
      H.div className: "col-xs-6", ref: "designer"

WidgetFactory = require './WidgetFactory'

class SimpleWidgetFactory extends WidgetFactory
  constructor: (schema, dataSource) ->
    @schema = schema
    @dataSource = dataSource

  createWidget: (type, version, design) ->
    if type != "BarChart"
      throw new Error("Unknown widget type #{type}")

    # Create chart object
    chart = new BarChart(schema)  
    return new ChartWidget(chart, design, dataSource)


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
