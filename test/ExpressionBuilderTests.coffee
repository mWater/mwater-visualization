assert = require('chai').assert
_ = require 'lodash'
Schema = require '../src/Schema'
ExpressionBuilder = require '../src/ExpressionBuilder'
fixtures = require './fixtures'

describe "ExpressionBuilder", ->
  beforeEach ->
    @schema = new Schema()
      .addTable({ id: "t1", name: "T1" })
      .addColumn("t1", { id: "c1", name: "C1", type: "text" })
      .addTable({ id: "t2", name: "T2" })
      .addColumn("t2", { id: "c1", name: "C1", type: "integer" })

    # Join columns
    join = { fromTable: "t1", fromCol: "c1", toTable: "t2", toCol: "c1", op: "=", multiple: true }
    @schema.addColumn("t1", { id: "c2", name: "C2", type: "join", join: join })

    # Join columns
    join = { fromTable: "t2", fromCol: "c1", toTable: "t1", toCol: "c1", op: "=", multiple: false }
    @schema.addColumn("t2", { id: "c2", name: "C2", type: "join", join: join })

    @exprBuilder = new ExpressionBuilder(@schema)

  it "determines if multiple joins", ->
    assert.isTrue @exprBuilder.isMultipleJoins("t1", ["c2"])
    assert.isFalse @exprBuilder.isMultipleJoins("t2", ["c2"])

  it "follows joins", ->
    assert.equal @exprBuilder.followJoins("t1", []), "t1"
    assert.equal @exprBuilder.followJoins("t1", ["c2"]), "t2"
  
  describe "getAggrs", ->
    beforeEach ->
      @schema = new Schema()
        .addTable({ id: "a", name: "A", ordering: "z" })
        .addColumn("a", { id: "y", name: "Y", type: "text" })
        .addColumn("a", { id: "z", name: "Z", type: "integer" })
      @exprBuilder = new ExpressionBuilder(@schema)

    it "includes last if has natural ordering", ->
      field = { type: "field", table: "a", column: "y" }
      assert.equal _.findWhere(@exprBuilder.getAggrs(field), id: "last").type, "text"

    it "doesn't include most recent normally", ->
      @schema.addTable({ id: "b" }).addColumn("b", { id: "x", name: "X", type: "text" })
      field = { type: "field", table: "b", column: "x" }
      assert.isUndefined _.findWhere(@exprBuilder.getAggrs(field), id: "last")

    it "includes count for text", ->
      field = { type: "field", table: "a", column: "y" }
      aggrs = @exprBuilder.getAggrs(field)

      assert.equal _.findWhere(aggrs, id: "count").type, "integer"
      assert.isUndefined _.findWhere(aggrs, id: "sum")
      assert.isUndefined _.findWhere(aggrs, id: "avg")

    it "includes sum, avg, etc for integer, decimal", ->
      field = { type: "field", table: "a", column: "z" }
      aggrs = @exprBuilder.getAggrs(field)

      assert.equal _.findWhere(aggrs, id: "sum").type, "integer"
      assert.equal _.findWhere(aggrs, id: "avg").type, "decimal"
      # TODO etc

    it "includes count for null", ->
      aggrs = @exprBuilder.getAggrs(null)
      assert.equal aggrs[0].type, "integer"
      assert.equal aggrs[0].id, "count"

  describe "summarizeExpr", ->
    it "summarizes null", ->
      assert.equal @exprBuilder.summarizeExpr(null), "None"

    it "summarizes field expr", ->
      expr = { type: "field", table: "t1", column: "c1" }
      assert.equal @exprBuilder.summarizeExpr(expr), "C1"

    it "summarizes simple scalar expr", ->
      fieldExpr = { type: "field", table: "t1", column: "c1" }
      scalarExpr = { type: "scalar", table: "t1", joins: [], expr: fieldExpr }
      assert.equal @exprBuilder.summarizeExpr(scalarExpr), "C1"

    it "summarizes joined scalar expr", ->
      fieldExpr = { type: "field", table: "t2", column: "c1" }
      scalarExpr = { type: "scalar", table: "t1", joins: ['c2'], expr: fieldExpr }
      assert.equal @exprBuilder.summarizeExpr(scalarExpr), "C2 > C1"

    it "summarizes joined aggr scalar expr", ->
      fieldExpr = { type: "field", table: "t2", column: "c1" }
      scalarExpr = { type: "scalar", table: "t1", joins: ['c2'], expr: fieldExpr, aggr: "sum" }
      assert.equal @exprBuilder.summarizeExpr(scalarExpr), "Total of C2 > C1"

    it "simplifies when simple count", ->
      scalarExpr = { type: "scalar", table: "t1", joins: ['c2'], expr: null, aggr: "count" }
      assert.equal @exprBuilder.summarizeExpr(scalarExpr), "Number of C2"

  describe "getExprType", ->
    it 'gets field type', ->
      assert.equal @exprBuilder.getExprType({ type: "field", table: "t1", column: "c1" }), "text"

    it 'gets scalar type', ->
      expr = {
        type: "scalar"
        table: "t1"
        expr: { type: "field", table: "t1", column: "c1" }
        joins: []
      }
      assert.equal @exprBuilder.getExprType(expr), "text"

    it 'gets scalar type with aggr', ->
      expr = {
        type: "scalar"
        table: "t1"
        expr: { type: "field", table: "t2", column: "c1" }
        aggr: "avg"
        joins: ["c2"]
      }
      assert.equal @exprBuilder.getExprType(expr), "decimal"

    it "gets literal types", ->
      assert.equal @exprBuilder.getExprType({ type: "literal", valueType: "boolean", value: true }), "boolean"

  describe "cleanScalarExpr", ->
    it "leaves valid one alone", ->
      fieldExpr = { type: "field", table: "t2", column: "c1" }
      scalarExpr = { type: "scalar", table: "t1", joins: ['c2'], expr: fieldExpr, aggr: "sum" }

      assert.equal scalarExpr, @exprBuilder.cleanScalarExpr(scalarExpr)

    it "strips aggr if not needed", ->
      fieldExpr = { type: "field", table: "t2", column: "c1" }
      scalarExpr = { type: "scalar", table: "t1", joins: [], expr: fieldExpr, aggr: "sum" }
      scalarExpr = @exprBuilder.cleanScalarExpr(scalarExpr)
      assert not scalarExpr.aggr

    it "defaults aggr if needed and wrong", ->
      fieldExpr = { type: "field", table: "t2", column: "c1" }
      scalarExpr = { type: "scalar", table: "t1", joins: ['c2'], expr: fieldExpr, aggr: "latest" }
      scalarExpr = @exprBuilder.cleanScalarExpr(scalarExpr)
      assert.equal scalarExpr.aggr, "sum"

    it "strips where if wrong table", ->
      fieldExpr = { type: "field", table: "t2", column: "c1" }
      whereExpr = { type: "logical", table: "t1" }
      scalarExpr = { type: "scalar", table: "t1", joins: ['c2'], expr: fieldExpr, aggr: "sum" }
      scalarExpr = @exprBuilder.cleanScalarExpr(scalarExpr)
      assert.equal scalarExpr.aggr, "sum"
      assert not scalarExpr.where

  describe "cleanComparisonExpr", ->
    beforeEach ->
      @schema = fixtures.simpleSchema()
      @exprBuilder = new ExpressionBuilder(@schema)

    it "removes op if no lhs", ->
      expr = { type: "comparison", op: "=" }
      expr = @exprBuilder.cleanComparisonExpr(expr)
      assert not expr.op

    it "removes rhs if no op", ->
      expr = { type: "comparison", table: "t1", lhs: { type: "field", table: "t1", column: "text" }, rhs: { type: "literal", valueType: "text", value: "x" } }
      expr = @exprBuilder.cleanComparisonExpr(expr)
      assert not expr.rhs

    it "removes rhs if wrong type", ->
      expr = { type: "comparison", table: "t1", lhs: { type: "field", table: "t1", column: "text" }, op: "~*", rhs: { type: "literal", valueType: "text", value: "x" } }
      expr = @exprBuilder.cleanComparisonExpr(expr)
      assert expr.rhs, "should keep"

      expr = { type: "comparison", table: "t1", lhs: { type: "field", table: "t1", column: "text" }, op: "~*", rhs: { type: "literal", valueType: "integer", value: 3 } }
      expr = @exprBuilder.cleanComparisonExpr(expr)
      assert not expr.rhs, "should remove"

    it "removes rhs if invalid enum", ->
      expr = { type: "comparison", table: "t1", lhs: { type: "field", table: "t1", column: "enum" }, op: "=", rhs: { type: "literal", valueType: "enum", value: "a" } }
      expr = @exprBuilder.cleanComparisonExpr(expr)
      assert expr.rhs, "should keep"

      expr = { type: "comparison", table: "t1", lhs: { type: "field", table: "t1", column: "enum" }, op: "=", rhs: { type: "literal", valueType: "enum", value: "x" } }
      expr = @exprBuilder.cleanComparisonExpr(expr)
      assert not expr.rhs

    it "removes rhs if empty enum[]", ->
      expr = { type: "comparison", table: "t1", lhs: { type: "field", table: "t1", column: "enum" }, op: "= any", rhs: { type: "literal", valueType: "enum[]", value: ['a'] } }
      expr = @exprBuilder.cleanComparisonExpr(expr)
      assert expr.rhs, "should keep"

      expr = { type: "comparison", table: "t1", lhs: { type: "field", table: "t1", column: "enum" }, op: "= any", rhs: { type: "literal", valueType: "enum[]", value: [] } }
      expr = @exprBuilder.cleanComparisonExpr(expr)
      assert not expr.rhs

    it "defaults op", ->
      expr = { type: "comparison", table: "t1", lhs: { type: "field", table: "t1", column: "text" } }
      expr = @exprBuilder.cleanComparisonExpr(expr)
      assert.equal expr.op, "~*"

  describe "validateComparisonExpr", ->
    it "null for valid", ->
      expr = { type: "comparison", lhs: { type: "field", table: "t1", column: "c1" }, op: "~*", rhs: { type: "text", value: "x" } }
      assert.isNull @exprBuilder.validateComparisonExpr(expr)

    it "requires lhs", ->
      expr = { type: "comparison", op: "~*", rhs: { type: "text", value: "x" } }
      assert.isNotNull @exprBuilder.validateComparisonExpr(expr)

    it "requires op", ->
      expr = { type: "comparison", lhs: { type: "field", table: "t1", column: "c1" }, rhs: { type: "literal", valueType: "text", value: "x" } }
      assert.isNotNull @exprBuilder.validateComparisonExpr(expr)

    it "requires rhs if has type"
    it "requires rhs type to match"

  describe "validateLogicalExpr", ->
    it "checks all exprs"

  describe "validateScalarExpr", ->
    it "null for valid", ->
      fieldExpr = { type: "field", table: "t1", column: "c1" }
      scalarExpr = { type: "scalar", table: "t1", joins: [], expr: fieldExpr }
      assert.isNull @exprBuilder.validateScalarExpr(scalarExpr)

    it "validates expr", ->
      fieldExpr = { type: "field", table: "t1", column: "c1" }
      scalarExpr = { type: "scalar", table: "t1", joins: [], expr: null }
      assert.isNull @exprBuilder.validateScalarExpr(scalarExpr)

      scalarExpr = { type: "scalar", table: null, joins: [], expr: null }
      assert.isNotNull @exprBuilder.validateScalarExpr(scalarExpr)

    it "checks aggr" # No need, as will be cleaned and autofilled by cleaning
    it "validates where", ->
      fieldExpr = { type: "field", table: "t1", column: "c1" }
      whereExpr = { type: "logical", table: "t1", exprs: [
        { type: "comparison", table: "t1" }
        ]}
      scalarExpr = { type: "scalar", table: "t1", joins: [], expr: fieldExpr, where: whereExpr }
      assert.isNotNull @exprBuilder.validateScalarExpr(scalarExpr)

  describe "localizeExprLiteral", ->
    it "stringifies decimal", ->
      @schema.addColumn("t1", { id: "decimal", name: "Decimal", type: "decimal" })
      str = @exprBuilder.localizeExprLiteral({ type: "field", table: "t1", column: "decimal" }, 2.34)
      assert.equal str, "2.34"

    it "stringifies null", ->
      @schema.addColumn("t1", { id: "decimal", name: "Decimal", type: "decimal" })
      str = @exprBuilder.localizeExprLiteral({ type: "field", table: "t1", column: "decimal" }, null)
      assert.equal str, "null"

    it "looks up enum", ->
      @schema.addColumn("t1", { id: "enum", name: "Enum", type: "enum", values: [{ id: "a", name: "A" }] })
      str = @exprBuilder.localizeExprLiteral({ type: "field", table: "t1", column: "enum" }, "a")
      assert.equal str, "A"

    it "handles null enum", ->
      @schema.addColumn("t1", { id: "enum", name: "Enum", type: "enum", values: [{ id: "a", name: "A" }] })
      str = @exprBuilder.localizeExprLiteral({ type: "field", table: "t1", column: "enum" }, null)
      assert.equal str, "null"

    it "handles invalid enum", ->
      @schema.addColumn("t1", { id: "enum", name: "Enum", type: "enum", values: [{ id: "a", name: "A" }] })
      str = @exprBuilder.localizeExprLiteral({ type: "field", table: "t1", column: "enum" }, "xyz")
      assert.equal str, "???"
