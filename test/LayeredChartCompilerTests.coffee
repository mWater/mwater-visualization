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

    it "splits if color expr"
    it "maps enums to labels"

  describe "getXs", ->
    it "matches xs for simple query"
    it "matches xs for color expr"

  describe "getNames", ->
    it "uses names of each layer"
    it "defaults names of layers with no name"

  describe "getGroups", ->
    it "groups if layer is stacked"
    it "doesn't group normally"

  describe "getTypes", ->
    it "defaults to overall type"

  describe "getXAxisType", ->
    it "uses category for text and enum"
    it "uses timeseries for date"