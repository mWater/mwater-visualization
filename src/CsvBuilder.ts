import _ from "lodash"

// Builds a csv string from an array of arrays
export default class CsvBuilder {
  // Table is a 2d array [row][column]
  build(table: any) {
    return this._stringifyCsv(table, this._csvifyValue)
  }

  // Third-party code START
  _stringifyCsv(table: any, replacer: any) {
    replacer = replacer || ((r: any, c: any, v: any) => v)

    let csv = ""
    const rr = table.length
    let r = 0
    // for each row
    while (r < rr) {
      // Adds a new line if not the first line
      if (r) {
        csv += "\r\n"
      }
      let c = 0
      const cc = table[r].length
      // for each columns
      while (c < cc) {
        // Adds a new , if not the first column
        if (c) {
          csv += ","
        }
        let cell = replacer(r, c, table[r][c])
        if (/[,\r\n"]/.test(cell)) {
          cell = '"' + cell.replace(/"/g, '""') + '"'
        }
        csv += cell || 0 === cell ? cell : ""
        ++c
      }
      ++r
    }
    return csv
  }

  _csvifyValue(r: any, c: any, value: any) {
    if (value == null) {
      return ""
    }

    // Handle case of an array that leaked through without crashing
    if (_.isArray(value)) {
      return value.join(",")
    }

    // Handle true/false as strings
    if (value === true) {
      return "true"
    }
    if (value === false) {
      return "false"
    }

    return value
  }
}

// Third-party code END
