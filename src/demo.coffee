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
    visualization_mwater.createSchema @props.apiUrl, null, (err, schema) =>
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
      H.style null, '''#main_pane_container { height: 100%; padding-bottom: 0px; width: 100% }'''
      React.createElement(DashboardComponent, {
        design: @state.design
        widgetFactory: @state.widgetFactory
        onDesignChange: @handleDesignChange
        })

class DashboardComponent extends React.Component
  @propTypes:
    design: React.PropTypes.object.isRequired
    widgetFactory: React.PropTypes.object.isRequired
    onDesignChange: React.PropTypes.func.isRequired

  constructor: (props) ->
    super
    @state = { 
      selectedWidgetId: null
    }

  handleSelectedWidgetIdChange: (selectedWidgetId) =>
    @setState(selectedWidgetId: selectedWidgetId)

  handlePrint: =>
    @refs.dashboardViewContainer.callChild("print")

  renderNavBar: ->
    H.nav className: "navbar navbar-default",
      H.div className: "container-fluid",
        H.div className: "navbar-header", 
          H.p className: "navbar-text", style: { marginLeft: 0 }, "Untitled Dashboard"
        H.ul className: "nav navbar-nav navbar-right",
          H.li null,
            H.a onClick: @handlePrint,
              H.span(className: "glyphicon glyphicon-print")

  render: ->
    H.div className: "row", style: { height: "100%" },
      H.div className: "col-xs-8", style: { padding: 0, height: "100%", overflowY: "scroll" },
        @renderNavBar()
        React.createElement(visualization.AutoSizeComponent, { injectWidth: true, ref: "dashboardViewContainer" }, 
          React.createElement(visualization.DashboardViewComponent, {
            design: @props.design
            onDesignChange: @props.onDesignChange
            selectedWidgetId: @state.selectedWidgetId
            onSelectedWidgetIdChange: @handleSelectedWidgetIdChange
            isDesigning: true
            onIsDesigningChange: null
            widgetFactory: @props.widgetFactory
          })
        )

      H.div className: "col-xs-4", style: { borderLeft: "solid 3px #AAA", height: "100%", paddingTop: 10, overflow: "auto" },
        React.createElement(visualization.DashboardDesignerComponent, {
          design: @props.design
          onDesignChange: @props.onDesignChange
          selectedWidgetId: @state.selectedWidgetId
          onSelectedWidgetIdChange: @handleSelectedWidgetIdChange
          isDesigning: true
          onIsDesigningChange: null
          widgetFactory: @props.widgetFactory
          })

        # Display JSON of design for test purposes
        H.div style: { opacity: 0.4 },
          H.label style: { marginTop: 30 }, "Ignore this:"
          H.textarea 
            className: "form-control"
            rows: 20
            value: JSON.stringify(@props.design)
            onChange: (ev) => @props.onDesignChange(JSON.parse(ev.target.value))


dashboardDesign = {"items":{"fc8d82bc-c485-4bc7-bc6d-b6c351f33813":{"layout":{"x":0,"y":0,"w":12,"h":12},"widget":{"type":"LayeredChart","version":"0.0.0","design":{"type":"pie","layers":[{"xExpr":null,"yExpr":{"type":"scalar","table":"entities.water_point","joins":[],"expr":{"type":"count","table":"entities.water_point"}},"colorExpr":{"type":"scalar","table":"entities.water_point","joins":[],"expr":{"type":"field","table":"entities.water_point","column":"type"}},"filter":null,"table":"entities.water_point","yAggr":"count"}],"titleText":"Water Points by Type"}}},"34e1f95a-30f5-4d63-b90f-bd3d310db850":{"layout":{"x":12,"y":0,"w":12,"h":12},"widget":{"type":"LayeredChart","version":"0.0.0","design":{"type":"bar","layers":[{"xExpr":{"type":"scalar","table":"entities.water_point","joins":["source_notes"],"expr":{"type":"field","table":"source_notes","column":"status"},"aggr":"last"},"yExpr":{"type":"scalar","table":"entities.water_point","joins":[],"expr":{"type":"count","table":"entities.water_point"}},"colorExpr":null,"filter":null,"table":"entities.water_point","yAggr":"count"}],"titleText":"Water Points by Status","transpose":false}}}}}

$ ->
  # Create simple schema
  sample = H.div className: "container-fluid", style: { height: "100%" },
    H.style null, '''html, body { height: 100% }'''
    React.createElement(DashboardPane, apiUrl: "https://api.mwater.co/v3/")
  React.render(sample, document.body)



