var AxisBuilder, ExprCleaner, ExprCompiler, ExprUtils, H, React, _, d3Format, epsilon, moment, uuid, xforms,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ = require('lodash');

uuid = require('uuid');

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
    type: "ranges",
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
    var aggrStatuses, axis, type, xform;
    if (!options.axis) {
      return;
    }
    axis = _.clone(options.axis);
    if (axis.aggr && axis.expr) {
      axis.expr = {
        type: "op",
        op: axis.aggr,
        table: axis.expr.table,
        exprs: (axis.aggr !== "count" ? [axis.expr] : [])
      };
      delete axis.aggr;
    }
    switch (options.aggrNeed) {
      case "none":
        aggrStatuses = ["literal", "individual"];
        break;
      case "optional":
        aggrStatuses = ["literal", "individual", "aggregate"];
        break;
      case "required":
        aggrStatuses = ["literal", "aggregate"];
    }
    axis.expr = this.exprCleaner.cleanExpr(axis.expr, {
      table: options.table,
      aggrStatuses: aggrStatuses
    });
    if (!axis.expr) {
      return null;
    }
    type = this.exprUtils.getExprType(axis.expr);
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
    if (!axis.xform && options.types && type && indexOf.call(options.types, type) < 0) {
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
    if (axis.xform && axis.xform.type === "bin") {
      if (!axis.xform.numBins) {
        axis.xform.numBins = 5;
      }
    }
    if (axis.xform && axis.xform.type === "ranges") {
      if (!axis.xform.ranges) {
        axis.xform.ranges = [
          {
            id: uuid(),
            minOpen: false,
            maxOpen: true
          }
        ];
      }
    }
    return axis;
  };

  AxisBuilder.prototype.validateAxis = function(options) {
    var j, len, range, ref;
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
      if (options.axis.xform.max < options.axis.xform.min) {
        return "Max < min";
      }
    }
    if (options.axis.xform && options.axis.xform.type === "ranges") {
      if (!options.axis.xform.ranges || !_.isArray(options.axis.xform.ranges)) {
        return "Missing ranges";
      }
      ref = options.axis.xform.ranges;
      for (j = 0, len = ref.length; j < len; j++) {
        range = ref[j];
        if ((range.minValue != null) && (range.maxValue != null) && range.minValue > range.maxValue) {
          return "Max < min";
        }
      }
    }
  };

  AxisBuilder.prototype.compileAxis = function(options) {
    var cases, compiledExpr, expr, exprCompiler, j, len, max, min, range, ref, thresholds, whens;
    if (!options.axis) {
      return null;
    }
    expr = options.axis.expr;
    if (options.axis.aggr) {
      expr = {
        type: "op",
        op: options.axis.aggr,
        table: expr.table,
        exprs: (options.axis.aggr !== "count" ? [expr] : [])
      };
    }
    exprCompiler = new ExprCompiler(this.schema);
    compiledExpr = exprCompiler.compileExpr({
      expr: expr,
      tableAlias: options.tableAlias
    });
    if (options.axis.xform) {
      if (options.axis.xform.type === "bin") {
        min = options.axis.xform.min;
        max = options.axis.xform.max;
        if (max === min) {
          max += epsilon;
        }
        if (max === min) {
          max = min * 1.00001;
        }
        if (options.axis.xform.excludeUpper) {
          thresholds = _.map(_.range(0, options.axis.xform.numBins), function(bin) {
            return min + (max - min) * bin / options.axis.xform.numBins;
          });
          thresholds.push(max + epsilon);
          compiledExpr = {
            type: "op",
            op: "width_bucket",
            exprs: [
              {
                type: "op",
                op: "::decimal",
                exprs: [compiledExpr]
              }, {
                type: "literal",
                value: thresholds
              }
            ]
          };
        } else {
          compiledExpr = {
            type: "op",
            op: "width_bucket",
            exprs: [compiledExpr, min, max, options.axis.xform.numBins]
          };
        }
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
      if (options.axis.xform.type === "ranges") {
        cases = [];
        ref = options.axis.xform.ranges;
        for (j = 0, len = ref.length; j < len; j++) {
          range = ref[j];
          whens = [];
          if (range.minValue != null) {
            if (range.minOpen) {
              whens.push({
                type: "op",
                op: ">",
                exprs: [compiledExpr, range.minValue]
              });
            } else {
              whens.push({
                type: "op",
                op: ">=",
                exprs: [compiledExpr, range.minValue]
              });
            }
          }
          if (range.maxValue != null) {
            if (range.maxOpen) {
              whens.push({
                type: "op",
                op: "<",
                exprs: [compiledExpr, range.maxValue]
              });
            } else {
              whens.push({
                type: "op",
                op: "<=",
                exprs: [compiledExpr, range.maxValue]
              });
            }
          }
          if (whens.length > 1) {
            cases.push({
              when: {
                type: "op",
                op: "and",
                exprs: whens
              },
              then: range.id
            });
          } else if (whens.length === 1) {
            cases.push({
              when: whens[0],
              then: range.id
            });
          }
        }
        if (cases.length > 0) {
          compiledExpr = {
            type: "case",
            cases: cases
          };
        } else {
          compiledExpr = null;
        }
      }
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
      op: "max",
      exprs: [
        {
          type: "field",
          tableAlias: "inner",
          column: "val"
        }
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

  AxisBuilder.prototype.getExprTypes = function(types) {
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
    return types;
  };

  AxisBuilder.prototype.getValueColor = function(axis, value) {
    var item;
    item = _.find(axis.colorMap, (function(_this) {
      return function(item) {
        return item.value === value;
      };
    })(this));
    if (item) {
      return item.color;
    }
    return null;
  };

  AxisBuilder.prototype.getCategories = function(axis, values, locale) {
    var categories, current, end, format, hasNone, i, j, k, max, min, noneCategory, numBins, precision, ref, ref1, ref2, start, year;
    noneCategory = {
      value: null,
      label: axis.nullLabel || "None"
    };
    if (axis.xform && axis.xform.type === "ranges") {
      return _.map(axis.xform.ranges, (function(_this) {
        return function(range) {
          var label;
          label = range.label || "";
          if (!label) {
            if (range.minValue != null) {
              if (range.minOpen) {
                label = "> " + range.minValue;
              } else {
                label = ">= " + range.minValue;
              }
            }
            if (range.maxValue != null) {
              if (label) {
                label += " and ";
              }
              if (range.maxOpen) {
                label += "< " + range.maxValue;
              } else {
                label += "<= " + range.maxValue;
              }
            }
          }
          return {
            value: range.id,
            label: label
          };
        };
      })(this)).concat([noneCategory]);
    }
    if (axis.xform && axis.xform.type === "bin") {
      min = axis.xform.min;
      max = axis.xform.max;
      numBins = axis.xform.numBins;
      if ((min == null) || (max == null) || !numBins) {
        return [];
      }
      if ((max - min) <= epsilon || Math.abs((max - min) / (max + min)) < 0.0001) {
        return [
          {
            value: 0,
            label: "< " + min
          }, {
            value: 1,
            label: "= " + min
          }, {
            value: axis.xform.numBins + 1,
            label: "> " + min
          }, noneCategory
        ];
      }
      precision = d3Format.precisionFixed((max - min) / numBins);
      if (_.isNaN(precision)) {
        throw new Error("Min/max errors: " + min + " " + max + " " + numBins);
      }
      format = d3Format.format(",." + precision + "f");
      categories = [];
      if (!axis.xform.excludeLower) {
        categories.push({
          value: 0,
          label: "< " + (format(min))
        });
      }
      for (i = j = 1, ref = numBins; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
        start = (i - 1) / numBins * (max - min) + min;
        end = i / numBins * (max - min) + min;
        categories.push({
          value: i,
          label: (format(start)) + " - " + (format(end))
        });
      }
      if (!axis.xform.excludeUpper) {
        categories.push({
          value: axis.xform.numBins + 1,
          label: "> " + (format(max))
        });
      }
      categories.push(noneCategory);
      return categories;
    }
    if (axis.xform && axis.xform.type === "month") {
      categories = [
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
      if (_.any(values, function(v) {
        return v == null;
      })) {
        categories.push(noneCategory);
      }
      return categories;
    }
    if (axis.xform && axis.xform.type === "year") {
      hasNone = _.any(values, function(v) {
        return v == null;
      });
      values = _.compact(values);
      if (values.length === 0) {
        return [noneCategory];
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
        if (categories.length >= 1000) {
          break;
        }
      }
      if (hasNone) {
        categories.push(noneCategory);
      }
      return categories;
    }
    if (axis.xform && axis.xform.type === "yearmonth") {
      hasNone = _.any(values, function(v) {
        return v == null;
      });
      values = _.compact(values);
      if (values.length === 0) {
        return [noneCategory];
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
        if (categories.length >= 1000) {
          break;
        }
      }
      if (hasNone) {
        categories.push(noneCategory);
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
        }).concat([noneCategory]);
      case "text":
        hasNone = _.any(values, function(v) {
          return v == null;
        });
        categories = _.map(_.compact(_.uniq(values)).sort(), function(v) {
          return {
            value: v,
            label: v || "None"
          };
        });
        if (hasNone) {
          categories.push(noneCategory);
        }
        return categories;
      case "boolean":
        return [
          {
            value: true,
            label: "True"
          }, {
            value: false,
            label: "False"
          }, noneCategory
        ];
      case "date":
        values = _.compact(values);
        if (values.length === 0) {
          return [noneCategory];
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
          if (categories.length >= 1000) {
            break;
          }
        }
        categories.push(noneCategory);
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

  AxisBuilder.prototype.isAxisAggr = function(axis) {
    return axis.aggr || this.exprUtils.getExprAggrStatus(axis.expr) === "aggregate";
  };

  AxisBuilder.prototype.summarizeAxis = function(axis, locale) {
    if (!axis) {
      return "None";
    }
    return this.exprUtils.summarizeExpr(axis.expr, locale);
  };

  AxisBuilder.prototype.formatValue = function(axis, value, locale) {
    var categories, category, format, num, type;
    if (value == null) {
      return axis.nullLabel || "None";
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
        format = d3Format.format(axis.format != null ? axis.format : ",");
        return format(num);
      case "text[]":
        if (_.isString(value)) {
          value = JSON.parse(value);
        }
        return H.div(null, _.map(value, function(v, i) {
          return H.div({
            key: i
          }, v);
        }));
      case "date":
        return moment(value, moment.ISO_8601).format("ll");
      case "datetime":
        return moment(value, moment.ISO_8601).format("lll");
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

  AxisBuilder.prototype.isCategorical = function(axis) {
    var nonCategoricalTypes, type;
    nonCategoricalTypes = ["bin", "ranges", "date", "yearmonth"];
    if (axis.xform) {
      type = axis.xform.type;
    } else {
      type = this.exprUtils.getExprType(axis.expr);
    }
    return nonCategoricalTypes.indexOf(type) === -1;
  };

  return AxisBuilder;

})();
