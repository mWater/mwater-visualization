import { assert } from "chai"
import * as fixtures from "./fixtures"
import _ from "lodash"
import React from "react"
const R = React.createElement

import AxisBuilder from "../src/axes/AxisBuilder"
import canonical from "canonical-json"
import { Axis } from "../src/axes/Axis"

function compare(actual: any, expected: any) {
  assert.equal(
    canonical(actual),
    canonical(expected),
    "\ngot:" + canonical(actual) + "\nexp:" + canonical(expected)
  )
}

describe("AxisBuilder", function () {
  before(function () {
    this.ab = new AxisBuilder({ schema: fixtures.simpleSchema() })
    this.exprNumber = { type: "field", table: "t1", column: "number" }
    this.exprText = { type: "field", table: "t1", column: "text" }
    this.exprDate = { type: "field", table: "t1", column: "date" }
    this.exprDatetime = { type: "field", table: "t1", column: "datetime" }
    this.exprEnum = { type: "field", table: "t1", column: "enum" }
    this.exprEnumset = { type: "field", table: "t1", column: "enumset" }
    this.exprTextarr = { type: "field", table: "t1", column: "text[]" }

    this.axisNumber = { expr: this.exprNumber }
    this.axisNumberSum = { expr: this.exprNumber, aggr: "sum" }
    this.axisNumberCount = { expr: this.exprCount, aggr: "count" }
    this.axisEnum = { expr: this.exprEnum }
    this.axisEnumset = { expr: this.exprEnumset }
    this.axisText = { expr: this.exprText }
    this.axisTextarr = { expr: this.exprTextarr }
  })

  describe("compileAxis", function () {
    it("compiles simple expr", function () {
      const jql = this.ab.compileAxis({ axis: this.axisNumber, tableAlias: "T1" })
      assert(
        _.isEqual(jql, {
          type: "field",
          tableAlias: "T1",
          column: "number"
        })
      )
    })

    it("compiles aggregated field", function () {
      const axis = {
        expr: this.exprNumber,
        aggr: "sum"
      }

      const jql = this.ab.compileAxis({ axis: this.axisNumberSum, tableAlias: "T1" })
      assert(
        _.isEqual(jql, {
          type: "op",
          op: "sum",
          exprs: [
            {
              type: "field",
              tableAlias: "T1",
              column: "number"
            }
          ]
        })
      )
    })

    it("compiles bin xform", function () {
      const axis = {
        expr: this.exprNumber,
        xform: { type: "bin", numBins: 10, min: 2, max: 8 }
      }

      const jql = this.ab.compileAxis({ axis, tableAlias: "T1" })
      assert(
        _.isEqual(jql, {
          type: "op",
          op: "width_bucket",
          exprs: [
            {
              type: "field",
              tableAlias: "T1",
              column: "number"
            },
            2,
            8,
            10
          ]
        })
      )
    })

    it("compiles bin xform with excludeUpper", function () {
      const axis = {
        expr: this.exprNumber,
        xform: { type: "bin", numBins: 3, min: 2, max: 5, excludeUpper: true }
      }

      const jql = this.ab.compileAxis({ axis, tableAlias: "T1" })
      assert(
        _.isEqual(jql, {
          type: "op",
          op: "width_bucket",
          exprs: [
            // Needs a cast to prevent error
            {
              type: "op",
              op: "::decimal",
              exprs: [
                {
                  type: "field",
                  tableAlias: "T1",
                  column: "number"
                }
              ]
            },
            { type: "literal", value: [2, 3, 4, 5.000000001] }
          ]
        })
      )
    })

    it("compiles date xform", function () {
      const axis = {
        expr: this.exprDate,
        xform: { type: "date" }
      }

      const jql = this.ab.compileAxis({ axis, tableAlias: "T1" })
      assert(
        _.isEqual(jql, {
          type: "op",
          op: "substr",
          exprs: [
            {
              type: "field",
              tableAlias: "T1",
              column: "date"
            },
            1,
            10
          ]
        })
      )
    })

    it("compiles year xform", function () {
      // rpad(substr('2011-12-21T', 1, 4), 10, '-01-01')
      const axis = {
        expr: this.exprDate,
        xform: { type: "year" }
      }

      const jql = this.ab.compileAxis({ axis, tableAlias: "T1" })
      assert(
        _.isEqual(jql, {
          type: "op",
          op: "rpad",
          exprs: [
            {
              type: "op",
              op: "substr",
              exprs: [
                {
                  type: "field",
                  tableAlias: "T1",
                  column: "date"
                },
                1,
                4
              ]
            },
            10,
            "-01-01"
          ]
        })
      )
    })

    it("compiles yearmonth xform", function () {
      // rpad(substr('2011-12-21T', 1, 7), 10, '-01')
      const axis = {
        expr: this.exprDate,
        xform: { type: "yearmonth" }
      }

      const jql = this.ab.compileAxis({ axis, tableAlias: "T1" })
      assert(
        _.isEqual(jql, {
          type: "op",
          op: "rpad",
          exprs: [
            {
              type: "op",
              op: "substr",
              exprs: [
                {
                  type: "field",
                  tableAlias: "T1",
                  column: "date"
                },
                1,
                7
              ]
            },
            10,
            "-01"
          ]
        })
      )
    })

    it("compiles month xform", function () {
      // substr('2011-12-21T', 6, 2)
      const axis = {
        expr: this.exprDate,
        xform: { type: "month" }
      }

      const jql = this.ab.compileAxis({ axis, tableAlias: "T1" })
      assert(
        _.isEqual(jql, {
          type: "op",
          op: "substr",
          exprs: [
            {
              type: "field",
              tableAlias: "T1",
              column: "date"
            },
            6,
            2
          ]
        })
      )
    })

    it("compiles yearweek xform", function () {
      // to_char('2011-12-21T'::date, "YYYY-IW")
      const axis = {
        expr: this.exprDate,
        xform: { type: "yearweek" }
      }

      const jql = this.ab.compileAxis({ axis, tableAlias: "T1" })
      assert(
        _.isEqual(jql, {
          type: "op",
          op: "to_char",
          exprs: [{ type: "op", op: "::date", exprs: [{ type: "field", tableAlias: "T1", column: "date" }] }, "IYYY-IW"]
        })
      )
    })

    it("compiles yearquarter xform", function () {
      // to_char('2011-12-21T'::date, "YYYY-Q")
      const axis = {
        expr: this.exprDate,
        xform: { type: "yearquarter" }
      }

      const jql = this.ab.compileAxis({ axis, tableAlias: "T1" })
      assert(
        _.isEqual(jql, {
          type: "op",
          op: "to_char",
          exprs: [{ type: "op", op: "::date", exprs: [{ type: "field", tableAlias: "T1", column: "date" }] }, "YYYY-Q"]
        })
      )
    })

    return it("compiles ranges xform", function () {
      const axis = {
        expr: this.exprNumber,
        xform: {
          type: "ranges",
          ranges: [
            { id: "a", minValue: 0, maxValue: 50, minOpen: false, maxOpen: true }, // >=0 and < 50
            { id: "b", minValue: 50, minOpen: false, label: "High" } // >= 50
          ]
        }
      }

      const jql = this.ab.compileAxis({ axis, tableAlias: "T1" })
      assert(
        _.isEqual(jql, {
          type: "case",
          cases: [
            {
              when: {
                type: "op",
                op: "and",
                exprs: [
                  { type: "op", op: ">=", exprs: [{ type: "field", tableAlias: "T1", column: "number" }, 0] },
                  { type: "op", op: "<", exprs: [{ type: "field", tableAlias: "T1", column: "number" }, 50] }
                ]
              },
              then: "a"
            },
            {
              when: { type: "op", op: ">=", exprs: [{ type: "field", tableAlias: "T1", column: "number" }, 50] },
              then: "b"
            }
          ]
        })
      )
    })
  })

  describe("cleanAxis", function () {
    // it "moves legacy aggr into expr", ->
    //   axis = {
    //     expr: { type: "field", table: "t1", column: "number" }
    //     aggr: "sum"
    //   }

    //   axis = @ab.cleanAxis(axis: axis, table: "t1", aggrNeed: "optional")
    //   compare(axis, {
    //     expr: { type: "op", op: "sum", table: "t1", exprs: [{ type: "field", table: "t1", column: "number" }] }
    //   })

    it("cleans expression", function () {
      let axis = {
        expr: {
          type: "op",
          op: "+",
          table: "t1",
          exprs: [
            { type: "field", table: "t1", column: "number" },
            { type: "field", table: "t1", column: "text" }
          ]
        }
      }

      axis = this.ab.cleanAxis({ axis, table: "t1", aggrNeed: "optional" })
      compare(axis, {
        expr: { type: "op", op: "+", table: "t1", exprs: [{ type: "field", table: "t1", column: "number" }, null] }
      })
    })

    it("nulls if no expression", function () {
      let axis = {
        expr: null,
        aggr: "sum"
      }

      axis = this.ab.cleanAxis({ axis, table: "t1", aggrNeed: "optional" })
      assert(!axis)
    })

    it("removes bin xform if wrong input type", function () {
      let axis = {
        expr: this.exprEnum,
        xform: { type: "bin", numBins: 10, min: 2, max: 8 }
      }

      axis = this.ab.cleanAxis({ axis, table: "t1", aggrNeed: "optional" })
      assert(!axis.xform)
    })

    it("removes bin xform if wrong output type", function () {
      let axis = {
        expr: this.exprNumber,
        xform: { type: "bin", numBins: 10, min: 2, max: 8 }
      }

      axis = this.ab.cleanAxis({ axis, table: "t1", types: ["number"], aggrNeed: "optional" })
      assert(!axis.xform)
    })

    it("removes ranges xform if wrong input type", function () {
      let axis = {
        expr: this.exprEnum,
        xform: {
          type: "ranges",
          ranges: [
            { id: "a", minValue: 0, maxValue: 50, minOpen: false, maxOpen: true }, // >=0 and < 50
            { id: "b", minValue: 50, minOpen: false, label: "High" } // >= 50
          ]
        }
      }

      axis = this.ab.cleanAxis({ axis, table: "t1", aggrNeed: "optional" })
      assert(!axis.xform)
    })

    it("removes ranges xform if wrong output type", function () {
      let axis = {
        expr: this.exprNumber,
        xform: {
          type: "ranges",
          ranges: [
            { id: "a", minValue: 0, maxValue: 50, minOpen: false, maxOpen: true }, // >=0 and < 50
            { id: "b", minValue: 50, minOpen: false, label: "High" } // >= 50
          ]
        }
      }

      axis = this.ab.cleanAxis({ axis, table: "t1", types: ["number"], aggrNeed: "optional" })
      assert(!axis.xform)
    })

    it("defaults bin xform", function () {
      let axis: Axis = {
        expr: this.exprNumber
      }

      axis = this.ab.cleanAxis({ axis, table: "t1", types: ["enum"], aggrNeed: "optional" })
      assert.equal(axis.xform!.type, "bin")
    })

    it("remove if not possible to get type", function () {
      const axis = { expr: this.exprNumber }
      assert(!this.ab.cleanAxis({ axis, table: "t1", types: ["text"], aggrNeed: "none" }), "Should remove text")
      assert(
        this.ab.cleanAxis({ axis, table: "t1", types: ["enum"], aggrNeed: "none" }),
        "Number can be binned to enum"
      ) // Can get enum via binning

      assert(
        !this.ab.cleanAxis({ axis: { expr: this.exprText }, table: "t1", types: ["number"], aggrNeed: "none" }),
        "No aggr allowed"
      )
    })
    // Aggr text cannot get to count (actually it can with percent where)
    // assert not @ab.cleanAxis(axis: { expr: @exprText }, table: "t1", types: ['number'], aggrNeed: "required")

    return it("defaults colorMap")
  })

  describe("validateAxis", function () {
    it("allows xform", function () {
      const axis = {
        expr: this.exprNumber,
        xform: { type: "bin", numBins: 10, min: 2, max: 8 }
      }
      assert(!this.ab.validateAxis({ axis }))
    })

    return it("requires valid min/max bin xform", function () {
      const axis = {
        expr: this.exprNumber,
        xform: { type: "bin", numBins: 10, min: 2, max: 1 }
      }
      assert(this.ab.validateAxis({ axis }))
    })
  })

  describe("getExprTypes", function () {
    it("does not add any if aggr allowed and number out", function () {
      assert.notInclude(this.ab.getExprTypes(["number"], "optional"), "datetime")
      assert.notInclude(this.ab.getExprTypes(["number"], "required"), "datetime")
    })

    return it("adds number if binnable", function () {
      assert.include(this.ab.getExprTypes(["enum"], "optional"), "number")
    })
  })

  describe("getAxisType", function () {
    it("passes through if no aggr or xform", function () {
      assert.equal(this.ab.getAxisType(this.axisNumber), "number")
    })

    it("converts count aggr to number", function () {
      assert.equal(this.ab.getAxisType(this.axisNumberCount), "number")
    })

    it("xforms bin", function () {
      const axis = {
        expr: this.exprNumber,
        xform: { type: "bin", numBins: 10, min: 2, max: 8 }
      }
      assert.equal(this.ab.getAxisType(axis), "enum")
    })

    it("xforms ranges", function () {
      const axis = {
        expr: this.exprNumber,
        xform: {
          type: "ranges",
          ranges: [
            { id: "a", minValue: 0, maxValue: 50, minOpen: false, maxOpen: true }, // >=0 and < 50
            { id: "b", minValue: 50, minOpen: false, label: "High" } // >= 50
          ]
        }
      }
      assert.equal(this.ab.getAxisType(axis), "enum")
    })

    return it("xforms date", function () {
      const axis = {
        expr: this.exprDatetime,
        xform: { type: "date" }
      }
      assert.equal(this.ab.getAxisType(axis), "date")
    })
  })

  describe("formatValue", function () {
    it("formats None", function () {
      assert.equal(this.ab.formatValue(this.axisNumber, null), "None")
    })

    it("formats None overriden", function () {
      assert.equal(this.ab.formatValue(_.extend({}, this.axisNumber, { nullLabel: "xyz" }), null), "xyz")
    })

    it("formats axes with categories", function () {
      const axis = {
        expr: this.exprNumber,
        xform: { type: "bin", numBins: 3, min: 1, max: 4 }
      }
      assert.equal(this.ab.formatValue(axis, 0), "< 1")
    })

    it("formats enum", function () {
      assert.equal(this.ab.formatValue(this.axisEnum, "a"), "A")
    })

    it("formats enum overridden", function () {
      assert.equal(
        this.ab.formatValue(_.extend({}, this.axisEnum, { categoryLabels: { '"a"': "A2" } }), "a"),
        "A2"
      )
    })

    it("formats enumset", function () {
      assert.equal(this.ab.formatValue(this.axisEnumset, ["a", "b"]), "A, B")
    })

    it("formats enumset overridden", function () {
      assert.equal(
        this.ab.formatValue(_.extend({}, this.axisEnumset, { categoryLabels: { '"a"': "A2" } }), ["a", "b"]),
        "A2, B"
      )
    })

    it("converts to string", function () {
      assert.equal(this.ab.formatValue(this.axisNumber, 2), "2")
    })

    it("adds decimal separator", function () {
      assert.equal(this.ab.formatValue(this.axisNumber, 123456), "123,456")
      assert.equal(this.ab.formatValue(this.axisNumber, "123456"), "123,456", "Should parse string")
    })

    it("wraps text[]", function () {
      compare(
        this.ab.formatValue(this.axisTextarr, ["a", "b"]),
        R("div", null, R("div", { key: 0 }, "a"), R("div", { key: 1 }, "b"))
      )
      compare(
        this.ab.formatValue(this.axisTextarr, JSON.stringify(["a", "b"])),
        R("div", null, R("div", { key: 0 }, "a"), R("div", { key: 1 }, "b"))
      )
    })

    return it("formats numbers", function () {
      const axisNumberFormatted = { expr: this.exprNumber, format: ",.2f" }
      assert.equal(this.ab.formatValue(axisNumberFormatted, "1234"), "1,234.00")
    })
  })

  describe("getValueColor", function () {
    it("gets if in color map", function () {
      const axis = {
        expr: this.exprEnum,
        colorMap: [
          { value: "a", color: "#FF0000" },
          { value: "b", color: "#00FF00" }
        ]
      }
      assert.equal(this.ab.getValueColor(axis, "b"), "#00FF00")
    })

    return it("handles missing", function () {
      const axis = {
        expr: this.exprEnum,
        colorMap: [{ value: "a", color: "#FF0000" }]
      }
      assert(!this.ab.getValueColor(axis, "b"))
    })
  })

  return describe("getCategories", function () {
    it("gets enum", function () {
      const categories = this.ab.getCategories(this.axisEnum, ["a"])
      compare(categories, [
        { value: "a", label: "A" },
        { value: "b", label: "B" },
        { value: null, label: "None" }
      ])
    })

    it("gets limited enum", function () {
      const categories = this.ab.getCategories(this.axisEnum, ["a", "a", null], { onlyValuesPresent: true })
      compare(categories, [
        { value: "a", label: "A" },
        { value: null, label: "None" }
      ])
    })

    it("gets enumset", function () {
      const categories = this.ab.getCategories(this.axisEnumset, ["a"])
      compare(categories, [
        { value: "a", label: "A" },
        { value: "b", label: "B" },
        { value: null, label: "None" }
      ])
    })

    it("gets limited enumset", function () {
      const categories = this.ab.getCategories(this.axisEnumset, ["a", "a"], { onlyValuesPresent: true })
      compare(categories, [
        { value: "a", label: "A" }
      ])
    })

    it("gets limited enumset with array", function () {
      const categories = this.ab.getCategories(this.axisEnumset, [["a"]], { onlyValuesPresent: true })
      compare(categories, [
        { value: "a", label: "A" }
      ])
    })

    // Integer ranges no longer supported since decimal and integer were merged as numbre
    // it "gets number range", ->
    //   categories = @ab.getCategories(@axisInteger, [3, 4, 7])
    //   compare(categories, [
    //     { value: 3, label: "3" }
    //     { value: 4, label: "4" }
    //     { value: 5, label: "5" }
    //     { value: 6, label: "6" }
    //     { value: 7, label: "7" }
    //     ])

    it("gets text values", function () {
      const categories = this.ab.getCategories(this.axisText, ["a", "b", "a", "c"])
      compare(categories, [
        { value: "a", label: "a" },
        { value: "b", label: "b" },
        { value: "c", label: "c" }
      ])
    })

    it("gets text values with none", function () {
      const categories = this.ab.getCategories(this.axisText, ["a", "b", "a", "c", null])
      compare(categories, [
        { value: "a", label: "a" },
        { value: "b", label: "b" },
        { value: "c", label: "c" },
        { value: null, label: "None" }
      ])
    })

    it("gets empty list for number", function () {
      const categories = this.ab.getCategories(this.axisNumber, [1.2, 1.4])
      compare(categories, [])
    })

    it("gets bins by name", function () {
      const axis = {
        expr: this.exprNumber,
        xform: { type: "bin", numBins: 3, min: 1, max: 4 }
      }

      const categories = this.ab.getCategories(axis, [])
      compare(categories, [
        { value: 0, label: "< 1" },
        { value: 1, label: "1 - 2" },
        { value: 2, label: "2 - 3" },
        { value: 3, label: "3 - 4" },
        { value: 4, label: "> 4" },
        { value: null, label: "None" }
      ])
    })

    it("gets bins by name with exclusions", function () {
      let axis: Axis = {
        expr: this.exprNumber,
        xform: { type: "bin", numBins: 3, min: 1, max: 4, excludeLower: true }
      }

      let categories = this.ab.getCategories(axis, [])
      compare(categories, [
        { value: 1, label: "1 - 2" },
        { value: 2, label: "2 - 3" },
        { value: 3, label: "3 - 4" },
        { value: 4, label: "> 4" },
        { value: null, label: "None" }
      ])

      axis = {
        expr: this.exprNumber,
        xform: { type: "bin", numBins: 3, min: 1, max: 4, excludeUpper: true }
      }

      categories = this.ab.getCategories(axis, [])
      compare(categories, [
        { value: 0, label: "< 1" },
        { value: 1, label: "1 - 2" },
        { value: 2, label: "2 - 3" },
        { value: 3, label: "3 - 4" },
        { value: null, label: "None" }
      ])
    })

    it("gets ranges by name, overriding with label", function () {
      const axis = {
        expr: this.exprNumber,
        xform: {
          type: "ranges",
          ranges: [
            { id: "a", minValue: 0, maxValue: 50, minOpen: false, maxOpen: true }, // >=0 and < 50
            { id: "b", minValue: 50, minOpen: false, label: "High" } // >= 50
          ]
        }
      }

      const categories = this.ab.getCategories(axis, [])
      compare(categories, [
        { value: "a", label: ">= 0 and < 50" },
        { value: "b", label: "High" },
        { value: null, label: "None" }
      ])
    })

    it("gets floor", function () {
      const axis = {
        expr: this.exprNumber,
        xform: { type: "floor" }
      }

      const categories = this.ab.getCategories(axis, [2.5, 4.5])
      compare(categories, [
        { value: 2, label: "2" },
        { value: 3, label: "3" },
        { value: 4, label: "4" }
      ])
    })

    it("gets months", function () {
      const axis = {
        expr: this.exprDate,
        xform: { type: "month" }
      }

      const categories = this.ab.getCategories(axis, ["02", null])
      compare(categories, [
        { value: "01", label: "January" },
        { value: "02", label: "February" },
        { value: "03", label: "March" },
        { value: "04", label: "April" },
        { value: "05", label: "May" },
        { value: "06", label: "June" },
        { value: "07", label: "July" },
        { value: "08", label: "August" },
        { value: "09", label: "September" },
        { value: "10", label: "October" },
        { value: "11", label: "November" },
        { value: "12", label: "December" },
        { value: null, label: "None" }
      ])
    })

    it("gets limited months", function () {
      const axis = {
        expr: this.exprDate,
        xform: { type: "month" }
      }

      const categories = this.ab.getCategories(axis, ["02", "02", null], { onlyValuesPresent: true })
      compare(categories, [
        { value: "02", label: "February" },
        { value: null, label: "None" }
      ])
    })

    it("gets years", function () {
      const axis = {
        expr: this.exprDate,
        xform: { type: "year" }
      }

      const categories = this.ab.getCategories(axis, ["2010-01-01", "2013-01-01", null])
      compare(categories, [
        { value: "2010-01-01", label: "2010" },
        { value: "2011-01-01", label: "2011" },
        { value: "2012-01-01", label: "2012" },
        { value: "2013-01-01", label: "2013" },
        { value: null, label: "None" }
      ])
    })

    it("gets limited years", function () {
      const axis = {
        expr: this.exprDate,
        xform: { type: "year" }
      }

      const categories = this.ab.getCategories(axis, ["2010-01-01", "2013-01-01", "2013-01-01", null], { onlyValuesPresent: true })
      compare(categories, [
        { value: "2010-01-01", label: "2010" },
        { value: "2013-01-01", label: "2013" },
        { value: null, label: "None" }
      ])
    })

    it("gets yearmonths", function () {
      const axis = {
        expr: this.exprDate,
        xform: { type: "yearmonth" }
      }

      const categories = this.ab.getCategories(axis, ["2010-01-01", "2010-03-01", null])
      compare(categories, [
        { value: "2010-01-01", label: "Jan 2010" },
        { value: "2010-02-01", label: "Feb 2010" },
        { value: "2010-03-01", label: "Mar 2010" },
        { value: null, label: "None" }
      ])
    })

    it("gets limited yearmonths", function () {
      const axis = {
        expr: this.exprDate,
        xform: { type: "yearmonth" }
      }

      const categories = this.ab.getCategories(axis, ["2010-01-01", "2010-03-01", "2010-03-01", null], { onlyValuesPresent: true })
      compare(categories, [
        { value: "2010-01-01", label: "Jan 2010" },
        { value: "2010-03-01", label: "Mar 2010" },
        { value: null, label: "None" }
      ])
    })

    it("gets yearweeks", function () {
      const axis = {
        expr: this.exprDate,
        xform: { type: "yearweek" }
      }

      const categories = this.ab.getCategories(axis, ["2010-51", "2011-01", null])
      compare(categories, [
        { value: "2010-51", label: "2010-51" },
        { value: "2010-52", label: "2010-52" },
        { value: "2011-01", label: "2011-01" },
        { value: null, label: "None" }
      ])
    })

    it("gets limited yearweeks", function () {
      const axis = {
        expr: this.exprDate,
        xform: { type: "yearweek" }
      }

      const categories = this.ab.getCategories(axis, ["2010-51", "2011-01", "2011-01", null], { onlyValuesPresent: true })
      compare(categories, [
        { value: "2010-51", label: "2010-51" },
        { value: "2011-01", label: "2011-01" },
        { value: null, label: "None" }
      ])
    })

    it("gets yearquarters", function () {
      const axis = {
        expr: this.exprDate,
        xform: { type: "yearquarter" }
      }

      const categories = this.ab.getCategories(axis, ["2010-2", "2011-1", null])
      compare(categories, [
        { value: "2010-2", label: "2010 Apr-Jun" },
        { value: "2010-3", label: "2010 Jul-Sep" },
        { value: "2010-4", label: "2010 Oct-Dec" },
        { value: "2011-1", label: "2011 Jan-Mar" },
        { value: null, label: "None" }
      ])
    })

    it("gets limited yearquarters", function () {
      const axis = {
        expr: this.exprDate,
        xform: { type: "yearquarter" }
      }

      const categories = this.ab.getCategories(axis, ["2010-2", "2011-1", "2011-1", null], { onlyValuesPresent: true })
      compare(categories, [
        { value: "2010-2", label: "2010 Apr-Jun" },
        { value: "2011-1", label: "2011 Jan-Mar" },
        { value: null, label: "None" }
      ])
    })

    it("gets days", function () {
      const axis = {
        expr: this.exprDate
      }

      const categories = this.ab.getCategories(axis, ["2010-01-30", "2010-02-02", null])
      compare(categories, [
        { value: "2010-01-30", label: "Jan 30, 2010" },
        { value: "2010-01-31", label: "Jan 31, 2010" },
        { value: "2010-02-01", label: "Feb 1, 2010" },
        { value: "2010-02-02", label: "Feb 2, 2010" },
        { value: null, label: "None" }
      ])
    })

    it("gets limited days", function () {
      const axis = {
        expr: this.exprDate
      }

      const categories = this.ab.getCategories(axis, ["2010-01-30", "2010-02-02", "2010-02-02", null], { onlyValuesPresent: true })
      compare(categories, [
        { value: "2010-01-30", label: "Jan 30, 2010" },
        { value: "2010-02-02", label: "Feb 2, 2010" },
        { value: null, label: "None" }
      ])
    })
  })
})
