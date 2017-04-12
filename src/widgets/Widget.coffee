

# All logic needed to display and design a particular widget
# Scopes are a feature of widgets that allow a widget to apply filters to another widget. See WidgetScoper for more details
module.exports = class Widget
  # Creates a React element that is a view of the widget 
  # options:
  #  schema: schema to use
  #  dataSource: data source to use. Only used when designing, for display uses widgetDataSource
  #  widgetDataSource: Gives data to the widget in a way that allows client-server separation and secure sharing. See definition in WidgetDataSource.
  #  design: widget design
  #  scope: scope of the widget (when the widget self-selects a particular scope)
  #  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
  #  onScopeChange: called with scope of widget
  #  onDesignChange: called with new design. null/undefined for readonly
  #  width: width in pixels on screen
  #  height: height in pixels on screen
  #  standardWidth: standard width of the widget in pixels. If greater than width, widget should scale up, if less, should scale down.
  #  singleRowTable: optional table name of table that will be filtered to have a single row present. Widget designer should optionally account for this
  #  onRowClick: Called with (tableId, rowId) when item is clicked
  #  namedStrings: optional lookup of string name to value. Used for {{branding}} and other replacement strings in text widget
  createViewElement: (options) ->
    throw new Error("Not implemented")

  # Get the data that the widget needs. This will be called on the server, typically.
  #   design: design of the chart
  #   schema: schema to use
  #   dataSource: data source to get data from
  #   filters: array of { table: table id, jsonql: jsonql condition with {alias} for tableAlias }
  #   callback: (error, data)
  getData: (design, schema, dataSource, filters, callback) ->
    throw new Error("Not implemented")

  # Determine if widget is auto-height, which means that a vertical height is not required.
  isAutoHeight: -> false

  # Get a list of table ids that can be filtered on
  getFilterableTables: (design, schema) ->
    return []
