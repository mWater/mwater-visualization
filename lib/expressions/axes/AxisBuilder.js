var AxisBuilder, ExpressionBuilder, ExpressionCompiler,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

ExpressionCompiler = require('../ExpressionCompiler');

ExpressionBuilder = require('../ExpressionBuilder');

module.exports = AxisBuilder = (function() {
  function AxisBuilder(axis) {
    this.schema = axis.schema;
    this.exprBuilder = new ExpressionBuilder(this.schema);
  }

  AxisBuilder.prototype.cleanAxis = function(axis, table, aggrNeed) {
    var aggrs, ref;
    if (aggrNeed == null) {
      aggrNeed = "optional";
    }
    if (!axis) {
      return;
    }
    axis = _.clone(axis);
    axis.expr = this.exprBuilder.cleanExpr(axis.expr, table);
    if (!this.exprBuilder.getExprType(axis.expr)) {
      return;
    }
    aggrs = this.exprBuilder.getAggrs(axis.expr);
    aggrs = _.filter(aggrs, function(aggr) {
      return aggr.id !== "last";
    });
    if (axis.aggr && (ref = axis.aggr, indexOf.call(_.pluck(aggrs, "id"), ref) < 0)) {
      delete axis.aggr;
    }
    if (aggrNeed === "none") {
      delete axis.aggr;
    }
    if (aggrNeed === "required" && aggrs[0] && !axis.aggr) {
      axis.aggr = aggrs[0].id;
    }
    if (aggrNeed !== "none" && !axis.aggrs) {
      if (this.exprBuilder.getExprType(axis.expr) === "count") {
        axis.aggr = "count";
      }
    }
    return axis;
  };

  AxisBuilder.prototype.compileAxis = function(options) {
    var compiledExpr, exprCompiler;
    if (!options.axis) {
      return null;
    }
    exprCompiler = new ExpressionCompiler(this.schema);
    compiledExpr = exprCompiler.compileExpr({
      expr: options.axis.expr,
      tableAlias: options.tableAlias,
      aggr: options.axis.aggr
    });
    if (options.axis.aggr) {
      compiledExpr = {
        type: "op",
        op: options.axis.aggr,
        exprs: _.compact([compiledExpr])
      };
    }
    return compiledExpr;
  };

  AxisBuilder.prototype.validateAxis = function(axis) {
    if (!axis) {
      return;
    }
    return this.exprBuilder.validateExpr(axis.expr);
  };

  AxisBuilder.prototype.getCategories = function(axis, values) {
    var max, min;
    switch (this.getAxisType(axis)) {
      case "enum":
        return _.map(this.exprBuilder.getExprValues(axis.expr), function(ev) {
          return {
            value: ev.id,
            label: ev.name
          };
        });
      case "integer":
        if (values.length === 0) {
          return [];
        }
        min = _.min(_.map(values, function(v) {
          return parseInt(v);
        }));
        max = _.max(_.map(values, function(v) {
          return parseInt(v);
        }));
        return _.map(_.range(min, max + 1), function(v) {
          return {
            value: v,
            label: "" + v
          };
        });
      case "text":
        return _.map(_.uniq(values), function(v) {
          return {
            value: v,
            label: v
          };
        });
    }
    return [];
  };

  AxisBuilder.prototype.getAxisType = function(axis) {
    if (!axis) {
      return null;
    }
    return this.exprBuilder.getExprType(axis.expr);
  };

  AxisBuilder.prototype.summarizeAxis = function(axis) {
    var aggrName, exprType;
    if (!axis) {
      return "None";
    }
    exprType = this.exprBuilder.getExprType(axis.expr);
    if (axis.aggr && exprType !== "count") {
      aggrName = _.findWhere(this.exprBuilder.getAggrs(axis.expr), {
        id: axis.aggr
      }).name;
      return aggrName + " " + this.exprBuilder.summarizeExpr(axis.expr);
    } else {
      return this.exprBuilder.summarizeExpr(axis.expr);
    }
  };

  AxisBuilder.prototype.stringifyLiteral = function(axis, value) {
    return this.exprBuilder.stringifyExprLiteral(axis.expr, value);
  };

  AxisBuilder.prototype.createValueFilter = function(axis, value) {
    if (value != null) {
      return {
        type: "op",
        op: "=",
        exprs: [
          this.compileAxis({
            axis: axis,
            tableAlias: "{alias}"
          }), {
            type: "literal",
            value: value
          }
        ]
      };
    } else {
      return {
        type: "op",
        op: "is null",
        exprs: [
          this.compileAxis({
            axis: axis,
            tableAlias: "{alias}"
          })
        ]
      };
    }
  };

  return AxisBuilder;

})();
