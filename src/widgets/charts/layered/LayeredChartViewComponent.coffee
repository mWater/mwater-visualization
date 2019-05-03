PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
ReactDOM = require 'react-dom'
R = React.createElement

ExprUtils = require('mwater-expressions').ExprUtils
LayeredChartCompiler = require './LayeredChartCompiler'
TextComponent = require '../../text/TextComponent'
d3 = require 'd3'

# Displays a layered chart
module.exports = class LayeredChartViewComponent extends React.Component
  @propTypes: 
    schema: PropTypes.object.isRequired
    dataSource: PropTypes.object.isRequired
    design: PropTypes.object.isRequired
    data: PropTypes.object.isRequired
    onDesignChange: PropTypes.func

    width: PropTypes.number.isRequired
    height: PropTypes.number.isRequired
    standardWidth: PropTypes.number.isRequired

    scope: PropTypes.any # scope of the widget (when the widget self-selects a particular scope)
    onScopeChange: PropTypes.func # called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details

  @contextTypes:
    locale: PropTypes.string  # e.g. "en"

  constructor: (props) ->
    super(props)

    @state = {
      headerHeight: null  # Height of header 
      footerHeight: null  # Height of footer
    }

  componentDidMount: -> 
    @updateHeights()

  componentDidUpdate: ->
    @updateHeights()

  updateHeights: ->
    # Calculate header and footer heights
    if @header and @state.headerHeight != @header.offsetHeight
      @setState(headerHeight: @header.offsetHeight)
    if @footer and @state.footerHeight != @footer.offsetHeight
      @setState(footerHeight: @footer.offsetHeight)

  handleHeaderChange: (header) =>
    @props.onDesignChange(_.extend({}, @props.design, header: header))

  handleFooterChange: (footer) =>
    @props.onDesignChange(_.extend({}, @props.design, footer: footer))

  renderHeader: ->
    return R 'div', ref: ((c) => @header = c),
      R TextComponent,
        design: @props.design.header
        onDesignChange: if @props.onDesignChange then @handleHeaderChange
        schema: @props.schema
        dataSource: @props.dataSource
        exprValues: @props.data.header or {}
        width: @props.width
        standardWidth: @props.standardWidth

  renderFooter: ->
    return R 'div', ref: ((c) => @footer = c),
      R TextComponent,
        design: @props.design.footer
        onDesignChange: if @props.onDesignChange then @handleFooterChange
        schema: @props.schema
        dataSource: @props.dataSource
        exprValues: @props.data.footer or {}
        width: @props.width
        standardWidth: @props.standardWidth

  render: ->
    R 'div', style: { width: @props.width, height: @props.height },
      @renderHeader()
      if @state.headerHeight? and @state.footerHeight?
        R C3ChartComponent, 
          schema: @props.schema
          design: @props.design
          data: @props.data
          onDesignChange: @props.onDesignChange
          width: @props.width
          height: @props.height - @state.headerHeight - @state.footerHeight
          standardWidth: @props.standardWidth
          scope: @props.scope
          onScopeChange: @props.onScopeChange
          locale: @context.locale
      @renderFooter()

