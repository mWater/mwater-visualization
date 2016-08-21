var ExprUtils, ItemsHtmlConverter, _;

_ = require('lodash');

ExprUtils = require('mwater-expressions').ExprUtils;

module.exports = ItemsHtmlConverter = (function() {
  function ItemsHtmlConverter(schema, designMode, exprValues, summarizeExprs) {
    if (summarizeExprs == null) {
      summarizeExprs = false;
    }
    this.schema = schema;
    this.designMode = designMode;
    this.exprValues = exprValues;
    this.summarizeExprs = summarizeExprs;
  }

  ItemsHtmlConverter.prototype.itemsToHtml = function(items) {
    var attrs, exprHtml, exprUtils, first, html, i, item, key, label, len, ref, ref1, ref2, text, value;
    html = "";
    ref = items || [];
    for (i = 0, len = ref.length; i < len; i++) {
      item = ref[i];
      if (_.isString(item)) {
        html += _.escape(item);
      } else if (item.type === "element") {
        if (!item.tag.match(/^[a-z][a-z0-9]*$/) || item.tag === "script") {
          throw new Error("Invalid tag " + item.tag);
        }
        attrs = "";
        if (item.style) {
          attrs += " style=\"";
          first = true;
          ref1 = item.style;
          for (key in ref1) {
            value = ref1[key];
            if (!first) {
              attrs += " ";
            }
            attrs += _.escape(key) + ": " + _.escape(value) + ";";
            first = false;
          }
          attrs += "\"";
        }
        if (item.href) {
          attrs += " href=\"" + _.escape(item.href) + '"';
        }
        if (item.target) {
          attrs += " target=\"" + _.escape(item.target) + '"';
        }
        if ((ref2 = item.tag) === 'br') {
          html += "<" + item.tag + attrs + ">";
        } else {
          html += ("<" + item.tag + attrs + ">") + this.itemsToHtml(item.items) + ("</" + item.tag + ">");
        }
      } else if (item.type === "expr") {
        if (this.summarizeExprs) {
          text = new ExprUtils(this.schema).summarizeExpr(item.expr);
          if (text.length > 30) {
            text = text.substr(0, 30) + "...";
          }
          exprHtml = _.escape(text);
        } else if (_.has(this.exprValues, item.id)) {
          exprUtils = new ExprUtils(this.schema);
          if (this.exprValues[item.id] != null) {
            text = exprUtils.stringifyExprLiteral(item.expr, this.exprValues[item.id]);
            exprHtml = _.escape(text);
          } else {
            exprHtml = "";
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
    }
    if (html.length === 0) {
      html = '\u2060';
    }
    return html;
  };

  ItemsHtmlConverter.prototype.elemToItems = function(elem) {
    var i, item, items, j, len, len1, node, ref, ref1, style, tag, text;
    items = [];
    ref = elem.childNodes;
    for (i = 0, len = ref.length; i < len; i++) {
      node = ref[i];
      if (node.nodeType === 1) {
        if (node.dataset.embed) {
          items.push(JSON.parse(node.dataset.embed));
          continue;
        }
        tag = node.tagName.toLowerCase();
        if (tag.match(/:/)) {
          tag = tag.split(":")[1];
        }
        item = {
          type: "element",
          tag: tag,
          items: this.elemToItems(node)
        };
        if (node.style != null) {
          ref1 = node.style;
          for (j = 0, len1 = ref1.length; j < len1; j++) {
            style = ref1[j];
            item.style = item.style || {};
            item.style[style] = node.style[style];
          }
        }
        if (node.href) {
          item.href = node.href;
        }
        if (node.target) {
          item.target = node.target;
        }
        items.push(item);
      } else if (node.nodeType === 3) {
        text = node.nodeValue;
        text = text.replace(/\u2060/g, '');
        if (text.length > 0) {
          items.push(text);
        }
      }
    }
    return items;
  };

  return ItemsHtmlConverter;

})();
