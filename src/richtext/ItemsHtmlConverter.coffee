_ = require 'lodash'

# Converts items (JSON contents of rich text) to HTML and back to allow editing
# Items are array of:
#  string (html text) 
#  { type: "element", tag: "h1", items: [nested items] }
module.exports = class ItemsHtmlConverter 
  # Check if blank (no text or special expressions)
  @isBlank: (items) =>
    if not items
      return true

    return _.all items, (item) =>
      if _.isString(item) 
        return item.length == 0
      if _.isObject(item) and item.type == "element"
        return @isBlank(item.items)
      return false

  # Converts list of items to html
  convertItemsToHtml: (items) ->
    html = ""

    for item in (items or [])
      if _.isString(item)
        # Escape HTML
        html += _.escape(item)
      else if item.type == "element"
        if not allowedTags[item.tag]
          # Ignore and do contents
          html += @converItemsToHtml(item.items)
          continue

        attrs = ""
        # Add style
        if item.style
          attrs += " style=\""
          first = true
          for key, value of item.style
            if not allowedStyles[key]
              continue

            if not first
              attrs += " "
            attrs += _.escape(key) + ": " + _.escape(value) + ";"
            first = false

          attrs += "\""

        # Add href
        if item.href
          attrs += " href=\"" + _.escape(item.href) + '"'

        # Add target
        if item.target
          attrs += " target=\"" + _.escape(item.target) + '"'

        # Special case for self-closing tags
        if item.tag in ['br']
          html += "<#{item.tag}#{attrs}>"
        else
          html += "<#{item.tag}#{attrs}>" + @convertItemsToHtml(item.items) + "</#{item.tag}>"
      else 
        html += @convertSpecialItemToHtml(item)

    # If empty, put placeholder
    if html.length == 0
      html = '\u2060'

    # console.log "createHtml: #{html}"
    return html

  # Converts an item that is not an element to html. Override in subclass.
  # To be reversible, should contain data-embed which contains JSON of item
  convertSpecialItemToHtml: (item) ->
    html = ""

    if item.type == "expr"
      if @summarizeExprs
        text = new ExprUtils(@schema).summarizeExpr(item.expr)
        if text.length > 30
          text = text.substr(0, 30) + "..."

        exprHtml = _.escape(text)
      else if _.has(@exprValues, item.id) # If has data
        exprUtils = new ExprUtils(@schema)

        if @exprValues[item.id]?
          text = exprUtils.stringifyExprLiteral(item.expr, @exprValues[item.id]) # TODO locale
          exprHtml = _.escape(text)
        else
          exprHtml = '<span style="color: #DDD">---</span>'

      else # Placeholder
        exprHtml = '<span class="text-muted">\u25a0\u25a0\u25a0</span>'

      # Add label
      if item.includeLabel
        label = item.labelText or (new ExprUtils(@schema).summarizeExpr(item.expr) + ":\u00A0")
        exprHtml = '<span class="text-muted">' + _.escape(label) + "</span>" + exprHtml

      if @designMode 
        html += '\u2060<span data-embed="' + _.escape(JSON.stringify(item)) + '" class="mwater-visualization-text-widget-expr">' + (exprHtml or "\u00A0") + '</span>\u2060'
      else
        # View mode
        html += exprHtml

    return html

  # Converts an HTML DOM element to items
  convertElemToItems: (elem) ->
    # console.log elem.outerHTML
    
    # Walk DOM tree, adding strings and expressions
    items = []

    for node in elem.childNodes
      if node.nodeType == 1 # Element
        # Handle embeds
        if node.dataset.embed
          items.push(JSON.parse(node.dataset.embed))
          continue

        tag = node.tagName.toLowerCase()
        # Strip namespace
        if tag.match(/:/)
          tag = tag.split(":")[1]

        # Whitelist tags
        if not allowedTags[tag]
          # Just add contents
          items = items.concat(@convertElemToItems(node))
          continue

        item = { type: "element", tag: tag, items: @convertElemToItems(node) }

        # Add style
        if node.style?
          for style in node.style
            if not allowedStyles[style]
              continue

            item.style = item.style or {}
            item.style[style] = node.style[style]

        # Convert align (Firefox)
        if node.align
          item.style = item.style or {}
          item.style['text-align'] = node.align

        # Add href and target
        if node.href
          item.href = node.href
        if node.target
          item.target = node.target

        items.push(item)

      # Handle text
      else if node.nodeType == 3
        text = node.nodeValue

        # Strip word joiner used to allow editing at end of string
        text = text.replace(/\u2060/g, '')
        if text.length > 0
          items.push(text)

    # console.log JSON.stringify(items, null, 2)
   
    return items

# Whitelist allowed tags and styles
allowedTags = { div: 1, p: 1, ul: 1, ol: 1, li: 1, span: 1, b: 1, u: 1, em: 1, i: 1, br: 1, h1: 1, h2: 1, h3: 1, h4: 1, h5: 1, a: 1, strong: 1 }
allowedStyles = { "text-align": 1, "font-weight": 1, "font-style": 1, "text-decoration": 1 }
