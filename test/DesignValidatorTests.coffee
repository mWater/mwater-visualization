assert = require('chai').assert

fixtures = require './fixtures'
DesignValidator = require '../src/DesignValidator'

describe "DesignValidator", ->
  before ->
    @dv = new DesignValidator(fixtures.simpleSchema())

  describe "validateExpr", ->
    it "removes unnecessary aggr", ->
      expr = { type: "scalar", baseTableId: "t1", joinIds: [], expr: { type: "field", tableId: "t1", columnId: "text" }, aggr: "sum" }
      @dv.validateExpr(expr)
      assert not expr.aggr

    it "adds first aggr", ->
      expr = { type: "scalar", baseTableId: "t1", joinIds: ['1-2'], expr: { type: "field", tableId: "t2", columnId: "text" } }
      @dv.validateExpr(expr)
      assert.equal expr.aggr, "count"

    it "removes invalid aggr, selecting first", ->
      expr = { type: "scalar", baseTableId: "t1", joinIds: ['1-2'], expr: { type: "field", tableId: "t2", columnId: "text" }, aggr: "sum" }
      @dv.validateExpr(expr)
      assert.equal expr.aggr, "count"
  

  # describe "defaultExpr", ->