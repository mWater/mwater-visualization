PropTypes = require('prop-types')
React = require 'react'
R = React.createElement
AxisComponent = require '../../../axes/AxisComponent'
AxisBuilder = require '../../../axes/AxisBuilder'
FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent
ExprUtils = require('mwater-expressions').ExprUtils
ExprCompiler = require('mwater-expressions').ExprCompiler
ColorComponent = require '../../../ColorComponent'
LayeredChartUtils = require './LayeredChartUtils'
LayeredChartCompiler = require './LayeredChartCompiler'
uiComponents = require '../../../UIComponents'
TableSelectComponent = require '../../../TableSelectComponent'
ui = require('react-library/lib/bootstrap')

module.exports = class LayeredChartLayerDesignerComponent extends React.Component
  @propTypes: 
    design: PropTypes.object.isRequired
    schema: PropTypes.object.isRequired
    dataSource: PropTypes.object.isRequired
    index: PropTypes.number.isRequired
    onChange: PropTypes.func.isRequired
    onRemove: PropTypes.func.isRequired
    filters: PropTypes.array   # array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct

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
    R 'span', null,
      R 'span', className: ("glyphicon glyphicon-" + icon)
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

  handleXColorMapChange: (xColorMap) =>
    layer = @props.design.layers[@props.index]
    @updateLayer({ xColorMap: xColorMap })

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
    layer = @props.design.layers[@props.index]

    # R 'div', className: "form-group",
    #   R 'label', className: "text-muted", "Series Name"
    R 'input', type: "text", className: "form-control input-sm", value: layer.name, onChange: @handleNameChange, placeholder: "Series #{@props.index+1}"

  renderRemove: ->
    if @props.design.layers.length > 1
      R 'button', className: "btn btn-xs btn-link pull-right", type: "button", onClick: @props.onRemove,
        R 'span', className: "glyphicon glyphicon-remove"

  renderTable: ->
    layer = @props.design.layers[@props.index]

    R uiComponents.SectionComponent, icon: "fa-database", label: "Data Source",
      R TableSelectComponent, { 
        schema: @props.schema
        value: layer.table
        onChange: @handleTableChange 
        filter: layer.filter
        onFilterChange: @handleFilterChange
      }

  renderXAxis: ->
    layer = @props.design.layers[@props.index]
    if not layer.table
      return

    if not @isXAxisRequired(layer)
      return

    title = @getXAxisLabel(layer)

    filters = _.clone(@props.filters) or []
    if layer.filter?
      exprCompiler = new ExprCompiler(@props.schema)  
      jsonql = exprCompiler.compileExpr(expr: layer.filter, tableAlias: "{alias}")

      if jsonql
        filters.push({ table: layer.filter.table, jsonql: jsonql })

    categoricalX = new LayeredChartCompiler(schema: @props.schema).isCategoricalX(@props.design)

    R uiComponents.SectionComponent, label: title,
      R(AxisComponent, 
        schema: @props.schema
        dataSource: @props.dataSource
        table: layer.table
        types: @getAxisTypes(layer, "x")
        aggrNeed: "none"
        required: true
        value: layer.axes.x, 
        onChange: @handleXAxisChange
        filters: filters
        # Only show x color map if no color axis and is categorical and enabled
        showColorMap: layer.xColorMap and categoricalX and not layer.axes.color
        autosetColors: false
        # Categorical X can exclude values
        allowExcludedValues: categoricalX
      )

      # Allow toggling of colors
      if categoricalX and not layer.axes.color
        R ui.Checkbox, value: layer.xColorMap, onChange: @handleXColorMapChange, 
          "Set Individual Colors"

  renderColorAxis: ->
    layer = @props.design.layers[@props.index]
    if not layer.table
      return

    title = @getColorAxisLabel(layer)

    R 'div', className: "form-group",
      R 'label', className: "text-muted", title
      R 'div', style: { marginLeft: 10 }, 
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

    R 'div', className: "form-group",
      R 'label', className: "text-muted", title
      R 'div', style: { marginLeft: 10 }, 
        R(AxisComponent, 
          schema: @props.schema, 
          dataSource: @props.dataSource
          table: layer.table
          types: @getAxisTypes(layer, "y")
          aggrNeed: if @doesLayerNeedGrouping(layer) then "required" else "none"
          value: layer.axes.y
          required: true
          filters: @props.filters
          showFormat: true
          onChange: @handleYAxisChange)
        @renderCumulative()
        @renderStacked()

  renderCumulative: ->
    layer = @props.design.layers[@props.index]

    # Can only cumulative if non-polar and y axis determined and x axis is date or number
    axisBuilder = new AxisBuilder(schema: @props.schema)
    if not layer.axes.y or not layer.axes.x or axisBuilder.getAxisType(layer.axes.x) not in ['date', 'number']
      return 

    R 'div', key: "cumulative",
      R 'label', className: "checkbox-inline", 
        R 'input', type: "checkbox", checked: layer.cumulative, onChange: @handleCumulativeChange
        "Cumulative"

  renderStacked: ->
    layer = @props.design.layers[@props.index]

    # Only if has color axis and there are more than one layer
    if layer.axes.color and @props.design.layers.length > 1
      stacked = if layer.stacked? then layer.stacked else true

      return R 'div', key: "stacked",
        R 'label', className: "checkbox-inline", 
          R 'input', type: "checkbox", checked: stacked, onChange: @handleStackedChange
          "Stacked"

    return null

  renderColor: ->
    layer = @props.design.layers[@props.index]

    # If not table do nothing
    if not layer.table 
      return

    return R 'div', className: "form-group",
      R 'label', className: "text-muted", 
        if layer.axes.color then "Default Color" else "Color"
      R 'div', style: { marginLeft: 8 }, 
        R(ColorComponent, color: layer.color, onChange: @handleColorChange)

  renderFilter: ->
    layer = @props.design.layers[@props.index]

    # If no table, hide
    if not layer.table
      return null

    return R 'div', className: "form-group",
      R 'label', className: "text-muted", 
        R('span', className: "glyphicon glyphicon-filter")
        " "
        "Filters"
      R 'div', style: { marginLeft: 8 }, 
        R(FilterExprComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          onChange: @handleFilterChange
          table: layer.table
          value: layer.filter)

  render: ->
    layer = @props.design.layers[@props.index]
    R 'div', null, 
      if @props.index > 0
        R('hr')
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

