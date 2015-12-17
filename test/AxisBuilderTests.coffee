assert = require('chai').assert
fixtures = require './fixtures'
_ = require 'lodash'
React = require 'react'
H = React.DOM

AxisBuilder = require '../src/axes/AxisBuilder'

canonical = require 'canonical-json'

compare = (actual, expected) ->
  assert.equal canonical(actual), canonical(expected), "\n" + canonical(actual) + "\n" + canonical(expected)

describe "AxisBuilder", ->
  before ->
    @ab = new AxisBuilder(schema: fixtures.simpleSchema())
    @exprNumber = { type: "field", table: "t1", column: "number" }
    @exprText = { type: "field", table: "t1", column: "text" }
    @exprDate = { type: "field", table: "t1", column: "date" }
    @exprDatetime = { type: "field", table: "t1", column: "datetime" }
    @exprEnum = { type: "field", table: "t1", column: "enum" }
    @exprEnumset = { type: "field", table: "t1", column: "enumset" }
    @exprTextarr = { type: "field", table: "t1", column: "text[]" }

    @axisNumber = { expr: @exprNumber }
    @axisNumberSum = { expr: @exprNumber, aggr: "sum" }
    @axisNumberCount = { expr: @exprCount, aggr: "count" }
    @axisEnum = { expr: @exprEnum } 
    @axisEnumset = { expr: @exprEnumset } 
    @axisText = { expr: @exprText } 
    @axisTextarr = { expr: @exprTextarr } 

  describe "compileAxis", ->
    it "compiles simple expr", ->
      jql = @ab.compileAxis(axis: @axisNumber, tableAlias: "T1")
      assert _.isEqual jql, {
        type: "field"
        tableAlias: "T1"
        column: "number"
      }

    it "compiles aggregated field", ->
      axis = {
        expr: @exprNumber
        aggr: "sum"
      }

      jql = @ab.compileAxis(axis: @axisNumberSum, tableAlias: "T1")
      assert _.isEqual jql, {
        type: "op"
        op: "sum"
        exprs: [
          {
            type: "field"
            tableAlias: "T1"
            column: "number"
          }
        ]
      }

    it "compiles bin xform", ->
      axis = {
        expr: @exprNumber
        xform: { type: "bin", numBins: 10, min: 2, max: 8 }
      }

      jql = @ab.compileAxis(axis: axis, tableAlias: "T1")
      assert _.isEqual jql, {
        type: "op"
        op: "||"
        exprs: [
          {
            type: "op"
            op: "width_bucket"
            exprs: [
              {
                type: "field"
                tableAlias: "T1"
                column: "number"
              },
              2,
              8,
              10
            ]
          }
          ":"
          2
          ":"
          8
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
        expr: @exprNumber
        xform: { type: "bin", numBins: 10, min: 2, max: 8 }
      }

      axis = @ab.cleanAxis(axis: axis, table: "t1", types: ["number"])
      assert not axis.xform

    it "removes bad aggr"

    it "does not default count aggr for text", ->
      axis = @ab.cleanAxis(axis: @axisText, table: "t1", types: ["number"])
      assert not axis, JSON.stringify(axis)

    it "removes aggr if xform", ->
      axis = {
        expr: @exprNumber
        xform: { type: "bin", numBins: 10, min: 2, max: 8 }
        aggr: "sum"
      }

      axis = @ab.cleanAxis(axis: axis, table: "t1", types: ["enum"])
      assert not axis.aggr

    it "defaults bin xform", ->
      axis = {
        expr: @exprNumber
      }

      axis = @ab.cleanAxis(axis: axis, table: "t1", types: ['enum'])
      assert.equal axis.xform.type, "bin"

    it "remove if not possible to get type", ->
      axis = { expr: @exprNumber }
      assert not @ab.cleanAxis(axis: axis, table: "t1", types: ['text'], aggrNeed: "none"), "Should remove text"
      assert @ab.cleanAxis(axis: axis, table: "t1", types: ['enum'], aggrNeed: "none"), "Number can be binned to enum" # Can get enum via binning
    
      # Aggr text cannot get to count
      assert not @ab.cleanAxis(axis: { expr: @exprText }, table: "t1", types: ['number'], aggrNeed: "none"), "No aggr allowed"
      assert not @ab.cleanAxis(axis: { expr: @exprText }, table: "t1", types: ['number'], aggrNeed: "required")

    it "defaults colorMap"

  describe "validateAxis", ->
    it "allows xform", ->
      axis = {
        expr: @exprNumber
        xform: { type: "bin", numBins: 10, min: 2, max: 8 }
      }
      assert not @ab.validateAxis(axis: axis)

  describe "getExprTypes", ->
    it "does not add any if aggr allowed and number out", ->
      assert.notInclude @ab.getExprTypes(["number"], "optional"), "datetime"
      assert.notInclude @ab.getExprTypes(["number"], "required"), "datetime"
  
    it "adds number if binnable", ->
      assert.include @ab.getExprTypes(["enum"], "optional"), "number"

  describe "getAxisType", ->
    it "passes through if no aggr or xform", ->
      assert.equal @ab.getAxisType(@axisNumber), "number"

    it "converts count aggr to number", ->
      assert.equal @ab.getAxisType(@axisNumberCount), "number"

    it "xforms bin", ->
      axis = {
        expr: @exprNumber
        xform: { type: "bin", numBins: 10, min: 2, max: 8 }
      }
      assert.equal @ab.getAxisType(axis), "enum"

    it "xforms date", ->
      axis = {
        expr: @exprDatetime
        xform: { type: "date" }
      }
      assert.equal @ab.getAxisType(axis), "date"

  describe "formatValue", ->
    it "formats None", ->
      assert.equal @ab.formatValue(@axisNumber, null), "None"

    it "formats axes with categories", ->
      axis = {
        expr: @exprNumber
        xform: { type: "bin", numBins: 3, min: 1, max: 4 }
      }
      assert.equal @ab.formatValue(axis, "0:1:4"), "< 1"

    it "formats enum", ->
      assert.equal @ab.formatValue(@axisEnum, "a"), "A"

    it "formats enumset", ->
      assert.equal @ab.formatValue(@axisEnumset, ["a","b"]), "A, B"

    it "converts to string", ->
      assert.equal @ab.formatValue(@axisNumber, 2), "2"

    it "adds decimal separator", ->
      assert.equal @ab.formatValue(@axisNumber, 123456), "123,456"
      assert.equal @ab.formatValue(@axisNumber, "123456"), "123,456", "Should parse string"

    it "wraps text[]", ->
      compare(@ab.formatValue(@axisTextarr, ["a", "b"]), H.div(null, H.div(key: 0, "a"), H.div(key: 1, "b")))
      compare(@ab.formatValue(@axisTextarr, JSON.stringify(["a", "b"])), H.div(null, H.div(key: 0, "a"), H.div(key: 1, "b")))
    
  describe "getCategories", ->
    it "gets enum", ->
      categories = @ab.getCategories(@axisEnum, ["a"])
      compare(categories, [
        { value: "a", label: "A" }
        { value: "b", label: "B" }
        ])

    it "gets enumset", ->
      categories = @ab.getCategories(@axisEnumset, ["a"])
      compare(categories, [
        { value: "a", label: "A" }
        { value: "b", label: "B" }
        ])

    # Integer ranges no longer supported since decimal and integer were merged as numbre
    # it "gets number range", ->
    #   categories = @ab.getCategories(@axisInteger, [3, 4, 7])
    #   compare(categories, [
    #     { value: 3, label: "3" }
    #     { value: 4, label: "4" }
    #     { value: 5, label: "5" }
    #     { value: 6, label: "6" }
    #     { value: 7, label: "7" }
    #     ])

    it "gets text values", ->
      categories = @ab.getCategories(@axisText, ["a", "b", "a", "c"])
      compare(categories, [
        { value: "a", label: "a" }
        { value: "b", label: "b" }
        { value: "c", label: "c" }
        ])

    it "gets empty list for number", ->
      categories = @ab.getCategories(@axisNumber, [1.2, 1.4])
      compare(categories, [])

    it "gets bins by name", ->
      axis = {
        expr: @exprNumber
        xform: { type: "bin", numBins: 3, min: 1, max: 4 }
      }

      categories = @ab.getCategories(axis, [])
      compare(categories, [
        { value: "0:1:4", label: "< 1" }
        { value: "1:1:4", label: "1 - 2" }
        { value: "2:1:4", label: "2 - 3" }
        { value: "3:1:4", label: "3 - 4" }
        { value: "4:1:4", label: "> 4" }
      ])

    it "gets months", ->
      axis = {
        expr: @exprDate
        xform: { type: "month" }
      }

      categories = @ab.getCategories(axis, [])
      compare(categories, [
        { value: "01", label: "January" }
        { value: "02", label: "February" }
        { value: "03", label: "March" }
        { value: "04", label: "April" }
        { value: "05", label: "May" }
        { value: "06", label: "June" }
        { value: "07", label: "July" }
        { value: "08", label: "August" }
        { value: "09", label: "September" }
        { value: "10", label: "October" }
        { value: "11", label: "November" }
        { value: "12", label: "December" }
      ])

    it "gets years", ->
      axis = {
        expr: @exprDate
        xform: { type: "year" }
      }

      categories = @ab.getCategories(axis, ['2010-01-01', '2013-01-01', null])
      compare(categories, [
        { value: "2010-01-01", label: "2010" }
        { value: "2011-01-01", label: "2011" }
        { value: "2012-01-01", label: "2012" }
        { value: "2013-01-01", label: "2013" }
      ])

    it "gets yearmonths", ->
      axis = {
        expr: @exprDate
        xform: { type: "yearmonth" }
      }

      categories = @ab.getCategories(axis, ['2010-01-01', '2010-03-01', null])
      compare(categories, [
        { value: "2010-01-01", label: "Jan 2010" }
        { value: "2010-02-01", label: "Feb 2010" }
        { value: "2010-03-01", label: "Mar 2010" }
      ])

    it "gets days", ->
      axis = {
        expr: @exprDate
      }

      categories = @ab.getCategories(axis, ['2010-01-30', '2010-02-02', null])
      compare(categories, [
        { value: "2010-01-30", label: "Jan 30, 2010" }
        { value: "2010-01-31", label: "Jan 31, 2010" }
        { value: "2010-02-01", label: "Feb 1, 2010" }
        { value: "2010-02-02", label: "Feb 2, 2010" }
      ])
