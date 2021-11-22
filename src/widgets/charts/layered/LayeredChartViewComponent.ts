import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
import ReactDOM from "react-dom"
const R = React.createElement

import { DataSource, ExprUtils, Schema } from "mwater-expressions"
import LayeredChartCompiler from "./LayeredChartCompiler"
import TextComponent from "../../text/TextComponent"
import * as d3 from "d3"
import { LayeredChartDesign } from "./LayeredChartDesign"

interface LayeredChartViewComponentProps {
  schema: Schema
  dataSource: DataSource
  design: LayeredChartDesign
  data: any
  onDesignChange?: any
  width: number
  height: number
  /** scope of the widget (when the widget self-selects a particular scope) */
  scope?: any
  /** called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details */
  onScopeChange?: any
}

interface LayeredChartViewComponentState {
  headerHeight: any
  footerHeight: any
}

// Displays a layered chart
export default class LayeredChartViewComponent extends React.Component<
  LayeredChartViewComponentProps,
  LayeredChartViewComponentState
> {
  static contextTypes = { locale: PropTypes.string }
  header: HTMLElement | null
  footer: HTMLElement | null

  constructor(props: any) {
    super(props)

    this.state = {
      headerHeight: null, // Height of header
      footerHeight: null // Height of footer
    }
  }

  componentDidMount() {
    this.updateHeights()
  }

  componentDidUpdate(prevProps: LayeredChartViewComponentProps) {
    // Check props to prevent odd infinite loop https://reactjs.org/docs/error-decoder.html/?invariant=185
    if (
      this.props.design != prevProps.design ||
      this.props.height != prevProps.height ||
      this.props.width != prevProps.width
    ) {
      console.log(
        `componentDidUpdate: ${this.props.height} vs ${prevProps.height} and ${this.props.width} vs ${prevProps.width}`
      )
      this.updateHeights()
    }
  }

  updateHeights() {
    // Calculate header and footer heights
    if (this.header && this.state.headerHeight !== this.header.offsetHeight) {
      console.log(
        `headerHeight: ${this.state.headerHeight} vs ${this.header.offsetHeight} => ${this.header.offsetHeight}`
      )
      this.setState({ headerHeight: this.header.offsetHeight })
    }
    if (this.footer && this.state.footerHeight !== this.footer.offsetHeight) {
      console.log(
        `footerHeight: ${this.state.footerHeight} vs ${this.footer.offsetHeight} => ${this.footer.offsetHeight}`
      )
      this.setState({ footerHeight: this.footer.offsetHeight })
    }
  }

  handleHeaderChange = (header: any) => {
    this.props.onDesignChange(_.extend({}, this.props.design, { header }))
  }

  handleFooterChange = (footer: any) => {
    this.props.onDesignChange(_.extend({}, this.props.design, { footer }))
  }

  renderHeader() {
    return R(
      "div",
      {
        ref: (c) => {
          return (this.header = c)
        }
      },
      R(TextComponent, {
        design: this.props.design.header!,
        onDesignChange: this.props.onDesignChange ? this.handleHeaderChange : undefined,
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        exprValues: this.props.data.header || {},
        width: this.props.width
      })
    )
  }

  renderFooter() {
    return R(
      "div",
      {
        ref: (c) => {
          return (this.footer = c)
        }
      },
      R(TextComponent, {
        design: this.props.design.footer!,
        onDesignChange: this.props.onDesignChange ? this.handleFooterChange : undefined,
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        exprValues: this.props.data.footer || {},
        width: this.props.width
      })
    )
  }

  render() {
    return R(
      "div",
      { style: { width: this.props.width, height: this.props.height } },
      this.renderHeader(),
      this.state.headerHeight != null && this.state.footerHeight != null
        ? R(C3ChartComponent, {
            schema: this.props.schema,
            design: this.props.design,
            data: this.props.data,
            onDesignChange: this.props.onDesignChange,
            width: this.props.width,
            height: this.props.height - this.state.headerHeight - this.state.footerHeight,
            scope: this.props.scope,
            onScopeChange: this.props.onScopeChange,
            locale: this.context.locale
          })
        : undefined,
      this.renderFooter()
    )
  }
}

interface C3ChartComponentProps {
  schema: Schema
  design: any
  data: any
  onDesignChange?: any
  width: number
  height: number
  /** scope of the widget (when the widget self-selects a particular scope) */
  scope?: any
  /** called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details */
  onScopeChange?: any
  locale?: string
}

// Displays the inner C3 component itself
class C3ChartComponent extends React.Component<C3ChartComponentProps> {
  throttledCreateChart: ((props: C3ChartComponentProps) => any) & _.Cancelable
  chart: any
  chartDiv: any

  constructor(props: C3ChartComponentProps) {
    super(props)

    // Create throttled createChart
    this.throttledCreateChart = _.throttle(this.createChart, 1000)
  }

  componentDidMount() {
    this.createChart(this.props)
    return this.updateScope()
  }

  createChart = (props: C3ChartComponentProps) => {
    if (this.chart) {
      this.chart.destroy()
    }

    const compiler = new LayeredChartCompiler({ schema: props.schema })
    const chartOptions: any = compiler.createChartOptions({
      design: this.props.design,
      data: this.props.data,
      width: this.props.width,
      height: this.props.height,
      locale: this.props.locale
    })

    chartOptions.bindto = this.chartDiv
    chartOptions.data.onclick = this.handleDataClick
    // Update scope after rendering. Needs a delay to make it happen
    chartOptions.onrendered = () => _.defer(this.updateScope)

    const c3 = require("c3")
    this.chart = c3.generate(chartOptions)
  }

