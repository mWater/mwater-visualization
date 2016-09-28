_ = require 'lodash'
async = require 'async'
LayerFactory = require './LayerFactory'
ExprCompiler = require('mwater-expressions').ExprCompiler

# Calculates map bounds given layers by unioning together
module.exports = class MapBoundsCalculator
  constructor: (schema, dataSource) ->
    @schema = schema
    @dataSource = dataSource

  # Gets the bounds for the map. Null for whole world. Callback as { n:, s:, w:, e: }
  getBounds: (design, filters, callback) ->
    exprCompiler = new ExprCompiler(@schema)

    allBounds = []

    # For each layer
    async.each design.layerViews, (layerView, cb) =>
      if not layerView.visible
        return cb(null)
        
      # Create layer
      layer = LayerFactory.createLayer(layerView.type)
      
      # Compile map filters
      allFilters = (filters or []).slice()

      for table, expr of (design.filters or {})
        jsonql = exprCompiler.compileExpr(expr: expr, tableAlias: "{alias}")
        allFilters.push({ table: table, jsonql: jsonql })

      # Get bounds, including filters from map  
      layer.getBounds(layerView.design, @schema, @dataSource, allFilters, (error, bounds) =>
        if error
          return cb(error)

        if bounds
          allBounds.push(bounds)
        cb(null)
        )
    , (error) =>
      if error
        return callback(error)

      # Union bounds
      if allBounds.length == 0
        return callback(null)

      callback(null, {
        n: _.max(allBounds, "n").n
        e: _.max(allBounds, "e").e
        s: _.min(allBounds, "s").s
        w: _.min(allBounds, "w").w
        })
