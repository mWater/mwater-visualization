"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var ExprCleaner, ExprCompiler, ExprUtils, R, React, TextWidget, Widget, _, async, injectTableAlias;

React = require('react');
R = React.createElement;
_ = require('lodash');
async = require('async');
ExprUtils = require('mwater-expressions').ExprUtils;
ExprCompiler = require('mwater-expressions').ExprCompiler;
ExprCleaner = require('mwater-expressions').ExprCleaner;
injectTableAlias = require('mwater-expressions').injectTableAlias;
Widget = require('../Widget');

module.exports = TextWidget = /*#__PURE__*/function (_Widget) {
  (0, _inherits2["default"])(TextWidget, _Widget);

  var _super = _createSuper(TextWidget);

  function TextWidget() {
    (0, _classCallCheck2["default"])(this, TextWidget);
    return _super.apply(this, arguments);
  }

  (0, _createClass2["default"])(TextWidget, [{
    key: "createViewElement",
    // Creates a React element that is a view of the widget 
    // options:
    //  schema: schema to use
    //  dataSource: data source to use
    //  widgetDataSource: Gives data to the widget in a way that allows client-server separation and secure sharing. See definition in WidgetDataSource.
    //  design: widget design
    //  scope: scope of the widget (when the widget self-selects a particular scope)
    //  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
    //  onScopeChange: called with scope of widget
    //  onDesignChange: called with new design. null/undefined for readonly
    //  width: width in pixels on screen
    //  height: height in pixels on screen
    //  singleRowTable: optional table name of table that will be filtered to have a single row present. Widget designer should optionally account for this
    //  namedStrings: Optional lookup of string name to value. Used for {{branding}} and other replacement strings in text widget
    value: function createViewElement(options) {
      var TextWidgetComponent; // Put here so TextWidget can be created on server

      TextWidgetComponent = require('./TextWidgetComponent');
      return R(TextWidgetComponent, {
        schema: options.schema,
        dataSource: options.dataSource,
        widgetDataSource: options.widgetDataSource,
        filters: options.filters,
        design: options.design,
        onDesignChange: options.onDesignChange,
        width: options.width,
        height: options.height,
        singleRowTable: options.singleRowTable,
        namedStrings: options.namedStrings
      });
    } // Get the data that the widget needs. This will be called on the server, typically.
    //   design: design of the chart
    //   schema: schema to use
    //   dataSource: data source to get data from
    //   filters: array of { table: table id, jsonql: jsonql condition with {alias} for tableAlias }
    //   callback: (error, data)

  }, {
    key: "getData",
    value: function getData(design, schema, dataSource, filters, callback) {
      var evalExprItem, exprValues; // Evaluates a single exprItem

      evalExprItem = function evalExprItem(exprItem, cb) {
        var compiledExpr, expr, exprCleaner, exprCompiler, exprType, exprUtils, query, relevantFilters, table, whereClauses;

        if (!exprItem.expr) {
          return cb(null);
        }

        table = exprItem.expr.table; // If table doesn't exist, return null

        if (table && !schema.getTable(table)) {
          return cb(null);
        }

        exprCompiler = new ExprCompiler(schema);
        exprUtils = new ExprUtils(schema); // Clean expression

        exprCleaner = new ExprCleaner(schema);
        expr = exprCleaner.cleanExpr(exprItem.expr, {
          aggrStatuses: ["individual", "literal", "aggregate"]
        }); // Get relevant filters

        if (table) {
          relevantFilters = _.where(filters || [], {
            table: table
          });
          whereClauses = _.map(relevantFilters, function (f) {
            return injectTableAlias(f.jsonql, "main");
          });
        } else {
          whereClauses = [];
        } // In case of "sum where"/"count where", extract where clause to make faster


        if ((expr != null ? expr.op : void 0) === 'sum where') {
          whereClauses.push(exprCompiler.compileExpr({
            expr: expr.exprs[1],
            tableAlias: "main"
          }));
          expr = {
            type: "op",
            table: expr.table,
            op: "sum",
            exprs: [expr.exprs[0]]
          };
        } else if ((expr != null ? expr.op : void 0) === 'count where') {
          whereClauses.push(exprCompiler.compileExpr({
            expr: expr.exprs[0],
            tableAlias: "main"
          }));
          expr = {
            type: "op",
            table: expr.table,
            op: "count",
            exprs: []
          };
        }

        compiledExpr = exprCompiler.compileExpr({
          expr: expr,
          tableAlias: "main"
        });
        exprType = exprUtils.getExprType(expr); // Handle special case of geometry, converting to GeoJSON

        if (exprType === "geometry") {
          // Convert to 4326 (lat/long). Force ::geometry for null
          compiledExpr = {
            type: "op",
            op: "::jsonb",
            exprs: [{
              type: "op",
              op: "ST_AsGeoJSON",
              exprs: [{
                type: "op",
                op: "ST_Transform",
                exprs: [{
                  type: "op",
                  op: "::geometry",
                  exprs: [compiledExpr]
                }, 4326]
              }]
            }]
          };
        } // Get two distinct examples to know if unique


        query = {
          distinct: true,
          selects: [{
            type: "select",
            expr: compiledExpr,
            alias: "value"
          }],
          from: table ? exprCompiler.compileTable(table, "main") : void 0,
          limit: 2
        };
        whereClauses = _.compact(whereClauses); // Wrap if multiple

        if (whereClauses.length > 1) {
          query.where = {
            type: "op",
            op: "and",
            exprs: whereClauses
          };
        } else {
          query.where = whereClauses[0];
        } // Execute query


        return dataSource.performQuery(query, function (error, rows) {
          if (error) {
            return cb(error);
          } else {
            // If multiple, use null
            if (rows.length !== 1) {
              return cb(null, null);
            } else {
              return cb(null, rows[0].value);
            }
          }
        });
      }; // Map of value by id


      exprValues = {};
      return async.each(this.getExprItems(design.items), function (exprItem, cb) {
        return evalExprItem(exprItem, function (error, value) {
          if (error) {
            return cb(error);
          } else {
            exprValues[exprItem.id] = value;
            return cb(null);
          }
        });
      }, function (error) {
        if (error) {
          return callback(error);
        } else {
          return callback(null, exprValues);
        }
      });
    } // Determine if widget is auto-height, which means that a vertical height is not required.

  }, {
    key: "isAutoHeight",
    value: function isAutoHeight() {
      return true;
    } // Get expression items recursively

  }, {
    key: "getExprItems",
    value: function getExprItems(items) {
      var exprItems, i, item, len, ref;
      exprItems = [];
      ref = items || [];

      for (i = 0, len = ref.length; i < len; i++) {
        item = ref[i];

        if (item.type === "expr") {
          exprItems.push(item);
        }

        if (item.items) {
          exprItems = exprItems.concat(this.getExprItems(item.items));
        }
      }

      return exprItems;
    } // Get a list of table ids that can be filtered on

  }, {
    key: "getFilterableTables",
    value: function getFilterableTables(design, schema) {
      var exprItems, filterableTables;
      exprItems = this.getExprItems(design.items);
      filterableTables = _.map(exprItems, function (exprItem) {
        var ref;
        return (ref = exprItem.expr) != null ? ref.table : void 0;
      });
      filterableTables = _.uniq(_.compact(filterableTables));
      return filterableTables;
    } // Get table of contents entries for the widget, entries that should be displayed in the TOC.
    // returns `[{ id: "id that is unique within widget", text: "text of TOC entry", level: 1, 2, etc. }]
    // For simplicity, the h1, h2, etc. have ids of 0, 1, 2 in the order they appear. h1, h2 will be given ids 0, 1 respectively.

  }, {
    key: "getTOCEntries",
    value: function getTOCEntries(design, namedStrings) {
      var entries, _findRecursive, _flattenText; // Find all items that are h1, h2, etc


      entries = []; // Convert items into flat text

      _flattenText = function flattenText(items) {
        var text;
        text = _.map(items, function (item) {
          if (_.isString(item)) {
            return item;
          }

          if (item != null ? item.items : void 0) {
            return _flattenText(item.items);
          }
        }).join(""); // Handle named strings

        return text = text.replace(/\{\{.+?\}\}/g, function (match) {
          var name;
          name = match.substr(2, match.length - 4);

          if (namedStrings && namedStrings[name] != null) {
            return namedStrings[name];
          } else {
            return match;
          }
        });
      };

      _findRecursive = function findRecursive(items) {
        var i, item, len, ref, results;
        ref = items || [];
        results = [];

        for (i = 0, len = ref.length; i < len; i++) {
          item = ref[i];

          if ((item != null ? item.type : void 0) === "element" && item.tag.match(/^h[1-9]$/)) {
            entries.push({
              id: entries.length,
              level: parseInt(item.tag.substr(1)),
              text: _flattenText(item.items)
            });
          }

          if (item != null ? item.items : void 0) {
            results.push(_findRecursive(item.items));
          } else {
            results.push(void 0);
          }
        }

        return results;
      };

      _findRecursive(design.items);

      return entries;
    }
  }]);
  return TextWidget;
}(Widget);