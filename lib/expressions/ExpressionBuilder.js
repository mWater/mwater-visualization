var ExpressionBuilder, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ = require('lodash');

module.exports = ExpressionBuilder = (function() {
  function ExpressionBuilder(schema) {
    this.cleanLogicalExpr = bind(this.cleanLogicalExpr, this);
    this.cleanComparisonExpr = bind(this.cleanComparisonExpr, this);
    this.schema = schema;
  }

  ExpressionBuilder.prototype.isMultipleJoins = function(table, joins) {
    var i, j, joinCol, len, t;
    t = table;
    for (i = 0, len = joins.length; i < len; i++) {
      j = joins[i];
      joinCol = this.schema.getColumn(t, j);
      if (joinCol.join.multiple) {
        return true;
      }
      t = joinCol.join.toTable;
    }
    return false;
  };

  ExpressionBuilder.prototype.followJoins = function(startTable, joins) {
    var i, j, joinCol, len, t;
    t = startTable;
    for (i = 0, len = joins.length; i < len; i++) {
      j = joins[i];
      joinCol = this.schema.getColumn(t, j);
      t = joinCol.join.toTable;
    }
    return t;
  };

  ExpressionBuilder.prototype.getAggrTypes = function(expr) {
    var aggrs;
    aggrs = this.getAggrs(expr);
    return _.uniq(_.pluck(aggrs, "type"));
  };

  ExpressionBuilder.prototype.getAggrs = function(expr) {
    var aggrs, table, type;
    aggrs = [];
    type = this.getExprType(expr);
    if (!type) {
      return [];
    }
    table = this.schema.getTable(expr.table);
    if (table.ordering && type !== "count") {
      aggrs.push({
        id: "last",
        name: "Latest",
        type: type
      });
    }
    switch (type) {
      case "date":
      case "datetime":
        aggrs.push({
          id: "max",
          name: "Maximum",
          type: type
        });
        aggrs.push({
          id: "min",
          name: "Minimum",
          type: type
        });
        break;
      case "integer":
      case "decimal":
        aggrs.push({
          id: "sum",
          name: "Total",
          type: type
        });
        aggrs.push({
          id: "avg",
          name: "Average",
          type: "decimal"
        });
        aggrs.push({
          id: "max",
          name: "Maximum",
          type: type
        });
        aggrs.push({
          id: "min",
          name: "Minimum",
          type: type
        });
    }
    aggrs.push({
      id: "count",
      name: "Number of",
      type: "integer"
    });
    return aggrs;
  };

  ExpressionBuilder.prototype.getExprTable = function(expr) {
    if (expr && expr.table) {
      return expr.table;
    }
  };

  ExpressionBuilder.prototype.getExprType = function(expr) {
    var aggr, column;
    if (expr == null) {
      return null;
    }
    switch (expr.type) {
      case "field":
        column = this.schema.getColumn(expr.table, expr.column);
        return column.type;
      case "scalar":
        if (expr.aggr) {
          aggr = _.findWhere(this.getAggrs(expr.expr), {
            id: expr.aggr
          });
          if (!aggr) {
            throw new Error("Aggregation " + expr.aggr + " not found for scalar");
          }
          return aggr.type;
        }
        return this.getExprType(expr.expr);
      case "literal":
        return expr.valueType;
      case "count":
        return "count";
      default:
        throw new Error("Not implemented for " + expr.type);
    }
  };

  ExpressionBuilder.prototype.summarizeExpr = function(expr) {
    var namedExpr, table;
    if (!expr) {
      return "None";
    }
    table = this.getExprTable(expr);
    namedExpr = _.find(this.schema.getNamedExprs(table), (function(_this) {
      return function(ne) {
        return _this.areExprsEqual(_this.simplifyExpr(ne.expr), _this.simplifyExpr(expr));
      };
    })(this));
    if (namedExpr) {
      return namedExpr.name;
    }
    switch (expr.type) {
      case "scalar":
        return this.summarizeScalarExpr(expr);
      case "field":
        return this.schema.getColumn(expr.table, expr.column).name;
      case "count":
        return "Number of " + this.schema.getTable(expr.table).name;
      default:
        throw new Error("Unsupported type " + expr.type);
    }
  };

  ExpressionBuilder.prototype.summarizeScalarExpr = function(expr) {
    var exprType, i, join, joinCol, len, ref, str, t;
    exprType = this.getExprType(expr.expr);
    if (expr.aggr) {
      str = _.findWhere(this.getAggrs(expr.expr), {
        id: expr.aggr
      }).name + " ";
    } else {
      str = "";
    }
    t = expr.table;
    ref = expr.joins;
    for (i = 0, len = ref.length; i < len; i++) {
      join = ref[i];
      joinCol = this.schema.getColumn(t, join);
      str += joinCol.name + " > ";
      t = joinCol.join.toTable;
    }
    if (expr.aggr && exprType === "count") {
      str = str.substring(0, str.length - 3);
    } else {
      str += this.summarizeExpr(expr.expr);
    }
    return str;
  };

  ExpressionBuilder.prototype.summarizeAggrExpr = function(expr, aggr) {
    var aggrName, exprType;
    exprType = this.getExprType(expr);
    if (aggr && exprType !== "count") {
      aggrName = _.findWhere(this.getAggrs(expr), {
        id: aggr
      }).name;
      return aggrName + " " + this.summarizeExpr(expr);
    } else {
      return this.summarizeExpr(expr);
    }
  };

  ExpressionBuilder.prototype.cleanExpr = function(expr, table) {
    if (!expr) {
      return null;
    }
    if (table && expr.type !== "literal" && expr.table !== table) {
      return null;
    }
    if (expr.table && !this.schema.getTable(expr.table)) {
      return null;
    }
    switch (expr.type) {
      case "field":
        return this.cleanFieldExpr(expr);
      case "scalar":
        return this.cleanScalarExpr(expr);
      case "comparison":
        return this.cleanComparisonExpr(expr);
      case "logical":
        return this.cleanLogicalExpr(expr);
      case "count":
        return expr;
      default:
        throw new Error("Unknown expression type " + expr.type);
    }
  };

  ExpressionBuilder.prototype.cleanFieldExpr = function(expr) {
    if (!expr.column || !expr.table) {
      return null;
    }
    if (!this.schema.getTable(expr.table)) {
      return null;
    }
    if (!this.schema.getColumn(expr.table, expr.column)) {
      return null;
    }
    return expr;
  };

  ExpressionBuilder.prototype.areJoinsValid = function(table, joins) {
    var i, j, joinCol, len, t;
    t = table;
    for (i = 0, len = joins.length; i < len; i++) {
      j = joins[i];
      joinCol = this.schema.getColumn(t, j);
      if (!joinCol) {
        return false;
      }
      t = joinCol.join.toTable;
    }
    return true;
  };

  ExpressionBuilder.prototype.cleanScalarExpr = function(expr) {
    var ref;
    if (!this.areJoinsValid(expr.table, expr.joins)) {
      return null;
    }
    if (expr.aggr && !this.isMultipleJoins(expr.table, expr.joins)) {
      expr = _.omit(expr, "aggr");
    }
    if (this.isMultipleJoins(expr.table, expr.joins) && (ref = expr.aggr, indexOf.call(_.pluck(this.getAggrs(expr.expr), "id"), ref) < 0)) {
      expr = _.extend({}, expr, {
        aggr: this.getAggrs(expr.expr)[0].id
      });
    }
    if (expr.where) {
      expr.where = this.cleanExpr(expr.where);
    }
    return expr;
  };

  ExpressionBuilder.prototype.cleanComparisonExpr = function(expr) {
    var ref, ref1;
    expr = _.extend({}, expr, {
      lhs: this.cleanExpr(expr.lhs, expr.table)
    });
    if (!expr.lhs) {
      expr = {
        type: "comparison",
        table: expr.table
      };
    }
    if (expr.op && (ref = expr.op, indexOf.call(_.pluck(this.getComparisonOps(this.getExprType(expr.lhs)), "id"), ref) < 0)) {
      expr = _.omit(expr, "op");
    }
    if (expr.lhs && !expr.op) {
      expr = _.extend({}, expr, {
        op: this.getComparisonOps(this.getExprType(expr.lhs))[0].id
      });
    }
    if (expr.op && expr.rhs && expr.lhs) {
      if (this.getComparisonRhsType(this.getExprType(expr.lhs), expr.op) !== this.getExprType(expr.rhs)) {
        expr = _.omit(expr, "rhs");
      } else if (this.getComparisonRhsType(this.getExprType(expr.lhs), expr.op) === "enum") {
        if (expr.rhs.type === "literal" && (ref1 = expr.rhs.value, indexOf.call(_.pluck(this.getExprValues(expr.lhs), "id"), ref1) < 0)) {
          expr = _.omit(expr, "rhs");
        }
      } else if (this.getComparisonRhsType(this.getExprType(expr.lhs), expr.op) === "enum[]") {
        if (expr.rhs.type === "literal") {
          expr.rhs.value = _.intersection(_.pluck(this.getExprValues(expr.lhs), "id"), expr.rhs.value);
          if (expr.rhs.value.length === 0) {
            expr = _.omit(expr, "rhs");
          }
        }
      } else if (this.getComparisonRhsType(this.getExprType(expr.lhs), expr.op) === "text[]") {
        if (expr.rhs.type === "literal") {
          if (expr.rhs.value.length === 0) {
            expr = _.omit(expr, "rhs");
          }
        }
      }
    }
    return expr;
  };

  ExpressionBuilder.prototype.cleanLogicalExpr = function(expr) {
    return expr = _.extend({}, expr, {
      exprs: _.map(expr.exprs, (function(_this) {
        return function(e) {
          return _this.cleanComparisonExpr(e);
        };
      })(this))
    });
  };

  ExpressionBuilder.prototype.simplifyExpr = function(expr) {
    if (!expr) {
      return null;
    }
    if (expr.type === "scalar") {
      if (expr.joins.length === 0 && !expr.where) {
        return this.simplifyExpr(expr.expr);
      }
    }
    return expr;
  };

  ExpressionBuilder.prototype.areExprsEqual = function(expr1, expr2) {
    return _.isEqual(this.simplifyExpr(expr1), this.simplifyExpr(expr2));
  };

  ExpressionBuilder.prototype.getComparisonOps = function(lhsType) {
    var ops;
    ops = [];
    switch (lhsType) {
      case "integer":
      case "decimal":
        ops.push({
          id: "=",
          name: "equals"
        });
        ops.push({
          id: ">",
          name: "is greater than"
        });
        ops.push({
          id: ">=",
          name: "is greater or equal to"
        });
        ops.push({
          id: "<",
          name: "is less than"
        });
        ops.push({
          id: "<=",
          name: "is less than or equal to"
        });
        break;
      case "text":
        ops.push({
          id: "= any",
          name: "is one of"
        });
        ops.push({
          id: "=",
          name: "is"
        });
        ops.push({
          id: "~*",
          name: "matches"
        });
        break;
      case "date":
      case "datetime":
        ops.push({
          id: "between",
          name: "between"
        });
        ops.push({
          id: ">",
          name: "after"
        });
        ops.push({
          id: "<",
          name: "before"
        });
        break;
      case "enum":
        ops.push({
          id: "= any",
          name: "is one of"
        });
        ops.push({
          id: "=",
          name: "is"
        });
        break;
      case "boolean":
        ops.push({
          id: "= true",
          name: "is true"
        });
        ops.push({
          id: "= false",
          name: "is false"
        });
    }
    ops.push({
      id: "is null",
      name: "has no value"
    });
    ops.push({
      id: "is not null",
      name: "has a value"
    });
    return ops;
  };

  ExpressionBuilder.prototype.getComparisonRhsType = function(lhsType, op) {
    if (op === '= true' || op === '= false' || op === 'is null' || op === 'is not null') {
      return null;
    }
    if (op === '= any') {
      if (lhsType === "enum") {
        return 'enum[]';
      } else if (lhsType === "text") {
        return "text[]";
      } else {
        throw new Error("Invalid lhs type for op = any");
      }
    }
    if (op === "between") {
      if (lhsType === "date") {
        return 'daterange';
      }
      if (lhsType === "datetime") {
        return 'datetimerange';
      } else {
        throw new Error("Invalid lhs type for op between");
      }
    }
    return lhsType;
  };

  ExpressionBuilder.prototype.getExprValues = function(expr) {
    var column;
    if (expr.type === "field") {
      column = this.schema.getColumn(expr.table, expr.column);
      return column.values;
    }
    if (expr.type === "scalar") {
      if (expr.expr) {
        return this.getExprValues(expr.expr);
      }
    }
  };

  ExpressionBuilder.prototype.stringifyExprLiteral = function(expr, literal) {
    var item, values;
    if (literal == null) {
      return "None";
    }
    values = this.getExprValues(expr);
    if (values) {
      item = _.findWhere(values, {
        id: literal
      });
      if (item) {
        return item.name;
      }
      return "???";
    }
    if (literal === true) {
      return "True";
    }
    if (literal === false) {
      return "False";
    }
    return "" + literal;
  };

  ExpressionBuilder.prototype.validateExpr = function(expr) {
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

  ExpressionBuilder.prototype.validateComparisonExpr = function(expr) {
    if (!expr.lhs) {
      return "Missing left-hand side";
    }
    if (!expr.op) {
      return "Missing operation";
    }
    return this.validateExpr(expr.lhs) || this.validateExpr(expr.rhs);
  };

  ExpressionBuilder.prototype.validateLogicalExpr = function(expr) {
    var error, i, len, ref, subexpr;
    error = null;
    ref = expr.exprs;
    for (i = 0, len = ref.length; i < len; i++) {
      subexpr = ref[i];
      error = error || this.validateExpr(subexpr);
    }
    return error;
  };

  ExpressionBuilder.prototype.validateScalarExpr = function(expr) {
    var error;
    if (!expr.table) {
      return "Missing expression";
    }
    error = this.validateExpr(expr.expr) || this.validateExpr(expr.where);
    return error;
  };

  return ExpressionBuilder;

})();
