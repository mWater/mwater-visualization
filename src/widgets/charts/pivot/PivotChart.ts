// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let PivotChart
import _ from "lodash"
import React from "react"
const R = React.createElement
import async from "async"
import uuid from "uuid"
import { default as produce } from "immer"
import { original } from "immer"
import { WeakCache } from "mwater-expressions"
import Chart from "../Chart"
import { ExprCleaner } from "mwater-expressions"
import AxisBuilder from "../../../axes/AxisBuilder"
import TextWidget from "../../text/TextWidget"
import * as PivotChartUtils from "./PivotChartUtils"
import PivotChartQueryBuilder from "./PivotChartQueryBuilder"
import PivotChartLayoutBuilder from "./PivotChartLayoutBuilder"

// Store true as a weakly cached value if a design is already clean
const cleanDesignCache = new WeakCache()

// See README.md for the design
export default PivotChart = class PivotChart extends Chart {
  cleanDesign(design: any, schema: any) {
    const exprCleaner = new ExprCleaner(schema)
    const axisBuilder = new AxisBuilder({ schema })

    // Use weak caching to improve performance of cleaning complex pivot charts
    if (cleanDesignCache.get([design, schema], []) === true) {
      return design
    }

    const cleanedDesign = produce(design, (draft: any) => {
      // Fill in defaults
      draft.version = design.version || 1
      draft.rows = design.rows || []
      draft.columns = design.columns || []
      draft.intersections = design.intersections || {}
      draft.header = design.header || { style: "footer", items: [] }
      draft.footer = design.footer || { style: "footer", items: [] }

      if (design.table) {
        // Add default row and column
        let intersectionId, segment
        if (draft.rows.length === 0) {
          draft.rows.push({ id: uuid() })
        }
        if (draft.columns.length === 0) {
          draft.columns.push({ id: uuid() })
        }

        // Cleans a single segment
        const cleanSegment = (segment: any) => {
          if (segment.valueAxis) {
            segment.valueAxis = axisBuilder.cleanAxis({
              axis: segment.valueAxis ? original(segment.valueAxis) : null,
              table: design.table,
              aggrNeed: "none",
              types: ["enum", "text", "boolean", "date"]
            })
          }

          // Remove valueLabelBold if no valueAxis
          if (!segment.valueAxis) {
            delete segment.valueLabelBold
          }

          if (segment.filter) {
            segment.filter = exprCleaner.cleanExpr(segment.filter ? original(segment.filter) : null, {
              table: design.table,
              types: ["boolean"]
            })
          }

          if (segment.orderExpr) {
            return (segment.orderExpr = exprCleaner.cleanExpr(segment.orderExpr ? original(segment.orderExpr) : null, {
              table: design.table,
              aggrStatuses: ["aggregate"],
              types: ["enum", "text", "boolean", "date", "datetime", "number"]
            }))
          }
        }

        // Clean all segments
        for (segment of PivotChartUtils.getAllSegments(draft.rows)) {
          cleanSegment(segment)
        }

        for (segment of PivotChartUtils.getAllSegments(draft.columns)) {
          cleanSegment(segment)
        }

        // Clean all intersections
        for (intersectionId in draft.intersections) {
          const intersection = draft.intersections[intersectionId]
          if (intersection.valueAxis) {
            intersection.valueAxis = axisBuilder.cleanAxis({
              axis: intersection.valueAxis ? original(intersection.valueAxis) : null,
              table: design.table,
              aggrNeed: "required",
              types: ["enum", "text", "boolean", "date", "number"]
            })
          }

          if (intersection.backgroundColorAxis) {
            intersection.backgroundColorAxis = axisBuilder.cleanAxis({
              axis: intersection.backgroundColorAxis ? original(intersection.backgroundColorAxis) : null,
              table: design.table,
              aggrNeed: "required",
              types: ["enum", "text", "boolean", "date"]
            })

            if (intersection.backgroundColorOpacity == null) {
              intersection.backgroundColorOpacity = 1
            }
          }

          if (intersection.filter) {
            intersection.filter = exprCleaner.cleanExpr(intersection.filter ? original(intersection.filter) : null, {
              table: design.table,
              types: ["boolean"]
            })
          }
        }

        // Get all intersection ids
        const allIntersectionIds = []
        for (let rowPath of PivotChartUtils.getSegmentPaths(design.rows || [])) {
          for (let columnPath of PivotChartUtils.getSegmentPaths(design.columns || [])) {
            allIntersectionIds.push(PivotChartUtils.getIntersectionId(rowPath, columnPath))
          }
        }

        // Add missing intersections
        for (intersectionId of _.difference(allIntersectionIds, _.keys(design.intersections || {}))) {
          draft.intersections[intersectionId] = {}
        }

        // Remove extra intersections
        for (intersectionId of _.difference(_.keys(design.intersections || {}), allIntersectionIds)) {
          delete draft.intersections[intersectionId]
        }

        // Clean filter
        draft.filter = exprCleaner.cleanExpr(design.filter, { table: design.table, types: ["boolean"] })
        return
      }
    })

    // Cache if unchanged (and therefore clean)
    if (design === cleanedDesign) {
      cleanDesignCache.set([design, schema], [], true)
    }

    return cleanedDesign
  }

  validateDesign(design: any, schema: any) {
    let segment
    const axisBuilder = new AxisBuilder({ schema })

    // Check that has table
    if (!design.table) {
      return "Missing data source"
    }

    // Check that has rows
    if (design.rows.length === 0) {
      return "Missing rows"
    }

    // Check that has columns
    if (design.columns.length === 0) {
      return "Missing columns"
    }

    let error = null

    // Validate axes
    for (segment of PivotChartUtils.getAllSegments(design.rows)) {
      if (segment.valueAxis) {
        error = error || axisBuilder.validateAxis({ axis: segment.valueAxis })
      }
    }

    for (segment of PivotChartUtils.getAllSegments(design.columns)) {
      if (segment.valueAxis) {
        error = error || axisBuilder.validateAxis({ axis: segment.valueAxis })
      }
    }

    for (let intersectionId in design.intersections) {
      const intersection = design.intersections[intersectionId]
      if (intersection.valueAxis) {
        error = error || axisBuilder.validateAxis({ axis: intersection.valueAxis })
      }
    }

    return error
  }

  // Determine if widget is auto-height, which means that a vertical height is not required.
  isAutoHeight() {
    return false
  }

  isEmpty(design: any) {
    return !design.table || design.rows.length === 0 || design.columns.length === 0
  }

  // True if designer should have a preview pane to the left
  hasDesignerPreview() {
    return false
  }

  // Label for the edit gear dropdown
  getEditLabel() {
    return "Configure Table"
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
    const PivotChartDesignerComponent = require("./PivotChartDesignerComponent").default

    const props = {
      schema: options.schema,
      dataSource: options.dataSource,
      design: this.cleanDesign(options.design, options.schema),
      filters: options.filter,
      onDesignChange: (design: any) => {
        // Clean design
        design = this.cleanDesign(design, options.schema)
        return options.onDesignChange(design)
      }
    }
    return React.createElement(PivotChartDesignerComponent, props)
  }

  // Get data for the chart asynchronously
  // design: design of the chart
  // schema: schema to use
  // dataSource: data source to get data from
  // filters: array of { table: table id, jsonql: jsonql condition with {alias} for tableAlias }
  // callback: (error, data)
  getData(design: any, schema: any, dataSource: any, filters: any, callback: any) {
    const queryBuilder = new PivotChartQueryBuilder({ schema })
    const queries = queryBuilder.createQueries(design, filters)

    // Run queries in parallel
    return async.map(
      _.pairs(queries),
      (item, cb) => {
        return dataSource.performQuery(item[1], (err: any, rows: any) => {
          return cb(err, [item[0], rows])
        })
      },
      (err, items) => {
        if (err) {
          return callback(err)
        }

        const data = _.object(items)

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
  //   filters: array of filters
  createViewElement(options: any) {
    const PivotChartViewComponent = require("./PivotChartViewComponent").default

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
      onScopeChange: options.onScopeChange,
      filters: options.filters
    }

    return React.createElement(PivotChartViewComponent, props)
  }

  createDropdownItems(design: any, schema: any, widgetDataSource: any, filters: any) {
    return []
  }

  createDataTable(design: any, schema: any, dataSource: any, data: any, locale: any) {
    // Create layout
    const layout = new PivotChartLayoutBuilder({ schema }).buildLayout(design, data, locale)

    return _.map(layout.rows, (row) => _.map(row.cells, (cell) => cell.text))
  }

  // Get a list of table ids that can be filtered on
  getFilterableTables(design: any, schema: any) {
    let filterableTables = design.table ? [design.table] : []

    // Get filterable tables from header and footer
    const textWidget = new TextWidget()
    filterableTables = _.union(filterableTables, textWidget.getFilterableTables(design.header, schema))
    filterableTables = _.union(filterableTables, textWidget.getFilterableTables(design.footer, schema))

    return filterableTables
  }

  // Get the chart placeholder icon. fa-XYZ or glyphicon-XYZ
  getPlaceholderIcon() {
    return "fa-magic"
  }
}
