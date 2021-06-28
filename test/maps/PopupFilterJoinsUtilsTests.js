_ = require 'lodash'
assert = require('chai').assert
fixtures = require '../fixtures'

PopupFilterJoinsUtils = require '../../src/maps/PopupFilterJoinsUtils'

canonical = require 'canonical-json'
compare = (actual, expected) ->
  assert.equal canonical(actual), canonical(expected), "\n" + canonical(actual) + "\n" + canonical(expected) + "\n"

describe "PopupFilterJoinsUtils", ->
  before ->
    @schema = fixtures.simpleSchema()

  it "compiles default", ->
    popupFilterJoins = PopupFilterJoinsUtils.createDefaultPopupFilterJoins("t1")
    filters = PopupFilterJoinsUtils.createPopupFilters(popupFilterJoins, @schema, "t1", "abc")

    compare(filters, [
      {
        table: "t1"
        jsonql: { type: "op", op: "=", exprs: [
          { type: "field", tableAlias: "{alias}", column: "primary" }
          { type: "literal", value: "abc" }
        ]}
    }])

  it "compiles id join", ->
    popupFilterJoins = {
      t2: { table: "t2", type: "field", column: "2-1" }
    }
    filters = PopupFilterJoinsUtils.createPopupFilters(popupFilterJoins, @schema, "t1", "abc")

    compare(filters, [
      {
        table: "t2"
        jsonql: { type: "op", op: "=", exprs: [
          { type: "field", tableAlias: "{alias}", column: "t1" }
          { type: "literal", value: "abc" }
        ]}
    }])

  it "compiles id[] join", ->
    popupFilterJoins = {
      t1: { table: "t1", type: "field", column: "1-2" }
    }
    filters = PopupFilterJoinsUtils.createPopupFilters(popupFilterJoins, @schema, "t2", "abc")

    compare(filters, [
      {
        table: "t1"
        jsonql: { type: "op", op: "@>", exprs: [
          {
            type: "scalar"
            expr: { 
              type: "op"
              op: "to_jsonb"
              exprs: [
                { 
                  type: "op"
                  op: "array_agg"
                  exprs: [
                    {"column":"primary","tableAlias":"inner","type":"field"}
                  ]
                }
              ]
            }
            from: {"alias":"inner","table":"t2","type":"table"}
            where: {"exprs":[{"column":"t1","tableAlias":"inner","type":"field"},{"column":"primary","tableAlias":"{alias}","type":"field"}],"op":"=","type":"op"}
            limit: 1
          }
          { type: "op", op: "::jsonb", exprs: [{ type: "literal", value: '["abc"]' }] }
        ]}
    }])