# Displays the inner C3 component itself
class C3ChartComponent extends React.Component
  @propTypes: 
    schema: PropTypes.object.isRequired
    design: PropTypes.object.isRequired
    data: PropTypes.object.isRequired
    onDesignChange: PropTypes.func

    width: PropTypes.number.isRequired
    height: PropTypes.number.isRequired
    standardWidth: PropTypes.number.isRequired

    scope: PropTypes.any # scope of the widget (when the widget self-selects a particular scope)
    onScopeChange: PropTypes.func # called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details
    locale: PropTypes.string  # e.g. "en"

  constructor: (props) ->
    super(props)

    # Create throttled createChart
    @throttledCreateChart = _.throttle(@createChart, 1000)

  componentDidMount: ->
    @createChart(@props)
    @updateScope()

  createChart: (props) =>
    if @chart
      @chart.destroy()

    compiler = new LayeredChartCompiler(schema: props.schema)
    chartOptions = compiler.createChartOptions({
      design: @props.design
      data: @props.data
      width: @props.width
      height: @props.height
      locale: @props.locale
    })
    
    chartOptions.bindto = @chartDiv
    chartOptions.data.onclick = @handleDataClick
    # Update scope after rendering. Needs a delay to make it happen
    chartOptions.onrendered = => _.defer(@updateScope)

    c3 = require 'c3'
    @chart = c3.generate(chartOptions)

  componentDidUpdate: (prevProps, prevState) ->
    # Check if options changed
    oldCompiler = new LayeredChartCompiler(schema: prevProps.schema) 
    newCompiler = new LayeredChartCompiler(schema: @props.schema)

    oldChartOptions = oldCompiler.createChartOptions({
      design: prevProps.design
      data: prevProps.data
      width: prevProps.width
      height: prevProps.height
      locale: prevProps.locale
    })

    newChartOptions = newCompiler.createChartOptions({
      design: @props.design
      data: @props.data
      width: @props.width
      height: @props.height
      locale: @props.locale
    })

    # If chart changed
    if not _.isEqual(oldChartOptions, newChartOptions)
      # Check if size alone changed
      if _.isEqual(_.omit(oldChartOptions, "size"), _.omit(newChartOptions, "size")) and @props.locale == prevProps.locale
        @chart.resize(width: @props.width, height: @props.height)
        @updateScope()
        return

      # TODO check if only data changed
      # Use throttled update to bypass https://github.com/mWater/mwater-visualization/issues/92
      @throttledCreateChart(@props)
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
    el = @chartDiv

    # Handle line and bar charts
    d3.select(el)
      .selectAll(".c3-chart-bar .c3-bar, .c3-chart-line .c3-circle")
      # Highlight only scoped
      .style("opacity", (d,i) =>
        dataPoint = @lookupDataPoint(dataMap, d)
        if dataPoint
          scope = compiler.createScope(@props.design, dataPoint.layerIndex, dataPoint.row, @props.locale)

        # Determine if scoped
        if scope and @props.scope 
          if _.isEqual(@props.scope.data, scope.data)
            return 1
          else
            return 0.3
        else
          # Not scoped
          return 1
      )

    # Handle pie charts
    d3.select(el)
      .selectAll(".c3-chart-arcs .c3-chart-arc")
      .style("opacity", (d, i) =>
        dataPoint = @lookupDataPoint(dataMap, d)
        if dataPoint
          scope = compiler.createScope(@props.design, dataPoint.layerIndex, dataPoint.row, @props.locale)

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
      dataPoint = dataMap["#{d.id}"]
    else
      dataPoint = dataMap["#{d.id}:#{d.index}"]

    return dataPoint

  getDataMap: ->
    # Get data map
    compiler = new LayeredChartCompiler(schema: @props.schema)
    return compiler.createDataMap(@props.design, @props.data)

  handleDataClick: (d) =>
    # Get data map
    dataMap = @getDataMap()

    # Look up data point
    dataPoint = @lookupDataPoint(dataMap, d)
    if not dataPoint
      return

    # Create scope
    compiler = new LayeredChartCompiler(schema: @props.schema)
    scope = compiler.createScope(@props.design, dataPoint.layerIndex, dataPoint.row, @props.locale)

    # If same scope data, remove scope
    if @props.scope and _.isEqual(scope.data, @props.scope.data) 
      @props.onScopeChange?(null)
      return

    @props.onScopeChange?(scope)

  componentWillUnmount: ->
    @chart.destroy()

  render: ->
    scale = @props.width / @props.standardWidth
    # Don't grow fonts as it causes overlap
    scale = Math.min(scale, 1)

    css = ".c3 svg { font-size: #{scale * 10}px; }\n"
    css += ".c3-legend-item { font-size: #{scale * 12}px; }\n"
    css += ".c3-chart-arc text { font-size: #{scale * 13}px; }\n"
    css += ".c3-title { font-size: #{scale * 14}px; }\n"

    R 'div', null,
      R 'style', null, css
      R 'div', ref: (c) => @chartDiv = c
