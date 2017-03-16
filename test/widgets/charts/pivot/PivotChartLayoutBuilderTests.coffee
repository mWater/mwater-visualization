assert = require('chai').assert
_ = require 'lodash'

fixtures = require '../../../fixtures'

PivotChartLayoutBuilder = require '../../../../src/widgets/charts/pivot/PivotChartLayoutBuilder'

canonical = require 'canonical-json'
compare = (actual, expected) ->
  assert.equal canonical(actual), canonical(expected), "\n" + canonical(actual) + "\n" + canonical(expected)

describe "PivotChartLayoutBuilder", ->
  before ->
    @lb = new PivotChartLayoutBuilder(schema: fixtures.simpleSchema())

    @exprNumber = { type: "field", table: "t1", column: "number" }
    @exprText = { type: "field", table: "t1", column: "text" }
    @exprEnum = { type: "field", table: "t1", column: "enum" }

    @axisNumber = { expr: @exprNumber }
    @axisNumberSum = { expr: @exprNumber, aggr: "sum" }
    @axisNumberCount = { expr: @exprCount, aggr: "count" }
    @axisEnum = { expr: @exprEnum } 
    @axisText = { expr: @exprText } 

  describe "getRowsOrColumns", ->
    describe "non-nested", ->
      it 'gets categories of simple label segment', ->
        segment = { id: "seg1", valueAxis: null, label: "xyz" }
        data = {}
        columns = @lb.getRowsOrColumns(false, segment, data, "en")

        compare columns, [
          [{ segment: segment, label: "xyz", value: null }]
        ]

      it 'gets categories of simple enum segment', ->
        segment = { id: "seg1", valueAxis: @axisEnum }
        data = {}
        columns = @lb.getRowsOrColumns(false, segment, data, "en")

        compare columns, [
          [{ segment: segment, label: "A", value: "a" }]
          [{ segment: segment, label: "B", value: "b" }]
          [{ segment: segment, label: "None", value: null }]
        ]

      it 'gets categories of text segment with two data intersections', ->
        segment = { id: "seg1", valueAxis: @axisText }
        data = {
          "r1:seg1": [
            { value: 1, r0: "a", c0: "x" }
            { value: 1, r0: "b", c0: "y" }
          ]
          "r2:seg1": [
            { value: 1, r0: "a", c0: "z" }
            { value: 1, r0: "b", c0: "x" }  # Repeat
          ]
        }
        columns = @lb.getRowsOrColumns(false, segment, data, "en")

        compare columns, [
          [{ segment: segment, label: "x", value: "x" }]
          [{ segment: segment, label: "y", value: "y" }]
          [{ segment: segment, label: "z", value: "z" }]
        ]

      it 'ignores intersections that are not relevant', ->
        segment = { id: "seg1", valueAxis: @axisText }
        data = {
          "r1:seg1": [
            { value: 1, r0: "a", c0: "x" }
            { value: 1, r0: "b", c0: "y" }
          ]
          "r2:segother": [
            { value: 1, r0: "a", c0: "z" }
            { value: 1, r0: "b", c0: "x" }
          ]
        }
        columns = @lb.getRowsOrColumns(false, segment, data, "en")

        compare columns, [
          [{ segment: segment, label: "x", value: "x" }]
          [{ segment: segment, label: "y", value: "y" }]
        ]

    describe "nested", ->
      it 'gets categories of enum inside label segment', ->
        segment = { id: "seg1", valueAxis: null, label: "xyz", children: [{ id: "seg2", valueAxis: @axisEnum }] }
        data = {}
        columns = @lb.getRowsOrColumns(false, segment, data, "en")

        compare columns, [
          [{ segment: segment, label: "xyz", value: null }, { segment: segment.children[0], label: "A", value: "a" }]
          [{ segment: segment, label: "xyz", value: null }, { segment: segment.children[0], label: "B", value: "b" }]
          [{ segment: segment, label: "xyz", value: null }, { segment: segment.children[0], label: "None", value: null }]
        ]

      it 'gets categories of text inside text segment', ->
        segment = { id: "seg1", valueAxis: @axisText, children: [{ id: "seg2", valueAxis: @axisText }] }
        data = {
          "r1:seg1,seg2": [
            { value: 1, r0: "a", c0: "x", c1: "q" }
            { value: 1, r0: "b", c0: "x", c1: "r" }
            { value: 1, r0: "b", c0: "y", c1: "s" }
          ]
          "r1:seg1,segother": [
            { value: 1, r0: "a", c0: "x", c1: "XX" }
            { value: 1, r0: "b", c0: "y", c1: "XX" }
          ]
          "r1:segother,seg2": [
            { value: 1, r0: "a", c0: "x", c1: "XX" }
            { value: 1, r0: "b", c0: "y", c1: "XX" }
          ]
        }
        columns = @lb.getRowsOrColumns(false, segment, data, "en")

        compare columns, [
          [{ segment: segment, label: "x", value: "x" }, { segment: segment.children[0], label: "q", value: "q" }]
          [{ segment: segment, label: "x", value: "x" }, { segment: segment.children[0], label: "r", value: "r" }]
          [{ segment: segment, label: "y", value: "y" }, { segment: segment.children[0], label: "s", value: "s" }]
        ]
