ExpressionBuilder = require './ExpressionBuilder'
saveAs = require 'filesaver.js'
_ = require 'lodash'

# Third-party code START
csvifyValue = (r, c, value) ->
  if not value?
    return ""

  # Handle case of an array that leaked through without crashing
  if _.isArray(value)
    return value.join(",")

  # Handle true/false as strings
  if value == true
    return "true"
  if value == false
    return "false"

  return value

# Table is a 2d array [row][column]
stringifyCsv = (table, replacer) ->
  replacer = replacer or (r, c, v) ->
    v

  csv = ""
  rr = table.length
  r = 0
  # for each row
  while r < rr
    # Adds a new line if not the first line
    csv += "\r\n"  if r
    c = 0
    cc = table[r].length
    # for each columns
    while c < cc
      # Adds a new , if not the first column
      csv += ","  if c
      cell = replacer(r, c, table[r][c])
      cell = "\"" + cell.replace(/"/g, "\"\"") + "\""  if /[,\r\n"]/.test(cell)
      csv += (if (cell or 0 is cell) then cell else "")
      ++c
    ++r
  return csv


exportCsv = (rows) ->
  csvString = stringifyCsv(rows, csvifyValue)
# Third-party code END


# Saves a table (data[][]) to CSV
module.exports.saveTable = (table, title) ->
  csv = exportCsv table
  blob = new Blob([csv], {type: "text/csv"})
  saveAs(blob, (title or "unnamed-chart") + ".csv")

# Creates a table (data[][]) from a TableChart, to save as csv
module.exports.tableFromTableChart = (data, columns, exprBuilder) ->
  renderHeaderCell = (column) ->
    column.headerText or exprBuilder.summarizeAggrExpr(column.expr, column.aggr)
  header = _.map(columns, renderHeaderCell)
  table = [header]
  renderRow = (record) ->
    renderCell = (column, columnIndex) ->
      value = record["c#{columnIndex}"]
      exprBuilder.stringifyExprLiteral(column.expr, value)
    _.map(columns, renderCell)
  table.concat(_.map(data, renderRow))

# Creates a table (data[][]) from a LayeredChart, using the first layer only, to save as csv
module.exports.tableFromLayeredChart = (data) ->
  table = []
  if data.length > 0
    fields = Object.getOwnPropertyNames(data[0])
    table = [fields]
    renderRow = (record) ->
       _.map(fields, (field) -> record[field])
    table.concat(_.map(data, renderRow))
  else []
