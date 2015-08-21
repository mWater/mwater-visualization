assert = require('chai').assert
fixtures = require './fixtures'

AxisBuilder = require '../src/expressions/axes/AxisBuilder'

compare = (actual, expected) ->
  assert _.isEqual(actual, expected), "\n" + JSON.stringify(actual) + "\n" + JSON.stringify(expected)

describe "AxisBuilder", ->
  before ->
    @ab = new AxisBuilder(schema: fixtures.simpleSchema())
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

  it "compiles simple expr", ->
    jql = @ab.compileAxis(axis: @axisInteger, tableAlias: "T1")
    assert _.isEqual jql, {
      type: "field"
      tableAlias: "T1"
      column: "integer"
    }

  it "compiles aggregated field", ->
    axis = {
      expr: @exprInteger
      aggr: "sum"
    }

    jql = @ab.compileAxis(axis: @axisIntegerSum, tableAlias: "T1")
    assert _.isEqual jql, {
      type: "op"
      op: "sum"
      exprs: [
        {
          type: "field"
          tableAlias: "T1"
          column: "integer"
        }
      ]
    }

  describe "cleanAxis", ->
    it "defaults aggr"
    it "cleans expression"
    it "removes bad aggr"
    it "removes bad xform"
    it "defaults xform"
    it "defaults colorMap"
    
  describe "getCategories", ->
    it "gets enum", ->
      categories = @ab.getCategories(@axisEnum, ["a"])
      compare(categories, [
        { value: "a", label: "A" }
        { value: "b", label: "B" }
        ])

    it "gets integer range", ->
      categories = @ab.getCategories(@axisInteger, [3, 4, 7])
      compare(categories, [
        { value: 3, label: "3" }
        { value: 4, label: "4" }
        { value: 5, label: "5" }
        { value: 6, label: "6" }
        { value: 7, label: "7" }
        ])

    it "gets text values", ->
      categories = @ab.getCategories(@axisText, ["a", "b", "a", "c"])
      compare(categories, [
        { value: "a", label: "a" }
        { value: "b", label: "b" }
        { value: "c", label: "c" }
        ])
