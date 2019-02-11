"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _get2 = _interopRequireDefault(require("@babel/runtime/helpers/get"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var ExprItemsHtmlConverter, ExprUtils, ItemsHtmlConverter, _, d3Format, uuid;

_ = require('lodash');
ItemsHtmlConverter = require('./ItemsHtmlConverter');
ExprUtils = require('mwater-expressions').ExprUtils;
uuid = require('uuid');
d3Format = require('d3-format'); // ItemsHtmlConverter that supports embedded mwater expressions
// Converts items (JSON contents of rich text) to HTML and back to allow editing
// Items are array of:
//  string (html text) 
//  { type: "element", tag: "h1", items: [nested items] }
//  { type: "expr", id: unique id, expr: expression, includeLabel: true to include label, labelText: override label text, format: d3 format if number } 

module.exports = ExprItemsHtmlConverter =
/*#__PURE__*/
function (_ItemsHtmlConverter) {
  (0, _inherits2.default)(ExprItemsHtmlConverter, _ItemsHtmlConverter);

  // designMode is true to display in design mode (exprs as blocks)
  // exprValues is map of expr id to value 
  // summarizeExprs shows summaries of expressions, not values
  // namedStrings: Optional lookup of string name to value. Used for {{branding}} and other replacement strings in text widget
  // locale: locale to use e.g. "en"
  function ExprItemsHtmlConverter(schema, designMode, exprValues, summarizeExprs, namedStrings, locale) {
    var _this;

    (0, _classCallCheck2.default)(this, ExprItemsHtmlConverter);
    _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(ExprItemsHtmlConverter).call(this, namedStrings));
    _this.schema = schema;
    _this.designMode = designMode;
    _this.exprValues = exprValues;
    _this.summarizeExprs = summarizeExprs;
    _this.locale = locale;
    return _this;
  } // Converts an item that is not an element to html. Override in subclass.
  // To be reversible, should contain data-embed which contains JSON of item


  (0, _createClass2.default)(ExprItemsHtmlConverter, [{
    key: "convertSpecialItemToHtml",
    value: function convertSpecialItemToHtml(item) {
      var exprHtml, exprUtils, html, label, num, text;
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

          if (this.exprValues[item.id] != null) {
            // Use d3 format if number and has format
            if (item.format && exprUtils.getExprType(item.expr) === "number") {
              num = this.exprValues[item.id]; // Do not convert % (d3Format multiplies by 100 which is annoying)

              if (item.format && item.format.match(/%/)) {
                num = num / 100.0;
              }

              text = d3Format.format(item.format)(num);
            } else {
              text = exprUtils.stringifyExprLiteral(item.expr, this.exprValues[item.id], this.locale);
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

      items = (0, _get2.default)((0, _getPrototypeOf2.default)(ExprItemsHtmlConverter.prototype), "convertElemToItems", this).call(this, elem); // Ensure exprs have unique ids

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