assert = require('chai').assert

fixtures = require './fixtures'
DesignValidator = require '../src/DesignValidator'

describe "DesignValidator", ->
  before ->
    @dv = new DesignValidator(fixtures.simpleSchema())

  describe "cleanScalarExpr", ->
    it "removes unnecessary aggr", ->
      expr = { type: "scalar", baseTableId: "t1", joinIds: [], expr: { type: "field", tableId: "t1", columnId: "text" }, aggr: "sum" }
      expr = @dv.cleanScalarExpr(expr)
      assert not expr.aggr

    it "adds first aggr", ->
      expr = { type: "scalar", baseTableId: "t1", joinIds: ['1-2'], expr: { type: "field", tableId: "t2", columnId: "text" } }
      expr = @dv.cleanScalarExpr(expr)
      assert.equal expr.aggr, "count"

    it "removes invalid aggr, selecting first", ->
      expr = { type: "scalar", baseTableId: "t1", joinIds: ['1-2'], expr: { type: "field", tableId: "t2", columnId: "text" }, aggr: "sum" }
      expr = @dv.cleanScalarExpr(expr)
      assert.equal expr.aggr, "count"
  
  describe "cleanComparisonExpr", ->
    it "removes op if no lhs", ->
      expr = { type: "comparison", op: "=" }
      expr = @dv.cleanComparisonExpr(expr)
      assert not expr.op

    it "removes rhs if no op", ->
      expr = { type: "comparison", lhs: { type: "field", tableId: "t1", columnId: "text" }, rhs: { type: "literal", value: "x" } }
      expr = @dv.cleanComparisonExpr(expr)
      assert not expr.rhs

    it "removes rhs if wrong type", ->
      expr = { type: "comparison", lhs: { type: "field", tableId: "t1", columnId: "text" }, op: "~*", rhs: { type: "literal", value: "x" } }
      expr = @dv.cleanComparisonExpr(expr)
      assert expr.rhs, "should keep"

      expr = { type: "comparison", lhs: { type: "field", tableId: "t1", columnId: "text" }, op: "~*", rhs: { type: "literal", value: 3 } }
      expr = @dv.cleanComparisonExpr(expr)
      assert not expr.rhs, "should remove"

    it "allows integer rhs for decimal", ->
      expr = { type: "comparison", lhs: { type: "field", tableId: "t1", columnId: "decimal" }, op: ">=", rhs: { type: "literal", value: 3 } }
      expr = @dv.cleanComparisonExpr(expr)
      assert expr.rhs, "should keep"

    it "defaults op", ->
      expr = { type: "comparison", lhs: { type: "field", tableId: "t1", columnId: "text" } }
      expr = @dv.cleanComparisonExpr(expr)
      assert.equal expr.op, "~*"


  # describe "defaultExpr", ->