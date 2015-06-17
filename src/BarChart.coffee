_ = require 'lodash'
ExpressionBuilder = require './ExpressionBuilder'
BarChartDesignerComponent = require './BarChartDesignerComponent'
BarChartViewComponent = require './BarChartViewComponent'
React = require 'react'
H = React.DOM

###
Design is:

table: base table of design

aesthetics:
  x:
    expr: expression
    scale: scale
  y: 
    expr: expression
    scale: scale
  color:
    expr: expression
    scale: scale

filter: expression that filters table

stacked: true/false

###
module.exports = class BarChart
  constructor: (schema) ->
    @schema = schema
    @exprBuilder = new ExpressionBuilder(@schema)

  cleanDesign: (design) ->
    # Clone deep for now # TODO
    design = _.cloneDeep(design)

    # Clean aesthetic expressions. First table locks table for all others 
    # since all must use same table
    design.table = null
    for aes in ['y', 'x', 'color']
      value = design.aesthetics[aes]

      # Aesthetic or expression can be blank
      if not value or not value.expr
        continue

      # Clean expression
      value.expr = @exprBuilder.cleanExpr(value.expr, design.table)

      # Save table
      if value.expr
        design.table = value.expr.table

    if design.filter
      design.filter = @exprBuilder.cleanExpr(design.filter, design.table)

    return design

  validateDesign: (design) ->
    # Check that has x and y
    if not design.aesthetics.x 
      return "Missing X Axis"
    if not design.aesthetics.y
      return "Missing Y Axis"

    error = null
    error = error or @exprBuilder.validateExpr(design.aesthetics.x.expr)
    error = error or @exprBuilder.validateExpr(design.aesthetics.y.expr)
    error = error or @exprBuilder.validateExpr(design.filter)
    return error

  # Creates a design element with specified options
  # options include design: design and onChange: function
  createDesignerElement: (options) ->
    props = {
      schema: @schema
      design: options.design
      onChange: options.onChange
    }
    return React.createElement(BarChartDesignerComponent, props)

  # Options include 
  # design: design of the component
  # width, height
  createViewElement: (options) ->
    # Validate design
    error = @validateDesign(@cleanDesign(options.design))
    if error
      return H.div className: "alert alert-warning", error

    props = {
      schema: @schema
      design: options.design
      onChange: options.onChange
      width: options.width
      height: options.height
    }

    return React.createElement(BarChartViewComponent, props)
