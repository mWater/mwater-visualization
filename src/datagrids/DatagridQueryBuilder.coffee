_ = require 'lodash'
ExprCompiler = require("mwater-expressions").ExprCompiler
ExprCleaner = require("mwater-expressions").ExprCleaner
ExprUtils = require("mwater-expressions").ExprUtils
injectTableAlias = require('mwater-expressions').injectTableAlias

# Builds a datagrid query. 
# columns are named c0, c1, c2...
# primary key is included as id
# subtable index is included as subtable. -1 for main table so it sorts first
# Warning: mwater-server requires this directly!
module.exports = class DatagridQueryBuilder 
  constructor: (schema) ->
    @schema = schema

  # Create the query for the design
  # options:
  #  offset: start at row offset
  #  limit: limit rows
  #  extraFilters: array of additional filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. }
  #  fillSubtableRows: repeat main level values in subtable rows instead of leaving blank
  createQuery: (design, options = {}) ->
    # Create query to get the page of rows at the specific offset
    # Handle simple case
    if not design.subtables or design.subtables.length == 0
      return @createSimpleQuery(design, options)
    else
      return @createComplexQuery(design, options)

  # Simple query with no subtables
  createSimpleQuery: (design, options) ->
    exprUtils = new ExprUtils(@schema)
    exprCompiler = new ExprCompiler(@schema)
    exprCleaner = new ExprCleaner(@schema)

    isAggr = @isMainAggr(design)

    query = {
      type: "query"
      selects: @createSimpleSelects(design, isAggr)
      from: { type: "table", table: design.table, alias: "main" }
      orderBy: []
      offset: options.offset
      limit: options.limit
    }

    # Filter by filter
    wheres = []
    if design.filter
      wheres.push(exprCompiler.compileExpr(expr: design.filter, tableAlias: "main"))

    # Add global filters
    for filter in (design.globalFilters or [])
      # Check if exists and is correct type
      column = @schema.getColumn(design.table, filter.columnId)
      if not column
        continue

      columnExpr = { type: "field", table: design.table, column: column.id }
      if exprUtils.getExprType(columnExpr) != filter.columnType
        continue

      # Create expr
      expr = { type: "op", op: filter.op, table: design.table, exprs: [columnExpr].concat(filter.exprs) }

      # Clean expr
      expr = exprCleaner.cleanExpr(expr, { table: design.table })

      wheres.push(exprCompiler.compileExpr(expr: expr, tableAlias: "main"))

    # Add extra filters
    for extraFilter in (options.extraFilters or [])
      if extraFilter.table == design.table
        wheres.push(injectTableAlias(extraFilter.jsonql, "main"))

    wheres = _.compact(wheres)

    if wheres.length == 1
      query.where = wheres[0]
    else if wheres.length > 1
      query.where = { type: "op", op: "and", exprs: wheres }

    # Add order of main
    for direction, i in @getMainOrderByDirections(design, isAggr)
      # Leave room for primary key (if not aggr) and columns
      query.orderBy.push({ ordinal: i + (if isAggr then 1 else 2) + design.columns.length, direction: direction })

    # Add group bys if any expressions are individual and overall is aggregate
    if isAggr
      query.groupBy = []

      for column, i in design.columns
        if exprUtils.getExprAggrStatus(column.expr) == "individual"
          query.groupBy.push(i + 1)

      for orderBy, i in design.orderBys or []
        if exprUtils.getExprAggrStatus(orderBy.expr) == "individual"
          query.groupBy.push(i + 1 + design.columns.length)

    return query 

  # Query with subtables
  createComplexQuery: (design, options) ->
    # Queries to union
    unionQueries = []

    # Create main query
    unionQueries.push(@createComplexMainQuery(design, options))

    for subtable, index in design.subtables
      unionQueries.push(@createComplexSubtableQuery(design, options, subtable, index))

    # Union together
    unionQuery = {
      type: "union all"
      queries: unionQueries
    }

    # Create wrapper query that orders
    query = {
      type: "query"
      selects: [
        { type: "select", expr: { type: "field", tableAlias: "unioned", column: "id" }, alias: "id" }
        { type: "select", expr: { type: "field", tableAlias: "unioned", column: "subtable" }, alias: "subtable" }
      ]
      from: { type: "subquery", query: unionQuery, alias: "unioned" }
      orderBy: []
      offset: options.offset
      limit: options.limit
    }

    # Add column references
    for column, index in design.columns
      query.selects.push({ type: "select", expr: { type: "field", tableAlias: "unioned", column: "c#{index}" }, alias: "c#{index}" })

    # Add order of main
    for direction, i in @getMainOrderByDirections(design)
      query.orderBy.push({ expr: { type: "field", tableAlias: "unioned", column: "s#{i}" }, direction: direction })

    # Add subtable order
    query.orderBy.push({ expr: { type: "field", tableAlias: "unioned", column: "subtable" }, direction: "asc" })

    # Add orders of subtables
    for subtable, stindex in design.subtables
      for direction, i in @getSubtableOrderByDirections(design, subtable)
        query.orderBy.push({ expr: { type: "field", tableAlias: "unioned", column: "st#{stindex}s#{i}" }, direction: direction })

    return query

  # Create the main query (not joined to subtables) part of the overall complex query. See tests for more details
  createComplexMainQuery: (design, options) ->
    exprCompiler = new ExprCompiler(@schema)
    exprCleaner = new ExprCleaner(@schema)

    # Create selects
    selects = [
      # Primary key
      { type: "select", expr: { type: "field", tableAlias: "main", column: @schema.getTable(design.table).primaryKey }, alias: "id" }
      { type: "select", expr: -1, alias: "subtable" }
    ]

    # Add order bys of main
    for expr, i in @getMainOrderByExprs(design)
      selects.push({ type: "select", expr: expr, alias: "s#{i}" })

    # Add order bys of subtables
    for subtable, stindex in design.subtables
      for type, i in @getSubtableOrderByExprTypes(design, subtable)
        selects.push({ type: "select", expr: @createNullExpr(type), alias: "st#{stindex}s#{i}" })

    # Add columns
    selects = selects.concat(_.map(design.columns, (column, columnIndex) => @createColumnSelect(column, columnIndex)))

    query = {
      type: "query"
      selects: selects
      from: { type: "table", table: design.table, alias: "main" }
    }

    # Filter by filter
    wheres = []
    if design.filter
      wheres.push(exprCompiler.compileExpr(expr: design.filter, tableAlias: "main"))

    # Add global filters
    for filter in (design.globalFilters or [])
      # Check if exists and is correct type
      column = @schema.getColumn(design.table, filter.columnId)
      if not column
        continue

      columnExpr = { type: "field", table: design.table, column: column.id }
      if exprUtils.getExprType(columnExpr) != filter.columnType
        continue

      # Create expr
      expr = { type: "op", op: filter.op, table: design.table, exprs: [columnExpr].concat(filter.exprs) }

      # Clean expr
      expr = exprCleaner.cleanExpr(expr, { table: design.table })

      wheres.push(exprCompiler.compileExpr(expr: expr, tableAlias: "main"))

    # Add extra filters
    for extraFilter in (options.extraFilters or [])
      if extraFilter.table == design.table
        wheres.push(injectTableAlias(extraFilter.jsonql, "main"))

    wheres = _.compact(wheres)

    if wheres.length == 1
      query.where = wheres[0]
    else if wheres.length > 1
      query.where = { type: "op", op: "and", exprs: wheres }

    return query

  # Create one subtable query part of the overall complex query. See tests for more details
  createComplexSubtableQuery: (design, options, subtable, subtableIndex) ->
    exprUtils = new ExprUtils(@schema)
    exprCompiler = new ExprCompiler(@schema)

    # Create selects
    selects = [
      # Primary key
      { type: "select", expr: { type: "field", tableAlias: "main", column: @schema.getTable(design.table).primaryKey }, alias: "id" }
      { type: "select", expr: subtableIndex, alias: "subtable" }
    ]

    # Add order bys of main
    for expr, i in @getMainOrderByExprs(design)
      selects.push({ type: "select", expr: expr, alias: "s#{i}" })

    # Add order bys of subtables
    for st, stindex in design.subtables
      for expr, i in @getSubtableOrderByExprs(design, st)
        if stindex == subtableIndex
          selects.push({ type: "select", expr: expr, alias: "st#{stindex}s#{i}" })
        else
          # Null placeholder
          types = @getSubtableOrderByExprTypes(design, st)
          selects.push({ type: "select", expr: @createNullExpr(types[i]), alias: "st#{stindex}s#{i}" })

    # Add columns
    selects = selects.concat(_.map(design.columns, (column, columnIndex) => @createColumnSelect(column, columnIndex, subtable, options.fillSubtableRows)))

    # Get subtable actual table
    subtableTable = exprUtils.followJoins(design.table, subtable.joins)

    # Can't handle multiple joins yet
    if subtable.joins.length > 1
      throw new Error("Multiple subtable joins not implemented")

    query = {
      type: "query"
      selects: selects
      from: {
        type: "join"
        kind: "inner"
        left: { type: "table", table: design.table, alias: "main" }
        right: { type: "table", table: subtableTable, alias: "st" }
        on: exprCompiler.compileJoin(@schema.getColumn(design.table, subtable.joins[0]).join, "main", "st")
      }
    }

    # Filter by filter
    wheres = []
    if design.filter
      wheres.push(exprCompiler.compileExpr(expr: design.filter, tableAlias: "main"))

    # Add extra filters
    for extraFilter in (options.extraFilters or [])
      if extraFilter.table == design.table
        wheres.push(injectTableAlias(extraFilter.jsonql, "main"))
      if extraFilter.table == subtableTable
        wheres.push(injectTableAlias(extraFilter.jsonql, "st"))

    wheres = _.compact(wheres)

    if wheres.length == 1
      query.where = wheres[0]
    else if wheres.length > 1
      query.where = { type: "op", op: "and", exprs: wheres }

    return query

  # Get expressions to order main query by
  # isAggr is true if any column or ordering is aggregate. 
  # If so, only use explicit ordering
  getMainOrderByExprs: (design, isAggr = false) ->
    exprCompiler = new ExprCompiler(@schema)

    exprs = []
  
    # First explicit order bys
    for orderBy in design.orderBys or []
      exprs.push(exprCompiler.compileExpr(expr: orderBy.expr, tableAlias: "main"))

    if not isAggr
      # Natural order if present
      ordering = @schema.getTable(design.table).ordering
      if ordering
        exprs.push(exprCompiler.compileExpr(expr: { type: "field", table: design.table, column: ordering }, tableAlias: "main"))

      # Always primary key
      exprs.push({ type: "field", tableAlias: "main", column: @schema.getTable(design.table).primaryKey })

    return exprs

  # Get directions to order main query by (asc/desc)
  # isAggr is true if any column or ordering is aggregate. 
  # If so, only use explicit ordering
  getMainOrderByDirections: (design, isAggr = false) ->
    directions = []

    # First explicit order bys
    for orderBy in design.orderBys or []
      directions.push(orderBy.direction)

    if not isAggr
      # Natural order if present
      ordering = @schema.getTable(design.table).ordering
      if ordering
        directions.push("asc")

      # Always primary key
      directions.push("asc")

    return directions

  # Get expressions to order subtable query by
  getSubtableOrderByExprs: (design, subtable) ->
    exprUtils = new ExprUtils(@schema)
    exprCompiler = new ExprCompiler(@schema)

    # Get subtable actual table
    subtableTable = exprUtils.followJoins(design.table, subtable.joins)

    exprs = []

    # First explicit order bys
    for orderBy in subtable.orderBys or []
      exprs.push(exprCompiler.compileExpr(expr: orderBy.expr, tableAlias: "st"))
  
    # Natural order if present
    ordering = @schema.getTable(subtableTable).ordering
    if ordering
      exprs.push(exprCompiler.compileExpr(expr: { type: "field", table: subtableTable, column: ordering }, tableAlias: "st"))

    # Always primary key
    exprs.push({ type: "field", tableAlias: "st", column: @schema.getTable(subtableTable).primaryKey })
    return exprs

  # Get directions to order subtable query by (asc/desc)
  getSubtableOrderByDirections: (design, subtable) ->
    exprUtils = new ExprUtils(@schema)

    # Get subtable actual table
    subtableTable = exprUtils.followJoins(design.table, subtable.joins)

    directions = []

    # First explicit order bys
    for orderBy in subtable.orderBys or []
      directions.push(orderBy.direction)
  
    # Natural order if present
    ordering = @schema.getTable(subtableTable).ordering
    if ordering
      directions.push("asc")

    # Always primary key
    directions.push("asc")
    return directions

  # Get types of expressions to order subtable query by.
  getSubtableOrderByExprTypes: (design, subtable) ->
    exprUtils = new ExprUtils(@schema)

    # Get subtable actual table
    subtableTable = exprUtils.followJoins(design.table, subtable.joins)

    types = []

    # First explicit order bys
    for orderBy in subtable.orderBys or []
      types.push(exprUtils.getExprType(orderBy.expr))
  
    # Natural order if present
    ordering = @schema.getTable(subtableTable).ordering
    if ordering
      types.push(exprUtils.getExprType({ type: "field", table: subtableTable, column: ordering }))

    # Always primary key. Assume text
    types.push("text")

    return types

  # Create the select for a column in JsonQL format
  createColumnSelect: (column, columnIndex, subtable, fillSubtableRows) ->
    exprUtils = new ExprUtils(@schema)
    exprCleaner = new ExprCleaner(@schema)
    
    # Get expression type
    exprType = exprUtils.getExprType(column.expr)

    # Null if wrong subtable
    if column.subtable and not subtable
      return { type: "select", expr: @createNullExpr(exprType), alias: "c#{columnIndex}" }

    # Null if from wrong subtable 
    if column.subtable and subtable 
      if subtable.id != column.subtable
        return { type: "select", expr: @createNullExpr(exprType), alias: "c#{columnIndex}" }

    # Null if main column and in subtable and not fillSubtableRows
    if not column.subtable and subtable and not fillSubtableRows
      return { type: "select", expr: @createNullExpr(exprType), alias: "c#{columnIndex}" }

    # Compile expression
    exprCompiler = new ExprCompiler(@schema)
    compiledExpr = exprCompiler.compileExpr(expr: exprCleaner.cleanExpr(column.expr, aggrStatuses: ["individual", "literal", "aggregate"]), tableAlias: if column.subtable then "st" else "main")

    # Handle special case of geometry, converting to GeoJSON
    if exprType == "geometry"
      # Convert to 4326 (lat/long). Force ::geometry for null
      compiledExpr = { type: "op", op: "ST_AsGeoJSON", exprs: [{ type: "op", op: "ST_Transform", exprs: [{ type: "op", op: "::geometry", exprs: [compiledExpr]}, 4326] }] }

    return { type: "select", expr: compiledExpr, alias: "c#{columnIndex}" }

  # Create selects to load given a design
  createSimpleSelects: (design, isAggr) ->
    selects = []

    # Primary key if not aggr
    if not isAggr
      selects.push({ type: "select", expr: { type: "field", tableAlias: "main", column: @schema.getTable(design.table).primaryKey }, alias: "id" })
    
    selects = selects.concat(_.map(design.columns, (column, columnIndex) => @createColumnSelect(column, columnIndex)))

    # Add sorting
    for expr, i in @getMainOrderByExprs(design, isAggr)
      selects.push({ type: "select", expr: expr, alias: "s#{i}" })

    return selects

  # Create a null expression, but cast to correct type. See https://github.com/mWater/mwater-visualization/issues/183
  createNullExpr: (exprType) ->
    switch exprType
      # Geometry is as textual geojson
      when "text", "enum", "geometry", "id", "date", "datetime"
        return { type: "op", op: "::text", exprs: [null] } 
      when "boolean"
        return { type: "op", op: "::boolean", exprs: [null] } 
      when "number"
        return { type: "op", op: "::decimal", exprs: [null] } 
      when "enumset", "text[]", "image", "imagelist"
        return { type: "op", op: "::jsonb", exprs: [null] } 
      else
        return null

  # Determine if main is aggregate
  isMainAggr: (design) ->
    exprUtils = new ExprUtils(@schema)

    for column in design.columns
      if exprUtils.getExprAggrStatus(column.expr) == "aggregate"
        return true

    for orderBy in design.orderBys or []
      if exprUtils.getExprAggrStatus(orderBy.expr) == "aggregate"
        return true

    return false
