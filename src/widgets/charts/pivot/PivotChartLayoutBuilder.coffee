_ = require 'lodash'
# ExprCompiler = require('mwater-expressions').ExprCompiler
ExprUtils = require('mwater-expressions').ExprUtils
AxisBuilder = require '../../../axes/AxisBuilder'
# injectTableAlias = require('mwater-expressions').injectTableAlias

PivotChartUtils = require './PivotChartUtils'

# Builds pivot table layout from the design and data
# See PivotChart Design.md for more detauls
module.exports = class PivotChartLayoutBuilder 
  # Pass in schema
  constructor: (options) ->
    @schema = options.schema
    @exprUtils = new ExprUtils(@schema)
    @axisBuilder = new AxisBuilder(schema: @schema)

  buildLayout: (design, data) ->

    # Get all columns

    # Get all rows

    # Emit column headers
    # Emit main section


  # Get rows or columns in format of array of
  # [{ segment:, label:, value:  }, ...] 
  # For segments with no children, there will be an array of single value array entries (array of array)
  # data is lookup of query results by intersection id
  # parentSegments are ancestry of current segment, starting with root
  getRowsOrColumns: (isRow, segment, data, locale, parentSegments = [], parentValues = []) ->
    # If no axis, categories are just null
    if not segment.valueAxis
      categories = [{ value: null, label: segment.label }]
    else
      # Find all values (needed for category finding of axis)
      allValues = []

      # To find all values, first need all intersections that are relevant
      for intersectionId, intersectionData of data
        # Get segment ids
        if isRow
          segIds = intersectionId.split(":")[0].split(",")
        else
          segIds = intersectionId.split(":")[1].split(",")

        # Ensure that matches any parent segments passed in plus self
        if not _.isEqual(_.take(segIds, parentSegments.length + 1), _.pluck(parentSegments, "id").concat(segment.id))
          continue

        # Only take data that matches any parent values
        relevantData = _.filter(intersectionData, (dataRow) =>
          for parentValue, i in parentValues
            if isRow
              if dataRow["r#{i}"] != parentValue
                return false
            else
              if dataRow["c#{i}"] != parentValue
                return false

          return true
        )

        allValues = allValues.concat(_.pluck(relevantData, "c#{parentSegments.length}"))

      # Get categories
      categories = @axisBuilder.getCategories(segment.valueAxis, allValues, locale)

    # If no children segments, return 
    if not segment.children or segment.children.length == 0
      return _.map(categories, (category) -> [{ segment: segment, value: category.value, label: category.label }])

    # For each category, get children and combine into results
    results = []
    for category in categories
      for childSegment in segment.children
        # Get child results
        childResults = @getRowsOrColumns(isRow, childSegment, data, locale, parentSegments.concat([segment]), parentValues.concat([category.value]))

        for childResult in childResults
          results.push([{ segment: segment, value: category.value, label: category.label }].concat(childResult))

    return results