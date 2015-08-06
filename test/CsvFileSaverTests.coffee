# _ = require 'lodash'
# assert = require('chai').assert
# fixtures = require './fixtures'
# CsvFileSaver = require '../src/CsvFileSaver'

# compare = (actual, expected) ->
#   assert _.isEqual(actual, expected) or JSON.stringify(actual) == JSON.stringify(expected), "\n" + JSON.stringify(actual) + "\n" + JSON.stringify(expected)

# describe "CsvFileSaver", ->
#   before ->
#     @schema = fixtures.simpleSchema()
#     @exprDecimal = { type: "field", table: "t1", column: "decimal" }
#     @exprInteger = { type: "field", table: "t1", column: "integer" }
#     @exprText = { type: "field", table: "t1", column: "text" }
#     @exprDate = { type: "field", table: "t1", column: "date" }
#     @exprEnum = { type: "field", table: "t1", column: "enum" }

#   describe "tableFromLayeredChart", ->

#     it "returns empty table if no data", ->
#       data = []
#       table = CsvFileSaver.tableFromLayeredChart(data)
#       expectedTable = []
#       compare(table, expectedTable)

#     it "returns valid table plus headers if data", ->
#       data = [{x: "Test", y: 34}]
#       table = CsvFileSaver.tableFromLayeredChart(data)
#       expectedTable = [["x", "y"]
#                        ["Test", 34]]
#       compare(table, expectedTable)


#   describe "tableFromTableChart", ->

#     it "still returns headers if no data", ->
#       columns = [
#         { expr: @exprText }
#         { expr: @exprDecimal }
#       ]
#       data = []
#       table = CsvFileSaver.tableFromTableChart(data, columns, @schema)
#       expectedTable = [["Text", "Decimal"]]
#       compare(table, expectedTable)

#     it "returns valid table if data", ->
#       columns = [
#         { expr: @exprText }
#         { expr: @exprDecimal }
#       ]
#       data = [{c0: "Test", c1: 34}]
#       table = CsvFileSaver.tableFromTableChart(data, columns, @schema)
#       expectedTable = [["Text", "Decimal"]
#                        ["Test", "34"]]
#       compare(table, expectedTable)


#   describe "exportCsv", ->

#     it "handles mixed data types", ->
#       data = [["a", 1, 4.5]
#               [3.2, 4, "b", "x"]]
#       csv = CsvFileSaver.exportCsv(data)
#       expectedCsv = "a,1,4.5\r\n3.2,4,b,x"
#       compare(csv, expectedCsv)
