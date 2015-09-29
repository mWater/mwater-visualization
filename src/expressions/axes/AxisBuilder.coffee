_ = require 'lodash'
ExpressionCompiler = require '../ExpressionCompiler'
ExpressionBuilder = require '../ExpressionBuilder'
d3Format = require 'd3-format'

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

    # Remove bin xform if not decimal/integer 
    if type not in ['decimal', "integer"] and axis.xform and axis.xform.type == "bin"
      delete axis.xform

    # Remove bin xform if not allowed enum
    if options.types and axis.xform and axis.xform.type == "bin" and "enum" not in options.types
      delete axis.xform

    # Force not allowed type and are allowed enum if decimal
    if not axis.xform and options.types and type not in options.types and 'enum' in options.types
      # Min max will be calculated by axis component
      axis.xform = { type: "bin" }

    # Add number of bins
    if axis.xform and axis.xform.type == "bin" and not axis.xform.numBins
      axis.xform.numBins = 6

    # Get xformed type
    if axis.xform and axis.xform.type == "bin"
      type = "enum"

    # If not aggregating, can't get to integer (count)
    if options.aggrNeed == "none" and options.types and type not in options.types
      return null
    if options.types and type not in options.types and "integer" not in options.types
      return null

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
    if options.axis.xform and options.axis.xform.type == "bin"
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

    # Add decimal, integer if can bin
    if "enum" in types
      types = _.union(types, ["integer", "decimal"])

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

      cats = []
      cats.push({ value: 0, label: "< #{format(min)}"})
      for i in [1..numBins]
        start = (i-1) / numBins * (max - min) + min
        end = (i) / numBins * (max - min) + min
        console.log start
        console.log end
        cats.push({ value: i, label: "#{format(start)} - #{format(end)}"})
      cats.push({ value: axis.xform.numBins + 1, label: "> #{format(max)}"})

      return cats

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
  stringifyLiteral: (axis, value) ->
    # TODO add aggr support, xform support
    return @exprBuilder.stringifyExprLiteral(axis.expr, value)

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
