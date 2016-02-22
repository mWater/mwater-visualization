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
    mockDataSource = {
      performQuery: (query) =>
        @query = query
    }

    @chart = new TableChart(schema: @schema, dataSource: mockDataSource)

    @exprNumber = { type: "field", table: "t1", column: "number" }
    @exprText = { type: "field", table: "t1", column: "text" }
    @exprDate = { type: "field", table: "t1", column: "date" }
    @exprEnum = { type: "field", table: "t1", column: "enum" }
    @exprEnumset = { type: "field", table: "t1", column: "enumset" }

    @axisNumber = { expr: @exprNumber }
    @axisNumberSum = { expr: @exprNumber, aggr: "sum" }
    @axisEnum = { expr: @exprEnum } 
    @axisEnumset = { expr: @exprEnumset } 
    @axisText = { expr: @exprText } 
    @axisDate = { expr: @exprDate } 

  describe "createQueries", ->
    # it "includes _id if no grouping", ->

    it "does group all if no aggr", ->
      design = {
        table: "t1"
        columns: [
          { textAxis: @axisText }
          { textAxis: @axisNumber }
        ]
        orderings: []
      }

      @chart.getData(design)
      expectedQuery = {
        type: "query"
        selects: [
          { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "c0" }
          { type: "select", expr: { type: "field", tableAlias: "main", column: "number" }, alias: "c1" }
        ]
        from: { type: "table", table: "t1", alias: "main" }
        groupBy: [1, 2]
        orderBy: []
        limit: 1000
      }

      compare(@query, expectedQuery)

    it "groups all non-aggr", ->
      design = {
        table: "t1"
        columns: [
          { textAxis: @axisText }
          { textAxis: @axisNumberSum }
        ]
        orderings: []
      }

      @chart.getData(design)
      expectedQuery = {
        type: "query"
        selects: [
          { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "c0" }
          { type: "select", expr: { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "main", column: "number" }] }, alias: "c1" }
        ]
        from: { type: "table", table: "t1", alias: "main" }
        groupBy: [1]
        orderBy: []
        limit: 1000
      }

      compare(@query, expectedQuery)

    it "adds order with groupBy", ->
      design = {
        table: "t1"
        columns: [
          { textAxis: @axisText }
          { textAxis: @axisNumberSum }
        ]
        orderings: [
          { axis: @axisNumber, direction: "desc" }
        ]
      }

      @chart.getData(design)
      expectedQuery = {
        type: "query"
        selects: [
          { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "c0" }
          { type: "select", expr: { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "main", column: "number" }] }, alias: "c1" }
          { type: "select", expr: { type: "field", tableAlias: "main", column: "number" }, alias: "o0" }
        ]
        from: { type: "table", table: "t1", alias: "main" }
        groupBy: [1, 3]
        orderBy: [{ ordinal: 3, direction: "desc" }]
        limit: 1000
      }

      compare(@query, expectedQuery)

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


