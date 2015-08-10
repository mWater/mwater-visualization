Layer = require './Layer'
ExpressionCompiler = require '../expressions/ExpressionCompiler'

# Legacy server map
module.exports = class LegacyLayer extends Layer
  constructor: (design, schema, client) ->
    @design = design
    @schema = schema
    @client = client

  getTileUrl: (filters) -> 
    @createUrl("png", filters)

  getUtfGridUrl: (filters) -> 
    @createUrl("grid.json", filters)

  # Create query string
  createUrl: (extension, filters) ->
    # TODO client
    url = "https://api.mwater.co/v3/maps/tiles/{z}/{x}/{y}.#{extension}?type=#{@design.type}&radius=1000"

    if @client
      url += "&client=#{@client}"
      
    # Add where for any relevant filters
    relevantFilters = _.where(filters, table: "entities.water_point")

    # TODO Duplicate code from LayeredChart
    # If any, create and
    whereClauses = _.map(relevantFilters, @compileExpr)

    # Wrap if multiple
    if whereClauses.length > 1
      where = { type: "op", op: "and", exprs: whereClauses }
    else
      where = whereClauses[0]

    if where 
      url += "&where=" + encodeURIComponent(JSON.stringify(where))

    return url

  compileExpr: (expr) =>
    return new ExpressionCompiler(@schema).compileExpr(expr: expr, tableAlias: "main")

  # getLegend: -> null

  getFilterableTables: -> ['entities.water_point']
