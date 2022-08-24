import _ from "lodash"
import { Expr, ExprCompiler, Schema } from "mwater-expressions"
import { ExprUtils } from "mwater-expressions"
import AxisBuilder from "../../../axes/AxisBuilder"
import { injectTableAlias } from "mwater-expressions"
import * as PivotChartUtils from "./PivotChartUtils"
import { PivotChartDesign } from "./PivotChartDesign"
import { JsonQLFilter } from "../../../JsonQLFilter"
import { JsonQLSelectQuery } from "jsonql"

/** Builds pivot table queries.
 * Result is flat list for each intersection with each row being data for a single cell
 * columns of result are:
 *  value: value of the cell (aggregate)
 *  r0: row segment value (if present)
 *  r1: inner row segment value (if present)
 *  ...
 *  c0: column segment value (if present)
 *  c1: inner column segment value (if present)
 *  ...
 * Also produces queries needed to order row/column segments when ordered
 * These are indexed by the segment id and contain the values in order (already asc/desc corrected)
 * each row containing only { value: }
 */
export default class PivotChartQueryBuilder {
  schema: Schema
  exprUtils: ExprUtils
  axisBuilder: AxisBuilder

  constructor(options: {
    schema: Schema
  }) {
    this.schema = options.schema
    this.exprUtils = new ExprUtils(this.schema)
    this.axisBuilder = new AxisBuilder({ schema: this.schema })
  }

