assert = require('chai').assert
fixtures = require '../../../fixtures'
_ = require 'lodash'

PivotChart = require '../../../../src/widgets/charts/pivot/PivotChart'

canonical = require 'canonical-json'
compare = (actual, expected) ->
  assert.equal canonical(actual), canonical(expected), "\n" + canonical(actual) + "\n" + canonical(expected) + "\n"

describe "PivotChart", ->
  before ->
    @schema = fixtures.simpleSchema()

    @pc = new PivotChart()
    @exprNumber = { type: "field", table: "t1", column: "number" }
    @exprText = { type: "field", table: "t1", column: "text" }
    @exprEnum = { type: "field", table: "t1", column: "enum" }

    @axisNumber = { expr: @exprNumber }
    @axisCount = { expr: { type: "op", op: "count", table: "t1", exprs: [] } }
    @axisNumberSum = { expr: { type: "op", op: "sum", table: "t1", exprs: [@exprNumber] }}
    @axisEnum = { expr: @exprEnum } 
    @axisText = { expr: @exprText } 

  describe "cleanDesign", ->
    it "adds missing intersections as counts", ->
      design = {
        table: "t1"
        rows: [{ id: "row1"}]
        columns: [{ id: "col1"}]
      }

      design = @pc.cleanDesign(design, @schema)
      compare design.intersections, {
        "row1:col1": { valueAxis: @axisCount }
      }

    it "removes extra intersections", ->
      design = {
        table: "t1"
        rows: [{ id: "row1"}]
        columns: [{ id: "col1"}]
        intersections: {
          "row1:col1": { valueAxis: @axisNumberSum }
          "rowX:col1": { valueAxis: @axisNumberSum }
        }
      }

      design = @pc.cleanDesign(design, @schema)
      compare design.intersections, {
        "row1:col1": { valueAxis: @axisNumberSum }
      }      
