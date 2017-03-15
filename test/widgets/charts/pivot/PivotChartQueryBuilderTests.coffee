assert = require('chai').assert
fixtures = require '../../../fixtures'
_ = require 'lodash'

PivotChartQueryBuilder = require '../../../../src/widgets/charts/pivot/PivotChartQueryBuilder'

canonical = require 'canonical-json'
compare = (actual, expected) ->
  assert.equal canonical(actual), canonical(expected), "\n" + canonical(actual) + "\n" + canonical(expected)

describe "PivotChartQueryBuilder", ->
  before ->
    @qb = new PivotChartQueryBuilder(schema: fixtures.simpleSchema())
    @exprNumber = { type: "field", table: "t1", column: "number" }
    @exprText = { type: "field", table: "t1", column: "text" }
    @exprEnum = { type: "field", table: "t1", column: "enum" }

    @axisNumber = { expr: @exprNumber }
    @axisNumberSum = { expr: @exprNumber, aggr: "sum" }
    @axisNumberCount = { expr: @exprCount, aggr: "count" }
    @axisEnum = { expr: @exprEnum } 
    @axisText = { expr: @exprText } 

  it "creates single query", ->
    design = {
      table: "t1"
      rows: [
        { id: "r1", valueAxis: @axisEnum }
      ]
      columns: [
        { id: "c1", valueAxis: @axisText }
      ]
      intersections: {
        "r1:c1": {
          valueAxis: @axisNumberSum
        }
      }
    }

    queries = @qb.createQueries(design)
    assert.equal _.values(queries).length, 1, "Should have single query"

    query = queries["r1:c1"]
    compare query, {
      type: "query"
      selects: [
        { type: "select", expr: { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "main", column: "number" }] }, alias: "value" }
        { type: "select", expr: { type: "field", tableAlias: "main", column: "enum" }, alias: "r0" }
        { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "c0" }
      ]
      from: { type: "table", table: "t1", alias: "main" }
      limit: 1000
      groupBy: [2, 3]
    }

  it "creates nested query"

  it "uses null for missing intersections"

