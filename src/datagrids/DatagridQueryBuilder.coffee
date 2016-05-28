_ = require 'lodash'
ExprCompiler = require("mwater-expressions").ExprCompiler
ExprUtils = require("mwater-expressions").ExprUtils

# Builds a datagrid query. 
# Warning: mwater-server requires this directly!
module.exports = class DatagridQueryBuilder 
  constructor: (schema) ->
    @schema = schema

  # Create the query, starting at row offset for limit rows
  createQuery: (design, offset, limit) ->
    # Create query to get the page of rows at the specific offset
    design = design
    exprCompiler = new ExprCompiler(@schema)

    query = {
      type: "query"
      selects: @createLoadSelects(design)
      from: { type: "table", table: design.table, alias: "main" }
      offset: offset
      limit: limit
    }

    # Filter by filter
    if design.filter
      query.where = exprCompiler.compileExpr(expr: design.filter, tableAlias: "main")

    # Order by primary key to make unambiguous
    query.orderBy = [{ expr: { type: "field", tableAlias: "main", column: @schema.getTable(design.table).primaryKey }, direction: "asc" }]

    return query

  # Create the select for a column in JsonQL format
  createColumnSelect: (column, columnIndex) ->
    # Get expression type
    exprUtils = new ExprUtils(@schema)
    exprType = exprUtils.getExprType(column.expr)
    
    # Compile expression
    exprCompiler = new ExprCompiler(@schema)
    compiledExpr = exprCompiler.compileExpr(expr: column.expr, tableAlias: "main")

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
    ]
    selects = selects.concat(_.map(design.columns, (column, columnIndex) => @createColumnSelect(column, columnIndex)))
