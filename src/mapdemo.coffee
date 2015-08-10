React = require 'react'
H = React.DOM
AutoSizeComponent = require './AutoSizeComponent'
MapViewComponent = require './maps/MapViewComponent'
MapDesignerComponent = require './maps/MapDesignerComponent'
TileSourceFactory = require './maps/TileSourceFactory'

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

  schema.addTable({ id: "entities.water_point", name: "Water Points" })
  schema.addColumn("entities.water_point", { id: "name", name: "Name", type: "text" })
  schema.addColumn("entities.water_point", { id: "desc", name: "Description", type: "text" })

  return schema


$ ->
  schema = createSchema()

        # @renderLayer("E.Coli Status", "WHO Standard E.Coli Colors", true)
        # @renderLayer("Safe Water Access", "Within 1000 meters of safe, functional water", true)
        # @renderLayer("Arsenic", "Arsenic levels, WHO standard")

  layers = []
  addLegacyLayer = (id, name, visible) ->
    layers.push { 
      id: id
      name: name
      visible: visible == true
      opacity: 1
      tileSource: {
        type: "Legacy"
        design: {
          type: id
        }
      }
    }

  addLegacyLayer("water_points_by_type", "Water Point Type", true)
  addLegacyLayer("functional_status", "Functionality")
  addLegacyLayer("ecoli_status", "E.Coli Level")
  addLegacyLayer("water_access", "Functional Water Access")
  addLegacyLayer("safe_water_access", "Safe Water Access")

  design = {
    baseLayer: "bing_road"
    layers: layers
    filters: {}
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
    tileSourceFactory = new TileSourceFactory(schema: @props.schema)

    H.div style: { height: "100%", width: "100%" },
      H.style null, ''' html, body { height: 100% }'''
      H.div style: { position: "absolute", width: "70%", height: "100%" }, 
        React.createElement(AutoSizeComponent, injectWidth: true, injectHeight: true, 
          React.createElement(MapViewComponent, 
            design: @state.design
            onDesignChange: @handleDesignChange
            tileSourceFactory: tileSourceFactory)
        )
      H.div style: { position: "absolute", left: "70%", width: "30%" }, 
        React.createElement(MapDesignerComponent, 
          schema: @props.schema, 
          design: @state.design, 
          onDesignChange: @handleDesignChange
          tileSourceFactory: tileSourceFactory)
