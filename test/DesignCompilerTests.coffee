assert = require('chai').assert
fixtures = require './fixtures'

DesignCompiler = require '../src/DesignCompiler'

describe "DesignCompiler", ->
  before ->
    @dc = new DesignCompiler(fixtures.simpleSchema())

  it "compiles field", ->
    jql = @dc.compileExpr(expr: { type: "field", tableId: "t1", columnId: "integer" }, baseTableId: "t1", baseTableAlias: "T1")
    assert _.isEqual jql, {
      type: "field"
      tableAlias: "T1"
      column: "integer"
    }

  it "checks baseTable of field", ->
    assert.throws () =>
      @dc.compileExpr(expr: { type: "field", tableId: "t1", columnId: "integer" }, baseTableId: "t2", baseTableAlias: "T2")

  it "compiles scalar with no joins", ->
    expr = { type: "scalar", expr: { type: "field", tableId: "t1", columnId: "integer" }, joinIds: [] }
    jql = @dc.compileExpr(expr: expr, baseTableId: "t1", baseTableAlias: "T1")
    assert _.isEqual jql, {
      type: "scalar"
      expr: { type: "field", tableAlias: "T1", column: "integer" }
    }

  it "compiles scalar with one join", ->
    expr = { type: "scalar", expr: { type: "field", tableId: "t2", columnId: "integer" }, joinIds: ["1-2"] }

    jql = @dc.compileExpr(expr: expr, baseTableId: "t1", baseTableAlias: "T1")

    assert _.isEqual jql, {
      type: "scalar"
      expr: { type: "field", tableAlias: "", column: "integer" }
    }

  it "compiles scalar with one join and aggr"
  it "compiles scalar with two joins"

  it "compiles scalar with one join and where"

  # it "compiles comparisons", ->
  #   @dc.compile({ })

