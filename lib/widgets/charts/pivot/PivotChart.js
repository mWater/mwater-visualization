"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var AxisBuilder, Chart, ExprCleaner, PivotChart, PivotChartLayoutBuilder, PivotChartQueryBuilder, PivotChartUtils, R, React, TextWidget, WeakCache, _, async, cleanDesignCache, original, produce, uuid;

_ = require('lodash');
React = require('react');
R = React.createElement;
async = require('async');
uuid = require('uuid');
produce = require('immer')["default"];
original = require('immer').original;
WeakCache = require('mwater-expressions').WeakCache;
Chart = require('../Chart');
ExprCleaner = require('mwater-expressions').ExprCleaner;
AxisBuilder = require('../../../axes/AxisBuilder');
TextWidget = require('../../text/TextWidget');
PivotChartUtils = require('./PivotChartUtils');
PivotChartQueryBuilder = require('./PivotChartQueryBuilder');
PivotChartLayoutBuilder = require('./PivotChartLayoutBuilder'); // Store true as a weakly cached value if a design is already clean

cleanDesignCache = new WeakCache(); // See README.md for the design

module.exports = PivotChart = /*#__PURE__*/function (_Chart) {
  (0, _inherits2["default"])(PivotChart, _Chart);

  var _super = _createSuper(PivotChart);

  function PivotChart() {
    (0, _classCallCheck2["default"])(this, PivotChart);
    return _super.apply(this, arguments);
  }

  (0, _createClass2["default"])(PivotChart, [{
    key: "cleanDesign",
    value: function cleanDesign(design, schema) {
      var axisBuilder, cleanedDesign, exprCleaner;
      exprCleaner = new ExprCleaner(schema);
      axisBuilder = new AxisBuilder({
        schema: schema
      }); // Use weak caching to improve performance of cleaning complex pivot charts

      if (cleanDesignCache.get([design, schema], []) === true) {
        return design;
      }

      cleanedDesign = produce(design, function (draft) {
        var allIntersectionIds, cleanSegment, columnPath, i, intersection, intersectionId, j, k, l, len, len1, len2, len3, len4, len5, m, n, ref, ref1, ref2, ref3, ref4, ref5, ref6, rowPath, segment; // Fill in defaults

        draft.version = design.version || 1;
        draft.rows = design.rows || [];
        draft.columns = design.columns || [];
        draft.intersections = design.intersections || {};
        draft.header = design.header || {
          style: "footer",
          items: []
        };
        draft.footer = design.footer || {
          style: "footer",
          items: []
        };

        if (design.table) {
          // Add default row and column
          if (draft.rows.length === 0) {
            draft.rows.push({
              id: uuid()
            });
          }

          if (draft.columns.length === 0) {
            draft.columns.push({
              id: uuid()
            });
          } // Cleans a single segment


          cleanSegment = function cleanSegment(segment) {
            if (segment.valueAxis) {
              segment.valueAxis = axisBuilder.cleanAxis({
                axis: segment.valueAxis ? original(segment.valueAxis) : null,
                table: design.table,
                aggrNeed: "none",
                types: ["enum", "text", "boolean", "date"]
              });
            } // Remove valueLabelBold if no valueAxis


            if (!segment.valueAxis) {
              delete segment.valueLabelBold;
            }

            if (segment.filter) {
              segment.filter = exprCleaner.cleanExpr(segment.filter ? original(segment.filter) : null, {
                table: design.table,
                types: ["boolean"]
              });
            }

            if (segment.orderExpr) {
              return segment.orderExpr = exprCleaner.cleanExpr(segment.orderExpr ? original(segment.orderExpr) : null, {
                table: design.table,
                aggrStatuses: ["aggregate"],
                types: ["enum", "text", "boolean", "date", "datetime", "number"]
              });
            }
          };

          ref = PivotChartUtils.getAllSegments(draft.rows); // Clean all segments

          for (i = 0, len = ref.length; i < len; i++) {
            segment = ref[i];
            cleanSegment(segment);
          }

          ref1 = PivotChartUtils.getAllSegments(draft.columns);

          for (j = 0, len1 = ref1.length; j < len1; j++) {
            segment = ref1[j];
            cleanSegment(segment);
          }

          ref2 = draft.intersections; // Clean all intersections

          for (intersectionId in ref2) {
            intersection = ref2[intersectionId];

            if (intersection.valueAxis) {
              intersection.valueAxis = axisBuilder.cleanAxis({
                axis: intersection.valueAxis ? original(intersection.valueAxis) : null,
                table: design.table,
                aggrNeed: "required",
                types: ["enum", "text", "boolean", "date", "number"]
              });
            }

            if (intersection.backgroundColorAxis) {
              intersection.backgroundColorAxis = axisBuilder.cleanAxis({
                axis: intersection.backgroundColorAxis ? original(intersection.backgroundColorAxis) : null,
                table: design.table,
                aggrNeed: "required",
                types: ["enum", "text", "boolean", "date"]
              });

              if (intersection.backgroundColorOpacity == null) {
                intersection.backgroundColorOpacity = 1;
              }
            }

            if (intersection.filter) {
              intersection.filter = exprCleaner.cleanExpr(intersection.filter ? original(intersection.filter) : null, {
                table: design.table,
                types: ["boolean"]
              });
            }
          } // Get all intersection ids


          allIntersectionIds = [];
          ref3 = PivotChartUtils.getSegmentPaths(design.rows || []);

          for (k = 0, len2 = ref3.length; k < len2; k++) {
            rowPath = ref3[k];
            ref4 = PivotChartUtils.getSegmentPaths(design.columns || []);

            for (l = 0, len3 = ref4.length; l < len3; l++) {
              columnPath = ref4[l];
              allIntersectionIds.push(PivotChartUtils.getIntersectionId(rowPath, columnPath));
            }
          }

          ref5 = _.difference(allIntersectionIds, _.keys(design.intersections || {})); // Add missing intersections

          for (m = 0, len4 = ref5.length; m < len4; m++) {
            intersectionId = ref5[m];
            draft.intersections[intersectionId] = {};
          }

          ref6 = _.difference(_.keys(design.intersections || {}), allIntersectionIds); // Remove extra intersections

          for (n = 0, len5 = ref6.length; n < len5; n++) {
            intersectionId = ref6[n];
            delete draft.intersections[intersectionId];
          } // Clean filter


          draft.filter = exprCleaner.cleanExpr(design.filter, {
            table: design.table,
            types: ['boolean']
          });
        }
      }); // Cache if unchanged (and therefore clean)

      if (design === cleanedDesign) {
        cleanDesignCache.set([design, schema], [], true);
      }

      return cleanedDesign;
    }
  }, {
    key: "validateDesign",
    value: function validateDesign(design, schema) {
      var axisBuilder, error, i, intersection, intersectionId, j, len, len1, ref, ref1, ref2, segment;
      axisBuilder = new AxisBuilder({
        schema: schema
      }); // Check that has table

      if (!design.table) {
        return "Missing data source";
      } // Check that has rows


      if (design.rows.length === 0) {
        return "Missing rows";
      } // Check that has columns


      if (design.columns.length === 0) {
        return "Missing columns";
      }

      error = null;
      ref = PivotChartUtils.getAllSegments(design.rows); // Validate axes

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
    } // Determine if widget is auto-height, which means that a vertical height is not required.

  }, {
    key: "isAutoHeight",
    value: function isAutoHeight() {
      return false;
    }
  }, {
    key: "isEmpty",
    value: function isEmpty(design) {
      return !design.table || design.rows.length === 0 || design.columns.length === 0;
    } // True if designer should have a preview pane to the left

  }, {
    key: "hasDesignerPreview",
    value: function hasDesignerPreview() {
      return false;
    } // Label for the edit gear dropdown

  }, {
    key: "getEditLabel",
    value: function getEditLabel() {
      return "Configure Table";
    } // Creates a design element with specified options
    // options include:
    //   schema: schema to use
    //   dataSource: dataSource to use
    //   design: design 
    //   onDesignChange: function
    //   filters: array of filters

  }, {
    key: "createDesignerElement",
    value: function createDesignerElement(options) {
      var _this = this;

      var PivotChartDesignerComponent, props; // Require here to prevent server require problems

      PivotChartDesignerComponent = require('./PivotChartDesignerComponent');
      props = {
        schema: options.schema,
        dataSource: options.dataSource,
        design: this.cleanDesign(options.design, options.schema),
        filters: options.filter,
        onDesignChange: function onDesignChange(design) {
          // Clean design
          design = _this.cleanDesign(design, options.schema);
          return options.onDesignChange(design);
        }
      };
      return React.createElement(PivotChartDesignerComponent, props);
    } // Get data for the chart asynchronously 
    // design: design of the chart
    // schema: schema to use
    // dataSource: data source to get data from
    // filters: array of { table: table id, jsonql: jsonql condition with {alias} for tableAlias }
    // callback: (error, data)

  }, {
    key: "getData",
    value: function getData(design, schema, dataSource, filters, callback) {
      var queries, queryBuilder;
      queryBuilder = new PivotChartQueryBuilder({
        schema: schema
      });
      queries = queryBuilder.createQueries(design, filters); // Run queries in parallel

      return async.map(_.pairs(queries), function (item, cb) {
        return dataSource.performQuery(item[1], function (err, rows) {
          return cb(err, [item[0], rows]);
        });
      }, function (err, items) {
        var data, textWidget;

        if (err) {
          return callback(err);
        }

        data = _.object(items); // Add header and footer data

        textWidget = new TextWidget();
        return textWidget.getData(design.header, schema, dataSource, filters, function (error, headerData) {
          if (error) {
            return callback(error);
          }

          data.header = headerData;
          return textWidget.getData(design.footer, schema, dataSource, filters, function (error, footerData) {
            if (error) {
              return callback(error);
            }

            data.footer = footerData;
            return callback(null, data);
          });
        });
      });
    } // Create a view element for the chart
    // Options include:
    //   schema: schema to use
    //   dataSource: dataSource to use
    //   design: design of the chart
    //   onDesignChange: when design changes
    //   data: results from queries
    //   width, height: size of the chart view
    //   scope: current scope of the view element
    //   onScopeChange: called when scope changes with new scope
    //   filters: array of filters

  }, {
    key: "createViewElement",
    value: function createViewElement(options) {
      var PivotChartViewComponent, props;
      PivotChartViewComponent = require('./PivotChartViewComponent'); // Create chart

      props = {
        schema: options.schema,
        dataSource: options.dataSource,
        design: this.cleanDesign(options.design, options.schema),
        onDesignChange: options.onDesignChange,
        data: options.data,
        width: options.width,
        height: options.height,
        scope: options.scope,
        onScopeChange: options.onScopeChange,
        filters: options.filters
      };
      return React.createElement(PivotChartViewComponent, props);
    }
  }, {
    key: "createDropdownItems",
    value: function createDropdownItems(design, schema, widgetDataSource, filters) {
      return [];
    }
  }, {
    key: "createDataTable",
    value: function createDataTable(design, schema, dataSource, data, locale) {
      var layout; // Create layout

      layout = new PivotChartLayoutBuilder({
        schema: schema
      }).buildLayout(design, data, locale);
      return _.map(layout.rows, function (row) {
        return _.map(row.cells, function (cell) {
          return cell.text;
        });
      });
    } // Get a list of table ids that can be filtered on

  }, {
    key: "getFilterableTables",
    value: function getFilterableTables(design, schema) {
      var filterableTables, textWidget;
      filterableTables = design.table ? [design.table] : []; // Get filterable tables from header and footer

      textWidget = new TextWidget();
      filterableTables = _.union(filterableTables, textWidget.getFilterableTables(design.header, schema));
      filterableTables = _.union(filterableTables, textWidget.getFilterableTables(design.footer, schema));
      return filterableTables;
    } // Get the chart placeholder icon. fa-XYZ or glyphicon-XYZ

  }, {
    key: "getPlaceholderIcon",
    value: function getPlaceholderIcon() {
      return "fa-magic";
    }
  }]);
  return PivotChart;
}(Chart);