PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
H = React.DOM
moment = require 'moment'

AxisBuilder = require '../../../axes/AxisBuilder'
ExprUtils = require('mwater-expressions').ExprUtils

# Require d3-tip to use it
d3Tip = require('d3-tip')

# creates a d3 calendar visualization
module.exports = class CalendarChartViewComponent extends React.Component
  @propTypes:
    design: PropTypes.object.isRequired # Design of chart
    data: PropTypes.array.isRequired # Data that the chart has requested. In format [{ date: <YYYY-MM-DD>, value: <number value> }, { date: ... }...]

    width: PropTypes.number
    height: PropTypes.number
    standardWidth: PropTypes.number

    scope: PropTypes.any # scope of the widget (when the widget self-selects a particular scope)
    onScopeChange: PropTypes.func # called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details

    monthsStrokeColor: PropTypes.string
    monthsStrokeWidth: PropTypes.number

    cellColor: PropTypes.string #the day cell color
    cellStrokeColor: PropTypes.string #the day cell stroke color

    highlightCellFillColor: PropTypes.string #the fill color for highlighted cell

  constructor: (options) ->
    @schema = options.schema
    @axisBuilder = new AxisBuilder(schema: @schema)

  @defaultProps:
    monthsStrokeColor: "#222"
    monthsStrokeWidth: 1
    cellColor: "#FDAE61"
    highlightCellFillColor: "#000000"

  @contextTypes:
    locale: PropTypes.string  # e.g. "en"

  shouldComponentUpdate: (prevProps) ->
    not _.isEqual(prevProps, @props)

  getCellSize: ->
    # ((total width) - (total required month stroke) - (left and right padding) - (space for year text) ) / weeks in year
    cellSizeForWidth = (@props.width - @props.monthsStrokeWidth * 2 - 26 ) / 53
    years = @getYears()

    # ((total height) - (total cell stroke) - (total required month stroke) - ( total required padding)) / (total year * 7)
    remainingSpace = (@props.height - years.length * 7 - @props.monthsStrokeWidth * 2 * years.length)

    if @props.design.titleText
      remainingSpace = remainingSpace - $(@refs.title).outerHeight()

    cellSizeForHeight = remainingSpace / (years.length * 7)

    Math.min(cellSizeForHeight, cellSizeForWidth)

  getYears: ->
    years = _.map @props.data, (entry) =>
      (new Date(entry.date)).getFullYear()

    years = _.uniq(years, true)

    # Filter extraneous dates
    years = _.filter(years, (y) -> y > 1970 and y < 2050)

    # Take only max of 10 years to display
    years = _.take(years, 10)

    return years

  # @todo: detect outliers/ implement data points threshold
  componentDidMount: ->
    @redraw()

  componentDidUpdate: (prevProps) ->
    @redraw()

  handleCellClick: (cell, data) ->
    if @props.scope?.data == data
      @props.onScopeChange?(null)
      return

    scopeData =
      name: @axisBuilder.summarizeAxis(@props.design.dateAxis, @context.locale) + " is " + @axisBuilder.formatValue(@props.design.dateAxis, data, @context.locale)
      filter:
        jsonql: @axisBuilder.createValueFilter(@props.design.dateAxis, data)
        table: @props.design.table
      data: data

    @props.onScopeChange?(scopeData)

  # Redraw component
  redraw: ->
    @reloading = true
    container = @refs.chart_container
    container.innerHTML = ''
    cellSize = @getCellSize()
    height = Math.ceil(cellSize * 7) + 7
    format = d3.time.format("%Y-%m-%d")
    percent = d3.format(".1%")
    cellStroke = @props.cellStrokeColor || @props.cellColor
    self = this

    rgb = d3.rgb(@props.cellColor)
    years = @getYears()

    # Don't draw if no years
    if years.length == 0
      return

    data = d3.nest()
      .key( (d) -> d.date )
      .rollup( (d) -> d[0].value )
      .map(@props.data, d3.map)

    tip = d3Tip().attr('class', 'd3-tip').html( (d) ->
      _date = moment(d)

      title = '<p>' + _date.format('LL') + '</p>'
      title += '<p>' + if data.has(d) then data.get(d) else 0 + '<p>'

      title
    )

    color = d3.scale.quantize()
      .domain([1, d3.max(data.values())])
      .range(d3.range(10).map( (d) ->
        rgb.darker( d * 0.1).toString()
      ))

    yearGroupTranslateX = (@props.width - cellSize * 53 - 16 ) / 2 + 16

    svg = d3.select(container).selectAll("svg")
      .data(years)
      .enter()
      .append("svg")
      .attr("width", @props.width)
      .attr("height", height)
      .attr("class", "calendar-chart-year")
      .append("g")
      .attr("transform", "translate("+yearGroupTranslateX+",0)")

    svg.call(tip)

    svg.append("text")
      .text( (d,i) -> d )
      .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
      .attr("font-size", (d) ->
        Math.min( 14, (cellSize * 7) / this.getComputedTextLength() * 14) + "px"
      )
      .style("text-anchor", "middle")


    rect = svg.selectAll(".calendar-chart-day")
      .data( (d) -> d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)))
      .enter().append("rect")
      .attr("class", "calendar-chart-day")
      .attr("fill", "#fff")
      .attr("stroke", cellStroke)
      .attr("stroke-width", @props.monthsStrokeWidth)
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("x", (d) -> d3.time.weekOfYear(d) * cellSize )
      .attr("y", (d) -> d.getDay() * cellSize )
      .on("mouseenter", (d, i) =>
        if not @reloading
          tip.show(d, i)
      )
      .on("mouseleave", tip.hide)
      .datum(format)

    rect.on "click", (e) ->
      tip.hide()
      # tip.destroy()
      selectedRect = d3.select(this)
      self.handleCellClick selectedRect, e


    rect.filter( (d) -> data.has(d) )
      .attr( "fill", (d) =>
        _color = color(data.get(d))

        if @props.scope?.data == d
          return @props.highlightCellFillColor

        _color
      )

    monthPath = (t0) ->
      t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0)
      d0 = t0.getDay()
      w0 = d3.time.weekOfYear(t0)
      d1 = t1.getDay()
      w1 = d3.time.weekOfYear(t1)

      "M" + (w0 + 1) * cellSize + "," + d0 * cellSize +
        "H" + w0 * cellSize + "V" + 7 * cellSize +
        "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize +
        "H" + (w1 + 1) * cellSize + "V" + 0 +
        "H" + (w0 + 1) * cellSize + "Z"

    svg.selectAll(".calendar-chart-month")
      .data( (d) -> d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)))
      .enter().append("path")
      .attr("fill", "none")
      .attr("class", "calendar-chart-month")
      .attr("stroke", @props.monthsStrokeColor)
      .attr("stroke-width", @props.monthsStrokeWidth)
      .attr("d", monthPath)

    @reloading = false
    return

  render: ->
    titleStyle =
      textAlign: "center"
      fontSize: "14px"
      fontWeight: "bold"
      margin: 0
    style =
      width: @props.width
      height: @props.height
      shapeRendering: "crispEdges"
      lineHeight: 1

    title = @props.design.titleText

    H.div style: style,
      if title
        H.p {style: titleStyle, ref: "title"}, title,
      H.div { ref: "chart_container"}
