assert = require('chai').assert

fixtures = require './fixtures'
DesignValidator = require '../src/DesignValidator'

describe "DesignValidator", ->
  before ->
    @dv = new DesignValidator(fixtures.simpleSchema())

  # describe "cleanScalarExpr", ->
  #   it "removes unnecessary aggr", ->
  #     expr = { type: "scalar", baseTableId: "t1", joinIds: [], expr: { type: "field", tableId: "t1", columnId: "text" }, aggrId: "sum" }
  #     expr = @dv.cleanScalarExpr(expr)
  #     assert not expr.aggrId

  #   it "adds first aggr", ->
  #     expr = { type: "scalar", baseTableId: "t1", joinIds: ['1-2'], expr: { type: "field", tableId: "t2", columnId: "text" } }
  #     expr = @dv.cleanScalarExpr(expr)
  #     assert.equal expr.aggrId, "last"

  #   it "removes invalid aggr, selecting first", ->
  #     expr = { type: "scalar", baseTableId: "t1", joinIds: ['1-2'], expr: { type: "field", tableId: "t2", columnId: "text" }, aggrId: "sum" }
  #     expr = @dv.cleanScalarExpr(expr)
  #     assert.equal expr.aggrId, "last"

  #   it "removes if base table wrong with no joins"
  #   it "removes if base table wrong with joins"
  

  describe "validateComparisonExpr", ->
    it "null for valid", ->
      expr = { type: "comparison", lhs: { type: "field", tableId: "t1", columnId: "text" }, op: "~*", rhs: { type: "text", value: "x" } }
      assert.isNull @dv.validateComparisonExpr(expr)

    it "requires lhs", ->
      expr = { type: "comparison", op: "~*", rhs: { type: "text", value: "x" } }
      assert.isNotNull @dv.validateComparisonExpr(expr)

    it "requires op", ->
      expr = { type: "comparison", lhs: { type: "field", tableId: "t1", columnId: "text" }, rhs: { type: "text", value: "x" } }
      assert.isNotNull @dv.validateComparisonExpr(expr)

    it "requires rhs if has type"
    it "requires rhs type to match"

  describe "validateLogicalExpr", ->
    it "checks all exprs"

  # describe "defaultExpr", ->