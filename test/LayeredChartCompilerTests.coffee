_ = require 'lodash'
assert = require('chai').assert
fixtures = require './fixtures'
LayeredChartCompiler = require '../src/LayeredChartCompiler'

compare = (actual, expected) ->
  assert _.isEqual(actual, expected), JSON.stringify(actual, null, 2)

describe "LayeredChartCompiler", ->
  before ->
    @schema = fixtures.simpleSchema()
    @compiler = new LayeredChartCompiler(schema: @schema)

    @exprDecimal = { type: "field", table: "t1", column: "decimal" }
    @exprInteger = { type: "field", table: "t1", column: "integer" }
    @exprText = { type: "field", table: "t1", column: "text" }
    @exprDate = { type: "field", table: "t1", column: "date" }
    @exprEnum = { type: "field", table: "t1", column: "enum" }

  describe "getQueries", ->
    it "creates single grouped query", ->
      design = {
        type: "bar"
        layers: [
          { xExpr: @exprText, yExpr: @exprInteger, yAggr: "sum", table: "t1" }
        ]
      }

      queries = @compiler.getQueries(design)

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
          { xExpr: null, colorExpr: @exprEnum, yExpr: @exprInteger, yAggr: "sum", table: "t1" }
        ]
      }

      queries = @compiler.getQueries(design)

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
          { xExpr: @exprText, yExpr: @exprInteger, yAggr: "sum", table: "t1", filter: filter }
        ]
      }

      queries = @compiler.getQueries(design)

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
          { xExpr: @exprText, yExpr: @exprInteger, yAggr: "sum", table: "t1" }
        ]
      }

      queries = @compiler.getQueries(design, filters)

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
          { xExpr: @exprText, yExpr: @exprInteger, yAggr: "sum", table: "t1" }
        ]
      }

      queries = @compiler.getQueries(design)

      expectedQueries = {
        layer0: {
          type: "query"
          selects: [
            { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "x" }
            { type: "select", expr: { type: "field", tableAlias: "main", column: "integer" }, alias: "y" }
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
          { xExpr: @exprText, colorExpr: @exprEnum, yExpr: @exprInteger, yAggr: "sum", table: "t1" }
        ]
      }

      queries = @compiler.getQueries(design)

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

  describe "getColumns", ->
    it "creates x and y for each layer", ->
      design = {
        type: "line"
        layers: [
          { xExpr: @exprDecimal, yExpr: @exprInteger, yAggr: "sum", table: "t1" }
          { xExpr: @exprDecimal, yExpr: @exprInteger, yAggr: "sum", table: "t1" }
        ]
      }

      data = {
        layer0: [
          { x: 1, y: 10 }
          { x: 2, y: 20 }
        ]
        layer1: [
          { x: 11, y: 11 }
          { x: 12, y: 21 }
        ]
      }

      columns = @compiler.getColumns(design, data)

      expectedColumns = [
        [ "layer0:x", 1, 2 ]
        [ "layer0:y", 10, 20 ]
        [ "layer1:x", 11, 12 ]
        [ "layer1:y", 11, 21 ]
      ]

      compare(columns, expectedColumns)

    it "combines category into one x axis", ->
      # Category type x-axis must share one common x axis
      design = {
        type: "bar"
        layers: [
          { xExpr: @exprText, yExpr: @exprInteger, yAggr: "sum", table: "t1" }
          { xExpr: @exprText, yExpr: @exprInteger, yAggr: "sum", table: "t1" }
        ]
      }

      data = {
        layer0: [
          { x: "a", y: 10 }
          { x: "b", y: 20 }
        ]
        layer1: [
          { x: "a", y: 11 }
          { x: "c", y: 21 }
        ]
      }

      columns = @compiler.getColumns(design, data)

      expectedColumns = [
        [ "layer0:x", "a", "b", "c" ]
        [ "layer0:y", 10, 20, null ]
        [ "layer1:x", "a", "b", "c" ]
        [ "layer1:y", 11, null, 21 ]
      ]

      compare(columns, expectedColumns)

    it "ignores x if no x axis", ->
      design = {
        type: "pie"
        layers: [
          { xExpr: null, colorExpr: @exprEnum, yExpr: @exprInteger, yAggr: "sum", table: "t1" }
        ]
      }

      data = {
        layer0: [
          { color: "a", y: 10 }
          { color: "b", y: 20 }
        ]
      }

      columns = @compiler.getColumns(design, data)

      expectedColumns = [
        [ "layer0:a:y", 10 ]
        [ "layer0:b:y", 20 ]
      ]

      compare(columns, expectedColumns)

    it "splits if color expr with categorical x", ->
      design = {
        type: "bar"
        layers: [
          { xExpr: @exprText, colorExpr: @exprEnum, yExpr: @exprInteger, yAggr: "sum", table: "t1" }
        ]
      }

      data = {
        layer0: [
          { x: "1", color: "a", y: 10 }
          { x: "1", color: "b", y: 20 }
          { x: "2", color: "a", y: 30 }
        ]
      }

      columns = @compiler.getColumns(design, data)

      expectedColumns = [
        [ "layer0:a:x", "1", "2" ]
        [ "layer0:a:y", 10, 30 ]
        [ "layer0:b:x", "1", "2" ]
        [ "layer0:b:y", 20, null ]
      ]

      compare(columns, expectedColumns)

    it "splits if color expr with non-categorical x", ->
      design = {
        type: "bar"
        layers: [
          { xExpr: @exprDecimal, colorExpr: @exprEnum, yExpr: @exprInteger, yAggr: "sum", table: "t1" }
        ]
      }

      data = {
        layer0: [
          { x: 1, color: "a", y: 10 }
          { x: 1, color: "b", y: 20 }
          { x: 2, color: "a", y: 30 }
        ]
      }

      columns = @compiler.getColumns(design, data)

      expectedColumns = [
        [ "layer0:a:x", 1, 2 ]
        [ "layer0:a:y", 10, 30 ]
        [ "layer0:b:x", 1 ]
        [ "layer0:b:y", 20 ]
      ]

      compare(columns, expectedColumns)

    it "maps enums to labels", ->
      # Category type x-axis must share one common x axis
      design = {
        type: "bar"
        layers: [
          { xExpr: @exprEnum, yExpr: @exprInteger, yAggr: "sum", table: "t1" }
        ]
      }

      data = {
        layer0: [
          { x: "a", y: 10 }
          { x: "b", y: 20 }
        ]
      }

      columns = @compiler.getColumns(design, data)

      expectedColumns = [
        [ "layer0:x", "A", "B" ]
        [ "layer0:y", 10, 20 ]
      ]

      compare(columns, expectedColumns)

  describe "getXs", ->
    it "matches xs for simple query", ->
      columns = [
        [ "layer0:x", 1, 2 ]
        [ "layer0:y", 10, 20 ]
        [ "layer1:x", 11, 12 ]
        [ "layer1:y", 11, 21 ]
      ]

      xs = @compiler.getXs(columns)
      expectedXs = {
        "layer0:y": "layer0:x"
        "layer1:y": "layer1:x"
      }
      compare(xs, expectedXs)

    it "matches xs for color expr", ->
      columns = [
        [ "layer0:a:x", "1", "2" ]
        [ "layer0:a:y", 10, 30 ]
        [ "layer0:b:x", "1", "2" ]
        [ "layer0:b:y", 20, null ]
      ]

      xs = @compiler.getXs(columns)
      expectedXs = {
        "layer0:a:y": "layer0:a:x"
        "layer0:b:y": "layer0:b:x"
      }
      compare(xs, expectedXs)

    it "no xs if no x expr", ->
      columns = [
        [ "layer0:a:y", 10, 30 ]
        [ "layer0:b:y", 20, null ]
      ]

      xs = @compiler.getXs(columns)
      expectedXs = { }
      compare(xs, expectedXs)

  describe "getNames", ->
    it "uses names of each simple layer", ->
      design = {
        type: "line"
        layers: [
          { xExpr: @exprDecimal, yExpr: @exprInteger, yAggr: "sum", table: "t1" }
          { xExpr: @exprDecimal, yExpr: @exprInteger, yAggr: "sum", table: "t1", name: "second layer" }
        ]
      }

      data = {
        layer0: [
          { x: 1, y: 10 }
          { x: 2, y: 20 }
        ]
        layer1: [
          { x: 11, y: 11 }
          { x: 12, y: 21 }
        ]
      }

      names = @compiler.getNames(design, data)

      expectedNames = {
        "layer0:y": "Series 1" # Defaults names
        "layer1:y": "second layer"
      }

      compare(names, expectedNames)

    it "uses mapped color expr for names of color-split layers", ->
      design = {
        type: "bar"
        layers: [
          { xExpr: @exprText, colorExpr: @exprEnum, yExpr: @exprInteger, yAggr: "sum", table: "t1" }
        ]
      }

      data = {
        layer0: [
          { x: "1", color: "a", y: 10 }
          { x: "1", color: "b", y: 20 }
          { x: "2", color: "a", y: 30 }
        ]
      }

      names = @compiler.getNames(design, data)

      expectedNames = {
        "layer0:a:y": "A"
        "layer0:b:y": "B"
      }

      compare(names, expectedNames)

  describe "getGroups", ->
    it "doesn't group normally", ->
      design = {
        type: "bar"
        layers: [
          { xExpr: @exprText, colorExpr: @exprEnum, yExpr: @exprInteger, yAggr: "sum", table: "t1" }
        ]
      }

      columns = [
        [ "layer0:a:x", "1", "2" ]
        [ "layer0:a:y", 10, 30 ]
        [ "layer0:b:x", "1", "2" ]
        [ "layer0:b:y", 20, null ]
      ]

      expectedGroups = []

      types = @compiler.getGroups(design, columns)
      compare(types, expectedGroups)

    it "groups if layer is stacked", ->
      design = {
        type: "bar"
        layers: [
          { xExpr: @exprText, colorExpr: @exprEnum, yExpr: @exprInteger, yAggr: "sum", table: "t1", stacked: true }
        ]
      }

      columns = [
        [ "layer0:a:x", "1", "2" ]
        [ "layer0:a:y", 10, 30 ]
        [ "layer0:b:x", "1", "2" ]
        [ "layer0:b:y", 20, null ]
      ]

      expectedGroups = [
        ['layer0:a:y', 'layer0:b:y']
      ]

      types = @compiler.getGroups(design, columns)
      compare(types, expectedGroups)


  describe "getTypes", ->
    it "defaults to overall type", ->
      design = {
        type: "bar"
        layers: [
          { xExpr: @exprText, yExpr: @exprInteger, yAggr: "sum", table: "t1" }
          { xExpr: @exprText, yExpr: @exprInteger, yAggr: "sum", table: "t1", type: "line" }
        ]
      }

      columns = [
        [ "layer0:x", "a", "b", "c" ]
        [ "layer0:y", 10, 20, null ]
        [ "layer1:x", "a", "b", "c" ]
        [ "layer1:y", 11, null, 21 ]
      ]

      expectedTypes = {
        "layer0:y": "bar"
        "layer1:y": "line"
      }

      types = @compiler.getTypes(design, columns)
      compare(types, expectedTypes)

  describe "getXAxisType", ->
    it "uses category for text and enum", ->
      design = {
        type: "bar"
        layers: [
          { xExpr: @exprText, yExpr: @exprInteger, yAggr: "sum", table: "t1" }
        ]
      }

      xAxisType = @compiler.getXAxisType(design)
      assert.equal xAxisType, "category"

    it "uses timeseries for date", ->
      design = {
        type: "bar"
        layers: [
          { xExpr: @exprDate, yExpr: @exprInteger, yAggr: "sum", table: "t1" }
        ]
      }

      xAxisType = @compiler.getXAxisType(design)
      assert.equal xAxisType, "timeseries"

    it "uses indexed by default", ->
      design = {
        type: "line"
        layers: [
          { xExpr: @exprDecimal, yExpr: @exprInteger, table: "t1" }
        ]
      }

      xAxisType = @compiler.getXAxisType(design)
      assert.equal xAxisType, "indexed"
