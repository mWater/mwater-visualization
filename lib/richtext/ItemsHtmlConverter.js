var ItemsHtmlConverter, _, allowedStyles, allowedTags;

_ = require('lodash');

module.exports = ItemsHtmlConverter = (function() {
  function ItemsHtmlConverter(namedStrings) {
    this.namedStrings = namedStrings;
  }

  ItemsHtmlConverter.isBlank = function(items) {
    if (!items) {
      return true;
    }
    return _.all(items, function(item) {
      if (_.isString(item)) {
        return item.length === 0;
      }
      if (_.isObject(item) && item.type === "element") {
        return ItemsHtmlConverter.isBlank(item.items);
      }
      return false;
    });
  };

  ItemsHtmlConverter.prototype.convertItemsToHtml = function(items) {
    var attrs, first, html, i, item, itemStr, key, len, ref, ref1, ref2, value;
    html = "";
    ref = items || [];
    for (i = 0, len = ref.length; i < len; i++) {
      item = ref[i];
      if (_.isString(item)) {
        itemStr = item;
        itemStr = itemStr.replace(/\{\{.+?\}\}/g, (function(_this) {
          return function(match) {
            var name;
            name = match.substr(2, match.length - 4);
            if (_this.namedStrings && (_this.namedStrings[name] != null)) {
              return _this.namedStrings[name];
            } else {
              return match;
            }
          };
        })(this));
        html += _.escape(itemStr);
      } else if (item.type === "element") {
        if (!allowedTags[item.tag]) {
          html += this.convertItemsToHtml(item.items);
          continue;
        }
        attrs = "";
        if (item.style) {
          attrs += " style=\"";
          first = true;
          ref1 = item.style;
          for (key in ref1) {
            value = ref1[key];
            if (!allowedStyles[key]) {
              continue;
            }
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
          html += ("<" + item.tag + attrs + ">") + this.convertItemsToHtml(item.items) + ("</" + item.tag + ">");
        }
      } else {
        html += this.convertSpecialItemToHtml(item);
      }
    }
    if (html.length === 0) {
      html = '\u2060';
    }
    return html;
  };

  ItemsHtmlConverter.prototype.convertSpecialItemToHtml = function(item) {
    return "";
  };

  ItemsHtmlConverter.prototype.convertElemToItems = function(elem) {
    var i, item, items, j, len, len1, node, ref, ref1, ref2, style, tag, text;
    items = [];
    ref = elem.childNodes;
    for (i = 0, len = ref.length; i < len; i++) {
      node = ref[i];
      if (node.nodeType === 1) {
        if ((ref1 = node.dataset) != null ? ref1.embed : void 0) {
          items.push(JSON.parse(node.dataset.embed));
          continue;
        }
        tag = node.tagName.toLowerCase();
        if (tag.match(/:/)) {
          tag = tag.split(":")[1];
        }
        if (!allowedTags[tag]) {
          items = items.concat(this.convertElemToItems(node));
          continue;
        }
        item = {
          type: "element",
          tag: tag,
          items: this.convertElemToItems(node)
        };
        if (node.style != null) {
          ref2 = node.style;
          for (j = 0, len1 = ref2.length; j < len1; j++) {
            style = ref2[j];
            if (!allowedStyles[style]) {
              continue;
            }
            item.style = item.style || {};
            item.style[style] = node.style[style];
          }
        }
        if (node.align) {
          item.style = item.style || {};
          item.style['text-align'] = node.align;
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

allowedTags = {
  div: 1,
  p: 1,
  ul: 1,
  ol: 1,
  li: 1,
  span: 1,
  b: 1,
  u: 1,
  em: 1,
  i: 1,
  br: 1,
  h1: 1,
  h2: 1,
  h3: 1,
  h4: 1,
  h5: 1,
  a: 1,
  strong: 1
};

allowedStyles = {
  "text-align": 1,
  "font-weight": 1,
  "font-style": 1,
  "text-decoration": 1
};
