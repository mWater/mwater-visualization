var ExprCompiler, _, injectTableAlias;

_ = require('lodash');

ExprCompiler = require('mwater-expressions').ExprCompiler;

injectTableAlias = require('mwater-expressions').injectTableAlias;

exports.findExprValues = function(expr, schema, dataSource, filters, offset, limit, callback) {
  var exprCompiler, filter, i, len, query, ref;
  exprCompiler = new ExprCompiler(schema);
  query = {
    type: "query",
    distinct: true,
    selects: [
      {
        type: "select",
        expr: exprCompiler.compileExpr({
          expr: expr,
          tableAlias: "main"
        }),
        alias: "value"
      }
    ],
    from: exprCompiler.compileTable(expr.table, "main"),
    where: {
      type: "op",
      op: "and",
      exprs: []
    },
    orderBy: [
      {
        ordinal: 1,
        direction: "asc"
      }
    ],
    limit: limit,
    offset: offset
  };
  ref = filters || [];
  for (i = 0, len = ref.length; i < len; i++) {
    filter = ref[i];
    if (filter.table === expr.table) {
      query.where.exprs.push(injectTableAlias(filter.jsonql, "main"));
    }
  }
  dataSource.performQuery(query, (function(_this) {
    return function(err, rows) {
      if (err) {
        callback(err);
        return;
      }
      rows = _.filter(rows, function(r) {
        return r.value;
      });
      return callback(null, _.pluck(rows, "value"));
    };
  })(this));
};
