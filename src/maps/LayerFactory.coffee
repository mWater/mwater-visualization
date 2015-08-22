MWaterServerLayer = require './MWaterServerLayer'
MarkersLayer = require './MarkersLayer'

module.exports = class LayerFactory
  # Pass in:
  #  schema: schema to use
  #  client: client id to use for talking to mWater server
  #  apiUrl: API url to use for talking to mWater server
  #  newLayers: array of new layers that are addable. Contains { name, type, design }
  #  onMarkerClick takes (table, id) and is the table and id of the row that is represented by the click
  constructor: (options) ->
    @schema = options.schema
    @client = options.client
    @apiUrl = options.apiUrl
    @newLayers = options.newLayers 
    @onMarkerClick = options.onMarkerClick

  createLayer: (type, design) ->
    switch type
      when "MWaterServer"
        return new MWaterServerLayer(design: design, client: @client, apiUrl: @apiUrl, onMarkerClick: @onMarkerClick)

      when "Markers"
        return new MarkersLayer(design: design, client: @client, apiUrl: @apiUrl, schema: @schema)

    throw new Error("Unknown type #{type}")

  getNewLayers: ->
    return @newLayers
