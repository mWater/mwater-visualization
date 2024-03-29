import React from "react"
const R = React.createElement
import _ from "lodash"
import { DataSource, Expr, ExprCleaner, ExprCompiler, FieldExpr, Schema } from "mwater-expressions"
import { injectTableAlias } from "mwater-expressions"
import Widget, { CreateViewElementOptions } from "./Widget"
import { JsonQLQuery, JsonQLSelectQuery } from "jsonql"
import { JsonQLFilter } from ".."

/** Image widget. Design is */
export interface ImageWidgetDesign {
  /** arbitrary url of image if using url */
  imageUrl?: string | null

  /** uid of image if on server */
  uid?: string | null

  /** image or imagelist expression if using expression */
  expr?: Expr
  
  /** string caption */
  caption?: string | null

  /** optional rotation in degrees for imageUrl or uid */
  rotation?: number

  /** "top"/"bottom". Defaults to "bottom" */
  captionPosition?: "top" | "bottom"

  /** Optional URL to open when clicked */
  url?: string

  /** Opens URL in same tab if true*/
  openUrlInSameTab?: boolean
}


export default class ImageWidget extends Widget {
  // Creates a React element that is a view of the widget
  // options:
  //  schema: schema to use
  //  dataSource: data source to use
  //  widgetDataSource: Gives data to the widget in a way that allows client-server separation and secure sharing. See definition in WidgetDataSource.
  //  design: widget design
  //  scope: scope of the widget (when the widget self-selects a particular scope)
  //  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
  //  onScopeChange: called with scope of widget
  //  onDesignChange: called with new design. null/undefined for readonly
  //  width: width in pixels on screen
  //  height: height in pixels on screen
  //  singleRowTable: optional table name of table that will be filtered to have a single row present. Widget designer should optionally account for this
  createViewElement(options: CreateViewElementOptions) {
    // Put here so ImageWidget can be created on server
    const ImageWidgetComponent = require("./ImageWidgetComponent").default

    return R(ImageWidgetComponent, {
      schema: options.schema,
      dataSource: options.dataSource,
      widgetDataSource: options.widgetDataSource,
      filters: options.filters,
      design: options.design,
      onDesignChange: options.onDesignChange,
      width: options.width,
      height: options.height,
      singleRowTable: options.singleRowTable
    })
  }

  // Get the data that the widget needs. This will be called on the server, typically.
  //   design: design of the chart
  //   schema: schema to use
  //   dataSource: data source to get data from
  //   filters: array of { table: table id, jsonql: jsonql condition with {alias} for tableAlias }
  //   callback: (error, data)
  getData(design: ImageWidgetDesign, schema: Schema, dataSource: DataSource, filters: JsonQLFilter[], callback: any) {
    if (!design.expr) {
      return callback(null)
    }

    const exprCleaner = new ExprCleaner(schema)
    const expr = exprCleaner.cleanExpr(design.expr)
    if (!expr) {
      return callback(null)
    }

    const { table } = (design.expr as FieldExpr)
    const exprCompiler = new ExprCompiler(schema)
    const imageExpr = exprCompiler.compileExpr({ expr , tableAlias: "main" })

    // Get distinct to only show if single row match
    const query: JsonQLSelectQuery = {
      type: "query",
      distinct: true,
      selects: [{ type: "select", expr: imageExpr, alias: "value" }],
      from: { type: "table", table, alias: "main" },
      limit: 2
    }

    // Get relevant filters
    filters = _.where(filters || [], { table })
    let whereClauses = _.map(filters, (f) => injectTableAlias(f.jsonql, "main"))

    whereClauses.push({ type: "op", op: "is not null", exprs: [imageExpr] })
    whereClauses = _.compact(whereClauses)

    // Wrap if multiple
    if (whereClauses.length > 1) {
      query.where = { type: "op", op: "and", exprs: whereClauses }
    } else {
      query.where = whereClauses[0]
    }

    // Execute query
    dataSource.performQuery(query, (error: any, rows: any) => {
      if (error) {
        callback(error)
      } else {
        // If multiple, use null
        if (rows.length !== 1) {
          return callback(null, null)
        } else {
          // Make sure is not string
          let { value } = rows[0]
          if (_.isString(rows[0].value)) {
            value = JSON.parse(rows[0].value)
          }

          callback(null, value)
        }
      }
    })
  }

  // Determine if widget is auto-height, which means that a vertical height is not required.
  isAutoHeight() {
    return false
  }

  // Get a list of table ids that can be filtered on
  getFilterableTables(design: any, schema: Schema) {
    if (design.expr?.table) {
      return [design.expr.table]
    }

    return []
  }
}
