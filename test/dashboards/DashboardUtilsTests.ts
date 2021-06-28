// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import { assert } from "chai"
import * as fixtures from "../fixtures"
import _ from "lodash"
import React from "react"
const R = React.createElement

import DashboardUtils from "../../src/dashboards/DashboardUtils"
import canonical from "canonical-json"

function compare(actual: any, expected: any) {
  return assert.equal(canonical(actual), canonical(expected), "\n" + canonical(actual) + "\n" + canonical(expected))
}

describe("DashboardUtils", function () {
  before(function () {
    return (this.schema = fixtures.simpleSchema())
  })

  it("gets filterable tables", function () {
    return assert.deepEqual(DashboardUtils.getFilterableTables(simpleDashboardDesign, this.schema), ["t1"])
  })

  it("compiles filters", function () {
    const design = _.extend({}, simpleDashboardDesign, {
      filters: {
        t1: {
          type: "op",
          op: ">",
          table: "t1",
          exprs: [
            { type: "field", table: "t1", column: "number" },
            { type: "literal", value: 4 }
          ]
        }
      }
    })
    const compiledFilters = DashboardUtils.getCompiledFilters(design, this.schema, ["t1"])
    return assert.deepEqual(compiledFilters, [
      {
        table: "t1",
        jsonql: {
          type: "op",
          op: ">",
          exprs: [
            { type: "field", tableAlias: "{alias}", column: "number" },
            { type: "literal", value: 4 }
          ]
        }
      }
    ])
  })

  return it("compiles global filters", function () {
    const design = _.extend({}, simpleDashboardDesign, {
      globalFilters: [{ columnId: "number", columnType: "number", op: ">", exprs: [{ type: "literal", value: 4 }] }]
    })

    const compiledFilters = DashboardUtils.getCompiledFilters(design, this.schema, ["t1"])
    return assert.deepEqual(compiledFilters, [
      {
        table: "t1",
        jsonql: {
          type: "op",
          op: ">",
          exprs: [
            { type: "field", tableAlias: "{alias}", column: "number" },
            { type: "literal", value: 4 }
          ]
        }
      }
    ])
  })
})

var simpleDashboardDesign = {
  items: {
    id: "root",
    type: "root",
    blocks: [
      {
        type: "widget",
        widgetType: "LayeredChart",
        design: {
          version: 2,
          layers: [
            {
              axes: {
                x: {
                  expr: {
                    type: "field",
                    table: "t1",
                    column: "enum"
                  }
                },
                y: {
                  expr: {
                    type: "op",
                    op: "count",
                    table: "t1",
                    exprs: []
                  }
                }
              },
              filter: null,
              table: "t1"
            }
          ],
          header: {
            style: "header",
            items: []
          },
          footer: {
            style: "footer",
            items: []
          },
          type: "bar",
          labels: true
        },
        id: "76e204b3-a21f-491e-9e16-353274491b49"
      }
    ]
  },
  layout: "blocks",
  style: "greybg",
  quickfilters: [],
  popups: [],
  filters: {},
  implicitFiltersEnabled: false
}