  // Create the queries needed for the chart.
  // extraFilters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. }
  // Queries are indexed by intersection id, as one query is made for each intersection
  createQueries(design: PivotChartDesign, extraFilters: JsonQLFilter[]) {
    let filter, intersectionId, relevantFilters, whereClauses
    const exprCompiler = new ExprCompiler(this.schema)

    const queries = {}

    // For each intersection
    for (let rowPath of PivotChartUtils.getSegmentPaths(design.rows)) {
      for (let columnPath of PivotChartUtils.getSegmentPaths(design.columns)) {
        // Get id of intersection
        var i
        intersectionId = PivotChartUtils.getIntersectionId(rowPath, columnPath)

        // Get intersection
        const intersection = design.intersections[intersectionId]

        // Create shell of query
        const query: JsonQLSelectQuery = {
          type: "query",
          selects: [],
          from: exprCompiler.compileTable(design.table, "main"),
          limit: 10000,
          groupBy: []
        }

        // Filters to add (not yet compiled)
        const filters = []

        // Add segments
        for (i = 0; i < rowPath.length; i++) {
          const rowSegment = rowPath[i]
          query.selects.push({
            type: "select",
            expr: this.axisBuilder.compileAxis({ axis: rowSegment.valueAxis, tableAlias: "main" }),
            alias: `r${i}`
          })
          query.groupBy!.push(i + 1)
          if (rowSegment.filter) {
            filters.push(rowSegment.filter)
          }
        }

        for (i = 0; i < columnPath.length; i++) {
          const columnSegment = columnPath[i]
          query.selects.push({
            type: "select",
            expr: this.axisBuilder.compileAxis({ axis: columnSegment.valueAxis, tableAlias: "main" }),
            alias: `c${i}`
          })
          query.groupBy!.push(i + 1 + rowPath.length)
          if (columnSegment.filter) {
            filters.push(columnSegment.filter)
          }
        }

        // Add value
        query.selects.push({
          type: "select",
          expr: this.axisBuilder.compileAxis({ axis: intersection?.valueAxis!, tableAlias: "main" }),
          alias: "value"
        })
        if (intersection?.filter) {
          filters.push(intersection.filter)
        }

        // Add background color
        if (intersection?.backgroundColorAxis) {
          query.selects.push({
            type: "select",
            expr: this.axisBuilder.compileAxis({ axis: intersection?.backgroundColorAxis, tableAlias: "main" }),
            alias: "bc"
          })
        }

        // Add background color conditions
        const iterable = intersection.backgroundColorConditions || []
        for (i = 0; i < iterable.length; i++) {
          const backgroundColorCondition = iterable[i]
          query.selects.push({
            type: "select",
            expr: exprCompiler.compileExpr({ expr: backgroundColorCondition.condition ?? null, tableAlias: "main" }),
            alias: `bcc${i}`
          })
        }

        // If all selects are null, don't create query
        if (_.all(query.selects, (select) => select.expr == null)) {
          continue
        }

        // Add where
        whereClauses = []
        if (design.filter) {
          whereClauses.push(exprCompiler.compileExpr({ expr: design.filter, tableAlias: "main" }))
        }

        // Add other filters
        whereClauses = whereClauses.concat(
          _.map(filters, (filter) => exprCompiler.compileExpr({ expr: filter, tableAlias: "main" }))
        )

        // Add filters
        if (extraFilters && extraFilters.length > 0) {
          // Get relevant filters
          relevantFilters = _.where(extraFilters, { table: design.table })

          // Add filters
          for (filter of relevantFilters) {
            whereClauses.push(injectTableAlias(filter.jsonql, "main"))
          }
        }

        whereClauses = _.compact(whereClauses)

        if (whereClauses.length === 1) {
          query.where = whereClauses[0]
        } else if (whereClauses.length > 1) {
          query.where = { type: "op", op: "and", exprs: whereClauses }
        }

        queries[intersectionId] = query
      }
    }

    // For each segment
    const segments = PivotChartUtils.getAllSegments(design.rows).concat(PivotChartUtils.getAllSegments(design.columns))
    for (let segment of segments) {
      if (segment.orderExpr) {
        // Create where which includes the segments filter (if present) and the "or" of all intersections that are present
        whereClauses = []

        if (segment.filter) {
          whereClauses.push(exprCompiler.compileExpr({ expr: segment.filter, tableAlias: "main" }))
        }

        // Get all intersection filters
        const intersectionFilters: Expr[] = []
        for (intersectionId of _.keys(design.intersections)) {
          if (intersectionId.includes(segment.id)) {
            ;({ filter } = design.intersections[intersectionId])
            if (filter) {
              intersectionFilters.push(filter)
            } else {
              // If intersection has no filter, still needs to "or" with true
              intersectionFilters.push({ type: "literal", valueType: "boolean", value: true })
            }
          }
        }

        if (intersectionFilters.length > 0) {
          whereClauses.push({
            type: "op",
            op: "or",
            exprs: _.map(intersectionFilters, (filter) =>
              exprCompiler.compileExpr({ expr: filter, tableAlias: "main" })
            )
          })
        }

        if (design.filter) {
          whereClauses.push(exprCompiler.compileExpr({ expr: design.filter, tableAlias: "main" }))
        }

        // Add extra filters
        if (extraFilters && extraFilters.length > 0) {
          // Get relevant filters
          relevantFilters = _.where(extraFilters, { table: design.table })

          // Add filters
          for (filter of relevantFilters) {
            whereClauses.push(injectTableAlias(filter.jsonql, "main"))
          }
        }

        whereClauses = _.compact(whereClauses)

        let where = null
        if (whereClauses.length === 1) {
          where = whereClauses[0]
        } else if (whereClauses.length > 1) {
          where = { type: "op", op: "and", exprs: whereClauses }
        }

        // Create query to get ordering
        queries[segment.id] = {
          type: "query",
          selects: [
            {
              type: "select",
              expr: this.axisBuilder.compileAxis({ axis: segment.valueAxis, tableAlias: "main" }),
              alias: "value"
            }
          ],
          from: exprCompiler.compileTable(design.table, "main"),
          where,
          groupBy: [1],
          orderBy: [
            {
              expr: exprCompiler.compileExpr({ expr: segment.orderExpr, tableAlias: "main" }),
              direction: segment.orderDir || "asc"
            }
          ]
        }
      }
    }

    return queries
  }
}
