
# Common interface for all charts
module.exports = class Chart
  cleanDesign: (design) ->
    throw new Error("Not implemented")

  validateDesign: (design) ->
    throw new Error("Not implemented")

  # Creates a design element with specified options
  # options include design: design and onChange: function
  createDesignerElement: (options) ->
    throw new Error("Not implemented")

  createQueries: (design) ->
    throw new Error("Not implemented")

  # Options include 
  # design: design of the component
  # data: results from queries
  # width, height: size of the chart view
  createViewElement: (options) ->
    throw new Error("Not implemented")
