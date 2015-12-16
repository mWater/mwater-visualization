var AxisBuilder, Chart, ExprCleaner, ExprCompiler, H, ImageMosaicChart, ImageMosaicChartDesignerComponent, ImageMosaicChartViewComponent, React, _, injectTableAlias,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

injectTableAlias = require('mwater-expressions').injectTableAlias;

Chart = require('./Chart');

ExprCleaner = require('mwater-expressions').ExprCleaner;

ExprCompiler = require('mwater-expressions').ExprCompiler;

AxisBuilder = require('./../../axes/AxisBuilder');

ImageMosaicChartDesignerComponent = require('./ImageMosaicChartDesignerComponent');

ImageMosaicChartViewComponent = require('./ImageMosaicChartViewComponent');


/*
Design is:
  
  table: table to use for data source
  titleText: title text
  imageAxis: image axis to use
  filter: optional logical expression to filter by
 */

module.exports = ImageMosaicChart = (function(superClass) {
  extend(ImageMosaicChart, superClass);

  function ImageMosaicChart(options) {
    this.schema = options.schema;
    this.dataSource = options.dataSource;
    this.exprCleaner = new ExprCleaner(this.schema);
    this.axisBuilder = new AxisBuilder({
      schema: this.schema
    });
  }

  ImageMosaicChart.prototype.cleanDesign = function(design) {
    design = _.cloneDeep(design);
    design.version = design.version || 1;
    design.imageAxis = this.axisBuilder.cleanAxis({
      axis: design.imageAxis,
      table: design.table,
      aggrNeed: "none",
      types: ["image", "imagelist"]
    });
    design.filter = this.exprCleaner.cleanExpr(design.filter, {
      table: design.table,
      types: ["boolean"]
    });
    return design;
  };

  ImageMosaicChart.prototype.validateDesign = function(design) {
    var error;
    if (!design.table) {
      return "Missing data source";
    }
    error = null;
    if (!design.imageAxis) {
      error = error || "Missing image";
    }
    error = error || this.axisBuilder.validateAxis({
      axis: design.imageAxis
    });
    return error;
  };

  ImageMosaicChart.prototype.isEmpty = function(design) {
    return !design.imageAxis;
  };

  ImageMosaicChart.prototype.createDesignerElement = function(options) {
    var props;
    props = {
      schema: this.schema,
      design: this.cleanDesign(options.design),
      dataSource: this.dataSource,
      onDesignChange: (function(_this) {
        return function(design) {
          design = _this.cleanDesign(design);
          return options.onDesignChange(design);
        };
      })(this)
    };
    return React.createElement(ImageMosaicChartDesignerComponent, props);
  };

  ImageMosaicChart.prototype.createQueries = function(design, filters) {
    var exprCompiler, imageExpr, query, whereClauses;
    exprCompiler = new ExprCompiler(this.schema);
    query = {
      type: "query",
      selects: [],
      from: exprCompiler.compileTable(design.table, "main"),
      limit: 500
    };
    imageExpr = this.axisBuilder.compileAxis({
      axis: design.imageAxis,
      tableAlias: "main"
    });
    query.selects.push({
      type: "select",
      expr: imageExpr,
      alias: "image"
    });
    filters = _.where(filters || [], {
      table: design.table
    });
    whereClauses = _.map(filters, function(f) {
      return injectTableAlias(f.jsonql, "main");
    });
    if (design.filter) {
      whereClauses.push(exprCompiler.compileExpr({
        expr: design.filter,
        tableAlias: "main"
      }));
    }
    whereClauses.push({
      type: "op",
      op: "is not null",
      exprs: [imageExpr]
    });
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
    return {
      main: query
    };
  };

  ImageMosaicChart.prototype.createViewElement = function(options) {
    var props;
    props = {
      schema: this.schema,
      design: this.cleanDesign(options.design),
      data: options.data,
      dataSource: this.dataSource,
      width: options.width,
      height: options.height,
      standardWidth: options.standardWidth,
      scope: options.scope,
      onScopeChange: options.onScopeChange
    };
    return React.createElement(ImageMosaicChartViewComponent, props);
  };

  ImageMosaicChart.prototype.createDataTable = function(design, data) {
    return ImageMosaicChart.__super__.createDataTable.apply(this, arguments);
  };

  return ImageMosaicChart;

})(Chart);
