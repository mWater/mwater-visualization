"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var CsvBuilder, _;

_ = require('lodash'); // Builds a csv string from an array of arrays

module.exports = CsvBuilder =
/*#__PURE__*/
function () {
  function CsvBuilder() {
    (0, _classCallCheck2["default"])(this, CsvBuilder);
  }

  (0, _createClass2["default"])(CsvBuilder, [{
    key: "build",
    // Table is a 2d array [row][column]
    value: function build(table) {
      return this._stringifyCsv(table, this._csvifyValue);
    } // Third-party code START

  }, {
    key: "_stringifyCsv",
    value: function _stringifyCsv(table, replacer) {
      var c, cc, cell, csv, r, rr;

      replacer = replacer || function (r, c, v) {
        return v;
      };

      csv = "";
      rr = table.length;
      r = 0; // for each row

      while (r < rr) {
        if (r) {
          // Adds a new line if not the first line
          csv += "\r\n";
        }

        c = 0;
        cc = table[r].length; // for each columns

        while (c < cc) {
          if (c) {
            // Adds a new , if not the first column
            csv += ",";
          }

          cell = replacer(r, c, table[r][c]);

          if (/[,\r\n"]/.test(cell)) {
            cell = "\"" + cell.replace(/"/g, "\"\"") + "\"";
          }

          csv += cell || 0 === cell ? cell : "";
          ++c;
        }

        ++r;
      }

      return csv;
    }
  }, {
    key: "_csvifyValue",
    value: function _csvifyValue(r, c, value) {
      if (value == null) {
        return "";
      } // Handle case of an array that leaked through without crashing


      if (_.isArray(value)) {
        return value.join(",");
      } // Handle true/false as strings


      if (value === true) {
        return "true";
      }

      if (value === false) {
        return "false";
      }

      return value;
    }
  }]);
  return CsvBuilder;
}(); // Third-party code END