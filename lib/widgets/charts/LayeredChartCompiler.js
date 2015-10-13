var AxisBuilder, ExpressionBuilder, ExpressionCompiler, LayeredChartCompiler, _, colorHacks, injectTableAlias;

_ = require('lodash');

ExpressionCompiler = require('./../../expressions/ExpressionCompiler');

ExpressionBuilder = require('./../../expressions/ExpressionBuilder');

AxisBuilder = require('../../expressions/axes/AxisBuilder');

injectTableAlias = require('../../injectTableAlias');

colorHacks = {
  "ok": "#00AA00",
  "maint": "#AAAA00",
  "broken": "#AA0000",
  "green": "#00AA00",
  "yellow": "#AAAA00",
  "red": "#AA0000",
  "null": "#888888"
};

module.exports = LayeredChartCompiler = (function() {
  function LayeredChartCompiler(options) {
    this.schema = options.schema;
    this.exprBuilder = new ExpressionBuilder(this.schema);
    this.axisBuilder = new AxisBuilder({
      schema: this.schema
    });
  }

  LayeredChartCompiler.prototype.createQueries = function(design, extraFilters) {
    var exprCompiler, filter, j, k, layer, layerIndex, len, queries, query, ref, relevantFilters, whereClauses;
    exprCompiler = new ExpressionCompiler(this.schema);
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
    var c3Data, chartDesign, titlePadding;
    titlePadding = {
      top: 0,
      right: 0,
      bottom: 15,
      left: 0
    };
    c3Data = this.compileData(options.design, options.data);
    chartDesign = {
      data: {
        types: c3Data.types,
        columns: c3Data.columns,
        names: c3Data.names,
        types: c3Data.types,
        groups: c3Data.groups,
        xs: c3Data.xs,
        colors: c3Data.colors
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
            text: c3Data.xAxisLabelText,
            position: options.design.transpose ? 'outer-middle' : 'outer-center'
          },
          tick: {
            fit: c3Data.xAxisTickFit
          }
        },
        y: {
          label: {
            text: c3Data.yAxisLabelText,
            position: options.design.transpose ? 'outer-center' : 'outer-middle'
          },
          max: options.design.type === "bar" && options.design.proportional ? 100 : void 0,
          padding: options.design.type === "bar" && options.design.proportional ? {
            top: 0,
            bottom: 0
          } : void 0,
          tick: {
            format: d3.format(",")
          }
        },
        rotated: options.design.transpose
      },
      size: {
        width: options.width,
        height: options.height
      },
      pie: {
        expand: false
      },
      title: {
        text: c3Data.titleText,
        padding: titlePadding
      },
      transition: {
        duration: 0
      }
    };
    return chartDesign;
  };

  LayeredChartCompiler.prototype.compileData = function(design, data) {
    var isCategoricalX, ref, xType;
    if (((ref = design.type) === 'pie' || ref === 'donut') || _.any(design.layers, function(l) {
      var ref1;
      return (ref1 = l.type) === 'pie' || ref1 === 'donut';
    })) {
      return this.compileDataPolar(design, data);
    }
    isCategoricalX = design.type === "bar" || _.any(design.layers, function(l) {
      return l.type === "bar";
    });
    xType = this.axisBuilder.getAxisType(design.layers[0].axes.x);
    if (xType === "enum" || xType === "text" || xType === "boolean") {
      isCategoricalX = true;
    }
    if (isCategoricalX) {
      return this.compileDataCategorical(design, data);
    } else {
      return this.compileDataNonCategorical(design, data);
    }
  };

  LayeredChartCompiler.prototype.compileDataPolar = function(design, data) {
    var colors, columns, dataMap, names, types;
    columns = [];
    types = {};
    names = {};
    dataMap = {};
    colors = {};
    _.each(design.layers, (function(_this) {
      return function(layer, layerIndex) {
        var row, series;
        if (layer.axes.color) {
          return _.each(data["layer" + layerIndex], function(row, rowIndex) {
            var series;
            series = layerIndex + ":" + rowIndex;
            columns.push([series, row.y]);
            types[series] = _this.getLayerType(design, layerIndex);
            names[series] = _this.axisBuilder.formatValue(layer.axes.color, row.color);
            dataMap[series] = {
              layerIndex: layerIndex,
              row: row
            };
            if (colorHacks[row.color]) {
              return colors[series] = colorHacks[row.color];
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
            if (colorHacks[row.color]) {
              colors[series] = colorHacks[row.color];
            }
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
      titleText: this.compileTitleText(design)
    };
  };

  LayeredChartCompiler.prototype.compileDataNonCategorical = function(design, data) {
    var colors, columns, dataMap, names, types, xType, xs;
    columns = [];
    types = {};
    names = {};
    dataMap = {};
    colors = {};
    xs = {};
    xType = this.axisBuilder.getAxisType(design.layers[0].axes.x);
    _.each(design.layers, (function(_this) {
      return function(layer, layerIndex) {
        var colorValues, layerData, seriesX, seriesY, yValues;
        layerData = data["layer" + layerIndex];
        if (layer.axes.color) {
          colorValues = _.uniq(_.pluck(layerData, "color"));
          return _.each(colorValues, function(colorValue) {
            var rows, seriesX, seriesY, yValues;
            seriesX = layerIndex + ":" + colorValue + ":x";
            seriesY = layerIndex + ":" + colorValue + ":y";
            rows = _.where(layerData, {
              color: colorValue
            });
            yValues = _.map(_.pluck(rows, "y"), function(v) {
              return parseFloat(v);
            });
            if (layer.cumulative) {
              _this.makeCumulative(yValues);
            }
            columns.push([seriesY].concat(yValues));
            columns.push([seriesX].concat(_.pluck(rows, "x")));
            types[seriesY] = _this.getLayerType(design, layerIndex);
            names[seriesY] = _this.axisBuilder.formatValue(layer.axes.color, colorValue);
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
          yValues = _.map(_.pluck(layerData, "y"), function(v) {
            return parseFloat(v);
          });
          if (layer.cumulative) {
            _this.makeCumulative(yValues);
          }
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
    return {
      columns: columns,
      types: types,
      names: names,
      dataMap: dataMap,
      colors: colors,
      xs: xs,
      xAxisType: (xType === "date") ? "timeseries" : "indexed",
      xAxisTickFit: false,
      xAxisLabelText: this.compileXAxisLabelText(design),
      yAxisLabelText: this.compileYAxisLabelText(design),
      titleText: this.compileTitleText(design)
    };
  };

  LayeredChartCompiler.prototype.compileDataCategorical = function(design, data) {
    var categories, categoryMap, colors, column, columns, dataMap, groups, i, j, k, len, len1, m, n, names, ref, ref1, types, xAxis, xType, xValues, xs, xtotals;
    columns = [];
    types = {};
    names = {};
    dataMap = {};
    colors = {};
    xs = {};
    groups = [];
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
    categories = this.axisBuilder.getCategories(xAxis, xValues);
    categoryMap = _.object(_.map(categories, function(c, i) {
      return [c.value, i];
    }));
    columns.push(["x"].concat(_.pluck(categories, "label")));
    _.each(design.layers, (function(_this) {
      return function(layer, layerIndex) {
        var colorValues, column, layerData, series;
        layerData = data["layer" + layerIndex];
        if (layer.axes.color) {
          colorValues = _.uniq(_.pluck(layerData, "color"));
          return _.each(colorValues, function(colorValue) {
            var column, rows, series;
            series = layerIndex + ":" + colorValue;
            if (colorHacks[colorValue]) {
              colors[series] = colorHacks[colorValue];
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
              column[index] = row.y ? parseFloat(row.y) : null;
              return dataMap[series + ":" + index] = {
                layerIndex: layerIndex,
                row: row
              };
            });
            if (layer.cumulative) {
              _this.makeCumulative(column);
            }
            columns.push([series].concat(column));
            types[series] = _this.getLayerType(design, layerIndex);
            names[series] = _this.axisBuilder.formatValue(layer.axes.color, colorValue);
            return xs[series] = "x";
          });
        } else {
          series = "" + layerIndex;
          column = _.map(categories, function(c) {
            return null;
          });
          _.each(layerData, function(row) {
            var index;
            index = categoryMap[row.x];
            column[index] = row.y ? parseFloat(row.y) : null;
            return dataMap[series + ":" + index] = {
              layerIndex: layerIndex,
              row: row
            };
          });
          if (layer.cumulative) {
            _this.makeCumulative(column);
          }
          columns.push([series].concat(column));
          types[series] = _this.getLayerType(design, layerIndex);
          names[series] = layer.name || ("Series " + (layerIndex + 1));
          xs[series] = "x";
          return colors[series] = layer.color;
        }
      };
    })(this));
    if (design.stacked) {
      groups = [_.keys(names)];
    }
    if (design.proportional) {
      xtotals = [];
      for (j = 0, len = columns.length; j < len; j++) {
        column = columns[j];
        if (column[0] === 'x') {
          continue;
        }
        for (i = k = 1, ref = column.length; 1 <= ref ? k < ref : k > ref; i = 1 <= ref ? ++k : --k) {
          xtotals[i] = (xtotals[i] || 0) + (column[i] || 0);
        }
      }
      for (m = 0, len1 = columns.length; m < len1; m++) {
        column = columns[m];
        if (column[0] === 'x') {
          continue;
        }
        for (i = n = 1, ref1 = column.length; 1 <= ref1 ? n < ref1 : n > ref1; i = 1 <= ref1 ? ++n : --n) {
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
      xAxisLabelText: this.compileXAxisLabelText(design),
      yAxisLabelText: this.compileYAxisLabelText(design),
      titleText: this.compileTitleText(design)
    };
  };

  LayeredChartCompiler.prototype.compileExpr = function(expr) {
    var exprCompiler;
    exprCompiler = new ExpressionCompiler(this.schema);
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
    var ref;
    return (ref = this.getLayerType(design, layerIndex)) !== 'pie' && ref !== 'donut';
  };

  LayeredChartCompiler.prototype.isColorAxisRequired = function(design, layerIndex) {
    var ref;
    return (ref = this.getLayerType(design, layerIndex)) === 'pie' || ref === 'donut';
  };

  LayeredChartCompiler.prototype.compileDefaultTitleText = function(design) {
    return "";
  };

  LayeredChartCompiler.prototype.compileDefaultYAxisLabelText = function(design) {
    return this.axisBuilder.summarizeAxis(design.layers[0].axes.y);
  };

  LayeredChartCompiler.prototype.compileDefaultXAxisLabelText = function(design) {
    return this.axisBuilder.summarizeAxis(design.layers[0].axes.x);
  };

  LayeredChartCompiler.prototype.compileTitleText = function(design) {
    return design.titleText || this.compileDefaultTitleText(design);
  };

  LayeredChartCompiler.prototype.compileYAxisLabelText = function(design) {
    return design.yAxisLabelText || this.compileDefaultYAxisLabelText(design);
  };

  LayeredChartCompiler.prototype.compileXAxisLabelText = function(design) {
    return design.xAxisLabelText || this.compileDefaultXAxisLabelText(design);
  };

  LayeredChartCompiler.prototype.createScope = function(design, layerIndex, row) {
    var data, expressionBuilder, filter, filters, layer, names, scope;
    expressionBuilder = new ExpressionBuilder(this.schema);
    layer = design.layers[layerIndex];
    filters = [];
    names = [];
    data = {
      layerIndex: layerIndex
    };
    if (layer.axes.x) {
      filters.push(this.axisBuilder.createValueFilter(layer.axes.x, row.x));
      names.push(this.axisBuilder.summarizeAxis(layer.axes.x) + " is " + this.axisBuilder.formatValue(layer.axes.x, row.x));
      data.x = row.x;
    }
    if (layer.axes.color) {
      filters.push(this.axisBuilder.createValueFilter(layer.axes.color, row.color));
      names.push(this.axisBuilder.summarizeAxis(layer.axes.color) + " is " + this.axisBuilder.formatValue(layer.axes.color, row.color));
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
      name: this.schema.getTable(layer.table).name + " " + names.join(" and "),
      filter: filter,
      data: data
    };
    return scope;
  };

  LayeredChartCompiler.prototype.makeCumulative = function(column) {
    var i, j, ref, results, total;
    total = 0;
    results = [];
    for (i = j = 0, ref = column.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      total += column[i];
      results.push(column[i] = total);
    }
    return results;
  };

  return LayeredChartCompiler;

})();
