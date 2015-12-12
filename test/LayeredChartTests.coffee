_ = require 'lodash'
assert = require('chai').assert
fixtures = require './fixtures'
LayeredChart = require '../src/widgets/charts/LayeredChart'
canonical = require 'canonical-json'

compare = (actual, expected) ->
  assert.equal canonical(actual), canonical(expected)

describe "LayeredChart", ->
  before ->
    @schema = fixtures.simpleSchema()
    @chart = new LayeredChart(schema: @schema, dataSource: {})

    @exprNumber = { type: "field", table: "t1", column: "number" }
    @exprText = { type: "field", table: "t1", column: "text" }
    @exprDate = { type: "field", table: "t1", column: "date" }
    @exprEnum = { type: "field", table: "t1", column: "enum" }

    @axisNumber = { expr: @exprNumber }
    @axisNumberSum = { expr: @exprNumber, aggr: "sum" }
    @axisEnum = { expr: @exprEnum } 
    @axisEnumset = { expr: @exprEnumset } 
    @axisText = { expr: @exprText } 
    @axisDate = { expr: @exprDate } 

  describe "cleanDesign", ->
    it "defaults y axis to count", ->
      design = {
        type: "bar"
        layers: [
          { axes: { x: @axisEnum, y: null }, table: "t1" }
        ]
      }

      design = @chart.cleanDesign(design)

      expectedY = {
        expr: {
          type: "scalar"
          table: "t1"
          joins:[]
          expr: { type: "count", table: "t1" }
        }
        xform: null
        aggr: "count"
      }

      compare(design.layers[0].axes.y, expectedY)

