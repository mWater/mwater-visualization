assert = require('chai').assert
_ = require 'lodash'
Schema = require '../src/Schema'

describe "Schema", ->
  it "adds and gets tables", ->
    schema = new Schema()
    schema.addTable({ id: "a", name: "A", desc: "a table", icon: "pencil" })
    assert.equal schema.getTables()[0].id, "a"
    assert.equal schema.getTables()[0].name, "A"
    assert.equal schema.getTables()[0].desc, "a table"
    assert.equal schema.getTables()[0].icon, "pencil"

  it "adds and gets columns", ->
    schema = new Schema()
    schema.addTable({ id: "a" })
    schema.addColumn("a", { id: "x", name: "X", desc: "xx", type: "enum", values: [{ id: "q", name: "Q" }], primary: true })

    assert.equal schema.getColumns("a")[0].id, "x"
    assert.equal schema.getColumns("a")[0].name, "X"
    assert.equal schema.getColumns("a")[0].desc, "xx"
    assert.equal schema.getColumns("a")[0].type, "enum"
    assert.isTrue schema.getColumns("a")[0].primary
    assert.deepEqual schema.getColumns("a")[0].values, [{ id: "q", name: "Q" }]

  it "adds and gets joins", ->
    schema = new Schema()
    schema.addTable({ id: "a" })
    schema.addColumn("a", { id: "x", type: "uuid" })

    schema.addTable({ id: "b" })
    schema.addColumn("b", { id: "y", type: "uuid" })

    join = { id: "ab", name: "AB", fromTableId: "a", fromColumnId: "x", toTableId: "b", toColumnId: "y", op: "=", oneToMany: true }
    schema.addJoin(join)
    assert.deepEqual schema.getJoins()[0], join

  describe "with schema", ->
    before ->
      # Create simple schema with subtree
      @schema = new Schema()
      @schema.addTable({ id: "a", name: "A" })
      @schema.addColumn("a", { id: "x", name: "X", type: "uuid", primary: true })
      @schema.addColumn("a", { id: "y", name: "Y", type: "text" })
      @schema.addColumn("a", { id: "z", name: "Z", type: "integer" })

      @schema.addTable({ id: "b", name: "B" })
      @schema.addColumn("b", { id: "q", name: "Q", type: "uuid", primary: true })
      @schema.addColumn("b", { id: "r", name: "R", type: "text" })
      @schema.addColumn("b", { id: "s", name: "S", type: "uuid" }) # a ref
      @schema.addColumn("b", { id: "t", name: "T", type: "enum", values: [{ id: "a1", name: "A1"}, { id: "a2", name: "A2"}] })

      @schema.addJoin({ id: "ab", name: "AB", fromTableId: "a", fromColumnId: "x", toTableId: "b", toColumnId: "s", op: "=", oneToMany: true })
      @schema.addJoin({ id: "ba", name: "BA", fromTableId: "b", fromColumnId: "s", toTableId: "a", toColumnId: "x", op: "=", oneToMany: false })

      @atree = @schema.getJoinExprTree({ baseTableId: "a" })
      @btree = @schema.getJoinExprTree({ baseTableId: "b" })
    
    describe "getExprValues", ->
      it "gets for field", ->
        expr = { type: "field", tableId: "b", columnId: "t" }
        assert.deepEqual _.pluck(@schema.getExprValues(expr), "id"), ["a1", "a2"]

      it "gets for scalar", ->
        expr = { type: "field", tableId: "b", columnId: "t" }
        expr = { type: "scalar", expr: expr, joinIds: []}
        assert.deepEqual _.pluck(@schema.getExprValues(expr), "id"), ["a1", "a2"]
    
    describe "getJoinExprTree", ->
      it "doesn't include primary keys at root", ->
        assert.equal @atree[0].name, "Y"

      it "skips uuids", ->
        assert.isUndefined _.findWhere(@btree, name: "S")

      it "includes primary key as count", ->
        joinItem = _.last(@atree)
        subtree = joinItem.getChildren()
        assert.equal subtree[0].name, "Number of B"

      it "has joins list", ->
        assert.deepEqual @atree[0].value.joinIds, []

      it "has field expressions for leaf nodes", ->
        assert.deepEqual @atree[0].value.expr, { type: "field", tableId: "a", columnId: "y" }

      it "joins are inserted at end", ->
        assert.equal _.last(@btree).name, "BA"

      it "gets children for joins", ->
        joinItem = _.last(@atree)
        assert joinItem.getChildren().length > 0
        assert.deepEqual joinItem.getChildren()[0].value.joinIds, ["ab"]

      it "has no field expressions for joins", ->
        joinItem = _.last(@atree)
        assert not joinItem.expr

      it "filters by types", ->
        atree = @schema.getJoinExprTree({ baseTableId: "a", types: ["integer"] })
        assert.isUndefined _.findWhere(atree, name: "Y")
        assert.isDefined _.findWhere(atree, name: "Z")

    describe "getExprType", ->
      it 'gets field type', ->
        assert.equal @schema.getExprType({ type: "field", tableId: "a", columnId: "z" }), "integer"

      it 'gets scalar type', ->
        expr = {
          type: "scalar"
          expr: { type: "field", tableId: "a", columnId: "z" }
          joinIds: []
        }
        assert.equal @schema.getExprType(expr), "integer"

      it "gets literal types", ->
        assert.equal @schema.getExprType({ type: "text", value: "x" }), "text"
        assert.equal @schema.getExprType({ type: "boolean", value: true }), "boolean"
        assert.equal @schema.getExprType({ type: "decimal", value: 2.23 }), "decimal"
        assert.equal @schema.getExprType({ type: "integer", value: 34 }), "integer"

    describe "getAggrs", ->
      it "includes latest if has natural ordering", ->
        schema = new Schema()
        schema.addTable({ id: "a", name: "A", ordering: "z" })
        schema.addColumn("a", { id: "x", name: "X", type: "uuid", primary: true })
        schema.addColumn("a", { id: "y", name: "Y", type: "text" })
        schema.addColumn("a", { id: "z", name: "Z", type: "integer" })

        field = { type: "field", tableId: "a", columnId: "y" }
        assert.equal _.findWhere(schema.getAggrs(field), id: "last").type, "text"

      it "doesn't include most recent normally", ->
        field = { type: "field", tableId: "a", columnId: "z" }
        assert.isUndefined _.findWhere(@schema.getAggrs(field), id: "last")

      it "includes count for text", ->
        field = { type: "field", tableId: "a", columnId: "y" }
        aggrs = @schema.getAggrs(field)

        assert.equal _.findWhere(aggrs, id: "count").type, "integer"
        assert.isUndefined _.findWhere(aggrs, id: "sum")
        assert.isUndefined _.findWhere(aggrs, id: "avg")

      it "includes sum, avg, etc for integer, decimal", ->
        field = { type: "field", tableId: "a", columnId: "z" }
        aggrs = @schema.getAggrs(field)

        assert.equal _.findWhere(aggrs, id: "sum").type, "integer"
        assert.equal _.findWhere(aggrs, id: "avg").type, "decimal"
        # TODO etc

    describe "isAggrNeeded", ->
      it "false for no joins", ->
        assert.isFalse @schema.isAggrNeeded([])

      it "true for oneToMany join", ->
        assert.isTrue @schema.isAggrNeeded(["ab"])

      it "false for non-oneToMany join", ->
        assert.isFalse @schema.isAggrNeeded(["ba"])

    describe "summarizeExpr", ->
      it "summarizes null", ->
        assert.equal @schema.summarizeExpr(null), "None"

      it "summarizes field expr", ->
        expr = { type: "field", tableId: "a", columnId: "y" }
        assert.equal @schema.summarizeExpr(expr), "Y"

      it "summarizes simple scalar expr", ->
        fieldExpr = { type: "field", tableId: "a", columnId: "y" }
        scalarExpr = { type: "scalar", expr: fieldExpr, joinIds: [] }
        assert.equal @schema.summarizeExpr(scalarExpr), "Y"

      it "summarizes simple scalar expr", ->
        fieldExpr = { type: "field", tableId: "a", columnId: "y" }
        scalarExpr = { type: "scalar", baseTableId: "a", expr: fieldExpr, joinIds: [] }
        assert.equal @schema.summarizeExpr(scalarExpr), "Y"

      it "summarizes joined scalar expr", ->
        fieldExpr = { type: "field", tableId: "a", columnId: "y" }
        scalarExpr = { type: "scalar", baseTableId: "b", expr: fieldExpr, joinIds: ['ba'] }
        assert.equal @schema.summarizeExpr(scalarExpr), "Y of BA"

      it "summarizes joined aggr scalar expr", ->
        fieldExpr = { type: "field", tableId: "b", columnId: "r" }
        scalarExpr = { type: "scalar", baseTableId: "a", expr: fieldExpr, joinIds: ['ab'], aggr: "count" }
        assert.equal @schema.summarizeExpr(scalarExpr), "Number R of AB"

  describe "getComparisonOps", ->
    it "includes is not null", ->
      schema = new Schema()
      assert.include _.pluck(schema.getComparisonOps("text"), "id"), "is not null" 

  describe "getComparisonRhsType", ->
    before ->
      @schema = new Schema()
    
    it "null for unary", ->
      assert.isNull @schema.getComparisonRhsType("text", "is not null")

    it "same for binary", ->
      assert.equal @schema.getComparisonRhsType("decimal", "="), "decimal"
  