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

  describe "createRowFilter", ->
    it "gets all non-aggr for aggr", ->
      design = {
        table: "t1"
        columns: [
          { textAxis: @axisText }
          { textAxis: @axisNumberSum }
        ]
        orderings: [{
          axis: @axisEnum
        }]
      }

      compare TableChartUtils.createRowFilter(design, @schema, { c0: "abc", c1: 23, o0: "a" }), 
        {
          table: "t1"
          jsonql: {
            type: "op"
            op: "and"
            exprs: [
              { type: "op", op: "=", exprs: [{ type: "field", tableAlias: "{alias}", column: "text" }, { type: "literal", value: "abc" }] }
              { type: "op", op: "=", exprs: [{ type: "field", tableAlias: "{alias}", column: "enum" }, { type: "literal", value: "a" }] }
            ]
          }
        }

    it "gets id for non-aggr", ->
      design = {
        table: "t1"
        columns: [
          { textAxis: @axisText }
        ]
        orderings: [{
          axis: @axisEnum
        }]
      }

      compare TableChartUtils.createRowFilter(design, @schema, { id: "123", c0: "abc", o0: "a" }), 
        {
          table: "t1"
          jsonql: {
            type: "op"
            op: "and"
            exprs: [
              { type: "op", op: "=", exprs: [{ type: "field", tableAlias: "{alias}", column: "primary" }, { type: "literal", value: "123" }] }
            ]
          }
        }

  describe "createRowScope", ->
    it "handles non-aggr", ->
      design = {
        table: "t1"
        columns: [
          { textAxis: @axisText }
        ]
        orderings: []
      }

      compare TableChartUtils.createRowScope(design, @schema, { id: "123", c0: "abc" }), 
        {
          name: "Selected Row"
          filter: {
            table: "t1"
            jsonql: {
              type: "op"
              op: "and"
              exprs: [
                { type: "op", op: "=", exprs: [{ type: "field", tableAlias: "{alias}", column: "primary" }, { type: "literal", value: "123" }] }
              ]
            }
          }
          data: [
            { id: "123" }
          ]
        }

    it "handles aggr", ->
      design = {
        table: "t1"
        columns: [
          { textAxis: @axisText }
          { textAxis: @axisNumberSum }
        ]
        orderings: []
      }

      compare TableChartUtils.createRowScope(design, @schema, { id: "123", c0: "abc", c1: 123 }), 
        {
          name: "Selected Row"
          filter: {
            table: "t1"
            jsonql: {
              type: "op"
              op: "and"
              exprs: [
                { type: "op", op: "=", exprs: [{ type: "field", tableAlias: "{alias}", column: "text" }, { type: "literal", value: "abc" }] }
              ]
            }
          }
          data: [
            { c0: "abc" }
          ]
        }

  describe "isRowScoped", ->
    it "matches id", ->
      assert.isTrue(TableChartUtils.isRowScoped({ id: "123", c0: "abc" }, [{ id: "123" }]))

    it "matches column", ->
      assert.isTrue(TableChartUtils.isRowScoped({ c0: "abc", c1: 123 }, [{ c0: "abc" }]))

    it "fails if missing value", ->
      assert.isFalse(TableChartUtils.isRowScoped({ c0: "abc" }, [{ c0: "abc", c1: 123 }]))    