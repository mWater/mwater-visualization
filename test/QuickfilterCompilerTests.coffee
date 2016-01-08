assert = require('chai').assert
fixtures = require './fixtures'
_ = require 'lodash'
QuickfilterCompiler = require '../src/quickfilter/QuickfilterCompiler'
canonical = require 'canonical-json'

compare = (actual, expected) ->
  assert.equal canonical(actual), canonical(expected)

describe "QuickfilterCompiler", ->
  before ->
    @schema = fixtures.simpleSchema()
    @qc = new QuickfilterCompiler(@schema)

  it "compiles filter", ->
    filters = @qc.compile([{ table: "t1", expr: { type: "field", table: "t1", column: "enum"}, label: "Enum" }], ["a"])
    compare(filters, [
      { 
        table: "t1"
        jsonql: { 
          type: "op"
          op: "="
          exprs: [
            { type: "field", tableAlias: "{alias}", column: "enum" }
            { type: "literal", value: "a" }
          ]
        }
      }
      ])

  it "ignores null values"