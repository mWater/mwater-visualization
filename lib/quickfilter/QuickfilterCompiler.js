"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var ExprCleaner, ExprCompiler, ExprUtils, QuickfilterCompiler, _;

_ = require('lodash');
ExprCompiler = require('mwater-expressions').ExprCompiler;
ExprCleaner = require('mwater-expressions').ExprCleaner;
ExprUtils = require('mwater-expressions').ExprUtils; // Compiles quickfilter values into filters.

module.exports = QuickfilterCompiler = /*#__PURE__*/function () {
  function QuickfilterCompiler(schema) {
    (0, _classCallCheck2["default"])(this, QuickfilterCompiler);
    this.schema = schema;
  } // design is array of quickfilters (see README.md)
  // values is array of values 
  // locks is array of locked quickfilters. Overrides values
  // Returns array of filters { table: table id, jsonql: JsonQL with {alias} for the table name to filter by }
  // See README for values


  (0, _createClass2["default"])(QuickfilterCompiler, [{
    key: "compile",
    value: function compile(design, values, locks) {
      var expr, filterExpr, filters, i, index, item, j, jsonql, k, len, lock, multi, ref, value;

      if (!design) {
        return [];
      }

      filters = [];

      for (index = j = 0, len = design.length; j < len; index = ++j) {
        item = design[index]; // Determine if locked

        lock = _.find(locks, function (lock) {
          return _.isEqual(lock.expr, item.expr);
        }); // Determine value

        if (lock) {
          value = lock.value;
        } else {
          value = values != null ? values[index] : void 0;
        } // Null means no filter


        if (!value) {
          continue;
        } // Clean expression first


        expr = new ExprCleaner(this.schema).cleanExpr(item.expr); // Do not render if nothing

        if (!expr) {
          continue;
        } // Due to bug, some quickfilters were merged even though multi was different. Get multi
        // from original if merged


        multi = item.multi;

        if (item.merged) {
          for (i = k = 0, ref = index; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
            if (!design[i].merged) {
              multi = design[i].multi;
            }
          }
        } // Compile to boolean expression


        filterExpr = this.compileToFilterExpr(expr, value, multi);
        jsonql = new ExprCompiler(this.schema).compileExpr({
          expr: filterExpr,
          tableAlias: "{alias}"
        }); // Only keep if compiles to something

        if (jsonql == null) {
          continue;
        }

        filters.push({
          table: expr.table,
          jsonql: jsonql
        });
      }

      return filters;
    }
  }, {
    key: "compileToFilterExpr",
    value: function compileToFilterExpr(expr, value, multi) {
      var idTable, type; // Get type of expr

      type = new ExprUtils(this.schema).getExprType(expr);
      idTable = new ExprUtils(this.schema).getExprIdTable(expr);

      if (type === 'text') {
        // Create simple = expression
        if (multi) {
          return {
            type: "op",
            op: "= any",
            table: expr.table,
            exprs: [expr, {
              type: "literal",
              valueType: "text[]",
              value: value
            }]
          };
        } else {
          return {
            type: "op",
            op: "=",
            table: expr.table,
            exprs: [expr, {
              type: "literal",
              valueType: "text",
              value: value
            }]
          };
        }
      } else if (type === 'enum') {
        // Create simple = expression
        if (multi) {
          return {
            type: "op",
            op: "= any",
            table: expr.table,
            exprs: [expr, {
              type: "literal",
              valueType: "enumset",
              value: value
            }]
          };
        } else {
          return {
            type: "op",
            op: "=",
            table: expr.table,
            exprs: [expr, {
              type: "literal",
              valueType: "enum",
              value: value
            }]
          };
        }
      } else if (type === "enumset" || type === "text[]") {
        // Create contains expression
        if (multi) {
          return {
            type: "op",
            op: "intersects",
            table: expr.table,
            exprs: [expr, {
              type: "literal",
              valueType: type,
              value: value
            }]
          };
        } else {
          return {
            type: "op",
            op: "contains",
            table: expr.table,
            exprs: [expr, {
              type: "literal",
              valueType: type,
              value: [value]
            }]
          };
        }
      } else if (type === 'id[]') {
        if (multi) {
          return {
            type: "op",
            op: "intersects",
            table: expr.table,
            exprs: [expr, {
              type: "literal",
              valueType: "id[]",
              idTable: idTable,
              value: value
            }]
          };
        } else {
          return {
            type: "op",
            op: "contains",
            table: expr.table,
            exprs: [expr, {
              type: "literal",
              valueType: "id[]",
              idTable: idTable,
              value: [value]
            }]
          };
        }
      } else if ((type === 'date' || type === 'datetime') && value.op) {
        return {
          type: "op",
          op: value.op,
          table: expr.table,
          exprs: [expr].concat(value.exprs)
        };
      } else {
        return null;
      }
    }
  }]);
  return QuickfilterCompiler;
}();