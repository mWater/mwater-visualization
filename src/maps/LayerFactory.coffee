LegacyLayer = require './LegacyLayer'

module.exports = class LayerFactory
  # Pass in:
  #  schema: schema to use
  #  client: client id to use (to do remove and replace with data source)
  constructor: (options) ->
    @schema = options.schema
    @client = options.client

  createLayer: (type, design) ->
    switch type
      when "Legacy"
        return new LegacyLayer(design, @schema, @client)

    throw new Error("Unknown type #{type}")