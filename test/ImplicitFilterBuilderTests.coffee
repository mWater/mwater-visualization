_ = require 'lodash'
assert = require('chai').assert
fixtures = require './fixtures'
ImplicitFilterBuilder = require '../src/ImplicitFilterBuilder'
canonical = require 'canonical-json'

compare = (actual, expected) ->
  assert.equal canonical(actual), canonical(expected), "\n" + canonical(actual) + "\n" + canonical(expected) + "\n"

describe "ImplicitFilterBuilder", ->
  before ->
    @schema = fixtures.simpleSchema()
    @builder = new ImplicitFilterBuilder(@schema)

  it "finds n-1 join if both present", ->
    joins = @builder.findJoins(["t1", "t2"])
    compare joins, [{ table: "t2", column: "2-1" }]

  it "finds nothing if one present", ->
    joins = @builder.findJoins(["t1"])
    compare joins, []

    joins = @builder.findJoins(["t2"])
    compare joins, []

  it "extends filter", ->
    filters = [{ table: "t1", jsonql: { type: "op", op: "=", exprs: [{ type: "field", tableAlias: "{alias}", column: "number"}, 3] } }]

    extFilters = @builder.extendFilters(["t1", "t2"], filters)

    compare extFilters, [
      { table: "t1", jsonql: { type: "op", op: "=", exprs: [{ type: "field", tableAlias: "{alias}", column: "number"}, 3] } }
      # Uses exists where
      {
        table: "t2"
        jsonql: {
          type: "op"
          op: "exists"
          exprs: [
            { 
              type: "query"
              selects: []
              from: { type: "table", table: "t1", alias: "explicit" }
              where: {
                type: "op"
                op: "and"
                exprs: [
                  # Join
                  { type: "op", op: "=", exprs: [{ type: "field", tableAlias: "explicit", column: "primary"}, { type: "field", tableAlias: "{alias}", column: "t1"}]}
                  # Filter
                  { type: "op", op: "=", exprs: [{ type: "field", tableAlias: "explicit", column: "number"}, 3] }
                ]
              }
            }
          ]
        }
      }
    ]

  it "unifies multiple filters"
