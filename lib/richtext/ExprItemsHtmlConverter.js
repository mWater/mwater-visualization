var ExprItemsHtmlConverter, ExprUtils, ItemsHtmlConverter, _, d3Format, uuid,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

ItemsHtmlConverter = require('./ItemsHtmlConverter');

ExprUtils = require('mwater-expressions').ExprUtils;

uuid = require('uuid');

d3Format = require('d3-format');

module.exports = ExprItemsHtmlConverter = (function(superClass) {
  extend(ExprItemsHtmlConverter, superClass);

  function ExprItemsHtmlConverter(schema, designMode, exprValues, summarizeExprs, namedStrings) {
    ExprItemsHtmlConverter.__super__.constructor.call(this, namedStrings);
    this.schema = schema;
    this.designMode = designMode;
    this.exprValues = exprValues;
    this.summarizeExprs = summarizeExprs;
  }

  ExprItemsHtmlConverter.prototype.convertSpecialItemToHtml = function(item) {
    var exprHtml, exprUtils, html, label, text;
    html = "";
    if (item.type === "expr") {
      if (this.summarizeExprs) {
        text = new ExprUtils(this.schema).summarizeExpr(item.expr);
        if (text.length > 30) {
          text = text.substr(0, 30) + "...";
        }
        exprHtml = _.escape(text);
      } else if (_.has(this.exprValues, item.id)) {
        exprUtils = new ExprUtils(this.schema);
        if (this.exprValues[item.id] != null) {
          if (item.format && exprUtils.getExprType(item.expr) === "number") {
            text = d3Format.format(item.format)(this.exprValues[item.id]);
          } else {
            text = exprUtils.stringifyExprLiteral(item.expr, this.exprValues[item.id]);
          }
          exprHtml = _.escape(text);
        } else {
          exprHtml = '<span style="color: #DDD">---</span>';
        }
      } else {
        exprHtml = '<span class="text-muted">\u25a0\u25a0\u25a0</span>';
      }
      if (item.includeLabel) {
        label = item.labelText || (new ExprUtils(this.schema).summarizeExpr(item.expr) + ":\u00A0");
        exprHtml = '<span class="text-muted">' + _.escape(label) + "</span>" + exprHtml;
      }
      if (this.designMode) {
        html += '\u2060<span data-embed="' + _.escape(JSON.stringify(item)) + '" class="mwater-visualization-text-widget-expr">' + (exprHtml || "\u00A0") + '</span>\u2060';
      } else {
        html += exprHtml;
      }
    }
    return html;
  };

  ExprItemsHtmlConverter.prototype.convertElemToItems = function(elem) {
    var items, takenIds, uniqueify;
    items = ExprItemsHtmlConverter.__super__.convertElemToItems.call(this, elem);
    takenIds = {};
    uniqueify = function(items) {
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
          results.push(uniqueify(item.items));
        } else {
          results.push(void 0);
        }
      }
      return results;
    };
    uniqueify(items);
    return items;
  };

  return ExprItemsHtmlConverter;

})(ItemsHtmlConverter);
