// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import _ from "lodash"
import { assert } from "chai"
import * as fixtures from "../fixtures"
import * as PopupFilterJoinsUtils from "../../src/maps/PopupFilterJoinsUtils"
import canonical from "canonical-json"

function compare(actual: any, expected: any) {
  return assert.equal(
    canonical(actual),
    canonical(expected),
    "\n" + canonical(actual) + "\n" + canonical(expected) + "\n"
  )
}

describe("PopupFilterJoinsUtils", function () {
  before(function () {
    return (this.schema = fixtures.simpleSchema())
  })

  it("compiles default", function () {
    const popupFilterJoins = PopupFilterJoinsUtils.createDefaultPopupFilterJoins("t1")
    const filters = PopupFilterJoinsUtils.createPopupFilters(popupFilterJoins, this.schema, "t1", "abc")

    return compare(filters, [
      {
        table: "t1",
        jsonql: {
          type: "op",
          op: "=",
          exprs: [
            { type: "field", tableAlias: "{alias}", column: "primary" },
            { type: "literal", value: "abc" }
          ]
        }
      }
    ])
  })

  it("compiles id join", function () {
    const popupFilterJoins = {
      t2: { table: "t2", type: "field", column: "2-1" }
    }
    const filters = PopupFilterJoinsUtils.createPopupFilters(popupFilterJoins, this.schema, "t1", "abc")

    return compare(filters, [
      {
        table: "t2",
        jsonql: {
          type: "op",
          op: "=",
          exprs: [
            { type: "field", tableAlias: "{alias}", column: "t1" },
            { type: "literal", value: "abc" }
          ]
        }
      }
    ])
  })

  return it("compiles id[] join", function () {
    const popupFilterJoins = {
      t1: { table: "t1", type: "field", column: "1-2" }
    }
    const filters = PopupFilterJoinsUtils.createPopupFilters(popupFilterJoins, this.schema, "t2", "abc")

    return compare(filters, [
      {
        table: "t1",
        jsonql: {
          type: "op",
          op: "@>",
          exprs: [
            {
              type: "scalar",
              expr: {
                type: "op",
                op: "to_jsonb",
                exprs: [
                  {
                    type: "op",
                    op: "array_agg",
                    exprs: [{ column: "primary", tableAlias: "inner", type: "field" }]
                  }
                ]
              },
              from: { alias: "inner", table: "t2", type: "table" },
              where: {
                exprs: [
                  { column: "t1", tableAlias: "inner", type: "field" },
                  { column: "primary", tableAlias: "{alias}", type: "field" }
                ],
                op: "=",
                type: "op"
              },
              limit: 1
            },
            { type: "op", op: "::jsonb", exprs: [{ type: "literal", value: '["abc"]' }] }
          ]
        }
      }
    ])
  })
})
