// General utilities for a map

import _ from "lodash"
import { Expr, ExprCleaner, ExprCompiler, ExprUtils, FieldExpr, Schema } from "mwater-expressions"
import LayerFactory from "./LayerFactory"
import { MapDesign } from "./MapDesign"

// Check if can convert to a cluster map. Only maps containing marker views can be
export function canConvertToClusterMap(design: MapDesign) {
  return _.any(design.layerViews, lv => lv.type === "Markers")
}

// Convert to a cluster map
export function convertToClusterMap(design: MapDesign) {
  const layerViews = _.map(design.layerViews, lv => {
    if (lv.type !== "Markers") {
      return lv
    }

    lv = _.cloneDeep(lv)

    // Set type and design
    lv.type = "Cluster"
    lv.design = {
      table: lv.design.table,
      axes: { geometry: (lv.design.axes != null ? lv.design.axes.geometry : undefined) },
      filter: lv.design.filter,
      fillColor: lv.design.color,
      minZoom: lv.design.minZoom,
      maxZoom: lv.design.maxZoom
    }

    return lv
  })

  return _.extend({}, design, {layerViews})
}

// Get ids of filterable tables
export function getFilterableTables(design: MapDesign, schema: Schema) {
  let filterableTables: string[] = []
  for (let layerView of design.layerViews) {
    // Create layer
    const layer = LayerFactory.createLayer(layerView.type)

    // Get filterable tables
    filterableTables = _.uniq(filterableTables.concat(layer.getFilterableTables(layerView.design, schema)))
  }

  // Remove non-existant tables
  filterableTables = _.filter(filterableTables, table => schema.getTable(table))
  return filterableTables
}

// Compile map filters with global filters
export function getCompiledFilters(design: MapDesign, schema: Schema, filterableTables: string[]) {
  const exprCompiler = new ExprCompiler(schema)
  const exprCleaner = new ExprCleaner(schema)
  const exprUtils = new ExprUtils(schema)

  const compiledFilters = []

  // Compile filters to JsonQL expected by layers
  for (const table in design.filters || {}) {
    const expr = design.filters[table]
    const jsonql = exprCompiler.compileExpr({expr, tableAlias: "{alias}"})
    if (jsonql) {
      compiledFilters.push({ table, jsonql })
    }
  }

  // Add global filters
  for (let filter of (design.globalFilters || [])) {
    for (const table of filterableTables) {
      // Check if exists and is correct type
      const column = schema.getColumn(table, filter.columnId)
      if (!column) {
        continue
      }

      const columnExpr: Expr = { type: "field", table, column: column.id }
      if (exprUtils.getExprType(columnExpr) !== filter.columnType) {
        continue
      }

      // Create expr
      let expr: Expr = { type: "op", op: filter.op, table, exprs: [columnExpr as Expr].concat(filter.exprs) }

      // Clean expr
      expr = exprCleaner.cleanExpr(expr, { table })

      const jsonql = exprCompiler.compileExpr({expr, tableAlias: "{alias}"})
      if (jsonql) {
        compiledFilters.push({ table, jsonql })
      }
    }
  }

  return compiledFilters
}