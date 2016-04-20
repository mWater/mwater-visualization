_ = require 'lodash'
assert = require('chai').assert
fixtures = require './fixtures'
DatagridUtils = require '../src/datagrids/DatagridUtils'
canonical = require 'canonical-json'

compare = (actual, expected) ->
  assert.equal canonical(actual), canonical(expected), "\n" + canonical(actual) + "\n" + canonical(expected)

describe "DatagridUtils", ->
  before ->
    @schema = fixtures.simpleSchema()
    @datagridUtils = new DatagridUtils(@schema)

    @exprNumber = { type: "field", table: "t1", column: "number" }
    @exprText = { type: "field", table: "t1", column: "text" }
    @exprDate = { type: "field", table: "t1", column: "date" }
    @exprEnum = { type: "field", table: "t1", column: "enum" }
    @exprInvalid = { type: "field", table: "t1", column: "NONSUCH" }

  describe "cleanDesign", ->
    it "strips if table gone", ->
      design = {
        table: "NONSUCH"
        columns: [
          { id: "c1", width: 20, type: "expr", label: null, expr: @exprNumber }
        ]
      }

      assert.deepEqual @datagridUtils.cleanDesign(design), {}

    it "leaves valid columns alone", ->
      design = {
        table: "t1"
        columns: [
          { id: "c1", width: 20, type: "expr", label: null, expr: @exprNumber }
        ]
      }

      assert.equal @datagridUtils.cleanDesign(design).columns.length, 1

    it "cleans invalid columns", ->
      design = {
        table: "t1"
        columns: [
          { id: "c1", width: 20, type: "expr", label: null, expr: @exprInvalid }
        ]
      }

      assert.equal @datagridUtils.cleanDesign(design).columns.length, 1
      assert not @datagridUtils.cleanDesign(design).columns[0].expr
