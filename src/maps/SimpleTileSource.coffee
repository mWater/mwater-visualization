TileSource = require './TileSource'

# Simple tile source that has a fixed URL
module.exports = class SimpleTileSource extends TileSource
  constructor: (tileUrl, utfGridUrl, legend) ->
    @tileUrl = tileUrl
    @utfGridUrl = utfGridUrl
    @legend = legend

  getTileUrl: (filters) -> @tileUrl
  getUtfGridUrl: (filters) -> @utfGridUrl
  getLegend: -> @legend
