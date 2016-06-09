MWaterServerLayer = require './MWaterServerLayer'
MarkersLayer = require './MarkersLayer'
AdminIndicatorChoroplethLayer = require './AdminIndicatorChoroplethLayer'

module.exports = class LayerFactory
  # Pass in:
  #  newLayers: array of new layers that are addable. Contains { label, name, type, design }. label is label in dropdown to add. defaults to name
  constructor: (newLayers) ->
    @newLayers = newLayers 

  createLayer: (type, design) ->
    switch type
      when "MWaterServer"
        return new MWaterServerLayer()

      when "Markers"
        return new MarkersLayer()

      when "AdminIndicatorChoropleth"
        return new AdminIndicatorChoroplethLayer()

    throw new Error("Unknown type #{type}")

  getNewLayers: ->
    return @newLayers
