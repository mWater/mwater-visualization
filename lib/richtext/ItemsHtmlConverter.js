"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var ItemsHtmlConverter, _, allowedStyles, allowedTags;

_ = require('lodash'); // Converts items (JSON contents of rich text) to HTML and back to allow editing
// Items are array of:
//  string (html text) 
//  { type: "element", tag: "h1", items: [nested items] }
//  elements can contain style (object), href, target

module.exports = ItemsHtmlConverter =
/*#__PURE__*/
function () {
  // namedStrings: Optional lookup of string name to value. Used for {{branding}} and other replacement strings 
  function ItemsHtmlConverter(namedStrings) {
    (0, _classCallCheck2.default)(this, ItemsHtmlConverter);
    this.namedStrings = namedStrings;
  } // Check if blank (no text or special expressions)


  (0, _createClass2.default)(ItemsHtmlConverter, [{
    key: "convertItemsToHtml",
    // Converts list of items to html
    value: function convertItemsToHtml(items) {
      var _this = this;

      var attrs, first, html, i, item, itemStr, key, len, ref, ref1, ref2, value;
      html = "";
      ref = items || [];

      for (i = 0, len = ref.length; i < len; i++) {
        item = ref[i];

        if (_.isString(item)) {
          // Replace named strings
          itemStr = item;
          itemStr = itemStr.replace(/\{\{.+?\}\}/g, function (match) {
            var name;
            name = match.substr(2, match.length - 4);

            if (_this.namedStrings && _this.namedStrings[name] != null) {
              return _this.namedStrings[name];
            } else {
              return match;
            }
          }); // Escape HTML

          html += _.escape(itemStr);
        } else if (item.type === "element") {
          if (!allowedTags[item.tag]) {
            // Ignore and do contents
            html += this.convertItemsToHtml(item.items);
            continue;
          }

          attrs = ""; // Add style

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
          } // Add href


          if (item.href) {
            attrs += " href=\"" + _.escape(item.href) + '"';
          } // Add target


          if (item.target) {
            attrs += " target=\"" + _.escape(item.target) + '"';
          } // Special case for self-closing tags


          if ((ref2 = item.tag) === 'br') {
            html += "<".concat(item.tag).concat(attrs, ">");
          } else {
            html += "<".concat(item.tag).concat(attrs, ">") + this.convertItemsToHtml(item.items) + "</".concat(item.tag, ">");
          }
        } else {
          html += this.convertSpecialItemToHtml(item);
        }
      } // If empty, put placeholder


      if (html.length === 0) {
        html = "\u2060";
      } // console.log "createHtml: #{html}"


      return html;
    } // Converts an item that is not an element to html. Override in subclass.
    // To be reversible, should contain data-embed which contains JSON of item

  }, {
    key: "convertSpecialItemToHtml",
    value: function convertSpecialItemToHtml(item) {
      // To be implemented by subclasses
      return "";
    } // Converts an HTML DOM element to items

  }, {
    key: "convertElemToItems",
    value: function convertElemToItems(elem) {
      var i, item, items, j, len, len1, node, ref, ref1, ref2, style, tag, text;
      console.log(elem.outerHTML); // Walk DOM tree, adding strings and expressions

      items = [];
      ref = elem.childNodes;

      for (i = 0, len = ref.length; i < len; i++) {
        node = ref[i];

        if (node.nodeType === 1) {
          // Element
          // Handle embeds
          if ((ref1 = node.dataset) != null ? ref1.embed : void 0) {
            items.push(JSON.parse(node.dataset.embed));
            continue;
          }

          tag = node.tagName.toLowerCase(); // Strip namespace

          if (tag.match(/:/)) {
            tag = tag.split(":")[1];
          } // Whitelist tags


          if (!allowedTags[tag]) {
            // Just add contents
            items = items.concat(this.convertElemToItems(node));
            continue;
          }

          item = {
            type: "element",
            tag: tag,
            items: this.convertElemToItems(node)
          }; // Add style

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
          } // Convert align (Firefox)


          if (node.align) {
            item.style = item.style || {};
            item.style['text-align'] = node.align;
          } // Add href and target


          if (node.href) {
            item.href = node.href;
          }

          if (node.target) {
            item.target = node.target;
          }

          items.push(item); // Handle text
        } else if (node.nodeType === 3) {
          text = node.nodeValue; // Strip word joiner used to allow editing at end of string

          text = text.replace(/\u2060/g, '');

          if (text.length > 0) {
            items.push(text);
          }
        }
      } // console.log JSON.stringify(items, null, 2)


      return items;
    }
  }], [{
    key: "isBlank",
    value: function isBlank(items) {
      if (!items) {
        return true;
      }

      return _.all(items, function (item) {
        if (_.isString(item)) {
          return item.length === 0;
        }

        if (_.isObject(item) && item.type === "element") {
          return ItemsHtmlConverter.isBlank(item.items);
        }

        return false;
      });
    }
  }]);
  return ItemsHtmlConverter;
}(); // Whitelist allowed tags and styles


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
  strong: 1,
  font: 1
};
allowedStyles = {
  "text-align": 1,
  "font-weight": 1,
  "font-style": 1,
  "text-decoration": 1,
  "color": 1,
  "font-size": 1
};