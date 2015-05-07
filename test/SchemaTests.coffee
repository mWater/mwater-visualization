assert = require('chai').assert

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

    join = { id: "ab", name: "AB", fromTableId: "a", fromColumnId: "x", toTableId: "b", toColumnId: "y", op: "=", multiple: true }
    schema.addJoin(join)
    assert.deepEqual schema.getJoins()[0], join
  
  describe "tree", ->
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

      @schema.addJoin({ id: "ab", name: "AB", fromTableId: "a", fromColumnId: "x", toTableId: "b", toColumnId: "s", op: "=", multiple: true })
      @schema.addJoin({ id: "ba", name: "BA", fromTableId: "b", fromColumnId: "s", toTableId: "a", toColumnId: "x", op: "=", multiple: false })

      @atree = @schema.getJoinExprTree({ baseTableId: "a" })
      @btree = @schema.getJoinExprTree({ baseTableId: "b" })
      
    it "doesn't include primary keys at root", ->
      assert.equal @atree[0].name, "Y"

    it "skips uuids", ->
      assert.isUndefined _.findWhere(@btree, name: "S")

    it "includes primary key as count", ->
      joinItem = _.last(@atree)
      subtree = joinItem.getChildren()
      assert.equal subtree[0].name, "Number of B"

    it "has joins list", ->
      assert.deepEqual @atree[0].joinIds, []

    it "has field expressions for leaf nodes", ->
      assert.deepEqual @atree[0].expr, { type: "field", tableId: "a", columnId: "y" }

    it "joins are inserted at end", ->
      assert.equal _.last(@btree).name, "BA"

    it "gets children for joins", ->
      joinItem = _.last(@atree)
      assert joinItem.getChildren().length > 0
      assert.deepEqual joinItem.getChildren()[0].joinIds, ["ab"]

    it "has no field expressions for joins", ->
      joinItem = _.last(@atree)
      assert not joinItem.expr

    it "filters by types", ->
      atree = @schema.getJoinExprTree({ baseTableId: "a", types: ["integer"] })
      assert.isUndefined _.findWhere(atree, name: "Y")
      assert.isDefined _.findWhere(atree, name: "Z")