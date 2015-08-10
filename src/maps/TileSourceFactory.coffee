SimpleTileSource = require './SimpleTileSource'

module.exports = class TileSourceFactory

  createTileSource: (type, design) ->
    switch type
      when "Simple"
        return new SimpleTileSource(design)

    throw new Error("Unknown type #{type}")