React = require 'react'
H = React.DOM

ExpressionBuilder = require './ExpressionBuilder'
LayeredChartCompiler = require './LayeredChartCompiler'

titleFontSize = 14
titleHeight = 20

# Displays a layered chart
module.exports = class LayeredChartViewComponent extends React.Component
  @propTypes: 
    schema: React.PropTypes.object.isRequired
    design: React.PropTypes.object.isRequired
    data: React.PropTypes.object.isRequired

    width: React.PropTypes.number.isRequired
    height: React.PropTypes.number.isRequired

    scope: React.PropTypes.any # scope of the widget (when the widget self-selects a particular scope)
    onScopeChange: React.PropTypes.func # called with (scope, filter) as a scope to apply to self and filter to apply to other widgets

  componentDidMount: ->
    @createChart(@props)
    @updateScope()

  createChartOptions: (props) ->
    compiler = new LayeredChartCompiler(schema: props.schema)
    columns = compiler.getColumns(props.design, props.data)

    # Create chart
    chartDesign = {
      data: {
        types: compiler.getTypes(props.design, columns)
        columns: columns
        names: compiler.getNames(props.design, props.data)
        types: compiler.getTypes(props.design, columns)
        groups: compiler.getGroups(props.design, columns)
        xs: compiler.getXs(columns)
        onclick: @handleDataClick
      }
      # Hide if one layer with no colorExpr      
      legend: { hide: (props.design.layers.length == 1 and not props.design.layers[0].colorExpr) } 
      grid: { focus: { show: false } }  # Don't display hover grid
      axis: {
        x: {
          type: compiler.getXAxisType(props.design)
        }
        rotated: props.design.transpose
      }
      size: { width: props.width, height: props.height - titleHeight }
      pie: {  expand: false } # Don't expand/contract
    }

    console.log chartDesign
    return chartDesign

  createChart: (props) ->
    if @chart
      @chart.destroy()

    el = React.findDOMNode(@refs.chart)
    chartOptions = @createChartOptions(props)
    
    chartOptions.bindto = el

    @chart = c3.generate(chartOptions)

  componentWillReceiveProps: (nextProps) ->
    # Check if size changed
    if @props.height != nextProps.height or @props.width != nextProps.width
      @createChart(nextProps)
      return

    # Check if options changed
    # TODO exclude columns
    oldChartOptions = @createChartOptions(@props)
    newChartOptions = @createChartOptions(nextProps)
    if not _.isEqual(oldChartOptions, newChartOptions)
      @createChart(nextProps)
      return

    # if not _.isEqual(@props.data, nextProps.data)
    #   # # If length of data is different, re-create chart
    #   # if @props.data.main.length != nextProps.data.main.length
    #   @createChart(nextProps)
    #   return

      # # Reload data
      # @chart.load({ 
      #   json: @prepareData(nextProps.data).main
      #   keys: { x: "x", value: ["y"] }
      #   names: { y: 'Value' } # Name the data
      # })

  # Update scoped value
  updateScope: =>
    # Handle line and bar charts
    d3.select(React.findDOMNode(@refs.chart))
      .selectAll(".c3-chart-bar .c3-bar, .c3-chart-line .c3-circle")
      # Highlight only scoped
      .style("opacity", (d,i) =>
        # Determine if scoped
        if @props.scope 
          if @props.scope.index == d.index and @props.scope.id == d.id
            return 1
          else
            return 0.3
        else
          # Not scoped
          return 1
      )

    # Handle pie charts
    d3.select(React.findDOMNode(@refs.chart))
      .selectAll(".c3-chart-arcs .c3-chart-arc")
      .style("opacity", (d, i) =>
        # Determine if scoped
        if @props.scope 
          if @props.scope.id == d.data.id
            return 1
          else
            return 0.3
        else
          # Not scoped
          return 1
        )

  handleDataClick: (d) =>
    # Get data map
    compiler = new LayeredChartCompiler(schema: @props.schema)
    dataMap = {}
    compiler.getColumns(@props.design, @props.data, dataMap)

    # Lookup layer and row. If pie/donut, index is always zero
    isPolarChart = @props.design.type in ['pie', 'donut']
    if isPolarChart
      dp = dataMap["#{d.id}-0"]
    else
      dp = dataMap["#{d.id}-#{d.index}"]
      
    if not dp
      return

    # Set scope to { id, index }
    scope = { id: d.id, index: d.index }

    # If same scope, remove scope
    if _.isEqual(scope, @props.scope)
      @props.onScopeChange(null, null)
      return

    expressionBuilder = new ExpressionBuilder(@props.schema)

    # Get filter
    filter = compiler.createScopeFilter(@props.design, dp.layerIndex, dp.row)
    @props.onScopeChange(scope, filter)

  componentDidUpdate: ->
    @updateScope()

  componentWillUnmount: ->
    @chart.destroy()

  render: ->
    titleStyle = {
      position: "absolute"
      top: 0
      width: @props.width
      textAlign: "center"
      fontWeight: "bold"
    }

    H.div null,
      H.div style: titleStyle, @props.design.titleText
      H.div style: { marginTop: titleHeight }, ref: "chart"
