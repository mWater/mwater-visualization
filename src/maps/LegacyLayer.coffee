Layer = require './Layer'

# Legacy server map
module.exports = class LegacyLayer extends Layer
  constructor: (design, schema, client) ->
    @design = design
    @schema = schema
    @client = client

  getTileUrl: (filters) -> 
    # TODO compile query
    # TODO client
    url = "https://api.mwater.co/v3/maps/tiles/{z}/{x}/{y}.png?type=#{@design.type}&radius=1000"
    return url

  getUtfGridUrl: (filters) -> 
    # TODO compile query
    # TODO client
    url = "https://api.mwater.co/v3/maps/tiles/{z}/{x}/{y}.grid.json?type=#{@design.type}&radius=1000"
    return url

  # getLegend: -> null

  getFilterableTables: -> ['entities.water_point']
