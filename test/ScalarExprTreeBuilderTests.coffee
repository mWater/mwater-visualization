assert = require('chai').assert
_ = require 'lodash'
ScalarExprTreeBuilder = require '../src/ScalarExprTreeBuilder'
Schema = require '../src/Schema'

describe "ScalarExprTreeBuilder", ->
  beforeEach ->
    @schema = new Schema()
      .addTable({ id: "t1", name: "T1" })
      .addColumn("t1", { id: "c1", name: "C1", type: "text" })
      .addTable({ id: "t2", name: "T2" })
      .addColumn("t2", { id: "c1", name: "C1", type: "text" })

  it "returns all tables", ->
    nodes = new ScalarExprTreeBuilder(@schema).getTree()
    assert.deepEqual _.pluck(nodes, "name"), ["T1", "T2"]

  it "returns columns", ->
    nodes = new ScalarExprTreeBuilder(@schema).getTree()
    subnodes = nodes[0].children()
    assert.deepEqual _.pluck(subnodes, "name"), ["C1"]
    assert _.isEqual(subnodes[0].expr, { table: "t1", path: ["c1"]}), JSON.stringify(subnodes[0].expr)

  it "follows joins", ->
    # Join column
    join = { fromTable: "t1", fromCol: "c1", toTable: "t2", toCol: "c1", op: "=", multiple: false }
    @schema.addColumn("t1", { id: "c2", name: "C2", type: "join", join: join })

    nodes = new ScalarExprTreeBuilder(@schema).getTree()
    # Go to first table, 2nd child
    subnode = nodes[0].children()[1]

    assert _.isEqual(subnode.chidren()[0].expr, { table: "t1", path: ["c2", "c1"]})

  it "limits to one table", ->
    nodes = new ScalarExprTreeBuilder(@schema).getTree({ startTable: "t1" })
    assert.deepEqual _.pluck(nodes, "name"), ["T1"]

  # it "limits type"