import _ from "lodash"
import { Expr, ExprCleaner, ExprCompiler, ExprUtils, FieldExpr, Schema } from "mwater-expressions"
import { JsonQLFilter } from ".."
import LayoutManager from "../layouts/LayoutManager"
import WidgetFactory from "../widgets/WidgetFactory"
import { DashboardDesign } from "./DashboardDesign"

/** Gets filterable tables for a dashboard */
export function getFilterableTables(design: DashboardDesign, schema: Schema) {
  const layoutManager = LayoutManager.createLayoutManager(design.layout)

  // Get filterable tables
  let filterableTables: string[] = []
  for (let widgetItem of layoutManager.getAllWidgets(design.items)) {
    // Create widget
    const widget = WidgetFactory.createWidget(widgetItem.type)

    // Get filterable tables
    filterableTables = filterableTables.concat(widget.getFilterableTables(widgetItem.design, schema))
  }

  // Remove non-existant tables
  filterableTables = _.filter(_.uniq(filterableTables), (table) => schema.getTable(table))

  return filterableTables
}

/** Get filters from props filters combined with dashboard filters */
export function getCompiledFilters(design: DashboardDesign, schema: Schema, filterableTables: string[]): JsonQLFilter[] {
  let expr: Expr, jsonql, table
  const exprCompiler = new ExprCompiler(schema)
  const exprCleaner = new ExprCleaner(schema)
  const exprUtils = new ExprUtils(schema)

  const compiledFilters = []

  // Compile filters to JsonQL expected by widgets
  const object = design.filters || {}
  for (table in object) {
    // Clean expression first TODO remove this when dashboards are properly cleaned before being rendered
    expr = object[table]
    expr = exprCleaner.cleanExpr(expr, { table })

    jsonql = exprCompiler.compileExpr({ expr, tableAlias: "{alias}" })
    if (jsonql) {
      compiledFilters.push({ table, jsonql })
    }
  }

  // Add global filters
  for (let filter of design.globalFilters || []) {
    for (table of filterableTables) {
      // Check if exists and is correct type
      const column = schema.getColumn(table, filter.columnId)
      if (!column) {
        continue
      }

      const columnExpr: FieldExpr = { type: "field", table, column: column.id }
      if (exprUtils.getExprType(columnExpr) !== filter.columnType) {
        continue
      }

      // Create expr
      expr = { type: "op", op: filter.op, table, exprs: [columnExpr as Expr].concat(filter.exprs) }

      // Clean expr
      expr = exprCleaner.cleanExpr(expr, { table })

      jsonql = exprCompiler.compileExpr({ expr, tableAlias: "{alias}" })
      if (jsonql) {
        compiledFilters.push({ table, jsonql })
      }
    }
  }

  return compiledFilters
}
