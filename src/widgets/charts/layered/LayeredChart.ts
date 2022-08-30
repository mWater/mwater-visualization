import _ from "lodash"
import React from "react"
const R = React.createElement
import async from "async"
import { default as produce } from "immer"
import { original } from "immer"
import Chart, { ChartCreateViewElementOptions } from "../Chart"
import LayeredChartCompiler from "./LayeredChartCompiler"
import { DataSource, ExprCleaner, Row, Schema } from "mwater-expressions"
import AxisBuilder, { AggrNeed } from "../../../axes/AxisBuilder"
import LayeredChartSvgFileSaver from "./LayeredChartSvgFileSaver"
import * as LayeredChartUtils from "./LayeredChartUtils"
import TextWidget from "../../text/TextWidget"
import { LayeredChartDesign } from "./LayeredChartDesign"
import { WidgetDataSource } from "../../WidgetDataSource"
import { JsonQLFilter } from "../../.."
import { JsonQLQuery } from "jsonql"

// See LayeredChart Design.md for the design
export default class LayeredChart extends Chart {
  cleanDesign(design: LayeredChartDesign, schema: Schema): LayeredChartDesign {
    const exprCleaner = new ExprCleaner(schema)
    const axisBuilder = new AxisBuilder({ schema })
    const compiler = new LayeredChartCompiler({ schema })

    const layers = design.layers || [{}]

    return produce(design, (draft: any) => {
      // Fill in defaults
      draft.version = design.version || 2
      draft.layers = layers

      // Default to titleText (legacy)
      draft.header = design.header || { style: "header", items: _.compact([design.titleText || null]) }
      draft.footer = design.footer || { style: "footer", items: [] }

      // Default value is now ""
      if (draft.version < 2) {
        if (design.xAxisLabelText == null) {
          draft.xAxisLabelText = ""
        }
        if (design.yAxisLabelText == null) {
          draft.yAxisLabelText = ""
        }
        draft.version = 2
      }

      // Clean each layer
      for (
        let layerId = 0, end = layers.length, asc = 0 <= end;
        asc ? layerId < end : layerId > end;
        asc ? layerId++ : layerId--
      ) {
        const layer = draft.layers[layerId]

        layer.axes = layer.axes || {}

        for (let axisKey in layer.axes) {
          // Determine what aggregation axis requires
          var aggrNeed: AggrNeed
          const axis = layer.axes[axisKey]
          if (axisKey === "y" && compiler.doesLayerNeedGrouping(draft, layerId)) {
            aggrNeed = "required"
          } else {
            aggrNeed = "none"
          }
          layer.axes[axisKey] = axisBuilder.cleanAxis({
            axis: axis ? original(axis) : null,
            table: layer.table,
            aggrNeed,
            types: LayeredChartUtils.getAxisTypes(draft, layer, axisKey) ?? undefined
          })
        }

        // Remove x axis if not required
        if (!compiler.canLayerUseXExpr(draft, layerId) && layer.axes.x) {
          delete layer.axes.x
        }

        // Remove cumulative if x is not date or number
        if (!layer.axes.x || !axisBuilder.doesAxisSupportCumulative(layer.axes.x)) {
          delete layer.cumulative
        }

        layer.filter = exprCleaner.cleanExpr(layer.filter ? original(layer.filter) : null, {
          table: layer.table,
          types: ["boolean"]
        })

        // No trendline if cumulative, or if has color axis
        if (layer.trendline && (layer.cumulative || layer.axes.color)) {
          delete layer.trendline
        }
      }
    })
  }

