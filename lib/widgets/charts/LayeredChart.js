var AxisBuilder, Chart, ExpressionBuilder, H, LayeredChart, LayeredChartCompiler, LayeredChartDesignerComponent, LayeredChartSvgFileSaver, LayeredChartViewComponent, React, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

Chart = require('./Chart');

LayeredChartCompiler = require('./LayeredChartCompiler');

ExpressionBuilder = require('./../../expressions/ExpressionBuilder');

AxisBuilder = require('./../../expressions/axes/AxisBuilder');

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
  type: bar/line/spline/scatter/area/pie/donut (overrides main one)
  name: label for layer (optional)
  axes: axes (see below)
  stacked: true to stack
  filter: optional logical expression to filter by
  color: color of layer (e.g. #FF8800)

axes:
  x: x axis
  y: y axis
  color: color axis (to split into series based on a color)

axis: 
  expr: expression of axis
  aggr: aggregation for axis
 */

module.exports = LayeredChart = (function(superClass) {
  extend(LayeredChart, superClass);

  function LayeredChart(options) {
    this.schema = options.schema;
    this.exprBuilder = new ExpressionBuilder(this.schema);
    this.axisBuilder = new AxisBuilder({
      schema: this.schema
    });
  }

  LayeredChart.prototype.cleanDesign = function(design) {
    var aggrNeed, axis, axisKey, compiler, i, layer, layerId, ref, ref1;
    compiler = new LayeredChartCompiler({
      schema: this.schema
    });
    design = _.cloneDeep(design);
    design.type = design.type || "line";
    design.layers = design.layers || [{}];
    for (layerId = i = 0, ref = design.layers.length; 0 <= ref ? i < ref : i > ref; layerId = 0 <= ref ? ++i : --i) {
      layer = design.layers[layerId];
      layer.axes = layer.axes || {};
      ref1 = layer.axes;
      for (axisKey in ref1) {
        axis = ref1[axisKey];
        if (axisKey === "y" && compiler.doesLayerNeedGrouping(design, layerId)) {
          aggrNeed = "required";
        } else {
          aggrNeed = "none";
        }
        layer.axes[axisKey] = this.axisBuilder.cleanAxis(axis, layer.table, aggrNeed);
      }
      if (!compiler.canLayerUseXExpr(design, layerId) && layer.axes.x) {
        delete layer.axes.x;
      }
      layer.filter = this.exprBuilder.cleanExpr(layer.filter, layer.table);
    }
    return design;
  };

  LayeredChart.prototype.validateDesign = function(design) {
    var error, i, layer, len, ref, xAxisTypes;
    xAxisTypes = _.uniq(_.map(design.layers, (function(_this) {
      return function(l) {
        _this.axisBuilder = new AxisBuilder({
          schema: _this.schema
        });
        return _this.axisBuilder.getAxisType(l.axes.x);
      };
    })(this)));
    if (xAxisTypes.length > 1) {
      return "All x axes must be of same type";
    }
    ref = design.layers;
    for (i = 0, len = ref.length; i < len; i++) {
      layer = ref[i];
      this.axisBuilder = new AxisBuilder({
        schema: this.schema
      });
      if (!layer.table) {
        return "Missing data source";
      }
      if (!layer.axes.y) {
        return "Missing Axis";
      }
      error = null;
      error = error || this.axisBuilder.validateAxis(layer.axes.x);
      error = error || this.axisBuilder.validateAxis(layer.axes.y);
      error = error || this.axisBuilder.validateAxis(layer.axes.color);
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
    return compiler.createQueries(design, filters);
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
    if (design.layers[0].axes.x) {
      headers.push(this.axisBuilder.summarizeAxis(design.layers[0].axes.x));
    }
    if (design.layers[0].axes.color) {
      headers.push(this.axisBuilder.summarizeAxis(design.layers[0].axes.color));
    }
    if (design.layers[0].axes.y) {
      headers.push(this.axisBuilder.summarizeAxis(design.layers[0].axes.y));
    }
    table = [headers];
    ref = data.layer0;
    for (i = 0, len = ref.length; i < len; i++) {
      row = ref[i];
      r = [];
      if (design.layers[0].axes.x) {
        r.push(this.axisBuilder.stringifyLiteral(design.layers[0].axes.x, row.x));
      }
      if (design.layers[0].axes.color) {
        r.push(this.axisBuilder.stringifyLiteral(design.layers[0].axes.color, row.color));
      }
      if (design.layers[0].axes.y) {
        r.push(this.axisBuilder.stringifyLiteral(design.layers[0].axes.y, row.y));
      }
      table.push(r);
    }
    return table;
  };

  return LayeredChart;

})(Chart);
