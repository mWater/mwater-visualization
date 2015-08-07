_ = require 'lodash'
assert = require('chai').assert
fixtures = require './fixtures'
TableChart = require '../src/widgets/charts/TableChart'

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

    it "does group all if no aggr", ->
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
          groupBy: [1, 2]
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
    it "cleans column expressions", ->
      design = {
        table: "t1"
        columns: [
          { expr: { type: "field", table: "t2", column: "text "} } # Wrong table
        ]
      }

      design = @chart.cleanDesign(design)

      expectedDesign = {
        table: "t1"
        columns: [
          { expr: null }
        ]
      }        

      compare(design, expectedDesign)

    it "removes invalid aggrs", ->
      design = {
        table: "t1"
        columns: [
          { expr: @exprText, aggr: "sum" }
        ]
      }

      design = @chart.cleanDesign(design)

      expectedDesign = {
        table: "t1"
        columns: [
          { expr: @exprText }
        ]
      }        

      compare(design, expectedDesign)

    it "defaults aggr to count if no expression type", ->
      design = {
        table: "t1"
        columns: [
          { expr: { type: "scalar", table: "t1", expr: null, joins: [] }, aggr: "sum" }
        ]
      }

      design = @chart.cleanDesign(design)

      expectedDesign = {
        table: "t1"
        columns: [
          { expr: { type: "scalar", table: "t1", expr: null, joins: [] }, aggr: "count" }
        ]
      }        

      compare(design, expectedDesign)

    it "cleans filter"

  describe "validateDesign", ->
    it "allows valid design", ->
      design = {
        table: "t1"
        columns: [
          { expr: @exprText }
        ]
      }

      assert not @chart.validateDesign(design)

    it "validates column expressions", ->
      design = {
        table: "t1"
        columns: [
          { expr: null }
        ]
      }

      assert @chart.validateDesign(design)

    it "validates filter"


