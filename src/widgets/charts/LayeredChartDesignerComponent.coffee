React = require 'react'
H = React.DOM
R = React.createElement
AxisComponent = require './../../expressions/axes/AxisComponent'
AxisBuilder = require '../../expressions/axes/AxisBuilder'
LogicalExprComponent = require './../../expressions/LogicalExprComponent'
ExpressionBuilder = require './../../expressions/ExpressionBuilder'
EditableLinkComponent = require './../../EditableLinkComponent'
ColorComponent = require '../../ColorComponent'
LayeredChartUtils = require './LayeredChartUtils'
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

    H.div null,
      H.div className: "form-group",
        H.label className: "text-muted", "Title"
        H.input type: "text", className: "form-control input-sm", value: @props.design.titleText, onChange: @handleTitleTextChange, placeholder: "Untitled"
      if @areAxesLabelsNeeded()
        H.div className: "form-group",
          H.label className: "text-muted", if @props.design.transpose then "Vertical Axis Label" else "Horizontal Axis Label"
          H.input type: "text", className: "form-control input-sm", value: @props.design.xAxisLabelText, onChange: @handleXAxisLabelTextChange, placeholder: "None"
      if @areAxesLabelsNeeded()
        H.div null,
          H.div className: "form-group",
            H.label className: "text-muted", if not @props.design.transpose then "Vertical Axis Label" else "Horizontal Axis Label"
            H.input type: "text", className: "form-control input-sm", value: @props.design.yAxisLabelText, onChange: @handleYAxisLabelTextChange, placeholder: "None"

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
          R ui.BigOptions, 
            hint: "Select a Chart Type"
            items: _.map(chartTypes, (ct) => { 
              name: ct.name
              desc: ct.desc
              onClick: () =>
                onClose() # Close editor first
                @handleTypeChange(ct.id)
            })

  renderLayer: (index) =>
    style = {
      paddingTop: 10
      paddingBottom: 10
    }
    H.div style: style, key: index,
      R(LayerDesignerComponent, {
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

    H.div style: { marginLeft: 10 }, className: "text-muted",
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
        @renderOptions()
        @renderLayers()
    }

    if @props.design.type
      tabs.push {
        id: "appearance"
        label: "Appearance"
        elem: H.div null,
          H.br()
          @renderLabels()
      }

    R TabbedComponent,
      initialTabId: "design"
      tabs: tabs      

class LayerDesignerComponent extends React.Component
  @propTypes: 
    design: React.PropTypes.object.isRequired
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired
    index: React.PropTypes.number.isRequired
    onChange: React.PropTypes.func.isRequired
    onRemove: React.PropTypes.func.isRequired

  isLayerPolar: (layer) ->
    return (layer.type or @props.design.type) in ['pie', 'donut']

  # Determine if x-axis required
  isXAxisRequired: (layer) ->
    return not @isLayerPolar(layer)

  getAxisTypes: (layer, axisKey) ->
    return LayeredChartUtils.getAxisTypes(@props.design, layer, axisKey)

  getAxisLabel: (icon, label) ->
    H.span null,
      H.span className: ("glyphicon glyphicon-" + icon)
      " " + label

  # Determine icon/label for color axis
  getXAxisLabel: (layer) ->
    if @props.design.transpose
      @getAxisLabel("resize-vertical", "Vertical Axis")
    else
      @getAxisLabel("resize-horizontal", "Horizontal Axis")

  # Determine icon/label for color axis
  getYAxisLabel: (layer) ->
    if @isLayerPolar(layer)
      @getAxisLabel("repeat", "Angle Axis")
    else if @props.design.transpose
      @getAxisLabel("resize-horizontal", "Horizontal Axis")
    else
      @getAxisLabel("resize-vertical", "Vertical Axis")

  # Determine icon/label for color axis
  getColorAxisLabel: (layer) ->
    if @isLayerPolar(layer)
      @getAxisLabel("text-color", "Label Axis")
    else
      @getAxisLabel("equalizer", "Split Axis")

  # Updates layer with the specified changes
  updateLayer: (changes) ->
    layer = _.extend({}, @props.design.layers[@props.index], changes)
    @props.onChange(layer)

  # Update axes with specified changes
  updateAxes: (changes) ->
    axes = _.extend({}, @props.design.layers[@props.index].axes, changes)
    @updateLayer(axes: axes)

  handleNameChange: (ev) =>  @updateLayer(name: ev.target.value)

  handleTableChange: (table) => @updateLayer(table: table)

  handleXAxisChange: (axis) => @updateAxes(x: axis)
  handleColorAxisChange: (axis) => @updateAxes(color: axis)
  handleYAxisChange: (axis) => @updateAxes(y: axis)

  handleFilterChange: (filter) => @updateLayer(filter: filter)

  handleColorChange: (color) => @updateLayer(color: color)

  handleCumulativeChange: (ev) => @updateLayer(cumulative: ev.target.checked)

  renderName: ->
    # Only if multiple
    if @props.design.layers.length <= 1
      return

    layer = @props.design.layers[@props.index]

    # H.div className: "form-group",
    #   H.label className: "text-muted", "Series Name"
    H.input type: "text", className: "form-control input-sm", value: layer.name, onChange: @handleNameChange, placeholder: "Series #{@props.index+1}"

  renderRemove: ->
    if @props.design.layers.length > 1
      H.button className: "btn btn-xs btn-link pull-right", type: "button", onClick: @props.onRemove,
        H.span className: "glyphicon glyphicon-remove"

  renderTable: ->
    layer = @props.design.layers[@props.index]

    R ui.SectionComponent, icon: "file", label: "Data Source",
      @props.schema.createTableSelectElement(layer.table, @handleTableChange)

  renderXAxis: ->
    layer = @props.design.layers[@props.index]
    if not layer.table
      return

    if not @isXAxisRequired(layer)
      return

    title = @getXAxisLabel(layer)

    R ui.SectionComponent, label: title,
      R(AxisComponent, 
        editorTitle: title
        schema: @props.schema
        dataSource: @props.dataSource
        table: layer.table
        types: @getAxisTypes(layer, "x")
        aggrNeed: "none"
        required: true
        value: layer.axes.x, 
        onChange: @handleXAxisChange)

  renderColorAxis: ->
    layer = @props.design.layers[@props.index]
    if not layer.table
      return

    title = @getColorAxisLabel(layer)

    H.div className: "form-group",
      H.label className: "text-muted", title
      H.div style: { marginLeft: 10 }, 
        R(AxisComponent, 
          editorTitle: title
          schema: @props.schema, 
          dataSource: @props.dataSource
          table: layer.table
          types: @getAxisTypes(layer, "color")
          aggrNeed: "none"
          required: @isLayerPolar(layer)
          value: layer.axes.color, 
          onChange: @handleColorAxisChange)

  renderYAxis: ->
    layer = @props.design.layers[@props.index]
    if not layer.table
      return

    title = @getYAxisLabel(layer)

    H.div className: "form-group",
      H.label className: "text-muted", title
      H.div style: { marginLeft: 10 }, 
        R(AxisComponent, 
          editorTitle: title
          schema: @props.schema, 
          dataSource: @props.dataSource
          table: layer.table
          types: @getAxisTypes(layer, "y")
          aggrNeed: "required"
          value: layer.axes.y
          onChange: @handleYAxisChange)
        @renderCumulative()

  renderCumulative: ->
    layer = @props.design.layers[@props.index]

    # Can only cumulative if non-polar and y axis determined and x axis is date, decimal or integer
    axisBuilder = new AxisBuilder(schema: @props.schema)
    if not layer.axes.y or not layer.axes.x or axisBuilder.getAxisType(layer.axes.x) not in ['date', 'decimal', 'integer']
      return 

    H.div key: "cumulative",
      H.label className: "checkbox-inline", 
        H.input type: "checkbox", checked: layer.cumulative, onChange: @handleCumulativeChange
        "Cumulative"

  renderColor: ->
    layer = @props.design.layers[@props.index]

    # If not table or has color axis, do nothing
    if not layer.table or layer.axes.color
      return

    return H.div className: "form-group",
      H.label className: "text-muted", 
        "Color"
      H.div style: { marginLeft: 8 }, 
        R(ColorComponent, color: layer.color, onChange: @handleColorChange)

  renderFilter: ->
    layer = @props.design.layers[@props.index]

    # If no table, hide
    if not layer.table
      return null

    return H.div className: "form-group",
      H.label className: "text-muted", 
        H.span(className: "glyphicon glyphicon-filter")
        " "
        "Filters"
      H.div style: { marginLeft: 8 }, 
        R(LogicalExprComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          onChange: @handleFilterChange
          table: layer.table
          value: layer.filter)

  render: ->
    layer = @props.design.layers[@props.index]
    H.div null, 
      if @props.index > 0
        H.hr()
      @renderRemove()
      @renderTable()
      # Color axis first for pie
      if @isLayerPolar(layer) then @renderColorAxis()
      @renderXAxis()
      if layer.axes.x or layer.axes.color then @renderYAxis()
      if layer.axes.x and layer.axes.y and not @isLayerPolar(layer) then @renderColorAxis()
      if layer.axes.y then @renderColor()
      if layer.axes.y then @renderFilter()
      if layer.axes.y then @renderName()

