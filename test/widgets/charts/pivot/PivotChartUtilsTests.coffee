assert = require('chai').assert
_ = require 'lodash'

PivotChartUtils = require '../../../../src/widgets/charts/pivot/PivotChartUtils'

canonical = require 'canonical-json'
compare = (actual, expected) ->
  assert.equal canonical(actual), canonical(expected), "\n" + canonical(actual) + "\n" + canonical(expected) + "\n"

describe "PivotChartUtils", ->
  describe "getSegmentPaths", ->
    it 'gets simple paths', ->
      segments = [{ id: "a" }, { id: "b" }]
      compare PivotChartUtils.getSegmentPaths(segments), [[{ id: "a" }], [{ id: "b" }]]

    it 'gets nested paths', ->
      segments = [{ id: "a", children: [{ id: "c" }, { id: "d" }] }, { id: "b" }]
      compare PivotChartUtils.getSegmentPaths(segments), [[segments[0], { id: "c" }], [segments[0], { id: "d" }], [segments[1]]]

  describe "getAllSegments", ->
    it 'gets nested paths', ->
      segments = [{ id: "a", children: [{ id: "c" }, { id: "d" }] }, { id: "b" }]
      compare PivotChartUtils.getAllSegments(segments), [segments[0], { id: "c" }, { id: "d" }, segments[1]]

  describe "findSegment", ->
    it "finds nested", ->
      segments = [{ id: "a", children: [{ id: "c" }, { id: "d" }] }, { id: "b" }]
      compare PivotChartUtils.findSegment(segments, "c"), { id: "c" }

    it "finds null if not found", ->
      segments = [{ id: "a", children: [{ id: "c" }, { id: "d" }] }, { id: "b" }]
      assert not PivotChartUtils.findSegment(segments, "x")

  describe "canSummarizeSegment", ->
    it "is false if first", ->
      segments = [{ id: "a" }, { id: "b" }]
      assert.isFalse PivotChartUtils.canSummarizeSegment(segments, "a")

    it "is false if before is label only", ->
      segments = [{ id: "a", label: "A" }, { id: "b" }]
      assert.isFalse PivotChartUtils.canSummarizeSegment(segments, "b")

    it "is true if before has value axis", ->
      segments = [{ id: "a", label: "A", valueAxis: { expr: { type: "field", table: "t1", column: "number" }}}, { id: "b" }]
      assert.isTrue PivotChartUtils.canSummarizeSegment(segments, "b")

    it "is false if before has children", ->
      segments = [{ id: "a", label: "A", valueAxis: { expr: { type: "field", table: "t1", column: "number" }}, children: [{ id: "z"}]}, { id: "b" }]
      assert.isFalse PivotChartUtils.canSummarizeSegment(segments, "b")

    it "works on nested", ->
      segments = [{ id: "a", label: "A", children: [{ id: "b", valueAxis: { expr: { type: "field", table: "t1", column: "number" }}}, { id: "c" }] } ]
      assert.isTrue PivotChartUtils.canSummarizeSegment(segments, "c")

  describe "summarizeSegment", ->
    it "creates intersections", ->
      # Intersection axes
      sum1 = { expr: { type: "op", op: "sum", exprs: [{ type: "field", table: "t1", column: "number1" }]}} 
      sum2 = { expr: { type: "op", op: "sum", exprs: [{ type: "field", table: "t1", column: "number2" }]}}

      design = {
        rows: [
          { id: "r1", label: "A", valueAxis: { expr: { type: "field", table: "t1", column: "enum" }}}
          { id: "r2" }
        ]
        columns: [
          { id: "c1", label: "C1" }
          { id: "c2", label: "C2" }
        ]
        intersections: {
          "r1:c1": { valueAxis: sum1 }
          "r1:c2": { valueAxis: sum2 }
          "r2:c1": { }
          "r2:c2": { }
        }
      }

      newDesign = PivotChartUtils.summarizeSegment(design, "r2", "Total")

      compare newDesign, {
        rows: [
          { id: "r1", label: "A", valueAxis: { expr: { type: "field", table: "t1", column: "enum" }}}
          { id: "r2", label: "Total" }
        ]
        columns: [
          { id: "c1", label: "C1" }
          { id: "c2", label: "C2" }
        ]
        intersections: {
          "r1:c1": { valueAxis: sum1 }
          "r1:c2": { valueAxis: sum2 }
          "r2:c1": { valueAxis: sum1 }
          "r2:c2": { valueAxis: sum2 }
        }
      }


  describe "replaceSegment", ->
    it "replaces nested", ->
      segments = [{ id: "a", children: [{ id: "c" }, { id: "d" }] }, { id: "b" }]
      compare PivotChartUtils.replaceSegment(segments, { id: "c", x: 1 }), [{ id: "a", children: [{ id: "c", x: 1 }, { id: "d" }] }, { id: "b" }]

  describe "removeSegment", ->
    it "removes nested", ->
      segments = [{ id: "a", children: [{ id: "c" }, { id: "d" }] }, { id: "b" }]
      compare PivotChartUtils.removeSegment(segments, "c"), [{ id: "a", children: [{ id: "d" }] }, { id: "b" }]

  describe "insertBeforeSegment", ->
    it "handles nested", ->
      segments = [{ id: "a", children: [{ id: "c" }, { id: "d" }] }, { id: "b" }]
      segments = PivotChartUtils.insertBeforeSegment(segments, "c")
      assert.equal segments[0].children.length, 3
      assert.equal segments[0].children[1].id, "c"

  describe "insertAfterSegment", ->
    it "handles simple", ->
      segments = [{ id: "a" }, { id: "b" }, { id: "c" }]
      segments = PivotChartUtils.insertAfterSegment(segments, "b")
      assert.equal segments.length, 4
      assert.equal segments[3].id, "c"

    it "handles nested", ->
      segments = [{ id: "a", children: [{ id: "c" }, { id: "d" }] }, { id: "b" }]
      segments = PivotChartUtils.insertAfterSegment(segments, "c")
      assert.equal segments[0].children.length, 3
      assert.equal segments[0].children[0].id, "c"

  describe "addChildSegment", ->
    it "handles simple", ->
      segments = [{ id: "a" }, { id: "b" }, { id: "c" }]
      segments = PivotChartUtils.addChildSegment(segments, "b")
      assert.equal segments.length, 3
      assert.equal segments[1].children.length, 1
