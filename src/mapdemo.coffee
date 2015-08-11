React = require 'react'
H = React.DOM
AutoSizeComponent = require './AutoSizeComponent'
MapViewComponent = require './maps/MapViewComponent'
MapDesignerComponent = require './maps/MapDesignerComponent'
LayerFactory = require './maps/LayerFactory'

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
  schema.addColumn("entities.water_point", { id: "type", name: "Type", type: "enum", values: [{ id: "Protected dug well", name:  "Protected dug well" }] })
  schema.addColumn("entities.water_point", { id: "name", name: "Name", type: "text" })
  schema.addColumn("entities.water_point", { id: "desc", name: "Description", type: "text" })

  schema.addNamedExpr("entities.water_point", { id: "type", name: "Water Point Type", expr: { type: "field", table: "entities.water_point", column: "type" }})

  return schema


$ ->
  schema = createSchema()

        # @renderLayer("E.Coli Status", "WHO Standard E.Coli Colors", true)
        # @renderLayer("Safe Water Access", "Within 1000 meters of safe, functional water", true)
        # @renderLayer("Arsenic", "Arsenic levels, WHO standard")

  layerViews = []
  addLegacyLayerView = (id, name, visible) ->
    layerViews.push { 
      id: id
      name: name
      visible: visible == true
      opacity: 1
      layer: {
        type: "Legacy"
        design: {
          type: id
        }
      }
    }

  addLegacyLayerView("water_points_by_type", "Water Point Type", true)
  addLegacyLayerView("functional_status", "Functionality")
  addLegacyLayerView("ecoli_status", "E.Coli Level")
  addLegacyLayerView("water_access", "Functional Water Access")
  addLegacyLayerView("safe_water_access", "Safe Water Access")

  design = {
    baseLayer: "bing_road"
    layerViews: layerViews
    filters: {}
    bounds: { w: 0, n: 0, e: 40, s: -25 }
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
    layerFactory = new LayerFactory(schema: @props.schema)

    H.div style: { height: "100%", width: "100%" },
      H.style null, ''' html, body { height: 100% }'''
      H.div style: { position: "absolute", width: "70%", height: "100%" }, 
        React.createElement(AutoSizeComponent, injectWidth: true, injectHeight: true, 
          React.createElement(MapViewComponent, 
            schema: @props.schema, 
            design: @state.design
            onDesignChange: @handleDesignChange
            layerFactory: layerFactory)
        )
      H.div style: { position: "absolute", left: "70%", width: "30%" }, 
        React.createElement(MapDesignerComponent, 
          schema: @props.schema, 
          design: @state.design, 
          onDesignChange: @handleDesignChange
          layerFactory: layerFactory)
