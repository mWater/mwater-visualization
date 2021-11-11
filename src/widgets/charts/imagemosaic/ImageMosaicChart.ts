import _ from "lodash"
import React from "react"
const R = React.createElement
import { default as produce } from "immer"
import { DataSource, injectTableAlias, Schema } from "mwater-expressions"
import Chart from "../Chart"
import { ExprCleaner } from "mwater-expressions"
import { ExprCompiler } from "mwater-expressions"
import AxisBuilder from "../../../axes/AxisBuilder"
import { JsonQLSelectQuery } from "jsonql"
import { JsonQLFilter } from "../../.."

/*
Design is:
  
  table: table to use for data source
  titleText: title text
  imageAxis: image axis to use
  filter: optional logical expression to filter by

*/
export default class ImageMosaicChart extends Chart {
  cleanDesign(design: any, schema: Schema) {
    const exprCleaner = new ExprCleaner(schema)
    const axisBuilder = new AxisBuilder({ schema })

    design = produce(design, (draft: any) => {
      // Fill in defaults
      draft.version = design.version || 1

      // Clean axis
      draft.imageAxis = axisBuilder.cleanAxis({
        axis: design.imageAxis,
        table: design.table,
        aggrNeed: "none",
        types: ["image", "imagelist"]
      })

      // Clean filter
      draft.filter = exprCleaner.cleanExpr(design.filter, { table: design.table, types: ["boolean"] })
    })
    return design
  }

  validateDesign(design: any, schema: Schema) {
    const axisBuilder = new AxisBuilder({ schema })

    // Check that has table
    if (!design.table) {
      return "Missing data source"
    }

    // Check that has axes
    let error = null

    if (!design.imageAxis) {
      error = error || "Missing image"
    }

    error = error || axisBuilder.validateAxis({ axis: design.imageAxis })

    return error
  }

  isEmpty(design: any) {
    return !design.imageAxis
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
    const ImageMosaicChartDesignerComponent = require("./ImageMosaicChartDesignerComponent").default

    const props = {
      schema: options.schema,
      design: this.cleanDesign(options.design, options.schema),
      dataSource: options.dataSource,
      filters: options.filters,
      onDesignChange: (design: any) => {
        // Clean design
        design = this.cleanDesign(design, options.schema)
        return options.onDesignChange(design)
      }
    }
    return React.createElement(ImageMosaicChartDesignerComponent, props)
  }

  // Get data for the chart asynchronously
  // design: design of the chart
  // schema: schema to use
  // dataSource: data source to get data from
  // filters: array of { table: table id, jsonql: jsonql condition with {alias} for tableAlias }
  // callback: (error, data)
  getData(design: any, schema: Schema, dataSource: DataSource, filters: JsonQLFilter[] | null, callback: any) {
    const exprCompiler = new ExprCompiler(schema)
    const axisBuilder = new AxisBuilder({ schema })

    // Create shell of query
    const query: JsonQLSelectQuery = {
      type: "query",
      selects: [],
      from: exprCompiler.compileTable(design.table, "main"),
      limit: 500
    }

    // Add image axis
    const imageExpr = axisBuilder.compileAxis({ axis: design.imageAxis, tableAlias: "main" })

    query.selects.push({
      type: "select",
      expr: imageExpr,
      alias: "image"
    })

    // Add primary key
    query.selects.push({
      type: "select",
      expr: { type: "field", tableAlias: "main", column: schema.getTable(design.table)!.primaryKey },
      alias: "id"
    })

    // Get relevant filters
    filters = _.where(filters || [], { table: design.table })
    let whereClauses = _.map(filters, (f) => injectTableAlias(f.jsonql, "main"))

    // Compile filter
    if (design.filter) {
      whereClauses.push(exprCompiler.compileExpr({ expr: design.filter, tableAlias: "main" }))
    }

    // Add null filter for image
    whereClauses.push({ type: "op", op: "is not null", exprs: [imageExpr] })

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
  //   onRowClick: Called with (tableId, rowId) when item is clicked
  createViewElement(options: any) {
    // Require here to prevent server require problems
    const ImageMosaicChartViewComponent = require("./ImageMosaicChartViewComponent").default

    // Create chart
    const props = {
      schema: options.schema,
      design: this.cleanDesign(options.design, options.schema),
      data: options.data,
      dataSource: options.dataSource,

      width: options.width,
      height: options.height,

      scope: options.scope,
      onScopeChange: options.onScopeChange,
      onRowClick: options.onRowClick
    }

    return React.createElement(ImageMosaicChartViewComponent, props)
  }

  createDataTable(design: any, schema: Schema, dataSource: DataSource, data: any) {
    alert("Not available for Image Mosaics")
    return null
  }
  // TODO
  // renderHeaderCell = (column) =>
  //   column.headerText or @axisBuilder.summarizeAxis(column.textAxis)

  // header = _.map(design.columns, renderHeaderCell)
  // table = [header]
  // renderRow = (record) =>
  //   renderCell = (column, columnIndex) =>
  //     value = record["c#{columnIndex}"]
  //     return @axisBuilder.formatValue(column.textAxis, value)

  //   return _.map(design.columns, renderCell)

  // table = table.concat(_.map(data.main, renderRow))
  // return table

  // Get a list of table ids that can be filtered on
  getFilterableTables(design: any, schema: Schema) {
    return _.compact([design.table])
  }

  // Get the chart placeholder icon. fa-XYZ or glyphicon-XYZ
  getPlaceholderIcon() {
    return "fa-th"
  }
}
