_ = require 'lodash'
assert = require('chai').assert
fixtures = require './fixtures'
TableChart = require '../src/widgets/charts/TableChart'
canonical = require 'canonical-json'

compare = (actual, expected) ->
  assert.equal canonical(actual), canonical(expected)

describe "TableChart", ->
  before ->
    @schema = fixtures.simpleSchema()
    @chart = new TableChart(schema: @schema)

    @exprDecimal = { type: "field", table: "t1", column: "decimal" }
    @exprInteger = { type: "field", table: "t1", column: "integer" }
    @exprText = { type: "field", table: "t1", column: "text" }
    @exprDate = { type: "field", table: "t1", column: "date" }
    @exprEnum = { type: "field", table: "t1", column: "enum" }

    @axisDecimal = { expr: @exprDecimal }
    @axisIntegerSum = { expr: @exprInteger, aggr: "sum" }
    @axisInteger = { expr: @exprInteger }
    @axisEnum = { expr: @exprEnum } 
    @axisText = { expr: @exprText } 
    @axisDate = { expr: @exprDate } 

  describe "createQueries", ->
    # it "includes _id if no grouping", ->

    it "does group all if no aggr", ->
      design = {
        table: "t1"
        columns: [
          { textAxis: @axisText }
          { textAxis: @axisDecimal }
        ]
        orderings: []
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
          { textAxis: @axisText }
          { textAxis: @axisIntegerSum }
        ]
        orderings: []
      }

      queries = @chart.createQueries(design)
      expectedQueries = {
        main: {
          type: "query"
          selects: [
            { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "c0" }
            { type: "select", expr: { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "main", column: "integer" }] }, alias: "c1" }
          ]
          from: { type: "table", table: "t1", alias: "main" }
          groupBy: [1]
          orderBy: []
          limit: 1000
        }
      }

      compare(queries, expectedQueries)

    it "adds order with groupBy", ->
      design = {
        table: "t1"
        columns: [
          { textAxis: @axisText }
          { textAxis: @axisIntegerSum }
        ]
        orderings: [
          { axis: @axisDecimal, direction: "desc" }
        ]
      }

      queries = @chart.createQueries(design)
      expectedQueries = {
        main: {
          type: "query"
          selects: [
            { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "c0" }
            { type: "select", expr: { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "main", column: "integer" }] }, alias: "c1" }
          ]
          from: { type: "table", table: "t1", alias: "main" }
          groupBy: [1, { type: "field", tableAlias: "main", column: "decimal" }]
          orderBy: [{ expr: { type: "field", tableAlias: "main", column: "decimal" }, direction: "desc" }]
          limit: 1000
        }
      }

      compare(queries, expectedQueries)


  # describe "cleanDesign", ->
  #   it "cleans column expressions", ->
  #     design = {
  #       table: "t1"
  #       columns: [
  #         { expr: { type: "field", table: "t2", column: "text "} } # Wrong table
  #       ]
  #     }

  #     design = @chart.cleanDesign(design)

  #     expectedDesign = {
  #       table: "t1"
  #       columns: [
  #         { expr: null }
  #       ]
  #     }        

  #     compare(design, expectedDesign)

  #   it "removes invalid aggrs", ->
  #     design = {
  #       table: "t1"
  #       columns: [
  #         { expr: @exprText, aggr: "sum" }
  #       ]
  #     }

  #     design = @chart.cleanDesign(design)

  #     expectedDesign = {
  #       table: "t1"
  #       columns: [
  #         { expr: @exprText }
  #       ]
  #     }        

  #     compare(design, expectedDesign)

  #   it "defaults aggr to count if no expression type", ->
  #     design = {
  #       table: "t1"
  #       columns: [
  #         { expr: { type: "scalar", table: "t1", expr: null, joins: [] }, aggr: "sum" }
  #       ]
  #     }

  #     design = @chart.cleanDesign(design)

  #     expectedDesign = {
  #       table: "t1"
  #       columns: [
  #         { expr: { type: "scalar", table: "t1", expr: null, joins: [] }, aggr: "count" }
  #       ]
  #     }        

  #     compare(design, expectedDesign)

  #   it "cleans filter"

  describe "validateDesign", ->
    it "allows valid design", ->
      design = {
        table: "t1"
        columns: [
          { textAxis: @axisText }
        ]
        orderings: []
      }

      assert not @chart.validateDesign(design)

    it "validates column expressions", ->
      design = {
        table: "t1"
        columns: [
          { textAxis: null }
        ]
        orderings: []
      }

      assert @chart.validateDesign(design)

    it "validates filter"


