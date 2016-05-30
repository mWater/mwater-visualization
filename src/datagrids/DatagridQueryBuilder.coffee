_ = require 'lodash'
ExprCompiler = require("mwater-expressions").ExprCompiler
ExprUtils = require("mwater-expressions").ExprUtils

# Builds a datagrid query. 
# columns are named c0, c1, c2...
# primary key is included as id
# subtable index is included as subtable. -1 for main table so it sorts first
# Warning: mwater-server requires this directly!
module.exports = class DatagridQueryBuilder 
  constructor: (schema) ->
    @schema = schema

  # Create the query, starting at row offset for limit rows
  createQuery: (design, offset, limit) ->
    # Create query to get the page of rows at the specific offset
    design = design
    exprCompiler = new ExprCompiler(@schema)

    # Handle simple case
    if not design.subtables or design.subtables.length == 0
      return @createSimpleQuery(design, offset, limit)
    else
      return @createComplexQuery(design, offset, limit)

  # Simple query with no subtables
  createSimpleQuery: (design, offset, limit) ->
    query = {
      type: "query"
      selects: @createLoadSelects(design)
      from: { type: "table", table: design.table, alias: "main" }
      orderBy: []
      offset: offset
      limit: limit
    }

    # Filter by filter
    if design.filter
      query.where = exprCompiler.compileExpr(expr: design.filter, tableAlias: "main")

    # Add sorts of main
    for expr, i in @getMainSortExprs(design)
      query.orderBy.push({ expr: expr })

    for direction, i in @getMainSortDirections(design)
      query.orderBy[i].direction = direction

    return query

  # Simple query with no subtables
  createComplexQuery: (design, offset, limit) ->
    # Queries to union
    unionQueries = []

    # Create main query
    unionQueries.push(@createComplexMainQuery(design))

    for subtable, index in design.subtables
      unionQueries.push(@createComplexSubtableQuery(design, subtable, index))

    # Union together
    unionQuery = {
      type: "union all"
      queries: unionQueries
    }

    # Create wrapper query that sorts
    query = {
      type: "query"
      selects: [
        { type: "select", expr: { type: "field", tableAlias: "unioned", column: "id" }, alias: "id" }
        { type: "select", expr: { type: "field", tableAlias: "unioned", column: "subtable" }, alias: "subtable" }
      ]
      from: { type: "subquery", query: unionQuery, alias: "unioned" }
      orderBy: []
      offset: offset
      limit: limit
    }

    # Add column references
    for column, index in design.columns
      query.selects.push({ type: "select", expr: { type: "field", tableAlias: "unioned", column: "c#{index}" }, alias: "c#{index}" })

    # Add sorts of main
    for direction, i in @getMainSortDirections(design)
      query.orderBy.push({ expr: { type: "field", tableAlias: "unioned", column: "s#{i}" }, direction: direction })

    # Add subtable sort
    query.orderBy.push({ expr: { type: "field", tableAlias: "unioned", column: "subtable" }, direction: "asc" })

    # Add sorts of subtables
    for subtable, stindex in design.subtables
      for direction, i in @getSubtableSortDirections(design, subtable)
        query.orderBy.push({ expr: { type: "field", tableAlias: "unioned", column: "st#{stindex}s#{i}" }, direction: direction })

    return query

  # Create the main query (not joined to subtables) part of the overall complex query. See tests for more details
  createComplexMainQuery: (design) ->
    # Create selects
    selects = [
      # Primary key
      { type: "select", expr: { type: "field", tableAlias: "main", column: @schema.getTable(design.table).primaryKey }, alias: "id" }
      { type: "select", expr: -1, alias: "subtable" }
    ]

    # Add sorts of main
    for expr, i in @getMainSortExprs(design)
      selects.push({ type: "select", expr: expr, alias: "s#{i}" })

    # Add sorts of subtables
    for subtable, stindex in design.subtables
      for expr, i in @getSubtableSortExprs(design, subtable)
        selects.push({ type: "select", expr: null, alias: "st#{stindex}s#{i}" })

    # Add columns
    selects = selects.concat(_.map(design.columns, (column, columnIndex) => @createColumnSelect(column, columnIndex)))

    query = {
      type: "query"
      selects: selects
      from: { type: "table", table: design.table, alias: "main" }
    }

    # Filter by filter
    if design.filter
      query.where = exprCompiler.compileExpr(expr: design.filter, tableAlias: "main")

    return query

  # Create one subtable query part of the overall complex query. See tests for more details
  createComplexSubtableQuery: (design, subtable, subtableIndex) ->
    exprUtils = new ExprUtils(@schema)
    exprCompiler = new ExprCompiler(@schema)

    # Create selects
    selects = [
      # Primary key
      { type: "select", expr: { type: "field", tableAlias: "main", column: @schema.getTable(design.table).primaryKey }, alias: "id" }
      { type: "select", expr: subtableIndex, alias: "subtable" }
    ]

    # Add sorts of main
    for expr, i in @getMainSortExprs(design)
      selects.push({ type: "select", expr: expr, alias: "s#{i}" })

    # Add sorts of subtables
    for subtable, stindex in design.subtables
      for expr, i in @getSubtableSortExprs(design, subtable)
        selects.push({ type: "select", expr: expr, alias: "st#{stindex}s#{i}" })

    # Add columns
    selects = selects.concat(_.map(design.columns, (column, columnIndex) => @createColumnSelect(column, columnIndex, subtable)))

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
    if design.filter
      query.where = exprCompiler.compileExpr(expr: design.filter, tableAlias: "main")

    return query

  # Get expressions to sort main query by
  getMainSortExprs: (design) ->
    exprs = []
  
    # Natural order if present
    ordering = @schema.getTable(design.table).ordering
    if ordering
      exprs.push({ type: "field", tableAlias: "main", column: ordering })

    # Always primary key
    exprs.push({ type: "field", tableAlias: "main", column: @schema.getTable(design.table).primaryKey })
    return exprs

  # Get directions to sort main query by (asc/desc)
  getMainSortDirections: (design) ->
    directions = []
  
    # Natural order if present
    ordering = @schema.getTable(design.table).ordering
    if ordering
      directions.push("asc")

    # Always primary key
    directions.push("asc")
    return directions

  # Get expressions to sort subtable query by
  getSubtableSortExprs: (design, subtable) ->
    exprUtils = new ExprUtils(@schema)

    # Get subtable actual table
    subtableTable = exprUtils.followJoins(design.table, subtable.joins)

    exprs = []
  
    # Natural order if present
    ordering = @schema.getTable(subtableTable).ordering
    if ordering
      exprs.push({ type: "field", tableAlias: "st", column: ordering })

    # Always primary key
    exprs.push({ type: "field", tableAlias: "st", column: @schema.getTable(subtableTable).primaryKey })
    return exprs

  # Get directions to sort subtable query by (asc/desc)
  getSubtableSortDirections: (design, subtable) ->
    exprUtils = new ExprUtils(@schema)

    # Get subtable actual table
    subtableTable = exprUtils.followJoins(design.table, subtable.joins)

    directions = []
  
    # Natural order if present
    ordering = @schema.getTable(subtableTable).ordering
    if ordering
      directions.push("asc")

    # Always primary key
    directions.push("asc")
    return directions

  # Create the select for a column in JsonQL format
  createColumnSelect: (column, columnIndex, subtable) ->
    # Null if wrong subtable
    if column.subtable and not subtable
      return { type: "select", expr: null, alias: "c#{columnIndex}" }

    if column.subtable and subtable    
      if subtable.id != column.subtable
        return { type: "select", expr: null, alias: "c#{columnIndex}" }

    # Get expression type
    exprUtils = new ExprUtils(@schema)
    exprType = exprUtils.getExprType(column.expr)
    
    # Compile expression
    exprCompiler = new ExprCompiler(@schema)
    compiledExpr = exprCompiler.compileExpr(expr: column.expr, tableAlias: if column.subtable then "st" else "main")

    # Handle special case of geometry, converting to GeoJSON
    if exprType == "geometry"
      # Convert to 4326 (lat/long)
      compiledExpr = { type: "op", op: "ST_AsGeoJSON", exprs: [{ type: "op", op: "ST_Transform", exprs: [compiledExpr, 4326] }] }

    return { type: "select", expr: compiledExpr, alias: "c#{columnIndex}" }

  # Create selects to load given a design
  createLoadSelects: (design) ->
    selects = [
      # Primary key
      { type: "select", expr: { type: "field", tableAlias: "main", column: @schema.getTable(design.table).primaryKey }, alias: "id" }
      { type: "select", expr: -1, alias: "subtable" }
    ]
    selects = selects.concat(_.map(design.columns, (column, columnIndex) => @createColumnSelect(column, columnIndex)))
