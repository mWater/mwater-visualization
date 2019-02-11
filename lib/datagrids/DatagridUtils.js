"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var DatagridUtils, ExprCleaner, ExprUtils, _, update;

_ = require('lodash');
update = require('update-object');
ExprCleaner = require('mwater-expressions').ExprCleaner;
ExprUtils = require("mwater-expressions").ExprUtils;

module.exports = DatagridUtils =
/*#__PURE__*/
function () {
  function DatagridUtils(schema) {
    (0, _classCallCheck2.default)(this, DatagridUtils);
    this.schema = schema;
  } // Cleans a datagrid design, removing invalid columns


  (0, _createClass2.default)(DatagridUtils, [{
    key: "cleanDesign",
    value: function cleanDesign(design) {
      var column, exprCleaner, i, len, ref, subtable, table;
      exprCleaner = new ExprCleaner(this.schema); // Erase all if table doesn't exist

      if (!this.schema.getTable(design.table)) {
        return {};
      } // Clean columns


      design = _.cloneDeep(design);
      ref = design.columns;

      for (i = 0, len = ref.length; i < len; i++) {
        column = ref[i];

        if (column.type === "expr") {
          // Determine if subtable
          if (column.subtable) {
            subtable = _.findWhere(design.subtables, {
              id: column.subtable
            }); // Now get destination table

            table = new ExprUtils(this.schema).followJoins(design.table, subtable.joins);
          } else {
            table = design.table;
          }

          column.expr = exprCleaner.cleanExpr(column.expr, {
            table: table,
            aggrStatuses: ["individual", "literal", "aggregate"]
          });
        }
      }

      return design;
    }
  }, {
    key: "validateDesign",
    value: function validateDesign(design) {
      var ref;

      if (!design.table) {
        return "Missing table";
      }

      if (!((ref = design.columns) != null ? ref[0] : void 0)) {
        return "No columns";
      }
    }
  }]);
  return DatagridUtils;
}();