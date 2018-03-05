_ = require 'lodash'
LayerFactory = require './LayerFactory'
ExprCompiler = require('mwater-expressions').ExprCompiler
ExprCleaner = require('mwater-expressions').ExprCleaner
ExprUtils = require('mwater-expressions').ExprUtils

# General utilities for a map


# Check if can convert to a cluster map. Only maps containing marker views can be
exports.canConvertToClusterMap = (design) ->
  return _.any(design.layerViews, (lv) -> lv.type == "Markers")

# Convert to a cluster map
exports.convertToClusterMap = (design) ->
  layerViews = _.map design.layerViews, (lv) =>
    if lv.type != "Markers"
      return lv

    lv = _.cloneDeep(lv)

    # Set type and design
    lv.type = "Cluster"
    lv.design = {
      table: lv.design.table
      axes: { geometry: lv.design.axes?.geometry }
      filter: lv.design.filter
      fillColor: lv.design.color
      minZoom: lv.design.minZoom
      maxZoom: lv.design.maxZoom
    }

    return lv

  return _.extend({}, design, layerViews: layerViews)

# Get ids of filterable tables
exports.getFilterableTables = (design, schema) ->
  filterableTables = []
  for layerView in design.layerViews
    # Create layer
    layer = LayerFactory.createLayer(layerView.type)

    # Get filterable tables
    filterableTables = _.uniq(filterableTables.concat(layer.getFilterableTables(layerView.design, schema)))

  # Remove non-existant tables
  filterableTables = _.filter(filterableTables, (table) => schema.getTable(table))

# Compile map filters with global filters
exports.getCompiledFilters = (design, schema, filterableTables) ->
  exprCompiler = new ExprCompiler(schema)
  exprCleaner = new ExprCleaner(schema)
  exprUtils = new ExprUtils(schema)

  compiledFilters = []

  # Compile filters to JsonQL expected by layers
  for table, expr of (design.filters or {})
    jsonql = exprCompiler.compileExpr(expr: expr, tableAlias: "{alias}")
    if jsonql
      compiledFilters.push({ table: table, jsonql: jsonql })

  # Add global filters
  for filter in (design.globalFilters or [])
    for table in filterableTables
      # Check if exists and is correct type
      column = schema.getColumn(table, filter.columnId)
      if not column
        continue

      columnExpr = { type: "field", table: table, column: column.id }
      if exprUtils.getExprType(columnExpr) != filter.columnType
        continue

      # Create expr
      expr = { type: "op", op: filter.op, table: table, exprs: [columnExpr].concat(filter.exprs) }

      # Clean expr
      expr = exprCleaner.cleanExpr(expr, { table: table })

      jsonql = exprCompiler.compileExpr(expr: expr, tableAlias: "{alias}")
      if jsonql
        compiledFilters.push({ table: table, jsonql: jsonql })

  return compiledFilters