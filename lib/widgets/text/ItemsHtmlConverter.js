var ExprUtils, ItemsHtmlConverter, _;

_ = require('lodash');

ExprUtils = require('mwater-expressions').ExprUtils;

module.exports = ItemsHtmlConverter = (function() {
  function ItemsHtmlConverter(schema, designMode, exprValues) {
    this.schema = schema;
    this.designMode = designMode;
    this.exprValues = exprValues;
  }

  ItemsHtmlConverter.prototype.itemsToHtml = function(items) {
    var attrs, first, html, i, item, key, label, len, ref, ref1, ref2, value;
    html = "";
    ref = items || [];
    for (i = 0, len = ref.length; i < len; i++) {
      item = ref[i];
      if (_.isString(item)) {
        html += _.escape(item);
      } else if (item.type === "element") {
        if (!item.tag.match(/^[a-z]+$/) || item.tag === "script") {
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
        if ((ref2 = item.tag) === 'br') {
          html += "<" + item.tag + attrs + ">";
        } else {
          html += ("<" + item.tag + attrs + ">") + this.itemsToHtml(item.items) + ("</" + item.tag + ">");
        }
      } else if (item.type === "expr") {
        if (this.designMode) {
          label = new ExprUtils(this.schema).summarizeExpr(item.expr);
          if (label.length > 15) {
            label = label.substr(0, 15) + "...";
          }
          html += '&#x2060;<span data-embed="' + _.escape(JSON.stringify(item)) + '" class="mwater-visualization-text-widget-expr">' + label + '</span>&#x2060;';
        } else {
          if (_.has(this.exprValues, item.id)) {
            html += _.escape(this.exprValues[item.id] + "");
          } else {
            html += '<span class="text-muted">&#x25a0;&#x25a0;&#x25a0;</span>';
          }
        }
      }
    }
    if (html.length === 0) {
      html = '&#x2060;';
    }
    return html;
  };

  ItemsHtmlConverter.prototype.elemToItems = function(elem) {
    var i, item, items, j, len, len1, node, ref, ref1, style, text;
    items = [];
    ref = elem.childNodes;
    for (i = 0, len = ref.length; i < len; i++) {
      node = ref[i];
      if (node.nodeType === 1) {
        if (node.dataset.embed) {
          items.push(JSON.parse(node.dataset.embed));
          continue;
        }
        item = {
          type: "element",
          tag: node.tagName.toLowerCase(),
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
