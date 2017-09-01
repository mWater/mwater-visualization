assert = require('chai').assert
fixtures = require '../../../fixtures'
_ = require 'lodash'

PivotChartQueryBuilder = require '../../../../src/widgets/charts/pivot/PivotChartQueryBuilder'

canonical = require 'canonical-json'
compare = (actual, expected) ->
  assert.equal canonical(actual), canonical(expected), "\n" + canonical(actual) + "\n" + canonical(expected) + "\n"

describe "PivotChartQueryBuilder", ->
  before ->
    @qb = new PivotChartQueryBuilder(schema: fixtures.simpleSchema())
    @exprBoolean = { type: "field", table: "t1", column: "boolean" }
    @exprNumber = { type: "field", table: "t1", column: "number" }
    @exprText = { type: "field", table: "t1", column: "text" }
    @exprEnum = { type: "field", table: "t1", column: "enum" }
    @exprNumberSum = { type: "op", op: "sum", table: "t1", exprs: [{ type: "field", table: "t1", column: "number" }] }

    @axisNumber = { expr: @exprNumber }
    @axisNumberSum = { expr: @exprNumberSum }
    @axisCount = { expr: { type: "op", op: "count", table: "t1", exprs: [] } }
    @axisEnum = { expr: @exprEnum } 
    @axisText = { expr: @exprText } 

  it "creates single query", ->
    design = {
      table: "t1"
      rows: [
        { id: "r1", valueAxis: @axisEnum }
      ]
      columns: [
        { id: "c1", valueAxis: @axisText }
      ]
      intersections: {
        "r1:c1": {
          valueAxis: @axisNumberSum
        }
      }
    }

    queries = @qb.createQueries(design)
    assert.equal _.values(queries).length, 1, "Should have single query"

    query = queries["r1:c1"]
    compare query, {
      type: "query"
      selects: [
        { type: "select", expr: { type: "field", tableAlias: "main", column: "enum" }, alias: "r0" }
        { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "c0" }
        { type: "select", expr: { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "main", column: "number" }] }, alias: "value" }
      ]
      from: { type: "table", table: "t1", alias: "main" }
      limit: 10000
      groupBy: [1, 2]
    }

  it "creates nested query"

  it "adds filters query", ->
    design = {
      table: "t1"
      rows: [
        { id: "r1", valueAxis: @axisEnum, filter: @exprBoolean }
      ]
      columns: [
        { id: "c1", valueAxis: @axisText }
      ]
      intersections: {
        "r1:c1": {
          valueAxis: @axisNumberSum
        }
      }
    }

    queries = @qb.createQueries(design)
    assert.equal _.values(queries).length, 1, "Should have single query"

    query = queries["r1:c1"]
    compare query, {
      type: "query"
      selects: [
        { type: "select", expr: { type: "field", tableAlias: "main", column: "enum" }, alias: "r0" }
        { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "c0" }
        { type: "select", expr: { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "main", column: "number" }] }, alias: "value" }
      ]
      from: { type: "table", table: "t1", alias: "main" }
      where: { type: "field", tableAlias: "main", column: "boolean" }
      limit: 10000
      groupBy: [1, 2]
    }

  it "adds double filtered query", ->
    design = {
      table: "t1"
      rows: [
        { id: "r1", valueAxis: @axisEnum, filter: @exprBoolean }
      ]
      columns: [
        { id: "c1", valueAxis: @axisText }
      ]
      intersections: {
        "r1:c1": {
          valueAxis: @axisNumberSum
          filter: { type: "literal", valueType: "boolean", value: true }
        }
      }
    }

    queries = @qb.createQueries(design)
    assert.equal _.values(queries).length, 1, "Should have single query"

    query = queries["r1:c1"]
    compare query, {
      type: "query"
      selects: [
        { type: "select", expr: { type: "field", tableAlias: "main", column: "enum" }, alias: "r0" }
        { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "c0" }
        { type: "select", expr: { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "main", column: "number" }] }, alias: "value" }
      ]
      from: { type: "table", table: "t1", alias: "main" }
      where: {
        type: "op"
        op: "and"
        exprs: [
          { type: "field", tableAlias: "main", column: "boolean" }
          { type: "literal", value: true }
        ]
      }
      limit: 10000
      groupBy: [1, 2]
    }

  it "adds background color axis", ->
    design = {
      table: "t1"
      rows: [
        { id: "r1", valueAxis: @axisEnum }
      ]
      columns: [
        { id: "c1", valueAxis: @axisText }
      ]
      intersections: {
        "r1:c1": {
          valueAxis: @axisNumberSum
          backgroundColorAxis: @axisCount
        }
      }
    }

    queries = @qb.createQueries(design)
    assert.equal _.values(queries).length, 1, "Should have single query"

    query = queries["r1:c1"]
    compare query, {
      type: "query"
      selects: [
        { type: "select", expr: { type: "field", tableAlias: "main", column: "enum" }, alias: "r0" }
        { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "c0" }
        { type: "select", expr: { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "main", column: "number" }] }, alias: "value" }
        { type: "select", expr: { type: "op", op: "count", exprs: [] }, alias: "bc" }
      ]
      from: { type: "table", table: "t1", alias: "main" }
      limit: 10000
      groupBy: [1, 2]
    }

  it "adds background color conditions", ->
    design = {
      table: "t1"
      rows: [
        { id: "r1", valueAxis: @axisEnum }
      ]
      columns: [
        { id: "c1", valueAxis: @axisText }
      ]
      intersections: {
        "r1:c1": {
          valueAxis: @axisNumberSum
          backgroundColorConditions: [
            { condition: { type: "op", op: ">", table: "t1", exprs: [@exprNumberSum, { type: "literal", valueType: "number", value: 5 }]}, color: "red" }
          ]
        }
      }
    }

    queries = @qb.createQueries(design)
    assert.equal _.values(queries).length, 1, "Should have single query"

    query = queries["r1:c1"]
    compare query, {
      type: "query"
      selects: [
        { type: "select", expr: { type: "field", tableAlias: "main", column: "enum" }, alias: "r0" }
        { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "c0" }
        { type: "select", expr: { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "main", column: "number" }] }, alias: "value" }
        { 
          type: "select"
          expr: { 
            type: "op"
            op: ">"
            exprs: [
              { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "main", column: "number" }] }
              { type: "literal", value: 5 }
            ]
          }
          alias: "bcc0" 
        }
      ]
      from: { type: "table", table: "t1", alias: "main" }
      limit: 10000
      groupBy: [1, 2]
    }


