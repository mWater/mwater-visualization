_ = require 'lodash'
uuid = require 'uuid'
ExprCompiler = require('mwater-expressions').ExprCompiler
ExprValidator = require('mwater-expressions').ExprValidator
ExprUtils = require('mwater-expressions').ExprUtils
ExprCleaner = require('mwater-expressions').ExprCleaner
d3Format = require 'd3-format'
moment = require 'moment'
React = require 'react'
R = React.createElement
produce = require('immer').default

xforms = [
  { type: "bin", input: "number", output: "enum" }
  { type: "ranges", input: "number", output: "enum" }
  { type: "floor", input: "number", output: "enum" }
  { type: "date", input: "datetime", output: "date" }
  { type: "year", input: "date", output: "date" }
  { type: "year", input: "datetime", output: "date" }
  { type: "yearmonth", input: "date", output: "date" }
  { type: "yearmonth", input: "datetime", output: "date" }
  { type: "yearquarter", input: "date", output: "enum" }
  { type: "yearquarter", input: "datetime", output: "enum" }
  { type: "yearweek", input: "date", output: "enum" }
  { type: "yearweek", input: "datetime", output: "enum" }
  { type: "month", input: "date", output: "enum" }
  { type: "month", input: "datetime", output: "enum" }
  { type: "week", input: "date", output: "enum" }
  { type: "week", input: "datetime", output: "enum" }
]

# Small number to prevent width_bucket errors on auto binning with only one value
epsilon = 0.000000001

