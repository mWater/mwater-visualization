# Common interface for all charts
module.exports = class Chart
  # Removes any invalid values from a design. Returns cleaned design
  cleanDesign: (design, schema) ->
    throw new Error("Not implemented")

  # Determines if design is valid. Null/undefined for yes, error string for no
  validateDesign: (design, schema) ->
    throw new Error("Not implemented")

  # True if a design is empty and so to display the editor immediately
  isEmpty: (design) ->
    return false

  # Creates a design element with specified options
  # options include:
  #   schema: schema to use
  #   dataSource: dataSource to use
  #   design: design 
  #   onDesignChange: function
  createDesignerElement: (options) ->
    throw new Error("Not implemented")

  # Get data for the chart asynchronously 
  # design: design of the chart
  # schema: schema to use
  # dataSource: data source to get data from
  # filters: array of { table: table id, jsonql: jsonql condition with {alias} for tableAlias }
  # callback: (error, data)
  getData: (design, schema, dataSource, filters, callback) ->
    throw new Error("Not implemented")

  # Create a view element for the chart
  # Options include:
  #   schema: schema to use
  #   dataSource: dataSource to use
  #   design: design of the chart
  #   data: results from queries
  #   width, height, standardWidth: size of the chart view
  #   scope: current scope of the view element
  #   onScopeChange: called when scope changes with new scope
  createViewElement: (options) ->
    throw new Error("Not implemented")

  # Creates the dropdown menu items of shape {label, action}
  #   design: design of the chart
  #   schema: schema to use
  #   dataSource: Data source to use for chart
  #   filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
  # Returns an empty list by default
  createDropdownItems: (design, schema, dataSource, filters) ->
    return []

  # Creates a table form of the chart data. Array of arrays
  createDataTable: (design, data, locale) ->
    throw new Error("Not implemented")

