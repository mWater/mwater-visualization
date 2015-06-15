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
  
  describe "getAggrs", ->
    beforeEach ->
      @schema = new Schema()
        .addTable({ id: "a", name: "A", ordering: "z" })
        .addColumn("a", { id: "x", name: "X", type: "id" })
        .addColumn("a", { id: "y", name: "Y", type: "text" })
        .addColumn("a", { id: "z", name: "Z", type: "integer" })
      @exprBuilder = new ExpressionBuilder(@schema)

    it "includes last if has natural ordering and is not id", ->
      field = { type: "field", table: "a", column: "y" }
      assert.equal _.findWhere(@exprBuilder.getAggrs(field), id: "last").type, "text"

      field = { type: "field", table: "a", column: "x" }
      assert not _.findWhere(@exprBuilder.getAggrs(field), id: "last")

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

  describe "summarizeExpr", ->
    it "summarizes null", ->
      assert.equal @exprBuilder.summarizeExpr(null), "None"

    it "summarizes field expr", ->
      expr = { type: "field", table: "t1", column: "c1" }
      assert.equal @exprBuilder.summarizeExpr(expr), "C1"

    it "summarizes simple scalar expr", ->
      fieldExpr = { type: "field", table: "t1", column: "c1" }
      scalarExpr = { type: "scalar", table: "t1", joins: [], expr: fieldExpr }
      assert.equal @exprBuilder.summarizeExpr(scalarExpr), "T1 > C1"

    it "summarizes joined scalar expr", ->
      fieldExpr = { type: "field", table: "t2", column: "c1" }
      scalarExpr = { type: "scalar", table: "t1", joins: ['c2'], expr: fieldExpr }
      assert.equal @exprBuilder.summarizeExpr(scalarExpr), "T1 > C2 > C1"

    it "summarizes joined aggr scalar expr", ->
      fieldExpr = { type: "field", table: "t2", column: "c1" }
      scalarExpr = { type: "scalar", table: "t1", joins: ['c2'], expr: fieldExpr, aggr: "sum" }
      assert.equal @exprBuilder.summarizeExpr(scalarExpr), "Sum of T1 > C2 > C1"

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
      assert.isNotNull @exprBuilder.validateScalarExpr(scalarExpr)

    it "checks aggr" # No need, as will be cleaned and autofilled by cleaning
    it "validates where", ->
      fieldExpr = { type: "field", table: "t1", column: "c1" }
      whereExpr = { type: "logical", table: "t1", exprs: [
        { type: "comparison", table: "t1" }
        ]}
      scalarExpr = { type: "scalar", table: "t1", joins: [], expr: fieldExpr, where: whereExpr }
      assert.isNotNull @exprBuilder.validateScalarExpr(scalarExpr)

#   describe "with sample schema", ->
#     before ->
#       # Create simple schema with subtree
#       @schema = new Schema()
#       @schema.addTable({ id: "a", name: "A" })
#       @schema.addColumn("a", { id: "x", name: "X", type: "key" })
#       @schema.addColumn("a", { id: "y", name: "Y", type: "text" })
#       @schema.addColumn("a", { id: "z", name: "Z", type: "integer" })
#       @schema.addColumn("a", { id: "s", name: "S", type: "join", 
#         join: { fromTable: "b", fromColumn: "s", toTable: "a", toColumn: "x", op: "=", multiple: false
#        }) # a many to one join

#       @schema.addTable({ id: "b", name: "B" })
#       @schema.addColumn("b", { id: "q", name: "Q", type: "key" })
#       @schema.addColumn("b", { id: "r", name: "R", type: "text" })
#       @schema.addColumn("b", { id: "s", name: "S", type: "join", 
#         join: { fromTable: "b", fromColumn: "s", toTable: "a", toColumn: "x", op: "=", multiple: false
#        }) # a many to one join
#       @schema.addColumn("b", { id: "t", name: "T", type: "enum", values: [{ id: "a1", name: "A1"}, { id: "a2", name: "A2"}] })

#       @schema.addJoin({ id: "ab", name: "AB", fromTableId: "a", fromColumnId: "x", toTableId: "b", toColumnId: "s", op: "=", oneToMany: true })
#       @schema.addJoin({ id: "ba", name: "BA", fromTableId: "b", fromColumnId: "s", toTableId: "a", toColumnId: "x", op: "=", oneToMany: false })