# Understands axes. Contains methods to clean/validate etc. an axis of any type. 
module.exports = class AxisBuilder
  # Options are: schema
  constructor: (options) ->
    @schema = options.schema
    @exprUtils = new ExprUtils(@schema)
    @exprCleaner = new ExprCleaner(@schema)
    @exprValidator = new ExprValidator(@schema)

  # Clean an axis with respect to a specific table
  # Options:
  #  axis: axis to clean
  #  table: table that axis is to be for
  #  aggrNeed is "none", "optional" or "required"
  #  types: optional list of types to require it to be one of
  cleanAxis: (options) ->
    axis = options.axis

    if not axis
      return

    # Move aggr inside since aggr is deprecated at axis level DEPRECATED
    if axis.aggr and axis.expr
      axis.expr = { type: "op", op: axis.aggr, table: axis.expr.table, exprs: (if axis.aggr != "count" then [axis.expr] else []) }
      delete axis.aggr

    # Determine aggrStatuses that are possible
    switch options.aggrNeed
      when "none"
        aggrStatuses = ["literal", "individual"]
      when "optional"
        aggrStatuses = ["literal", "individual", "aggregate"]
      when "required"
        aggrStatuses = ["literal", "aggregate"]

    # Clean expression
    expr = @exprCleaner.cleanExpr(axis.expr, { table: options.table, aggrStatuses: aggrStatuses })
    if not expr
      return null
      
    type = @exprUtils.getExprType(expr)

    # Validate xform type
    xform = null

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

    # If no xform and using an xform would allow satisfying output types, pick first
    if not xform and options.types and type and type not in options.types
      xform = _.find(xforms, (xf) -> xf.input == type and xf.output in options.types)
      if not xform
        # Unredeemable if no xform possible and cannot use count to get number
        if options.aggrNeed == "none" 
          return null
        if "number" not in options.types or type != "id"
          return null

    axis = produce(axis, (draft) =>
      draft.expr = expr

      if not xform and axis.xform
        delete draft.xform
      else if xform and (not axis.xform or axis.xform.type != xform.type)
        draft.xform = { type: xform.type }

      if draft.xform and draft.xform.type == "bin"
        # Add number of bins
        if not draft.xform.numBins
          draft.xform.numBins = 5

      if draft.xform and draft.xform.type == "ranges"
        # Add ranges
        if not draft.xform.ranges
          draft.xform.ranges = [{ id: uuid(), minOpen: false, maxOpen: true }]

      return
    )
    
    return axis

  # Checks whether an axis is valid
  #  axis: axis to validate
  validateAxis: (options) ->
    # Nothing is ok
    if not options.axis
      return

    # Validate expression
    error = @exprValidator.validateExpr(options.axis.expr)
    if error
      return error

    # xform validation
    if options.axis.xform and options.axis.xform.type == "bin"
      if not options.axis.xform.numBins
        return "Missing numBins"
      if not options.axis.xform.min?
        return "Missing min"
      if not options.axis.xform.max?
        return "Missing max"
      if options.axis.xform.max < options.axis.xform.min
        return "Max < min"

    # xform validation
    if options.axis.xform and options.axis.xform.type == "ranges"
      if not options.axis.xform.ranges or not _.isArray(options.axis.xform.ranges)
        return "Missing ranges"
      for range in options.axis.xform.ranges
        if range.minValue? and range.maxValue? and range.minValue > range.maxValue
          return "Max < min"

    return

  # Pass axis, tableAlias
  compileAxis: (options) ->
    if not options.axis
      return null

    # Legacy support of aggr
    expr = options.axis.expr
    if options.axis.aggr
      expr = { type: "op", op: options.axis.aggr, table: expr.table, exprs: (if options.axis.aggr != "count" then [expr] else []) }

    exprCompiler = new ExprCompiler(@schema)
    compiledExpr = exprCompiler.compileExpr(expr: expr, tableAlias: options.tableAlias)

    # Bin
    if options.axis.xform 
      if options.axis.xform.type == "bin"
        min = options.axis.xform.min
        max = options.axis.xform.max
        # Add epsilon to prevent width_bucket from crashing
        if max == min
          max += epsilon
        if max == min # If was too big to add epsilon
          max = min * 1.00001

        # Special case for excludeUpper as we need to include upper bound (e.g. 100 for percentages) in the lower bin. Do it by adding epsilon
        if options.axis.xform.excludeUpper
          thresholds = _.map(_.range(0, options.axis.xform.numBins), (bin) -> min + (max-min)*bin/options.axis.xform.numBins)
          thresholds.push(max + epsilon)
          compiledExpr = {
            type: "op"
            op: "width_bucket"
            exprs: [
              { type: "op", op: "::decimal", exprs: [compiledExpr] }
              { type: "literal", value: thresholds }
            ]
          }
        else
          compiledExpr = {
            type: "op"
            op: "width_bucket"
            exprs: [
              compiledExpr
              min
              max
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

      if options.axis.xform.type == "week"
        compiledExpr = {
          type: "op"
          op: "to_char"
          exprs: [
            { type: "op", op: "::date", exprs: [compiledExpr] }
            "IW"
          ]
        }

      if options.axis.xform.type == "yearquarter"
        compiledExpr = {
          type: "op"
          op: "to_char"
          exprs: [
            { type: "op", op: "::date", exprs: [compiledExpr] }
            "YYYY-Q"
          ]
        }

      if options.axis.xform.type == "yearweek"
        compiledExpr = {
          type: "op"
          op: "to_char"
          exprs: [
            { type: "op", op: "::date", exprs: [compiledExpr] }
            "IYYY-IW"
          ]
        }

      # Ranges
      if options.axis.xform.type == "ranges"
        cases = []
        for range in options.axis.xform.ranges
          whens = []
          if range.minValue?
            if range.minOpen
              whens.push({ type: "op", op: ">", exprs: [compiledExpr, range.minValue] })
            else
              whens.push({ type: "op", op: ">=", exprs: [compiledExpr, range.minValue] })

          if range.maxValue?
            if range.maxOpen
              whens.push({ type: "op", op: "<", exprs: [compiledExpr, range.maxValue] })
            else
              whens.push({ type: "op", op: "<=", exprs: [compiledExpr, range.maxValue] })

          if whens.length > 1
            cases.push({
              when: {
                type: "op"
                op: "and"
                exprs: whens
              }
              then: range.id
            })
          else if whens.length == 1
            cases.push({
              when: whens[0]
              then: range.id
            })

        if cases.length > 0 
          compiledExpr = {
            type: "case"
            cases: cases
          }
        else
          compiledExpr = null
      
      if options.axis.xform.type == "floor"
        compiledExpr = {
          type: "op"
          op: "floor"
          exprs: [compiledExpr]
        }

    return compiledExpr

  # Create query to get min and max for a nice binning. Returns one row with "min" and "max" fields
  # To do so, split into numBins + 2 percentile sections and exclude first and last
  # That will give a nice distribution when using width_bucket so that all are used
  # select max(inner.val), min(inner.val) f
  # from (select expression as val, ntile(numBins + 2) over (order by expression asc) as ntilenum
  # from the_table where exprssion is not null)
  # where inner.ntilenum > 1 and inner.ntilenum < numBins + 2
  # Inspired by: http://dba.stackexchange.com/questions/17086/fast-general-method-to-calculate-percentiles
  # expr is mwater expression on table
  # filterExpr is optional filter on values to include
  # Result can be null if no query could be computed
  compileBinMinMax: (expr, table, filterExpr, numBins) ->
    exprCompiler = new ExprCompiler(@schema)
    compiledExpr = exprCompiler.compileExpr(expr: expr, tableAlias: "binrange")

    if not compiledExpr
      return null

    # Create expression that selects the min or max
    minExpr = { type: "op", op: "min", exprs: [{ type: "field", tableAlias: "inner", column: "val" }]}
    maxExpr = { type: "op", op: "max", exprs: [{ type: "field", tableAlias: "inner", column: "val" }]}

    # Only include not null values
    where = {
      type: "op"
      op: "is not null"
      exprs: [compiledExpr]
    }

    # If filtering, compile and add to inner where
    if filterExpr
      compiledFilterExpr = exprCompiler.compileExpr(expr: filterExpr, tableAlias: "binrange")
      if compiledFilterExpr
        where = { type: "op", op: "and", exprs: [where, compiledFilterExpr] }

    query = {
      type: "query"
      selects: [
        { type: "select", expr: minExpr, alias: "min" }
        { type: "select", expr: maxExpr, alias: "max" }
      ]
      from: {
        type: "subquery"
        query: {
          type: "query"
          selects: [
            { type: "select", expr: compiledExpr, alias: "val" }
            { 
              type: "select"
              expr: { 
                type: "op"
                op: "ntile"
                exprs: [numBins + 2]
              }
              over: { 
                orderBy: [{ expr: compiledExpr, direction: "asc" }]
              } 
              alias: "ntilenum" 
            }
          ]
          from: { type: "table", table: table, alias: "binrange" }
          where: where
        }
        alias: "inner"
      }
      where: {
        type: "op"
        op: "between"
        exprs: [{ type: "field", tableAlias: "inner", column: "ntilenum" }, 2, numBins + 1]
      }
    }
    return query

  # Get underlying expression types that will give specified output expression types
  #  types: array of types
  getExprTypes: (types) ->
    if not types
      return null
      
    types = types.slice()

    # Add xformed types
    for xform in xforms
      if xform.output in types
        types = _.union(types, [xform.input])

    return types

  # Gets the color for a value (if in colorMap)
  getValueColor: (axis, value) ->
    item = _.find(axis.colorMap, (item) => item.value == value)
    if item
      return item.color
    return null

  # Get all categories for a given axis type given the known values
  # Returns array of { value, label }
  getCategories: (axis, values, locale) ->
    noneCategory = { value: null, label: axis.nullLabel or "None" }

    # Handle ranges
    if axis.xform and axis.xform.type == "ranges"
      return _.map(axis.xform.ranges, (range) =>
        label = range.label or ""
        if not label
          if range.minValue?
            if range.minOpen
              label = "> #{range.minValue}"
            else
              label = ">= #{range.minValue}"

          if range.maxValue?
            if label
              label += " and "
            if range.maxOpen
              label += "< #{range.maxValue}"
            else
              label += "<= #{range.maxValue}"

        return {
          value: range.id
          label: label
        }
      ).concat([noneCategory])

    # Handle binning 
    if axis.xform and axis.xform.type == "bin"
      min = axis.xform.min
      max = axis.xform.max
      numBins = axis.xform.numBins

      # If not ready, no categories
      if not min? or not max? or not numBins
        return []

      # Special case of single value (min and max within epsilon or 0.01% of each other since epsilon might be too small to add to a big number)
      if (max - min) <= epsilon or Math.abs((max - min)/(max + min)) < 0.0001
        return [
          { value: 0, label: "< #{min}"}
          { value: 1, label: "= #{min}"}
          { value: axis.xform.numBins + 1, label: "> #{min}"}
          noneCategory
        ]

      # Calculate precision
      precision = d3Format.precisionFixed((max - min) / numBins)
      if _.isNaN(precision)
        throw new Error("Min/max errors: #{min} #{max} #{numBins}")
        
      format = d3Format.format(",." + precision + "f")

      categories = []
  
      if not axis.xform.excludeLower
        categories.push({ value: 0, label: "< #{format(min)}"})
  
      for i in [1..numBins]
        start = (i-1) / numBins * (max - min) + min
        end = (i) / numBins * (max - min) + min
        categories.push({ value: i, label: "#{format(start)} - #{format(end)}"})
  
      if not axis.xform.excludeUpper
        categories.push({ value: axis.xform.numBins + 1, label: "> #{format(max)}"})
  
      categories.push(noneCategory)

      return categories

    # Handle floor
    if axis.xform and axis.xform.type == "floor"
      # Get min and max
      min = _.min(_.filter(values, (v) => v?))
      max = _.max(_.filter(values, (v) => v?))
      hasNull = _.filter(values, (v) => not v?).length > 0
      if not _.isFinite(min) or not _.isFinite(max)
        return [noneCategory]

      # Floor and get range
      if max - min > 50
        max = min + 50
      categories = []

      for value in _.range(Math.floor(min), Math.floor(max) + 1)
        categories.push({ value: value, label: "" + value })
      if hasNull
        categories.push(noneCategory)
      return categories

    if axis.xform and axis.xform.type == "month"
      categories = [
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

      # Add none if needed
      if _.any(values, (v) -> not v?)
        categories.push(noneCategory)

      return categories

    if axis.xform and axis.xform.type == "week"
      categories = []
      for week in [1..53]
        value = "" + week
        if value.length == 1
          value = "0" + value
        categories.push({ value: value, label: value })

      # Add none if needed
      if _.any(values, (v) -> not v?)
        categories.push(noneCategory)

      return categories

    if axis.xform and axis.xform.type == "year"
      hasNone = _.any(values, (v) -> not v?)
      values = _.compact(values)
      if values.length == 0 
        return [noneCategory]

      # Get min and max
      min = _.min(_.map(values, (date) -> parseInt(date.substr(0, 4))))
      max = _.max(_.map(values, (date) -> parseInt(date.substr(0, 4))))
      categories = []
      for year in [min..max]
        categories.push({ value: "#{year}-01-01", label: "#{year}"})
        if categories.length >= 1000
          break

      # Add none if needed
      if hasNone
        categories.push(noneCategory)

      return categories

    if axis.xform and axis.xform.type == "yearmonth"
      hasNone = _.any(values, (v) -> not v?)
      values = _.compact(values)
      if values.length == 0 
        return [noneCategory]

      # Get min and max
      min = values.sort()[0]
      max = values.sort().slice(-1)[0]

      # Use moment to get range
      current = moment(min, "YYYY-MM-DD")
      end = moment(max, "YYYY-MM-DD")
      categories = []
      while not current.isAfter(end)
        categories.push({ value: current.format("YYYY-MM-DD"), label: current.format("MMM YYYY")})
        current.add(1, "months")
        if categories.length >= 1000
          break

      # Add none if needed
      if hasNone
        categories.push(noneCategory)

      return categories

    if axis.xform and axis.xform.type == "yearweek"
      hasNone = _.any(values, (v) -> not v?)
      values = _.compact(values)
      if values.length == 0 
        return [noneCategory]

      # Get min and max
      min = values.sort()[0]
      max = values.sort().slice(-1)[0]

      # Use moment to get range
      current = moment(min, "GGGG-WW")
      end = moment(max, "GGGG-WW")
      categories = []
      while not current.isAfter(end)
        categories.push({ value: current.format("GGGG-WW"), label: current.format("GGGG-WW")})
        current.add(1, "weeks")
        if categories.length >= 1000
          break

      # Add none if needed
      if hasNone
        categories.push(noneCategory)

      return categories

    if axis.xform and axis.xform.type == "yearquarter"
      hasNone = _.any(values, (v) -> not v?)
      values = _.compact(values)
      if values.length == 0 
        return [noneCategory]

      # Get min and max
      min = values.sort()[0]
      max = values.sort().slice(-1)[0]

      # Use moment to get range
      current = moment(min, "YYYY-Q")
      end = moment(max, "YYYY-Q")
      categories = []
      while not current.isAfter(end)
        value = current.format("YYYY-Q")
        quarter = current.format("Q")
        year = current.format("YYYY")
        if quarter == "1"
          label = "#{year} Jan-Mar"
        if quarter == "2"
          label = "#{year} Apr-Jun"
        if quarter == "3"
          label = "#{year} Jul-Sep"
        if quarter == "4"
          label = "#{year} Oct-Dec"
        categories.push({ value: value, label: label })
        current.add(1, "quarters")
        if categories.length >= 1000
          break

      # Add none if needed
      if hasNone
        categories.push(noneCategory)

      return categories

    switch @getAxisType(axis)
      when "enum", "enumset"
        # If enum, return enum values
        return _.map(@exprUtils.getExprEnumValues(axis.expr), (ev) -> { value: ev.id, label: ExprUtils.localizeString(ev.name, locale) }).concat([noneCategory])
      when "text"
        # Return unique values
        hasNone = _.any(values, (v) -> not v?)
        categories = _.map(_.compact(_.uniq(values)).sort(), (v) -> { value: v, label: v or "None" })
        if hasNone
          categories.push(noneCategory)
          
        return categories
      when "boolean"
        # Return unique values
        return [{ value: true, label: "True" }, { value: false, label: "False" }, noneCategory]
      when "date"
        values = _.compact(values)
        if values.length == 0 
          return [noneCategory]

        # Get min and max
        min = values.sort()[0]
        max = values.sort().slice(-1)[0]

        # Use moment to get range
        current = moment(min, "YYYY-MM-DD")
        end = moment(max, "YYYY-MM-DD")
        categories = []
        while not current.isAfter(end)
          categories.push({ value: current.format("YYYY-MM-DD"), label: current.format("ll")})
          current.add(1, "days")
          if categories.length >= 1000
            break
        categories.push(noneCategory)
        return categories

    return []

  # Get type of axis output
  getAxisType: (axis) ->
    if not axis
      return null

    # DEPRECATED
    if axis.aggr == "count"
      return "number"

    type = @exprUtils.getExprType(axis.expr)

    if axis.xform 
      xform = _.findWhere(xforms, { type: axis.xform.type, input: type })
      return xform.output

    return type

  # Determines if axis is aggregate
  isAxisAggr: (axis) ->
    # Legacy support of axis.aggr
    return axis? and (axis.aggr or @exprUtils.getExprAggrStatus(axis.expr) == "aggregate")

  # Summarize axis as a string
  summarizeAxis: (axis, locale) ->
    if not axis
      return "None"

    return @exprUtils.summarizeExpr(axis.expr, locale)
    # TODO add xform support

  # Get a string (or React DOM actually) representation of an axis value
  formatValue: (axis, value, locale) ->
    if not value?
      return axis.nullLabel or "None"

    type = @getAxisType(axis)

    # If has categories, use those
    categories = @getCategories(axis, [value], locale)
    if categories.length > 0
      if type == "enumset"
        # Parse if string
        if _.isString(value)
          value = JSON.parse(value)
        return _.map(value, (v) ->
          category = _.findWhere(categories, value: v)
          if category
            return category.label
          else
            return "???"
        ).join(", ")
      else
        category = _.findWhere(categories, value: value)
        if category
          return category.label
        else
          return "???"

    switch type
      when "text"
        return value
      when "number"
        num = parseFloat(value)
        format = d3Format.format(if axis.format? then axis.format else ",")
        # Do not convert % (d3Format multiplies by 100 which is annoying)
        if axis.format and axis.format.match(/%/)
          num = num / 100.0
        return format(num)
      when "text[]"
        # Parse if string
        if _.isString(value)
          value = JSON.parse(value)
        return R('div', null, _.map(value, (v, i) -> R('div', key: i, v)))
      when "date"
        return moment(value, moment.ISO_8601).format("ll")
      when "datetime"
        return moment(value, moment.ISO_8601).format("lll")

    return "" + value

  # Creates a filter (jsonql with {alias} for table name) based on a specific value
  # of the axis. Used to filter by a specific point/bar.
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

  # Creates a filter expression (mwater-expression) based on a specific value
  # of the axis. Used to filter by a specific point/bar.
  createValueFilterExpr: (axis, value) ->
    axisExpr = @convertAxisToExpr(axis)
    axisExprType = @exprUtils.getExprType(axisExpr)

    if value?
      return {
        table: axis.expr.table
        type: "op"
        op: "="
        exprs: [
          axisExpr
          { type: "literal", valueType: axisExprType, value: value }
        ]
      }
    else
      return {
        table: axis.expr.table
        type: "op"
        op: "is null"
        exprs: [
          axisExpr
        ]
      }

  isCategorical: (axis) ->
    nonCategoricalTypes = ["bin", "ranges", "date", "yearmonth", "floor"]
    if axis.xform
      type = axis.xform.type
    else
      type = @exprUtils.getExprType(axis.expr)

    return nonCategoricalTypes.indexOf(type) == -1

  # Converts an axis to an expression (mwater-expression)
  convertAxisToExpr: (axis) ->
    expr = axis.expr
    table = expr.table

    # Bin
    if axis.xform 
      xform = axis.xform
      if xform.type == "bin"
        min = xform.min
        max = xform.max
        # Add epsilon to prevent width_bucket from crashing
        if max == min
          max += epsilon
        if max == min # If was too big to add epsilon
          max = min * 1.00001

        # if xform.excludeUpper
        # Create op least(greatest(floor((expr - min)/((max - min) / numBins)) - (-1), 0), numBins + 1)
        expr = { table: table, type: "op", op: "-", exprs: [expr, { type: "literal", valueType: "number", value: min }] }
        expr = { table: table, type: "op", op: "/", exprs: [expr, { type: "literal", valueType: "number", value: (max - min) / xform.numBins }] }
        expr = { table: table, type: "op", op: "floor", exprs: [expr] }
        expr = { table: table, type: "op", op: "+", exprs: [expr, { type: "literal", valueType: "number", value: 1 }] } 
        expr = { table: table, type: "op", op: "greatest", exprs: [expr, { type: "literal", valueType: "number", value: 0 }] } 
        expr = { table: table, type: "op", op: "least", exprs: [expr, { type: "literal", valueType: "number", value: xform.numBins + 1 }] } 
        
        # Handle nulls specially
        expr = { table: table, type: "case", cases: [{ when: { table: table, type: "op", op: "is null", exprs: [axis.expr] }, then: null }], else: expr }

        # Special case for excludeUpper as we need to include upper bound (e.g. 100 for percentages) in the lower bin
        if xform.excludeUpper
          expr.cases.push({ 
            when: { table: table, type: "op", op: "=", exprs: [axis.expr, { type: "literal", valueType: "number", value: max }] }, 
            then: { type: "literal", valueType: "number", value: xform.numBins } 
          })

      if xform.type == "date"
        expr = {
          table: table
          type: "op"
          op: "to date"
          exprs: [expr]
        }

      if xform.type == "year"
        expr = {
          table: table
          type: "op"
          op: "year"
          exprs: [expr]
        }

      if xform.type == "yearmonth"
        expr = {
          table: table
          type: "op"
          op: "yearmonth"
          exprs: [expr]
        }

      if xform.type == "month"
        expr = {
          table: table
          type: "op"
          op: "month"
          exprs: [expr]
        }

      if xform.type == "week"
        expr = {
          table: table
          type: "op"
          op: "weekofyear"
          exprs: [expr]
        }

      if xform.type == "yearquarter"
        expr = {
          table: table
          type: "op"
          op: "yearquarter"
          exprs: [expr]
        }

      if xform.type == "yearweek"
        expr = {
          table: table
          type: "op"
          op: "yearweek"
          exprs: [expr]
        }

      # Ranges
      if xform.type == "ranges"
        cases = []
        for range in xform.ranges
          whens = []
          if range.minValue?
            if range.minOpen
              whens.push({ table: table, type: "op", op: ">", exprs: [expr, { type: "literal", valueType: "number", value: range.minValue }] })
            else
              whens.push({ table: table, type: "op", op: ">=", exprs: [expr, { type: "literal", valueType: "number", value: range.minValue }] })

          if range.maxValue?
            if range.maxOpen
              whens.push({ table: table, type: "op", op: "<", exprs: [expr, { type: "literal", valueType: "number", value: range.maxValue }] })
            else
              whens.push({ table: table, type: "op", op: "<=", exprs: [expr, { type: "literal", valueType: "number", value: range.maxValue }] })

          if whens.length > 1
            cases.push({
              when: {
                table: table
                type: "op"
                op: "and"
                exprs: whens
              }
              then: { type: "literal", valueType: "enum", value: range.id }
            })
          else if whens.length == 1
            cases.push({
              when: whens[0]
              then: { type: "literal", valueType: "enum", value: range.id }
            })

        if cases.length > 0 
          expr = {
            table: table
            type: "case"
            cases: cases
          }
        else
          expr = null
      
      if xform.type == "floor"
        expr = {
          table: table
          type: "op"
          op: "floor"
          exprs: [expr]
        }

    return expr

