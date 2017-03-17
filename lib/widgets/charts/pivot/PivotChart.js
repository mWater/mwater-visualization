var AxisBuilder, Chart, ExprCleaner, H, PivotChart, PivotChartDesignerComponent, PivotChartLayoutBuilder, PivotChartQueryBuilder, PivotChartUtils, PivotChartViewComponent, React, TextWidget, _, async, uuid,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

async = require('async');

uuid = require('uuid');

Chart = require('../Chart');

ExprCleaner = require('mwater-expressions').ExprCleaner;

AxisBuilder = require('../../../axes/AxisBuilder');

TextWidget = require('../../text/TextWidget');

PivotChartUtils = require('./PivotChartUtils');

PivotChartDesignerComponent = require('./PivotChartDesignerComponent');

PivotChartViewComponent = require('./PivotChartViewComponent');

PivotChartQueryBuilder = require('./PivotChartQueryBuilder');

PivotChartLayoutBuilder = require('./PivotChartLayoutBuilder');

module.exports = PivotChart = (function(superClass) {
  extend(PivotChart, superClass);

  function PivotChart() {
    return PivotChart.__super__.constructor.apply(this, arguments);
  }

  PivotChart.prototype.cleanDesign = function(design, schema) {
    var axisBuilder, columnPath, exprCleaner, i, intersection, intersectionId, intersections, j, k, l, len, len1, len2, len3, ref, ref1, ref2, ref3, ref4, rowPath, segment;
    exprCleaner = new ExprCleaner(schema);
    axisBuilder = new AxisBuilder({
      schema: schema
    });
    design = _.cloneDeep(design);
    design.version = design.version || 1;
    design.rows = design.rows || [];
    design.columns = design.columns || [];
    design.intersections = design.intersections || {};
    design.header = design.header || {
      style: "footer",
      items: []
    };
    design.footer = design.footer || {
      style: "footer",
      items: []
    };
    if (design.table) {
      if (design.rows.length === 0) {
        design.rows.push({
          id: uuid()
        });
      }
      if (design.columns.length === 0) {
        design.columns.push({
          id: uuid()
        });
      }
      ref = PivotChartUtils.getAllSegments(design.rows);
      for (i = 0, len = ref.length; i < len; i++) {
        segment = ref[i];
        if (segment.valueAxis) {
          segment.valueAxis = axisBuilder.cleanAxis({
            axis: segment.valueAxis,
            table: design.table,
            aggrNeed: "none",
            types: ["enum", "text", "boolean", "date"]
          });
        }
      }
      ref1 = PivotChartUtils.getAllSegments(design.columns);
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        segment = ref1[j];
        if (segment.valueAxis) {
          segment.valueAxis = axisBuilder.cleanAxis({
            axis: segment.valueAxis,
            table: design.table,
            aggrNeed: "none",
            types: ["enum", "text", "boolean", "date"]
          });
        }
      }
      ref2 = design.intersections;
      for (intersectionId in ref2) {
        intersection = ref2[intersectionId];
        if (intersection.valueAxis) {
          intersection.valueAxis = axisBuilder.cleanAxis({
            axis: intersection.valueAxis,
            table: design.table,
            aggrNeed: "required",
            types: ["enum", "text", "boolean", "date", "number"]
          });
        }
      }
      intersections = {};
      ref3 = PivotChartUtils.getSegmentPaths(design.rows);
      for (k = 0, len2 = ref3.length; k < len2; k++) {
        rowPath = ref3[k];
        ref4 = PivotChartUtils.getSegmentPaths(design.columns);
        for (l = 0, len3 = ref4.length; l < len3; l++) {
          columnPath = ref4[l];
          intersectionId = (_.pluck(rowPath, "id").join(",")) + ":" + (_.pluck(columnPath, "id").join(","));
          intersections[intersectionId] = design.intersections[intersectionId] || {
            valueAxis: {
              expr: {
                type: "op",
                op: "count",
                table: design.table,
                exprs: []
              }
            }
          };
        }
      }
      design.intersections = intersections;
      design.filter = exprCleaner.cleanExpr(design.filter, {
        table: design.table,
        types: ['boolean']
      });
    }
    return design;
  };

  PivotChart.prototype.validateDesign = function(design, schema) {
    var axisBuilder, error, i, intersection, intersectionId, j, len, len1, ref, ref1, ref2, segment;
    axisBuilder = new AxisBuilder({
      schema: schema
    });
    if (!design.table) {
      return "Missing data source";
    }
    if (design.rows.length === 0) {
      return "Missing rows";
    }
    if (design.columns.length === 0) {
      return "Missing columns";
    }
    error = null;
    ref = PivotChartUtils.getAllSegments(design.rows);
    for (i = 0, len = ref.length; i < len; i++) {
      segment = ref[i];
      if (segment.valueAxis) {
        error = error || axisBuilder.validateAxis({
          axis: segment.valueAxis
        });
      }
    }
    ref1 = PivotChartUtils.getAllSegments(design.columns);
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      segment = ref1[j];
      if (segment.valueAxis) {
        error = error || axisBuilder.validateAxis({
          axis: segment.valueAxis
        });
      }
    }
    ref2 = design.intersections;
    for (intersectionId in ref2) {
      intersection = ref2[intersectionId];
      if (intersection.valueAxis) {
        error = error || axisBuilder.validateAxis({
          axis: intersection.valueAxis
        });
      }
    }
    return error;
  };

  PivotChart.prototype.isAutoHeight = function() {
    return false;
  };

  PivotChart.prototype.isEmpty = function(design) {
    return !design.table || design.rows.length === 0 || design.columns.length === 0;
  };

  PivotChart.prototype.hasDesignerPreview = function() {
    return false;
  };

  PivotChart.prototype.createDesignerElement = function(options) {
    var props;
    PivotChartDesignerComponent = require('./PivotChartDesignerComponent');
    props = {
      schema: options.schema,
      dataSource: options.dataSource,
      design: this.cleanDesign(options.design, options.schema),
      onDesignChange: (function(_this) {
        return function(design) {
          design = _this.cleanDesign(design, options.schema);
          return options.onDesignChange(design);
        };
      })(this)
    };
    return React.createElement(PivotChartDesignerComponent, props);
  };

  PivotChart.prototype.getData = function(design, schema, dataSource, filters, callback) {
    var queries, queryBuilder;
    queryBuilder = new PivotChartQueryBuilder({
      schema: schema
    });
    queries = queryBuilder.createQueries(design, filters);
    return async.map(_.pairs(queries), (function(_this) {
      return function(item, cb) {
        return dataSource.performQuery(item[1], function(err, rows) {
          return cb(err, [item[0], rows]);
        });
      };
    })(this), (function(_this) {
      return function(err, items) {
        var data, textWidget;
        if (err) {
          return callback(err);
        }
        data = _.object(items);
        textWidget = new TextWidget();
        return textWidget.getData(design.header, schema, dataSource, filters, function(error, headerData) {
          if (error) {
            return callback(error);
          }
          data.header = headerData;
          return textWidget.getData(design.footer, schema, dataSource, filters, function(error, footerData) {
            if (error) {
              return callback(error);
            }
            data.footer = footerData;
            return callback(null, data);
          });
        });
      };
    })(this));
  };

  PivotChart.prototype.createViewElement = function(options) {
    var props;
    PivotChartViewComponent = require('./PivotChartViewComponent');
    props = {
      schema: options.schema,
      dataSource: options.dataSource,
      design: this.cleanDesign(options.design, options.schema),
      onDesignChange: options.onDesignChange,
      data: options.data,
      width: options.width,
      height: options.height,
      standardWidth: options.standardWidth,
      scope: options.scope,
      onScopeChange: options.onScopeChange
    };
    return React.createElement(PivotChartViewComponent, props);
  };

  PivotChart.prototype.createDropdownItems = function(design, schema, widgetDataSource, filters) {
    return [];
  };

  PivotChart.prototype.createDataTable = function(design, schema, dataSource, data, locale) {
    var layout;
    layout = new PivotChartLayoutBuilder({
      schema: schema
    }).buildLayout(design, data, locale);
    return _.map(layout.rows, function(row) {
      return _.map(row.cells, function(cell) {
        return cell.text;
      });
    });
  };

  PivotChart.prototype.getFilterableTables = function(design, schema) {
    var filterableTables, textWidget;
    filterableTables = design.table ? [design.table] : [];
    textWidget = new TextWidget();
    filterableTables = _.union(filterableTables, textWidget.getFilterableTables(design.header, schema));
    filterableTables = _.union(filterableTables, textWidget.getFilterableTables(design.footer, schema));
    return filterableTables;
  };

  return PivotChart;

})(Chart);
