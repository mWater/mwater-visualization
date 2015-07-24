var ExpressionBuilder, ExpressionCompiler, LayeredChartCompiler;

ExpressionCompiler = require('./ExpressionCompiler');

ExpressionBuilder = require('./ExpressionBuilder');

module.exports = LayeredChartCompiler = (function() {
  function LayeredChartCompiler(options) {
    this.schema = options.schema;
    this.exprBuilder = new ExpressionBuilder(this.schema);
  }

  LayeredChartCompiler.prototype.getLayerType = function(design, layerId) {
    return design.layers[layerId].type || design.type;
  };

  LayeredChartCompiler.prototype.doesLayerNeedGrouping = function(design, layerId) {
    return this.getLayerType(design, layerId) !== "scatter";
  };

  LayeredChartCompiler.prototype.isExprCategorical = function(expr) {
    var ref;
    return (ref = this.exprBuilder.getExprType(expr)) === 'text' || ref === 'enum' || ref === 'boolean';
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
    var colorExpr, filter, i, j, layer, layerId, len, queries, query, ref, relevantFilters, whereClauses, xExpr, yExpr;
    queries = {};
    for (layerId = i = 0, ref = design.layers.length; 0 <= ref ? i < ref : i > ref; layerId = 0 <= ref ? ++i : --i) {
      layer = design.layers[layerId];
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
      if (this.doesLayerNeedGrouping(design, layerId)) {
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
      queries["layer" + layerId] = query;
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
    return value;
  };

  LayeredChartCompiler.prototype.getColumns = function(design, data) {
    var colorVal, colorValues, columns, i, j, k, l, layer, layerId, len, len1, len2, len3, len4, len5, m, n, o, p, ref, ref1, ref2, ref3, row, val, xCategorical, xPresent, xValues, xcolumn, ycolumn;
    columns = [];
    xCategorical = this.isExprCategorical(design.layers[0].xExpr);
    xPresent = design.layers[0].xExpr != null;
    xValues = [];
    for (layerId = i = 0, ref = design.layers.length; 0 <= ref ? i < ref : i > ref; layerId = 0 <= ref ? ++i : --i) {
      layer = design.layers[layerId];
      xValues = _.union(xValues, _.pluck(data["layer" + layerId], "x"));
    }
    for (layerId = j = 0, ref1 = design.layers.length; 0 <= ref1 ? j < ref1 : j > ref1; layerId = 0 <= ref1 ? ++j : --j) {
      layer = design.layers[layerId];
      if (layer.colorExpr) {
        colorValues = _.uniq(_.pluck(data["layer" + layerId], "color"));
        if (xCategorical) {
          for (k = 0, len = colorValues.length; k < len; k++) {
            colorVal = colorValues[k];
            xcolumn = ["layer" + layerId + ":" + colorVal + ":x"];
            ycolumn = ["layer" + layerId + ":" + colorVal + ":y"];
            for (l = 0, len1 = xValues.length; l < len1; l++) {
              val = xValues[l];
              xcolumn.push(this.mapValue(layer.xExpr, val));
              row = _.findWhere(data["layer" + layerId], {
                x: val,
                color: colorVal
              });
              if (row) {
                ycolumn.push(row.y);
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
              xcolumn = ["layer" + layerId + ":" + colorVal + ":x"];
            }
            ycolumn = ["layer" + layerId + ":" + colorVal + ":y"];
            ref2 = data["layer" + layerId];
            for (n = 0, len3 = ref2.length; n < len3; n++) {
              row = ref2[n];
              if (row.color === colorVal) {
                if (xPresent) {
                  xcolumn.push(this.mapValue(layer.xExpr, row.x));
                }
                ycolumn.push(row.y);
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
          xcolumn = ["layer" + layerId + ":x"];
          ycolumn = ["layer" + layerId + ":y"];
          for (o = 0, len4 = xValues.length; o < len4; o++) {
            val = xValues[o];
            xcolumn.push(this.mapValue(layer.xExpr, val));
            row = _.findWhere(data["layer" + layerId], {
              x: val
            });
            if (row) {
              ycolumn.push(row.y);
            } else {
              ycolumn.push(null);
            }
          }
          columns.push(xcolumn);
          columns.push(ycolumn);
        } else {
          if (xPresent) {
            xcolumn = ["layer" + layerId + ":x"];
          }
          ycolumn = ["layer" + layerId + ":y"];
          ref3 = data["layer" + layerId];
          for (p = 0, len5 = ref3.length; p < len5; p++) {
            row = ref3[p];
            if (xPresent) {
              xcolumn.push(this.mapValue(layer.xExpr, row.x));
            }
            ycolumn.push(row.y);
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
    var colorVal, colorValues, i, j, layer, layerId, len, names, ref;
    names = {};
    for (layerId = i = 0, ref = design.layers.length; 0 <= ref ? i < ref : i > ref; layerId = 0 <= ref ? ++i : --i) {
      layer = design.layers[layerId];
      if (layer.colorExpr) {
        colorValues = _.uniq(_.pluck(data["layer" + layerId], "color"));
        for (j = 0, len = colorValues.length; j < len; j++) {
          colorVal = colorValues[j];
          names["layer" + layerId + ":" + colorVal + ":y"] = this.mapValue(layer.colorExpr, colorVal);
        }
      } else {
        names["layer" + layerId + ":y"] = layer.name || ("Series " + (layerId + 1));
      }
    }
    return names;
  };

  LayeredChartCompiler.prototype.getTypes = function(design, columns) {
    var column, i, layerId, len, types;
    types = {};
    for (i = 0, len = columns.length; i < len; i++) {
      column = columns[i];
      if (column[0].match(/:y$/)) {
        layerId = parseInt(column[0].match(/^layer(\d+)/)[1]);
        types[column[0]] = design.layers[layerId].type || design.type;
      }
    }
    return types;
  };

  LayeredChartCompiler.prototype.getGroups = function(design, columns) {
    var column, group, groups, i, j, layer, layerId, len, ref;
    groups = [];
    for (layerId = i = 0, ref = design.layers.length; 0 <= ref ? i < ref : i > ref; layerId = 0 <= ref ? ++i : --i) {
      layer = design.layers[layerId];
      if (layer.stacked) {
        group = [];
        for (j = 0, len = columns.length; j < len; j++) {
          column = columns[j];
          if (column[0].match("^layer" + layerId + ":.*:y$")) {
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

  return LayeredChartCompiler;

})();
