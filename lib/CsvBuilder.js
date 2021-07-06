"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
// Builds a csv string from an array of arrays
class CsvBuilder {
    // Table is a 2d array [row][column]
    build(table) {
        return this._stringifyCsv(table, this._csvifyValue);
    }
    // Third-party code START
    _stringifyCsv(table, replacer) {
        replacer = replacer || ((r, c, v) => v);
        let csv = "";
        const rr = table.length;
        let r = 0;
        // for each row
        while (r < rr) {
            // Adds a new line if not the first line
            if (r) {
                csv += "\r\n";
            }
            let c = 0;
            const cc = table[r].length;
            // for each columns
            while (c < cc) {
                // Adds a new , if not the first column
                if (c) {
                    csv += ",";
                }
                let cell = replacer(r, c, table[r][c]);
                if (/[,\r\n"]/.test(cell)) {
                    cell = '"' + cell.replace(/"/g, '""') + '"';
                }
                csv += cell || 0 === cell ? cell : "";
                ++c;
            }
            ++r;
        }
        return csv;
    }
    _csvifyValue(r, c, value) {
        if (value == null) {
            return "";
        }
        // Handle case of an array that leaked through without crashing
        if (lodash_1.default.isArray(value)) {
            return value.join(",");
        }
        // Handle true/false as strings
        if (value === true) {
            return "true";
        }
        if (value === false) {
            return "false";
        }
        return value;
    }
}
exports.default = CsvBuilder;
// Third-party code END
