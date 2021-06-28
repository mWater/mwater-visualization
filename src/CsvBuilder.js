_ = require 'lodash'

# Builds a csv string from an array of arrays
module.exports = class CsvBuilder
  # Table is a 2d array [row][column]
  build: (table) ->
    return @_stringifyCsv(table, @_csvifyValue)

  # Third-party code START
  _stringifyCsv: (table, replacer) ->
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
  
  _csvifyValue: (r, c, value) ->
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

# Third-party code END
