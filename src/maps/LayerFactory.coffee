MWaterServerLayer = require './MWaterServerLayer'
MarkersLayer = require './MarkersLayer'
BufferLayer = require './BufferLayer'
AdminIndicatorChoroplethLayer = require './AdminIndicatorChoroplethLayer'

module.exports = class LayerFactory
  @createLayer: (type, design) ->
    switch type
      when "MWaterServer"
        return new MWaterServerLayer()

      when "Markers"
        return new MarkersLayer()

      when "Buffer"
        return new BufferLayer()

      when "AdminIndicatorChoropleth"
        return new AdminIndicatorChoroplethLayer()

    throw new Error("Unknown type #{type}")