  validateDesign(design: LayeredChartDesign, schema: Schema) {
    let error
    let axisBuilder = new AxisBuilder({ schema })
    const compiler = new LayeredChartCompiler({ schema })

    // Check that layers have same x axis type
    const xAxisTypes = _.uniq(
      _.map(design.layers, (l) => {
        axisBuilder = new AxisBuilder({ schema })
        return axisBuilder.getAxisType(l.axes.x)
      })
    )

    if (xAxisTypes.length > 1) {
      return "All x axes must be of same type"
    }

    for (
      let layerId = 0, end = design.layers.length, asc = 0 <= end;
      asc ? layerId < end : layerId > end;
      asc ? layerId++ : layerId--
    ) {
      const layer = design.layers[layerId]

      // Check that has table
      if (!layer.table) {
        return "Missing data source"
      }

      // Check that has y axis
      if (!layer.axes.y) {
        return "Missing Y Axis"
      }

      if (!layer.axes.x && compiler.isXAxisRequired(design, layerId)) {
        return "Missing X Axis"
      }
      if (!layer.axes.color && compiler.isColorAxisRequired(design, layerId)) {
        return "Missing Color Axis"
      }

      error = null

      // Validate axes
      error = error || axisBuilder.validateAxis({ axis: layer.axes.x })
      error = error || axisBuilder.validateAxis({ axis: layer.axes.y })
      error = error || axisBuilder.validateAxis({ axis: layer.axes.color })
    }

    return error
  }

  isEmpty(design: any) {
    return !design.layers || !design.layers[0] || !design.layers[0].table
  }

  // Creates a design element with specified options
  // options include:
  //   schema: schema to use
  //   dataSource: dataSource to use
  //   design: design
  //   onDesignChange: function
  //   filters: array of filters
  createDesignerElement(options: any) {
    // Require here to prevent server require problems
    const LayeredChartDesignerComponent = require("./LayeredChartDesignerComponent").default
    const props = {
      schema: options.schema,
      dataSource: options.dataSource,
      design: this.cleanDesign(options.design, options.schema),
      filters: options.filters,
      onDesignChange: (design: any) => {
        // Clean design
        design = this.cleanDesign(design, options.schema)
        return options.onDesignChange(design)
      }
    }
    return React.createElement(LayeredChartDesignerComponent, props)
  }

  // Get data for the chart asynchronously
  // design: design of the chart
  // schema: schema to use
  // dataSource: data source to get data from
  // filters: array of { table: table id, jsonql: jsonql condition with {alias} for tableAlias }
  // callback: (error, data)
  getData(design: any, schema: Schema, dataSource: DataSource, filters: JsonQLFilter[], callback: any) {
    const compiler = new LayeredChartCompiler({ schema })
    const queries = compiler.createQueries(design, filters)

    // Run queries in parallel
    return async.map(
      _.pairs(queries),
      (item: [string, JsonQLQuery], cb) => {
        return dataSource.performQuery(item[1], (err: any, rows: any) => {
          return cb(err, [item[0], rows])
        })
      },
      (err, items: [string, Row[]][]) => {
        if (err) {
          return callback(err)
        }

        const data = _.object(items) as any

        // Add header and footer data
        const textWidget = new TextWidget()
        return textWidget.getData(design.header, schema, dataSource, filters, (error: any, headerData: any) => {
          if (error) {
            return callback(error)
          }

          data.header = headerData

          return textWidget.getData(design.footer, schema, dataSource, filters, (error: any, footerData: any) => {
            if (error) {
              return callback(error)
            }

            data.footer = footerData

            return callback(null, data)
          })
        })
      }
    )
  }

  // Create a view element for the chart
  // Options include:
  //   schema: schema to use
  //   dataSource: dataSource to use
  //   design: design of the chart
  //   onDesignChange: when design changes
  //   data: results from queries
  //   width, height: size of the chart view
  //   scope: current scope of the view element
  //   onScopeChange: called when scope changes with new scope
  createViewElement(options: ChartCreateViewElementOptions) {
    const LayeredChartViewComponent = require("./LayeredChartViewComponent").default

    // Create chart
    const props = {
      schema: options.schema,
      dataSource: options.dataSource,
      design: this.cleanDesign(options.design, options.schema),
      onDesignChange: options.onDesignChange,
      data: options.data,

      width: options.width,
      height: options.height,

      scope: options.scope,
      onScopeChange: options.onScopeChange
    }

    return React.createElement(LayeredChartViewComponent, props)
  }

