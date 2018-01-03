var AxisBuilder, ExprCompiler, ExprUtils, LayeredChartCompiler, _, cleanString, d3Formatter, injectTableAlias, labelValueFormatter, pieLabelValueFormatter, tickFormatter;

_ = require('lodash');

ExprCompiler = require('mwater-expressions').ExprCompiler;

ExprUtils = require('mwater-expressions').ExprUtils;

AxisBuilder = require('../../../axes/AxisBuilder');

injectTableAlias = require('mwater-expressions').injectTableAlias;

if (global.d3) {
  tickFormatter = d3.format(",");
  pieLabelValueFormatter = (function(_this) {
    return function(value, ratio, id) {
      return (d3.format(",")(value)) + " (" + (d3.format('.1%')(ratio)) + ")";
    };
  })(this);
  d3Formatter = function(format) {
    return d3.format(format);
  };
  labelValueFormatter = function(format) {
    return function(value, ratio, id) {
      console.log(value, ratio, id);
      console.log(format);
      if (format[id]) {
        return format[id](value);
      } else {
        return value;
      }
    };
  };
} else {
  tickFormatter = null;
  pieLabelValueFormatter = null;
  labelValueFormatter = null;
  d3Formatter = null;
}

module.exports = LayeredChartCompiler = (function() {
  function LayeredChartCompiler(options) {
    this.schema = options.schema;
    this.exprUtils = new ExprUtils(this.schema);
    this.axisBuilder = new AxisBuilder({
      schema: this.schema
    });
  }

  LayeredChartCompiler.prototype.createQueries = function(design, extraFilters) {
    var exprCompiler, filter, j, k, layer, layerIndex, len, queries, query, ref, relevantFilters, whereClauses;
    exprCompiler = new ExprCompiler(this.schema);
    queries = {};
    for (layerIndex = j = 0, ref = design.layers.length; 0 <= ref ? j < ref : j > ref; layerIndex = 0 <= ref ? ++j : --j) {
      layer = design.layers[layerIndex];
      query = {
        type: "query",
        selects: [],
        from: exprCompiler.compileTable(layer.table, "main"),
        limit: 1000,
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
      }
      if (layer.axes.x || layer.axes.color) {
        query.orderBy.push({
          ordinal: 1
        });
      }
      if (layer.axes.x && layer.axes.color) {
        query.orderBy.push({
          ordinal: 2
        });
      }
      if (this.doesLayerNeedGrouping(design, layerIndex)) {
        if (layer.axes.x || layer.axes.color) {
          query.groupBy.push(1);
        }
        if (layer.axes.x && layer.axes.color) {
          query.groupBy.push(2);
        }
      }
      whereClauses = [];
      if (layer.filter) {
        whereClauses.push(this.compileExpr(layer.filter));
      }
      if (extraFilters && extraFilters.length > 0) {
        relevantFilters = _.where(extraFilters, {
          table: layer.table
        });
        if (relevantFilters.length > 0) {
          for (k = 0, len = relevantFilters.length; k < len; k++) {
            filter = relevantFilters[k];
            whereClauses.push(injectTableAlias(filter.jsonql, "main"));
          }
        }
      }
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
      queries["layer" + layerIndex] = query;
    }
    return queries;
  };

  LayeredChartCompiler.prototype.createDataMap = function(design, data) {
    return this.compileData(design, data).dataMap;
  };

  LayeredChartCompiler.prototype.createChartOptions = function(options) {
    var c3Data, chartDesign;
    c3Data = this.compileData(options.design, options.data, options.locale);
    console.log(c3Data);
    chartDesign = {
      data: {
        types: c3Data.types,
        columns: c3Data.columns,
        names: c3Data.names,
        types: c3Data.types,
        groups: c3Data.groups,
        xs: c3Data.xs,
        colors: c3Data.colors,
        labels: options.design.labels,
        order: c3Data.order
      },
      legend: {
        hide: options.design.layers.length === 1 && !options.design.layers[0].axes.color
      },
      grid: {
        focus: {
          show: false
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
          max: options.design.type === "bar" && options.design.proportional ? 100 : void 0,
          padding: options.design.type === "bar" && options.design.proportional ? {
            top: 0,
            bottom: 0
          } : void 0,
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
          format: options.design.labels ? pieLabelValueFormatter : void 0
        },
        expand: false
      },
      donut: {
        label: {
          format: options.design.labels ? pieLabelValueFormatter : void 0
        },
        expand: false
      },
      transition: {
        duration: 0
      }
    };
    if (options.design.labels) {
      if (options.design.type === "pie" || options.design.type === "donut") {
        chartDesign.tooltip = {
          format: {
            value: pieLabelValueFormatter
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
      chartDesign.data.labels = {
        format: c3Data.format
      };
    }
    return chartDesign;
  };

  LayeredChartCompiler.prototype.isCategoricalX = function(design) {
    var categoricalX, xType;
    categoricalX = design.type === "bar" || _.any(design.layers, function(l) {
      return l.type === "bar";
    });
    xType = this.axisBuilder.getAxisType(design.layers[0].axes.x);
    if (xType === "enum" || xType === "text" || xType === "boolean") {
      categoricalX = true;
    }
    if (xType === "date" && design.stacked) {
      categoricalX = true;
    }
    return categoricalX;
  };

  LayeredChartCompiler.prototype.compileData = function(design, data, locale) {
    var ref;
    if (((ref = design.type) === 'pie' || ref === 'donut') || _.any(design.layers, function(l) {
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
  };

  LayeredChartCompiler.prototype.compileDataPolar = function(design, data, locale) {
    var colors, columns, dataMap, format, names, types;
    columns = [];
    types = {};
    names = {};
    dataMap = {};
    colors = {};
    format = {};
    _.each(design.layers, (function(_this) {
      return function(layer, layerIndex) {
        var categories, categoryOrder, layerData, row, series;
        if (layer.axes.color) {
          layerData = data["layer" + layerIndex];
          categories = _this.axisBuilder.getCategories(layer.axes.color, _.pluck(layerData, "color"), locale);
          categoryOrder = _.zipObject(_.map(categories, function(c, i) {
            return [c.value, i];
          }));
          layerData = _.sortBy(layerData, function(row) {
            return categoryOrder[row.color];
          });
          return _.each(layerData, function(row, rowIndex) {
            var color, series;
            if (_.includes(layer.axes.color.excludedValues, row.color)) {
              return;
            }
            series = layerIndex + ":" + rowIndex;
            columns.push([series, row.y]);
            types[series] = _this.getLayerType(design, layerIndex);
            names[series] = _this.axisBuilder.formatValue(layer.axes.color, row.color, locale);
            dataMap[series] = {
              layerIndex: layerIndex,
              row: row
            };
            color = _this.axisBuilder.getValueColor(layer.axes.color, row.color);
            if (color) {
              return colors[series] = color;
            }
          });
        } else {
          row = data["layer" + layerIndex][0];
          if (row) {
            series = "" + layerIndex;
            columns.push([series, row.y]);
            types[series] = _this.getLayerType(design, layerIndex);
            names[series] = layer.name || ("Series " + (layerIndex + 1));
            dataMap[series] = {
              layerIndex: layerIndex,
              row: row
            };
            if (layer.color) {
              return colors[series] = layer.color;
            }
          }
        }
      };
    })(this));
    return {
      columns: columns,
      types: types,
      names: names,
      dataMap: dataMap,
      colors: colors,
      xAxisType: "category",
      titleText: this.compileTitleText(design, locale),
      order: "desc",
      format: format
    };
  };

  LayeredChartCompiler.prototype.compileDataNonCategorical = function(design, data, locale) {
    var colors, columns, dataMap, format, groups, names, types, xType, xs;
    columns = [];
    types = {};
    names = {};
    dataMap = {};
    colors = {};
    xs = {};
    groups = [];
    format = {};
    xType = this.axisBuilder.getAxisType(design.layers[0].axes.x);
    _.each(design.layers, (function(_this) {
      return function(layer, layerIndex) {
        var categories, categoryOrder, colorValues, layerData, seriesX, seriesY, yValues;
        layerData = data["layer" + layerIndex];
        _this.fixStringYValues(layerData);
        if (layer.cumulative) {
          layerData = _this.makeRowsCumulative(layerData);
        }
        layerData = _.filter(layerData, function(row) {
          return !_.includes(layer.axes.x.excludedValues, row.x);
        });
        if (layer.axes.color) {
          colorValues = _.uniq(_.pluck(layerData, "color"));
          categories = _this.axisBuilder.getCategories(layer.axes.color, colorValues, locale);
          categoryOrder = _.zipObject(_.map(categories, function(c, i) {
            return [c.value, i];
          }));
          colorValues = _.sortBy(colorValues, function(v) {
            return categoryOrder[v];
          });
          colorValues = _.difference(colorValues, layer.axes.color.excludedValues);
          return _.each(colorValues, function(colorValue) {
            var color, rows, seriesX, seriesY, yValues;
            seriesX = layerIndex + ":" + colorValue + ":x";
            seriesY = layerIndex + ":" + colorValue + ":y";
            color = _this.axisBuilder.getValueColor(layer.axes.color, colorValue);
            color = color || layer.color;
            if (color) {
              colors[seriesY] = color;
            }
            rows = _.where(layerData, {
              color: colorValue
            });
            yValues = _.pluck(rows, "y");
            columns.push([seriesY].concat(yValues));
            columns.push([seriesX].concat(_.pluck(rows, "x")));
            types[seriesY] = _this.getLayerType(design, layerIndex);
            names[seriesY] = _this.axisBuilder.formatValue(layer.axes.color, colorValue, locale);
            xs[seriesY] = seriesX;
            return _.each(rows, function(row, rowIndex) {
              return dataMap[seriesY + ":" + rowIndex] = {
                layerIndex: layerIndex,
                row: row
              };
            });
          });
        } else {
          seriesX = layerIndex + ":x";
          seriesY = layerIndex + ":y";
          yValues = _.pluck(layerData, "y");
          columns.push([seriesY].concat(yValues));
          columns.push([seriesX].concat(_.pluck(layerData, "x")));
          types[seriesY] = _this.getLayerType(design, layerIndex);
          names[seriesY] = layer.name || ("Series " + (layerIndex + 1));
          xs[seriesY] = seriesX;
          colors[seriesY] = layer.color;
          return _.each(layerData, function(row, rowIndex) {
            return dataMap[seriesY + ":" + rowIndex] = {
              layerIndex: layerIndex,
              row: row
            };
          });
        }
      };
    })(this));
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
      xAxisType: (xType === "date") ? "timeseries" : "indexed",
      xAxisTickFit: false,
      xAxisLabelText: this.compileXAxisLabelText(design, locale),
      yAxisLabelText: this.compileYAxisLabelText(design, locale),
      titleText: this.compileTitleText(design, locale),
      order: null,
      format: format
    };
  };

  LayeredChartCompiler.prototype.fixStringYValues = function(rows) {
    var j, len, row;
    for (j = 0, len = rows.length; j < len; j++) {
      row = rows[j];
      if (_.isString(row.y)) {
        row.y = parseFloat(row.y);
      }
    }
    return rows;
  };

  LayeredChartCompiler.prototype.flattenRowData = function(rows) {
    var existingRow, flatRows, j, k, len, len1, row, x, xs;
    flatRows = [];
    for (j = 0, len = rows.length; j < len; j++) {
      row = rows[j];
      if (!row.x) {
        flatRows.push(row);
        continue;
      }
      if (_.isString(row.x)) {
        try {
          xs = JSON.parse(row.x);
        } catch (error) {
          xs = row.x;
        }
      } else {
        xs = row.x;
      }
      for (k = 0, len1 = xs.length; k < len1; k++) {
        x = xs[k];
        existingRow = _.find(flatRows, function(r) {
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
  };

  LayeredChartCompiler.prototype.compileDataCategorical = function(design, data, locale) {
    var categories, categoryMap, categoryOrder, categoryXs, colors, column, columns, dataMap, defaultStacked, format, groups, i, j, k, layer, layerIndex, len, len1, len2, m, n, names, o, ref, ref1, ref2, stacked, types, xAxis, xType, xValues, xs, xtotals;
    columns = [];
    types = {};
    names = {};
    dataMap = {};
    colors = {};
    xs = {};
    groups = [];
    format = {};
    xAxis = design.layers[0].axes.x;
    xType = this.axisBuilder.getAxisType(xAxis);
    xValues = [];
    _.each(design.layers, (function(_this) {
      return function(layer, layerIndex) {
        var layerData;
        layerData = data["layer" + layerIndex];
        return xValues = _.union(xValues, _.uniq(_.pluck(layerData, "x")));
      };
    })(this));
    categories = this.axisBuilder.getCategories(xAxis, xValues, locale);
    categoryOrder = _.zipObject(_.map(categories, function(c, i) {
      return [c.value, i];
    }));
    categories = _.filter(categories, (function(_this) {
      return function(category) {
        return !_.includes(xAxis.excludedValues, category.value);
      };
    })(this));
    if (xType !== "enumset") {
      categories = _.takeRight(categories, 40);
      categoryXs = _.indexBy(categories, "value");
    }
    categoryMap = _.object(_.map(categories, function(c, i) {
      return [c.value, i];
    }));
    columns.push(["x"].concat(_.pluck(categories, "label")));
    _.each(design.layers, (function(_this) {
      return function(layer, layerIndex) {
        var colorCategories, colorCategoryOrder, colorValues, column, layerData, ref, ref1, series;
        layerData = data["layer" + layerIndex];
        layerData = _this.fixStringYValues(layerData);
        if (xType === "enumset") {
          layerData = _this.flattenRowData(layerData);
        }
        layerData = _.sortBy(layerData, function(row) {
          return categoryOrder[row.x];
        });
        if (layer.cumulative) {
          layerData = _this.makeRowsCumulative(layerData);
        }
        if (xType !== "enumset") {
          layerData = _.filter(layerData, function(row) {
            return categoryXs[row.x] != null;
          });
        }
        if (layer.axes.color) {
          colorValues = _.uniq(_.pluck(layerData, "color"));
          colorCategories = _this.axisBuilder.getCategories(layer.axes.color, colorValues, locale);
          colorCategoryOrder = _.zipObject(_.map(colorCategories, function(c, i) {
            return [c.value, i];
          }));
          colorValues = _.sortBy(colorValues, function(v) {
            return colorCategoryOrder[v];
          });
          colorValues = _.difference(colorValues, layer.axes.color.excludedValues);
          return _.each(colorValues, function(colorValue) {
            var color, column, i, j, len, ref, ref1, rows, series, value;
            series = layerIndex + ":" + colorValue;
            color = _this.axisBuilder.getValueColor(layer.axes.color, colorValue);
            color = color || layer.color;
            if (color) {
              colors[series] = color;
            }
            rows = _.where(layerData, {
              color: colorValue
            });
            column = _.map(categories, function(c) {
              return null;
            });
            _.each(rows, function(row) {
              var index;
              index = categoryMap[row.x];
              if (index != null) {
                column[index] = row.y;
                return dataMap[series + ":" + index] = {
                  layerIndex: layerIndex,
                  row: row
                };
              }
            });
            if (layer.cumulative) {
              for (i = j = 0, len = column.length; j < len; i = ++j) {
                value = column[i];
                if ((value == null) && i > 0) {
                  column[i] = column[i - 1];
                }
              }
            }
            columns.push([series].concat(column));
            types[series] = _this.getLayerType(design, layerIndex);
            names[series] = _this.axisBuilder.formatValue(layer.axes.color, colorValue, locale);
            xs[series] = "x";
            if ((ref = layer.axes) != null ? (ref1 = ref.y) != null ? ref1.format : void 0 : void 0) {
              return format[series] = d3Formatter(layer.axes.y.format);
            }
          });
        } else {
          series = "" + layerIndex;
          column = _.map(categories, function(c) {
            return null;
          });
          _.each(layerData, function(row) {
            var index;
            if (_.includes(layer.axes.x.excludedValues, row.x)) {
              return;
            }
            index = categoryMap[row.x];
            column[index] = row.y;
            return dataMap[series + ":" + index] = {
              layerIndex: layerIndex,
              row: row
            };
          });
          columns.push([series].concat(column));
          types[series] = _this.getLayerType(design, layerIndex);
          names[series] = layer.name || ("Series " + (layerIndex + 1));
          xs[series] = "x";
          colors[series] = layer.color;
          if ((ref = layer.axes) != null ? (ref1 = ref.y) != null ? ref1.format : void 0 : void 0) {
            return format[series] = d3Formatter(layer.axes.y.format);
          }
        }
      };
    })(this));
    if (design.stacked) {
      groups = [_.keys(names)];
    } else if (design.layers.length > 1) {
      groups = [];
      ref = design.layers;
      for (layerIndex = j = 0, len = ref.length; j < len; layerIndex = ++j) {
        layer = ref[layerIndex];
        defaultStacked = layer.axes.color != null;
        stacked = layer.stacked != null ? layer.stacked : defaultStacked;
        if (stacked) {
          groups.push(_.filter(_.keys(names), function(series) {
            return series.split(":")[0] === ("" + layerIndex);
          }));
        }
      }
      groups = _.filter(groups, function(g) {
        return g.length > 1;
      });
    }
    if (design.proportional) {
      xtotals = [];
      for (k = 0, len1 = columns.length; k < len1; k++) {
        column = columns[k];
        if (column[0] === 'x') {
          continue;
        }
        for (i = m = 1, ref1 = column.length; 1 <= ref1 ? m < ref1 : m > ref1; i = 1 <= ref1 ? ++m : --m) {
          xtotals[i] = (xtotals[i] || 0) + (column[i] || 0);
        }
      }
      for (n = 0, len2 = columns.length; n < len2; n++) {
        column = columns[n];
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
      xAxisLabelText: this.compileXAxisLabelText(design, locale),
      yAxisLabelText: this.compileYAxisLabelText(design, locale),
      titleText: this.compileTitleText(design, locale),
      order: null,
      format: format
    };
  };

  LayeredChartCompiler.prototype.compileExpr = function(expr) {
    var exprCompiler;
    exprCompiler = new ExprCompiler(this.schema);
    return exprCompiler.compileExpr({
      expr: expr,
      tableAlias: "main"
    });
  };

  LayeredChartCompiler.prototype.getLayerType = function(design, layerIndex) {
    return design.layers[layerIndex].type || design.type;
  };

  LayeredChartCompiler.prototype.doesLayerNeedGrouping = function(design, layerIndex) {
    return this.getLayerType(design, layerIndex) !== "scatter";
  };

  LayeredChartCompiler.prototype.canLayerUseXExpr = function(design, layerIndex) {
    var ref;
    return (ref = this.getLayerType(design, layerIndex)) !== 'pie' && ref !== 'donut';
  };

  LayeredChartCompiler.prototype.isXAxisRequired = function(design, layerIndex) {
    return _.any(design.layers, (function(_this) {
      return function(layer, i) {
        var ref;
        return (ref = _this.getLayerType(design, i)) !== 'pie' && ref !== 'donut';
      };
    })(this));
  };

  LayeredChartCompiler.prototype.isColorAxisRequired = function(design, layerIndex) {
    var ref;
    return (ref = this.getLayerType(design, layerIndex)) === 'pie' || ref === 'donut';
  };

  LayeredChartCompiler.prototype.compileDefaultTitleText = function(design, locale) {
    return "";
  };

  LayeredChartCompiler.prototype.compileDefaultYAxisLabelText = function(design, locale) {
    return this.axisBuilder.summarizeAxis(design.layers[0].axes.y, locale);
  };

  LayeredChartCompiler.prototype.compileDefaultXAxisLabelText = function(design, locale) {
    return this.axisBuilder.summarizeAxis(design.layers[0].axes.x, locale);
  };

  LayeredChartCompiler.prototype.compileTitleText = function(design, locale) {
    return design.titleText || this.compileDefaultTitleText(design, locale);
  };

  LayeredChartCompiler.prototype.compileYAxisLabelText = function(design, locale) {
    if (design.yAxisLabelText === "") {
      return this.compileDefaultYAxisLabelText(design, locale);
    }
    return design.yAxisLabelText;
  };

  LayeredChartCompiler.prototype.compileXAxisLabelText = function(design, locale) {
    if (design.xAxisLabelText === "") {
      return this.compileDefaultXAxisLabelText(design, locale);
    }
    return design.xAxisLabelText;
  };

  LayeredChartCompiler.prototype.createScope = function(design, layerIndex, row, locale) {
    var data, expressionBuilder, filter, filters, layer, names, scope;
    expressionBuilder = new ExprUtils(this.schema);
    layer = design.layers[layerIndex];
    filters = [];
    names = [];
    data = {
      layerIndex: layerIndex
    };
    if (layer.axes.x) {
      if (this.axisBuilder.getAxisType(layer.axes.x) === "enumset") {
        filters.push({
          type: "op",
          op: "@>",
          exprs: [
            {
              type: "op",
              op: "::jsonb",
              exprs: [
                this.axisBuilder.compileAxis({
                  axis: layer.axes.x,
                  tableAlias: "{alias}"
                })
              ]
            }, {
              type: "op",
              op: "::jsonb",
              exprs: [JSON.stringify(row.x)]
            }
          ]
        });
        names.push(this.axisBuilder.summarizeAxis(layer.axes.x, locale) + " includes " + this.exprUtils.stringifyExprLiteral(layer.axes.x.expr, [row.x], locale));
        data.x = row.x;
      } else {
        filters.push(this.axisBuilder.createValueFilter(layer.axes.x, row.x));
        names.push(this.axisBuilder.summarizeAxis(layer.axes.x, locale) + " is " + this.axisBuilder.formatValue(layer.axes.x, row.x, locale));
        data.x = row.x;
      }
    }
    if (layer.axes.color) {
      filters.push(this.axisBuilder.createValueFilter(layer.axes.color, row.color));
      names.push(this.axisBuilder.summarizeAxis(layer.axes.color, locale) + " is " + this.axisBuilder.formatValue(layer.axes.color, row.color, locale));
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
    } else {
      filter = {
        table: layer.table,
        jsonql: filters[0]
      };
    }
    scope = {
      name: ExprUtils.localizeString(this.schema.getTable(layer.table).name, locale) + " " + names.join(" and "),
      filter: filter,
      data: data
    };
    return scope;
  };

  LayeredChartCompiler.prototype.makeRowsCumulative = function(rows) {
    var j, len, newRows, row, total, totals, y;
    totals = {};
    newRows = [];
    for (j = 0, len = rows.length; j < len; j++) {
      row = rows[j];
      total = totals[row.color] || 0;
      y = total + row.y;
      totals[row.color] = y;
      newRows.push(_.extend({}, row, {
        y: y
      }));
    }
    return newRows;
  };

  return LayeredChartCompiler;

})();

cleanString = function(str) {
  if (!str) {
    return str;
  }
  return str.replace("\u00A0", " ");
};
