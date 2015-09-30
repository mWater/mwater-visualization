_ = require 'lodash'
ExpressionCompiler = require '../ExpressionCompiler'
ExpressionBuilder = require '../ExpressionBuilder'
d3Format = require 'd3-format'

xforms = [
  { type: "bin", input: "decimal", output: "enum" }
  { type: "bin", input: "integer", output: "enum" }
  { type: "date", input: "datetime", output: "date" }
  { type: "year", input: "date", output: "date" }
  { type: "year", input: "datetime", output: "date" }
  { type: "yearmonth", input: "date", output: "date" }
  { type: "yearmonth", input: "datetime", output: "date" }
  { type: "month", input: "date", output: "enum" }
  { type: "month", input: "datetime", output: "enum" }
]

# Understands axes. Contains methods to clean/validate etc. an axis of any type. 
module.exports = class AxisBuilder
  # Options are: schema
  constructor: (options) ->
    @schema = options.schema
    @exprBuilder = new ExpressionBuilder(@schema)

  # Clean an axis with respect to a specific table
  # Options:
  #  axis: axis to clean
  #  table: table that axis is to be for
  #  aggrNeed is "none", "optional" or "required"
  #  types: optional list of types to require it to be one of
  cleanAxis: (options) ->
    if not options.axis
      return

    # TODO always clones
    axis = _.clone(options.axis)

    # Clean expression
    axis.expr = @exprBuilder.cleanExpr(axis.expr, options.table)

    # Remove if null or no type 
    type = @exprBuilder.getExprType(axis.expr)
    if not type
      return

    # Validate xform type
    if axis.xform
      # Find valid xform
      xform = _.find(xforms, (xf) ->
        # xform type must match
        if xf.type != axis.xform.type
          return false

        # Input type must match
        if xf.input != type
          return false

        # Output type must match
        if options.types and xf.output not in options.types
          return false
        return true
        )
      if not xform
        delete axis.xform

    # If no xform and using an xform would allow satisfying output types, pick first
    if options.types and type not in options.types
      xform = _.find(xforms, (xf) -> xf.input == type and xf.output in options.types)
      if xform
        axis.xform = { type: xform.type }
        type = xform.output
      else
        # Unredeemable if no xform possible and cannot use count to get integer
        if options.aggrNeed == "none" 
          return null
        if "integer" not in options.types
          return null

    # Always 
    # Add number of bins
    if axis.xform and axis.xform.type == "bin" and not axis.xform.numBins
      axis.xform.numBins = 6

    # Only allow aggr if not xform
    if axis.xform
      delete axis.aggr
    else
      # Clean aggr
      aggrs = @exprBuilder.getAggrs(axis.expr)
      # Remove latest, as it is tricky to group by. TODO
      aggrs = _.filter(aggrs, (aggr) -> aggr.id != "last")

      # Remove existing if not in list
      if axis.aggr and axis.aggr not in _.pluck(aggrs, "id")
        delete axis.aggr

      # Remove if need is none
      if options.aggrNeed == "none"
        delete axis.aggr

      # Default aggr if required
      if options.aggrNeed == "required" and aggrs[0] and not axis.aggr
        axis.aggr = aggrs[0].id

      # Set aggr to count if expr is type count and aggr possible
      if options.aggrNeed != "none" and not axis.aggrs
        if @exprBuilder.getExprType(axis.expr) == "count"
          axis.aggr = "count"

      # Set aggr to count if needed to satisfy types
      if options.types and "integer" in options.types and type not in options.types
        axis.aggr = "count"

    return axis

  # Checks whether an axis is valid
  #  axis: axis to validate
  validateAxis: (options) ->
    # Nothing is ok
    if not options.axis
      return

    # xform validation
    if options.axis.xform and options.axis.xform.type == "bin"
      if not options.axis.xform.numBins
        return "Missing numBins"

      if not options.axis.xform.min?
        return "Missing min"

      if not options.axis.xform.max?
        return "Missing max"

    # TODO
    return @exprBuilder.validateExpr(options.axis.expr)

  # Pass axis, tableAlias
  compileAxis: (options) ->
    if not options.axis
      return null

    exprCompiler = new ExpressionCompiler(@schema)
    compiledExpr = exprCompiler.compileExpr(expr: options.axis.expr, tableAlias: options.tableAlias, aggr: options.axis.aggr)

    # Bin
    if options.axis.xform 
      if options.axis.xform.type == "bin"
        compiledExpr = {
          type: "op"
          op: "width_bucket"
          exprs: [
            compiledExpr
            options.axis.xform.min
            options.axis.xform.max
            options.axis.xform.numBins
          ]
        }

      if options.axis.xform.type == "date"
        compiledExpr = {
          type: "op"
          op: "substr"
          exprs: [
            compiledExpr
            1
            10
          ]
        }

      if options.axis.xform.type == "year"
        compiledExpr = {
          type: "op"
          op: "rpad"
          exprs: [
            { type: "op", op: "substr", exprs: [compiledExpr, 1, 4] }
            10
            "-01-01"
          ]
        }

      if options.axis.xform.type == "yearmonth"
        compiledExpr = {
          type: "op"
          op: "rpad"
          exprs: [
            { type: "op", op: "substr", exprs: [compiledExpr, 1, 7] }
            10
            "-01"
          ]
        }

      if options.axis.xform.type == "month"
        compiledExpr = {
          type: "op"
          op: "substr"
          exprs: [
            compiledExpr
            6
            2
          ]
        }

    # Aggregate
    if options.axis.aggr
      compiledExpr = {
        type: "op"
        op: options.axis.aggr
        exprs: _.compact([compiledExpr])
      }

    return compiledExpr

  # Get underlying expression types that will give specified output expression types
  #  types: array of types
  #  aggrNeed is "none", "optional" or "required"
  getExprTypes: (types, aggrNeed) ->
    if not types
      return null
      
    # Allow any if count is an option
    if aggrNeed != "none" and "integer" in types
      return ["text", "decimal", "integer", "date", "datetime", "boolean", "enum"]

    types = types.slice()

    # Add xformed types
    for xform in xforms
      if xform.output in types
        types = _.union(types, [xform.input])

    return types

  # Get all categories for a given axis type given the known values
  # Returns array of { value, label }
  getCategories: (axis, values) ->
    # Handle binning first
    if axis.xform and axis.xform.type == "bin"
      min = axis.xform.min
      max = axis.xform.max
      numBins = axis.xform.numBins

      # Calculate precision
      precision = d3Format.precisionFixed((max - min) / numBins)
      format = d3Format.format(",." + precision + "f")

      categories = []
      categories.push({ value: 0, label: "< #{format(min)}"})
      for i in [1..numBins]
        start = (i-1) / numBins * (max - min) + min
        end = (i) / numBins * (max - min) + min
        categories.push({ value: i, label: "#{format(start)} - #{format(end)}"})
      categories.push({ value: axis.xform.numBins + 1, label: "> #{format(max)}"})

      return categories

    if axis.xform and axis.xform.type == "month"
      return [
        { value: "01", label: "January" }
        { value: "02", label: "February" }
        { value: "03", label: "March" }
        { value: "04", label: "April" }
        { value: "05", label: "May" }
        { value: "06", label: "June" }
        { value: "07", label: "July" }
        { value: "08", label: "August" }
        { value: "09", label: "September" }
        { value: "10", label: "October" }
        { value: "11", label: "November" }
        { value: "12", label: "December" }
      ]
    switch @getAxisType(axis)
      when "enum"
        # If enum, return enum values
        return _.map(@exprBuilder.getExprValues(axis.expr), (ev) -> { value: ev.id, label: ev.name })
      when "integer"
        # Handle none
        if values.length == 0
          return []

        # Integers are sometimes strings from database, so always parseInt (bigint in node-postgres)
        min = _.min(_.map(values, (v) -> parseInt(v)))
        max = _.max(_.map(values, (v) -> parseInt(v)))

        return _.map(_.range(min, max + 1), (v) -> { value: v, label: "#{v}"})
      when "text"
        # Return unique values
        return _.map(_.uniq(values), (v) -> { value: v, label: v })

    return []

  # Get type of axis output
  getAxisType: (axis) ->
    if not axis
      return null

    if axis.aggr == "count"
      return "integer"

    if axis.xform and axis.xform.type == "bin"
      return "enum"

    return @exprBuilder.getExprType(axis.expr)

  # Summarize axis as a string
  summarizeAxis: (axis) ->
    if not axis
      return "None"

    exprType = @exprBuilder.getExprType(axis.expr)

    # Add aggr if not a count type
    if axis.aggr and exprType != "count"
      aggrName = _.findWhere(@exprBuilder.getAggrs(axis.expr), { id: axis.aggr }).name
      return aggrName + " " + @exprBuilder.summarizeExpr(axis.expr)
    else
      return @exprBuilder.summarizeExpr(axis.expr)
    # TODO add xform support

  # Get a string representation of an axis value
  formatValue: (axis, value) ->
    if not value?
      return "None"

    # If has categories, use those
    categories = @getCategories(axis, [])
    if categories.length > 0
      category = _.findWhere(categories, value: value)
      if category
        return category.label
      else
        return "???"


    # Format as string if number
    if _.isNumber(value)
      return d3Format.format(",")(value)

    # TODO format dates
    return "" + value

  # Creates a filter (jsonql with {alias} for table name) based on a specific value
  # of the axis. Used to filter by a specific point.
  createValueFilter: (axis, value) ->
    if value?
      return {
        type: "op"
        op: "="
        exprs: [
          @compileAxis(axis: axis, tableAlias: "{alias}")
          { type: "literal", value: value }
        ]
      }
    else
      return {
        type: "op"
        op: "is null"
        exprs: [
          @compileAxis(axis: axis, tableAlias: "{alias}")
        ]
      }
