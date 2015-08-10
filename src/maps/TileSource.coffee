
# Defines a source for tiles. Each layer on the map has a tile source
# which has all the logic for rendering the specific data to be viewed
module.exports = class TileSource
  # Get the url for the tiles with the specified filters applied
  # filters is an array of expressions.
  getTileUrl: (filters) ->
    throw new Error("Not implemented")

  # Get the url for the interactivity tiles with the specified filters applied
  # filters is an array of expressions.
  getUtfGridUrl: (filters) ->
    return null

  # Get the legend to be optionally displayed on the map. Returns
  # a React element
  getLegend: ->
    return null

  # Get a list of table ids that can be filtered on
  getFilterableTables: ->
    return []
