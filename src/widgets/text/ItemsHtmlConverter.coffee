_ = require 'lodash'
ExprUtils = require('mwater-expressions').ExprUtils

# Converts widget design to html and back
# Text widgets are an array of items: each one of:
#  string (html text) 
#  { type: "element", tag: "h1", items: [nested items] }
#  { type: "expr", id: unique id, expr: expression } 
module.exports = class ItemsHtmlConverter 
  # designMode is true to display in design mode (exprs as blocks)
  # exprValues is map of expr id to value
  constructor: (schema, designMode, exprValues) ->
    @schema = schema
    @designMode = designMode
    @exprValues = exprValues

  itemsToHtml: (items) ->
    html = ""

    for item in (items or [])
      if _.isString(item)
        # Escape HTML
        html += _.escape(item)
      else if item.type == "element"
        if not item.tag.match(/^[a-z]+$/) or item.tag == "script"
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

        # Special case for self-closing tags
        if item.tag in ['br']
          html += "<#{item.tag}#{attrs}>"
        else
          html += "<#{item.tag}#{attrs}>" + @itemsToHtml(item.items) + "</#{item.tag}>"
      else if item.type == "expr"
        if @designMode
          label = new ExprUtils(@schema).summarizeExpr(item.expr)
          if label.length > 15
            label = label.substr(0, 15) + "..."

          # html += '''&#x2060;<div contentEditable="false" data-embed="''' + _.escape(JSON.stringify(item)) + '''" class="mwater-visualization-text-widget-expr">''' + label + '''</div>&#x2060;'''
          # Don't use a contentEditable false, as it allows for 
          html += '''&#x2060;<span data-embed="''' + _.escape(JSON.stringify(item)) + '''" class="mwater-visualization-text-widget-expr">''' + label + '''</span>&#x2060;'''
        else
          # View mode
          # If has data
          if _.has(@exprValues, item.id)
            html += _.escape(@exprValues[item.id] + "")
          else
            # Placeholder
            html += '''<span class="text-muted">&#x25a0;&#x25a0;&#x25a0;</span>'''

    # If empty, put placeholder
    if html.length == 0
      html = '&#x2060;'

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

        items.push(item)

      else if node.nodeType == 3
        text = node.nodeValue

        # Strip word joiner used to allow editing at end of string
        text = text.replace(/\u2060/g, '')
        if text.length > 0
          items.push(text)

    # console.log JSON.stringify(items, null, 2)
   
    return items
