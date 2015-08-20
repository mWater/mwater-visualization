ExpressionCompiler = require './../../expressions/ExpressionCompiler'
ExpressionBuilder = require './../../expressions/ExpressionBuilder'
AxisBuilder = require '../../expressions/axes/AxisBuilder'
injectTableAlias = require '../../injectTableAlias'

# Compiles various parts of a layered chart (line, bar, scatter, spline, area) to C3.js format
module.exports = class LayeredChartCompiler
  # Pass in schema
  constructor: (options) ->
    @schema = options.schema
    @exprBuilder = new ExpressionBuilder(@schema)

  # Create the queries needed for the chart.
  # extraFilters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. 
  createQueries: (design, extraFilters) ->
    exprCompiler = new ExpressionCompiler(@schema)

    queries = {}

    # For each layer
    for layerIndex in [0...design.layers.length]
      layer = design.layers[layerIndex]

      # Create shell of query
      query = {
        type: "query"
        selects: []
        from: exprCompiler.compileTable(layer.table, "main")
        limit: 1000
        groupBy: []
        orderBy: []
      }

      # Create axis builder
      axisBuilder = new AxisBuilder(schema: @schema)
      if layer.axes.x
        query.selects.push({ type: "select", expr: axisBuilder.compileAxis(axis: layer.axes.x, tableAlias: "main"), alias: "x" })
      if layer.axes.color
        query.selects.push({ type: "select", expr: axisBuilder.compileAxis(axis: layer.axes.color, tableAlias: "main"), alias: "color" })
      if layer.axes.y
        query.selects.push({ type: "select", expr: axisBuilder.compileAxis(axis: layer.axes.y, tableAlias: "main"), alias: "y" })

      # Sort by x and color
      if layer.axes.x or layer.axes.color
        query.orderBy.push({ ordinal: 1 })
      if layer.axes.x and layer.axes.color
        query.orderBy.push({ ordinal: 2 })

      # If grouping type
      if @doesLayerNeedGrouping(design, layerIndex)
        if layer.axes.x or layer.axes.color
          query.groupBy.push(1)

        if layer.axes.x and layer.axes.color
          query.groupBy.push(2)

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
            whereClauses.push(injectTableAlias(filter.jsonql, "main"))

          # Wrap if multiple
          if whereClauses.length > 1
            query.where = { type: "op", op: "and", exprs: whereClauses }
          else
            query.where = whereClauses[0]

      queries["layer#{layerIndex}"] = query

    # TODO remove
    console.log queries

    return queries

  # Create data map of "{layer name}" or "{layer name}:{index}" to { layerIndex, row }
  createDataMap: (design, data) ->
    return @compileData(design, data).dataMap

  # Create the chartOptions to pass to c3.generate
  # options is
  #   design: chart design element
  #   data: chart data
  #   width: chart width
  #   height: chart height
  createChartOptions: (options) ->
    titlePadding = { top: 0, right: 0, bottom: 15, left: 0 } # TODO move to CSS or make it configurable

    c3Data = @compileData(options.design, options.data)

    # Create chart
    chartDesign = {
      data: {
        types: c3Data.types
        columns: c3Data.columns
        names: c3Data.names
        types: c3Data.types
        groups: c3Data.groups
        xs: c3Data.xs
      }
      # Hide if one layer with no color axis
      legend: { hide: (options.design.layers.length == 1 and not options.design.layers[0].axes.color) }
      grid: { focus: { show: false } }  # Don't display hover grid
      axis: {
        x: {
          type: c3Data.xAxisType
          label: { text: options.design.xAxisLabelText, position: 'outer-center' }
        }
        y: {
          label: { text: options.design.yAxisLabelText, position: 'outer-center' }
        }
        rotated: options.design.transpose
      }
      size: { width: options.width, height: options.height }
      pie: {  expand: false } # Don't expand/contract
      title: { text: options.design.titleText, padding: titlePadding }
      transition: { duration: 0 } # Transitions interfere with scoping
    }

    # TODO remove
    console.log chartDesign

    return chartDesign

  # Compiles data part of C3 chart, including data map back to original data
  # Outputs: columns, types, names, colors. Also dataMap which is a map of "layername:index" to { layerIndex, row }
  compileData: (design, data) ->
    # If polar chart (no x axis)
    if design.type in ['pie', 'donut'] or _.any(design.layers, (l) -> l.type in ['pie', 'donut'])
      return @compileDataPolar(design, data)

    # Check if categorical x axis (bar charts always are)
    isCategoricalX = design.type == "bar" or _.any(design.layers, (l) -> l.type == "bar")

    # Check if x axis is categorical type
    axisBuilder = new AxisBuilder(schema: @schema)
    xType = axisBuilder.getAxisType(design.layers[0].axes.x)
    if xType in ["enum", "text", "boolean"]
      isCategoricalX = true

    if isCategoricalX
      throw new Error("TODO")

    return @compileDataNonCategorical(design, data)

  compileDataPolar: (design, data) ->
    columns = []
    types = {}
    names = {}
    dataMap = {}
    colors = {}

    # For each layer
    _.each design.layers, (layer, layerIndex) =>
      # If has color axis
      if layer.axes.color
        # Create a series for each row
        _.each data["layer#{layerIndex}"], (row, rowIndex) =>
          series = "#{layerIndex}:#{rowIndex}"
          # Pie series contain a single value
          columns.push([series, row.y])
          types[series] = @getLayerType(design, layerIndex)
          names[series] = @formatAxisValue(layer.axes.color, row.color)
          dataMap[series] = { layerIndex: layerIndex, row: row }
      else
        # Create a single series
        row = data["layer#{layerIndex}"][0]
        if row
          series = "#{layerIndex}"
          columns.push([series, row.y])
          types[series] = @getLayerType(design, layerIndex)

          # Name is name of entire layer
          names[series] = layer.name or "Series #{layerIndex+1}"
          dataMap[series] = { layerIndex: layerIndex, row: row }

          # Set color if present
          if layer.color
            colors[series] = layer.color

    return {
      columns: columns
      types: types
      names: names
      dataMap: dataMap
      colors: colors
      xAxisType: "category" # Polar charts are always category x-axis
    }

  compileDataNonCategorical: (design, data) ->
    columns = []
    types = {}
    names = {}
    dataMap = {}
    colors = {}
    xs = {}

    # For each layer
    _.each design.layers, (layer, layerIndex) =>
      # Get data of layer
      layerData = data["layer#{layerIndex}"]

      # If has color axis
      if layer.axes.color
        # Create a series for each color value
        colorValues = _.uniq(_.pluck(layerData, "color"))

        _.each colorValues, (colorValue) =>
          # One series for x values, one for y
          seriesX = "#{layerIndex}:#{colorValue}:x"
          seriesY = "#{layerIndex}:#{colorValue}:y"

          # Get rows for this series
          rows = _.where(layerData, color: colorValue)

          columns.push([seriesY].concat(_.pluck(rows, "y")))
          columns.push([seriesX].concat(_.pluck(rows, "x")))

          types[seriesY] = @getLayerType(design, layerIndex)
          names[seriesY] = @formatAxisValue(layer.axes.color, colorValue)
          xs[seriesY] = seriesX
          
          _.each rows, (row, rowIndex) =>
            dataMap["#{seriesY}:#{rowIndex}"] = { layerIndex: layerIndex, row: row }
      else
        # One series for x values, one for y
        seriesX = "#{layerIndex}:x"
        seriesY = "#{layerIndex}:y"

        columns.push([seriesY].concat(_.pluck(layerData, "y")))
        columns.push([seriesX].concat(_.pluck(layerData, "x")))

        types[seriesY] = @getLayerType(design, layerIndex)
        names[seriesY] = layer.name or "Series #{layerIndex+1}"
        xs[seriesY] = seriesX
        colors[seriesY] = layer.color

        # Add data map for each row
        _.each layerData, (row, rowIndex) =>
          dataMap["#{seriesY}:#{rowIndex}"] = { layerIndex: layerIndex, row: row }

    return {
      columns: columns
      types: types
      names: names
      dataMap: dataMap
      colors: colors
      xs: xs
      xAxisType: "indexed" 
    }

  # Translates enums to label, leaves all else alone
  formatAxisValue: (axis, value) ->
    if value and @exprBuilder.getExprType(axis.expr) == "enum"
      items = @exprBuilder.getExprValues(axis.expr)
      item = _.findWhere(items, { id: value })
      if item
        return item.name
    return value or "None"

  # Compile an expression
  compileExpr: (expr) ->
    exprCompiler = new ExpressionCompiler(@schema)
    return exprCompiler.compileExpr(expr: expr, tableAlias: "main")

  # Get layer type, defaulting to overall type
  getLayerType: (design, layerIndex) ->
    return design.layers[layerIndex].type or design.type

  # Determine if layer required grouping by x (and color)
  doesLayerNeedGrouping: (design, layerIndex) ->
    return @getLayerType(design, layerIndex) != "scatter"

  # Determine if layer can use x axis
  canLayerUseXExpr: (design, layerIndex) ->
    return @getLayerType(design, layerIndex) not in ['pie', 'donut']

  # Create a scope based on a row of a layer
  # Scope data is relevant data from row that uniquely identifies scope
  # plus a layer index
  createScope: (design, layerIndex, row) ->
    expressionBuilder = new ExpressionBuilder(@schema)
    axisBuilder = new AxisBuilder(schema: @schema)

    # Get layer
    layer = design.layers[layerIndex]

    filters = []
    names = []
    data = { layerIndex: layerIndex }
    
    # If x
    if layer.axes.x
      filters.push(axisBuilder.createValueFilter(layer.axes.x, row.x))
      names.push(axisBuilder.summarizeAxis(layer.axes.x) + " is " + axisBuilder.stringifyLiteral(layer.axes.x, row.x))
      data.x = row.x

    if layer.axes.color
      filters.push(axisBuilder.createValueFilter(layer.axes.color, row.color))
      names.push(axisBuilder.summarizeAxis(layer.axes.color) + " is " + axisBuilder.stringifyLiteral(layer.axes.color, row.color))
      data.color = row.color

    if filters.length > 1
      filter = {
        table: layer.table
        jsonql: {
          type: "op"
          op: "and"
          exprs: filters
        }
      }
    else
      filter = {
        table: layer.table
        jsonql: filters[0]
      }

    scope = {
      name: @schema.getTable(layer.table).name + " " + names.join(" and ")
      filter: filter
      data: data
    }

    return scope
