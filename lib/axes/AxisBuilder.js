var AxisBuilder, ExpressionBuilder, ExpressionCompiler, _, d3Format, moment, xforms,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ = require('lodash');

ExpressionCompiler = require('../expressions/ExpressionCompiler');

ExpressionBuilder = require('../expressions/ExpressionBuilder');

d3Format = require('d3-format');

moment = require('moment');

xforms = [
  {
    type: "bin",
    input: "decimal",
    output: "enum"
  }, {
    type: "bin",
    input: "integer",
    output: "enum"
  }, {
    type: "date",
    input: "datetime",
    output: "date"
  }, {
    type: "year",
    input: "date",
    output: "date"
  }, {
    type: "year",
    input: "datetime",
    output: "date"
  }, {
    type: "yearmonth",
    input: "date",
    output: "date"
  }, {
    type: "yearmonth",
    input: "datetime",
    output: "date"
  }, {
    type: "month",
    input: "date",
    output: "enum"
  }, {
    type: "month",
    input: "datetime",
    output: "enum"
  }
];

module.exports = AxisBuilder = (function() {
  function AxisBuilder(options) {
    this.schema = options.schema;
    this.exprBuilder = new ExpressionBuilder(this.schema);
  }

  AxisBuilder.prototype.cleanAxis = function(options) {
    var aggrs, axis, ref, type, xform;
    if (!options.axis) {
      return;
    }
    axis = _.clone(options.axis);
    axis.expr = this.exprBuilder.cleanExpr(axis.expr, options.table);
    type = this.exprBuilder.getExprType(axis.expr);
    if (!type) {
      return;
    }
    if (axis.xform) {
      xform = _.find(xforms, function(xf) {
        var ref;
        if (xf.type !== axis.xform.type) {
          return false;
        }
        if (xf.input !== type) {
          return false;
        }
        if (options.types && (ref = xf.output, indexOf.call(options.types, ref) < 0)) {
          return false;
        }
        return true;
      });
      if (!xform) {
        delete axis.xform;
      }
    }
    if (!axis.xform && options.types && indexOf.call(options.types, type) < 0) {
      xform = _.find(xforms, function(xf) {
        var ref;
        return xf.input === type && (ref = xf.output, indexOf.call(options.types, ref) >= 0);
      });
      if (xform) {
        axis.xform = {
          type: xform.type
        };
        type = xform.output;
      } else {
        if (options.aggrNeed === "none") {
          return null;
        }
        if (indexOf.call(options.types, "integer") < 0) {
          return null;
        }
      }
    }
    if (axis.xform && axis.xform.type === "bin" && !axis.xform.numBins) {
      axis.xform.numBins = 6;
    }
    if (axis.xform) {
      delete axis.aggr;
    } else {
      aggrs = this.exprBuilder.getAggrs(axis.expr);
      aggrs = _.filter(aggrs, function(aggr) {
        return aggr.id !== "last";
      });
      if (axis.aggr && (ref = axis.aggr, indexOf.call(_.pluck(aggrs, "id"), ref) < 0)) {
        delete axis.aggr;
      }
      if (options.aggrNeed === "none") {
        delete axis.aggr;
      }
      if (options.aggrNeed === "required" && aggrs[0] && !axis.aggr) {
        axis.aggr = aggrs[0].id;
      }
      if (options.aggrNeed !== "none" && !axis.aggrs) {
        if (this.exprBuilder.getExprType(axis.expr) === "count") {
          axis.aggr = "count";
        }
      }
      if (options.types && indexOf.call(options.types, "integer") >= 0 && indexOf.call(options.types, type) < 0) {
        axis.aggr = "count";
      }
    }
    return axis;
  };

  AxisBuilder.prototype.validateAxis = function(options) {
    if (!options.axis) {
      return;
    }
    if (options.axis.xform && options.axis.xform.type === "bin") {
      if (!options.axis.xform.numBins) {
        return "Missing numBins";
      }
      if (options.axis.xform.min == null) {
        return "Missing min";
      }
      if (options.axis.xform.max == null) {
        return "Missing max";
      }
    }
    return this.exprBuilder.validateExpr(options.axis.expr);
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
    if (options.axis.xform) {
      if (options.axis.xform.type === "bin") {
        compiledExpr = {
          type: "op",
          op: "width_bucket",
          exprs: [compiledExpr, options.axis.xform.min, options.axis.xform.max, options.axis.xform.numBins]
        };
      }
      if (options.axis.xform.type === "date") {
        compiledExpr = {
          type: "op",
          op: "substr",
          exprs: [compiledExpr, 1, 10]
        };
      }
      if (options.axis.xform.type === "year") {
        compiledExpr = {
          type: "op",
          op: "rpad",
          exprs: [
            {
              type: "op",
              op: "substr",
              exprs: [compiledExpr, 1, 4]
            }, 10, "-01-01"
          ]
        };
      }
      if (options.axis.xform.type === "yearmonth") {
        compiledExpr = {
          type: "op",
          op: "rpad",
          exprs: [
            {
              type: "op",
              op: "substr",
              exprs: [compiledExpr, 1, 7]
            }, 10, "-01"
          ]
        };
      }
      if (options.axis.xform.type === "month") {
        compiledExpr = {
          type: "op",
          op: "substr",
          exprs: [compiledExpr, 6, 2]
        };
      }
    }
    if (options.axis.aggr) {
      compiledExpr = {
        type: "op",
        op: options.axis.aggr,
        exprs: _.compact([compiledExpr])
      };
    }
    return compiledExpr;
  };

  AxisBuilder.prototype.getExprTypes = function(types, aggrNeed) {
    var j, len, ref, xform;
    if (!types) {
      return null;
    }
    if (aggrNeed !== "none" && indexOf.call(types, "integer") >= 0) {
      return ["text", "decimal", "integer", "date", "datetime", "boolean", "enum"];
    }
    types = types.slice();
    for (j = 0, len = xforms.length; j < len; j++) {
      xform = xforms[j];
      if (ref = xform.output, indexOf.call(types, ref) >= 0) {
        types = _.union(types, [xform.input]);
      }
    }
    return types;
  };

  AxisBuilder.prototype.getCategories = function(axis, values) {
    var categories, current, end, format, i, j, k, max, min, numBins, precision, ref, ref1, ref2, start, year;
    if (axis.xform && axis.xform.type === "bin") {
      min = axis.xform.min;
      max = axis.xform.max;
      numBins = axis.xform.numBins;
      precision = d3Format.precisionFixed((max - min) / numBins);
      format = d3Format.format(",." + precision + "f");
      categories = [];
      categories.push({
        value: 0,
        label: "< " + (format(min))
      });
      for (i = j = 1, ref = numBins; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
        start = (i - 1) / numBins * (max - min) + min;
        end = i / numBins * (max - min) + min;
        categories.push({
          value: i,
          label: (format(start)) + " - " + (format(end))
        });
      }
      categories.push({
        value: axis.xform.numBins + 1,
        label: "> " + (format(max))
      });
      return categories;
    }
    if (axis.xform && axis.xform.type === "month") {
      return [
        {
          value: "01",
          label: "January"
        }, {
          value: "02",
          label: "February"
        }, {
          value: "03",
          label: "March"
        }, {
          value: "04",
          label: "April"
        }, {
          value: "05",
          label: "May"
        }, {
          value: "06",
          label: "June"
        }, {
          value: "07",
          label: "July"
        }, {
          value: "08",
          label: "August"
        }, {
          value: "09",
          label: "September"
        }, {
          value: "10",
          label: "October"
        }, {
          value: "11",
          label: "November"
        }, {
          value: "12",
          label: "December"
        }
      ];
    }
    if (axis.xform && axis.xform.type === "year") {
      values = _.compact(values);
      if (values.length === 0) {
        return [];
      }
      min = _.min(_.map(values, function(date) {
        return parseInt(date.substr(0, 4));
      }));
      max = _.max(_.map(values, function(date) {
        return parseInt(date.substr(0, 4));
      }));
      categories = [];
      for (year = k = ref1 = min, ref2 = max; ref1 <= ref2 ? k <= ref2 : k >= ref2; year = ref1 <= ref2 ? ++k : --k) {
        categories.push({
          value: year + "-01-01",
          label: "" + year
        });
      }
      return categories;
    }
    if (axis.xform && axis.xform.type === "yearmonth") {
      values = _.compact(values);
      if (values.length === 0) {
        return [];
      }
      min = values.sort()[0];
      max = values.sort().slice(-1)[0];
      current = moment(min, "YYYY-MM-DD");
      end = moment(max, "YYYY-MM-DD");
      categories = [];
      while (!current.isAfter(end)) {
        categories.push({
          value: current.format("YYYY-MM-DD"),
          label: current.format("MMM YYYY")
        });
        current.add(1, "months");
      }
      return categories;
    }
    switch (this.getAxisType(axis)) {
      case "enum":
        return _.map(this.exprBuilder.getExprValues(axis.expr), function(ev) {
          return {
            value: ev.id,
            label: ev.name
          };
        });
      case "integer":
        values = _.compact(values);
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
            label: v || "None"
          };
        });
      case "date":
        values = _.compact(values);
        if (values.length === 0) {
          return [];
        }
        min = values.sort()[0];
        max = values.sort().slice(-1)[0];
        current = moment(min, "YYYY-MM-DD");
        end = moment(max, "YYYY-MM-DD");
        categories = [];
        while (!current.isAfter(end)) {
          categories.push({
            value: current.format("YYYY-MM-DD"),
            label: current.format("ll")
          });
          current.add(1, "days");
        }
        return categories;
    }
    return [];
  };

  AxisBuilder.prototype.getAxisType = function(axis) {
    var type, xform;
    if (!axis) {
      return null;
    }
    if (axis.aggr === "count") {
      return "integer";
    }
    type = this.exprBuilder.getExprType(axis.expr);
    if (axis.xform) {
      xform = _.findWhere(xforms, {
        type: axis.xform.type,
        input: type
      });
      return xform.output;
    }
    return type;
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

  AxisBuilder.prototype.formatValue = function(axis, value) {
    var categories, category;
    if (value == null) {
      return "None";
    }
    categories = this.getCategories(axis, []);
    if (categories.length > 0) {
      category = _.findWhere(categories, {
        value: value
      });
      if (category) {
        return category.label;
      } else {
        return "???";
      }
    }
    if (_.isNumber(value)) {
      return d3Format.format(",")(value);
    }
    return "" + value;
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
