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

    @exprDecimal = { type: "field", table: "t1", column: "decimal" }
    @exprInteger = { type: "field", table: "t1", column: "integer" }
    @exprText = { type: "field", table: "t1", column: "text" }
    @exprDate = { type: "field", table: "t1", column: "date" }
    @exprEnum = { type: "field", table: "t1", column: "enum" }

    @axisDecimal = { expr: @exprDecimal }
    @axisIntegerSum = { expr: @exprInteger, aggr: "sum" }
    @axisInteger = { expr: @exprInteger }
    @axisEnum = { expr: @exprEnum } 
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

