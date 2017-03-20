assert = require('chai').assert
_ = require 'lodash'

fixtures = require '../../../fixtures'

PivotChartLayoutBuilder = require '../../../../src/widgets/charts/pivot/PivotChartLayoutBuilder'

canonical = require 'canonical-json'
compare = (actual, expected, message = "") ->
  assert.equal canonical(actual), canonical(expected), "\n" + canonical(actual) + "\n" + canonical(expected) + "\n" + message

# Plucks from layout 
layoutPluck = (layout, key) ->
  _.map(layout.rows, (row) -> _.pluck(row.cells, key))

describe "PivotChartLayoutBuilder", ->
  before ->
    @lb = new PivotChartLayoutBuilder(schema: fixtures.simpleSchema())

    @exprNumber = { type: "field", table: "t1", column: "number" }
    @exprText = { type: "field", table: "t1", column: "text" }
    @exprEnum = { type: "field", table: "t1", column: "enum" }

    @axisNumber = { expr: @exprNumber }
    @axisNumberSum = { expr: @exprNumber, aggr: "sum" }
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

      it 'gets categories of simple enum segment with excludedValues', ->
        segment = { id: "seg1", valueAxis: { expr: @exprEnum, excludedValues: ["b"] } }
        data = {}
        columns = @lb.getRowsOrColumns(false, segment, data, "en")

        compare columns, [
          [{ segment: segment, label: "A", value: "a" }]
          [{ segment: segment, label: "None", value: null }]
        ]

      it 'gets categories of simple text segment with no values', ->
        segment = { id: "seg1", valueAxis: @axisText }
        data = {}
        columns = @lb.getRowsOrColumns(false, segment, data, "en")

        compare columns, [
          [{ segment: segment, label: null, value: null }]
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

  describe "buildLayout", ->
    it "simple enum/text with no labels", ->
      design = {
        table: "t1"
        columns: [{ id: "c1", valueAxis: @axisEnum }]
        rows: [{ id: "r1", valueAxis: @axisText }]
        intersections: {
          "r1:c1": { valueAxis: @axisNumberSum }
        }
      }

      data = {
        "r1:c1": [
          { r0: "x", c0: "a", value: 2 }
          { r0: "y", c0: "b", value: 4 }
        ]
      }

      layout = @lb.buildLayout(design, data)

      # Check text
      compare layoutPluck(layout, "text"), [
        [null, "A", "B", "None"]
        ["x", "2", null, null]
        ["y", null, "4", null]
      ]

      # Check types
      compare layoutPluck(layout, "type"), [
        ["blank", "columnSegment", "columnSegment", "columnSegment"]
        ["rowSegment", "intersection", "intersection", "intersection"]
        ["rowSegment", "intersection", "intersection", "intersection"]
      ]

    it "simple enum/text with no values", ->
      design = {
        table: "t1"
        columns: [{ id: "c1", valueAxis: @axisEnum }]
        rows: [{ id: "r1", valueAxis: @axisText }]
        intersections: {
          "r1:c1": { valueAxis: @axisNumberSum }
        }
      }

      data = {
        "r1:c1": []
      }

      layout = @lb.buildLayout(design, data)

      # Check text
      compare layoutPluck(layout, "text"), [
        [null, "A", "B", "None"]
        [null, null, null, null]
      ]

      # Check types
      compare layoutPluck(layout, "type"), [
        ["blank", "columnSegment", "columnSegment", "columnSegment"]
        ["rowSegment", "intersection", "intersection", "intersection"]
      ]

    it "adds labels for segments with axes", ->
      design = {
        table: "t1"
        columns: [{ id: "c1", valueAxis: @axisEnum, label: "C1" }]
        rows: [{ id: "r1", valueAxis: @axisText, label: "R1" }]
        intersections: {
          "r1:c1": { valueAxis: @axisNumberSum }
        }
      }

      data = {
        "r1:c1": [
          { r0: "x", c0: "a", value: 2 }
          { r0: "y", c0: "b", value: 4 }
        ]
      }

      layout = @lb.buildLayout(design, data)

      # Check text
      compare layoutPluck(layout, "text"), [
        [null, "C1", "C1", "C1"]
        [null, "A", "B", "None"]
        ["R1", null, null, null]
        ["x", "2", null, null]
        ["y", null, "4", null]
      ]

      # Check types
      compare layoutPluck(layout, "type"), [
        ["blank", "columnLabel", "skip", "skip"]
        ["blank", "columnSegment", "columnSegment", "columnSegment"]
        ["rowLabel", "intersection", "intersection", "intersection"]
        ["rowSegment", "intersection", "intersection", "intersection"]
        ["rowSegment", "intersection", "intersection", "intersection"]
      ]

      # Check column spans
      compare layoutPluck(layout, "columnSpan"), [
        [undefined, 3, undefined, undefined]
        [undefined, undefined, undefined, undefined]
        [undefined, undefined, undefined, undefined]
        [undefined, undefined, undefined, undefined]
        [undefined, undefined, undefined, undefined]
      ]

    it "sets segments with no axis or label as unconfigured", ->
      design = {
        table: "t1"
        columns: [{ id: "c1", valueAxis: null, label: null }]
        rows: [{ id: "r1", valueAxis: @axisText, label: null }]
        intersections: {
          "r1:c1": { valueAxis: @axisNumberSum }
        }
      }

      data = {
        "r1:c1": [
          { r0: "x", c0: null, value: 2 }
          { r0: "y", c0: null, value: 4 }
        ]
      }

      layout = @lb.buildLayout(design, data)

      # Check text
      compare layoutPluck(layout, "text"), [
        [null, null]
        ["x", "2"]
        ["y", "4"]
      ]

      # Check unconfigured
      compare layoutPluck(layout, "unconfigured"), [
        [null, true]
        [false, null]
        [false, null]
      ]

    it "uses label type for unconfigured segments", ->
      design = {
        table: "t1"
        columns: [{ id: "c1", valueAxis: null, label: null }]
        rows: [{ id: "r1", valueAxis: null, label: null }]
        intersections: {
          "r1:c1": { valueAxis: null }
        }
      }

      data = {}

      layout = @lb.buildLayout(design, data)

      # Check text
      compare layoutPluck(layout, "type"), [
        ["blank", "columnLabel"]
        ["rowLabel", "intersection"]
      ]

    it "adds background color", ->
      design = {
        table: "t1"
        columns: [{ id: "c1", valueAxis: @axisEnum }]
        rows: [{ id: "r1", valueAxis: @axisText }]
        intersections: {
          "r1:c1": { 
            valueAxis: @axisNumberSum 
            backgroundColorAxis: {
              expr: @axisNumberSum
              xform: "bin"
              min: 0
              max: 2
              numBins: 2
              colorMap: [
                { value: 0, color: "#FF8800"}
              ]
            }
            backgroundColorOpacity: 0.5
          }
        }
      }

      data = {
        "r1:c1": [
          { r0: "x", c0: "a", value: 2, backgroundColor: 0 }
          { r0: "y", c0: "b", value: 4, backgroundColor: null }
        ]
      }

      layout = @lb.buildLayout(design, data)

      # Check colors
      compare layoutPluck(layout, "backgroundColor"), [
        [null, null, null, null]
        [null, "rgba(255, 136, 0, 0.5)", null, null]
        [null, null, null, null]
      ]

    it "sets section top/left/bottom/right", ->
      design = {
        table: "t1"
        columns: [{ id: "c1", valueAxis: @axisEnum, label: "C1" }]
        rows: [{ id: "r1", valueAxis: @axisText, label: "R1" }]
        intersections: {
          "r1:c1": { valueAxis: @axisNumberSum }
        }
      }

      data = {
        "r1:c1": [
          { r0: "x", c0: "a", value: 2 }
          { r0: "y", c0: "b", value: 4 }
        ]
      }

      layout = @lb.buildLayout(design, data)

      # Check top
      compare layoutPluck(layout, "sectionTop"), [
        [false, true, true, true]
        [false, false, false, false]
        [true, true, true, true]
        [false, false, false, false]
        [false, false, false, false]
      ]

      # Check right (spanned columns have it true)
      compare layoutPluck(layout, "sectionRight"), [
        [false, true, false, true]
        [false, false, false, true]
        [true, false, false, true]
        [true, false, false, true]
        [true, false, false, true]
      ], JSON.stringify(layoutPluck(layout, "section"))

      # Check left
      compare layoutPluck(layout, "sectionLeft"), [
        [false, true, false, false]
        [false, true, false, false]
        [true, true, false, false]
        [true, true, false, false]
        [true, true, false, false]
      ]

      # Check bottom
      compare layoutPluck(layout, "sectionBottom"), [
        [false, false, false, false]
        [false, true, true, true]
        [false, false, false, false]
        [false, false, false, false]
        [true, true, true, true]
      ]
