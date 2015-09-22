assert = require('chai').assert
_ = require 'lodash'
Schema = require '../src/Schema'
canonical = require 'canonical-json'

compare = (actual, expected) ->
  assert.equal canonical(actual), canonical(expected)

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
        contents: [
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

  it "loads from JSON object with structure", ->
    schema = new Schema()
    schema.loadFromJSON({
      tables: [{
        id: "a"
        name: "A"
        contents: [
          { 
            type: "section"
            name: "S1"
            contents: [
              {
                id: "x"
                name: "X"
                type: "text"
              }
            ]
          }
        ]
      }]
    })

    compare(schema.getColumns("a"), [
        {
          id: "x"
          name: "X"
          type: "text"
        }
    ])

    compare(schema.getTable("a").structure, [
      { 
        type: "section" 
        name: "S1"
        contents: [
          { type: "column", column: "x" }
        ]
      }
    ])
    
  describe "parseStructureFromText", ->
    it "parse flat structure", ->
      structure = Schema.parseStructureFromText('''
a
b
c  
        ''')
      assert.deepEqual structure, [
        { type: "column", column: "a" }
        { type: "column", column: "b" }
        { type: "column", column: "c" }
      ]

    it "loads sections", ->
      structure = Schema.parseStructureFromText('''
a
+b
  c some comment
  d
e
        ''')
      assert _.isEqual(structure, [
        { type: "column", column: "a" }
        { type: "section", name: "b", contents: [
          { type: "column", column: "c" }
          { type: "column", column: "d" }
          ]}
        { type: "column", column: "e" }
      ]), JSON.stringify(structure, null, 2)
