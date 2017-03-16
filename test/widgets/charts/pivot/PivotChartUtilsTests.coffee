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

