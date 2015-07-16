assert = require('chai').assert
_ = require 'lodash'
Schema = require '../src/Schema'

describe "Schema", ->
  it "adds and gets tables", ->
    schema = new Schema()
    schema.addTable({ id: "a", name: "A", desc: "a table" })
    assert.equal schema.getTables()[0].id, "a"
    assert.equal schema.getTables()[0].name, "A"
    assert.equal schema.getTables()[0].desc, "a table"

  it "adds and gets columns", ->
    schema = new Schema()
    schema.addTable({ id: "a" })
    schema.addColumn("a", { id: "x", name: "X", desc: "xx", type: "enum", values: [{ id: "q", name: "Q" }]})

    assert.equal schema.getColumns("a")[0].id, "x"
    assert.equal schema.getColumns("a")[0].name, "X"
    assert.equal schema.getColumns("a")[0].desc, "xx"
    assert.equal schema.getColumns("a")[0].type, "enum"
    assert.deepEqual schema.getColumns("a")[0].values, [{ id: "q", name: "Q" }]

  it "loads from JSON object", ->
    schema = new Schema()
    schema.loadFromJSON({
      tables: [{
        id: "a"
        name: "A"
        columns: [
          { # Ignored
            id: "id"
            name: "ID"
            type: "id"
          },
          {
            id: "x"
            name: "X"
            type: "text"
          }
        ]
      }]
      })

    assert.equal schema.getColumns("a")[0].id, "x"
    assert.equal schema.getColumns("a")[0].name, "X"

