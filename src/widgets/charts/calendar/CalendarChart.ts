// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let CalendarChart
import _ from "lodash"
import React from "react"
const R = React.createElement
import moment from "moment"
import { default as produce } from "immer"
import { injectTableAlias } from "mwater-expressions"
import Chart from "../Chart"
import { ExprCleaner } from "mwater-expressions"
import { ExprCompiler } from "mwater-expressions"
import AxisBuilder from "../../../axes/AxisBuilder"

/*
Design is:
  
  table: table to use for data source
  titleText: title text
  dateAxis: date axis to use
  valueAxis: axis for value
  filter: optional logical expression to filter by

*/
export default CalendarChart = class CalendarChart extends Chart {
  cleanDesign(design: any, schema: any) {
    const exprCleaner = new ExprCleaner(schema)
    const axisBuilder = new AxisBuilder({ schema })

    design = produce(design, (draft: any) => {
      // Fill in defaults
      draft.version = design.version || 1

      // Clean axes
      draft.dateAxis = axisBuilder.cleanAxis({
        axis: design.dateAxis,
        table: design.table,
        aggrNeed: "none",
        types: ["date"]
      })
      draft.valueAxis = axisBuilder.cleanAxis({
        axis: design.valueAxis,
        table: design.table,
        aggrNeed: "required",
        types: ["number"]
      })

      // Clean filter
      draft.filter = exprCleaner.cleanExpr(design.filter, { table: design.table, types: ["boolean"] })
    })
    return design
  }

  validateDesign(design: any, schema: any) {
    const axisBuilder = new AxisBuilder({ schema })

    // Check that has table
    if (!design.table) {
      return "Missing data source"
    }

    // Check that has axes
    let error = null

    if (!design.dateAxis) {
      error = error || "Missing date"
    }
    if (!design.valueAxis) {
      error = error || "Missing value"
    }

    error = error || axisBuilder.validateAxis({ axis: design.dateAxis })
    error = error || axisBuilder.validateAxis({ axis: design.valueAxis })

    return error
  }

  isEmpty(design: any) {
    return !design.dateAxis || !design.valueAxis
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
    const CalendarChartDesignerComponent = require("./CalendarChartDesignerComponent").default

    const props = {
      schema: options.schema,
      design: this.cleanDesign(options.design, options.schema),
      dataSource: options.dataSource,
      filters: options.filter,
      onDesignChange: (design: any) => {
        // Clean design
        design = this.cleanDesign(design, options.schema)
        return options.onDesignChange(design)
      }
    }
    return React.createElement(CalendarChartDesignerComponent, props)
  }

  // Get data for the chart asynchronously
  // design: design of the chart
  // schema: schema to use
  // dataSource: data source to get data from
  // filters: array of { table: table id, jsonql: jsonql condition with {alias} for tableAlias }
  // callback: (error, data)
  getData(design: any, schema: any, dataSource: any, filters: any, callback: any) {
    const exprCompiler = new ExprCompiler(schema)
    const axisBuilder = new AxisBuilder({ schema })

    // Create shell of query
    const query = {
      type: "query",
      selects: [],
      from: exprCompiler.compileTable(design.table, "main"),
      groupBy: [1],
      orderBy: [{ ordinal: 1 }],
      limit: 5000
    }

    // Add date axis
    const dateExpr = axisBuilder.compileAxis({ axis: design.dateAxis, tableAlias: "main" })

    query.selects.push({
      type: "select",
      expr: dateExpr,
      alias: "date"
    })

    // Add value axis
    query.selects.push({
      type: "select",
      expr: axisBuilder.compileAxis({ axis: design.valueAxis, tableAlias: "main" }),
      alias: "value"
    })

    // Get relevant filters
    filters = _.where(filters || [], { table: design.table })
    let whereClauses = _.map(filters, (f) => injectTableAlias(f.jsonql, "main"))

    // Compile filter
    if (design.filter) {
      whereClauses.push(exprCompiler.compileExpr({ expr: design.filter, tableAlias: "main" }))
    }

    // Add null filter for date
    whereClauses.push({ type: "op", op: "is not null", exprs: [dateExpr] })

    whereClauses = _.compact(whereClauses)

    // Wrap if multiple
    if (whereClauses.length > 1) {
      query.where = { type: "op", op: "and", exprs: whereClauses }
    } else {
      query.where = whereClauses[0]
    }

    return dataSource.performQuery(query, callback)
  }

  // Create a view element for the chart
  // Options include:
  //   schema: schema to use
  //   dataSource: dataSource to use
  //   design: design of the chart
  //   data: results from queries
  //   width, height: size of the chart view
  //   scope: current scope of the view element
  //   onScopeChange: called when scope changes with new scope
  createViewElement(options: any) {
    // Require here to prevent server require problems
    const CalendarChartViewComponent = require("./CalendarChartViewComponent").default

    // Create chart
    const props = {
      schema: options.schema,
      design: this.cleanDesign(options.design, options.schema),
      data: options.data,

      width: options.width,
      height: options.height,

      scope: options.scope,
      onScopeChange: options.onScopeChange,
      cellStrokeColor: "#DDD"
    }

    return React.createElement(CalendarChartViewComponent, props)
  }

  createDataTable(design: any, schema: any, dataSource: any, data: any) {
    const header = ["Date", "Value"]
    const rows = _.map(data, (row) => [moment(row.date).format("YYYY-MM-DD"), row.value])
    return [header].concat(rows)
  }

  // Get a list of table ids that can be filtered on
  getFilterableTables(design: any, schema: any) {
    return _.compact([design.table])
  }

  // Get the chart placeholder icon. fa-XYZ or glyphicon-XYZ
  getPlaceholderIcon() {
    return "fa-calendar"
  }
}
