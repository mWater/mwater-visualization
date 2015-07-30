React = require 'react'
H = React.DOM

ExpressionBuilder = require './ExpressionBuilder'
LayeredChartCompiler = require './LayeredChartCompiler'

titleFontSize = 14
titlePadding = { top: 0, right: 0, bottom: 15, left: 0 }

# Displays a layered chart
module.exports = class LayeredChartViewComponent extends React.Component
  @propTypes: 
    schema: React.PropTypes.object.isRequired
    design: React.PropTypes.object.isRequired
    data: React.PropTypes.object.isRequired

    width: React.PropTypes.number.isRequired
    height: React.PropTypes.number.isRequired

    scope: React.PropTypes.any # scope of the widget (when the widget self-selects a particular scope)
    onScopeChange: React.PropTypes.func # called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details

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
      size: { width: props.width, height: props.height }
      pie: {  expand: false } # Don't expand/contract
      title: { text: props.design.titleText, padding: titlePadding }
      subchart: { axis: { x: { show: false } } }
      transition: { duration: 0 } # Transitions interfere with scoping
    }

    return chartDesign

  createChart: (props) ->
    if @chart
      @chart.destroy()

    el = React.findDOMNode(@refs.chart)
    chartOptions = @createChartOptions(props)
    
    chartOptions.bindto = el
    # Update scope after rendering. Needs a delay to make it happen
    chartOptions.onrendered = => _.defer(@updateScope)

    @chart = c3.generate(chartOptions)

  componentDidUpdate: (prevProps) ->
    # Check if options changed
    oldChartOptions = @createChartOptions(prevProps)
    newChartOptions = @createChartOptions(@props)

    # If chart changed
    if not _.isEqual(oldChartOptions, newChartOptions)

      # Check if size alone changed
      if _.isEqual(_.omit(oldChartOptions, "size"), _.omit(newChartOptions, "size"))
        @chart.resize(width: @props.width, height: @props.height)
        @updateScope()
        return

      # TODO check if only data changed
      @createChart(@props)
    else
      # Check scope
      if not _.isEqual(@props.scope, prevProps.scope)
        @updateScope()

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
    dataMap = @getDataMap()
    compiler = new LayeredChartCompiler(schema: @props.schema)

    # Handle line and bar charts
    d3.select(React.findDOMNode(@refs.chart))
      .selectAll(".c3-chart-bar .c3-bar, .c3-chart-line .c3-circle")
      # Highlight only scoped
      .style("opacity", (d,i) =>
        dataPoint = @lookupDataPoint(dataMap, d)
        scope = compiler.createScope(@props.design, dataPoint.layerIndex, dataPoint.row)

        # Determine if scoped
        if @props.scope 
          if _.isEqual(@props.scope.data, scope.data)
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
        dataPoint = @lookupDataPoint(dataMap, d)
        scope = compiler.createScope(@props.design, dataPoint.layerIndex, dataPoint.row)

        # Determine if scoped
        if @props.scope 
          if _.isEqual(@props.scope.data, scope.data)
            return 1
          else
            return 0.3
        else
          # Not scoped
          return 1
        )

  # Gets a data point { layerIndex, row } from a d3 object (d)
  lookupDataPoint: (dataMap, d) ->
    if d.data 
      d = d.data
      
    # Lookup layer and row. If pie/donut, index is always zero
    isPolarChart = @props.design.type in ['pie', 'donut']
    if isPolarChart
      dataPoint = dataMap["#{d.id}-0"]
    else
      dataPoint = dataMap["#{d.id}-#{d.index}"]

    return dataPoint

  getDataMap: ->
    # Get data map
    compiler = new LayeredChartCompiler(schema: @props.schema)
    dataMap = {}
    compiler.getColumns(@props.design, @props.data, dataMap)

    return dataMap

  handleDataClick: (d) =>
    # Get data map
    dataMap = @getDataMap()

    # Look up data point
    dataPoint = @lookupDataPoint(dataMap, d)
    if not dataPoint
      return

    # Create scope
    compiler = new LayeredChartCompiler(schema: @props.schema)
    scope = compiler.createScope(@props.design, dataPoint.layerIndex, dataPoint.row)

    # If same scope data, remove scope
    if @props.scope and _.isEqual(scope.data, @props.scope.data)
      @props.onScopeChange(null)
      return

    @props.onScopeChange(scope)

  componentWillUnmount: ->
    @chart.destroy()

  render: ->
    H.div null,
      H.div ref: "chart"
