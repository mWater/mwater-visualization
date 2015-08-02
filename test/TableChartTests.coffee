_ = require 'lodash'
assert = require('chai').assert
fixtures = require './fixtures'
TableChart = require '../src/TableChart'

compare = (actual, expected) ->
  assert _.isEqual(actual, expected), JSON.stringify(actual, null, 2)

describe "TableChart", ->
  before ->
    @schema = fixtures.simpleSchema()
    @chart = new TableChart(schema: @schema)

    @exprDecimal = { type: "field", table: "t1", column: "decimal" }
    @exprInteger = { type: "field", table: "t1", column: "integer" }
    @exprText = { type: "field", table: "t1", column: "text" }
    @exprDate = { type: "field", table: "t1", column: "date" }
    @exprEnum = { type: "field", table: "t1", column: "enum" }

  describe "getQueries", ->
    it "includes _id if no grouping", ->
      design = {
        table: "t1"
        columns: [
          expr: @exprText
        ]
      }

      



    it "does not group if no aggr"
    it "groups all non-aggr"

  describe "cleanDesign", ->
    it "cleans column expressions"
    it "removes invalid aggrs"

  describe "validateDesign", ->
    it "allows valid design"
    it "validates column expressions"

