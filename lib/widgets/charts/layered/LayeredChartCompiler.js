"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var AxisBuilder, ExprCompiler, ExprUtils, LayeredChartCompiler, _, cleanString, commaFormatter, d3Format, injectTableAlias, labelValueFormatter, pieLabelValueFormatter;

_ = require('lodash');
ExprCompiler = require('mwater-expressions').ExprCompiler;
ExprUtils = require('mwater-expressions').ExprUtils;
AxisBuilder = require('../../../axes/AxisBuilder');
injectTableAlias = require('mwater-expressions').injectTableAlias;
d3Format = require('d3-format');
commaFormatter = d3Format.format(",");

pieLabelValueFormatter = function pieLabelValueFormatter(format) {
  return function (value, ratio, id) {
    if (format[id]) {
      return "".concat(format[id](value), " (").concat(d3Format.format('.1%')(ratio), ")");
    } else {
      return "".concat(d3Format.format(",")(value), " (").concat(d3Format.format('.1%')(ratio), ")");
    }
  };
};

labelValueFormatter = function labelValueFormatter(format) {
  return function (value, ratio, id) {
    if (format[id]) {
      return format[id](value);
    } else {
      return value;
    }
  };
}; // Compiles various parts of a layered chart (line, bar, scatter, spline, area) to C3.js format


