"use strict";

var ExprCompiler, _, injectTableAlias;

_ = require('lodash');
ExprCompiler = require('mwater-expressions').ExprCompiler;
injectTableAlias = require('mwater-expressions').injectTableAlias; // Perform query to find quickfilter values

exports.findExprValues = function (expr, schema, dataSource, filters, offset, limit, callback) {
  var exprCompiler, filter, i, len, query, ref;
  exprCompiler = new ExprCompiler(schema); // select distinct <compiled expr> as value from <table> where <filters> order by 1 offset limit 

  query = {
    type: "query",
    distinct: true,
    selects: [{
      type: "select",
      expr: exprCompiler.compileExpr({
        expr: expr,
        tableAlias: "main"
      }),
      alias: "value"
    }],
    from: exprCompiler.compileTable(expr.table, "main"),
    where: {
      type: "op",
      op: "and",
      exprs: []
    },
    orderBy: [{
      ordinal: 1,
      direction: "asc"
    }],
    limit: limit,
    offset: offset
  };
  ref = filters || []; // Add filters if present

  for (i = 0, len = ref.length; i < len; i++) {
    filter = ref[i];

    if (filter.table === expr.table) {
      query.where.exprs.push(injectTableAlias(filter.jsonql, "main"));
    }
  } // Execute query


  dataSource.performQuery(query, function (err, rows) {
    if (err) {
      callback(err);
      return;
    } // Filter null and blank


    rows = _.filter(rows, function (r) {
      return r.value;
    });
    return callback(null, _.pluck(rows, "value"));
  });
};