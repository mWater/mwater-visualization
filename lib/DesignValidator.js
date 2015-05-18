var DesignValidator,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

module.exports = DesignValidator = (function() {
  function DesignValidator(schema) {
    this.cleanLogicalExpr = bind(this.cleanLogicalExpr, this);
    this.cleanComparisonExpr = bind(this.cleanComparisonExpr, this);
    this.cleanScalarExpr = bind(this.cleanScalarExpr, this);
    this.schema = schema;
  }

  DesignValidator.prototype.validateExpr = function(expr) {
    if (!expr) {
      return null;
    }
    switch (expr.type) {
      case "scalar":
        return this.validateScalarExpr(expr);
      case "comparison":
        return this.validateComparisonExpr(expr);
      case "logical":
        return this.validateLogicalExpr(expr);
    }
    return null;
  };

  DesignValidator.prototype.validateComparisonExpr = function(expr) {
    if (!expr.lhs) {
      return "Missing lhs";
    }
    if (!expr.op) {
      return "Missing op";
    }
    if (this.schema.getComparisonRhsType(this.schema.getExprType(expr.lhs), expr.op) && !expr.rhs) {
      return "Missing rhs";
    }
    return this.validateExpr(expr.lhs) || this.validateExpr(expr.rhs);
  };

  DesignValidator.prototype.validateLogicalExpr = function(expr) {
    var error, i, len, ref, subexpr;
    error = null;
    ref = expr.exprs;
    for (i = 0, len = ref.length; i < len; i++) {
      subexpr = ref[i];
      error = error || this.validateExpr(subexpr);
    }
    return error;
  };

  DesignValidator.prototype.validateScalarExpr = function(expr) {
    return null;
  };

  DesignValidator.prototype.cleanExpr = function(expr, baseTableId) {
    if (!expr || !expr.type) {
      return expr;
    }
    switch (expr.type) {
      case "scalar":
        return this.cleanScalarExpr(expr);
      case "comparison":
        return this.cleanComparisonExpr(expr);
      case "logical":
        return this.cleanLogicalExpr(expr);
    }
    return expr;
  };

  DesignValidator.prototype.cleanScalarExpr = function(scalar, baseTableId) {
    var aggrs, ref;
    if (!scalar) {
      return scalar;
    }
    if (scalar.expr) {
      aggrs = this.schema.getAggrs(scalar.expr);
      if (ref = scalar.aggrId, indexOf.call(_.pluck(aggrs, "id"), ref) < 0) {
        scalar = _.omit(scalar, "aggrId");
      }
      if (!this.schema.isAggrNeeded(scalar.joinIds)) {
        scalar = _.omit(scalar, "aggrId");
      } else if (!scalar.aggrId) {
        scalar = _.extend({}, scalar, {
          aggrId: aggrs[0].id
        });
      }
    }
    if (scalar.where) {
      scalar = _.extend({}, scalar, {
        where: this.cleanExpr(scalar.where, this.schema.getExprTable(scalar.expr).id)
      });
    }
    return scalar;
  };

  DesignValidator.prototype.cleanComparisonExpr = function(expr, baseTableId) {
    var ref;
    expr = _.extend({}, expr, {
      lhs: this.cleanExpr(expr.lhs)
    });
    if (!expr.lhs) {
      expr = {
        type: "comparison"
      };
    }
    if (!expr.op && expr.rhs) {
      expr = _.omit(expr, "rhs");
    }
    if (expr.op && expr.rhs && expr.lhs) {
      if (this.schema.getComparisonRhsType(this.schema.getExprType(expr.lhs), expr.op) !== this.schema.getExprType(expr.rhs)) {
        expr = _.omit(expr, "rhs");
      } else if (this.schema.getComparisonRhsType(this.schema.getExprType(expr.lhs), expr.op) === "enum" && expr.rhs.type === "enum" && (ref = expr.rhs.value, indexOf.call(_.pluck(this.schema.getExprValues(expr.lhs), "id"), ref) < 0)) {
        expr = _.omit(expr, "rhs");
      }
    }
    if (expr.lhs && !expr.op) {
      expr = _.extend({}, expr, {
        op: this.schema.getComparisonOps(this.schema.getExprType(expr.lhs))[0].id
      });
    }
    if (expr.lhs && expr.op && !expr.rhs && this.schema.getComparisonRhsType(this.schema.getExprType(expr.lhs), expr.op) === "enum") {
      expr = _.extend({}, expr, {
        rhs: {
          type: "enum",
          value: this.schema.getExprValues(expr.lhs)[0].id
        }
      });
    }
    return expr;
  };

  DesignValidator.prototype.cleanLogicalExpr = function(expr, baseTableId) {
    return expr = _.extend({}, expr, {
      exprs: _.map(expr.exprs, (function(_this) {
        return function(e) {
          return _this.cleanComparisonExpr(e, baseTableId);
        };
      })(this))
    });
  };

  return DesignValidator;

})();
