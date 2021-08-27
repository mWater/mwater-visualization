// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import _ from "lodash"
import { assert } from "chai"
import * as fixtures from "./fixtures"
import ImplicitFilterBuilder from "../src/ImplicitFilterBuilder"
import canonical from "canonical-json"

function compare(actual: any, expected: any) {
  return assert.equal(
    canonical(actual),
    canonical(expected),
    "\n" + canonical(actual) + "\n" + canonical(expected) + "\n"
  )
}

describe("ImplicitFilterBuilder", function () {
  before(function () {
    this.schema = fixtures.simpleSchema()
    return (this.builder = new ImplicitFilterBuilder(this.schema))
  })

  it("finds n-1 join if child filterable", function () {
    const joins = this.builder.findJoins(["t1", "t2"])
    return compare(joins, [{ table: "t2", column: "2-1" }])
  })

  it("finds ID join if child filterable", function () {
    const joins = this.builder.findJoins(["t1", "t3"])
    return compare(joins, [{ table: "t3", column: "3-1" }])
  })

  it("finds nothing if child not filterable", function () {
    const joins = this.builder.findJoins(["t1"])
    return compare(joins, [])
  })

  it("extends filter", function () {
    const filters = [
      {
        table: "t1",
        jsonql: { type: "op", op: "=", exprs: [{ type: "field", tableAlias: "{alias}", column: "number" }, 3] }
      }
    ]

    const extFilters = this.builder.extendFilters(["t1", "t2"], filters)

    return compare(extFilters, [
      {
        table: "t1",
        jsonql: { type: "op", op: "=", exprs: [{ type: "field", tableAlias: "{alias}", column: "number" }, 3] }
      },
      // Uses exists where
      {
        table: "t2",
        jsonql: {
          type: "op",
          op: "or",
          exprs: [
            {
              type: "op",
              op: "exists",
              exprs: [
                {
                  type: "query",
                  selects: [],
                  from: { type: "table", table: "t1", alias: "explicit" },
                  where: {
                    type: "op",
                    op: "and",
                    exprs: [
                      // Join
                      {
                        type: "op",
                        op: "=",
                        exprs: [
                          { type: "field", tableAlias: "explicit", column: "primary" },
                          { type: "field", tableAlias: "{alias}", column: "t1" }
                        ]
                      },
                      // Filter
                      { type: "op", op: "=", exprs: [{ type: "field", tableAlias: "explicit", column: "number" }, 3] }
                    ]
                  }
                }
              ]
            },
            {
              type: "op",
              op: "is null",
              exprs: [{ type: "field", tableAlias: "{alias}", column: "t1" }]
            }
          ]
        }
      }
    ])
  })

  it("extends filter for ID joins", function () {
    const filters = [
      {
        table: "t1",
        jsonql: { type: "op", op: "=", exprs: [{ type: "field", tableAlias: "{alias}", column: "number" }, 3] }
      }
    ]

    const extFilters = this.builder.extendFilters(["t1", "t3"], filters)

    return compare(extFilters, [
      {
        table: "t1",
        jsonql: { type: "op", op: "=", exprs: [{ type: "field", tableAlias: "{alias}", column: "number" }, 3] }
      },
      // Uses exists where
      {
        table: "t3",
        jsonql: {
          type: "op",
          op: "or",
          exprs: [
            {
              type: "op",
              op: "exists",
              exprs: [
                {
                  type: "query",
                  selects: [],
                  from: { type: "table", table: "t1", alias: "explicit" },
                  where: {
                    type: "op",
                    op: "and",
                    exprs: [
                      // Join
                      {
                        type: "op",
                        op: "=",
                        exprs: [
                          { type: "field", tableAlias: "{alias}", column: "t1" },
                          { type: "field", tableAlias: "explicit", column: "primary" }
                        ]
                      },
                      // Filter
                      { type: "op", op: "=", exprs: [{ type: "field", tableAlias: "explicit", column: "number" }, 3] }
                    ]
                  }
                }
              ]
            },
            {
              type: "op",
              op: "is null",
              exprs: [{ type: "field", tableAlias: "{alias}", column: "t1" }]
            }
          ]
        }
      }
    ])
  })

  return it("unifies multiple filters")
})
