// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import { assert } from "chai"
import _ from "lodash"
import * as PivotChartUtils from "../../../../src/widgets/charts/pivot/PivotChartUtils"
import canonical from "canonical-json"

function compare(actual: any, expected: any) {
  return assert.equal(
    canonical(actual),
    canonical(expected),
    "\n" + canonical(actual) + "\n" + canonical(expected) + "\n"
  )
}

describe("PivotChartUtils", function () {
  describe("getSegmentPaths", function () {
    it("gets simple paths", function () {
      const segments = [{ id: "a" }, { id: "b" }]
      return compare(PivotChartUtils.getSegmentPaths(segments), [[{ id: "a" }], [{ id: "b" }]])
    })

    return it("gets nested paths", function () {
      const segments = [{ id: "a", children: [{ id: "c" }, { id: "d" }] }, { id: "b" }]
      return compare(PivotChartUtils.getSegmentPaths(segments), [
        [segments[0], { id: "c" }],
        [segments[0], { id: "d" }],
        [segments[1]]
      ])
    })
  })

  describe("getAllSegments", () =>
    it("gets nested paths", function () {
      const segments = [{ id: "a", children: [{ id: "c" }, { id: "d" }] }, { id: "b" }]
      return compare(PivotChartUtils.getAllSegments(segments), [segments[0], { id: "c" }, { id: "d" }, segments[1]])
    }))

  describe("findSegment", function () {
    it("finds nested", function () {
      const segments = [{ id: "a", children: [{ id: "c" }, { id: "d" }] }, { id: "b" }]
      return compare(PivotChartUtils.findSegment(segments, "c"), { id: "c" })
    })

    return it("finds null if not found", function () {
      const segments = [{ id: "a", children: [{ id: "c" }, { id: "d" }] }, { id: "b" }]
      return assert(!PivotChartUtils.findSegment(segments, "x"))
    })
  })

  describe("canSummarizeSegment", function () {
    it("is false if first", function () {
      const segments = [{ id: "a" }, { id: "b" }]
      return assert.isFalse(PivotChartUtils.canSummarizeSegment(segments, "a"))
    })

    it("is false if before is label only", function () {
      const segments = [{ id: "a", label: "A" }, { id: "b" }]
      return assert.isFalse(PivotChartUtils.canSummarizeSegment(segments, "b"))
    })

    it("is true if before has value axis", function () {
      const segments = [
        { id: "a", label: "A", valueAxis: { expr: { type: "field", table: "t1", column: "number" } } },
        { id: "b" }
      ]
      return assert.isTrue(PivotChartUtils.canSummarizeSegment(segments, "b"))
    })

    it("is false if before has children", function () {
      const segments = [
        {
          id: "a",
          label: "A",
          valueAxis: { expr: { type: "field", table: "t1", column: "number" } },
          children: [{ id: "z" }]
        },
        { id: "b" }
      ]
      return assert.isFalse(PivotChartUtils.canSummarizeSegment(segments, "b"))
    })

    return it("works on nested", function () {
      const segments = [
        {
          id: "a",
          label: "A",
          children: [{ id: "b", valueAxis: { expr: { type: "field", table: "t1", column: "number" } } }, { id: "c" }]
        }
      ]
      return assert.isTrue(PivotChartUtils.canSummarizeSegment(segments, "c"))
    })
  })

  describe("summarizeSegment", () =>
    it("creates intersections", function () {
      // Intersection axes
      const sum1 = { expr: { type: "op", op: "sum", exprs: [{ type: "field", table: "t1", column: "number1" }] } }
      const sum2 = { expr: { type: "op", op: "sum", exprs: [{ type: "field", table: "t1", column: "number2" }] } }

      const design = {
        rows: [
          { id: "r1", label: "A", valueAxis: { expr: { type: "field", table: "t1", column: "enum" } } },
          { id: "r2" }
        ],
        columns: [
          { id: "c1", label: "C1" },
          { id: "c2", label: "C2" }
        ],
        intersections: {
          "r1:c1": { valueAxis: sum1 },
          "r1:c2": { valueAxis: sum2 },
          "r2:c1": {},
          "r2:c2": {}
        }
      }

      const newDesign = PivotChartUtils.summarizeSegment(design, "r2", "Total")

      return compare(newDesign, {
        rows: [
          { id: "r1", label: "A", valueAxis: { expr: { type: "field", table: "t1", column: "enum" } } },
          { id: "r2", label: "Total" }
        ],
        columns: [
          { id: "c1", label: "C1" },
          { id: "c2", label: "C2" }
        ],
        intersections: {
          "r1:c1": { valueAxis: sum1 },
          "r1:c2": { valueAxis: sum2 },
          "r2:c1": { valueAxis: sum1 },
          "r2:c2": { valueAxis: sum2 }
        }
      })
    }))

  describe("replaceSegment", () =>
    it("replaces nested", function () {
      const segments = [{ id: "a", children: [{ id: "c" }, { id: "d" }] }, { id: "b" }]
      return compare(PivotChartUtils.replaceSegment(segments, { id: "c", x: 1 }), [
        { id: "a", children: [{ id: "c", x: 1 }, { id: "d" }] },
        { id: "b" }
      ])
    }))

  describe("removeSegment", () =>
    it("removes nested", function () {
      const segments = [{ id: "a", children: [{ id: "c" }, { id: "d" }] }, { id: "b" }]
      return compare(PivotChartUtils.removeSegment(segments, "c"), [{ id: "a", children: [{ id: "d" }] }, { id: "b" }])
    }))

  describe("insertBeforeSegment", () =>
    it("handles nested", function () {
      let segments = [{ id: "a", children: [{ id: "c" }, { id: "d" }] }, { id: "b" }]
      segments = PivotChartUtils.insertBeforeSegment(segments, "c")
      assert.equal(segments[0].children.length, 3)
      return assert.equal(segments[0].children[1].id, "c")
    }))

  describe("insertAfterSegment", function () {
    it("handles simple", function () {
      let segments = [{ id: "a" }, { id: "b" }, { id: "c" }]
      segments = PivotChartUtils.insertAfterSegment(segments, "b")
      assert.equal(segments.length, 4)
      return assert.equal(segments[3].id, "c")
    })

    return it("handles nested", function () {
      let segments = [{ id: "a", children: [{ id: "c" }, { id: "d" }] }, { id: "b" }]
      segments = PivotChartUtils.insertAfterSegment(segments, "c")
      assert.equal(segments[0].children.length, 3)
      return assert.equal(segments[0].children[0].id, "c")
    })
  })

  return describe("addChildSegment", () =>
    it("handles simple", function () {
      let segments = [{ id: "a" }, { id: "b" }, { id: "c" }]
      segments = PivotChartUtils.addChildSegment(segments, "b")
      assert.equal(segments.length, 3)
      return assert.equal(segments[1].children.length, 1)
    }))
})
