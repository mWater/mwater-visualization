var DesignCompiler,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

module.exports = DesignCompiler = (function() {
  function DesignCompiler(schema) {
    this.compileExpr = bind(this.compileExpr, this);
    this.schema = schema;
  }

  DesignCompiler.prototype.compileExpr = function(options) {
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
      case "text":
      case "integer":
      case "decimal":
      case "boolean":
      case "enum":
      case "date":
        return {
          type: "literal",
          value: expr.value
        };
      default:
        throw new Error("Expr type " + expr.type + " not supported");
    }
  };

  DesignCompiler.prototype.compileComparisonExpr = function(options) {
    var expr, exprs;
    expr = options.expr;
    exprs = [
      this.compileExpr({
        expr: expr.lhs,
        baseTableId: options.baseTableId,
        baseTableAlias: options.baseTableAlias
      })
    ];
    if (expr.rhs) {
      exprs.push(this.compileExpr({
        expr: expr.rhs,
        baseTableId: options.baseTableId,
        baseTableAlias: options.baseTableAlias
      }));
    }
    if (expr.op === '= true') {
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
    } else if (expr.op === '= false') {
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
    }
    return {
      type: "op",
      op: expr.op,
      exprs: exprs
    };
  };

  DesignCompiler.prototype.compileLogicalExpr = function(options) {
    var expr;
    expr = options.expr;
    if (expr.exprs.length === 1) {
      return this.compileExpr({
        expr: expr.exprs[0],
        baseTableId: options.baseTableId,
        baseTableAlias: options.baseTableAlias
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
            baseTableId: options.baseTableId,
            baseTableAlias: options.baseTableAlias
          });
        };
      })(this))
    };
  };

  DesignCompiler.prototype.compileFieldExpr = function(options) {
    var expr;
    expr = options.expr;
    if (options.baseTableId !== expr.tableId) {
      throw new Error("Table mismatch");
    }
    return {
      type: "field",
      tableAlias: options.baseTableAlias,
      column: expr.columnId
    };
  };

  DesignCompiler.prototype.compileScalarExpr = function(options) {
    var expr, exprBaseTableAlias, exprBaseTableId, extraWhere, from, i, j, join, limit, orderBy, ordering, ref, scalar, scalarExpr, where;
    expr = options.expr;
    where = null;
    from = null;
    orderBy = null;
    limit = null;
    exprBaseTableId = options.baseTableId;
    exprBaseTableAlias = options.baseTableAlias;
    if (expr.joinIds && expr.joinIds.length > 0) {
      join = this.schema.getJoin(expr.joinIds[0]);
      where = {
        type: "op",
        op: join.op,
        exprs: [
          {
            type: "field",
            tableAlias: "j1",
            column: join.toColumnId
          }, {
            type: "field",
            tableAlias: options.baseTableAlias,
            column: join.fromColumnId
          }
        ]
      };
      from = {
        type: "table",
        table: join.toTableId,
        alias: "j1"
      };
      exprBaseTableId = join.toTableId;
      exprBaseTableAlias = "j1";
    }
    if (expr.joinIds.length > 1) {
      for (i = j = 1, ref = expr.joinIds.length; 1 <= ref ? j < ref : j > ref; i = 1 <= ref ? ++j : --j) {
        join = this.schema.getJoin(expr.joinIds[i]);
        from = {
          type: "join",
          left: from,
          right: {
            type: "table",
            table: join.toTableId,
            alias: "j" + (i + 1)
          },
          kind: "left",
          on: {
            type: "op",
            op: "=",
            exprs: [
              {
                type: "field",
                tableAlias: "j" + i,
                column: join.fromColumnId
              }, {
                type: "field",
                tableAlias: "j" + (i + 1),
                column: join.toColumnId
              }
            ]
          }
        };
        exprBaseTableId = join.toTableId;
        exprBaseTableAlias = "j" + (i + 1);
      }
    }
    if (expr.where) {
      extraWhere = this.compileExpr({
        expr: expr.where,
        baseTableId: exprBaseTableId,
        baseTableAlias: exprBaseTableAlias
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
      baseTableId: exprBaseTableId,
      baseTableAlias: exprBaseTableAlias
    });
    if (expr.aggrId) {
      switch (expr.aggrId) {
        case "last":
          ordering = this.schema.getTable(exprBaseTableId).ordering;
          if (!ordering) {
            throw new Error("No ordering defined");
          }
          limit = 1;
          orderBy = [
            {
              expr: {
                type: "field",
                tableAlias: exprBaseTableAlias,
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
            op: expr.aggrId,
            exprs: [scalarExpr]
          };
          break;
        default:
          throw new Error("Unknown aggregation " + expr.aggrId);
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

  return DesignCompiler;

})();
