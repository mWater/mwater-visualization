var CsvBuilder, _;

_ = require('lodash');

module.exports = CsvBuilder = (function() {
  function CsvBuilder() {}

  CsvBuilder.prototype.build = function(table) {
    return this._stringifyCsv(table, this._csvifyValue);
  };

  CsvBuilder.prototype._stringifyCsv = function(table, replacer) {
    var c, cc, cell, csv, r, rr;
    replacer = replacer || function(r, c, v) {
      return v;
    };
    csv = "";
    rr = table.length;
    r = 0;
    while (r < rr) {
      if (r) {
        csv += "\r\n";
      }
      c = 0;
      cc = table[r].length;
      while (c < cc) {
        if (c) {
          csv += ",";
        }
        cell = replacer(r, c, table[r][c]);
        if (/[,\r\n"]/.test(cell)) {
          cell = "\"" + cell.replace(/"/g, "\"\"") + "\"";
        }
        csv += ((cell || 0 === cell) ? cell : "");
        ++c;
      }
      ++r;
    }
    return csv;
  };

  CsvBuilder.prototype._csvifyValue = function(r, c, value) {
    if (value == null) {
      return "";
    }
    if (_.isArray(value)) {
      return value.join(",");
    }
    if (value === true) {
      return "true";
    }
    if (value === false) {
      return "false";
    }
    return value;
  };

  return CsvBuilder;

})();
