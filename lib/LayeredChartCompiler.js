var ExpressionBuilder, ExpressionCompiler, LayeredChartCompiler, titlePadding;

ExpressionCompiler = require('./ExpressionCompiler');

ExpressionBuilder = require('./ExpressionBuilder');

titlePadding = {
  top: 0,
  right: 0,
  bottom: 15,
  left: 0
};

module.exports = LayeredChartCompiler = (function() {
  function LayeredChartCompiler(options) {
    this.schema = options.schema;
    this.exprBuilder = new ExpressionBuilder(this.schema);
  }

  LayeredChartCompiler.prototype.getLayerType = function(design, layerIndex) {
    return design.layers[layerIndex].type || design.type;
  };

  LayeredChartCompiler.prototype.doesLayerNeedGrouping = function(design, layerIndex) {
    return this.getLayerType(design, layerIndex) !== "scatter";
  };

  LayeredChartCompiler.prototype.isExprCategorical = function(expr) {
    var ref;
    return (ref = this.exprBuilder.getExprType(expr)) === 'text' || ref === 'enum' || ref === 'boolean';
  };

  LayeredChartCompiler.prototype.canLayerUseXExpr = function(design, layerIndex) {
    var ref;
    return (ref = this.getLayerType(design, layerIndex)) !== 'pie' && ref !== 'donut';
  };

  LayeredChartCompiler.prototype.compileExpr = function(expr) {
    var exprCompiler;
    exprCompiler = new ExpressionCompiler(this.schema);
    return exprCompiler.compileExpr({
      expr: expr,
      tableAlias: "main"
    });
  };

  LayeredChartCompiler.prototype.getQueries = function(design, extraFilters) {
    var colorExpr, filter, i, j, layer, layerIndex, len, queries, query, ref, relevantFilters, whereClauses, xExpr, yExpr;
    queries = {};
    for (layerIndex = i = 0, ref = design.layers.length; 0 <= ref ? i < ref : i > ref; layerIndex = 0 <= ref ? ++i : --i) {
      layer = design.layers[layerIndex];
      query = {
        type: "query",
        selects: [],
        from: {
          type: "table",
          table: layer.table,
          alias: "main"
        },
        limit: 1000,
        groupBy: [],
        orderBy: []
      };
      xExpr = this.compileExpr(layer.xExpr);
      colorExpr = this.compileExpr(layer.colorExpr);
      yExpr = this.compileExpr(layer.yExpr);
      if (xExpr) {
        query.selects.push({
          type: "select",
          expr: xExpr,
          alias: "x"
        });
      }
      if (colorExpr) {
        query.selects.push({
          type: "select",
          expr: colorExpr,
          alias: "color"
        });
      }
      if (xExpr || colorExpr) {
        query.orderBy.push({
          ordinal: 1
        });
      }
      if (xExpr && colorExpr) {
        query.orderBy.push({
          ordinal: 2
        });
      }
      if (this.doesLayerNeedGrouping(design, layerIndex)) {
        if (xExpr || colorExpr) {
          query.groupBy.push(1);
        }
        if (xExpr && colorExpr) {
          query.groupBy.push(2);
        }
        if (yExpr) {
          query.selects.push({
            type: "select",
            expr: {
              type: "op",
              op: layer.yAggr,
              exprs: [yExpr]
            },
            alias: "y"
          });
        } else {
          query.selects.push({
            type: "select",
            expr: {
              type: "op",
              op: layer.yAggr,
              exprs: []
            },
            alias: "y"
          });
        }
      } else {
        query.selects.push({
          type: "select",
          expr: yExpr,
          alias: "y"
        });
      }
      if (layer.filter) {
        query.where = this.compileExpr(layer.filter);
      }
      if (extraFilters && extraFilters.length > 0) {
        relevantFilters = _.where(extraFilters, {
          table: layer.table
        });
        if (relevantFilters.length > 0) {
          whereClauses = [];
          if (query.where) {
            whereClauses.push(query.where);
          }
          for (j = 0, len = relevantFilters.length; j < len; j++) {
            filter = relevantFilters[j];
            whereClauses.push(this.compileExpr(filter));
          }
          if (whereClauses.length > 1) {
            query.where = {
              type: "op",
              op: "and",
              exprs: whereClauses
            };
          } else {
            query.where = whereClauses[0];
          }
        }
      }
      queries["layer" + layerIndex] = query;
    }
    return queries;
  };

  LayeredChartCompiler.prototype.mapValue = function(expr, value) {
    var item, items;
    if (value && this.exprBuilder.getExprType(expr) === "enum") {
      items = this.exprBuilder.getExprValues(expr);
      item = _.findWhere(items, {
        id: value
      });
      if (item) {
        return item.name;
      }
    }
    return value || "None";
  };

  LayeredChartCompiler.prototype.getColumns = function(design, data, dataMap) {
    var colorVal, colorValues, columns, i, j, k, l, layer, layerIndex, len, len1, len2, len3, len4, len5, m, n, o, p, ref, ref1, ref2, ref3, row, val, xCategorical, xPresent, xValues, xcolumn, ycolumn;
    if (dataMap == null) {
      dataMap = {};
    }
    columns = [];
    xCategorical = this.isExprCategorical(design.layers[0].xExpr);
    xPresent = design.layers[0].xExpr != null;
    xValues = [];
    for (layerIndex = i = 0, ref = design.layers.length; 0 <= ref ? i < ref : i > ref; layerIndex = 0 <= ref ? ++i : --i) {
      layer = design.layers[layerIndex];
      xValues = _.union(xValues, _.pluck(data["layer" + layerIndex], "x"));
    }
    for (layerIndex = j = 0, ref1 = design.layers.length; 0 <= ref1 ? j < ref1 : j > ref1; layerIndex = 0 <= ref1 ? ++j : --j) {
      layer = design.layers[layerIndex];
      if (layer.colorExpr) {
        colorValues = _.uniq(_.pluck(data["layer" + layerIndex], "color"));
        if (xCategorical) {
          for (k = 0, len = colorValues.length; k < len; k++) {
            colorVal = colorValues[k];
            xcolumn = ["layer" + layerIndex + ":" + colorVal + ":x"];
            ycolumn = ["layer" + layerIndex + ":" + colorVal + ":y"];
            for (l = 0, len1 = xValues.length; l < len1; l++) {
              val = xValues[l];
              xcolumn.push(this.mapValue(layer.xExpr, val));
              row = _.findWhere(data["layer" + layerIndex], {
                x: val,
                color: colorVal
              });
              if (row) {
                ycolumn.push(row.y);
                dataMap[ycolumn[0] + "-" + (ycolumn.length - 2)] = {
                  layerIndex: layerIndex,
                  row: row
                };
              } else {
                ycolumn.push(null);
              }
            }
            columns.push(xcolumn);
            columns.push(ycolumn);
          }
        } else {
          for (m = 0, len2 = colorValues.length; m < len2; m++) {
            colorVal = colorValues[m];
            if (xPresent) {
              xcolumn = ["layer" + layerIndex + ":" + colorVal + ":x"];
            }
            ycolumn = ["layer" + layerIndex + ":" + colorVal + ":y"];
            ref2 = data["layer" + layerIndex];
            for (n = 0, len3 = ref2.length; n < len3; n++) {
              row = ref2[n];
              if (row.color === colorVal) {
                if (xPresent) {
                  xcolumn.push(this.mapValue(layer.xExpr, row.x));
                }
                ycolumn.push(row.y);
                dataMap[ycolumn[0] + "-" + (ycolumn.length - 2)] = {
                  layerIndex: layerIndex,
                  row: row
                };
              }
            }
            if (xPresent) {
              columns.push(xcolumn);
            }
            columns.push(ycolumn);
          }
        }
      } else {
        if (xCategorical) {
          xcolumn = ["layer" + layerIndex + ":x"];
          ycolumn = ["layer" + layerIndex + ":y"];
          for (o = 0, len4 = xValues.length; o < len4; o++) {
            val = xValues[o];
            xcolumn.push(this.mapValue(layer.xExpr, val));
            row = _.findWhere(data["layer" + layerIndex], {
              x: val
            });
            if (row) {
              ycolumn.push(row.y);
              dataMap[ycolumn[0] + "-" + (ycolumn.length - 2)] = {
                layerIndex: layerIndex,
                row: row
              };
            } else {
              ycolumn.push(null);
            }
          }
          columns.push(xcolumn);
          columns.push(ycolumn);
        } else {
          if (xPresent) {
            xcolumn = ["layer" + layerIndex + ":x"];
          }
          ycolumn = ["layer" + layerIndex + ":y"];
          ref3 = data["layer" + layerIndex];
          for (p = 0, len5 = ref3.length; p < len5; p++) {
            row = ref3[p];
            if (xPresent) {
              xcolumn.push(this.mapValue(layer.xExpr, row.x));
            }
            ycolumn.push(row.y);
            dataMap[ycolumn[0] + "-" + (ycolumn.length - 2)] = {
              layerIndex: layerIndex,
              row: row
            };
          }
          if (xPresent) {
            columns.push(xcolumn);
          }
          columns.push(ycolumn);
        }
      }
    }
    return columns;
  };

  LayeredChartCompiler.prototype.getXs = function(columns) {
    var col, i, len, xcol, xs;
    xs = {};
    for (i = 0, len = columns.length; i < len; i++) {
      col = columns[i];
      if (col[0].match(/:y$/)) {
        xcol = col[0].replace(/:y$/, ":x");
        if (_.any(columns, function(c) {
          return c[0] === xcol;
        })) {
          xs[col[0]] = xcol;
        }
      }
    }
    return xs;
  };

  LayeredChartCompiler.prototype.getNames = function(design, data) {
    var colorVal, colorValues, i, j, layer, layerIndex, len, names, ref;
    names = {};
    for (layerIndex = i = 0, ref = design.layers.length; 0 <= ref ? i < ref : i > ref; layerIndex = 0 <= ref ? ++i : --i) {
      layer = design.layers[layerIndex];
      if (layer.colorExpr) {
        colorValues = _.uniq(_.pluck(data["layer" + layerIndex], "color"));
        for (j = 0, len = colorValues.length; j < len; j++) {
          colorVal = colorValues[j];
          names["layer" + layerIndex + ":" + colorVal + ":y"] = this.mapValue(layer.colorExpr, colorVal);
        }
      } else {
        names["layer" + layerIndex + ":y"] = layer.name || ("Series " + (layerIndex + 1));
      }
    }
    return names;
  };

  LayeredChartCompiler.prototype.getTypes = function(design, columns) {
    var column, i, layerIndex, len, types;
    types = {};
    for (i = 0, len = columns.length; i < len; i++) {
      column = columns[i];
      if (column[0].match(/:y$/)) {
        layerIndex = parseInt(column[0].match(/^layer(\d+)/)[1]);
        types[column[0]] = design.layers[layerIndex].type || design.type;
      }
    }
    return types;
  };

  LayeredChartCompiler.prototype.getGroups = function(design, columns) {
    var column, group, groups, i, j, layer, layerIndex, len, ref;
    groups = [];
    for (layerIndex = i = 0, ref = design.layers.length; 0 <= ref ? i < ref : i > ref; layerIndex = 0 <= ref ? ++i : --i) {
      layer = design.layers[layerIndex];
      if (layer.stacked) {
        group = [];
        for (j = 0, len = columns.length; j < len; j++) {
          column = columns[j];
          if (column[0].match("^layer" + layerIndex + ":.*:y$")) {
            group.push(column[0]);
          }
        }
        groups.push(group);
      }
    }
    return groups;
  };

  LayeredChartCompiler.prototype.getXAxisType = function(design) {
    switch (this.exprBuilder.getExprType(design.layers[0].xExpr)) {
      case "text":
      case "enum":
      case "boolean":
        return "category";
      case "date":
        return "timeseries";
      default:
        return "indexed";
    }
  };

  LayeredChartCompiler.prototype.createChartOptions = function(props) {
    var chartDesign, columns;
    columns = this.getColumns(props.design, props.data);
    chartDesign = {
      data: {
        types: this.getTypes(props.design, columns),
        columns: columns,
        names: this.getNames(props.design, props.data),
        types: this.getTypes(props.design, columns),
        groups: this.getGroups(props.design, columns),
        xs: this.getXs(columns)
      },
      legend: {
        hide: props.design.layers.length === 1 && !props.design.layers[0].colorExpr
      },
      grid: {
        focus: {
          show: false
        }
      },
      axis: {
        x: {
          type: this.getXAxisType(props.design),
          label: {
            text: props.design.xAxisLabelText,
            position: 'outer-center'
          }
        },
        y: {
          label: {
            text: props.design.yAxisLabelText,
            position: 'outer-center'
          }
        },
        rotated: props.design.transpose
      },
      size: {
        width: props.width,
        height: props.height
      },
      pie: {
        expand: false
      },
      title: {
        text: props.design.titleText,
        padding: titlePadding
      },
      transition: {
        duration: 0
      }
    };
    return chartDesign;
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
    if (layer.xExpr) {
      if (row.x != null) {
        filters.push({
          type: "comparison",
          table: layer.table,
          lhs: layer.xExpr,
          op: "=",
          rhs: {
            type: "literal",
            valueType: expressionBuilder.getExprType(layer.xExpr),
            value: row.x
          }
        });
      } else {
        filters.push({
          type: "comparison",
          table: layer.table,
          lhs: layer.xExpr,
          op: "is null"
        });
      }
      names.push(expressionBuilder.summarizeExpr(layer.xExpr) + " is " + expressionBuilder.stringifyExprLiteral(layer.xExpr, row.x));
      data.x = row.x;
    }
    if (layer.colorExpr) {
      if (row.color != null) {
        filters.push({
          type: "comparison",
          table: layer.table,
          lhs: layer.colorExpr,
          op: "=",
          rhs: {
            type: "literal",
            valueType: expressionBuilder.getExprType(layer.colorExpr),
            value: row.color
          }
        });
      } else {
        filters.push({
          type: "comparison",
          table: layer.table,
          lhs: layer.colorExpr,
          op: "is null"
        });
      }
      names.push(expressionBuilder.summarizeExpr(layer.colorExpr) + " is " + expressionBuilder.stringifyExprLiteral(layer.colorExpr, row.color));
      data.color = row.color;
    }
    if (filters.length > 1) {
      filter = {
        type: "logical",
        table: layer.table,
        op: "and",
        exprs: filters
      };
    } else {
      filter = filters[0];
    }
    scope = {
      name: this.schema.getTable(layer.table).name + " " + names.join(" and "),
      filter: filter,
      data: data
    };
    return scope;
  };

  return LayeredChartCompiler;

})();
