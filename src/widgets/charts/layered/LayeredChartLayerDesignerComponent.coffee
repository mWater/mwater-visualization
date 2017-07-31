React = require 'react'
H = React.DOM
R = React.createElement
AxisComponent = require '../../../axes/AxisComponent'
AxisBuilder = require '../../../axes/AxisBuilder'
FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent
ExprUtils = require('mwater-expressions').ExprUtils
ColorComponent = require '../../../ColorComponent'
LayeredChartUtils = require './LayeredChartUtils'
LayeredChartCompiler = require './LayeredChartCompiler'
ui = require '../../../UIComponents'
TableSelectComponent = require '../../../TableSelectComponent'

module.exports = class LayeredChartLayerDesignerComponent extends React.Component
  @propTypes: 
    design: React.PropTypes.object.isRequired
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired
    index: React.PropTypes.number.isRequired
    onChange: React.PropTypes.func.isRequired
    onRemove: React.PropTypes.func.isRequired
    filters: React.PropTypes.array   # array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct

  isLayerPolar: (layer) ->
    return (layer.type or @props.design.type) in ['pie', 'donut']

  doesLayerNeedGrouping: (layer) ->
    return (layer.type or @props.design.type) not in ['scatter']

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

  handleXAxisChange: (axis) => 
    layer = @props.design.layers[@props.index]
    axesChanges = { x: axis }
    
    # Default y to count if x or color present and not scatter
    if axis and @doesLayerNeedGrouping(layer) and not layer.axes?.y
      axesChanges.y = { expr: { type: "op", op: "count", table: layer.table, exprs: [] } }

    @updateAxes(axesChanges)

  handleColorAxisChange: (axis) => 
    layer = @props.design.layers[@props.index]
    axesChanges ={ color: axis }
    
    # Default y to count if x or color present and not scatter
    if axis and @doesLayerNeedGrouping(layer) and not layer.axes?.y
      axesChanges.y = { expr: { type: "op", op: "count", table: layer.table, exprs: [] } }

    @updateAxes(axesChanges)

  handleYAxisChange: (axis) => @updateAxes(y: axis)

  handleFilterChange: (filter) => @updateLayer(filter: filter)

  handleColorChange: (color) => @updateLayer(color: color)

  handleCumulativeChange: (ev) => @updateLayer(cumulative: ev.target.checked)

  handleStackedChange: (ev) => @updateLayer(stacked: ev.target.checked)

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

    R ui.SectionComponent, icon: "fa-database", label: "Data Source",
      React.createElement(TableSelectComponent, { schema: @props.schema, value: layer.table, onChange: @handleTableChange })

  renderXAxis: ->
    layer = @props.design.layers[@props.index]
    if not layer.table
      return

    if not @isXAxisRequired(layer)
      return

    title = @getXAxisLabel(layer)

    R ui.SectionComponent, label: title,
      R(AxisComponent, 
        schema: @props.schema
        dataSource: @props.dataSource
        table: layer.table
        types: @getAxisTypes(layer, "x")
        aggrNeed: "none"
        required: true
        value: layer.axes.x, 
        onChange: @handleXAxisChange
        filters: @props.filters
        # Categorical X can exclude values
        allowExcludedValues: new LayeredChartCompiler(schema: @props.schema).isCategoricalX(@props.design)
        )

  renderColorAxis: ->
    layer = @props.design.layers[@props.index]
    if not layer.table
      return

    title = @getColorAxisLabel(layer)

    H.div className: "form-group",
      H.label className: "text-muted", title
      H.div style: { marginLeft: 10 }, 
        R(AxisComponent, 
          schema: @props.schema, 
          dataSource: @props.dataSource
          table: layer.table
          types: @getAxisTypes(layer, "color")
          aggrNeed: "none"
          required: @isLayerPolar(layer)
          showColorMap: true
          value: layer.axes.color
          onChange: @handleColorAxisChange
          allowExcludedValues: true
          filters: @props.filters
          )

  renderYAxis: ->
    layer = @props.design.layers[@props.index]
    if not layer.table
      return

    title = @getYAxisLabel(layer)

    H.div className: "form-group",
      H.label className: "text-muted", title
      H.div style: { marginLeft: 10 }, 
        R(AxisComponent, 
          schema: @props.schema, 
          dataSource: @props.dataSource
          table: layer.table
          types: @getAxisTypes(layer, "y")
          aggrNeed: if @doesLayerNeedGrouping(layer) then "required" else "none"
          value: layer.axes.y
          required: true
          filters: @props.filters
          onChange: @handleYAxisChange)
        @renderCumulative()
        @renderStacked()

  renderCumulative: ->
    layer = @props.design.layers[@props.index]

    # Can only cumulative if non-polar and y axis determined and x axis is date or number
    axisBuilder = new AxisBuilder(schema: @props.schema)
    if not layer.axes.y or not layer.axes.x or axisBuilder.getAxisType(layer.axes.x) not in ['date', 'number']
      return 

    H.div key: "cumulative",
      H.label className: "checkbox-inline", 
        H.input type: "checkbox", checked: layer.cumulative, onChange: @handleCumulativeChange
        "Cumulative"

  renderStacked: ->
    layer = @props.design.layers[@props.index]

    # Only if has color axis and there are more than one layer
    if layer.axes.color and @props.design.layers.length > 1
      stacked = if layer.stacked? then layer.stacked else true

      return H.div key: "stacked",
        H.label className: "checkbox-inline", 
          H.input type: "checkbox", checked: stacked, onChange: @handleStackedChange
          "Stacked"

    return null

  renderColor: ->
    layer = @props.design.layers[@props.index]

    # If not table do nothing
    if not layer.table 
      return

    return H.div className: "form-group",
      H.label className: "text-muted", 
        if layer.axes.color then "Default Color" else "Color"
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
        R(FilterExprComponent, 
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
      # No default color for polar
      if not @isLayerPolar(layer)
        if layer.axes.y then @renderColor()
      if layer.axes.y then @renderFilter()
      if layer.axes.y then @renderName()

