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

  getQueries: (design, extraFilters) ->
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
        orderBy: []
      }

      query.selects.push({ type: "select", expr: @compileExpr(layer.xExpr), alias: "x" })
      if layer.colorExpr
        query.selects.push({ type: "select", expr: @compileExpr(layer.colorExpr), alias: "color" })

      # Sort by x
      query.orderBy.push({ ordinal: 1 })

      # Then sort by color
      if layer.colorExpr
        query.orderBy.push({ ordinal: 2 })

      # If grouping type
      if @doesLayerNeedGrouping(design, layerId)
        query.groupBy.push(1)

        if layer.colorExpr
          query.groupBy.push(2)

        query.selects.push({ type: "select", expr: { type: "op", op: layer.yAggr, exprs: [@compileExpr(layer.yExpr)] }, alias: "y" })
      else
        query.selects.push({ type: "select", expr: @compileExpr(layer.yExpr), alias: "y" })

      # Add where
      if layer.filter
        query.where = @compileExpr(layer.filter)

      # Add filters
      if extraFilters and extraFilters.length > 0
        # Get relevant filters
        relevantFilters = _.where(extraFilters, table: layer.table)

        # If any, create and
        if relevantFilters.length > 0
          whereClauses = []

          # Keep existing where
          if query.where
            whereClauses.push(query.where)

          # Add others
          for filter in relevantFilters
            whereClauses.push(@compileExpr(filter))

          # Wrap if multiple
          if whereClauses.length > 1
            query.where = { type: "op", op: "and", exprs: whereClauses }
          else
            query.where = whereClauses[0]

      queries["layer#{layerId}"] = query

    return queries

  # Translates enums to label, leaves all else alone
  mapValue: (expr, value) ->
    if value and @exprBuilder.getExprType(expr) == "enum"
      items = @exprBuilder.getExprValues(expr)
      item = _.findWhere(items, { id: value })
      if item
        return item.name
    return value

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
        # Determine all color values
        colorValues = _.uniq(_.pluck(data["layer#{layerId}"], "color"))

        if xCategorical
          # Create a series for each color value
          for colorVal in colorValues
            # Use x axis for each and lookup y
            xcolumn = ["layer#{layerId}:#{colorVal}:x"]
            ycolumn = ["layer#{layerId}:#{colorVal}:y"]

            for val in xValues
              xcolumn.push(@mapValue(layer.xExpr, val))
              row = _.findWhere(data["layer#{layerId}"], { x: val, color: colorVal })
              if row
                ycolumn.push(row.y)
              else
                ycolumn.push(null)
            columns.push(xcolumn)
            columns.push(ycolumn)
        else
          # Create a series for each color value
          for colorVal in colorValues
            # Use x axis for each and lookup y
            xcolumn = ["layer#{layerId}:#{colorVal}:x"]
            ycolumn = ["layer#{layerId}:#{colorVal}:y"]

            for row in data["layer#{layerId}"]
              if row.color == colorVal
                xcolumn.push(@mapValue(layer.xExpr, row.x))
                ycolumn.push(row.y)

            columns.push(xcolumn)
            columns.push(ycolumn)
      else
        if xCategorical
          # Use x axis for each and lookup y
          xcolumn = ["layer#{layerId}:x"]
          ycolumn = ["layer#{layerId}:y"]

          for val in xValues
            xcolumn.push(@mapValue(layer.xExpr, val))
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
            xcolumn.push(@mapValue(layer.xExpr, row.x))
            ycolumn.push(row.y)

          columns.push(xcolumn)
          columns.push(ycolumn)

    return columns

  getXs: (columns) ->
    xs = {}
    for col in columns
      if col[0].match(/:y$/)
        xs[col[0]] = col[0].replace(/:y$/, ":x")

    return xs

  getNames: (design, data) ->
    names = {}
    # For each layer
    for layerId in [0...design.layers.length]
      layer = design.layers[layerId]

      # If color expr
      if layer.colorExpr
        # Determine all color values
        colorValues = _.uniq(_.pluck(data["layer#{layerId}"], "color"))

        for colorVal in colorValues
          names["layer#{layerId}:#{colorVal}:y"] = @mapValue(layer.colorExpr, colorVal)
      else
        names["layer#{layerId}:y"] = layer.name or "Series #{layerId+1}"

    return names

  # Gets the type of each y column
  getTypes: (design, columns) ->
    types = {}
    for column in columns
      if column[0].match(/:y$/)
        layerId = parseInt(column[0].match(/^layer(\d+)/)[1])
        types[column[0]] = design.layers[layerId].type or design.type

    return types

  getGroups: (design, columns) ->
    groups = []
    # For each layer
    for layerId in [0...design.layers.length]
      layer = design.layers[layerId]

      if layer.stacked
        group = []
        for column in columns
          if column[0].match("^layer#{layerId}:.*:y$")
            group.push(column[0])
        groups.push(group)

    return groups


  getXAxisType: (design) ->
    switch @exprBuilder.getExprType(design.layers[0].xExpr)
      when "text", "enum", "boolean" then "category"
      when "date" then "timeseries"
      else "indexed"

