"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var ExprCompiler, ImageWidget, R, React, Widget, _, injectTableAlias;

React = require('react');
R = React.createElement;
_ = require('lodash');
ExprCompiler = require('mwater-expressions').ExprCompiler;
injectTableAlias = require('mwater-expressions').injectTableAlias;
Widget = require('./Widget'); // Image widget. Design is:
// imageUrl: arbitrary url of image if using url
// uid: uid of image if on server
// expr: image or imagelist expression if using expression
// caption: string caption
// rotation: optional rotation in degrees for imageUrl or uid
// captionPosition: "top"/"bottom". Defaults to "bottom"

module.exports = ImageWidget = /*#__PURE__*/function (_Widget) {
  (0, _inherits2["default"])(ImageWidget, _Widget);

  var _super = _createSuper(ImageWidget);

  function ImageWidget() {
    (0, _classCallCheck2["default"])(this, ImageWidget);
    return _super.apply(this, arguments);
  }

  (0, _createClass2["default"])(ImageWidget, [{
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
    value: function createViewElement(options) {
      var ImageWidgetComponent; // Put here so ImageWidget can be created on server

      ImageWidgetComponent = require('./ImageWidgetComponent');
      return R(ImageWidgetComponent, {
        schema: options.schema,
        dataSource: options.dataSource,
        widgetDataSource: options.widgetDataSource,
        filters: options.filters,
        design: options.design,
        onDesignChange: options.onDesignChange,
        width: options.width,
        height: options.height,
        singleRowTable: options.singleRowTable
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
      var exprCompiler, imageExpr, query, table, whereClauses;

      if (!design.expr) {
        return callback(null);
      }

      table = design.expr.table;
      exprCompiler = new ExprCompiler(schema);
      imageExpr = exprCompiler.compileExpr({
        expr: design.expr,
        tableAlias: "main"
      }); // Get distinct to only show if single row match

      query = {
        distinct: true,
        selects: [{
          type: "select",
          expr: imageExpr,
          alias: "value"
        }],
        from: {
          type: "table",
          table: table,
          alias: "main"
        },
        limit: 2
      }; // Get relevant filters

      filters = _.where(filters || [], {
        table: table
      });
      whereClauses = _.map(filters, function (f) {
        return injectTableAlias(f.jsonql, "main");
      });
      whereClauses.push({
        type: "op",
        op: "is not null",
        exprs: [imageExpr]
      });
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
        var value;

        if (error) {
          return callback(error);
        } else {
          // If multiple, use null
          if (rows.length !== 1) {
            return callback(null, null);
          } else {
            // Make sure is not string
            value = rows[0].value;

            if (_.isString(rows[0].value)) {
              value = JSON.parse(rows[0].value);
            }

            return callback(null, value);
          }
        }
      });
    } // Determine if widget is auto-height, which means that a vertical height is not required.

  }, {
    key: "isAutoHeight",
    value: function isAutoHeight() {
      return false;
    } // Get a list of table ids that can be filtered on

  }, {
    key: "getFilterableTables",
    value: function getFilterableTables(design, schema) {
      var ref;

      if ((ref = design.expr) != null ? ref.table : void 0) {
        return [design.expr.table];
      }

      return [];
    }
  }]);
  return ImageWidget;
}(Widget);