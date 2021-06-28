// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let CalendarChartViewComponent
import $ from "jquery"
import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement
import moment from "moment"
import AxisBuilder from "../../../axes/AxisBuilder"
import { ExprUtils } from "mwater-expressions"
import d3 from "d3"

// Require d3-tip to use it
import { default as d3Tip } from "d3-tip"

// creates a d3 calendar visualization
export default CalendarChartViewComponent = (function () {
  CalendarChartViewComponent = class CalendarChartViewComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        design: PropTypes.object.isRequired, // Design of chart
        data: PropTypes.array.isRequired, // Data that the chart has requested. In format [{ date: <YYYY-MM-DD>, value: <number value> }, { date: ... }...]
        schema: PropTypes.object.isRequired,

        width: PropTypes.number,
        height: PropTypes.number,

        scope: PropTypes.any, // scope of the widget (when the widget self-selects a particular scope)
        onScopeChange: PropTypes.func, // called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details

        monthsStrokeColor: PropTypes.string,
        monthsStrokeWidth: PropTypes.number,

        cellColor: PropTypes.string, //the day cell color
        cellStrokeColor: PropTypes.string, //the day cell stroke color

        highlightCellFillColor: PropTypes.string
      }

      this.defaultProps = {
        monthsStrokeColor: "#222",
        monthsStrokeWidth: 1,
        cellColor: "#FDAE61",
        highlightCellFillColor: "#000000"
      }

      this.contextTypes = { locale: PropTypes.string }
      //the fill color for highlighted cell
    }

    constructor(props: any) {
      super(props)

      this.axisBuilder = new AxisBuilder({ schema: props.schema }) // e.g. "en"
    }

    shouldComponentUpdate(prevProps: any) {
      return !_.isEqual(_.omit(prevProps, "onScopeChange"), _.omit(this.props, "onScopeChange"))
    }

    getCellSize() {
      // ((total width) - (total required month stroke) - (left and right padding) - (space for year text) ) / weeks in year
      const cellSizeForWidth = (this.props.width - this.props.monthsStrokeWidth * 2 - 26) / 53
      const years = this.getYears()

      // ((total height) - (total cell stroke) - (total required month stroke) - ( total required padding)) / (total year * 7)
      let remainingSpace = this.props.height - years.length * 7 - this.props.monthsStrokeWidth * 2 * years.length

      if (this.props.design.titleText) {
        remainingSpace = remainingSpace - $(this.title).outerHeight()
      }

      const cellSizeForHeight = remainingSpace / (years.length * 7)

      return Math.min(cellSizeForHeight, cellSizeForWidth)
    }

    getYears() {
      let years = _.map(this.props.data, (entry) => {
        return new Date(entry.date).getFullYear()
      })

      years = _.uniq(years, true)

      // Filter extraneous dates
      years = _.filter(years, (y) => y > 1970 && y < 2050)

      // Take only max of 10 years to display
      years = _.take(years, 10)

      return years
    }

    // @todo: detect outliers/ implement data points threshold
    componentDidMount() {
      return this.redraw()
    }

    componentDidUpdate(prevProps: any) {
      return this.redraw()
    }

    handleCellClick(cell: any, data: any) {
      if (this.props.scope?.data === data) {
        this.props.onScopeChange?.(null)
        return
      }

      const scopeData = {
        name:
          this.axisBuilder.summarizeAxis(this.props.design.dateAxis, this.context.locale) +
          " is " +
          this.axisBuilder.formatValue(this.props.design.dateAxis, data, this.context.locale),
        filter: {
          jsonql: this.axisBuilder.createValueFilter(this.props.design.dateAxis, data),
          table: this.props.design.table
        },
        filterExpr: this.axisBuilder.createValueFilterExpr(this.props.design.dateAxis, data),
        data
      }

      return this.props.onScopeChange?.(scopeData)
    }

    // Redraw component
    redraw() {
      this.reloading = true
      const container = this.chart_container
      container.innerHTML = ""
      const cellSize = this.getCellSize()
      const height = Math.ceil(cellSize * 7) + 7
      const format = d3.timeFormat("%Y-%m-%d")
      const percent = d3.format(".1%")
      const cellStroke = this.props.cellStrokeColor || this.props.cellColor
      const self = this

      const rgb = d3.rgb(this.props.cellColor)
      const years = this.getYears()

      // Don't draw if no years
      if (years.length === 0) {
        return
      }

      const data = d3
        .nest()
        .key((d: any) => d.date)
        .rollup((d: any) => d[0].value)
        .map(this.props.data, d3.map)

      const tip = d3Tip()
        .attr("class", "d3-tip")
        .html(function (d: any) {
          const _date = moment(d)

          let title = "<p>" + _date.format("LL") + "</p>"
          title += "<p>" + (data.has(d) ? data.get(d) : 0 + "<p>")

          return title
        })

      const color = d3
        .scaleQuantize()
        .domain([1, d3.max(data.values())])
        .range(d3.range(10).map((d: any) => rgb.darker(d * 0.1).toString()))

      const yearGroupTranslateX = (this.props.width - cellSize * 53 - 16) / 2 + 16

      const svg = d3
        .select(container)
        .selectAll("svg")
        .data(years)
        .enter()
        .append("svg")
        .attr("width", this.props.width)
        .attr("height", height)
        .attr("class", "calendar-chart-year")
        .append("g")
        .attr("transform", "translate(" + yearGroupTranslateX + ",0)")

      svg.call(tip)

      svg
        .append("text")
        .text((d: any, i: any) => d)
        .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
        .attr("font-size", function (d: any) {
          return Math.min(14, ((cellSize * 7) / this.getComputedTextLength()) * 14) + "px"
        })
        .style("text-anchor", "middle")

      const _this = this

      const rect = svg
        .selectAll(".calendar-chart-day")
        .data((d: any) => d3.timeDays(new Date(d, 0, 1), new Date(d + 1, 0, 1)))
        .enter()
        .append("rect")
        .attr("class", "calendar-chart-day")
        .attr("fill", "#fff")
        .attr("stroke", cellStroke)
        .attr("stroke-width", this.props.monthsStrokeWidth)
        .attr("width", cellSize)
        .attr("height", cellSize)
        .attr("x", (d: any) => d3.timeWeek.count(d3.timeYear(d), d) * cellSize)
        .attr("y", (d: any) => d.getDay() * cellSize)
        .on("mouseenter", function (d: any, i: any) {
          if (!_this.reloading) {
            return tip.show(d, i, this)
          }
        })
        .on("mouseleave", tip.hide)
        .datum(format)

      rect.on("click", function (e: any) {
        tip.hide()
        // tip.destroy()
        const selectedRect = d3.select(this)
        return self.handleCellClick(selectedRect, e)
      })

      rect
        .filter((d: any) => data.has(d))
        .attr("fill", (d: any) => {
          const _color = color(data.get(d))

          if (this.props.scope?.data === d) {
            return this.props.highlightCellFillColor
          }

          return _color
        })

      function monthPath(t0: any) {
        const t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0)
        const d0 = t0.getDay()
        const w0 = d3.timeWeek.count(d3.timeYear(t0), t0)
        const d1 = t1.getDay()
        const w1 = d3.timeWeek.count(d3.timeYear(t1), t1)

        return (
          "M" +
          (w0 + 1) * cellSize +
          "," +
          d0 * cellSize +
          "H" +
          w0 * cellSize +
          "V" +
          7 * cellSize +
          "H" +
          w1 * cellSize +
          "V" +
          (d1 + 1) * cellSize +
          "H" +
          (w1 + 1) * cellSize +
          "V" +
          0 +
          "H" +
          (w0 + 1) * cellSize +
          "Z"
        )
      }

      svg
        .selectAll(".calendar-chart-month")
        .data((d: any) => d3.timeMonths(new Date(d, 0, 1), new Date(d + 1, 0, 1)))
        .enter()
        .append("path")
        .attr("fill", "none")
        .attr("class", "calendar-chart-month")
        .attr("stroke", this.props.monthsStrokeColor)
        .attr("stroke-width", this.props.monthsStrokeWidth)
        .attr("d", monthPath)

      this.reloading = false
    }

    render() {
      const titleStyle = {
        textAlign: "center",
        fontSize: "14px",
        fontWeight: "bold",
        margin: 0
      }
      const style = {
        width: this.props.width,
        height: this.props.height,
        shapeRendering: "crispEdges",
        lineHeight: 1
      }

      const title = this.props.design.titleText

      return R(
        "div",
        { style },
        title
          ? R(
              "p",
              {
                style: titleStyle,
                ref: (c: any) => {
                  return (this.title = c)
                }
              },
              title
            )
          : undefined,
        R("div", {
          ref: (c: any) => {
            return (this.chart_container = c)
          }
        })
      )
    }
  }
  CalendarChartViewComponent.initClass()
  return CalendarChartViewComponent
})()
