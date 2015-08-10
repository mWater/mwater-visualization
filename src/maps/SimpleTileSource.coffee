TileSource = require './TileSource'

# Simple tile source that has a fixed URL
module.exports = class SimpleTileSource extends TileSource
  constructor: (design) ->
    @tileUrl = design.tileUrl
    @utfGridUrl = design.utfGridUrl
    @legend = design.legend

  getTileUrl: (filters) -> @tileUrl
  getUtfGridUrl: (filters) -> @utfGridUrl
  getLegend: -> @legend
