PopupFilterJoinsUtils = require '../../src/maps/PopupFilterJoinsUtils'

_ = require 'lodash'
assert = require('chai').assert

MapUtils = require '../../src/maps/MapUtils'

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
          { type: "field", tableAlias: "{alias}", column: "id" }
          { type: "literal", value: "abc" }
        ]}
    }])
