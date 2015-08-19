ExpressionCompiler = require './../../expressions/ExpressionCompiler'
ExpressionBuilder = require './../../expressions/ExpressionBuilder'

# Compiles various parts of a layered chart (line, bar, scatter, spline, area) to C3.js format
module.exports = class LayeredChartCompiler2
  # Pass in schema
  constructor: (options) ->
    @schema = options.schema
    @exprBuilder = new ExpressionBuilder(@schema)


  # Get layer type, defaulting to overall type
  getLayerType: (design, layerIndex) ->
    return design.layers[layerIndex].type or design.type

  # Compiles data part of C3 chart
  compileData: (design, data) ->
    # If polar chart (no x axis)
    if design.type in ['pie', 'donut'] or _.any(design.layers, (l) -> l.type in ['pie', 'donut'])
      return @compileDataPolar(design, data)

    throw new Error("TODO")

  compileDataPolar: (design, data) ->
    columns = []
    types = {}
    names = {}
    mapping = {}
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
          mapping[series] = { layerIndex: layerIndex, row: row }
      else
        # Create a single series
        row = data["layer#{layerIndex}"][0]
        if row
          series = "#{layerIndex}"
          columns.push([series, row.y])
          types[series] = @getLayerType(design, layerIndex)

          # Name is name of entire layer
          names[series] = layer.name or "Untitled"
          mapping[series] = { layerIndex: layerIndex, row: row }

          # Set color if present
          if layer.color
            colors[series] = layer.color

    return {
      columns: columns
      types: types
      names: names
      mapping: mapping
      colors: colors
    }

  # Translates enums to label, leaves all else alone
  formatAxisValue: (axis, value) ->
    if value and @exprBuilder.getExprType(axis.expr) == "enum"
      items = @exprBuilder.getExprValues(axis.expr)
      item = _.findWhere(items, { id: value })
      if item
        return item.name
    return value or "None"

