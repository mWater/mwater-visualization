var ExprCleaner, ExprCompiler, ExprUtils, QuickfilterCompiler, _;

_ = require('lodash');

ExprCompiler = require('mwater-expressions').ExprCompiler;

ExprCleaner = require('mwater-expressions').ExprCleaner;

ExprUtils = require('mwater-expressions').ExprUtils;

module.exports = QuickfilterCompiler = (function() {
  function QuickfilterCompiler(schema) {
    this.schema = schema;
  }

  QuickfilterCompiler.prototype.compile = function(design, values, locks) {
    var expr, filterExpr, filters, i, index, item, jsonql, len, lock, value;
    if (!design) {
      return [];
    }
    filters = [];
    for (index = i = 0, len = design.length; i < len; index = ++i) {
      item = design[index];
      lock = _.find(locks, function(lock) {
        return _.isEqual(lock.expr, item.expr);
      });
      if (lock) {
        value = lock.value;
      } else {
        value = values != null ? values[index] : void 0;
      }
      if (!value) {
        continue;
      }
      expr = new ExprCleaner(this.schema).cleanExpr(item.expr);
      if (!expr) {
        continue;
      }
      filterExpr = this.compileToFilterExpr(expr, value);
      jsonql = new ExprCompiler(this.schema).compileExpr({
        expr: filterExpr,
        tableAlias: "{alias}"
      });
      if (jsonql == null) {
        continue;
      }
      filters.push({
        table: expr.table,
        jsonql: jsonql
      });
    }
    return filters;
  };

  QuickfilterCompiler.prototype.compileToFilterExpr = function(expr, value) {
    var type;
    type = new ExprUtils(this.schema).getExprType(expr);
    if (type === 'enum' || type === 'text') {
      return {
        type: "op",
        op: "=",
        table: expr.table,
        exprs: [
          expr, {
            type: "literal",
            valueType: "enum",
            value: value
          }
        ]
      };
    } else if (type === 'date' || type === 'datetime') {
      return {
        type: "op",
        op: value.op,
        table: expr.table,
        exprs: [expr].concat(value.exprs)
      };
    }
  };

  return QuickfilterCompiler;

})();
