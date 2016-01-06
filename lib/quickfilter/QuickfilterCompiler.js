var ExprCompiler, QuickfilterCompiler;

ExprCompiler = require('mwater-expressions').ExprCompiler;

module.exports = QuickfilterCompiler = (function() {
  function QuickfilterCompiler(schema) {
    this.schema = schema;
  }

  QuickfilterCompiler.prototype.compile = function(design, values) {
    var filterExpr, filters, i, index, jsonql, ref;
    if (!design) {
      return [];
    }
    filters = [];
    for (index = i = 0, ref = design.length; 0 <= ref ? i < ref : i > ref; index = 0 <= ref ? ++i : --i) {
      if (!values || (values[index] == null)) {
        continue;
      }
      filterExpr = {
        type: "op",
        op: "=",
        exprs: [
          design[index].expr, {
            type: "literal",
            valueType: "enum",
            value: values[index]
          }
        ]
      };
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