  createDropdownItems(design: any, schema: Schema, widgetDataSource: WidgetDataSource, filters: any) {
    // TODO validate design before allowing save
    const save = (format: any) => {
      design = this.cleanDesign(design, schema)
      return widgetDataSource.getData(design, filters, (err: any, data: any) => {
        if (err) {
          return alert("Unable to load data")
        } else {
          return LayeredChartSvgFileSaver.save(design, data, schema, format)
        }
      })
    }

    // Don't save image of invalid design
    if (this.validateDesign(this.cleanDesign(design, schema), schema)) {
      return []
    }

    return [
      { label: "Save as SVG", icon: "picture", onClick: save.bind(null, "svg") },
      { label: "Save as PNG", icon: "camera", onClick: save.bind(null, "png") }
    ]
  }

  createDataTable(design: LayeredChartDesign, schema: Schema, dataSource: DataSource, data: any, locale: string) {
    let table: any[][] = []
    const axisBuilder = new AxisBuilder({ schema })

    const headers = []

    // Only allow if either all layers have x axis or one layer
    if (!design.layers.every((layer) => layer.axes.x != null) && design.layers.length > 1) {
      throw new Error("Cannot export multi-layer charts without x axis")
    }

    for (let layerNum = 0; layerNum < design.layers.length; layerNum++) {
      const layer = design.layers[layerNum]
      if (layer.axes.x && layerNum == 0) {
        headers.push(axisBuilder.summarizeAxis(layer.axes.x, locale))
      }
      if (layer.axes.color) {
        headers.push(axisBuilder.summarizeAxis(layer.axes.color, locale))
      }
      if (layer.axes.y) {
        headers.push(axisBuilder.summarizeAxis(layer.axes.y, locale))
      }
    }
    table.push(headers)

    for (let rowNum = 0; rowNum < data.layer0.length; rowNum++) {
      const r = []

      for (let layerNum = 0; layerNum < design.layers.length; layerNum++) {
        const layer = design.layers[layerNum]

        let layerRow
        if (layerNum == 0) {
          // If first layer, use the row
          layerRow = data[`layer${layerNum}`][rowNum]
        } else {
          // Find the row with the same x value
          layerRow = _.find(data[`layer${layerNum}`], (r: any) => r.x == data["layer0"][rowNum].x)
        }

        if (layer.axes.x && layerNum == 0) {
          r.push(axisBuilder.formatValue(layer.axes.x, layerRow.x, locale))
        }
        if (layer.axes.color) {
          if (layerRow) {
            r.push(axisBuilder.formatValue(layer.axes.color, layerRow.color, locale))
          } else {
            r.push(null)
          }
        }
        if (layer.axes.y) {
          if (layerRow) {
            r.push(axisBuilder.formatValue(layer.axes.y, layerRow.y, locale))
          } else {
            r.push(null)
          }
        }
      }

      table.push(r)
    }
    return table
  }

  // Get a list of table ids that can be filtered on
  getFilterableTables(design: LayeredChartDesign, schema: Schema) {
    let filterableTables = _.uniq(_.compact(_.map(design.layers, (layer) => layer.table)))

    // Get filterable tables from header and footer
    const textWidget = new TextWidget()
    filterableTables = _.union(filterableTables, textWidget.getFilterableTables(design.header, schema))
    filterableTables = _.union(filterableTables, textWidget.getFilterableTables(design.footer, schema))

    return filterableTables
  }

  // Get the chart placeholder icon. fa-XYZ or glyphicon-XYZ
  getPlaceholderIcon() {
    return "fa-bar-chart"
  }
}
