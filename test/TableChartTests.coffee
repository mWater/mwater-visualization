_ = require 'lodash'
assert = require('chai').assert
fixtures = require './fixtures'
TableChart = require '../src/TableChart'

compare = (actual, expected) ->
  assert _.isEqual(actual, expected) or JSON.stringify(actual) == JSON.stringify(expected), "\n" + JSON.stringify(actual) + "\n" + JSON.stringify(expected)

describe "TableChart", ->
  before ->
    @schema = fixtures.simpleSchema()
    @chart = new TableChart(schema: @schema)

    @exprDecimal = { type: "field", table: "t1", column: "decimal" }
    @exprInteger = { type: "field", table: "t1", column: "integer" }
    @exprText = { type: "field", table: "t1", column: "text" }
    @exprDate = { type: "field", table: "t1", column: "date" }
    @exprEnum = { type: "field", table: "t1", column: "enum" }

  describe "createQueries", ->
    # it "includes _id if no grouping", ->

    it "does not group if no aggr", ->
      design = {
        table: "t1"
        columns: [
          { expr: @exprText }
          { expr: @exprDecimal }
        ]
      }

      queries = @chart.createQueries(design)
      expectedQueries = {
        main: {
          type: "query"
          selects: [
            { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "c0" }
            { type: "select", expr: { type: "field", tableAlias: "main", column: "decimal" }, alias: "c1" }
          ]
          from: { type: "table", table: "t1", alias: "main" }
          groupBy: []
          orderBy: []
          limit: 1000
        }
      }

      compare(queries, expectedQueries)

    it "groups all non-aggr", ->
      design = {
        table: "t1"
        columns: [
          { expr: @exprText }
          { expr: @exprDecimal, aggr: "sum" }
        ]
      }

      queries = @chart.createQueries(design)
      expectedQueries = {
        main: {
          type: "query"
          selects: [
            { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "c0" }
            { type: "select", expr: { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "main", column: "decimal" }] }, alias: "c1" }          ]
          from: { type: "table", table: "t1", alias: "main" }
          groupBy: [1]
          orderBy: []
          limit: 1000
        }
      }

      compare(queries, expectedQueries)

  describe "cleanDesign", ->
    it "cleans column expressions"
    it "removes invalid aggrs"

  describe "validateDesign", ->
    it "allows valid design"
    it "validates column expressions"

