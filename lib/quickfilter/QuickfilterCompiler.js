var ExprCompiler, ExprUtils, QuickfilterCompiler, _;

_ = require('lodash');

ExprCompiler = require('mwater-expressions').ExprCompiler;

ExprUtils = require('mwater-expressions').ExprUtils;

module.exports = QuickfilterCompiler = (function() {
  function QuickfilterCompiler(schema) {
    this.schema = schema;
  }

  QuickfilterCompiler.prototype.compile = function(design, values, locks) {
    var filterExpr, filters, i, index, item, jsonql, len, lock, type, value;
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
      type = new ExprUtils(this.schema).getExprType(item.expr);
      if (type === 'enum' || type === 'text') {
        filterExpr = {
          type: "op",
          op: "=",
          table: item.expr.table,
          exprs: [
            item.expr, {
              type: "literal",
              valueType: "enum",
              value: value
            }
          ]
        };
      } else if (type === 'date' || type === 'datetime') {
        filterExpr = {
          type: "op",
          op: value.op,
          table: item.expr.table,
          exprs: [item.expr].concat(value.exprs)
        };
      }
      jsonql = new ExprCompiler(this.schema).compileExpr({
        expr: filterExpr,
        tableAlias: "{alias}"
      });
      if (jsonql == null) {
        continue;
      }
      filters.push({
        table: item.expr.table,
        jsonql: jsonql
      });
    }
    return filters;
  };

  return QuickfilterCompiler;

})();
