_ = require 'lodash'
ExprCompiler = require('mwater-expressions').ExprCompiler
ExprUtils = require('mwater-expressions').ExprUtils
AxisBuilder = require '../../../axes/AxisBuilder'
injectTableAlias = require('mwater-expressions').injectTableAlias

PivotChartUtils = require './PivotChartUtils'

# Builds pivot table queries. 
# Result is flat list containing each cell with data for a single section of the grid
# columns of result are: 
#  value: value of the cell (aggregate)
#  r0: row segment value (if present)
#  r1: inner row segment value (if present)
#  ...
#  c0: column segment value (if present)
#  c1: inner column segment value (if present)
#  ...
module.exports = class PivotChartQueryBuilder 
  # Pass in schema
  constructor: (options) ->
    @schema = options.schema
    @exprUtils = new ExprUtils(@schema)
    @axisBuilder = new AxisBuilder(schema: @schema)

  # Create the queries needed for the chart.
  # extraFilters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. }
  # Queries are indexed by intersection id, as one query is made for each intersection
  createQueries: (design, extraFilters) ->
    exprCompiler = new ExprCompiler(@schema)

    queries = {}

    # For each intersection
    for rowPath in PivotChartUtils.getSegmentPaths(design.rows)
      for columnPath in PivotChartUtils.getSegmentPaths(design.columns)
        
        # Get id of intersection
        intersectionId = _.pluck(rowPath, "id").join(",") + ":" + _.pluck(columnPath, "id").join(",")

        # Get intersection
        intersection = design.intersections[intersectionId]

        # Create shell of query
        query = {
          type: "query"
          selects: []
          from: exprCompiler.compileTable(design.table, "main")
          limit: 1000
          groupBy: []
        }

        # Add value
        query.selects.push({
          type: "select"
          expr: @axisBuilder.compileAxis(axis: intersection?.valueAxis, tableAlias: "main")
          alias: "value"
        })

        # Add segments
        for rowSegment, i in rowPath
          query.selects.push({
            type: "select"
            expr: @axisBuilder.compileAxis(axis: rowSegment.valueAxis, tableAlias: "main")
            alias: "r#{i}"
          })
          query.groupBy.push(i + 2)

        for columnSegment, i in columnPath
          query.selects.push({
            type: "select"
            expr: @axisBuilder.compileAxis(axis: columnSegment.valueAxis, tableAlias: "main")
            alias: "c#{i}"
          })
          query.groupBy.push(i + 2 + rowPath.length)

        # Add where
        whereClauses = []
        if design.filter
          whereClauses.push(@compileExpr(design.filter))

        # Add filters
        if extraFilters and extraFilters.length > 0
          # Get relevant filters
          relevantFilters = _.where(extraFilters, table: design.table)

        if whereClauses.length == 1
          query.where = whereClauses[0]
        else if whereClauses.length > 1
          query.where = { type: "op", op: "and", exprs: whereClauses }

        queries[intersectionId] = query

    return queries
