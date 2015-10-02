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
Popover = require 'react-popover'
TabbedComponent = require "../../TabbedComponent"

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

  handleTransposeChange: (val) =>
    @updateDesign(transpose: val)

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

    H.label className: "text-muted", 
      H.span(className: "glyphicon glyphicon-th")
      " Chart Type: "
      R PopoverEditComponent,
        forceOpen: not @props.design.type
        label: (if current then current.name else H.i(null, "Select...")),
        editor: (onClose) =>
          R(BigOptions, items: _.map(chartTypes, (ct) => { 
            name: ct.name
            desc: ct.desc
            onClick: () =>
              # Close popover first
              onClose()

              @handleTypeChange(ct.id)
          }))

  renderTranspose: ->
    if not @props.design.type
      return 

    # Don't include if polar
    if @props.design.type in ['pie', 'donut']
      return

    # return H.div className: "form-group",
    #   H.label className: "text-muted", 
    #     H.span(className: "glyphicon glyphicon-retweet")
    #     " "
    #     "Orientation"
    #   ": "
    H.div className: "text-muted",
      H.label className: "radio-inline",
        H.input type: "radio", checked: !@props.design.transpose, onChange: @handleTransposeChange.bind(null, false),
          "Vertical"
      H.label className: "radio-inline",
        H.input type: "radio", checked: @props.design.transpose, onChange: @handleTransposeChange.bind(null, true),
          "Horizontal"

  renderLayer: (index) =>
    style = {
      borderTop: "solid 1px #EEE"
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
      H.button className: "btn btn-default", type: "button", onClick: @handleAddLayer,
        H.span className: "glyphicon glyphicon-plus"
        " Add Series"

  renderStackedProportional: ->
    design = @props.design

    # Can only stack if multiple series or one with color and not polar
    if design.type in ['pie', 'donut'] or design.layers.length == 0
      return

    if design.layers.length == 1 and not design.layers[0].axes.color
      return

    H.div null,
      H.div className: "checkbox-inline", key: "stacked",
        H.label null,
          H.input type: "checkbox", checked: design.stacked, onChange: @handleStackedChange
          "Stacked"
      H.div className: "checkbox-inline", key: "proportional",
        H.label null,
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
        id: "appearance"
        label: "Appearance"
        elem: H.div null,
          H.br()
          @renderTranspose()
          @renderStackedProportional()
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

    # return H.div className: "form-group",
    #   H.label className: "text-muted", 
    #     H.span(className: "glyphicon glyphicon-file")
    #     " "
    #     "Data Source"
    #   ": "


    H.label className: "text-muted", 
      H.span(className: "glyphicon glyphicon-file")
      " Data Source: "
      R PopoverEditComponent,
        forceOpen: not layer.table
        label: if layer.table then @props.schema.getTable(layer.table).name else H.i(null, "Select...")
        editor: (onClose) =>
          R(BigOptions, items: _.map(@props.schema.getTables(), (table) => { 
            name: table.name
            desc: table.desc
            onClick: () =>
              # Close popover first
              onClose()

              @handleTableChange(table.id)
          }))

    # TODO PUT BACK
      # @props.schema.createTableSelectElement(layer.table, @handleTableChange)

  renderXAxis: ->
    layer = @props.design.layers[@props.index]
    if not layer.table
      return

    if not @isXAxisRequired(layer)
      return

    title = @getXAxisLabel(layer)

    H.div className: "form-group",
      H.label className: "text-muted", title
      H.div style: { marginLeft: 10 }, 
        R(AxisComponent, 
          editorTitle: title
          schema: @props.schema
          dataSource: @props.dataSource
          table: layer.table
          types: @getAxisTypes(layer, "x")
          aggrNeed: "none"
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
      @renderRemove()
      @renderTable()
      # Color axis first for pie
      if @isLayerPolar(layer) then @renderColorAxis()
      @renderXAxis()
      if layer.axes.x or layer.axes.color then @renderYAxis()
      if layer.axes.x and layer.axes.y and not @isLayerPolar(layer) then @renderColorAxis()
      @renderColor()
      @renderFilter()
      @renderName()

class BigOptions extends React.Component
  @propTypes:
    items: React.PropTypes.array.isRequired # name, desc, onClick

  render: ->
    H.div className: "mwater-visualization-big-options", 
      _.map @props.items, (item) =>
        R BigOption, name: item.name, desc: item.desc, onClick: item.onClick, key: item.name

class BigOption extends React.Component
  @propTypes:
    name: React.PropTypes.string
    desc: React.PropTypes.string
    onClick: React.PropTypes.func.isRequired

  render: ->
    H.div className: "mwater-visualization-big-option", onClick: @props.onClick,
      H.div style: { fontWeight: "bold" }, @props.name
      H.div style: { color: "#888" }, @props.desc

# Shows as editable link that can be clicked to open a popover
# Editor can be node or can be function that takes onClose function as first parameter
class PopoverEditComponent extends React.Component
  @propTypes:
    forceOpen: React.PropTypes.bool
    label: React.PropTypes.node.isRequired
    editor: React.PropTypes.any.isRequired

  constructor: (props) ->
    @state = { open: false }

  handleOpen: => @setState(open: true)
  handleClose: => @setState(open: false)
  handleToggle: => @setState(open: not @state.open)

  render: ->
    editor = @props.editor

    # # Add close icon
    # if not @props.forceOpen
    #   editor = H.div null,
    #     H.div style: { position: "absolute", right: 4, top: 10, color: "#AAA" }, onClick: @handleClose,
    #       H.div className: "glyphicon glyphicon-remove"
    #     editor
    if _.isFunction(editor)
      editor = editor(@handleClose)

    R Popover, 
      isOpen: @state.open or @props.forceOpen
      preferPlace: "below"
      onOuterAction: => @setState(open: false)
      body: editor,
        R(EditableLinkComponent, onClick: @handleToggle, @props.label)




