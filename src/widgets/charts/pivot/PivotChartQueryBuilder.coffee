_ = require 'lodash'
ExprCompiler = require('mwater-expressions').ExprCompiler
ExprUtils = require('mwater-expressions').ExprUtils
AxisBuilder = require '../../../axes/AxisBuilder'
injectTableAlias = require('mwater-expressions').injectTableAlias

PivotChartUtils = require './PivotChartUtils'

# Builds pivot table queries. 
# Result is flat list for each intersection with each row being data for a single cell
# columns of result are: 
#  value: value of the cell (aggregate)
#  r0: row segment value (if present)
#  r1: inner row segment value (if present)
#  ...
#  c0: column segment value (if present)
#  c1: inner column segment value (if present)
#  ...
# Also produces queries needed to order row/column segments when ordered
# These are indexed by the segment id and contain the values in order (already asc/desc corrected)
# each row containing only { value: }
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
        intersectionId = PivotChartUtils.getIntersectionId(rowPath, columnPath)

        # Get intersection
        intersection = design.intersections[intersectionId]

        # Create shell of query
        query = {
          type: "query"
          selects: []
          from: exprCompiler.compileTable(design.table, "main")
          limit: 10000
          groupBy: []
        }

        # Filters to add (not yet compiled)
        filters = []

        # Add segments
        for rowSegment, i in rowPath
          query.selects.push({
            type: "select"
            expr: @axisBuilder.compileAxis(axis: rowSegment.valueAxis, tableAlias: "main")
            alias: "r#{i}"
          })
          query.groupBy.push(i + 1)
          if rowSegment.filter
            filters.push(rowSegment.filter)

        for columnSegment, i in columnPath
          query.selects.push({
            type: "select"
            expr: @axisBuilder.compileAxis(axis: columnSegment.valueAxis, tableAlias: "main")
            alias: "c#{i}"
          })
          query.groupBy.push(i + 1 + rowPath.length)
          if columnSegment.filter
            filters.push(columnSegment.filter)

        # Add value
        query.selects.push({
          type: "select"
          expr: @axisBuilder.compileAxis(axis: intersection?.valueAxis, tableAlias: "main")
          alias: "value"
        })
        if intersection?.filter
          filters.push(intersection.filter)

        # Add background color
        if intersection?.backgroundColorAxis
          query.selects.push({
            type: "select"
            expr: @axisBuilder.compileAxis(axis: intersection?.backgroundColorAxis, tableAlias: "main")
            alias: "bc"
          })

        # Add background color conditions
        for backgroundColorCondition, i in intersection.backgroundColorConditions or []
          query.selects.push({
            type: "select"
            expr: exprCompiler.compileExpr(expr: backgroundColorCondition.condition, tableAlias: "main")
            alias: "bcc#{i}"
          })

        # If all selects are null, don't create query
        if _.all(query.selects, (select) -> not select.expr?)
          continue

        # Add where
        whereClauses = []
        if design.filter
          whereClauses.push(exprCompiler.compileExpr(expr: design.filter, tableAlias: "main"))

        # Add other filters
        whereClauses = whereClauses.concat(_.map(filters, (filter) -> exprCompiler.compileExpr(expr: filter, tableAlias: "main")))

        # Add filters
        if extraFilters and extraFilters.length > 0
          # Get relevant filters
          relevantFilters = _.where(extraFilters, table: design.table)

          # Add filters
          for filter in relevantFilters
            whereClauses.push(injectTableAlias(filter.jsonql, "main"))

        whereClauses = _.compact(whereClauses)

        if whereClauses.length == 1
          query.where = whereClauses[0]
        else if whereClauses.length > 1
          query.where = { type: "op", op: "and", exprs: whereClauses }

        queries[intersectionId] = query

    # For each segment
    segments = PivotChartUtils.getAllSegments(design.rows).concat(PivotChartUtils.getAllSegments(design.columns))
    for segment in segments
      if segment.orderExpr
        # Create where which includes the segments filter (if present) and the "or" of all intersections that are present
        where = {
          type: "op"
          op: "and"
          exprs: []
        }

        if segment.filter
          where.exprs.push(exprCompiler.compileExpr(expr: segment.filter, tableAlias: "main"))

        # Get all intersection filters
        intersectionFilters = []
        for intersectionId in _.keys(design.intersections)
          if intersectionId.includes(segment.id) 
            filter = design.intersections[intersectionId].filter
            if filter
              intersectionFilters.push(filter)
        
        if intersectionFilters.length > 0
          where.exprs.push({
            type: "op"
            op: "or"
            exprs: _.map(intersectionFilters, (filter) => exprCompiler.compileExpr(expr: filter, tableAlias: "main"))
          })

        # Create query to get ordering
        queries[segment.id] = {
          type: "query"
          selects: [{ type: "select", expr: @axisBuilder.compileAxis(axis: segment.valueAxis, tableAlias: "main"), alias: "value" }]
          from: exprCompiler.compileTable(design.table, "main")
          where: if where.exprs.length > 0 then where else null
          groupBy: [1]
          orderBy: [{ expr: exprCompiler.compileExpr(expr: segment.orderExpr, tableAlias: "main"), direction: segment.orderDir or "asc" }]
        }

    return queries
