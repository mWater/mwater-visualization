
# Common interface for all charts
module.exports = class Chart
  cleanDesign: (design) ->
    throw new Error("Not implemented")

  validateDesign: (design) ->
    throw new Error("Not implemented")

  # Creates a design element with specified options
  # options include:
  # design: design of chart 
  # onDesignChange: function called when design changes
  createDesignerElement: (options) ->
    throw new Error("Not implemented")

  createQueries: (design, filters) ->
    throw new Error("Not implemented")

  # Options include 
  # design: design of the chart
  # data: results from queries
  # width, height: size of the chart view
  # scope: current scope of the view element
  # onScopeChange: called when scope changes with new scope
  createViewElement: (options) ->
    throw new Error("Not implemented")

  # Creates the dropdown menu items of shape {node, action}
  # design: design of the chart
  # dataSource: Data source to use for chart
  # filters: array of filters to apply (array of expressions)
  # Returns an empty list by default
  createDropdownItems: (design, dataSource, filters) ->
    return []
