# Responsible for laying out items, rendering widgets and holding them in a data structure that is layout manager specific
module.exports = class LayoutManager
  # Renders the layout as a react element
  # options:
  #  width: width of layout
  #  items: opaque items object that layout manager understands
  #  onItemsChange: Called when items changes
  #  renderWidget: called with ({ id:, type:, design:, onDesignChange:, width:, height:  })
  renderLayout: (options) -> null

  # Tests if dashboard has any items
  isEmpty: (items) -> true

  # Gets { type, design } of a widget
  getWidgetTypeAndDesign: (items, widgetId) -> null

  # Gets all widgets in items as array of { type, design }
  getAllWidgets: (items) ->
    return []

  @createLayoutManager: (type) ->
    # Default is old grid type
    type = type or "grid"

    switch type
      when "grid" # Old one
        GridLayoutManager = require './grid/GridLayoutManager'
        return new GridLayoutManager()

      when "blocks" # New one
        BlocksLayoutManager = require './blocks/BlocksLayoutManager'
        return new BlocksLayoutManager()

      else
        throw new Error("Unknown layout manager type #{type}")
	
    addWidget: (items, widgetType, widgetDesign) ->
      throw new Error("Not implemented")
