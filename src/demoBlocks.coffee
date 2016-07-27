React = require 'react'
ReactDOM = require 'react-dom'
H = React.DOM
R = React.createElement

MWaterLoaderComponent = require './MWaterLoaderComponent'
BlocksDesignerComponent = require './layouts/blocks/BlocksDesignerComponent'
DirectWidgetDataSource = require './widgets/DirectWidgetDataSource'
WidgetFactory = require './widgets/WidgetFactory'

class DemoComponent extends React.Component
  constructor: ->
    super

    @state = { 
      design: design 
      extraTables: []
    }

  render: ->
    R MWaterLoaderComponent, {
      apiUrl: @props.apiUrl
      client: @props.client
      user: @props.user
      onExtraTablesChange: (extraTables) => @setState(extraTables: extraTables)
      extraTables: @state.extraTables
    }, (error, config) =>
      if error
        alert("Error: " + error.message)
        return null

      renderWidget = (options) =>
        # Passed
        #  type: type of the widget
        #  design: design of the widget
        #  onDesignChange: TODO
        #  width: width to render. null for auto
        #  height: height to render. null for auto
        widget = WidgetFactory.createWidget(options.type)

        widgetDataSource = new DirectWidgetDataSource({
          apiUrl: @props.apiUrl
          widget: widget
          design: options.design
          schema: config.schema
          dataSource: config.dataSource
          client: @props.client
        })

        return React.cloneElement(widget.createViewElement({
          schema: config.schema
          dataSource: config.dataSource
          widgetDataSource: widgetDataSource
          design: options.design
          onDesignChange: options.onDesignChange
          scope: null
          filters: []
          onScopeChange: => alert("TODO")
        }), {
          width: options.width
          height: options.height
          standardWidth: options.width
        })

      return R BlocksDesignerComponent, 
        renderWidget: renderWidget
        design: @state.design
        onDesignChange: (design) => @setState(design: design)

$ ->
  sample = H.div className: "container-fluid", style: { height: "100%", paddingLeft: 0, paddingRight: 0 },
    H.style null, '''html, body, #main { height: 100% }'''
    React.createElement(DemoComponent, apiUrl: "https://api.mwater.co/v3/")

  ReactDOM.render(sample, document.getElementById("main"))

widgetDesign = {
  "version": 1,
  "layers": [
    {
      "axes": {
        "x": {
          "expr": {
            "type": "field",
            "table": "entities.water_point",
            "column": "type"
          },
          "xform": null
        },
        "y": {
          "expr": {
            "type": "id",
            "table": "entities.water_point"
          },
          "aggr": "count",
          "xform": null
        }
      },
      "filter": null,
      "table": "entities.water_point"
    }
  ],
  "type": "bar"
}

design = {
  id: "root"
  type: "root"
  blocks: [
    { id: "1234", type: "widget", aspectRatio: 1.4, widgetType: "LayeredChart", design: widgetDesign }
  ]
}

