React = require 'react'
H = React.DOM
AutoSizeComponent = require './AutoSizeComponent'
MapViewComponent = require './maps/MapViewComponent'
MapDesignerComponent = require './maps/MapDesignerComponent'

Schema = require './Schema'

createSchema = ->
  # Create simple schema with subtree
  schema = new Schema()
  schema.addTable({ id: "a", name: "A" })
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
  schema.addColumn("b", { id: "r", name: "R", type: "integer" })
  schema.addColumn("b", { id: "s", name: "S", type: "text" })

  return schema


$ ->
  schema = createSchema()

        # @renderLayer("E.Coli Status", "WHO Standard E.Coli Colors", true)
        # @renderLayer("Safe Water Access", "Within 1000 meters of safe, functional water", true)
        # @renderLayer("Arsenic", "Arsenic levels, WHO standard")

  layers = [
    { id: "1", name: "E.Coli Status", visible: true }
    { id: "2", name: "Safe Water Access", visible: false }
  ]

  design = {
    baseLayer: "bing_road"
    layers: layers
  }


  sample = React.createElement(MapDemoComponent, initialDesign: design, schema: schema)
  React.render(sample, document.body)


class MapDemoComponent extends React.Component
  constructor: ->
    super
    @state = { design: @props.initialDesign } 

  handleDesignChange: (design) =>
    @setState(design: design)

  render: ->
    H.div style: { height: "100%", width: "100%" },
      H.style null, ''' html, body { height: 100% }'''
      H.div style: { position: "absolute", width: "70%", height: "100%" }, 
        React.createElement(AutoSizeComponent, injectWidth: true, injectHeight: true, 
          React.createElement(MapViewComponent)
        )
      H.div style: { position: "absolute", left: "70%", width: "30%" }, 
        React.createElement(MapDesignerComponent, 
          schema: @props.schema, 
          design: @state.design, 
          onDesignChange: @handleDesignChange)
