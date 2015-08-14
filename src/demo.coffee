H = React.DOM
visualization_mwater = require './systems/mwater'
visualization = require './index'

class DashboardPane extends React.Component
  constructor: (props) ->
    super

    @state = {
      design: dashboardDesign
    }

  componentDidMount: ->
    visualization_mwater.createSchema @props.apiUrl, null, null, null, (err, schema) =>
      if err
        throw err
        
      dataSource = visualization_mwater.createDataSource(@props.apiUrl, @props.client)
      widgetFactory = new visualization.WidgetFactory(schema, dataSource)

      @setState(widgetFactory: widgetFactory)

  handleDesignChange: (design) =>
    @setState(design: design)
    
  render: ->
    if not @state.widgetFactory
      return H.div null, "Loading..."

    return H.div style: { height: "100%" },
      React.createElement(visualization.DashboardComponent, {
        design: @state.design
        widgetFactory: @state.widgetFactory
        onDesignChange: @handleDesignChange
        })

dashboardDesign = {"items":{"fc8d82bc-c485-4bc7-bc6d-b6c351f33813":{"layout":{"x":0,"y":0,"w":12,"h":12},"widget":{"type":"LayeredChart","version":"0.0.0","design":{"type":"pie","layers":[{"xExpr":null,"yExpr":{"type":"scalar","table":"entities.water_point","joins":[],"expr":{"type":"count","table":"entities.water_point"}},"colorExpr":{"type":"scalar","table":"entities.water_point","joins":[],"expr":{"type":"field","table":"entities.water_point","column":"type"}},"filter":null,"table":"entities.water_point","yAggr":"count"}],"titleText":"Water Points by Type"}}},"34e1f95a-30f5-4d63-b90f-bd3d310db850":{"layout":{"x":12,"y":0,"w":12,"h":12},"widget":{"type":"LayeredChart","version":"0.0.0","design":{"type":"bar","layers":[{"xExpr":{"type":"scalar","table":"entities.water_point","joins":["source_notes"],"expr":{"type":"field","table":"source_notes","column":"status"},"aggr":"last"},"yExpr":{"type":"scalar","table":"entities.water_point","joins":[],"expr":{"type":"count","table":"entities.water_point"}},"colorExpr":null,"filter":null,"table":"entities.water_point","yAggr":"count"}],"titleText":"Water Points by Status","transpose":false}}}}}

$ ->
  sample = H.div className: "container-fluid", style: { height: "100%" },
    H.style null, '''html, body { height: 100% }'''
    React.createElement(DashboardPane, apiUrl: "https://api.mwater.co/v3/")
  React.render(sample, document.body)



