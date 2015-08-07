_ = require 'lodash'
assert = require('chai').assert
fixtures = require './fixtures'
CsvBuilder = require '../src/CsvBuilder'

compare = (actual, expected) ->
  assert _.isEqual(actual, expected) or JSON.stringify(actual) == JSON.stringify(expected), "\n" + JSON.stringify(actual) + "\n" + JSON.stringify(expected)

describe "CsvBuilder", ->
  it "handles mixed data types", ->
    table = [
      ["a", 1, 4.5]
      [3.2, 4, "b", "x"]
    ]
    csv = new CsvBuilder().build(table)
    expectedCsv = "a,1,4.5\r\n3.2,4,b,x"
    assert.equal csv, expectedCsv
