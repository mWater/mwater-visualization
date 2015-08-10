LegacyLayer = require './LegacyLayer'

module.exports = class LayerFactory
  # Pass in:
  #  schema: schema to use
  constructor: (options) ->
    @schema = options.schema

  createLayer: (type, design) ->
    switch type
      when "Legacy"
        return new LegacyLayer(design)

    throw new Error("Unknown type #{type}")