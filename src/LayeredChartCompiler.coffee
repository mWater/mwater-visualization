ExpressionCompiler = require './ExpressionCompiler'
ExpressionBuilder = require './ExpressionBuilder'

# Compiles various parts of a layered chart (line, bar, scatter, spline, area) to C3.js format
module.exports = class LayeredChartCompiler
  # Pass in schema
  constructor: (options) ->
    @schema = options.schema
    @exprBuilder = new ExpressionBuilder(@schema)

  # Get layer type, defaulting to overall type
  getLayerType: (design, layerId) ->
    return design.layers[layerId].type or design.type

  # Determine if layer required grouping by x (and color)
  doesLayerNeedGrouping: (design, layerId) ->
    return @getLayerType(design, layerId) != "scatter"

  # Determines if expr is categorical
  isExprCategorical: (expr) ->
    return @exprBuilder.getExprType(expr) in ['text', 'enum', 'boolean']

  compileExpr: (expr) ->
    exprCompiler = new ExpressionCompiler(@schema)
    return exprCompiler.compileExpr(expr: expr, tableAlias: "main")

  getQueries: (design) ->
    queries = {}

    # For each layer
    for layerId in [0...design.layers.length]
      layer = design.layers[layerId]

      # Create shell of query
      query = {
        type: "query"
        selects: []
        from: { type: "table", table: layer.table, alias: "main" }
        limit: 1000
        groupBy: []
      }

      query.selects.push({ type: "select", expr: @compileExpr(layer.xExpr), alias: "x" })
      if layer.colorExpr
        query.selects.push({ type: "select", expr: @compileExpr(layer.colorExpr), alias: "color" })

      # If grouping type
      if @doesLayerNeedGrouping(design, layerId)
        query.groupBy.push(1)

        if layer.colorExpr
          query.groupBy.push(2)

        query.selects.push({ type: "select", expr: { type: "op", op: layer.yAggr, exprs: [@compileExpr(layer.yExpr)] }, alias: "y" })
      else
        query.selects.push({ type: "select", expr: @compileExpr(layer.yExpr), alias: "y" })

      queries["layer#{layerId}"] = query

    return queries

  getColumns: (design, data) ->
    columns = []

    # Determine if x is categorical
    xCategorical = @isExprCategorical(design.layers[0].xExpr)

    # If categorical, get all values
    xValues = []
    for layerId in [0...design.layers.length]
      layer = design.layers[layerId]
      xValues = _.union(xValues, _.pluck(data["layer#{layerId}"], "x"))

    # For each layer
    for layerId in [0...design.layers.length]
      layer = design.layers[layerId]

      # If color expr
      if layer.colorExpr
        throw new Error("Not implemented")
      else
        if xCategorical
          # Use x axis for each and lookup y
          xcolumn = ["layer#{layerId}:x"]
          ycolumn = ["layer#{layerId}:y"]

          for val in xValues
            xcolumn.push(val)
            row = _.findWhere(data["layer#{layerId}"], { x: val })
            if row
              ycolumn.push(row.y)
            else
              ycolumn.push(null)

          columns.push(xcolumn)
          columns.push(ycolumn)
        else
          # Simple expression
          xcolumn = ["layer#{layerId}:x"]
          ycolumn = ["layer#{layerId}:y"]

          for row in data["layer#{layerId}"]
            xcolumn.push(row.x)
            ycolumn.push(row.y)

          columns.push(xcolumn)
          columns.push(ycolumn)



    return columns

