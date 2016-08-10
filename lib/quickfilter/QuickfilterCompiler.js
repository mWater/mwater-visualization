var ExprCompiler, ExprUtils, QuickfilterCompiler;

ExprCompiler = require('mwater-expressions').ExprCompiler;

ExprUtils = require('mwater-expressions').ExprUtils;

module.exports = QuickfilterCompiler = (function() {
  function QuickfilterCompiler(schema) {
    this.schema = schema;
  }

  QuickfilterCompiler.prototype.compile = function(design, values) {
    var filterExpr, filters, i, index, jsonql, ref, type;
    if (!design) {
      return [];
    }
    filters = [];
    for (index = i = 0, ref = design.length; 0 <= ref ? i < ref : i > ref; index = 0 <= ref ? ++i : --i) {
      if (!values || (values[index] == null)) {
        continue;
      }
      type = new ExprUtils(this.schema).getExprType(design[index].expr);
      if (type === 'enum' || type === 'text') {
        filterExpr = {
          type: "op",
          op: "=",
          table: design[index].expr.table,
          exprs: [
            design[index].expr, {
              type: "literal",
              valueType: "enum",
              value: values[index]
            }
          ]
        };
      } else if (type === 'date' || type === 'datetime') {
        filterExpr = {
          type: "op",
          op: values[index].op,
          table: design[index].expr.table,
          exprs: [design[index].expr].concat(values[index].exprs)
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
        table: design[index].table,
        jsonql: jsonql
      });
    }
    return filters;
  };

  return QuickfilterCompiler;

})();
