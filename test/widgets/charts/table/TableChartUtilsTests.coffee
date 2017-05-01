_ = require 'lodash'
assert = require('chai').assert
fixtures = require '../../../fixtures'
TableChartUtils = require '../../../../src/widgets/charts/table/TableChartUtils'
canonical = require 'canonical-json'

compare = (actual, expected) ->
  assert.equal canonical(actual), canonical(expected), "\ngot:#{canonical(actual)}\nexp:#{canonical(expected)}\n"

describe "TableChartUtils", ->
  before ->
    @schema = fixtures.simpleSchema()
    @dataSource = {
      performQuery: (query) =>
        @query = query
    }

    @exprNumber = { type: "field", table: "t1", column: "number" }
    @exprText = { type: "field", table: "t1", column: "text" }
    @exprDate = { type: "field", table: "t1", column: "date" }
    @exprEnum = { type: "field", table: "t1", column: "enum" }
    @exprEnumset = { type: "field", table: "t1", column: "enumset" }
    @exprGeometry = { type: "field", table: "t1", column: "geometry" }

    @axisNumber = { expr: @exprNumber }
    @axisNumberSum = { expr: { type: "op", op: "sum", table: "t1", exprs: [@exprNumber] } }
    @axisEnum = { expr: @exprEnum } 
    @axisEnumset = { expr: @exprEnumset } 
    @axisText = { expr: @exprText } 
    @axisDate = { expr: @exprDate } 
    @axisGeometry = { expr: @exprGeometry } 

  describe "isTableAggr", ->
    it "true for aggr", ->
      design = {
        table: "t1"
        columns: [
          { textAxis: @axisText }
          { textAxis: @axisNumberSum }
        ]
        orderings: []
      }

      assert.isTrue(TableChartUtils.isTableAggr(design, @schema))

    it "false for non-aggr", ->
      design = {
        table: "t1"
        columns: [
          { textAxis: @axisText }
          { textAxis: @axisNumber }
        ]
        orderings: []
      }

      assert.isFalse(TableChartUtils.isTableAggr(design, @schema))
