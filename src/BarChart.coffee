_ = require 'lodash'
ExpressionBuilder = require './ExpressionBuilder'

###
Design is:

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
    table = null
    for aes in ['y', 'x', 'color']
      value = design.aesthetics[aes]

      # Aesthetic or expression can be blank
      if not value or not value.expr
        continue

      # Clean expression
      value.expr = @exprBuilder.cleanExpr(value.expr, table)

      # Save table
      if value.expr
        table = value.expr.table

    return design

  validateDesign: (design) ->
    # Check that has x and y
    if not design.aesthetics.x 
      return "Missing X Value"
    if not design.aesthetics.y
      return "Missing Y Value"

    error = null
    error = error or @exprBuilder.validateExpr(design.aesthetics.x)
    error = error or @exprBuilder.validateExpr(design.aesthetics.y)
    return error


  #   design.yAxis = exprBuilder.cleanExpr(design.yAxis)
    
  #   if design.yAxis
  #     design.xAxis = exprBuilder.cleanExpr(design.xAxis, design.yAxis.table)
  #   else
  #     design.xAxis = null

  #   if design.yAxis
  #     design.where = exprBuilder.cleanExpr(design.where, design.yAxis.table)
  #   else
  #     design.where = null

  #   @props.onChange(design)
