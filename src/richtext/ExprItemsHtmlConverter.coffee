_ = require 'lodash'
ItemsHtmlConverter = require './ItemsHtmlConverter'
ExprUtils = require('mwater-expressions').ExprUtils
uuid = require 'uuid'

# ItemsHtmlConverter that supports embedded mwater expressions

# Converts items (JSON contents of rich text) to HTML and back to allow editing
# Items are array of:
#  string (html text) 
#  { type: "element", tag: "h1", items: [nested items] }
#  { type: "expr", id: unique id, expr: expression, includeLabel: true to include label, labelText: override label text } 
module.exports = class ExprItemsHtmlConverter extends ItemsHtmlConverter 
  # designMode is true to display in design mode (exprs as blocks)
  # exprValues is map of expr id to value 
  # summarizeExprs shows summaries of expressions, not values
  constructor: (schema, designMode, exprValues, summarizeExprs = false) ->
    super()

    @schema = schema
    @designMode = designMode
    @exprValues = exprValues
    @summarizeExprs = summarizeExprs

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

  convertElemToItems: (elem) ->
    items = super(elem)

    # Ensure exprs have unique ids
    takenIds = {}
    uniqueify = (items) ->
      for item in items
        if item.type == "expr"
          if takenIds[item.id]
            item.id = uuid()
          takenIds[item.id] = true

        if item.items
          uniqueify(item.items)

    uniqueify(items)

    return items