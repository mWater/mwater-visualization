module.exports = class DashboardUtils
  # Gets filterable tables for a dashboard
  @getFilterableTables: (design, schema) ->
    # Here to avoid circularity
    LayoutManager = require '../layouts/LayoutManager'
    WidgetFactory = require '../widgets/WidgetFactory'

    layoutManager = LayoutManager.createLayoutManager(design.layout)

    # Get filterable tables
    filterableTables = []
    for widgetItem in layoutManager.getAllWidgets(design.items)
      # Create widget
      widget = WidgetFactory.createWidget(widgetItem.type)

      # Get filterable tables
      filterableTables = filterableTables.concat(widget.getFilterableTables(widgetItem.design, schema))

    # Remove non-existant tables
    filterableTables = _.filter(_.uniq(filterableTables), (table) => schema.getTable(table))
