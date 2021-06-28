// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import { assert } from "chai"
import _ from "lodash"
import * as fixtures from "../../../fixtures"
import PivotChartLayoutBuilder from "../../../../src/widgets/charts/pivot/PivotChartLayoutBuilder"
import canonical from "canonical-json"

function compare(actual: any, expected: any, message = "") {
  return assert.equal(
    canonical(actual),
    canonical(expected),
    "\n" + canonical(actual) + "\n" + canonical(expected) + "\n" + message
  )
}

// Plucks from layout
function layoutPluck(layout: any, key: any) {
  return _.map(layout.rows, (row) => _.pluck(row.cells, key))
}

describe("PivotChartLayoutBuilder", function () {
  before(function () {
    this.lb = new PivotChartLayoutBuilder({ schema: fixtures.simpleSchema() })

    this.exprNumber = { type: "field", table: "t1", column: "number" }
    this.exprText = { type: "field", table: "t1", column: "text" }
    this.exprEnum = { type: "field", table: "t1", column: "enum" }
    this.exprNumberSum = {
      type: "op",
      op: "sum",
      table: "t1",
      exprs: [{ type: "field", table: "t1", column: "number" }]
    }

    this.axisNumber = { expr: this.exprNumber }
    this.axisNumberSum = { expr: this.exprNumberSum }
    this.axisEnum = { expr: this.exprEnum }
    return (this.axisText = { expr: this.exprText })
  })

  describe("getRowsOrColumns", function () {
    describe("non-nested", function () {
      it("gets categories of simple label segment", function () {
        const segment = { id: "seg1", valueAxis: null, label: "xyz" }
        const data = {}
        const columns = this.lb.getRowsOrColumns(false, segment, data, "en")

        return compare(columns, [[{ segment, label: "xyz", value: null }]])
      })

      it("gets categories of simple enum segment", function () {
        const segment = { id: "seg1", valueAxis: this.axisEnum }
        const data = {}
        const columns = this.lb.getRowsOrColumns(false, segment, data, "en")

        return compare(columns, [
          [{ segment, label: "A", value: "a" }],
          [{ segment, label: "B", value: "b" }],
          [{ segment, label: "None", value: null }]
        ])
      })

      it("gets categories of sorted enum segment", function () {
        const segment = { id: "seg1", valueAxis: this.axisEnum, orderExpr: this.exprNumberSum }
        const data = {
          seg1: [{ value: "b" }, { value: null }, { value: "a" }]
        }
        const columns = this.lb.getRowsOrColumns(false, segment, data, "en")

        return compare(columns, [
          [{ segment, label: "B", value: "b" }],
          [{ segment, label: "None", value: null }],
          [{ segment, label: "A", value: "a" }]
        ])
      })

      it("gets categories of simple enum segment with excludedValues", function () {
        const segment = { id: "seg1", valueAxis: { expr: this.exprEnum, excludedValues: ["b"] } }
        const data = {}
        const columns = this.lb.getRowsOrColumns(false, segment, data, "en")

        return compare(columns, [[{ segment, label: "A", value: "a" }], [{ segment, label: "None", value: null }]])
      })

      it("gets categories of simple text segment with no values", function () {
        const segment = { id: "seg1", valueAxis: this.axisText }
        const data = {}
        const columns = this.lb.getRowsOrColumns(false, segment, data, "en")

        return compare(columns, [[{ segment, label: null, value: null }]])
      })

      it("gets categories of text segment with two data intersections", function () {
        const segment = { id: "seg1", valueAxis: this.axisText }
        const data = {
          "r1:seg1": [
            { value: 1, r0: "a", c0: "x" },
            { value: 1, r0: "b", c0: "y" }
          ],
          "r2:seg1": [
            { value: 1, r0: "a", c0: "z" },
            { value: 1, r0: "b", c0: "x" } // Repeat
          ]
        }
        const columns = this.lb.getRowsOrColumns(false, segment, data, "en")

        return compare(columns, [
          [{ segment, label: "x", value: "x" }],
          [{ segment, label: "y", value: "y" }],
          [{ segment, label: "z", value: "z" }]
        ])
      })

      return it("ignores intersections that are not relevant", function () {
        const segment = { id: "seg1", valueAxis: this.axisText }
        const data = {
          "r1:seg1": [
            { value: 1, r0: "a", c0: "x" },
            { value: 1, r0: "b", c0: "y" }
          ],
          "r2:segother": [
            { value: 1, r0: "a", c0: "z" },
            { value: 1, r0: "b", c0: "x" }
          ]
        }
        const columns = this.lb.getRowsOrColumns(false, segment, data, "en")

        return compare(columns, [[{ segment, label: "x", value: "x" }], [{ segment, label: "y", value: "y" }]])
      })
    })

    return describe("nested", function () {
      it("gets categories of enum inside label segment", function () {
        const segment = {
          id: "seg1",
          valueAxis: null,
          label: "xyz",
          children: [{ id: "seg2", valueAxis: this.axisEnum }]
        }
        const data = {}
        const columns = this.lb.getRowsOrColumns(false, segment, data, "en")

        return compare(columns, [
          [
            { segment, label: "xyz", value: null },
            { segment: segment.children[0], label: "A", value: "a" }
          ],
          [
            { segment, label: "xyz", value: null },
            { segment: segment.children[0], label: "B", value: "b" }
          ],
          [
            { segment, label: "xyz", value: null },
            { segment: segment.children[0], label: "None", value: null }
          ]
        ])
      })

      return it("gets categories of text inside text segment", function () {
        const segment = { id: "seg1", valueAxis: this.axisText, children: [{ id: "seg2", valueAxis: this.axisText }] }
        const data = {
          "r1:seg1,seg2": [
            { value: 1, r0: "a", c0: "x", c1: "q" },
            { value: 1, r0: "b", c0: "x", c1: "r" },
            { value: 1, r0: "b", c0: "y", c1: "s" }
          ],
          "r1:seg1,segother": [
            { value: 1, r0: "a", c0: "x", c1: "XX" },
            { value: 1, r0: "b", c0: "y", c1: "XX" }
          ],
          "r1:segother,seg2": [
            { value: 1, r0: "a", c0: "x", c1: "XX" },
            { value: 1, r0: "b", c0: "y", c1: "XX" }
          ]
        }
        const columns = this.lb.getRowsOrColumns(false, segment, data, "en")

        return compare(columns, [
          [
            { segment, label: "x", value: "x" },
            { segment: segment.children[0], label: "q", value: "q" }
          ],
          [
            { segment, label: "x", value: "x" },
            { segment: segment.children[0], label: "r", value: "r" }
          ],
          [
            { segment, label: "y", value: "y" },
            { segment: segment.children[0], label: "s", value: "s" }
          ]
        ])
      })
    })
  })

  return describe("buildLayout", function () {
    it("simple enum/text with no labels", function () {
      const design = {
        table: "t1",
        columns: [{ id: "c1", valueAxis: this.axisEnum }],
        rows: [{ id: "r1", valueAxis: this.axisText }],
        intersections: {
          "r1:c1": { valueAxis: this.axisNumberSum }
        }
      }

      const data = {
        "r1:c1": [
          { r0: "x", c0: "a", value: 2 },
          { r0: "y", c0: "b", value: 4 }
        ]
      }

      const layout = this.lb.buildLayout(design, data)

      // Check text
      compare(layoutPluck(layout, "text"), [
        [null, "A", "B", "None"],
        ["x", "2", null, null],
        ["y", null, "4", null]
      ])

      // Check types
      compare(layoutPluck(layout, "type"), [
        ["blank", "column", "column", "column"],
        ["row", "intersection", "intersection", "intersection"],
        ["row", "intersection", "intersection", "intersection"]
      ])

      // Check subtypes
      return compare(layoutPluck(layout, "subtype"), [
        [null, "value", "value", "value"],
        ["value", "value", "value", "value"],
        ["value", "value", "value", "value"]
      ])
    })

    it("limits rows", function () {
      const design = {
        table: "t1",
        columns: [{ id: "c1" }],
        rows: [{ id: "r1", valueAxis: this.axisText }],
        intersections: {
          "r1:c1": { valueAxis: this.axisNumberSum }
        }
      }

      const data = {
        "r1:c1": _.map(_.range(0, 1000), (i) => ({ r0: `${i}`, value: i }))
      }

      const layout = this.lb.buildLayout(design, data)

      assert.isTrue(layout.tooManyRows)
      return assert.equal(layout.rows.length, 501, "Should have extra row for headers")
    })

    it("uses nullLabel", function () {
      const design = {
        table: "t1",
        columns: [{ id: "c1", valueAxis: this.axisEnum }],
        rows: [{ id: "r1", valueAxis: this.axisText }],
        intersections: {
          "r1:c1": { valueAxis: _.extend({}, this.axisNumberSum, { nullLabel: "-" }) }
        }
      }

      const data = {
        "r1:c1": [
          { r0: "x", c0: "a", value: 2 },
          { r0: "y", c0: "b", value: 4 }
        ]
      }

      const layout = this.lb.buildLayout(design, data)

      // Check text
      compare(layoutPluck(layout, "text"), [
        [null, "A", "B", "None"],
        ["x", "2", "-", "-"],
        ["y", "-", "4", "-"]
      ])

      // Check types
      compare(layoutPluck(layout, "type"), [
        ["blank", "column", "column", "column"],
        ["row", "intersection", "intersection", "intersection"],
        ["row", "intersection", "intersection", "intersection"]
      ])

      // Check subtypes
      return compare(layoutPluck(layout, "subtype"), [
        [null, "value", "value", "value"],
        ["value", "value", "value", "value"],
        ["value", "value", "value", "value"]
      ])
    })

    it("simple enum/text with no values", function () {
      const design = {
        table: "t1",
        columns: [{ id: "c1", valueAxis: this.axisEnum }],
        rows: [{ id: "r1", valueAxis: this.axisText }],
        intersections: {
          "r1:c1": { valueAxis: this.axisNumberSum }
        }
      }

      const data = {
        "r1:c1": []
      }

      const layout = this.lb.buildLayout(design, data)

      // Check text
      compare(layoutPluck(layout, "text"), [
        [null, "A", "B", "None"],
        [null, null, null, null]
      ])

      // Check types
      compare(layoutPluck(layout, "type"), [
        ["blank", "column", "column", "column"],
        ["row", "intersection", "intersection", "intersection"]
      ])

      // Check subtypes
      return compare(layoutPluck(layout, "subtype"), [
        [null, "value", "value", "value"],
        ["value", "value", "value", "value"]
      ])
    })

    it("adds labels for segments with axes", function () {
      const design = {
        table: "t1",
        columns: [{ id: "c1", valueAxis: this.axisEnum, label: "C1" }],
        rows: [{ id: "r1", valueAxis: this.axisText, label: "R1" }],
        intersections: {
          "r1:c1": { valueAxis: this.axisNumberSum }
        }
      }

      const data = {
        "r1:c1": [
          { r0: "x", c0: "a", value: 2 },
          { r0: "y", c0: "b", value: 4 }
        ]
      }

      const layout = this.lb.buildLayout(design, data)

      // Check text
      compare(layoutPluck(layout, "text"), [
        [null, "C1", "C1", "C1"],
        [null, "A", "B", "None"],
        ["R1", null, null, null],
        ["x", "2", null, null],
        ["y", null, "4", null]
      ])

      // Check types
      compare(layoutPluck(layout, "type"), [
        ["blank", "column", "column", "column"],
        ["blank", "column", "column", "column"],
        ["row", "intersection", "intersection", "intersection"],
        ["row", "intersection", "intersection", "intersection"],
        ["row", "intersection", "intersection", "intersection"]
      ])

      // Check subtypes
      compare(layoutPluck(layout, "subtype"), [
        [null, "valueLabel", "valueLabel", "valueLabel"],
        [null, "value", "value", "value"],
        ["valueLabel", "filler", "filler", "filler"],
        ["value", "value", "value", "value"],
        ["value", "value", "value", "value"]
      ])

      // Check skips
      compare(layoutPluck(layout, "skip"), [
        [null, null, true, true],
        [null, null, null, null],
        [null, null, true, true],
        [null, null, null, null],
        [null, null, null, null]
      ])

      // Check column spans
      return compare(layoutPluck(layout, "columnSpan"), [
        [undefined, 3, undefined, undefined],
        [undefined, undefined, undefined, undefined],
        [undefined, 3, undefined, undefined],
        [undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined]
      ])
    })

    it("sets segments with no axis or label as unconfigured", function () {
      const design = {
        table: "t1",
        columns: [{ id: "c1", valueAxis: null, label: null }],
        rows: [{ id: "r1", valueAxis: this.axisText, label: null }],
        intersections: {
          "r1:c1": { valueAxis: this.axisNumberSum }
        }
      }

      const data = {
        "r1:c1": [
          { r0: "x", c0: null, value: 2 },
          { r0: "y", c0: null, value: 4 }
        ]
      }

      const layout = this.lb.buildLayout(design, data)

      // Check text
      compare(layoutPluck(layout, "text"), [
        [null, null],
        ["x", "2"],
        ["y", "4"]
      ])

      // Check unconfigured
      return compare(layoutPluck(layout, "unconfigured"), [
        [null, true],
        [false, null],
        [false, null]
      ])
    })

    it("uses label type for unconfigured segments", function () {
      const design = {
        table: "t1",
        columns: [{ id: "c1", valueAxis: null, label: null }],
        rows: [{ id: "r1", valueAxis: null, label: null }],
        intersections: {
          "r1:c1": { valueAxis: null }
        }
      }

      const data = {}

      const layout = this.lb.buildLayout(design, data)

      // Check subtype
      return compare(layoutPluck(layout, "subtype"), [
        [null, "label"],
        ["label", "value"]
      ])
    })

    it("sets summarize unconfigured segments", function () {
      const design = {
        table: "t1",
        columns: [{ id: "c1", valueAxis: null, label: null }],
        rows: [
          { id: "r1", valueAxis: this.axisText },
          { id: "r2", valueAxis: null, label: null }
        ],
        intersections: {
          "r1:c1": { valueAxis: null },
          "r2:c1": { valueAxis: null }
        }
      }

      const data = {}

      const layout = this.lb.buildLayout(design, data)

      // Check subtype
      return compare(layoutPluck(layout, "summarize"), [
        [null, false],
        [null, null],
        [true, null]
      ])
    })

    it("spans column headers down when same", function () {
      const design = {
        table: "t1",
        columns: [
          { id: "c1", valueAxis: this.axisEnum, label: "Enum" },
          { id: "c2", label: "Total" }
        ],
        rows: [{ id: "r1", label: "Row" }],
        intersections: {
          "r1:c1": { valueAxis: null },
          "r1:c2": { valueAxis: null }
        }
      }

      const data = {}

      const layout = this.lb.buildLayout(design, data)

      return compare(layoutPluck(layout, "rowSpan"), [
        [null, null, null, null, 2],
        [null, null, null, null, null],
        [null, null, null, null, null]
      ])
    })

    it("adds background color", function () {
      const design = {
        table: "t1",
        columns: [{ id: "c1", valueAxis: this.axisEnum }],
        rows: [{ id: "r1", valueAxis: this.axisText }],
        intersections: {
          "r1:c1": {
            valueAxis: this.axisNumberSum,
            backgroundColor: "#FF8800",
            backgroundColorOpacity: 0.5
          }
        }
      }

      const data = {
        "r1:c1": [
          { r0: "x", c0: "a", value: 2 },
          { r0: "y", c0: "b", value: 4 }
        ]
      }

      const layout = this.lb.buildLayout(design, data)

      // Check colors
      return compare(layoutPluck(layout, "backgroundColor"), [
        [null, null, null, null],
        [null, "rgba(255, 136, 0, 0.5)", "rgba(255, 136, 0, 0.5)", "rgba(255, 136, 0, 0.5)"],
        [null, "rgba(255, 136, 0, 0.5)", "rgba(255, 136, 0, 0.5)", "rgba(255, 136, 0, 0.5)"]
      ])
    })

    it("adds background color axis", function () {
      const design = {
        table: "t1",
        columns: [{ id: "c1", valueAxis: this.axisEnum }],
        rows: [{ id: "r1", valueAxis: this.axisText }],
        intersections: {
          "r1:c1": {
            valueAxis: this.axisNumberSum,
            backgroundColorAxis: {
              expr: this.axisNumberSum,
              xform: "bin",
              min: 0,
              max: 2,
              numBins: 2,
              colorMap: [{ value: 0, color: "#FF8800" }]
            },
            backgroundColorOpacity: 0.5
          }
        }
      }

      const data = {
        "r1:c1": [
          { r0: "x", c0: "a", value: 2, bc: 0 },
          { r0: "y", c0: "b", value: 4, bc: null }
        ]
      }

      const layout = this.lb.buildLayout(design, data)

      // Check colors
      return compare(layoutPluck(layout, "backgroundColor"), [
        [null, null, null, null],
        [null, "rgba(255, 136, 0, 0.5)", null, null],
        [null, null, null, null]
      ])
    })

    it("adds background color conditional", function () {
      const design = {
        table: "t1",
        columns: [{ id: "c1", valueAxis: this.axisEnum }],
        rows: [{ id: "r1", valueAxis: this.axisText }],
        intersections: {
          "r1:c1": {
            valueAxis: this.axisNumberSum,
            backgroundColorConditions: [
              {
                condition: {
                  type: "op",
                  op: ">",
                  table: "t1",
                  exprs: [this.exprNumberSum, { type: "literal", valueType: "number", value: 5 }]
                },
                color: "#FF8800"
              }
            ],
            backgroundColorOpacity: 0.5
          }
        }
      }

      const data = {
        "r1:c1": [
          { r0: "x", c0: "a", value: 2, bcc0: false },
          { r0: "y", c0: "b", value: 4, bcc0: true }
        ]
      }

      const layout = this.lb.buildLayout(design, data)

      // Check colors
      return compare(layoutPluck(layout, "backgroundColor"), [
        [null, null, null, null],
        [null, null, null, null],
        [null, null, "rgba(255, 136, 0, 0.5)", null]
      ])
    })

    it("sets section top/left/bottom/right", function () {
      const design = {
        table: "t1",
        columns: [{ id: "c1", valueAxis: this.axisEnum, label: "C1" }],
        rows: [{ id: "r1", valueAxis: this.axisText, label: "R1" }],
        intersections: {
          "r1:c1": { valueAxis: this.axisNumberSum }
        }
      }

      const data = {
        "r1:c1": [
          { r0: "x", c0: "a", value: 2 },
          { r0: "y", c0: "b", value: 4 }
        ]
      }

      const layout = this.lb.buildLayout(design, data)

      // Check top
      compare(layoutPluck(layout, "sectionTop"), [
        [false, true, true, true],
        [false, false, false, false],
        [true, true, true, true],
        [false, false, false, false],
        [false, false, false, false]
      ])

      // Check right (spanned columns have it true)
      compare(
        layoutPluck(layout, "sectionRight"),
        [
          [false, true, false, true],
          [false, false, false, true],
          [true, true, false, true],
          [true, false, false, true],
          [true, false, false, true]
        ],
        JSON.stringify(layoutPluck(layout, "section"))
      )

      // Check left
      compare(layoutPluck(layout, "sectionLeft"), [
        [false, true, false, false],
        [false, true, false, false],
        [true, true, false, false],
        [true, true, false, false],
        [true, true, false, false]
      ])

      // Check bottom
      return compare(layoutPluck(layout, "sectionBottom"), [
        [false, false, false, false],
        [false, true, true, true],
        [false, false, false, false],
        [false, false, false, false],
        [true, true, true, true]
      ])
    })

    return describe("borders", function () {
      it("sets default borders for all cells", function () {
        const design = {
          table: "t1",
          columns: [{ id: "c1", valueAxis: this.axisEnum }],
          rows: [{ id: "r1", valueAxis: this.axisEnum }],
          intersections: {
            "r1:c1": {}
          }
        }

        const data = {
          "r1:c1": []
        }

        const layout = this.lb.buildLayout(design, data)

        // Check text
        return compare(layoutPluck(layout, "borderLeft"), [
          [null, 2, 1, 1],
          [2, 2, 1, 1],
          [2, 2, 1, 1],
          [2, 2, 1, 1]
        ])
      })

      it("sets custom borders for all cells", function () {
        const design = {
          table: "t1",
          columns: [{ id: "c1", valueAxis: this.axisEnum, borderBefore: 1, borderWithin: 2, borderAfter: 3 }],
          rows: [{ id: "r1", valueAxis: this.axisEnum, borderBefore: 0, borderWithin: 1, borderAfter: 2 }],
          intersections: {
            "r1:c1": {}
          }
        }

        const data = {
          "r1:c1": []
        }

        const layout = this.lb.buildLayout(design, data)

        // Check left
        compare(layoutPluck(layout, "borderLeft"), [
          [null, 1, 2, 2],
          [2, 1, 2, 2],
          [2, 1, 2, 2],
          [2, 1, 2, 2]
        ])

        // Check right
        compare(layoutPluck(layout, "borderRight"), [
          [null, 2, 2, 3],
          [2, 2, 2, 3],
          [2, 2, 2, 3],
          [2, 2, 2, 3]
        ])

        // Check top
        compare(layoutPluck(layout, "borderTop"), [
          [null, 2, 2, 2],
          [0, 0, 0, 0],
          [1, 1, 1, 1],
          [1, 1, 1, 1]
        ])

        // Check bottom
        return compare(layoutPluck(layout, "borderBottom"), [
          [null, 2, 2, 2],
          [1, 1, 1, 1],
          [1, 1, 1, 1],
          [2, 2, 2, 2]
        ])
      })

      return it("handles nested rows", function () {
        const design = {
          table: "t1",
          columns: [{ id: "c1" }],
          rows: [
            {
              id: "r1",
              valueAxis: this.axisEnum,
              borderBefore: 3,
              borderWithin: 2,
              borderAfter: 3,
              children: [
                {
                  id: "r2",
                  valueAxis: this.axisText
                }
              ]
            }
          ],
          intersections: {
            "r1,r2:c1": { valueAxis: this.axisNumberSum }
          }
        }

        const data = {
          "r1,r2:c1": [
            // Two distinct r2 values
            { r0: "a", r1: "x", c0: null, value: 2 },
            { r0: "a", r1: "y", c0: null, value: 4 },
            { r0: "b", r1: "x", c0: null, value: 2 },
            { r0: "b", r1: "y", c0: null, value: 4 }
          ]
        }

        const layout = this.lb.buildLayout(design, data)

        // Check text
        compare(layoutPluck(layout, "text"), [
          [null, null, null],
          ["A", "x", "2"],
          ["A", "y", "4"],
          ["B", "x", "2"],
          ["B", "y", "4"],
          ["None", null, null]
        ])

        compare(layoutPluck(layout, "borderTop"), [
          [null, null, 2],
          [3, 3, 3],
          [0, 1, 1],
          [2, 2, 2],
          [0, 1, 1],
          [2, 2, 2]
        ])

        return compare(layoutPluck(layout, "borderBottom"), [
          [null, null, 2],
          [2, 1, 1],
          [2, 2, 2],
          [2, 1, 1],
          [2, 2, 2],
          [3, 3, 3]
        ])
      })
    })
  })
})
