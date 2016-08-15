_ = require 'lodash'
ExprUtils = require('mwater-expressions').ExprUtils

# Converts widget design to html and back
# Text widgets are an array of items: each one of:
#  string (html text) 
#  { type: "element", tag: "h1", items: [nested items] }
#  { type: "expr", id: unique id, expr: expression, includeLabel: true to include label, labelText: override label text } 
module.exports = class ItemsHtmlConverter 
  # designMode is true to display in design mode (exprs as blocks)
  # exprValues is map of expr id to value
  # summarizeExprs shows summaries of expressions, not values
  constructor: (schema, designMode, exprValues, summarizeExprs = false) ->
    @schema = schema
    @designMode = designMode
    @exprValues = exprValues
    @summarizeExprs = summarizeExprs

  itemsToHtml: (items) ->
    html = ""

    for item in (items or [])
      if _.isString(item)
        # Escape HTML
        html += _.escape(item)
      else if item.type == "element"
        if not item.tag.match(/^[a-z][a-z0-9]*$/) or item.tag == "script"
          throw new Error("Invalid tag #{item.tag}")

        attrs = ""
        # Add style
        if item.style
          attrs += " style=\""
          first = true
          for key, value of item.style
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
          html += "<#{item.tag}#{attrs}>" + @itemsToHtml(item.items) + "</#{item.tag}>"
      else if item.type == "expr"
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
            exprHtml = ""  

          # "None" looked ugly
          # else
          #   exprHtml = '<span class="text-muted">None</span>'

        else # Placeholder
          exprHtml = '<span class="text-muted">\u25a0\u25a0\u25a0</span>'

        # Add label
        if item.includeLabel
          label = item.labelText or new ExprUtils(@schema).summarizeExpr(item.expr)
          exprHtml = '<span class="text-muted">' + _.escape(label) + ":\u00A0</span>" + exprHtml

        if @designMode 
          html += '\u2060<span data-embed="' + _.escape(JSON.stringify(item)) + '" class="mwater-visualization-text-widget-expr">' + (exprHtml or "\u00A0") + '</span>\u2060'
        else
          # View mode
          html += exprHtml

    # If empty, put placeholder
    if html.length == 0
      html = '\u2060'

    # console.log "createHtml: #{html}"
    return html

  elemToItems: (elem) ->
    # console.log elem.outerHTML
    
    # Walk DOM tree, adding strings and expressions
    items = []

    for node in elem.childNodes

      if node.nodeType == 1 # Element
        # Handle embeds
        if node.dataset.embed
          items.push(JSON.parse(node.dataset.embed))
          continue

        item = { type: "element", tag: node.tagName.toLowerCase(), items: @elemToItems(node) }

        # Add style
        if node.style?
          for style in node.style
            item.style = item.style or {}
            item.style[style] = node.style[style]

        # Add href and target
        if node.href
          item.href = node.href
        if node.target
          item.target = node.target

        items.push(item)

      else if node.nodeType == 3
        text = node.nodeValue

        # Strip word joiner used to allow editing at end of string
        text = text.replace(/\u2060/g, '')
        if text.length > 0
          items.push(text)

    # console.log JSON.stringify(items, null, 2)
   
    return items
