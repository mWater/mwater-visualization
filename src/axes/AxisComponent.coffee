React = require 'react'
H = React.DOM
R = React.createElement
uuid = require 'uuid'
AsyncLoadComponent = require 'react-library/lib/AsyncLoadComponent'

ExprComponent = require("mwater-expressions-ui").ExprComponent
ExprUtils = require('mwater-expressions').ExprUtils
ExprCompiler = require('mwater-expressions').ExprCompiler
LinkComponent = require('mwater-expressions-ui').LinkComponent
AxisBuilder = require './AxisBuilder'
update = require 'update-object'
ui = require '../UIComponents'
BinsComponent = require './BinsComponent'
RangesComponent = require './RangesComponent'
AxisColorEditorComponent = require './AxisColorEditorComponent'
CategoryMapComponent = require './CategoryMapComponent'

# Axis component that allows designing of an axis
module.exports = class AxisComponent extends AsyncLoadComponent
  @propTypes:
    schema: React.PropTypes.object.isRequired # schema to use
    dataSource: React.PropTypes.object.isRequired

    table: React.PropTypes.string.isRequired # Table to use
    types: React.PropTypes.array # Optional types to limit to

    aggrNeed: React.PropTypes.oneOf(['none', 'optional', 'required']).isRequired

    value: React.PropTypes.object # See Axis Design.md
    onChange: React.PropTypes.func.isRequired # Called when changes

    required: React.PropTypes.bool  # Makes this a required value
    showColorMap: React.PropTypes.bool # Shows the color map
    reorderable: React.PropTypes.bool # Is the draw order reorderable
    allowExcludedValues: React.PropTypes.bool # True to allow excluding of values via checkboxes
    defaultColor: React.PropTypes.string
    showFormat: React.PropTypes.bool  # Show format control for numeric values

  @defaultProps:
    reorderable: false
    allowExcludedValues: false

  @contextTypes:
    locale: React.PropTypes.string  # e.g. "en"

  constructor: (props) ->
    super(props)

    @state = {
      categories: null # Categories of the axis. Loaded whenever axis is changed
    }

  isLoadNeeded: (newProps, oldProps) ->
    return not _.isEqual(_.omit(newProps.value, ["colorMap", "drawOrder"]), _.omit(oldProps.value, ["colorMap", "drawOrder"]))

  # Asynchronously get the categories of the axis, which requires a query when the field is a text field or other non-enum type
  load: (props, prevProps, callback) ->
    axisBuilder = new AxisBuilder(schema: props.schema)

    # Clean axis first
    axis = axisBuilder.cleanAxis(axis: props.value, table: props.table, types: props.types, aggrNeed: props.aggrNeed)

    # Ignore if error
    if not axis or axisBuilder.validateAxis(axis: axis)
      return

    # Get categories (value + label)
    categories = axisBuilder.getCategories(axis)

    # Just "None" and so doesn't count
    if _.any(categories, (category) -> category.value?)
      callback({ categories: categories })
      return

    # Can't get values of aggregate axis
    if axisBuilder.isAxisAggr(axis)
      callback({ categories: [] })
      return

    # If no categories, we need values as input
    valuesQuery = {
      type: "query"
      selects: [
        { type: "select", expr: axisBuilder.compileAxis(axis: axis, tableAlias: "main"), alias: "val" }
      ]
      from: { type: "table", table: axis.expr.table, alias: "main" }
      groupBy: [1]
      limit: 50
    }

    props.dataSource.performQuery(valuesQuery, (error, rows) =>
      if error
        return # Ignore errors

      # Get categories (value + label)
      categories = axisBuilder.getCategories(axis, _.pluck(rows, "val"))
      callback({ categories: categories })
    )

  handleExprChange: (expr) =>
    # If no expression, reset
    if not expr
      @props.onChange(null)
      return

    # Set expression and clear xform
    @props.onChange(@cleanAxis(_.extend({}, _.omit(@props.value, ["drawOrder"]), { expr: expr })))

  handleFormatChange: (ev) =>
    @props.onChange(_.extend({}, @props.value, { format: ev.target.value }))

  handleXformTypeChange: (type) =>
    # Remove
    if not type
      @props.onChange(_.omit(@props.value, ["xform", "colorMap", "drawOrder"]))

    # Save bins if going from bins to custom ranges and has ranges
    if type == "ranges" and @props.value.xform?.type == "bin" and @props.value.xform.min? and @props.value.xform.max? and @props.value.xform.min != @props.value.xform.max and @props.value.xform.numBins
      min = @props.value.xform.min
      max = @props.value.xform.max
      numBins = @props.value.xform.numBins

      ranges = [{ id: uuid(), maxValue: min, minOpen: false, maxOpen: true }]
      for i in [1..numBins]
        start = (i-1) / numBins * (max - min) + min
        end = (i) / numBins * (max - min) + min
        ranges.push({ id: uuid(), minValue: start, minOpen: false, maxValue: end, maxOpen: true })
      ranges.push({ id: uuid(), minValue: max, minOpen: true, maxOpen: true })

      xform = {
        type: "ranges"
        ranges: ranges
      }
    else
      xform = {
        type: type
      }

    @props.onChange(update(_.omit(@props.value, ["colorMap", "drawOrder"]), { xform: { $set: xform }}))

  handleXformChange: (xform) =>
    @props.onChange(@cleanAxis(update(_.omit(@props.value, ["drawOrder"]), { xform: { $set: xform } })))

  cleanAxis: (axis) ->
    axisBuilder = new AxisBuilder(schema: @props.schema)
    return axisBuilder.cleanAxis(axis: axis, table: @props.table, aggrNeed: @props.aggrNeed, types: @props.types)

  renderXform: (axis) ->
    if not axis
      return

    if axis.xform and axis.xform.type in ["bin", "ranges"]
      if axis.xform.type == "ranges"
        comp = R(RangesComponent,
          schema: @props.schema
          dataSource: @props.dataSource
          expr: axis.expr
          xform: axis.xform
          onChange: @handleXformChange)
      else
        comp = R(BinsComponent,
          schema: @props.schema
          dataSource: @props.dataSource
          expr: axis.expr
          xform: axis.xform
          onChange: @handleXformChange)

      return H.div null,
        R ui.ButtonToggleComponent,
          value: if axis.xform then axis.xform.type else null
          options: [
            { value: "bin", label: "Equal Bins" }
            { value: "ranges", label: "Custom Ranges" }
          ]
          onChange: @handleXformTypeChange
        comp

    exprUtils = new ExprUtils(@props.schema)
    exprType = exprUtils.getExprType(axis.expr)

    switch exprType
      when "date"
        R ui.ButtonToggleComponent,
          value: if axis.xform then axis.xform.type else null
          options: [
            { value: null, label: "Exact Date" }
            { value: "year", label: "Year" }
            { value: "yearmonth", label: "Year/Month" }
            { value: "month", label: "Month" }
          ]
          onChange: @handleXformTypeChange
      when "datetime"
        R ui.ButtonToggleComponent,
          value: if axis.xform then axis.xform.type else null
          options: [
            { value: "date", label: "Date" }
            { value: "year", label: "Year" }
            { value: "yearmonth", label: "Year/Month" }
            { value: "month", label: "Month" }
          ]
          onChange: @handleXformTypeChange

  renderColorMap: (axis) ->
    if not @props.showColorMap or not axis or not axis.expr
      return null

    return [
      H.br()
      R AxisColorEditorComponent,
        schema: @props.schema
        dataSource: @props.dataSource
        axis: axis
        categories: @state.categories
        onChange: @props.onChange
        reorderable: @props.reorderable
        defaultColor: @props.defaultColor
        allowExcludedValues: @props.allowExcludedValues
      ]

  renderExcludedValues: (axis) ->
    # Only if no color map and allows excluded values
    if @props.showColorMap or not axis or not axis.expr or not @props.allowExcludedValues
      return null

    # Use categories
    if not @state.categories or @state.categories.length <= 1
      return null

    return [
      H.br()
      R CategoryMapComponent,
        schema: @props.schema
        dataSource: @props.dataSource
        axis: axis
        onChange: @props.onChange
        categories: @state.categories
        reorderable: false
        showColorMap: false
        allowExcludedValues: true
        initiallyExpanded: true
      ]

  renderFormat: (axis) ->
    formats = [
      { value: ",", label: "Normal: 1,234.567" }
      { value: "", label: "Plain: 1234.567" }
      { value: ",.0f", label: "Rounded: 1,234"  }
      { value: ",.2f", label: "Two decimals: 1,234.56" }
      { value: "$,.2f", label: "Currency: $1,234.56" }
      { value: "$,.0f", label: "Currency rounded: $1,234" }
      { value: ".0%", label: "Percent rounded: 12%" }
    ]

    H.div className: "form-group",
      H.label className: "text-muted", 
        "Format"
      ": "
      H.select value: (if axis.format? then axis.format else ","), className: "form-control", style: { width: "auto", display: "inline-block" }, onChange: @handleFormatChange,
        _.map(formats, (format) -> H.option(key: format.value, value: format.value, format.label))

  render: ->
    axisBuilder = new AxisBuilder(schema: @props.schema)

    # Clean before render
    axis = @cleanAxis(@props.value)

    # Determine aggrStatuses that are possible
    switch @props.aggrNeed
      when "none"
        aggrStatuses = ["literal", "individual"]
      when "optional"
        aggrStatuses = ["literal", "individual", "aggregate"]
      when "required"
        aggrStatuses = ["literal", "aggregate"]

    H.div null,
      H.div null,
        R ExprComponent,
          schema: @props.schema
          dataSource: @props.dataSource
          table: @props.table
          types: axisBuilder.getExprTypes(@props.types)
          # preventRemove: @props.required
          onChange: @handleExprChange
          value: if @props.value then @props.value.expr
          aggrStatuses: aggrStatuses
      @renderXform(axis)
      # Only show format is number type
      if @props.showFormat and axisBuilder.getAxisType(axis) == "number"
        @renderFormat(axis)
      @renderColorMap(axis)
      @renderExcludedValues(axis)
