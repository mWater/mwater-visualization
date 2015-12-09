var AxisBuilder, Chart, ExprCleaner, H, LayeredChart, LayeredChartCompiler, LayeredChartDesignerComponent, LayeredChartSvgFileSaver, LayeredChartUtils, LayeredChartViewComponent, React, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

Chart = require('./Chart');

LayeredChartCompiler = require('./LayeredChartCompiler');

ExprCleaner = require('mwater-expressions').ExprCleaner;

AxisBuilder = require('./../../axes/AxisBuilder');

LayeredChartDesignerComponent = require('./LayeredChartDesignerComponent');

LayeredChartViewComponent = require('./LayeredChartViewComponent');

LayeredChartSvgFileSaver = require('./LayeredChartSvgFileSaver');

LayeredChartUtils = require('./LayeredChartUtils');

module.exports = LayeredChart = (function(superClass) {
  extend(LayeredChart, superClass);

  function LayeredChart(options) {
    this.schema = options.schema;
    this.dataSource = options.dataSource;
    this.exprCleaner = new ExprCleaner(this.schema);
    this.axisBuilder = new AxisBuilder({
      schema: this.schema
    });
  }

  LayeredChart.prototype.cleanDesign = function(design) {
    var aggrNeed, axis, axisKey, compiler, countExpr, i, layer, layerId, ref, ref1, ref2;
    compiler = new LayeredChartCompiler({
      schema: this.schema
    });
    design = _.cloneDeep(design);
    design.version = design.version || 1;
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
        layer.axes[axisKey] = this.axisBuilder.cleanAxis({
          axis: axis,
          table: layer.table,
          aggrNeed: aggrNeed,
          types: LayeredChartUtils.getAxisTypes(design, layer, axisKey)
        });
      }
      if (!compiler.canLayerUseXExpr(design, layerId) && layer.axes.x) {
        delete layer.axes.x;
      }
      if (!layer.axes.x || ((ref2 = this.axisBuilder.getAxisType(layer.axes.x)) !== 'date' && ref2 !== 'decimal' && ref2 !== 'integer')) {
        delete layer.cumulative;
      }
      if (!layer.axes.y && (layer.axes.x || layer.axes.color)) {
        countExpr = {
          type: "scalar",
          table: layer.table,
          expr: {
            type: "count",
            table: layer.table
          },
          joins: []
        };
        layer.axes.y = {
          expr: countExpr,
          aggr: "count",
          xform: null
        };
      }
      layer.filter = this.exprCleaner.cleanExpr(layer.filter, {
        table: layer.table
      });
    }
    return design;
  };

  LayeredChart.prototype.validateDesign = function(design) {
    var compiler, error, i, layer, layerId, ref, xAxisTypes;
    compiler = new LayeredChartCompiler({
      schema: this.schema
    });
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
    for (layerId = i = 0, ref = design.layers.length; 0 <= ref ? i < ref : i > ref; layerId = 0 <= ref ? ++i : --i) {
      layer = design.layers[layerId];
      if (!layer.table) {
        return "Missing data source";
      }
      if (!layer.axes.y) {
        return "Missing Y Axis";
      }
      if (!layer.axes.x && compiler.isXAxisRequired(design, layerId)) {
        return "Missing X Axis";
      }
      if (!layer.axes.color && compiler.isColorAxisRequired(design, layerId)) {
        return "Missing Color Axis";
      }
      error = null;
      error = error || this.axisBuilder.validateAxis({
        axis: layer.axes.x
      });
      error = error || this.axisBuilder.validateAxis({
        axis: layer.axes.y
      });
      error = error || this.axisBuilder.validateAxis({
        axis: layer.axes.color
      });
    }
    return error;
  };

  LayeredChart.prototype.isEmpty = function(design) {
    return !design.layers || !design.layers[0] || !design.layers[0].table;
  };

  LayeredChart.prototype.createDesignerElement = function(options) {
    var props;
    props = {
      schema: this.schema,
      dataSource: this.dataSource,
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
      standardWidth: options.standardWidth,
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
    if (this.validateDesign(this.cleanDesign(design))) {
      return [];
    }
    return [
      {
        label: "Save Image",
        icon: "camera",
        onClick: save
      }
    ];
  };

  LayeredChart.prototype.createDataTable = function(design, data, locale) {
    var headers, i, len, r, ref, row, table;
    headers = [];
    if (design.layers[0].axes.x) {
      headers.push(this.axisBuilder.summarizeAxis(design.layers[0].axes.x, locale));
    }
    if (design.layers[0].axes.color) {
      headers.push(this.axisBuilder.summarizeAxis(design.layers[0].axes.color, locale));
    }
    if (design.layers[0].axes.y) {
      headers.push(this.axisBuilder.summarizeAxis(design.layers[0].axes.y, locale));
    }
    table = [headers];
    ref = data.layer0;
    for (i = 0, len = ref.length; i < len; i++) {
      row = ref[i];
      r = [];
      if (design.layers[0].axes.x) {
        r.push(this.axisBuilder.formatValue(design.layers[0].axes.x, row.x, locale));
      }
      if (design.layers[0].axes.color) {
        r.push(this.axisBuilder.formatValue(design.layers[0].axes.color, row.color, locale));
      }
      if (design.layers[0].axes.y) {
        r.push(this.axisBuilder.formatValue(design.layers[0].axes.y, row.y, locale));
      }
      table.push(r);
    }
    return table;
  };

  return LayeredChart;

})(Chart);
