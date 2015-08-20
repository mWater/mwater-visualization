assert = require('chai').assert
fixtures = require './fixtures'

AxisBuilder = require '../src/expressions/axes/AxisBuilder'

# TODO
describe "AxisBuilder", ->
  before ->
    @ab = new AxisBuilder(schema: fixtures.simpleSchema())

  it "compiles simple expr", ->
    axis = {
      expr: { type: "field", table: "t1", column: "integer" }
    }

    jql = @ab.compileAxis(axis: axis, tableAlias: "T1")
    assert _.isEqual jql, {
      type: "field"
      tableAlias: "T1"
      column: "integer"
    }

  it "compiles aggregated field", ->
    axis = {
      expr: { type: "field", table: "t1", column: "integer" } 
      aggr: "sum"
    }

    jql = @ab.compileAxis(axis: axis, tableAlias: "T1")
    assert _.isEqual jql, {
      type: "op"
      op: "sum"
      exprs: [
        {
          type: "field"
          tableAlias: "T1"
          column: "integer"
        }
      ]
    }
