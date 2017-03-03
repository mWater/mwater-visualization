var AxisBuilder, Chart, ExprCleaner, ExprCompiler, H, ImageMosaicChart, React, _, injectTableAlias,
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


/*
Design is:
  
  table: table to use for data source
  titleText: title text
  imageAxis: image axis to use
  filter: optional logical expression to filter by
 */

module.exports = ImageMosaicChart = (function(superClass) {
  extend(ImageMosaicChart, superClass);

  function ImageMosaicChart() {
    return ImageMosaicChart.__super__.constructor.apply(this, arguments);
  }

  ImageMosaicChart.prototype.cleanDesign = function(design, schema) {
    var axisBuilder, exprCleaner;
    exprCleaner = new ExprCleaner(schema);
    axisBuilder = new AxisBuilder({
      schema: schema
    });
    design = _.cloneDeep(design);
    design.version = design.version || 1;
    design.imageAxis = axisBuilder.cleanAxis({
      axis: design.imageAxis,
      table: design.table,
      aggrNeed: "none",
      types: ["image", "imagelist"]
    });
    design.filter = exprCleaner.cleanExpr(design.filter, {
      table: design.table,
      types: ["boolean"]
    });
    return design;
  };

  ImageMosaicChart.prototype.validateDesign = function(design, schema) {
    var axisBuilder, error;
    axisBuilder = new AxisBuilder({
      schema: schema
    });
    if (!design.table) {
      return "Missing data source";
    }
    error = null;
    if (!design.imageAxis) {
      error = error || "Missing image";
    }
    error = error || axisBuilder.validateAxis({
      axis: design.imageAxis
    });
    return error;
  };

  ImageMosaicChart.prototype.isEmpty = function(design) {
    return !design.imageAxis;
  };

  ImageMosaicChart.prototype.createDesignerElement = function(options) {
    var ImageMosaicChartDesignerComponent, props;
    ImageMosaicChartDesignerComponent = require('./ImageMosaicChartDesignerComponent');
    props = {
      schema: options.schema,
      design: this.cleanDesign(options.design, options.schema),
      dataSource: options.dataSource,
      onDesignChange: (function(_this) {
        return function(design) {
          design = _this.cleanDesign(design, options.schema);
          return options.onDesignChange(design);
        };
      })(this)
    };
    return React.createElement(ImageMosaicChartDesignerComponent, props);
  };

  ImageMosaicChart.prototype.getData = function(design, schema, dataSource, filters, callback) {
    var axisBuilder, exprCompiler, imageExpr, query, whereClauses;
    exprCompiler = new ExprCompiler(schema);
    axisBuilder = new AxisBuilder({
      schema: schema
    });
    query = {
      type: "query",
      selects: [],
      from: exprCompiler.compileTable(design.table, "main"),
      limit: 500
    };
    imageExpr = axisBuilder.compileAxis({
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
    return dataSource.performQuery(query, callback);
  };

  ImageMosaicChart.prototype.createViewElement = function(options) {
    var ImageMosaicChartViewComponent, props;
    ImageMosaicChartViewComponent = require('./ImageMosaicChartViewComponent');
    props = {
      schema: options.schema,
      design: this.cleanDesign(options.design, options.schema),
      data: options.data,
      dataSource: options.dataSource,
      width: options.width,
      height: options.height,
      standardWidth: options.standardWidth,
      scope: options.scope,
      onScopeChange: options.onScopeChange
    };
    return React.createElement(ImageMosaicChartViewComponent, props);
  };

  ImageMosaicChart.prototype.createDataTable = function(design, schema, dataSource, data) {
    alert("Not available for Image Mosaics");
    return null;
  };

  ImageMosaicChart.prototype.getFilterableTables = function(design, schema) {
    return _.compact([design.table]);
  };

  return ImageMosaicChart;

})(Chart);