#       @atree = @schema.getJoinExprTree({ baseTableId: "a" })
#       @btree = @schema.getJoinExprTree({ baseTableId: "b" })
    
#     describe "getExprValues", ->
#       it "gets for field", ->
#         expr = { type: "field", tableId: "b", columnId: "t" }
#         assert.deepEqual _.pluck(@schema.getExprValues(expr), "id"), ["a1", "a2"]

#       it "gets for scalar", ->
#         expr = { type: "field", tableId: "b", columnId: "t" }
#         expr = { type: "scalar", expr: expr, joinIds: []}
#         assert.deepEqual _.pluck(@schema.getExprValues(expr), "id"), ["a1", "a2"]
    
#     describe "getJoinExprTree", ->
#       it "doesn't include primary keys at root", ->
#         assert.equal @atree[0].name, "Y"

#       it "skips uuids", ->
#         assert.isUndefined _.findWhere(@btree, name: "S")

#       it "includes primary key as count", ->
#         joinItem = _.last(@atree)
#         subtree = joinItem.getChildren()
#         assert.equal subtree[0].name, "Number of B"

#       it "has joins list", ->
#         assert.deepEqual @atree[0].value.joinIds, []

#       it "has field expressions for leaf nodes", ->
#         assert.deepEqual @atree[0].value.expr, { type: "field", tableId: "a", columnId: "y" }

#       it "joins are inserted at end", ->
#         assert.equal _.last(@btree).name, "BA"

#       it "gets children for joins", ->
#         joinItem = _.last(@atree)
#         assert joinItem.getChildren().length > 0
#         assert.deepEqual joinItem.getChildren()[0].value.joinIds, ["ab"]

#       it "has no field expressions for joins", ->
#         joinItem = _.last(@atree)
#         assert not joinItem.expr

#       it "filters by types", ->
#         atree = @schema.getJoinExprTree({ baseTableId: "a", types: ["integer"] })
#         assert.isUndefined _.findWhere(atree, name: "Y")
#         assert.isDefined _.findWhere(atree, name: "Z")

#     describe "getExprType", ->
#       it 'gets field type', ->
#         assert.equal @schema.getExprType({ type: "field", tableId: "a", columnId: "z" }), "integer"

#       it 'gets scalar type', ->
#         expr = {
#           type: "scalar"
#           expr: { type: "field", tableId: "a", columnId: "z" }
#           joinIds: []
#         }
#         assert.equal @schema.getExprType(expr), "integer"

#       it 'gets scalar type with aggr', ->
#         expr = {
#           type: "scalar"
#           expr: { type: "field", tableId: "a", columnId: "x" }
#           aggrId: "count"
#           joinIds: []
#         }
#         assert.equal @schema.getExprType(expr), "integer"

#       it "gets literal types", ->
#         assert.equal @schema.getExprType({ type: "text", value: "x" }), "text"
#         assert.equal @schema.getExprType({ type: "boolean", value: true }), "boolean"
#         assert.equal @schema.getExprType({ type: "decimal", value: 2.23 }), "decimal"
#         assert.equal @schema.getExprType({ type: "integer", value: 34 }), "integer"
#         assert.equal @schema.getExprType({ type: "date", value: "2010-07-28" }), "date"

#     describe "isAggrNeeded", ->
#       it "false for no joins", ->
#         assert.isFalse @schema.isAggrNeeded([])

#       it "true for oneToMany join", ->
#         assert.isTrue @schema.isAggrNeeded(["ab"])

#       it "false for non-oneToMany join", ->
#         assert.isFalse @schema.isAggrNeeded(["ba"])


#   describe "getComparisonOps", ->
#     it "includes is not null", ->
#       schema = new Schema()
#       assert.include _.pluck(schema.getComparisonOps("text"), "id"), "is not null" 

#     it "includes > for date", ->
#       schema = new Schema()
#       assert.include _.pluck(schema.getComparisonOps("date"), "id"), ">" 

#   describe "getComparisonRhsType", ->
#     before ->
#       @schema = new Schema()
    
#     it "null for unary", ->
#       assert.isNull @schema.getComparisonRhsType("text", "is not null")

#     it "same for binary", ->
#       assert.equal @schema.getComparisonRhsType("decimal", "="), "decimal"
#   