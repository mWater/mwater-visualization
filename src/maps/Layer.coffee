
# Defines a layer for a map which has all the logic for rendering the specific data to be viewed
module.exports = class Layer
  # Get the url for the tiles with the specified filters applied
  #  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to put in table alias
  getTileUrl: (filters) ->
    throw new Error("Not implemented")

  # Get the url for the interactivity tiles with the specified filters applied
  #  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to put in table alias
  getUtfGridUrl: (filters) ->
    return null

  # Called when the interactivity grid is clicked. Called with { data: interactivty data e.g. `{ id: 123 }` }
  onGridClick: (ev) ->
    return

  # Get the legend to be optionally displayed on the map. Returns
  # a React element
  getLegend: ->
    return null

  # Get a list of table ids that can be filtered on
  getFilterableTables: ->
    return []

  # True if layer can be edited
  isEditable: ->
    return false

  # Creates a design element with specified options
  # options include:
  #  onDesignChange: function called when design changes
  createDesignerElement: (options) ->
    throw new Error("Not implemented")

