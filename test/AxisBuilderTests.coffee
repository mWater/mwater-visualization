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

  describe "compileAxis", ->
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

    it "compiles bin xform", ->
      axis = {
        expr: @exprDecimal
        xform: { type: "bin", numBins: 10, min: 2, max: 8 }
      }

      jql = @ab.compileAxis(axis: axis, tableAlias: "T1")
      assert _.isEqual jql, {
        type: "op"
        op: "width_bucket"
        exprs: [
          {
            type: "field"
            tableAlias: "T1"
            column: "decimal"
          },
          2,
          8,
          10
        ]
      }

    it "compiles date xform", ->
      axis = {
        expr: @exprDate
        xform: { type: "date" }
      }

      jql = @ab.compileAxis(axis: axis, tableAlias: "T1")
      assert _.isEqual jql, {
        type: "op"
        op: "substr"
        exprs: [
          {
            type: "field"
            tableAlias: "T1"
            column: "date"
          },
          1,
          10
        ]
      }

    it "compiles year xform", ->
      # rpad(substr('2011-12-21T', 1, 4), 10, '-01-01')      
      axis = {
        expr: @exprDate
        xform: { type: "year" }
      }

      jql = @ab.compileAxis(axis: axis, tableAlias: "T1")
      assert _.isEqual jql, {
        type: "op"
        op: "rpad"
        exprs: [
          {
            type: "op"
            op: "substr"
            exprs: [
              {
                type: "field"
                tableAlias: "T1"
                column: "date"
              },
              1,
              4
            ]
          }
          10
          "-01-01"
        ]
      }

    it "compiles yearmonth xform", ->
      # rpad(substr('2011-12-21T', 1, 7), 10, '-01')
      axis = {
        expr: @exprDate
        xform: { type: "yearmonth" }
      }

      jql = @ab.compileAxis(axis: axis, tableAlias: "T1")
      assert _.isEqual jql, {
        type: "op"
        op: "rpad"
        exprs: [
          {
            type: "op"
            op: "substr"
            exprs: [
              {
                type: "field"
                tableAlias: "T1"
                column: "date"
              },
              1,
              7
            ]
          }
          10
          "-01"
        ]
      }

    it "compiles month xform", ->
      # substr('2011-12-21T', 6, 2)
      axis = {
        expr: @exprDate
        xform: { type: "month" }
      }

      jql = @ab.compileAxis(axis: axis, tableAlias: "T1")
      assert _.isEqual jql, {
        type: "op"
        op: "substr"
        exprs: [
          {
            type: "field"
            tableAlias: "T1"
            column: "date"
          }
          6
          2
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

    it "defaults count aggr if will satify output", ->
      axis = @ab.cleanAxis(axis: @axisDecimal, table: "t1", types: ["integer"])
      assert.equal axis.aggr, "count"

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

  describe "validateAxis", ->
    it "allows xform", ->
      axis = {
        expr: @exprDecimal
        xform: { type: "bin", numBins: 10, min: 2, max: 8 }
      }
      assert not @ab.validateAxis(axis: axis)

    it "requires min, max for bin", ->
      axis = {
        expr: @exprDecimal
        xform: { type: "bin", numBins: 10, min: 2 }
      }
      assert @ab.validateAxis(axis: axis)

  describe "getExprTypes", ->
    it "adds any if aggr allowed and integer out", ->
      assert.include @ab.getExprTypes(["integer"], "optional"), "datetime"
      assert.include @ab.getExprTypes(["integer"], "required"), "datetime"
      assert.notInclude @ab.getExprTypes(["decimal"], "required"), "datetime"
  
    it "adds integer, decimal if binnable", ->
      assert.include @ab.getExprTypes(["enum"], "optional"), "integer"
      assert.include @ab.getExprTypes(["enum"], "optional"), "decimal"


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

  describe "formatValue", ->
    it "formats axes with categories", ->
      axis = {
        expr: @exprDecimal
        xform: { type: "bin", numBins: 3, min: 1, max: 4 }
      }
      assert.equal @ab.formatValue(axis, 0), "< 1"

    it "converts to string", ->
      assert.equal @ab.formatValue(@axisDecimal, 2), "2"
    
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

    it "gets bins by name", ->
      axis = {
        expr: @exprDecimal
        xform: { type: "bin", numBins: 3, min: 1, max: 4 }
      }

      categories = @ab.getCategories(axis, [])
      compare(categories, [
        { value: 0, label: "< 1" }
        { value: 1, label: "1 - 2" }
        { value: 2, label: "2 - 3" }
        { value: 3, label: "3 - 4" }
        { value: 4, label: "> 4" }
      ])
