MWaterServerLayer = require './MWaterServerLayer'
MarkersLayer = require './MarkersLayer'
BufferLayer = require './BufferLayer'
AdminChoroplethLayer = require './AdminChoroplethLayer'
ClusterLayer = require './ClusterLayer'
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

      when "AdminChoropleth"
        return new AdminChoroplethLayer()

      when "Cluster"
        return new ClusterLayer()

      when "TileUrl"
        return new TileUrlLayer()

    throw new Error("Unknown type #{type}")
