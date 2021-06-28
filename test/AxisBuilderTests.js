assert = require('chai').assert
fixtures = require './fixtures'
_ = require 'lodash'
React = require 'react'
R = React.createElement

AxisBuilder = require '../src/axes/AxisBuilder'

canonical = require 'canonical-json'

compare = (actual, expected) ->
  assert.equal canonical(actual), canonical(expected), "\ngot:" + canonical(actual) + "\nexp:" + canonical(expected)

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

    it "compiles bin xform with excludeUpper", ->
      axis = {
        expr: @exprNumber
        xform: { type: "bin", numBins: 3, min: 2, max: 5, excludeUpper: true }
      }

      jql = @ab.compileAxis(axis: axis, tableAlias: "T1")
      assert _.isEqual jql, {
        type: "op"
        op: "width_bucket"
        exprs: [
          # Needs a cast to prevent error
          { 
            type: "op"
            op: "::decimal"
            exprs: [
              {
                type: "field"
                tableAlias: "T1"
                column: "number"
              }
            ] 
          }
          { type: "literal", value: [2, 3, 4, 5.000000001] }
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

    it "compiles yearweek xform", ->
      # to_char('2011-12-21T'::date, "YYYY-IW")
      axis = {
        expr: @exprDate
        xform: { type: "yearweek" }
      }

      jql = @ab.compileAxis(axis: axis, tableAlias: "T1")
      assert _.isEqual jql, {
        type: "op"
        op: "to_char"
        exprs: [
          { type: "op", op: "::date", exprs: [{ type: "field", tableAlias: "T1", column: "date" }] }
          "IYYY-IW"
        ]
      }

    it "compiles yearquarter xform", ->
      # to_char('2011-12-21T'::date, "YYYY-Q")
      axis = {
        expr: @exprDate
        xform: { type: "yearquarter" }
      }

      jql = @ab.compileAxis(axis: axis, tableAlias: "T1")
      assert _.isEqual jql, {
        type: "op"
        op: "to_char"
        exprs: [
          { type: "op", op: "::date", exprs: [{ type: "field", tableAlias: "T1", column: "date" }] }
          "YYYY-Q"
        ]
      }

    it "compiles ranges xform", ->
      axis = {
        expr: @exprNumber
        xform: { type: "ranges", ranges: [
          { id: "a", minValue: 0, maxValue: 50, minOpen: false, maxOpen: true } # >=0 and < 50
          { id: "b", minValue: 50, minOpen: false, label: "High" } # >= 50 
          ]}
      }

      jql = @ab.compileAxis(axis: axis, tableAlias: "T1")
      assert _.isEqual jql, {
        type: "case"
        cases: [
          {
            when: {
              type: "op"
              op: "and"
              exprs: [
                { type: "op", op: ">=", exprs: [{ type: "field", tableAlias: "T1", column: "number" }, 0] }
                { type: "op", op: "<", exprs: [{ type: "field", tableAlias: "T1", column: "number" }, 50] }
              ]
            }
            then: "a"
          }
          {
            when: { type: "op", op: ">=", exprs: [{ type: "field", tableAlias: "T1", column: "number" }, 50] }
            then: "b"
          }
        ]
      }

  describe "cleanAxis", ->
    # it "moves legacy aggr into expr", ->
    #   axis = {
    #     expr: { type: "field", table: "t1", column: "number" }
    #     aggr: "sum"
    #   }

    #   axis = @ab.cleanAxis(axis: axis, table: "t1", aggrNeed: "optional")
    #   compare(axis, {
    #     expr: { type: "op", op: "sum", table: "t1", exprs: [{ type: "field", table: "t1", column: "number" }] }
    #   })

    it "cleans expression", ->
      axis = {
        expr: { type: "op", op: "+", table: "t1", exprs: [{ type: "field", table: "t1", column: "number" }, { type: "field", table: "t1", column: "text" }] }
      }

      axis = @ab.cleanAxis(axis: axis, table: "t1", aggrNeed: "optional")
      compare(axis, {
        expr: { type: "op", op: "+", table: "t1", exprs: [{ type: "field", table: "t1", column: "number" }, null] }
      })

    it "nulls if no expression", ->
      axis = {
        expr: null
        aggr: "sum"
      }

      axis = @ab.cleanAxis(axis: axis, table: "t1", aggrNeed: "optional")
      assert not axis

    it "removes bin xform if wrong input type", ->
      axis = {
        expr: @exprEnum
        xform: { type: "bin", numBins: 10, min: 2, max: 8 }
      }

      axis = @ab.cleanAxis(axis: axis, table: "t1", aggrNeed: "optional")
      assert not axis.xform

    it "removes bin xform if wrong output type", ->
      axis = {
        expr: @exprNumber
        xform: { type: "bin", numBins: 10, min: 2, max: 8 }
      }

      axis = @ab.cleanAxis(axis: axis, table: "t1", types: ["number"], aggrNeed: "optional")
      assert not axis.xform

    it "removes ranges xform if wrong input type", ->
      axis = {
        expr: @exprEnum
        xform: { type: "ranges", ranges: [
          { id: "a", minValue: 0, maxValue: 50, minOpen: false, maxOpen: true } # >=0 and < 50
          { id: "b", minValue: 50, minOpen: false, label: "High" } # >= 50 
          ]}
      }

      axis = @ab.cleanAxis(axis: axis, table: "t1", aggrNeed: "optional")
      assert not axis.xform

    it "removes ranges xform if wrong output type", ->
      axis = {
        expr: @exprNumber
        xform: { type: "ranges", ranges: [
          { id: "a", minValue: 0, maxValue: 50, minOpen: false, maxOpen: true } # >=0 and < 50
          { id: "b", minValue: 50, minOpen: false, label: "High" } # >= 50 
          ]}
      }

      axis = @ab.cleanAxis(axis: axis, table: "t1", types: ["number"], aggrNeed: "optional")
      assert not axis.xform

    it "defaults bin xform", ->
      axis = {
        expr: @exprNumber
      }

      axis = @ab.cleanAxis(axis: axis, table: "t1", types: ['enum'], aggrNeed: "optional")
      assert.equal axis.xform.type, "bin"

    it "remove if not possible to get type", ->
      axis = { expr: @exprNumber }
      assert not @ab.cleanAxis(axis: axis, table: "t1", types: ['text'], aggrNeed: "none"), "Should remove text"
      assert @ab.cleanAxis(axis: axis, table: "t1", types: ['enum'], aggrNeed: "none"), "Number can be binned to enum" # Can get enum via binning
    
      assert not @ab.cleanAxis(axis: { expr: @exprText }, table: "t1", types: ['number'], aggrNeed: "none"), "No aggr allowed"
      # Aggr text cannot get to count (actually it can with percent where)
      # assert not @ab.cleanAxis(axis: { expr: @exprText }, table: "t1", types: ['number'], aggrNeed: "required")

    it "defaults colorMap"

  describe "validateAxis", ->
    it "allows xform", ->
      axis = {
        expr: @exprNumber
        xform: { type: "bin", numBins: 10, min: 2, max: 8 }
      }
      assert not @ab.validateAxis(axis: axis)

    it "requires valid min/max bin xform", ->
      axis = {
        expr: @exprNumber
        xform: { type: "bin", numBins: 10, min: 2, max: 1 }
      }
      assert @ab.validateAxis(axis: axis)

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

    it "xforms ranges", ->
      axis = {
        expr: @exprNumber
        xform: { type: "ranges", ranges: [
          { id: "a", minValue: 0, maxValue: 50, minOpen: false, maxOpen: true } # >=0 and < 50
          { id: "b", minValue: 50, minOpen: false, label: "High" } # >= 50 
          ]}
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

    it "formats None overriden", ->
      assert.equal @ab.formatValue(_.extend({}, @axisNumber, nullLabel: "xyz"), null), "xyz"

    it "formats axes with categories", ->
      axis = {
        expr: @exprNumber
        xform: { type: "bin", numBins: 3, min: 1, max: 4 }
      }
      assert.equal @ab.formatValue(axis, 0), "< 1"

    it "formats enum", ->
      assert.equal @ab.formatValue(@axisEnum, "a"), "A"

    it "formats enum overridden", ->
      assert.equal @ab.formatValue(_.extend({}, @axisEnum, { categoryLabels: { '"a"': "A2"}}), "a"), "A2"

    it "formats enumset", ->
      assert.equal @ab.formatValue(@axisEnumset, ["a","b"]), "A, B"

    it "formats enumset overridden", ->
      assert.equal @ab.formatValue(_.extend({}, @axisEnumset, { categoryLabels: { '"a"': "A2"}}), ["a", "b"]), "A2, B"

    it "converts to string", ->
      assert.equal @ab.formatValue(@axisNumber, 2), "2"

    it "adds decimal separator", ->
      assert.equal @ab.formatValue(@axisNumber, 123456), "123,456"
      assert.equal @ab.formatValue(@axisNumber, "123456"), "123,456", "Should parse string"

    it "wraps text[]", ->
      compare(@ab.formatValue(@axisTextarr, ["a", "b"]), R('div', null, R('div', key: 0, "a"), R('div', key: 1, "b")))
      compare(@ab.formatValue(@axisTextarr, JSON.stringify(["a", "b"])), R('div', null, R('div', key: 0, "a"), R('div', key: 1, "b")))

    it "formats numbers", ->
      axisNumberFormatted = { expr: @exprNumber, format: ",.2f" }
      assert.equal @ab.formatValue(axisNumberFormatted, "1234"), "1,234.00"

  describe "getValueColor", ->
    it "gets if in color map", ->
      axis = {
        expr: @exprEnum
        colorMap: [
          { value: "a", color: "#FF0000" }
          { value: "b", color: "#00FF00" }
        ]
      }
      assert.equal @ab.getValueColor(axis, "b"), "#00FF00"

    it "handles missing", ->
      axis = {
        expr: @exprEnum
        colorMap: [
          { value: "a", color: "#FF0000" }
        ]
      }
      assert not @ab.getValueColor(axis, "b")
    
  describe "getCategories", ->
    it "gets enum", ->
      categories = @ab.getCategories(@axisEnum, ["a"])
      compare(categories, [
        { value: "a", label: "A" }
        { value: "b", label: "B" }
        { value: null, label: "None" }
        ])

    it "gets enumset", ->
      categories = @ab.getCategories(@axisEnumset, ["a"])
      compare(categories, [
        { value: "a", label: "A" }
        { value: "b", label: "B" }
        { value: null, label: "None" }
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

    it "gets text values with none", ->
      categories = @ab.getCategories(@axisText, ["a", "b", "a", "c", null])
      compare(categories, [
        { value: "a", label: "a" }
        { value: "b", label: "b" }
        { value: "c", label: "c" }
        { value: null, label: "None" }
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
        { value: 0, label: "< 1" }
        { value: 1, label: "1 - 2" }
        { value: 2, label: "2 - 3" }
        { value: 3, label: "3 - 4" }
        { value: 4, label: "> 4" }
        { value: null, label: "None" }
      ])

    it "gets bins by name with exclusions", ->
      axis = {
        expr: @exprNumber
        xform: { type: "bin", numBins: 3, min: 1, max: 4, excludeLower: true }
      }

      categories = @ab.getCategories(axis, [])
      compare(categories, [
        { value: 1, label: "1 - 2" }
        { value: 2, label: "2 - 3" }
        { value: 3, label: "3 - 4" }
        { value: 4, label: "> 4" }
        { value: null, label: "None" }
      ])

      axis = {
        expr: @exprNumber
        xform: { type: "bin", numBins: 3, min: 1, max: 4, excludeUpper: true }
      }

      categories = @ab.getCategories(axis, [])
      compare(categories, [
        { value: 0, label: "< 1" }
        { value: 1, label: "1 - 2" }
        { value: 2, label: "2 - 3" }
        { value: 3, label: "3 - 4" }
        { value: null, label: "None" }
      ])

    it "gets ranges by name, overriding with label", ->
      axis = {
        expr: @exprNumber
        xform: { type: "ranges", ranges: [
          { id: "a", minValue: 0, maxValue: 50, minOpen: false, maxOpen: true } # >=0 and < 50
          { id: "b", minValue: 50, minOpen: false, label: "High" } # >= 50 
          ]}
      }

      categories = @ab.getCategories(axis, [])
      compare(categories, [
        { value: "a", label: ">= 0 and < 50" }
        { value: "b", label: "High" }
        { value: null, label: "None" }
     ])

    it "gets floor", ->
      axis = {
        expr: @exprNumber
        xform: { type: "floor" }
      }

      categories = @ab.getCategories(axis, [2.5, 4.5])
      compare(categories, [
        { value: 2, label: "2" }
        { value: 3, label: "3" }
        { value: 4, label: "4" }
     ])

    it "gets months", ->
      axis = {
        expr: @exprDate
        xform: { type: "month" }
      }

      categories = @ab.getCategories(axis, ['2010-02-01', null])
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
        { value: null, label: "None" }
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
        { value: null, label: "None" }
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
        { value: null, label: "None" }
      ])

    it "gets yearweeks", ->
      axis = {
        expr: @exprDate
        xform: { type: "yearweek" }
      }

      categories = @ab.getCategories(axis, ['2010-51', '2011-01', null])
      compare(categories, [
        { value: "2010-51", label: "2010-51" }
        { value: "2010-52", label: "2010-52" }
        { value: "2011-01", label: "2011-01" }
        { value: null, label: "None" }
      ])

    it "gets yearquarters", ->
      axis = {
        expr: @exprDate
        xform: { type: "yearquarter" }
      }

      categories = @ab.getCategories(axis, ['2010-2', '2011-1', null])
      compare(categories, [
        { value: "2010-2", label: "2010 Apr-Jun" }
        { value: "2010-3", label: "2010 Jul-Sep" }
        { value: "2010-4", label: "2010 Oct-Dec" }
        { value: "2011-1", label: "2011 Jan-Mar" }
        { value: null, label: "None" }
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
        { value: null, label: "None" }
      ])
