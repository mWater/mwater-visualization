MWaterServerLayer = require './MWaterServerLayer'

module.exports = class LayerFactory
  # Pass in:
  #  schema: schema to use
  #  client: client id to use for talking to mWater server
  #  apiUrl: API url to use for talking to mWater server
  constructor: (options) ->
    @schema = options.schema
    @client = options.client
    @apiUrl = options.apiUrl

  createLayer: (type, design) ->
    switch type
      when "MWaterServer"
        return new MWaterServerLayer(design: design, client: @client, apiUrl: @apiUrl)

    throw new Error("Unknown type #{type}")