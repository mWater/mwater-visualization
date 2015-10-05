React = require 'react'
H = React.DOM
R = React.createElement
LayeredChartLayerDesignerComponent = require './LayeredChartLayerDesignerComponent'
LayeredChartCompiler = require './LayeredChartCompiler'
TabbedComponent = require "../../TabbedComponent"
ui = require '../../UIComponents'

module.exports = class LayeredChartDesignerComponent extends React.Component
  @propTypes: 
    design: React.PropTypes.object.isRequired
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired
    onDesignChange: React.PropTypes.func.isRequired

  # Determine if axes labels needed
  areAxesLabelsNeeded: (layer) ->
    return @props.design.type not in ['pie', 'donut']

  # Updates design with the specified changes
  updateDesign: (changes) ->
    design = _.extend({}, @props.design, changes)
    @props.onDesignChange(design)

  handleTypeChange: (type) =>
    @updateDesign(type: type)

  handleTransposeChange: (ev) =>
    @updateDesign(transpose: ev.target.checked)

  handleStackedChange: (ev) => @updateDesign(stacked: ev.target.checked)
  handleProportionalChange: (ev) => @updateDesign(proportional: ev.target.checked)

  handleLayerChange: (index, layer) =>
    layers = @props.design.layers.slice()
    layers[index] = layer
    @updateDesign(layers: layers)

  handleRemoveLayer: (index) =>
    layers = @props.design.layers.slice()
    layers.splice(index, 1)
    @updateDesign(layers: layers)

  handleAddLayer: =>
    layers = @props.design.layers.slice()
    layers.push({})
    @updateDesign(layers: layers)

  handleTitleTextChange: (ev) =>  @updateDesign(titleText: ev.target.value)
  handleXAxisLabelTextChange: (ev) =>  @updateDesign(xAxisLabelText: ev.target.value)
  handleYAxisLabelTextChange: (ev) =>  @updateDesign(yAxisLabelText: ev.target.value)

  renderLabels: ->
    if not @props.design.type
      return 

    compiler = new LayeredChartCompiler(schema: @props.schema)

    H.div null,
      H.div className: "form-group",
        H.label className: "text-muted", "Title"
        H.input type: "text", className: "form-control input-sm", value: @props.design.titleText, onChange: @handleTitleTextChange, placeholder: compiler.compileDefaultTitleText(@props.design)
      if @areAxesLabelsNeeded()
        H.div className: "form-group",
          H.label className: "text-muted", if @props.design.transpose then "Vertical Axis Label" else "Horizontal Axis Label"
          H.input type: "text", className: "form-control input-sm", value: @props.design.xAxisLabelText, onChange: @handleXAxisLabelTextChange, placeholder: compiler.compileDefaultXAxisLabelText(@props.design)
      if @areAxesLabelsNeeded()
        H.div null,
          H.div className: "form-group",
            H.label className: "text-muted", if not @props.design.transpose then "Vertical Axis Label" else "Horizontal Axis Label"
            H.input type: "text", className: "form-control input-sm", value: @props.design.yAxisLabelText, onChange: @handleYAxisLabelTextChange, placeholder: compiler.compileDefaultYAxisLabelText(@props.design)

  renderType: ->
    chartTypes =  [
      { id: "bar", name: "Bar", desc: "Best for most charts" }
      { id: "pie", name: "Pie", desc: "Compare ratios of one variable" }
      { id: "donut", name: "Donut", desc: "Pie chart with center removed" }
      { id: "line", name: "Line", desc: "Show how data changes smoothly over time" }
      { id: "spline", name: "Smoothed Line", desc: "For noisy data over time" }
      { id: "scatter", name: "Scatter", desc: "Show correlation between two number variables" }
      { id: "area", name: "Area", desc: "For cumulative data over time" }
    ]

    current = _.findWhere(chartTypes, { id: @props.design.type })

    R ui.SectionComponent, icon: "th", label: "Chart Type",
      R ui.ToggleEditComponent,
        forceOpen: not @props.design.type
        label: if current then current.name else ""
        editor: (onClose) =>
          R ui.BigOptionsComponent, 
            hint: "Select a Chart Type"
            items: _.map(chartTypes, (ct) => { 
              name: ct.name
              desc: ct.desc
              onClick: () =>
                onClose() # Close editor first
                @handleTypeChange(ct.id)
            })
      @renderOptions()

  renderLayer: (index) =>
    style = {
      paddingTop: 10
      paddingBottom: 10
    }
    H.div style: style, key: index,
      R(LayeredChartLayerDesignerComponent, {
        design: @props.design
        schema: @props.schema
        dataSource: @props.dataSource
        index: index
        onChange: @handleLayerChange.bind(null, index)
        onRemove: @handleRemoveLayer.bind(null, index)
        })

  renderLayers: ->
    if not @props.design.type
      return 

    H.div null, 
      _.map(@props.design.layers, (layer, i) => @renderLayer(i))
      H.button className: "btn btn-link", type: "button", onClick: @handleAddLayer,
        H.span className: "glyphicon glyphicon-plus"
        " Add Another Series"

  renderOptions: ->
    design = @props.design
    if not design.type
      return 

    # Can only stack if multiple series or one with color and not polar
    canStack = design.type not in ['pie', 'donut'] and design.layers.length > 0
    if design.layers.length == 1 and not design.layers[0].axes.color
      canStack = false

    # Don't include if transpose
    canTranspose = design.type not in ['pie', 'donut']

    H.div className: "text-muted",
      if canTranspose
        H.label className: "checkbox-inline", 
          H.input type:"checkbox", checked: design.transpose, onChange: @handleTransposeChange, key: "transpose",
            "Horizontal"
      if canStack
        H.label className: "checkbox-inline", key: "stacked",
          H.input type: "checkbox", checked: design.stacked, onChange: @handleStackedChange
          "Stacked"
        H.label className: "checkbox-inline", key: "proportional",
          H.input type: "checkbox", checked: design.proportional, onChange: @handleProportionalChange,
          "Proportional"

  render: ->
    tabs = []

    tabs.push {
      id: "design"
      label: "Design"
      elem: H.div null, 
        H.br()
        @renderType()
        @renderLayers()
    }

    if @props.design.type
      tabs.push {
        id: "labels"
        label: "Labels"
        elem: H.div null,
          H.br()
          @renderLabels()
      }

    R TabbedComponent,
      initialTabId: "design"
      tabs: tabs      

