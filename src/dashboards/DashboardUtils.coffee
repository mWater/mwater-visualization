uuid = require 'node-uuid'
LegoLayoutEngine = require './LegoLayoutEngine'

# Add a widget to a dashboard design, returning the new design
exports.addWidget = (dashboardDesign, widgetType, widgetDesign, width, height) ->
  # Create dashboard if doesn't exist
  dashboardDesign = dashboardDesign or { items: {} }

  # Find place for new item
  layout = exports.findOpenLayout(dashboardDesign, width, height)

  # Create item
  item = {
    layout: layout
    widget: {
      type: widgetType
      design: widgetDesign
    }
  }

  id = uuid.v4()

  # Add item
  items = _.clone(dashboardDesign.items)
  items[id] = item

  dashboardDesign = _.extend({}, dashboardDesign, items: items)
  return dashboardDesign

# Find a layout that the new widget fits in. width and height are in 24ths
exports.findOpenLayout = (dashboardDesign, width, height) ->
  # Create layout engine
  # TODO create from design
  # TODO uses fake width
  layoutEngine = new LegoLayoutEngine(100, 24)

  # Get existing layouts
  layouts = _.pluck(_.values(dashboardDesign.items), "layout")

  # Find place for new item
  return layoutEngine.appendLayout(layouts, width, height)
