var Chart, ExpressionBuilder, H, LayeredChart, LayeredChartCompiler, LayeredChartDesignerComponent, LayeredChartSvgFileSaver, LayeredChartViewComponent, React, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ = require('lodash');

React = require('react');

H = React.DOM;

Chart = require('./Chart');

LayeredChartCompiler = require('./LayeredChartCompiler');

ExpressionBuilder = require('./expressions/ExpressionBuilder');

LayeredChartDesignerComponent = require('./LayeredChartDesignerComponent');

LayeredChartViewComponent = require('./LayeredChartViewComponent');

LayeredChartSvgFileSaver = require('./LayeredChartSvgFileSaver');


/*
Design is:
  
  type: bar/line/spline/scatter/area/pie/donut
  layers: array of layers
  titleText: title text
  xAxisLabelText: text of x axis label
  yAxisLabelText: text of y axis label
  transpose: true to flip axes

layer:
  name: label for layer (optional)
  xExpr: x-axis expression
  colorExpr: expression to split into series, each with a color
  yExpr: y-axis expression
  yAggr: aggregation function if needed for y
  stacked: true to stack
  type: bar/line/spline/scatter/area/pie/donut (overrides main one)
  filter: optional logical expression to filter by
 */

module.exports = LayeredChart = (function(superClass) {
  extend(LayeredChart, superClass);

  function LayeredChart(options) {
    this.schema = options.schema;
    this.exprBuilder = new ExpressionBuilder(this.schema);
  }

  LayeredChart.prototype.cleanDesign = function(design) {
    var aggrs, compiler, i, layer, layerId, ref, ref1;
    compiler = new LayeredChartCompiler({
      schema: this.schema
    });
    design = _.cloneDeep(design);
    design.type = design.type || "line";
    design.layers = design.layers || [{}];
    for (layerId = i = 0, ref = design.layers.length; 0 <= ref ? i < ref : i > ref; layerId = 0 <= ref ? ++i : --i) {
      layer = design.layers[layerId];
      layer.xExpr = this.exprBuilder.cleanExpr(layer.xExpr, layer.table);
      layer.yExpr = this.exprBuilder.cleanExpr(layer.yExpr, layer.table);
      layer.colorExpr = this.exprBuilder.cleanExpr(layer.colorExpr, layer.table);
      if (!compiler.canLayerUseXExpr(design, layerId) && layer.xExpr) {
        delete layer.xExpr;
      }
      if (compiler.doesLayerNeedGrouping(design, layerId) && layer.yExpr) {
        aggrs = this.exprBuilder.getAggrs(layer.yExpr);
        aggrs = _.filter(aggrs, function(aggr) {
          return aggr.id !== "last";
        });
        if (layer.yAggr && (ref1 = layer.yAggr, indexOf.call(_.pluck(aggrs, "id"), ref1) < 0)) {
          delete layer.yAggr;
        }
        if (!layer.yAggr) {
          layer.yAggr = aggrs[0].id;
        }
      } else {
        delete layer.yAggr;
      }
      layer.filter = this.exprBuilder.cleanExpr(layer.filter, layer.table);
    }
    return design;
  };

  LayeredChart.prototype.validateDesign = function(design) {
    var error, i, layer, len, ref, xExprTypes;
    xExprTypes = _.uniq(_.map(design.layers, (function(_this) {
      return function(l) {
        return _this.exprBuilder.getExprType(l.xExpr);
      };
    })(this)));
    if (xExprTypes.length > 1) {
      return "All x axes must be of same type";
    }
    ref = design.layers;
    for (i = 0, len = ref.length; i < len; i++) {
      layer = ref[i];
      if (!layer.table) {
        return "Missing data source";
      }
      if (!layer.yExpr) {
        return "Missing Axis";
      }
      error = null;
      error = error || this.exprBuilder.validateExpr(layer.xExpr);
      error = error || this.exprBuilder.validateExpr(layer.yExpr);
      error = error || this.exprBuilder.validateExpr(layer.colorExpr);
      error = error || this.exprBuilder.validateExpr(layer.filter);
    }
    return error;
  };

  LayeredChart.prototype.createDesignerElement = function(options) {
    var props;
    props = {
      schema: this.schema,
      design: this.cleanDesign(options.design),
      onDesignChange: (function(_this) {
        return function(design) {
          design = _this.cleanDesign(design);
          return options.onDesignChange(design);
        };
      })(this)
    };
    return React.createElement(LayeredChartDesignerComponent, props);
  };

  LayeredChart.prototype.createQueries = function(design, filters) {
    var compiler;
    compiler = new LayeredChartCompiler({
      schema: this.schema
    });
    return compiler.getQueries(design, filters);
  };

  LayeredChart.prototype.createViewElement = function(options) {
    var props;
    props = {
      schema: this.schema,
      design: this.cleanDesign(options.design),
      data: options.data,
      width: options.width,
      height: options.height,
      scope: options.scope,
      onScopeChange: options.onScopeChange
    };
    return React.createElement(LayeredChartViewComponent, props);
  };

  LayeredChart.prototype.createDropdownItems = function(design, dataSource, filters) {
    var save;
    save = (function(_this) {
      return function() {
        var queries;
        design = _this.cleanDesign(design);
        queries = _this.createQueries(design, filters);
        return dataSource.performQueries(queries, function(err, data) {
          if (err) {
            return alert("Unable to load data");
          } else {
            return LayeredChartSvgFileSaver.save(design, data, _this.schema);
          }
        });
      };
    })(this);
    return [
      {
        label: "Save Image",
        icon: "camera",
        onClick: save
      }
    ];
  };

  LayeredChart.prototype.createDataTable = function(design, data) {
    var headers, i, len, r, ref, row, table;
    headers = [];
    if (design.layers[0].xExpr) {
      headers.push(this.exprBuilder.summarizeExpr(design.layers[0].xExpr));
    }
    if (design.layers[0].colorExpr) {
      headers.push(this.exprBuilder.summarizeExpr(design.layers[0].colorExpr));
    }
    if (design.layers[0].yExpr) {
      headers.push(this.exprBuilder.summarizeAggrExpr(design.layers[0].yExpr, design.layers[0].yAggr));
    }
    table = [headers];
    ref = data.layer0;
    for (i = 0, len = ref.length; i < len; i++) {
      row = ref[i];
      r = [];
      if (design.layers[0].xExpr) {
        r.push(this.exprBuilder.stringifyExprLiteral(design.layers[0].xExpr, row.x));
      }
      if (design.layers[0].colorExpr) {
        r.push(this.exprBuilder.stringifyExprLiteral(design.layers[0].colorExpr, row.color));
      }
      if (design.layers[0].yExpr) {
        r.push(this.exprBuilder.stringifyExprLiteral(design.layers[0].yExpr, row.y));
      }
      table.push(r);
    }
    return table;
  };

  return LayeredChart;

})(Chart);
