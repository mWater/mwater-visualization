MWaterServerLayer = require './MWaterServerLayer'
MarkersLayer = require './MarkersLayer'
BufferLayer = require './BufferLayer'
AdminIndicatorChoroplethLayer = require './AdminIndicatorChoroplethLayer'
AdminChoroplethLayer = require './AdminChoroplethLayer'
TileUrlLayer = require './TileUrlLayer'

module.exports = class LayerFactory
  @createLayer: (type) ->
    switch type
      when "MWaterServer"
        return new MWaterServerLayer()

      when "Markers"
        return new MarkersLayer()

      when "Buffer"
        return new BufferLayer()

      # DEPRECATED
      when "AdminIndicatorChoropleth"
        return new AdminIndicatorChoroplethLayer()

      when "AdminChoropleth"
        return new AdminChoroplethLayer()

      when "TileUrl"
        return new TileUrlLayer()

    throw new Error("Unknown type #{type}")
