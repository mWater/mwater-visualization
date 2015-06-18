assert = require('chai').assert
_ = require 'lodash'
fixtures = require './fixtures'
BarChart = require '../src/BarChart'

describe "BarChart", ->
  before ->
    @barChart = new BarChart(fixtures.simpleSchema())

  describe "cleanDesign", ->
    it "sets table from aesthetics", ->
      design = {
        aesthetics: {
          x: { expr: { type: "field", table: "t1", column: "decimal" } }
        }
      }
      d = @barChart.cleanDesign(design)
      assert.equal d.table, "t1"

    it "removes table if no aesthetics", ->
      design = {
        aesthetics: {
        }
        table: "t1"
      }
      d = @barChart.cleanDesign(design)
      assert not d.table

    it "removes aesthetic if wrong table", ->
      design = {
        table: "t2"
        aesthetics: {
          x: { expr: { type: "field", table: "t1", column: "decimal" } }
          y: { expr: { type: "field", table: "t2", column: "decimal" }, aggr: "sum" }
        }
      }
      d = @barChart.cleanDesign(design)

      assert.deepEqual design.aesthetics.y, d.aesthetics.y
      assert not d.aesthetics.x.expr, "Should remove x"

    it "removes aesthetic if invalid expr", ->
      design = {
        aesthetics: {
          x: { expr: { type: "field", table: "t1" } }
          y: { expr: { type: "field", table: "t1", column: "decimal" } }
        }
      }
      d = @barChart.cleanDesign(design)

      assert not d.aesthetics.x.expr

    it "removes filter if invalid expr", ->
      design = {
        aesthetics: {
          x: { expr: { type: "field", table: "t1", column: "decimal" } }
        }
        filter: { type: "comparison", table: "t2", op: "123123" }
      }

      d = @barChart.cleanDesign(design)
      assert not d.aesthetics.filter

    it "defaults y if can count", ->
      design = {
        aesthetics: {
          x: { expr: { type: "field", table: "t1", column: "decimal" } }
        }
      }
      d = @barChart.cleanDesign(design)
      assert.deepEqual d.aesthetics.y, {
        aggr: "count"
        expr: { type: "field", table: "t1", column: "primary" }
      }

  describe "validateDesign", ->
    it "validates valid design", ->
      design = {
        aesthetics: {
          x: { expr: { type: "field", table: "t1", column: "enum" } }
          y: { expr: { type: "field", table: "t1", column: "decimal" }, aggr: "sum" }
        }
      }
      assert not @barChart.validateDesign(design)

    it "requires x aesthetic", ->
      design = {
        aesthetics: {
          y: { expr: { type: "field", table: "t2", column: "decimal" } }
        }
      }
      assert @barChart.validateDesign(design)

    it "requires y aesthetic", ->
      design = {
        aesthetics: {
          x: { expr: { type: "field", table: "t2", column: "enum" } }
        }
      }
      assert @barChart.validateDesign(design)

    it "requires y aggr", ->
      design = {
        aesthetics: {
          x: { expr: { type: "field", table: "t2", column: "enum" } }
          y: { expr: { type: "field", table: "t2", column: "decimal" } }
        }
      }
      assert @barChart.validateDesign(design)

  describe "createQueries", ->
    it "creates simple query, grouping by x aesthetic expr", ->
      design = {
        aesthetics: {
          x: { expr: { type: "field", table: "t1", column: "enum" } }
          y: { expr: { type: "field", table: "t1", column: "decimal" }, aggr: "sum" }
        }
        table: "t1"
      }

      queries = @barChart.createQueries(design)

      expectedQuery = {
        type: "query"
        selects: [
          { type: "select", expr: { type: "field", tableAlias: "main", column: "enum" }, alias: "x" }
          { type: "select", expr: { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "main", column: "decimal" }] }, alias: "y" }
        ]
        from: { type: "table", table: "t1", alias: "main" }
        groupBy: [1]
        limit: 1000
      }

      assert _.isEqual(queries.main, expectedQuery), JSON.stringify(queries.main, null, 2)
