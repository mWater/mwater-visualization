MWaterServerLayer = require './MWaterServerLayer'
MarkersLayer = require './MarkersLayer'
BufferLayer = require './BufferLayer'
AdminIndicatorChoroplethLayer = require './AdminIndicatorChoroplethLayer'
AdminChoroplethLayer = require './AdminChoroplethLayer'

module.exports = class LayerFactory
  @createLayer: (type) ->
    switch type
      when "MWaterServer"
        return new MWaterServerLayer()

      when "Markers"
        return new MarkersLayer()

      when "Buffer"
        return new BufferLayer()

      when "AdminIndicatorChoropleth"
        return new AdminIndicatorChoroplethLayer()

      when "AdminChoropleth"
        return new AdminChoroplethLayer()

    throw new Error("Unknown type #{type}")
