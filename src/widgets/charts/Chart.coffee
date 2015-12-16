# Common interface for all charts
module.exports = class Chart
  # Removes any invalid values from a design. Returns cleaned design
  cleanDesign: (design) ->
    throw new Error("Not implemented")

  # Determines if design is valid. Null/undefined for yes, error string for no
  validateDesign: (design) ->
    throw new Error("Not implemented")

  # True if a design is empty and so to display the editor immediately
  isEmpty: (design) ->
    return false

  # Creates a design element with specified options
  # options include:
  # design: design of chart 
  # onDesignChange: function called when design changes
  createDesignerElement: (options) ->
    throw new Error("Not implemented")

  # Get data for the chart asynchronously 
  # filters is array of { table: table id, jsonql: jsonql condition with {alias} for tableAlias }
  getData: (design, filters, callback) ->
    throw new Error("Not implemented")

  # Options include 
  # design: design of the chart
  # data: data from getData callback
  # width, height: size of the chart view
  # scope: current scope of the view element
  # onScopeChange: called when scope changes with new scope
  createViewElement: (options) ->
    throw new Error("Not implemented")

  # Creates the dropdown menu items of shape {label, action}
  #  design: design of the chart
  #  dataSource: Data source to use for chart
  #  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
  # Returns an empty list by default
  createDropdownItems: (design, dataSource, filters) ->
    return []

  # Creates a table form of the chart data. Array of arrays
  createDataTable: (design, data, locale) ->
    throw new Error("Not implemented")

