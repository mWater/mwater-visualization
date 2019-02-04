"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var AxisBuilder,
    ExprCleaner,
    ExprCompiler,
    ExprUtils,
    R,
    React,
    _,
    d3Format,
    epsilon,
    moment,
    uuid,
    xforms,
    indexOf = [].indexOf;

_ = require('lodash');
uuid = require('uuid');
ExprCompiler = require('mwater-expressions').ExprCompiler;
ExprUtils = require('mwater-expressions').ExprUtils;
ExprCleaner = require('mwater-expressions').ExprCleaner;
d3Format = require('d3-format');
moment = require('moment');
React = require('react');
R = React.createElement;
xforms = [{
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
}, {
  type: "week",
  input: "date",
  output: "enum"
}, {
  type: "week",
  input: "datetime",
  output: "enum"
}]; // Small number to prevent width_bucket errors on auto binning with only one value

epsilon = 0.000000001; // Understands axes. Contains methods to clean/validate etc. an axis of any type. 

module.exports = AxisBuilder =
/*#__PURE__*/
function () {
  // Options are: schema
  function AxisBuilder(options) {
    (0, _classCallCheck2.default)(this, AxisBuilder);
    this.schema = options.schema;
    this.exprUtils = new ExprUtils(this.schema);
    this.exprCleaner = new ExprCleaner(this.schema);
  } // Clean an axis with respect to a specific table
  // Options:
  //  axis: axis to clean
  //  table: table that axis is to be for
  //  aggrNeed is "none", "optional" or "required"
  //  types: optional list of types to require it to be one of


  (0, _createClass2.default)(AxisBuilder, [{
    key: "cleanAxis",
    value: function cleanAxis(options) {
      var aggrStatuses, axis, type, xform;

      if (!options.axis) {
        return;
      } // TODO always clones


      axis = _.clone(options.axis); // Move aggr inside since aggr is deprecated at axis level

      if (axis.aggr && axis.expr) {
        axis.expr = {
          type: "op",
          op: axis.aggr,
          table: axis.expr.table,
          exprs: axis.aggr !== "count" ? [axis.expr] : []
        };
        delete axis.aggr;
      } // Determine aggrStatuses that are possible


      switch (options.aggrNeed) {
        case "none":
          aggrStatuses = ["literal", "individual"];
          break;

        case "optional":
          aggrStatuses = ["literal", "individual", "aggregate"];
          break;

        case "required":
          aggrStatuses = ["literal", "aggregate"];
      } // Clean expression


      axis.expr = this.exprCleaner.cleanExpr(axis.expr, {
        table: options.table,
        aggrStatuses: aggrStatuses
      }); // Allow no type here, as if/then has no type temporarily

      if (!axis.expr) {
        return null;
      }

      type = this.exprUtils.getExprType(axis.expr); // Validate xform type

      if (axis.xform) {
        // Find valid xform
        xform = _.find(xforms, function (xf) {
          var ref; // xform type must match

          if (xf.type !== axis.xform.type) {
            return false;
          } // Input type must match


          if (xf.input !== type) {
            return false;
          } // Output type must match


          if (options.types && (ref = xf.output, indexOf.call(options.types, ref) < 0)) {
            return false;
          }

          return true;
        });

        if (!xform) {
          delete axis.xform;
        }
      } // If no xform and using an xform would allow satisfying output types, pick first


      if (!axis.xform && options.types && type && indexOf.call(options.types, type) < 0) {
        xform = _.find(xforms, function (xf) {
          var ref;
          return xf.input === type && (ref = xf.output, indexOf.call(options.types, ref) >= 0);
        });

        if (xform) {
          axis.xform = {
            type: xform.type
          };
          type = xform.output;
        } else {
          // Unredeemable if no xform possible and cannot use count to get number
          if (options.aggrNeed === "none") {
            return null;
          }

          if (indexOf.call(options.types, "number") < 0 || type !== "id") {
            return null;
          }
        }
      }

      if (axis.xform && axis.xform.type === "bin") {
        // Add number of bins
        if (!axis.xform.numBins) {
          axis.xform.numBins = 5;
        }
      }

      if (axis.xform && axis.xform.type === "ranges") {
        // Add ranges
        if (!axis.xform.ranges) {
          axis.xform.ranges = [{
            id: uuid(),
            minOpen: false,
            maxOpen: true
          }];
        }
      }

      return axis;
    } // Checks whether an axis is valid
    //  axis: axis to validate

  }, {
    key: "validateAxis",
    value: function validateAxis(options) {
      var j, len, range, ref; // Nothing is ok

      if (!options.axis) {
        return;
      } // xform validation


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
      } // xform validation


      if (options.axis.xform && options.axis.xform.type === "ranges") {
        if (!options.axis.xform.ranges || !_.isArray(options.axis.xform.ranges)) {
          return "Missing ranges";
        }

        ref = options.axis.xform.ranges;

        for (j = 0, len = ref.length; j < len; j++) {
          range = ref[j];

          if (range.minValue != null && range.maxValue != null && range.minValue > range.maxValue) {
            return "Max < min";
          }
        }
      }
    } // Pass axis, tableAlias

  }, {
    key: "compileAxis",
    value: function compileAxis(options) {
      var cases, compiledExpr, expr, exprCompiler, j, len, max, min, range, ref, thresholds, whens;

      if (!options.axis) {
        return null;
      } // Legacy support of aggr


      expr = options.axis.expr;

      if (options.axis.aggr) {
        expr = {
          type: "op",
          op: options.axis.aggr,
          table: expr.table,
          exprs: options.axis.aggr !== "count" ? [expr] : []
        };
      }

      exprCompiler = new ExprCompiler(this.schema);
      compiledExpr = exprCompiler.compileExpr({
        expr: expr,
        tableAlias: options.tableAlias
      }); // Bin

      if (options.axis.xform) {
        if (options.axis.xform.type === "bin") {
          min = options.axis.xform.min;
          max = options.axis.xform.max; // Add epsilon to prevent width_bucket from crashing

          if (max === min) {
            max += epsilon;
          }

          if (max === min) {
            // If was too big to add epsilon
            max = min * 1.00001;
          } // Special case for excludeUpper as we need to include upper bound (e.g. 100 for percentages) in the lower bin. Do it by adding epsilon


          if (options.axis.xform.excludeUpper) {
            thresholds = _.map(_.range(0, options.axis.xform.numBins), function (bin) {
              return min + (max - min) * bin / options.axis.xform.numBins;
            });
            thresholds.push(max + epsilon);
            compiledExpr = {
              type: "op",
              op: "width_bucket",
              exprs: [{
                type: "op",
                op: "::decimal",
                exprs: [compiledExpr]
              }, {
                type: "literal",
                value: thresholds
              }]
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
            exprs: [{
              type: "op",
              op: "substr",
              exprs: [compiledExpr, 1, 4]
            }, 10, "-01-01"]
          };
        }

        if (options.axis.xform.type === "yearmonth") {
          compiledExpr = {
            type: "op",
            op: "rpad",
            exprs: [{
              type: "op",
              op: "substr",
              exprs: [compiledExpr, 1, 7]
            }, 10, "-01"]
          };
        }

        if (options.axis.xform.type === "month") {
          compiledExpr = {
            type: "op",
            op: "substr",
            exprs: [compiledExpr, 6, 2]
          };
        }

        if (options.axis.xform.type === "week") {
          compiledExpr = {
            type: "op",
            op: "to_char",
            exprs: [{
              type: "op",
              op: "::date",
              exprs: [compiledExpr]
            }, "IW"]
          };
        } // Ranges


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
    } // Create query to get min and max for a nice binning. Returns one row with "min" and "max" fields
    // To do so, split into numBins + 2 percentile sections and exclude first and last
    // That will give a nice distribution when using width_bucket so that all are used
    // select max(inner.val), min(inner.val) f
    // from (select expression as val, ntile(numBins + 2) over (order by expression asc) as ntilenum
    // from the_table where exprssion is not null)
    // where inner.ntilenum > 1 and inner.ntilenum < numBins + 2
    // Inspired by: http://dba.stackexchange.com/questions/17086/fast-general-method-to-calculate-percentiles
    // expr is mwater expression on table
    // filterExpr is optional filter on values to include

  }, {
    key: "compileBinMinMax",
    value: function compileBinMinMax(expr, table, filterExpr, numBins) {
      var compiledExpr, compiledFilterExpr, exprCompiler, maxExpr, minExpr, query, where;
      exprCompiler = new ExprCompiler(this.schema);
      compiledExpr = exprCompiler.compileExpr({
        expr: expr,
        tableAlias: "binrange"
      }); // Create expression that selects the min or max

      minExpr = {
        type: "op",
        op: "min",
        exprs: [{
          type: "field",
          tableAlias: "inner",
          column: "val"
        }]
      };
      maxExpr = {
        type: "op",
        op: "max",
        exprs: [{
          type: "field",
          tableAlias: "inner",
          column: "val"
        }]
      }; // Only include not null values

      where = {
        type: "op",
        op: "is not null",
        exprs: [compiledExpr]
      }; // If filtering, compile and add to inner where

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
        selects: [{
          type: "select",
          expr: minExpr,
          alias: "min"
        }, {
          type: "select",
          expr: maxExpr,
          alias: "max"
        }],
        from: {
          type: "subquery",
          query: {
            type: "query",
            selects: [{
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
                orderBy: [{
                  expr: compiledExpr,
                  direction: "asc"
                }]
              },
              alias: "ntilenum"
            }],
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
          exprs: [{
            type: "field",
            tableAlias: "inner",
            column: "ntilenum"
          }, 2, numBins + 1]
        }
      };
      return query;
    } // Get underlying expression types that will give specified output expression types
    //  types: array of types

  }, {
    key: "getExprTypes",
    value: function getExprTypes(types) {
      var j, len, ref, xform;

      if (!types) {
        return null;
      }

      types = types.slice(); // Add xformed types

      for (j = 0, len = xforms.length; j < len; j++) {
        xform = xforms[j];

        if (ref = xform.output, indexOf.call(types, ref) >= 0) {
          types = _.union(types, [xform.input]);
        }
      }

      return types;
    } // Gets the color for a value (if in colorMap)

  }, {
    key: "getValueColor",
    value: function getValueColor(axis, value) {
      var item;
      item = _.find(axis.colorMap, function (item) {
        return item.value === value;
      });

      if (item) {
        return item.color;
      }

      return null;
    } // Get all categories for a given axis type given the known values
    // Returns array of { value, label }

  }, {
    key: "getCategories",
    value: function getCategories(axis, values, locale) {
      var categories, current, end, format, hasNone, i, j, k, l, max, min, noneCategory, numBins, precision, ref, ref1, ref2, start, value, week, year;
      noneCategory = {
        value: null,
        label: axis.nullLabel || "None"
      }; // Handle ranges

      if (axis.xform && axis.xform.type === "ranges") {
        return _.map(axis.xform.ranges, function (range) {
          var label;
          label = range.label || "";

          if (!label) {
            if (range.minValue != null) {
              if (range.minOpen) {
                label = "> ".concat(range.minValue);
              } else {
                label = ">= ".concat(range.minValue);
              }
            }

            if (range.maxValue != null) {
              if (label) {
                label += " and ";
              }

              if (range.maxOpen) {
                label += "< ".concat(range.maxValue);
              } else {
                label += "<= ".concat(range.maxValue);
              }
            }
          }

          return {
            value: range.id,
            label: label
          };
        }).concat([noneCategory]);
      } // Handle binning 


      if (axis.xform && axis.xform.type === "bin") {
        min = axis.xform.min;
        max = axis.xform.max;
        numBins = axis.xform.numBins; // If not ready, no categories

        if (min == null || max == null || !numBins) {
          return [];
        } // Special case of single value (min and max within epsilon or 0.01% of each other since epsilon might be too small to add to a big number)


        if (max - min <= epsilon || Math.abs((max - min) / (max + min)) < 0.0001) {
          return [{
            value: 0,
            label: "< ".concat(min)
          }, {
            value: 1,
            label: "= ".concat(min)
          }, {
            value: axis.xform.numBins + 1,
            label: "> ".concat(min)
          }, noneCategory];
        } // Calculate precision


        precision = d3Format.precisionFixed((max - min) / numBins);

        if (_.isNaN(precision)) {
          throw new Error("Min/max errors: ".concat(min, " ").concat(max, " ").concat(numBins));
        }

        format = d3Format.format(",." + precision + "f");
        categories = [];

        if (!axis.xform.excludeLower) {
          categories.push({
            value: 0,
            label: "< ".concat(format(min))
          });
        }

        for (i = j = 1, ref = numBins; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
          start = (i - 1) / numBins * (max - min) + min;
          end = i / numBins * (max - min) + min;
          categories.push({
            value: i,
            label: "".concat(format(start), " - ").concat(format(end))
          });
        }

        if (!axis.xform.excludeUpper) {
          categories.push({
            value: axis.xform.numBins + 1,
            label: "> ".concat(format(max))
          });
        }

        categories.push(noneCategory);
        return categories;
      }

      if (axis.xform && axis.xform.type === "month") {
        categories = [{
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
        }]; // Add none if needed

        if (_.any(values, function (v) {
          return v == null;
        })) {
          categories.push(noneCategory);
        }

        return categories;
      }

      if (axis.xform && axis.xform.type === "week") {
        categories = [];

        for (week = k = 1; k <= 53; week = ++k) {
          value = "" + week;

          if (value.length === 1) {
            value = "0" + value;
          }

          categories.push({
            value: value,
            label: value
          });
        } // Add none if needed


        if (_.any(values, function (v) {
          return v == null;
        })) {
          categories.push(noneCategory);
        }

        return categories;
      }

      if (axis.xform && axis.xform.type === "year") {
        hasNone = _.any(values, function (v) {
          return v == null;
        });
        values = _.compact(values);

        if (values.length === 0) {
          return [noneCategory];
        } // Get min and max


        min = _.min(_.map(values, function (date) {
          return parseInt(date.substr(0, 4));
        }));
        max = _.max(_.map(values, function (date) {
          return parseInt(date.substr(0, 4));
        }));
        categories = [];

        for (year = l = ref1 = min, ref2 = max; ref1 <= ref2 ? l <= ref2 : l >= ref2; year = ref1 <= ref2 ? ++l : --l) {
          categories.push({
            value: "".concat(year, "-01-01"),
            label: "".concat(year)
          });

          if (categories.length >= 1000) {
            break;
          }
        } // Add none if needed


        if (hasNone) {
          categories.push(noneCategory);
        }

        return categories;
      }

      if (axis.xform && axis.xform.type === "yearmonth") {
        hasNone = _.any(values, function (v) {
          return v == null;
        });
        values = _.compact(values);

        if (values.length === 0) {
          return [noneCategory];
        } // Get min and max


        min = values.sort()[0];
        max = values.sort().slice(-1)[0]; // Use moment to get range

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
        } // Add none if needed


        if (hasNone) {
          categories.push(noneCategory);
        }

        return categories;
      }

      switch (this.getAxisType(axis)) {
        case "enum":
        case "enumset":
          // If enum, return enum values
          return _.map(this.exprUtils.getExprEnumValues(axis.expr), function (ev) {
            return {
              value: ev.id,
              label: ExprUtils.localizeString(ev.name, locale)
            };
          }).concat([noneCategory]);

        case "text":
          // Return unique values
          hasNone = _.any(values, function (v) {
            return v == null;
          });
          categories = _.map(_.compact(_.uniq(values)).sort(), function (v) {
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
          return [{
            // Return unique values
            value: true,
            label: "True"
          }, {
            value: false,
            label: "False"
          }, noneCategory];

        case "date":
          values = _.compact(values);

          if (values.length === 0) {
            return [noneCategory];
          } // Get min and max


          min = values.sort()[0];
          max = values.sort().slice(-1)[0]; // Use moment to get range

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
    } // Get type of axis output

  }, {
    key: "getAxisType",
    value: function getAxisType(axis) {
      var type, xform;

      if (!axis) {
        return null;
      } // DEPRECATED


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
    } // Determines if axis is aggregate

  }, {
    key: "isAxisAggr",
    value: function isAxisAggr(axis) {
      // Legacy support of axis.aggr
      return axis != null && (axis.aggr || this.exprUtils.getExprAggrStatus(axis.expr) === "aggregate");
    } // Summarize axis as a string

  }, {
    key: "summarizeAxis",
    value: function summarizeAxis(axis, locale) {
      if (!axis) {
        return "None";
      }

      return this.exprUtils.summarizeExpr(axis.expr, locale);
    } // TODO add xform support
    // Get a string (or React DOM actually) representation of an axis value

  }, {
    key: "formatValue",
    value: function formatValue(axis, value, locale) {
      var categories, category, format, num, type;

      if (value == null) {
        return axis.nullLabel || "None";
      }

      type = this.getAxisType(axis); // If has categories, use those

      categories = this.getCategories(axis, [value], locale);

      if (categories.length > 0) {
        if (type === "enumset") {
          // Parse if string
          if (_.isString(value)) {
            value = JSON.parse(value);
          }

          return _.map(value, function (v) {
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
          format = d3Format.format(axis.format != null ? axis.format : ","); // Do not convert % (d3Format multiplies by 100 which is annoying)

          if (axis.format && axis.format.match(/%/)) {
            num = num / 100.0;
          }

          return format(num);

        case "text[]":
          // Parse if string
          if (_.isString(value)) {
            value = JSON.parse(value);
          }

          return R('div', null, _.map(value, function (v, i) {
            return R('div', {
              key: i
            }, v);
          }));

        case "date":
          return moment(value, moment.ISO_8601).format("ll");

        case "datetime":
          return moment(value, moment.ISO_8601).format("lll");
      }

      return "" + value;
    } // Creates a filter (jsonql with {alias} for table name) based on a specific value
    // of the axis. Used to filter by a specific point.

  }, {
    key: "createValueFilter",
    value: function createValueFilter(axis, value) {
      if (value != null) {
        return {
          type: "op",
          op: "=",
          exprs: [this.compileAxis({
            axis: axis,
            tableAlias: "{alias}"
          }), {
            type: "literal",
            value: value
          }]
        };
      } else {
        return {
          type: "op",
          op: "is null",
          exprs: [this.compileAxis({
            axis: axis,
            tableAlias: "{alias}"
          })]
        };
      }
    }
  }, {
    key: "isCategorical",
    value: function isCategorical(axis) {
      var nonCategoricalTypes, type;
      nonCategoricalTypes = ["bin", "ranges", "date", "yearmonth"];

      if (axis.xform) {
        type = axis.xform.type;
      } else {
        type = this.exprUtils.getExprType(axis.expr);
      }

      return nonCategoricalTypes.indexOf(type) === -1;
    }
  }]);
  return AxisBuilder;
}();