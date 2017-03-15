_ = require 'lodash'
assert = require('chai').assert
fixtures = require './fixtures'
LayeredChart = require '../src/widgets/charts/layered/LayeredChart'
canonical = require 'canonical-json'

compare = (actual, expected) ->
  assert.equal canonical(actual), canonical(expected), "\n" + canonical(actual) + "\n" + canonical(expected)

describe "LayeredChart", ->
  before ->
    @schema = fixtures.simpleSchema()
    @chart = new LayeredChart()

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
    # Removed as was making impossible to choose other than count
    # it "defaults y axis to count", ->
    #   design = {
    #     type: "bar"
    #     layers: [
    #       { axes: { x: @axisEnum, y: null }, table: "t1" }
    #     ]
    #   }
    # 
    #   design = @chart.cleanDesign(design, @schema)
    # 
    #   expectedY = {
    #     expr: { type: "id", table: "t1" }
    #     xform: null
    #     aggr: "count"
    #   }
    # 
    #   compare(design.layers[0].axes.y, expectedY)

    # it "does not default y axis if scatter", ->
    #   design = {
    #     type: "scatter"
    #     layers: [
    #       { axes: { x: @axisEnum, y: null }, table: "t1" }
    #     ]
    #   }

    # it "does not default y axis if scatter", ->
    #   design = {
    #     type: "scatter"
    #     layers: [
    #       { axes: { x: @axisEnum, y: null }, table: "t1" }
    #     ]
    #   }

    #   design = @chart.cleanDesign(design, @schema)

    #   assert not design.layers[0].axes.y

    it "removes aggr from y if scatter", ->
      design = {
        type: "scatter"
        layers: [
          { axes: { x: @axisEnum, y: { expr: { type: "id", table: "t1" }, xform: null, aggr: "count" } }, table: "t1" }
        ]
      }

      design = @chart.cleanDesign(design, @schema)

      expectedY = @axisNumber

      assert not design.layers[0].axes.y
