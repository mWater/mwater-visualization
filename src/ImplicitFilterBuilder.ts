import _ from "lodash"
import { injectTableAlias, Schema } from "mwater-expressions"
import { ExprCompiler } from "mwater-expressions"

// Given a series of explicit filters on tables (array of { table: table id, jsonql: JsonQL with {alias} for the table name to filter by })
// extends the filters to all filterable tables with a single 1-n relationship.
// For example, a given community has N water points. If communities are filtered, we want to filter water points as well since there is a
// clear parent-child relationship (specifically, a single n-1 join between water points and communities)
export default class ImplicitFilterBuilder {
  schema: Schema
  constructor(schema: Schema) {
    this.schema = schema
  }

  // Find joins between parent and child tables that can be used to extend explicit filters.
  // To be a useable join, must be only n-1 join between child and parent and child must be filterable table
  // filterableTables: array of table ids of filterable tables
  // Returns list of { table, column } of joins from child to parent
  findJoins(filterableTables: any) {
    let allJoins: any = []

    // For each filterable table
    for (var filterableTable of filterableTables) {
      const table = this.schema.getTable(filterableTable)
      if (!table) {
        continue
      }

      // Find n-1 joins to another filterable table that are not self-references
      let joins = _.filter(
        this.schema.getColumns(filterableTable),
        (column) =>
          (column.type === "join" && column.join.type === "n-1" && column.join.toTable !== filterableTable) ||
          (column.type === "id" && column.idTable !== filterableTable)
      )

      // Only keep if singular
      joins = _.flatten(
        _.filter(
          _.values(_.groupBy(joins, (join) => (join.type === "id" ? join.idTable : join.join.toTable))),
          (list) => list.length === 1
        )
      )
      allJoins = allJoins.concat(
        _.map(joins, (join) => ({
          table: filterableTable,
          column: join.id
        }))
      )
    }

    return allJoins
  }

  // Extends filters to include implicit filters
  // filterableTables: array of table ids of filterable tables
  // filters: array of { table: table id, jsonql: JsonQL with {alias} for the table name to filter by } of explicit filters
  // returns similar array, but including any extra implicit filters
  extendFilters(filterableTables: any, filters: any) {
    const implicitFilters = []

    // Find joins
    const joins = this.findJoins(filterableTables)

    const exprCompiler = new ExprCompiler(this.schema)

    // For each join, find filters on parent table
    for (var join of joins) {
      const parentFilters = _.filter(filters, (f) => {
        const column = this.schema.getColumn(join.table, join.column)
        return f.table === (column.type === "join" ? column.join.toTable : column.idTable) && f.jsonql
      })
      if (parentFilters.length === 0) {
        continue
      }

      const joinColumn = this.schema.getColumn(join.table, join.column)

      // Create where exists with join to parent table (filtered) OR no parent exists
      const implicitFilter = {
        table: join.table,
        jsonql: {
          type: "op",
          op: "or",
          exprs: [
            {
              type: "op",
              op: "exists",
              exprs: [
                {
                  type: "query",
                  // select null
                  selects: [],
                  from: {
                    type: "table",
                    table: joinColumn.type === "id" ? joinColumn.idTable : joinColumn.join.toTable,
                    alias: "explicit"
                  },
                  where: {
                    type: "op",
                    op: "and",
                    exprs: [
                      // Join two tables
                      exprCompiler.compileJoin(join.table, joinColumn, "{alias}", "explicit")
                    ]
                  }
                }
              ]
            },
            {
              type: "op",
              op: "is null",
              exprs: [
                exprCompiler.compileExpr({
                  expr: { type: "field", table: join.table, column: join.column },
                  tableAlias: "{alias}"
                })
              ]
            }
          ]
        }
      }

      // Add filters
      for (let parentFilter of parentFilters) {
        implicitFilter.jsonql.exprs[0].exprs[0].where.exprs.push(injectTableAlias(parentFilter.jsonql, "explicit"))
      }

      implicitFilters.push(implicitFilter)
    }

    return filters.concat(implicitFilters)

    return filters
  }
}
