// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import _ from "lodash"
import { assert } from "chai"
import * as fixtures from "../fixtures"
import DatagridUtils from "../../src/datagrids/DatagridUtils"
import canonical from "canonical-json"

function compare(actual, expected) {
  return assert.equal(canonical(actual), canonical(expected), "\n" + canonical(actual) + "\n" + canonical(expected))
}

describe("DatagridUtils", function () {
  before(function () {
    this.schema = fixtures.simpleSchema()
    this.datagridUtils = new DatagridUtils(this.schema)

    this.exprNumber = { type: "field", table: "t1", column: "number" }
    this.exprText = { type: "field", table: "t1", column: "text" }
    this.exprDate = { type: "field", table: "t1", column: "date" }
    this.exprEnum = { type: "field", table: "t1", column: "enum" }
    return (this.exprInvalid = { type: "field", table: "t1", column: "NONSUCH" })
  })

  return describe("cleanDesign", function () {
    it("strips if table gone", function () {
      const design = {
        table: "NONSUCH",
        columns: [{ id: "c1", width: 20, type: "expr", label: null, expr: this.exprNumber }]
      }

      return assert.deepEqual(this.datagridUtils.cleanDesign(design), {})
    })

    it("leaves valid columns alone", function () {
      const design = {
        table: "t1",
        columns: [{ id: "c1", width: 20, type: "expr", label: null, expr: this.exprNumber }]
      }

      return assert.equal(this.datagridUtils.cleanDesign(design).columns.length, 1)
    })

    return it("cleans invalid columns", function () {
      const design = {
        table: "t1",
        columns: [{ id: "c1", width: 20, type: "expr", label: null, expr: this.exprInvalid }]
      }

      assert.equal(this.datagridUtils.cleanDesign(design).columns.length, 1)
      return assert(!this.datagridUtils.cleanDesign(design).columns[0].expr)
    })
  })
})
