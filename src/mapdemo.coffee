H = React.DOM
visualization_mwater = require './systems/mwater'
visualization = require './index'
uuid = require 'node-uuid'

class MapDemoComponent extends React.Component
  constructor: (props) ->
    super
    @state = { design: @props.initialDesign }

  componentDidMount: ->
    visualization_mwater.createSchema { apiUrl: @props.apiUrl, client: @props.client }, (err, schema) =>
      if err
        throw err
        
      dataSource = visualization_mwater.createDataSource(@props.apiUrl, @props.client)
      widgetFactory = new visualization.WidgetFactory(schema, dataSource)
      layerFactory = new visualization.LayerFactory({
        schema: schema
        dataSource: dataSource
        apiUrl: @props.apiUrl
        client: @props.client
        newLayers: newLayers
        onMarkerClick: (table, id) => alert("#{table}:#{id}")
      })

      @setState(schema: schema, widgetFactory: widgetFactory, dataSource: dataSource, layerFactory: layerFactory)

  handleDesignChange: (design) =>
    @setState(design: design)
    console.log JSON.stringify(design, null, 2)
    
  render: ->
    if not @state.schema
      return H.div null, "Loading..."

    return H.div style: { height: "100%" },
      H.style null, '''html, body { height: 100% }'''
      React.createElement(visualization.MapComponent, {
        layerFactory: @state.layerFactory
        schema: @state.schema
        dataSource: @state.dataSource
        design: @state.design
        onDesignChange: @handleDesignChange
        })

layerViews = []
newLayers = []
addServerLayerView = (options) ->
  newLayers.push {
    name: options.name
    type: "MWaterServer"
    design: {
      type: options.type
      table: "entities.water_point"
      minZoom: options.minZoom
      maxZoom: options.maxZoom
    }
  }
  
  layerViews.push { 
    id: uuid.v4()
    name: options.name
    visible: options.visible == true
    opacity: 1
    type: "MWaterServer"
    group: options.group
    design: {
      type: options.type
      table: "entities.water_point"
      minZoom: options.minZoom
      maxZoom: options.maxZoom
    }
  }

addServerLayerView({ type: "safe_water_access", name: "Safe Water Access", group: "access", minZoom: 10 })
addServerLayerView({ type: "water_access", name: "Functional Water Access", group: "access", minZoom: 10 })
addServerLayerView({ type: "water_points_by_type", name: "Water Point Type", group: "points", visible: true })
addServerLayerView({ type: "functional_status", name: "Functionality", group: "points" })
addServerLayerView({ type: "ecoli_status", name: "E.Coli Level", group: "points" })

newLayers.push {
  name: "Custom Layer"
  type: "Markers"
  design: { }
}

design = {
  baseLayer: "bing_road"
  layerViews: layerViews
  filters: {}
  bounds: { w: 0, n: 0, e: 40, s: -25 }
}


$ ->
  # sample = React.createElement(MapDemoComponent, initialDesign: design, apiUrl: "http://localhost:1234/v3/")
  sample = React.createElement(MapDemoComponent, initialDesign: design, apiUrl: "https://api.mwater.co/v3/")
  React.render(sample, document.body)
