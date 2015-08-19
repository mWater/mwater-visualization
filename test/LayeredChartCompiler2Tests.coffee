_ = require 'lodash'
assert = require('chai').assert
fixtures = require './fixtures'
LayeredChartCompiler2 = require '../src/widgets/charts/LayeredChartCompiler2'

compare = (actual, expected) ->
  assert _.isEqual(actual, expected), "\n" + JSON.stringify(actual) + "\n" + JSON.stringify(expected)

describe "LayeredChartCompiler2", ->
  before ->
    @schema = fixtures.simpleSchema()
    @compiler = new LayeredChartCompiler2(schema: @schema)

    @exprDecimal = { type: "field", table: "t1", column: "decimal" }
    @exprInteger = { type: "field", table: "t1", column: "integer" }
    @exprText = { type: "field", table: "t1", column: "text" }
    @exprDate = { type: "field", table: "t1", column: "date" }
    @exprEnum = { type: "field", table: "t1", column: "enum" }

    @axisContinuous = { expr: @exprDecimal }
    @axisDiscrete = { expr: @exprInteger }
    @axisEnum = { expr: @exprEnum } 
    @axisText = { expr: @exprText } 

  describe "pie/donut", ->
    describe "single layer", ->
      before ->
        @design = {
          type: "pie"
          layers: [
            { table: "t1", color: @axisEnum, y: @axisContinuous }
          ]
        }

        @data = { layer0: [
          { color: "a", y: 1 }
          { color: "b", y: 2 }
        ]}

        @res = @compiler.compileData(@design, @data)

      it "sets types to pie", -> 
        compare(@res.types, {
          "0:0": "pie"
          "0:1": "pie"})

      it "makes columns with y value", ->
        compare(@res.columns, [
          ["0:0", 1]
          ["0:1", 2]
          ])

      it "maps back to rows", ->
        compare(@res.mapping, {
          "0:0": { layerIndex: 0, row: @data.layer0[0] }
          "0:1": { layerIndex: 0, row: @data.layer0[1] }
          })

      it "names", ->
        compare(@res.names, {
          "0:0": "A"
          "0:1": "B"
          })

    describe "multiple layer", ->
      before ->
        @design = {
          type: "pie"
          layers: [
            { table: "t1", y: @axisContinuous, name: "X" }
            { table: "t1", y: @axisContinuous, name: "Y" }
          ]
        }

        @data = { 
          layer0: [{ y: 1 }]
          layer1: [{ y: 2 }]
        }

        @res = @compiler.compileData(@design, @data)

      it "sets types to pie", -> 
        compare(@res.types, {
          "0": "pie"
          "1": "pie"})

      it "makes columns with y value", ->
        compare(@res.columns, [
          ["0", 1]
          ["1", 2]
          ])

      it "maps back to rows", ->
        compare(@res.mapping, {
          "0": { layerIndex: 0, row: @data.layer0[0] }
          "1": { layerIndex: 1, row: @data.layer1[0] }
          })

      it "names", ->
        compare(@res.names, {
          "0": "X"
          "1": "Y"
          })
