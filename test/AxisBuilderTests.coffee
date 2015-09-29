assert = require('chai').assert
fixtures = require './fixtures'
_ = require 'lodash'

AxisBuilder = require '../src/expressions/axes/AxisBuilder'

canonical = require 'canonical-json'

compare = (actual, expected) ->
  assert.equal canonical(actual), canonical(expected)

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
    @axisDecimalCount = { expr: @exprCount, aggr: "count" }
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
    it "nulls if no expression", ->
      axis = {
        expr: null
        aggr: "sum"
      }

      axis = @ab.cleanAxis(axis: axis, table: "t1")
      assert not axis

    it "nulls if expression has no type", ->
      axis = {
        expr: { type: "scalar", expr: null, joins: [] }
        aggr: "sum"
      }

      axis = @ab.cleanAxis(axis: axis, table: "t1")
      assert not axis

    it "removes bin xform if wrong input type", ->
      axis = {
        expr: @exprEnum
        xform: { type: "bin", numBins: 10, min: 2, max: 8 }
      }

      axis = @ab.cleanAxis(axis: axis, table: "t1")
      assert not axis.xform

    it "removes bin xform if wrong output type", ->
      axis = {
        expr: @exprDecimal
        xform: { type: "bin", numBins: 10, min: 2, max: 8 }
      }

      axis = @ab.cleanAxis(axis: axis, table: "t1", types: ["integer"])
      assert not axis.xform

    it "removes bad aggr"

    it "removes aggr if xform", ->
      axis = {
        expr: @exprDecimal
        xform: { type: "bin", numBins: 10, min: 2, max: 8 }
        aggr: "sum"
      }

      axis = @ab.cleanAxis(axis: axis, table: "t1", types: ["enum"])
      assert not axis.aggr

    it "defaults bin xform", ->
      axis = {
        expr: @exprDecimal
      }

      axis = @ab.cleanAxis(axis: axis, table: "t1", types: ['enum'])
      assert.equal axis.xform.type, "bin"

    it "remove if not possible to get type", ->
      axis = { expr: @exprDecimal }
      assert not @ab.cleanAxis(axis: axis, table: "t1", types: ['text'], aggrNeed: "none")
      assert @ab.cleanAxis(axis: axis, table: "t1", types: ['enum'], aggrNeed: "none") # Can get enum via binning
    
      # Aggr can get to count
      assert not @ab.cleanAxis(axis: axis, table: "t1", types: ['integer'], aggrNeed: "none")
      assert @ab.cleanAxis(axis: axis, table: "t1", types: ['integer'], aggrNeed: "required")

    it "defaults colorMap"

  describe "getAxisType", ->
    it "passes through if no aggr or xform", ->
      assert.equal @ab.getAxisType(@axisDecimal), "decimal"

    it "converts count aggr to integer", ->
      assert.equal @ab.getAxisType(@axisDecimalCount), "integer"

    it "xforms", ->
      axis = {
        expr: @exprDecimal
        xform: { type: "bin", numBins: 10, min: 2, max: 8 }
      }
      assert.equal @ab.getAxisType(axis), "enum"
    
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

    it "gets empty list for decimal", ->
      categories = @ab.getCategories(@axisDecimal, [1.2, 1.4])
      compare(categories, [])
