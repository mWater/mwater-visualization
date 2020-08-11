"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _get2 = _interopRequireDefault(require("@babel/runtime/helpers/get"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var ExprItemsHtmlConverter, ExprUtils, ItemsHtmlConverter, _, canFormatType, formatValue, utm, uuid;

_ = require('lodash');
ItemsHtmlConverter = require('./ItemsHtmlConverter');
ExprUtils = require('mwater-expressions').ExprUtils;
uuid = require('uuid');
utm = require('utm');
formatValue = require('../valueFormatter').formatValue;
canFormatType = require('../valueFormatter').canFormatType; // ItemsHtmlConverter that supports embedded mwater expressions
// Converts items (JSON contents of rich text) to HTML and back to allow editing
// Items are array of:
//  string (html text) 
//  { type: "element", tag: "h1", items: [nested items] }
//  { type: "expr", id: unique id, expr: expression, includeLabel: true to include label, labelText: override label text, format: d3 format if number } 

module.exports = ExprItemsHtmlConverter = /*#__PURE__*/function (_ItemsHtmlConverter) {
  (0, _inherits2["default"])(ExprItemsHtmlConverter, _ItemsHtmlConverter);

  var _super = _createSuper(ExprItemsHtmlConverter);

  // designMode is true to display in design mode (exprs as blocks)
  // exprValues is map of expr id to value 
  // summarizeExprs shows summaries of expressions, not values
  // namedStrings: Optional lookup of string name to value. Used for {{branding}} and other replacement strings in text widget
  // locale: locale to use e.g. "en"
  function ExprItemsHtmlConverter(schema, designMode, exprValues, summarizeExprs, namedStrings, locale) {
    var _this;

    (0, _classCallCheck2["default"])(this, ExprItemsHtmlConverter);
    _this = _super.call(this, namedStrings);
    _this.schema = schema;
    _this.designMode = designMode;
    _this.exprValues = exprValues;
    _this.summarizeExprs = summarizeExprs;
    _this.locale = locale;
    return _this;
  } // Converts an item that is not an element to html. Override in subclass.
  // To be reversible, should contain data-embed which contains JSON of item


  (0, _createClass2["default"])(ExprItemsHtmlConverter, [{
    key: "convertSpecialItemToHtml",
    value: function convertSpecialItemToHtml(item) {
      var exprHtml, exprType, exprUtils, html, label, text, value;
      html = "";

      if (item.type === "expr") {
        if (this.summarizeExprs) {
          text = new ExprUtils(this.schema).summarizeExpr(item.expr, this.locale);

          if (text.length > 30) {
            text = text.substr(0, 30) + "...";
          }

          exprHtml = _.escape(text);
        } else if (_.has(this.exprValues, item.id)) {
          // If has data
          exprUtils = new ExprUtils(this.schema);
          value = this.exprValues[item.id];

          if (value != null) {
            // Get expression type
            exprType = exprUtils.getExprType(item.expr); // Format if can format

            if (canFormatType(exprType)) {
              text = formatValue(exprType, value, item.format);
            } else {
              text = exprUtils.stringifyExprLiteral(item.expr, value, this.locale);
            }

            exprHtml = _.escape(text);
          } else {
            exprHtml = '<span style="color: #DDD">---</span>'; // Placeholder
          }
        } else {
          exprHtml = "<span class=\"text-muted\">\u25A0\u25A0\u25A0</span>";
        } // Add label


        if (item.includeLabel) {
          label = item.labelText || new ExprUtils(this.schema).summarizeExpr(item.expr, this.locale) + ":\xA0";
          exprHtml = '<span class="text-muted">' + _.escape(label) + "</span>" + exprHtml;
        }

        if (this.designMode) {
          html += "\u2060<span data-embed=\"" + _.escape(JSON.stringify(item)) + '" class="mwater-visualization-text-widget-expr">' + (exprHtml || "\xA0") + "</span>\u2060";
        } else {
          // View mode
          html += exprHtml;
        }
      }

      return html;
    }
  }, {
    key: "convertElemToItems",
    value: function convertElemToItems(elem) {
      var items, takenIds, _uniqueify;

      items = (0, _get2["default"])((0, _getPrototypeOf2["default"])(ExprItemsHtmlConverter.prototype), "convertElemToItems", this).call(this, elem); // Ensure exprs have unique ids

      takenIds = {};

      _uniqueify = function uniqueify(items) {
        var i, item, len, results;
        results = [];

        for (i = 0, len = items.length; i < len; i++) {
          item = items[i];

          if (item.type === "expr") {
            if (takenIds[item.id]) {
              item.id = uuid();
            }

            takenIds[item.id] = true;
          }

          if (item.items) {
            results.push(_uniqueify(item.items));
          } else {
            results.push(void 0);
          }
        }

        return results;
      };

      _uniqueify(items);

      return items;
    }
  }]);
  return ExprItemsHtmlConverter;
}(ItemsHtmlConverter);