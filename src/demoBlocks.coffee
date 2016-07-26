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
          onRemove: => alert("TODO remove")
          onDuplicate: => alert("TODO remove")
          scope: null
          filters: []
          onScopeChange: => alert("TODO")
          onDesignChange: => alert("TODO") 
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

design = {
  id: "root"
  type: "root"
  design: {
    blocks: [
      { id: "1234", type: "widget", widgetType: "LayeredChart", design: {xAxisLabelText: "", yAxisLabelText: ""} }
    ]
  }    
}