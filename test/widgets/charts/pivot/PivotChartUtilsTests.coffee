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
