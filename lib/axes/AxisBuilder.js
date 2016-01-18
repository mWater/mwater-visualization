var AxisBuilder, ExprCleaner, ExprCompiler, ExprUtils, H, React, _, d3Format, epsilon, moment, xforms,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ = require('lodash');

ExprCompiler = require('mwater-expressions').ExprCompiler;

ExprUtils = require('mwater-expressions').ExprUtils;

ExprCleaner = require('mwater-expressions').ExprCleaner;

d3Format = require('d3-format');

moment = require('moment');

React = require('react');

H = React.DOM;

xforms = [
  {
    type: "bin",
    input: "number",
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

epsilon = 0.000000001;

module.exports = AxisBuilder = (function() {
  function AxisBuilder(options) {
    this.schema = options.schema;
    this.exprUtils = new ExprUtils(this.schema);
    this.exprCleaner = new ExprCleaner(this.schema);
  }

  AxisBuilder.prototype.cleanAxis = function(options) {
    var aggrs, axis, ref, type, xform;
    if (!options.axis) {
      return;
    }
    axis = _.clone(options.axis);
    axis.expr = this.exprCleaner.cleanExpr(axis.expr, {
      table: options.table
    });
    type = this.exprUtils.getExprType(axis.expr);
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
        if (indexOf.call(options.types, "number") < 0 || type !== "id") {
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
      aggrs = this.exprUtils.getAggrs(axis.expr);
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
        if (this.exprUtils.getExprType(axis.expr) === "id") {
          axis.aggr = "count";
        }
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
    }
  };

  AxisBuilder.prototype.compileAxis = function(options) {
    var compiledExpr, exprCompiler, maxExpr, minExpr;
    if (!options.axis) {
      return null;
    }
    exprCompiler = new ExprCompiler(this.schema);
    compiledExpr = exprCompiler.compileExpr({
      expr: options.axis.expr,
      tableAlias: options.tableAlias,
      aggr: options.axis.aggr
    });
    if (options.axis.xform) {
      if (options.axis.xform.type === "bin") {
        minExpr = options.axis.xform.min || this.compileBinRange(options.axis.expr, options.axis.expr.table, options.axis.xform.numBins, "min");
        maxExpr = options.axis.xform.max || this.compileBinRange(options.axis.expr, options.axis.expr.table, options.axis.xform.numBins, "max");
        compiledExpr = {
          type: "op",
          op: "||",
          exprs: [
            {
              type: "op",
              op: "width_bucket",
              exprs: [compiledExpr, minExpr, maxExpr, options.axis.xform.numBins]
            }, ":", minExpr, ":", maxExpr
          ]
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

  AxisBuilder.prototype.compileBinMinMax = function(expr, table, filterExpr, numBins) {
    var compiledExpr, compiledFilterExpr, exprCompiler, maxExpr, minExpr, query, where;
    exprCompiler = new ExprCompiler(this.schema);
    compiledExpr = exprCompiler.compileExpr({
      expr: expr,
      tableAlias: "binrange"
    });
    minExpr = {
      type: "op",
      op: "min",
      exprs: [
        {
          type: "field",
          tableAlias: "inner",
          column: "val"
        }
      ]
    };
    maxExpr = {
      type: "op",
      op: "+",
      exprs: [
        {
          type: "op",
          op: "max",
          exprs: [
            {
              type: "field",
              tableAlias: "inner",
              column: "val"
            }
          ]
        }, epsilon
      ]
    };
    where = {
      type: "op",
      op: "is not null",
      exprs: [compiledExpr]
    };
    if (filterExpr) {
      compiledFilterExpr = exprCompiler.compileExpr({
        expr: filterExpr,
        tableAlias: "binrange"
      });
      if (compiledFilterExpr) {
        where = {
          type: "op",
          op: "and",
          exprs: [where, compiledFilterExpr]
        };
      }
    }
    query = {
      type: "query",
      selects: [
        {
          type: "select",
          expr: minExpr,
          alias: "min"
        }, {
          type: "select",
          expr: maxExpr,
          alias: "max"
        }
      ],
      from: {
        type: "subquery",
        query: {
          type: "query",
          selects: [
            {
              type: "select",
              expr: compiledExpr,
              alias: "val"
            }, {
              type: "select",
              expr: {
                type: "op",
                op: "ntile",
                exprs: [numBins + 2]
              },
              over: {
                orderBy: [
                  {
                    expr: compiledExpr,
                    direction: "asc"
                  }
                ]
              },
              alias: "ntilenum"
            }
          ],
          from: {
            type: "table",
            table: table,
            alias: "binrange"
          },
          where: where
        },
        alias: "inner"
      },
      where: {
        type: "op",
        op: "between",
        exprs: [
          {
            type: "field",
            tableAlias: "inner",
            column: "ntilenum"
          }, 2, numBins + 1
        ]
      }
    };
    return query;
  };

  AxisBuilder.prototype.compileBinRange = function(expr, table, numBins, minOrMax) {
    var compiledExpr, exprCompiler, minMaxExpr, query;
    exprCompiler = new ExprCompiler(this.schema);
    compiledExpr = exprCompiler.compileExpr({
      expr: expr,
      tableAlias: "binrange"
    });
    minMaxExpr = {
      type: "op",
      op: minOrMax,
      exprs: [
        {
          type: "field",
          tableAlias: "inner",
          column: "val"
        }
      ]
    };
    if (minOrMax === "max") {
      minMaxExpr = {
        type: "op",
        op: "+",
        exprs: [minMaxExpr, epsilon]
      };
    }
    query = {
      type: "scalar",
      expr: minMaxExpr,
      from: {
        type: "subquery",
        query: {
          type: "query",
          selects: [
            {
              type: "select",
              expr: compiledExpr,
              alias: "val"
            }, {
              type: "select",
              expr: {
                type: "op",
                op: "ntile",
                exprs: [numBins + 2]
              },
              over: {
                orderBy: [
                  {
                    expr: compiledExpr,
                    direction: "asc"
                  }
                ]
              },
              alias: "ntilenum"
            }
          ],
          from: {
            type: "table",
            table: table,
            alias: "binrange"
          },
          where: {
            type: "op",
            op: "is not null",
            exprs: [compiledExpr]
          }
        },
        alias: "inner"
      },
      where: {
        type: "op",
        op: "between",
        exprs: [
          {
            type: "field",
            tableAlias: "inner",
            column: "ntilenum"
          }, 2, numBins + 1
        ]
      }
    };
    return query;
  };

  AxisBuilder.prototype.getExprTypes = function(types, aggrNeed) {
    var j, len, ref, xform;
    if (!types) {
      return null;
    }
    types = types.slice();
    for (j = 0, len = xforms.length; j < len; j++) {
      xform = xforms[j];
      if (ref = xform.output, indexOf.call(types, ref) >= 0) {
        types = _.union(types, [xform.input]);
      }
    }
    if (aggrNeed !== "none" && indexOf.call(types, "number") >= 0) {
      types = _.union(["id"], types);
    }
    return types;
  };

  AxisBuilder.prototype.getCategories = function(axis, values, locale) {
    var categories, current, end, format, i, j, k, max, min, numBins, precision, ref, ref1, ref2, start, value, year;
    if (axis.xform && axis.xform.type === "bin") {
      min = axis.xform.min;
      max = axis.xform.max;
      numBins = axis.xform.numBins;
      if ((min == null) || (max == null)) {
        value = _.find(values, function(v) {
          return v != null;
        });
        if (!value) {
          return [];
        }
        min = min || parseFloat(value.split(":")[1]);
        max = max || parseFloat(value.split(":")[2]);
      }
      if ((max - min) <= epsilon) {
        return [
          {
            value: "0:" + min + ":" + max,
            label: "< " + min
          }, {
            value: "1:" + min + ":" + max,
            label: "= " + min
          }, {
            value: (axis.xform.numBins + 1) + ":" + min + ":" + max,
            label: "> " + min
          }
        ];
      }
      precision = d3Format.precisionFixed((max - min) / numBins);
      format = d3Format.format(",." + precision + "f");
      categories = [];
      categories.push({
        value: "0:" + min + ":" + max,
        label: "< " + (format(min))
      });
      for (i = j = 1, ref = numBins; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
        start = (i - 1) / numBins * (max - min) + min;
        end = i / numBins * (max - min) + min;
        categories.push({
          value: i + ":" + min + ":" + max,
          label: (format(start)) + " - " + (format(end))
        });
      }
      categories.push({
        value: (axis.xform.numBins + 1) + ":" + min + ":" + max,
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
      case "enumset":
        return _.map(this.exprUtils.getExprEnumValues(axis.expr), function(ev) {
          return {
            value: ev.id,
            label: ExprUtils.localizeString(ev.name, locale)
          };
        });
      case "text":
        return _.map(_.uniq(values), function(v) {
          return {
            value: v,
            label: v || "None"
          };
        });
      case "boolean":
        return [
          {
            value: true,
            label: "True"
          }, {
            value: false,
            label: "False"
          }
        ];
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
      return "number";
    }
    type = this.exprUtils.getExprType(axis.expr);
    if (axis.xform) {
      xform = _.findWhere(xforms, {
        type: axis.xform.type,
        input: type
      });
      return xform.output;
    }
    return type;
  };

  AxisBuilder.prototype.summarizeAxis = function(axis, locale) {
    var aggrName, exprType;
    if (!axis) {
      return "None";
    }
    exprType = this.exprUtils.getExprType(axis.expr);
    if (axis.aggr && exprType !== "id") {
      aggrName = _.findWhere(this.exprUtils.getAggrs(axis.expr), {
        id: axis.aggr
      }).name;
      return aggrName + " " + this.exprUtils.summarizeExpr(axis.expr, locale);
    } else {
      return this.exprUtils.summarizeExpr(axis.expr, locale);
    }
  };

  AxisBuilder.prototype.formatValue = function(axis, value, locale) {
    var categories, category, num, type;
    if (value == null) {
      return "None";
    }
    type = this.getAxisType(axis);
    categories = this.getCategories(axis, [value], locale);
    if (categories.length > 0) {
      if (type === "enumset") {
        if (_.isString(value)) {
          value = JSON.parse(value);
        }
        return _.map(value, function(v) {
          var category;
          category = _.findWhere(categories, {
            value: v
          });
          if (category) {
            return category.label;
          } else {
            return "???";
          }
        }).join(", ");
      } else {
        category = _.findWhere(categories, {
          value: value
        });
        if (category) {
          return category.label;
        } else {
          return "???";
        }
      }
    }
    switch (type) {
      case "text":
        return value;
      case "number":
        num = parseFloat(value);
        return d3Format.format(",")(num);
      case "text[]":
        if (_.isString(value)) {
          value = JSON.parse(value);
        }
        return H.div(null, _.map(value, function(v, i) {
          return H.div({
            key: i
          }, v);
        }));
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
