import _ from "lodash"

// Converts items (JSON contents of rich text) to HTML and back to allow editing
// Items are array of:
//  string (html text)
//  { type: "element", tag: "h1", items: [nested items] }
//  elements can contain style (object), href, target
export default class ItemsHtmlConverter {
  static isBlank = (items: any) => {
    if (!items) {
      return true
    }

    return _.all(items, (item) => {
      if (_.isString(item)) {
        return item.length === 0
      }
      if (_.isObject(item) && item.type === "element") {
        return ItemsHtmlConverter.isBlank(item.items)
      }
      return false
    })
  }

  // namedStrings: Optional lookup of string name to value. Used for {{branding}} and other replacement strings
  constructor(namedStrings: any) {
    this.namedStrings = namedStrings
  }

  // Converts list of items to html
  convertItemsToHtml(items: any) {
    let html = ""

    for (let item of items || []) {
      if (_.isString(item)) {
        // Replace named strings
        let itemStr = item
        itemStr = itemStr.replace(/\{\{.+?\}\}/g, (match) => {
          const name = match.substr(2, match.length - 4)
          if (this.namedStrings && this.namedStrings[name] != null) {
            return this.namedStrings[name]
          } else {
            return match
          }
        })

        // Escape HTML
        html += _.escape(itemStr)
      } else if (item.type === "element") {
        if (!allowedTags[item.tag]) {
          // Ignore and do contents
          html += this.convertItemsToHtml(item.items)
          continue
        }

        let attrs = ""
        // Add style
        if (item.style) {
          attrs += ' style="'
          let first = true
          for (let key in item.style) {
            const value = item.style[key]
            if (!allowedStyles[key]) {
              continue
            }

            if (!first) {
              attrs += " "
            }
            attrs += _.escape(key) + ": " + _.escape(value) + ";"
            first = false
          }

          attrs += '"'
        }

        // Add href
        if (item.href) {
          attrs += ' href="' + item.href + '"'
        }

        // Add target
        if (item.target) {
          attrs += ' target="' + _.escape(item.target) + '"'
        }

        // Special case for self-closing tags
        if (["br"].includes(item.tag)) {
          html += `<${item.tag}${attrs}>`
        } else {
          html += `<${item.tag}${attrs}>` + this.convertItemsToHtml(item.items) + `</${item.tag}>`
        }
      } else {
        html += this.convertSpecialItemToHtml(item)
      }
    }

    // If empty, put placeholder
    if (html.length === 0) {
      html = "\u2060"
    }

    // console.log "createHtml: #{html}"
    return html
  }

  // Converts an item that is not an element to html. Override in subclass.
  // To be reversible, should contain data-embed which contains JSON of item
  convertSpecialItemToHtml(item: any) {
    // To be implemented by subclasses
    return ""
  }

  // Converts an HTML DOM element to items
  convertElemToItems(elem: any) {
    // console.log elem.outerHTML

    // Walk DOM tree, adding strings and expressions
    let items = []

    for (let node of elem.childNodes) {
      if (node.nodeType === 1) {
        // Element
        // Handle embeds
        var style
        if (node.dataset?.embed) {
          items.push(JSON.parse(node.dataset.embed))
          continue
        }

        let tag = node.tagName.toLowerCase()
        // Strip namespace
        if (tag.match(/:/)) {
          tag = tag.split(":")[1]
        }

        // Whitelist tags
        if (!allowedTags[tag]) {
          // Just add contents
          items = items.concat(this.convertElemToItems(node))
          continue
        }

        const item = { type: "element", tag, items: this.convertElemToItems(node) }

        // Add style
        if (node.style != null) {
          for (style of node.style) {
            if (!allowedStyles[style]) {
              continue
            }

            item.style = item.style || {}
            item.style[style] = node.style[style]
          }
        }

        // Convert align (Firefox)
        if (node.align) {
          item.style = item.style || {}
          item.style["text-align"] = node.align
        }

        // Add href and target
        if (node.href) {
          // There is a quirk of the href property that it includes the complete url, even if
          // it is just an anchor. Use outerHTML to bypass the problem
          const hrefMatches = node.outerHTML.match('href="(.*?)"')
          const href = hrefMatches?.[1]
          if (href) {
            item.href = href
          }
        }
        if (node.target) {
          item.target = node.target
        }

        items.push(item)

        // Handle text
      } else if (node.nodeType === 3) {
        let text = node.nodeValue

        // Strip word joiner used to allow editing at end of string
        text = text.replace(/\u2060/g, "")
        if (text.length > 0) {
          items.push(text)
        }
      }
    }

    // console.log JSON.stringify(items, null, 2)

    return items
  }
}

// Whitelist allowed tags and styles
var allowedTags = {
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
}
var allowedStyles = {
  "text-align": 1,
  "font-weight": 1,
  "font-style": 1,
  "text-decoration": 1,
  color: 1,
  "font-size": 1
}
