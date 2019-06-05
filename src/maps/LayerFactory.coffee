MWaterServerLayer = require './MWaterServerLayer'
MarkersLayer = require './MarkersLayer'
BufferLayer = require './BufferLayer'
ChoroplethLayer = require('./ChoroplethLayer').default
ClusterLayer = require './ClusterLayer'
TileUrlLayer = require './TileUrlLayer'
SwitchableTileUrlLayer = require('./SwitchableTileUrlLayer').default
HexgridLayer = require('./HexgridLayer').default

module.exports = class LayerFactory
  @createLayer: (type) ->
    switch type
      when "MWaterServer"
        return new MWaterServerLayer()

      when "Markers"
        return new MarkersLayer()

      when "Buffer"
        return new BufferLayer()

      # Uses a legacy type name
      when "AdminChoropleth"
        return new ChoroplethLayer()

      when "Cluster"
        return new ClusterLayer()

      when "TileUrl"
        return new TileUrlLayer()

      when "SwitchableTileUrl"
        return new SwitchableTileUrlLayer()

      when "Hexgrid"
        return new HexgridLayer()

    throw new Error("Unknown type #{type}")
