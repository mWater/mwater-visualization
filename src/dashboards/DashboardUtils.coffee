_ = require 'lodash'
LayoutManager = require '../layouts/LayoutManager'
WidgetFactory = require '../widgets/WidgetFactory'
ExprCompiler = require('mwater-expressions').ExprCompiler
ExprCleaner = require('mwater-expressions').ExprCleaner
ExprUtils = require('mwater-expressions').ExprUtils

module.exports = class DashboardUtils
  # Gets filterable tables for a dashboard
  @getFilterableTables: (design, schema) ->
    layoutManager = LayoutManager.createLayoutManager(design.layout)

    # Get filterable tables
    filterableTables = []
    for widgetItem in layoutManager.getAllWidgets(design.items)
      # Create widget
      widget = WidgetFactory.createWidget(widgetItem.type)

      # Get filterable tables
      filterableTables = filterableTables.concat(widget.getFilterableTables(widgetItem.design, schema))

    # Remove non-existant tables
    filterableTables = _.filter(_.uniq(filterableTables), (table) => schema.getTable(table))

    return filterableTables

  # Get filters from props filters combined with dashboard filters
  @getCompiledFilters: (design, schema, filterableTables) ->
    exprCompiler = new ExprCompiler(schema)
    exprCleaner = new ExprCleaner(schema)
    exprUtils = new ExprUtils(schema)

    compiledFilters = []

    # Compile filters to JsonQL expected by widgets
    for table, expr of (design.filters or {})
      # Clean expression first TODO remove this when dashboards are properly cleaned before being rendered
      expr = exprCleaner.cleanExpr(expr, { table: table })

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
