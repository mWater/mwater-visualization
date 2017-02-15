_ = require 'lodash'
injectTableAlias = require('mwater-expressions').injectTableAlias
ExprCompiler = require('mwater-expressions').ExprCompiler


# Given a series of explicit filters on tables (array of { table: table id, jsonql: JsonQL with {alias} for the table name to filter by })
# extends the filters to all filterable tables with a single 1-n relationship.
# For example, a given community has N water points. If communities are filtered, we want to filter water points as well since there is a 
# clear parent-child relationship (specifically, a single n-1 join between water points and communities)
module.exports = class ImplicitFilterBuilder
  constructor: (schema) ->
    @schema = schema

  # Find joins between parent and child tables that can be used to extend explicit filters. 
  # To be a useable join, must be only n-1 join between child and parent and child must be filterable table 
  # filterableTables: array of table ids of filterable tables
  # Returns list of { table, column } of joins from child to parent
  findJoins: (filterableTables) ->
    allJoins = []

    # For each filterable table
    for filterableTable in filterableTables
      table = @schema.getTable(filterableTable)
      if not table
        continue

      # Find n-1 joins to another filterable table that are not self-references
      joins = _.filter(@schema.getColumns(filterableTable), (column) => column.type == "join" and column.join.type == "n-1" and column.join.toTable != filterableTable)

      # Only keep if singular
      joins = _.flatten(_.filter(_.values(_.groupBy(joins, (join) -> join.join.toTable)), (list) -> list.length == 1))
      allJoins = allJoins.concat(_.map(joins, (join) -> { table: filterableTable, column: join.id }))

    return allJoins

  # Extends filters to include implicit filters
  # filterableTables: array of table ids of filterable tables
  # filters: array of { table: table id, jsonql: JsonQL with {alias} for the table name to filter by } of explicit filters
  # returns similar array, but including any extra implicit filters
  extendFilters: (filterableTables, filters) ->
    implicitFilters = []

    # Find joins
    joins = @findJoins(filterableTables)

    exprCompiler = new ExprCompiler(@schema)

    # For each join, find filters on parent table
    for join in joins
      parentFilters = _.filter(filters, (f) => f.table == @schema.getColumn(join.table, join.column).join.toTable and f.jsonql)
      if parentFilters.length == 0
        continue

      joinColumn = @schema.getColumn(join.table, join.column)

      # Create where exists with join to parent table (filtered) OR no parent exists
      implicitFilter = {
        table: join.table
        jsonql: {
          type: "op"
          op: "or"
          exprs: [
            {
              type: "op"
              op: "exists"
              exprs: [
                {
                  type: "query"
                  # select null
                  selects: []
                  from: { type: "table", table: joinColumn.join.toTable, alias: "explicit" }
                  where: {
                    type: "op"
                    op: "and"
                    exprs: [                  
                      # Join two tables
                      exprCompiler.compileJoin(joinColumn.join, "{alias}", "explicit")
                    ]
                  }
                }
              ]
            }
            {
              type: "op"
              op: "is null"
              exprs: [
                exprCompiler.compileExpr(expr: { type: "field", table: join.table, column: join.column }, tableAlias: "{alias}")
              ]
            }
          ]
        }
      }

      # Add filters
      for parentFilter in parentFilters
        implicitFilter.jsonql.exprs[0].exprs[0].where.exprs.push(injectTableAlias(parentFilter.jsonql, "explicit"))

      implicitFilters.push(implicitFilter)

    return filters.concat(implicitFilters)


    return filters