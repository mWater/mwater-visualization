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

    @axisDecimal = { expr: @exprDecimal }
    @axisIntegerSum = { expr: @exprInteger, aggr: "sum" }
    @axisInteger = { expr: @exprInteger }
    @axisEnum = { expr: @exprEnum } 
    @axisText = { expr: @exprText } 

  describe "compileQueries", ->
    it "creates single grouped query", ->
      design = {
        type: "bar"
        layers: [
          { axes: { x: @axisText, y: @axisIntegerSum }, table: "t1" }
        ]
      }

      queries = @compiler.compileQueries(design)

      expectedQueries = {
        layer0: {
          type: "query"
          selects: [
            { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "x" }
            { type: "select", expr: { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "main", column: "integer" }] }, alias: "y" }
          ]
          from: { type: "table", table: "t1", alias: "main" }
          groupBy: [1]
          orderBy: [{ ordinal: 1 }]
          limit: 1000
        }
      }

      compare(queries, expectedQueries)

    it "creates single grouped query without x", ->
      design = {
        type: "pie"
        layers: [
          { axes: { color: @axisEnum, y: @axisIntegerSum }, table: "t1" }
        ]
      }

      queries = @compiler.compileQueries(design)

      expectedQueries = {
        layer0: {
          type: "query"
          selects: [
            { type: "select", expr: { type: "field", tableAlias: "main", column: "enum" }, alias: "color" }
            { type: "select", expr: { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "main", column: "integer" }] }, alias: "y" }
          ]
          from: { type: "table", table: "t1", alias: "main" }
          groupBy: [1]
          orderBy: [{ ordinal: 1 }]
          limit: 1000
        }
      }

      compare(queries, expectedQueries)

    it "filters query", ->
      filter = { type: "comparison", table: "t1", lhs: { type: "field", table: "t1", column: "integer" }, op: ">", rhs: { type: "literal", valueType: "integer", value: 4 } }

      design = {
        type: "bar"
        layers: [
          { axes: { x: @axisText, y: @axisIntegerSum }, table: "t1", filter: filter }
        ]
      }

      queries = @compiler.compileQueries(design)

      expectedQueries = {
        layer0: {
          type: "query"
          selects: [
            { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "x" }
            { type: "select", expr: { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "main", column: "integer" }] }, alias: "y" }
          ]
          from: { type: "table", table: "t1", alias: "main" }
          where: { type: "op", op: ">", exprs: [
            { type: "field", tableAlias: "main", column: "integer" }
            { type: "literal", value: 4 }
          ]}
          groupBy: [1]
          orderBy: [{ ordinal: 1 }]
          limit: 1000
        }
      }

      compare(queries, expectedQueries)

    it "filters if by relevant extra filters", ->
      relevantFilter = { type: "comparison", table: "t1", lhs: { type: "field", table: "t1", column: "integer" }, op: ">", rhs: { type: "literal", valueType: "integer", value: 4 } }

      # Wrong table
      otherFilter = { type: "comparison", table: "t2", lhs: { type: "field", table: "t2", column: "integer" }, op: ">", rhs: { type: "literal", valueType: "integer", value: 5 } }

      filters = [
        relevantFilter
        otherFilter
      ]

      design = {
        type: "bar"
        layers: [
          { axes: { x: @axisText, y: @axisIntegerSum }, table: "t1" }
        ]
      }

      queries = @compiler.compileQueries(design, filters)

      expectedQueries = {
        layer0: {
          type: "query"
          selects: [
            { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "x" }
            { type: "select", expr: { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "main", column: "integer" }] }, alias: "y" }
          ]
          from: { type: "table", table: "t1", alias: "main" }
          where: { type: "op", op: ">", exprs: [
            { type: "field", tableAlias: "main", column: "integer" }
            { type: "literal", value: 4 }
          ]}
          groupBy: [1]
          orderBy: [{ ordinal: 1 }]
          limit: 1000
        }
      }

      compare(queries, expectedQueries)

    it "creates single ungrouped query", ->
      design = {
        type: "scatter"
        layers: [
          { axes: { x: @axisInteger, y: @axisDecimal }, table: "t1" }
        ]
      }

      queries = @compiler.compileQueries(design)

      expectedQueries = {
        layer0: {
          type: "query"
          selects: [
            { type: "select", expr: { type: "field", tableAlias: "main", column: "integer" }, alias: "x" }
            { type: "select", expr: { type: "field", tableAlias: "main", column: "decimal" }, alias: "y" }
          ]
          from: { type: "table", table: "t1", alias: "main" }
          groupBy: []
          orderBy: [{ ordinal: 1 }]
          limit: 1000
        }
      }

      compare(queries, expectedQueries)

    it "adds color grouping", ->
      design = {
        type: "bar"
        layers: [
          { axes: { x: @axisText, color: @axisEnum, y: @axisIntegerSum }, table: "t1" }
        ]
      }

      queries = @compiler.compileQueries(design)

      expectedQueries = {
        layer0: {
          type: "query"
          selects: [
            { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "x" }
            { type: "select", expr: { type: "field", tableAlias: "main", column: "enum" }, alias: "color" }
            { type: "select", expr: { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "main", column: "integer" }] }, alias: "y" }
          ]
          from: { type: "table", table: "t1", alias: "main" }
          groupBy: [1, 2]
          orderBy: [{ ordinal: 1 }, { ordinal: 2 }]
          limit: 1000
        }
      }

      compare(queries, expectedQueries)

  describe "pie/donut", ->
    describe "single layer", ->
      before ->
        @design = {
          type: "pie"
          layers: [
            { table: "t1", axes: { color: @axisEnum, y: @axisDecimal } }
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

      it "colors based on color map"

    describe "multiple layer", ->
      before ->
        @design = {
          type: "pie"
          layers: [
            { table: "t1", axes: { y: @axisDecimal }, name: "X" }
            { table: "t1", axes: { y: @axisDecimal }, name: "Y", color: "red" }
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

      it "uses series color", ->
        compare(@res.colors, {
          "1": "red"
          })

      it "names", ->
        compare(@res.names, {
          "0": "X"
          "1": "Y"
          })

  describe "scatter"