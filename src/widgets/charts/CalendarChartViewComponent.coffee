_ = require 'lodash'
React = require 'react'
H = React.DOM
moment = require 'moment'

AxisBuilder = require '../../axes/AxisBuilder'

# Require d3-tip to use it
require('d3-tip')(d3)

# creates a d3 calendar visualization
module.exports = class CalendarChartViewComponent extends React.Component
  @propTypes:
    design: React.PropTypes.object.isRequired # Design of chart
    data: React.PropTypes.array.isRequired # Data that the chart has requested. In format [{ date: <YYYY-MM-DD>, value: <number value> }, { date: ... }...] 

    width: React.PropTypes.number
    height: React.PropTypes.number
    standardWidth: React.PropTypes.number

    scope: React.PropTypes.any # scope of the widget (when the widget self-selects a particular scope)
    onScopeChange: React.PropTypes.func # called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details

    monthsStrokeColor: React.PropTypes.string
    monthsStrokeWidth: React.PropTypes.number

    cellColor: React.PropTypes.string #the day cell color
    cellStrokeColor: React.PropTypes.string #the day cell stroke color

  @defaultProps:
    monthsStrokeColor: "#222"
    monthsStrokeWidth: 1
    cellColor: "#FDAE61"

  shouldComponentUpdate: (prevProps) ->
    not _.isEqual(prevProps, @props)

  getCellSize: ->
    # ((total width) - (total required month stroke) - (left and right padding) - (space for year text) ) / weeks in year
    cellSizeForWidth = Math.floor((@props.width - @props.monthsStrokeWidth * 2 - 26 ) / 53)
    years = @getYears()

    # ((total height) - (total required month stroke) - ( total required padding)) / (total year * 7)
    cellSizeForHeight = Math.floor((@props.height - @props.monthsStrokeWidth * 2 * years.length - (years.length + 1) * 5)  / (years.length * 7) )
    Math.min(cellSizeForHeight, cellSizeForWidth)

  getYears: ->
    years = _.map @props.data, (entry) =>
      (new Date(entry.date)).getFullYear()

    _.uniq(years, true)

  # @todo: detect outliers/ implement data points threshold
  componentDidMount: ->
    @redraw()

  componentDidUpdate: (prevProps) ->
    @redraw()

  # Redraw component
  redraw: ->
    container = @refs.chart_container
    container.innerHTML = ''
    cellSize = @getCellSize()
    height = cellSize * 7 + 10
    format = d3.time.format("%Y-%m-%d")
    percent = d3.format(".1%")
    cellStroke = @props.cellStrokeColor || @props.cellColor

    rgb = d3.rgb(@props.cellColor)
    years = @getYears()

    data = d3.nest()
      .key( (d) -> d.date )
      .rollup( (d) -> d[0].value )
      .map(@props.data, d3.map)

    tip = d3.tip().attr('class', 'd3-tip').html( (d) ->
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
      .enter().append("svg")
      .attr("width", @props.width)
      .attr("height", height)
      .attr("class", "calendar-chart-year")
      .append("g")
      .attr("transform", "translate("+yearGroupTranslateX+",5)")

    svg.call(tip)

    svg.append("text")
      .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
      .style("text-anchor", "middle")
      .text( (d,i) -> d )

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
      .on("mouseenter", tip.show)
      .on("mouseleave", tip.hide)
      .datum(format)

#    rect.append("title")
#      .text((d) -> d )

    rect.filter( (d) -> data.has(d) )
      .attr( "fill", (d) -> color(data.get(d)))

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

    return

  render: ->
    titleStyle =
      textAlign: "center"
      fontSize: "14px"
      fontWeight: "bold"
    style =
#      display: "flex"
#      flexDirection: "column"
      justifyContent: "center"
      width: @props.width
      height: @props.height
      shapeRendering: "crispEdges"

    title = @props.design.titleText

    H.div style: style,
      if title
        H.p style: titleStyle, title,
      H.div { ref: "chart_container"}

