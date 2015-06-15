var ExpressionCompiler,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

module.exports = ExpressionCompiler = (function() {
  function ExpressionCompiler(schema) {
    this.compileExpr = bind(this.compileExpr, this);
    this.schema = schema;
  }

  ExpressionCompiler.prototype.compileExpr = function(options) {
    var expr;
    expr = options.expr;
    switch (expr.type) {
      case "field":
        return this.compileFieldExpr(options);
      case "scalar":
        return this.compileScalarExpr(options);
      case "comparison":
        return this.compileComparisonExpr(options);
      case "logical":
        return this.compileLogicalExpr(options);
      case "literal":
        return {
          type: "literal",
          value: expr.value
        };
      default:
        throw new Error("Expr type " + expr.type + " not supported");
    }
  };

  ExpressionCompiler.prototype.compileFieldExpr = function(options) {
    var expr;
    expr = options.expr;
    return {
      type: "field",
      tableAlias: options.tableAlias,
      column: expr.column
    };
  };

  ExpressionCompiler.prototype.compileScalarExpr = function(options) {
    var expr, extraWhere, from, i, j, join, limit, orderBy, ordering, ref, scalar, scalarExpr, table, tableAlias, where;
    expr = options.expr;
    where = null;
    from = null;
    orderBy = null;
    limit = null;
    table = expr.table;
    tableAlias = options.tableAlias;
    if (expr.joins && expr.joins.length > 0) {
      join = this.schema.getColumn(expr.table, expr.joins[0]).join;
      where = {
        type: "op",
        op: join.op,
        exprs: [
          {
            type: "field",
            tableAlias: "j1",
            column: join.toColumn
          }, {
            type: "field",
            tableAlias: tableAlias,
            column: join.fromColumn
          }
        ]
      };
      from = {
        type: "table",
        table: join.toTable,
        alias: "j1"
      };
      table = join.toTable;
      tableAlias = "j1";
    }
    if (expr.joins.length > 1) {
      for (i = j = 1, ref = expr.joins.length; 1 <= ref ? j < ref : j > ref; i = 1 <= ref ? ++j : --j) {
        join = this.schema.getColumn(table, expr.joins[i]).join;
        from = {
          type: "join",
          left: from,
          right: {
            type: "table",
            table: join.toTable,
            alias: "j" + (i + 1)
          },
          kind: "left",
          on: {
            type: "op",
            op: join.op,
            exprs: [
              {
                type: "field",
                tableAlias: "j" + i,
                column: join.fromColumn
              }, {
                type: "field",
                tableAlias: "j" + (i + 1),
                column: join.toColumn
              }
            ]
          }
        };
        table = join.toTable;
        tableAlias = "j" + (i + 1);
      }
    }
    if (expr.where) {
      extraWhere = this.compileExpr({
        expr: expr.where,
        tableAlias: tableAlias
      });
      if (where) {
        where = {
          type: "op",
          op: "and",
          exprs: [where, extraWhere]
        };
      } else {
        where = extraWhere;
      }
    }
    scalarExpr = this.compileExpr({
      expr: expr.expr,
      tableAlias: tableAlias
    });
    if (expr.aggr) {
      switch (expr.aggr) {
        case "last":
          ordering = this.schema.getTable(table).ordering;
          if (!ordering) {
            throw new Error("No ordering defined");
          }
          limit = 1;
          orderBy = [
            {
              expr: {
                type: "field",
                tableAlias: tableAlias,
                column: ordering
              },
              direction: "desc"
            }
          ];
          break;
        case "sum":
        case "count":
        case "avg":
        case "max":
        case "min":
        case "stdev":
        case "stdevp":
          scalarExpr = {
            type: "op",
            op: expr.aggr,
            exprs: [scalarExpr]
          };
          break;
        default:
          throw new Error("Unknown aggregation " + expr.aggr);
      }
    }
    if (!from && !where && !orderBy && !limit) {
      return scalarExpr;
    }
    scalar = {
      type: "scalar",
      expr: scalarExpr
    };
    if (from) {
      scalar.from = from;
    }
    if (where) {
      scalar.where = where;
    }
    if (orderBy) {
      scalar.orderBy = orderBy;
    }
    if (limit) {
      scalar.limit = limit;
    }
    return scalar;
  };

  ExpressionCompiler.prototype.compileComparisonExpr = function(options) {
    var expr, exprs;
    expr = options.expr;
    exprs = [
      this.compileExpr({
        expr: expr.lhs,
        tableAlias: options.tableAlias
      })
    ];
    if (expr.rhs) {
      exprs.push(this.compileExpr({
        expr: expr.rhs,
        tableAlias: options.tableAlias
      }));
    }
    switch (expr.op) {
      case '= true':
        return {
          type: "op",
          op: "=",
          exprs: [
            exprs[0], {
              type: "literal",
              value: true
            }
          ]
        };
      case '= false':
        return {
          type: "op",
          op: "=",
          exprs: [
            exprs[0], {
              type: "literal",
              value: false
            }
          ]
        };
      case '= any':
        return {
          type: "op",
          op: "=",
          modifier: "any",
          exprs: exprs
        };
      default:
        return {
          type: "op",
          op: expr.op,
          exprs: exprs
        };
    }
  };

  ExpressionCompiler.prototype.compileLogicalExpr = function(options) {
    var expr;
    expr = options.expr;
    if (expr.exprs.length === 1) {
      return this.compileExpr({
        expr: expr.exprs[0],
        tableAlias: options.tableAlias
      });
    }
    if (expr.exprs.length === 0) {
      return null;
    }
    return {
      type: "op",
      op: expr.op,
      exprs: _.map(expr.exprs, (function(_this) {
        return function(e) {
          return _this.compileExpr({
            expr: e,
            tableAlias: options.tableAlias
          });
        };
      })(this))
    };
  };

  return ExpressionCompiler;

})();
