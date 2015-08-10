LegacyTileSource = require './LegacyTileSource'

module.exports = class TileSourceFactory
  # Pass in:
  #  schema: schema to use
  constructor: (options) ->
    @schema = options.schema

  createTileSource: (type, design) ->
    switch type
      when "Legacy"
        return new LegacyTileSource(design)

    throw new Error("Unknown type #{type}")