module.exports = LayeredChartCompiler = /*#__PURE__*/function () {
  // Pass in schema
  function LayeredChartCompiler(options) {
    (0, _classCallCheck2["default"])(this, LayeredChartCompiler);
    this.schema = options.schema;
    this.exprUtils = new ExprUtils(this.schema);
    this.axisBuilder = new AxisBuilder({
      schema: this.schema
    });
  } // Create the queries needed for the chart.
  // extraFilters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. }


  (0, _createClass2["default"])(LayeredChartCompiler, [{
    key: "createQueries",
    value: function createQueries(design, extraFilters) {
      var exprCompiler, filter, j, k, layer, layerIndex, len, limit, queries, query, ref, relevantFilters, whereClauses;
      exprCompiler = new ExprCompiler(this.schema);
      queries = {}; // For each layer

      for (layerIndex = j = 0, ref = design.layers.length; 0 <= ref ? j < ref : j > ref; layerIndex = 0 <= ref ? ++j : --j) {
        layer = design.layers[layerIndex]; // Limit depends on layer type

        limit = 1000;

        if (layer.type === "scatter" || design.type === "scatter") {
          limit = 10000; // More possible for scatter chart
        } // Create shell of query


        query = {
          type: "query",
          selects: [],
          from: exprCompiler.compileTable(layer.table, "main"),
          limit: limit,
          groupBy: [],
          orderBy: []
        };

        if (layer.axes.x) {
          query.selects.push({
            type: "select",
            expr: this.axisBuilder.compileAxis({
              axis: layer.axes.x,
              tableAlias: "main"
            }),
            alias: "x"
          });
        }

        if (layer.axes.color) {
          query.selects.push({
            type: "select",
            expr: this.axisBuilder.compileAxis({
              axis: layer.axes.color,
              tableAlias: "main"
            }),
            alias: "color"
          });
        }

        if (layer.axes.y) {
          query.selects.push({
            type: "select",
            expr: this.axisBuilder.compileAxis({
              axis: layer.axes.y,
              tableAlias: "main"
            }),
            alias: "y"
          });
        } // Sort by x and color


        if (layer.axes.x || layer.axes.color) {
          query.orderBy.push({
            ordinal: 1
          });
        }

        if (layer.axes.x && layer.axes.color) {
          query.orderBy.push({
            ordinal: 2
          });
        } // If grouping type


        if (this.doesLayerNeedGrouping(design, layerIndex)) {
          if (layer.axes.x || layer.axes.color) {
            query.groupBy.push(1);
          }

          if (layer.axes.x && layer.axes.color) {
            query.groupBy.push(2);
          }
        } // Add where


        whereClauses = [];

        if (layer.filter) {
          whereClauses.push(this.compileExpr(layer.filter));
        } // Add filters


        if (extraFilters && extraFilters.length > 0) {
          // Get relevant filters
          relevantFilters = _.where(extraFilters, {
            table: layer.table
          }); // If any, create and

          if (relevantFilters.length > 0) {
            // Add others
            for (k = 0, len = relevantFilters.length; k < len; k++) {
              filter = relevantFilters[k];
              whereClauses.push(injectTableAlias(filter.jsonql, "main"));
            }
          }
        } // Wrap if multiple


        whereClauses = _.compact(whereClauses);

        if (whereClauses.length > 1) {
          query.where = {
            type: "op",
            op: "and",
            exprs: whereClauses
          };
        } else {
          query.where = whereClauses[0];
        }

        queries["layer".concat(layerIndex)] = query;
      }

      return queries;
    } // Create data map of "{layer name}" or "{layer name}:{index}" to { layerIndex, row }

  }, {
    key: "createDataMap",
    value: function createDataMap(design, data) {
      return this.compileData(design, data).dataMap;
    } // Create the chartOptions to pass to c3.generate
    // options is
    //   design: chart design element
    //   data: chart data
    //   width: chart width
    //   height: chart height
    //   locale: locale to use

  }, {
    key: "createChartOptions",
    value: function createChartOptions(options) {
      var _data;

      var c3Data, chartDesign, tickFormatter;
      c3Data = this.compileData(options.design, options.data, options.locale); // Pick first format to use as the tick formatter

      tickFormatter = _.keys(c3Data.format).length > 0 ? c3Data.format[_.keys(c3Data.format)[0]] : commaFormatter; // Create chart
      // NOTE: this structure must be comparable with _.isEqual, so don't add any inline functiona

      chartDesign = {
        data: (_data = {
          types: c3Data.types,
          columns: c3Data.columns,
          names: c3Data.names
        }, (0, _defineProperty2["default"])(_data, "types", c3Data.types), (0, _defineProperty2["default"])(_data, "groups", c3Data.groups), (0, _defineProperty2["default"])(_data, "xs", c3Data.xs), (0, _defineProperty2["default"])(_data, "colors", c3Data.colors), (0, _defineProperty2["default"])(_data, "labels", options.design.labels), (0, _defineProperty2["default"])(_data, "order", c3Data.order), (0, _defineProperty2["default"])(_data, "color", c3Data.color), _data),
        // Hide if one layer with no color axis
        legend: {
          hide: options.design.layers.length === 1 && !options.design.layers[0].axes.color
        },
        grid: {
          focus: {
            show: false // Don't display hover grid

          }
        },
        axis: {
          x: {
            type: c3Data.xAxisType,
            label: {
              text: cleanString(c3Data.xAxisLabelText),
              position: options.design.transpose ? 'outer-middle' : 'outer-center'
            },
            tick: {
              fit: c3Data.xAxisTickFit
            }
          },
          y: {
            label: {
              text: cleanString(c3Data.yAxisLabelText),
              position: options.design.transpose ? 'outer-center' : 'outer-middle'
            },
            // Set max to 100 if proportional (with no padding)
            max: options.design.type === "bar" && options.design.proportional ? 100 : options.design.yMax,
            min: options.design.type === "bar" && options.design.proportional ? 0 : options.design.yMin,
            padding: options.design.type === "bar" && options.design.proportional ? {
              top: 0,
              bottom: 0
            } : {
              top: options.design.yMax != null ? 0 : void 0,
              bottom: options.design.yMin != null ? 0 : void 0
            },
            tick: {
              format: tickFormatter
            }
          },
          rotated: options.design.transpose
        },
        size: {
          width: options.width,
          height: options.height
        },
        pie: {
          label: {
            format: options.design.labels ? pieLabelValueFormatter(c3Data.format) : void 0
          },
          expand: false // Don't expand/contract

        },
        donut: {
          label: {
            format: options.design.labels ? pieLabelValueFormatter(c3Data.format) : void 0
          },
          expand: false // Don't expand/contract

        },
        transition: {
          duration: 0 // Transitions interfere with scoping

        }
      };

      if (options.design.labels) {
        if (options.design.type === "pie" || options.design.type === "donut") {
          chartDesign.tooltip = {
            format: {
              value: pieLabelValueFormatter(c3Data.format)
            }
          };
        } else {
          if (!_.isEmpty(c3Data.format)) {
            chartDesign.tooltip = {
              format: {
                value: labelValueFormatter(c3Data.format)
              }
            };
          }
        }
      }

      if (options.design.labels && !_.isEmpty(c3Data.format)) {
        // format = _.map options.design.layers, (layer, layerIndex) =>
        //   return if c3Data.format[layerIndex] then c3Data.format[layerIndex] else true
        chartDesign.data.labels = {
          format: c3Data.format
        };
      }

      if (options.design.yThresholds) {
        chartDesign.grid.y = {
          lines: _.map(options.design.yThresholds, function (t) {
            return {
              value: t.value,
              text: t.label
            };
          })
        };
      } // This doesn't work in new C3. Removing.
      // # If x axis is year only, display year in ticks
      // if options.design.layers[0]?.axes.x?.xform?.type == "year"
      //   chartDesign.axis.x.tick.format = (x) -> if _.isDate(x) then x.getFullYear() else x


      return chartDesign;
    }
  }, {
    key: "isCategoricalX",
    value: function isCategoricalX(design) {
      var categoricalX, xType; // Check if categorical x axis (bar charts always are)

      categoricalX = design.type === "bar" || _.any(design.layers, function (l) {
        return l.type === "bar";
      }); // Check if x axis is categorical type

      xType = this.axisBuilder.getAxisType(design.layers[0].axes.x);

      if (xType === "enum" || xType === "text" || xType === "boolean") {
        categoricalX = true;
      } // Dates that are stacked must be categorical to make stacking work in C3


      if (xType === "date" && design.stacked) {
        categoricalX = true;
      }

      return categoricalX;
    } // Compiles data part of C3 chart, including data map back to original data
    // Outputs: columns, types, names, colors. Also dataMap which is a map of "layername:index" to { layerIndex, row }

  }, {
    key: "compileData",
    value: function compileData(design, data, locale) {
      var ref; // If polar chart (no x axis)

      if ((ref = design.type) === 'pie' || ref === 'donut' || _.any(design.layers, function (l) {
        var ref1;
        return (ref1 = l.type) === 'pie' || ref1 === 'donut';
      })) {
        return this.compileDataPolar(design, data, locale);
      }

      if (this.isCategoricalX(design)) {
        return this.compileDataCategorical(design, data, locale);
      } else {
        return this.compileDataNonCategorical(design, data, locale);
      }
    } // Compiles data for a polar chart (pie/donut) with no x axis

  }, {
    key: "compileDataPolar",
    value: function compileDataPolar(design, data, locale) {
      var _this = this;

      var colors, columns, dataMap, format, names, order, types;
      columns = [];
      types = {};
      names = {};
      dataMap = {};
      colors = {};
      format = {}; // For each layer

      _.each(design.layers, function (layer, layerIndex) {
        var categories, categoryOrder, layerData, row, series; // If has color axis

        if (layer.axes.color) {
          layerData = data["layer".concat(layerIndex)]; // Categories will be in form [{ value, label }]

          categories = _this.axisBuilder.getCategories(layer.axes.color, _.pluck(layerData, "color"), locale); // Get indexed ordering of categories (lookup from value to index) without removing excluded values

          categoryOrder = _.zipObject(_.map(categories, function (c, i) {
            return [c.value, i];
          })); // Sort by category order

          layerData = _.sortBy(layerData, function (row) {
            return categoryOrder[row.color];
          }); // Create a series for each row

          return _.each(layerData, function (row, rowIndex) {
            var color, series; // Skip if value excluded

            if (_.includes(layer.axes.color.excludedValues, row.color)) {
              return;
            }

            series = "".concat(layerIndex, ":").concat(rowIndex); // Pie series contain a single value

            columns.push([series, row.y]);
            types[series] = _this.getLayerType(design, layerIndex);
            names[series] = _this.axisBuilder.formatValue(layer.axes.color, row.color, locale, true);
            dataMap[series] = {
              layerIndex: layerIndex,
              row: row
            };

            format[series] = function (value) {
              if (value != null) {
                return _this.axisBuilder.formatValue(layer.axes.y, value, locale, true);
              } else {
                return "";
              }
            }; // Get specific color if present


            color = _this.axisBuilder.getValueColor(layer.axes.color, row.color); //color = color or layer.color

            if (color) {
              return colors[series] = color;
            }
          });
        } else {
          // Create a single series
          row = data["layer".concat(layerIndex)][0];

          if (row) {
            series = "".concat(layerIndex);
            columns.push([series, row.y]);
            types[series] = _this.getLayerType(design, layerIndex); // Name is name of entire layer

            names[series] = layer.name || (design.layers.length === 1 ? "Value" : "Series ".concat(layerIndex + 1));
            dataMap[series] = {
              layerIndex: layerIndex,
              row: row
            };

            format[series] = function (value) {
              if (value != null) {
                return _this.axisBuilder.formatValue(layer.axes.y, value, locale, true);
              } else {
                return "";
              }
            }; // Set color if present


            if (layer.color) {
              return colors[series] = layer.color;
            }
          }
        }
      }); // Determine order (default is desc)


      if (design.polarOrder === "desc") {
        order = "desc";
      } else if (design.polarOrder === "asc") {
        order = "asc";
      } else if (design.polarOrder === "natural") {
        order = null;
      } else {
        order = "desc";
      }

      return {
        columns: columns,
        types: types,
        names: names,
        dataMap: dataMap,
        colors: colors,
        xAxisType: "category",
        // Polar charts are always category x-axis
        titleText: this.compileTitleText(design, locale),
        order: order,
        format: format
      };
    } // Compiles data for a chart like line or scatter that does not have a categorical x axis

  }, {
    key: "compileDataNonCategorical",
    value: function compileDataNonCategorical(design, data, locale) {
      var _this2 = this;

      var colors, columns, dataMap, format, groups, names, types, xType, xs;
      columns = [];
      types = {};
      names = {};
      dataMap = {};
      colors = {};
      xs = {};
      groups = [];
      format = {};
      xType = this.axisBuilder.getAxisType(design.layers[0].axes.x); // For each layer

      _.each(design.layers, function (layer, layerIndex) {
        var categories, categoryOrder, colorValues, layerData, seriesX, seriesY, yValues; // Get data of layer

        layerData = data["layer".concat(layerIndex)];

        _this2.fixStringYValues(layerData);

        if (layer.cumulative) {
          layerData = _this2.makeRowsCumulative(layerData);
        } // Remove excluded values


        layerData = _.filter(layerData, function (row) {
          return !_.includes(layer.axes.x.excludedValues, row.x);
        }); // If has color axis

        if (layer.axes.color) {
          // Create a series for each color value
          colorValues = _.uniq(_.pluck(layerData, "color")); // Sort color values by category order:
          // Get categories

          categories = _this2.axisBuilder.getCategories(layer.axes.color, colorValues, locale); // Get indexed ordering of categories (lookup from value to index) without removing excluded values

          categoryOrder = _.zipObject(_.map(categories, function (c, i) {
            return [c.value, i];
          })); // Sort

          colorValues = _.sortBy(colorValues, function (v) {
            return categoryOrder[v];
          }); // Exclude excluded ones

          colorValues = _.difference(colorValues, layer.axes.color.excludedValues); // For each color value

          return _.each(colorValues, function (colorValue) {
            var color, rows, seriesX, seriesY, yValues; // One series for x values, one for y

            seriesX = "".concat(layerIndex, ":").concat(colorValue, ":x");
            seriesY = "".concat(layerIndex, ":").concat(colorValue, ":y"); // Get specific color if present

            color = _this2.axisBuilder.getValueColor(layer.axes.color, colorValue);
            color = color || layer.color;

            if (color) {
              colors[seriesY] = color;
            } // Get rows for this series


            rows = _.where(layerData, {
              color: colorValue
            });
            yValues = _.pluck(rows, "y");
            columns.push([seriesY].concat(yValues));
            columns.push([seriesX].concat(_.pluck(rows, "x")));
            types[seriesY] = _this2.getLayerType(design, layerIndex);
            names[seriesY] = _this2.axisBuilder.formatValue(layer.axes.color, colorValue, locale, true);
            xs[seriesY] = seriesX;

            format[seriesY] = function (value) {
              if (value != null) {
                return _this2.axisBuilder.formatValue(layer.axes.y, value, locale, true);
              } else {
                return "";
              }
            };

            return _.each(rows, function (row, rowIndex) {
              return dataMap["".concat(seriesY, ":").concat(rowIndex)] = {
                layerIndex: layerIndex,
                row: row
              };
            });
          });
        } else {
          // One series for x values, one for y
          seriesX = "".concat(layerIndex, ":x");
          seriesY = "".concat(layerIndex, ":y");
          yValues = _.pluck(layerData, "y");
          columns.push([seriesY].concat(yValues));
          columns.push([seriesX].concat(_.pluck(layerData, "x")));
          types[seriesY] = _this2.getLayerType(design, layerIndex);
          names[seriesY] = layer.name || (design.layers.length === 1 ? "Value" : "Series ".concat(layerIndex + 1));
          xs[seriesY] = seriesX;
          colors[seriesY] = layer.color;

          format[seriesY] = function (value) {
            if (value != null) {
              return _this2.axisBuilder.formatValue(layer.axes.y, value, locale, true);
            } else {
              return "";
            }
          }; // Add data map for each row


          return _.each(layerData, function (row, rowIndex) {
            return dataMap["".concat(seriesY, ":").concat(rowIndex)] = {
              layerIndex: layerIndex,
              row: row
            };
          });
        }
      }); // Stack by putting into groups


      if (design.stacked) {
        groups = [_.keys(names)];
      }

      return {
        columns: columns,
        types: types,
        names: names,
        groups: groups,
        dataMap: dataMap,
        colors: colors,
        xs: xs,
        xAxisType: xType === "date" ? "timeseries" : "indexed",
        xAxisTickFit: false,
        // Don't put a tick for each point
        xAxisLabelText: this.compileXAxisLabelText(design, locale),
        yAxisLabelText: this.compileYAxisLabelText(design, locale),
        titleText: this.compileTitleText(design, locale),
        order: null,
        // Use order of data for stacking
        format: format
      };
    } // Numbers sometimes arrive as strings from database. Fix by parsing

  }, {
    key: "fixStringYValues",
    value: function fixStringYValues(rows) {
      var j, len, row;

      for (j = 0, len = rows.length; j < len; j++) {
        row = rows[j];

        if (_.isString(row.y)) {
          row.y = parseFloat(row.y);
        }
      }

      return rows;
    } // Flatten if x-type is enumset. e.g. if one row has x = ["a", "b"], make into two rows with x="a" and x="b", summing if already exists

  }, {
    key: "flattenRowData",
    value: function flattenRowData(rows) {
      var existingRow, flatRows, j, k, len, len1, row, x, xs;
      flatRows = [];

      for (j = 0, len = rows.length; j < len; j++) {
        row = rows[j]; // Handle null

        if (!row.x) {
          flatRows.push(row);
          continue;
        }

        if (_.isString(row.x)) {
          try {
            // Handle failed parsings graciously in case question used to be a non-array
            xs = JSON.parse(row.x);
          } catch (error) {
            xs = row.x;
          }
        } else {
          xs = row.x;
        }

        for (k = 0, len1 = xs.length; k < len1; k++) {
          x = xs[k]; // Find existing row

          existingRow = _.find(flatRows, function (r) {
            return r.x === x && r.color === row.color;
          });

          if (existingRow) {
            existingRow.y += row.y;
          } else {
            flatRows.push(_.extend({}, row, {
              x: x
            }));
          }
        }
      }

      return flatRows;
    }
  }, {
    key: "compileDataCategorical",
    value: function compileDataCategorical(design, data, locale) {
      var _this3 = this;

      var categories, categoryMap, categoryOrder, categoryXs, colorOverrides, colors, column, columns, dataMap, defaultStacked, format, groups, i, j, k, layer, layerIndex, len, len1, len2, m, n, names, o, ref, ref1, ref2, stacked, types, xAxis, xType, xValues, xs, xtotals;
      columns = [];
      types = {};
      names = {};
      dataMap = {};
      colors = {};
      xs = {};
      groups = [];
      format = {};
      colorOverrides = {}; // Mapping of "<layer>:<index>" to color if overridden
      // Get all values of the x-axis, taking into account values that might be missing

      xAxis = design.layers[0].axes.x;
      xType = this.axisBuilder.getAxisType(xAxis); // Get all known values from all layers

      xValues = [];

      _.each(design.layers, function (layer, layerIndex) {
        var layerData; // Get data of layer

        layerData = data["layer".concat(layerIndex)];
        return xValues = _.union(xValues, _.uniq(_.pluck(layerData, "x")));
      }); // Categories will be in form [{ value, label }]


      categories = this.axisBuilder.getCategories(xAxis, xValues, locale); // Get indexed ordering of categories (lookup from value to index) without removing excluded values

      categoryOrder = _.zipObject(_.map(categories, function (c, i) {
        return [c.value, i];
      })); // Exclude excluded values

      categories = _.filter(categories, function (category) {
        return !_.includes(xAxis.excludedValues, category.value);
      }); // Limit categories to prevent crashes in C3 (https://github.com/mWater/mwater-visualization/issues/272)

      if (xType !== "enumset") {
        // Take last ones to make dates prettier (enough to show all weeks)
        categories = _.takeRight(categories, 55);
        categoryXs = _.indexBy(categories, "value");
      } // Create map of category value to index


      categoryMap = _.object(_.map(categories, function (c, i) {
        return [c.value, i];
      })); // Create common x series

      columns.push(["x"].concat(_.map(categories, function (category) {
        return _this3.axisBuilder.formatCategory(xAxis, category);
      }))); // For each layer

      _.each(design.layers, function (layer, layerIndex) {
        var colorCategories, colorCategoryOrder, colorValues, column, layerData, series; // Get data of layer

        layerData = data["layer".concat(layerIndex)]; // Fix string y values

        layerData = _this3.fixStringYValues(layerData); // Flatten if x-type is enumset. e.g. if one row has x = ["a", "b"], make into two rows with x="a" and x="b", summing if already exists

        if (xType === "enumset") {
          layerData = _this3.flattenRowData(layerData);
        } // Reorder to category order for x-axis


        layerData = _.sortBy(layerData, function (row) {
          return categoryOrder[row.x];
        }); // Make rows cumulative

        if (layer.cumulative) {
          layerData = _this3.makeRowsCumulative(layerData);
        } // Filter out categories that were removed


        if (xType !== "enumset") {
          layerData = _.filter(layerData, function (row) {
            return categoryXs[row.x] != null;
          });
        } // If has color axis


        if (layer.axes.color) {
          // Create a series for each color value
          colorValues = _.uniq(_.pluck(layerData, "color")); // Sort color values by category order:
          // Get categories

          colorCategories = _this3.axisBuilder.getCategories(layer.axes.color, colorValues, locale); // Get indexed ordering of categories (lookup from value to index) without removing excluded values

          colorCategoryOrder = _.zipObject(_.map(colorCategories, function (c, i) {
            return [c.value, i];
          })); // Sort

          colorValues = _.sortBy(colorValues, function (v) {
            return colorCategoryOrder[v];
          }); // Exclude excluded ones

          colorValues = _.difference(colorValues, layer.axes.color.excludedValues);
          return _.each(colorValues, function (colorValue) {
            var color, column, i, j, len, rows, series, value; // One series for y values

            series = "".concat(layerIndex, ":").concat(colorValue); // Get specific color if present

            color = _this3.axisBuilder.getValueColor(layer.axes.color, colorValue);
            color = color || layer.color;

            if (color) {
              colors[series] = color;
            } // Get rows for this series


            rows = _.where(layerData, {
              color: colorValue
            }); // Create empty series

            column = _.map(categories, function (c) {
              return null;
            }); // Set rows

            _.each(rows, function (row) {
              var index; // Get index

              index = categoryMap[row.x];

              if (index != null) {
                column[index] = row.y;
                return dataMap["".concat(series, ":").concat(index)] = {
                  layerIndex: layerIndex,
                  row: row
                };
              }
            }); // Fill in nulls if cumulative


            if (layer.cumulative) {
              for (i = j = 0, len = column.length; j < len; i = ++j) {
                value = column[i];

                if (value == null && i > 0) {
                  column[i] = column[i - 1];
                }
              }
            }

            columns.push([series].concat(column));
            types[series] = _this3.getLayerType(design, layerIndex);
            names[series] = _this3.axisBuilder.formatValue(layer.axes.color, colorValue, locale, true);
            xs[series] = "x";
            return format[series] = function (value) {
              if (value != null) {
                return _this3.axisBuilder.formatValue(layer.axes.y, value, locale, true);
              } else {
                return "";
              }
            };
          });
        } else {
          // One series for y
          series = "".concat(layerIndex); // Create empty series

          column = _.map(categories, function (c) {
            return null;
          }); // Set rows

          _.each(layerData, function (row) {
            var color, index; // Skip if value excluded

            if (_.includes(layer.axes.x.excludedValues, row.x)) {
              return;
            } // Get index


            index = categoryMap[row.x];
            column[index] = row.y;
            dataMap["".concat(series, ":").concat(index)] = {
              layerIndex: layerIndex,
              row: row
            }; // Get color override

            if (layer.xColorMap) {
              color = _this3.axisBuilder.getValueColor(layer.axes.x, row.x);

              if (color) {
                return colorOverrides["".concat(series, ":").concat(index)] = color;
              }
            }
          });

          columns.push([series].concat(column));
          types[series] = _this3.getLayerType(design, layerIndex);
          names[series] = layer.name || (design.layers.length === 1 ? "Value" : "Series ".concat(layerIndex + 1));
          xs[series] = "x";
          colors[series] = layer.color;
          return format[series] = function (value) {
            if (value != null) {
              return _this3.axisBuilder.formatValue(layer.axes.y, value, locale, true);
            } else {
              return "";
            }
          };
        }
      }); // Stack by putting into groups


      if (design.stacked) {
        groups = [_.keys(names)];
      } else if (design.layers.length > 1) {
        groups = [];
        ref = design.layers;

        for (layerIndex = j = 0, len = ref.length; j < len; layerIndex = ++j) {
          layer = ref[layerIndex]; // If has multiple layers and color axes within layers. Stack individual layers unless stacked is false

          defaultStacked = layer.axes.color != null;
          stacked = layer.stacked != null ? layer.stacked : defaultStacked;

          if (stacked) {
            groups.push(_.filter(_.keys(names), function (series) {
              return series.split(":")[0] === "".concat(layerIndex);
            }));
          }
        } // Remove empty groups


        groups = _.filter(groups, function (g) {
          return g.length > 1;
        });
      } // If proportional


      if (design.proportional) {
        // Calculate total for each x
        xtotals = [];

        for (k = 0, len1 = columns.length; k < len1; k++) {
          column = columns[k]; // Skip x column

          if (column[0] === 'x') {
            continue;
          }

          for (i = m = 1, ref1 = column.length; 1 <= ref1 ? m < ref1 : m > ref1; i = 1 <= ref1 ? ++m : --m) {
            xtotals[i] = (xtotals[i] || 0) + (column[i] || 0);
          }
        } // Now make percentage with one decimal


        for (n = 0, len2 = columns.length; n < len2; n++) {
          column = columns[n]; // Skip x column

          if (column[0] === 'x') {
            continue;
          }

          for (i = o = 1, ref2 = column.length; 1 <= ref2 ? o < ref2 : o > ref2; i = 1 <= ref2 ? ++o : --o) {
            if (column[i] > 0) {
              column[i] = Math.round(100 * column[i] / xtotals[i] * 10) / 10;
            }
          }
        }
      }

      console.log(format);
      return {
        columns: columns,
        types: types,
        names: names,
        dataMap: dataMap,
        colors: colors,
        xs: xs,
        groups: groups,
        xAxisType: "category",
        xAxisTickFit: xType !== "date",
        // Put a tick for each point since categorical unless date
        xAxisLabelText: this.compileXAxisLabelText(design, locale),
        yAxisLabelText: this.compileYAxisLabelText(design, locale),
        titleText: this.compileTitleText(design, locale),
        order: null,
        // Use order of data for stacking
        format: format,
        color: function color(_color, d) {
          var key, len3, p, sortedYThresholds, yThreshold; // Handle overall series color which calls with a non-object for d

          if ((0, _typeof2["default"])(d) !== "object") {
            // Overall series is not changed in color
            return _color;
          }

          key = "".concat(d.id, ":").concat(d.index);

          if (colorOverrides[key]) {
            _color = colorOverrides[key];
          } // Apply thresholds (in order)


          sortedYThresholds = _.sortBy(design.yThresholds || [], "value");

          for (p = 0, len3 = sortedYThresholds.length; p < len3; p++) {
            yThreshold = sortedYThresholds[p];

            if (d.value > yThreshold.value && yThreshold.highlightColor) {
              _color = yThreshold.highlightColor;
            }
          }

          return _color;
        }
      };
    } // Compile an expression

  }, {
    key: "compileExpr",
    value: function compileExpr(expr) {
      var exprCompiler;
      exprCompiler = new ExprCompiler(this.schema);
      return exprCompiler.compileExpr({
        expr: expr,
        tableAlias: "main"
      });
    } // Get layer type, defaulting to overall type

  }, {
    key: "getLayerType",
    value: function getLayerType(design, layerIndex) {
      return design.layers[layerIndex].type || design.type;
    } // Determine if layer required grouping by x (and color)

  }, {
    key: "doesLayerNeedGrouping",
    value: function doesLayerNeedGrouping(design, layerIndex) {
      return this.getLayerType(design, layerIndex) !== "scatter";
    } // Determine if layer can use x axis

  }, {
    key: "canLayerUseXExpr",
    value: function canLayerUseXExpr(design, layerIndex) {
      var ref;
      return (ref = this.getLayerType(design, layerIndex)) !== 'pie' && ref !== 'donut';
    }
  }, {
    key: "isXAxisRequired",
    value: function isXAxisRequired(design, layerIndex) {
      var _this4 = this;

      return _.any(design.layers, function (layer, i) {
        var ref;
        return (ref = _this4.getLayerType(design, i)) !== 'pie' && ref !== 'donut';
      });
    }
  }, {
    key: "isColorAxisRequired",
    value: function isColorAxisRequired(design, layerIndex) {
      var ref;
      return (ref = this.getLayerType(design, layerIndex)) === 'pie' || ref === 'donut';
    }
  }, {
    key: "compileDefaultTitleText",
    value: function compileDefaultTitleText(design, locale) {
      // Don't default this for now
      return "";
    } // if design.layers[0].axes.x
    //   return @compileYAxisLabelText(design) + " by " + @compileXAxisLabelText(design)
    // else
    //   return @compileYAxisLabelText(design) + " by " + @axisBuilder.summarizeAxis(design.layers[0].axes.color)

  }, {
    key: "compileDefaultYAxisLabelText",
    value: function compileDefaultYAxisLabelText(design, locale) {
      return this.axisBuilder.summarizeAxis(design.layers[0].axes.y, locale);
    }
  }, {
    key: "compileDefaultXAxisLabelText",
    value: function compileDefaultXAxisLabelText(design, locale) {
      return this.axisBuilder.summarizeAxis(design.layers[0].axes.x, locale);
    }
  }, {
    key: "compileTitleText",
    value: function compileTitleText(design, locale) {
      return design.titleText || this.compileDefaultTitleText(design, locale);
    }
  }, {
    key: "compileYAxisLabelText",
    value: function compileYAxisLabelText(design, locale) {
      if (design.yAxisLabelText === "") {
        return this.compileDefaultYAxisLabelText(design, locale);
      }

      return design.yAxisLabelText;
    }
  }, {
    key: "compileXAxisLabelText",
    value: function compileXAxisLabelText(design, locale) {
      if (design.xAxisLabelText === "") {
        return this.compileDefaultXAxisLabelText(design, locale);
      }

      return design.xAxisLabelText;
    } // Create a scope based on a row of a layer
    // Scope data is relevant data from row that uniquely identifies scope
    // plus a layer index

  }, {
    key: "createScope",
    value: function createScope(design, layerIndex, row, locale) {
      var data, expressionBuilder, filter, filterExpr, filterExprs, filters, layer, names, scope;
      expressionBuilder = new ExprUtils(this.schema); // Get layer

      layer = design.layers[layerIndex];
      filters = [];
      filterExprs = [];
      names = [];
      data = {
        layerIndex: layerIndex
      }; // If x

      if (layer.axes.x) {
        // Handle special case of enumset which is flattened to enum type
        if (this.axisBuilder.getAxisType(layer.axes.x) === "enumset") {
          filters.push({
            type: "op",
            op: "@>",
            exprs: [{
              type: "op",
              op: "::jsonb",
              exprs: [this.axisBuilder.compileAxis({
                axis: layer.axes.x,
                tableAlias: "{alias}"
              })]
            }, {
              type: "op",
              op: "::jsonb",
              exprs: [JSON.stringify(row.x)]
            }]
          });
          filterExprs.push({
            table: layer.table,
            type: "op",
            op: "contains",
            exprs: [this.axisBuilder.convertAxisToExpr(layer.axes.x), {
              type: "literal",
              valueType: "enumset",
              value: [row.x]
            }]
          });
          names.push(this.axisBuilder.summarizeAxis(layer.axes.x, locale) + " includes " + this.exprUtils.stringifyExprLiteral(layer.axes.x.expr, [row.x], locale));
          data.x = row.x;
        } else {
          filters.push(this.axisBuilder.createValueFilter(layer.axes.x, row.x));
          filterExprs.push(this.axisBuilder.createValueFilterExpr(layer.axes.x, row.x));
          names.push(this.axisBuilder.summarizeAxis(layer.axes.x, locale) + " is " + this.axisBuilder.formatValue(layer.axes.x, row.x, locale, true));
          data.x = row.x;
        }
      }

      if (layer.axes.color) {
        filters.push(this.axisBuilder.createValueFilter(layer.axes.color, row.color));
        filterExprs.push(this.axisBuilder.createValueFilterExpr(layer.axes.color, row.color));
        names.push(this.axisBuilder.summarizeAxis(layer.axes.color, locale) + " is " + this.axisBuilder.formatValue(layer.axes.color, row.color, locale, true));
        data.color = row.color;
      }

      if (filters.length > 1) {
        filter = {
          table: layer.table,
          jsonql: {
            type: "op",
            op: "and",
            exprs: filters
          }
        };
        filterExpr = {
          table: layer.table,
          type: "op",
          op: "and",
          exprs: filterExprs
        };
      } else {
        filter = {
          table: layer.table,
          jsonql: filters[0]
        };
        filterExpr = filterExprs[0];
      }

      scope = {
        name: ExprUtils.localizeString(this.schema.getTable(layer.table).name, locale) + " " + names.join(" and "),
        filter: filter,
        filterExpr: filterExpr,
        data: data
      };
      return scope;
    } // Converts a series of rows to have cumulative y axis, separating out by color axis if present

  }, {
    key: "makeRowsCumulative",
    value: function makeRowsCumulative(rows) {
      var j, len, newRows, row, total, totals, y; // Indexed by color

      totals = {};
      newRows = [];

      for (j = 0, len = rows.length; j < len; j++) {
        row = rows[j]; // Add up total

        total = totals[row.color] || 0;
        y = total + row.y;
        totals[row.color] = y; // If x is null, don't make cumulative

        if (row.x === null) {
          newRows.push(row);
        } else {
          // Create new row
          newRows.push(_.extend({}, row, {
            y: y
          }));
        }
      }

      return newRows;
    }
  }]);
  return LayeredChartCompiler;
}(); // Clean out nbsp (U+00A0) as it causes c3 errors


cleanString = function cleanString(str) {
  if (!str) {
    return str;
  }

  return str.replace("\xA0", " ");
};