  componentDidUpdate(prevProps: any, prevState: any) {
    // Check if schema, data or design (except for header + footer) changed
    let changed = false

    changed = changed || prevProps.schema !== this.props.schema
    changed = changed || !_.isEqual(prevProps.data, this.props.data)
    changed = changed || prevProps.locale !== this.props.locale
    changed =
      changed ||
      (prevProps.design !== this.props.design &&
        !_.isEqual(_.omit(prevProps.design, "header", "footer"), _.omit(this.props.design, "header", "footer")))

    if (changed) {
      const newCompiler = new LayeredChartCompiler({ schema: this.props.schema })
      const newChartOptions = newCompiler.createChartOptions({
        design: this.props.design,
        data: this.props.data,
        width: this.props.width,
        height: this.props.height,
        locale: this.props.locale
      })

      // TODO check if only data changed
      // Use throttled update to bypass https://github.com/mWater/mwater-visualization/issues/92
      return this.throttledCreateChart(this.props)
      // Check if size alone changed
    } else if (this.props.width !== prevProps.width || this.props.height !== prevProps.height) {
      this.chart.resize({ width: this.props.width, height: this.props.height })
      this.updateScope()
      return
      // Check scope
    } else if (!_.isEqual(this.props.scope, prevProps.scope)) {
      return this.updateScope()
    }
  }

  // if not _.isEqual(@props.data, nextProps.data)
  //   # # If length of data is different, re-create chart
  //   # if @props.data.main.length != nextProps.data.main.length
  //   @createChart(nextProps)
  //   return

  // # Reload data
  // @chart.load({
  //   json: @prepareData(nextProps.data).main
  //   keys: { x: "x", value: ["y"] }
  //   names: { y: 'Value' } # Name the data
  // })

  // Update scoped value
  updateScope = () => {
    const dataMap = this.getDataMap()
    const compiler = new LayeredChartCompiler({ schema: this.props.schema })
    const el = this.chartDiv

    // Handle line and bar charts
    d3.select(el)
      .selectAll(".c3-chart-bar .c3-bar, .c3-chart-line .c3-circle")
      // Highlight only scoped
      .style("opacity", (d: any, i: any) => {
        let scope
        const dataPoint = this.lookupDataPoint(dataMap, d)
        if (dataPoint) {
          scope = compiler.createScope(this.props.design, dataPoint.layerIndex, dataPoint.row, this.props.locale)
        }

        // Determine if scoped
        if (scope && this.props.scope) {
          if (_.isEqual(this.props.scope.data, scope.data)) {
            return 1
          } else {
            return 0.3
          }
        } else {
          // Not scoped
          if (dataPoint?.row.y !== null) {
            return 1
          } else {
            return 0
          }
        }
      })

    // Handle pie charts
    return d3
      .select(el)
      .selectAll(".c3-chart-arcs .c3-chart-arc")
      .style("opacity", (d: any, i: any) => {
        let scope
        const dataPoint = this.lookupDataPoint(dataMap, d)
        if (dataPoint) {
          scope = compiler.createScope(this.props.design, dataPoint.layerIndex, dataPoint.row, this.props.locale)
        }

        // Determine if scoped
        if (this.props.scope && scope) {
          if (_.isEqual(this.props.scope.data, scope.data)) {
            return 1
          } else {
            return 0.3
          }
        } else {
          // Not scoped
          return 1
        }
      })
  }

  // Gets a data point { layerIndex, row } from a d3 object (d)
  lookupDataPoint(dataMap: any, d: any) {
    let dataPoint
    if (d.data) {
      d = d.data
    }

    // Lookup layer and row. If pie/donut, index is always zero
    const isPolarChart = ["pie", "donut"].includes(this.props.design.type)
    if (isPolarChart) {
      dataPoint = dataMap[`${d.id}`]
    } else {
      dataPoint = dataMap[`${d.id}:${d.index}`]
    }

    return dataPoint
  }

  getDataMap() {
    // Get data map
    const compiler = new LayeredChartCompiler({ schema: this.props.schema })
    return compiler.createDataMap(this.props.design, this.props.data)
  }

  handleDataClick = (d: any) => {
    // Get data map
    const dataMap = this.getDataMap()

    // Look up data point
    const dataPoint = this.lookupDataPoint(dataMap, d)
    if (!dataPoint) {
      return
    }

    // Create scope
    const compiler = new LayeredChartCompiler({ schema: this.props.schema })
    const scope = compiler.createScope(this.props.design, dataPoint.layerIndex, dataPoint.row, this.props.locale)

    // If same scope data, remove scope
    if (this.props.scope && _.isEqual(scope.data, this.props.scope.data)) {
      this.props.onScopeChange?.(null)
      return
    }

    return this.props.onScopeChange?.(scope)
  }

  componentWillUnmount() {
    if (this.chart) {
      return this.chart.destroy()
    }
  }

  render() {
    // # Don't grow fonts as it causes overlap TODO remove
    // scale = Math.min(scale, 1)
    // css = ".c3 svg { font-size: #{scale * 10}px; }\n"
    // css += ".c3-legend-item { font-size: #{scale * 12}px; }\n"
    // css += ".c3-chart-arc text { font-size: #{scale * 13}px; }\n"
    // css += ".c3-title { font-size: #{scale * 14}px; }\n"

    return R("div", {
      ref: (c) => {
        return (this.chartDiv = c)
      }
    })
  }
}
