import _ from "lodash"
import ItemsHtmlConverter from "./ItemsHtmlConverter"
import { Expr, ExprUtils, Schema } from "mwater-expressions"
import uuid from "uuid"
import { formatValue } from "../valueFormatter"
import { canFormatType } from "../valueFormatter"

// ItemsHtmlConverter that supports embedded mwater expressions

// Converts items (JSON contents of rich text) to HTML and back to allow editing
// Items are array of:
//  string (html text)
//  { type: "element", tag: "h1", items: [nested items] }
//  { type: "expr", id: unique id, expr: expression, includeLabel: true to include label, labelText: override label text, format: d3 format if number }
export default class ExprItemsHtmlConverter extends ItemsHtmlConverter {
  schema: Schema
  designMode: boolean
  exprValues: { [id: string]: Expr }
  summarizeExprs: boolean
  locale: string | undefined
  
  // designMode is true to display in design mode (exprs as blocks)
  // exprValues is map of expr id to value
  // summarizeExprs shows summaries of expressions, not values
  // namedStrings: Optional lookup of string name to value. Used for {{branding}} and other replacement strings in text widget
  // locale: locale to use e.g. "en"
  constructor(schema: Schema, designMode: boolean, exprValues: { [id: string]: Expr }, summarizeExprs: boolean, namedStrings?: { [key: string]: string }, locale?: string) {
    super(namedStrings)

    this.schema = schema
    this.designMode = designMode
    this.exprValues = exprValues
    this.summarizeExprs = summarizeExprs
    this.locale = locale
  }

  // Converts an item that is not an element to html. Override in subclass.
  // To be reversible, should contain data-embed which contains JSON of item
  convertSpecialItemToHtml(item: any) {
    let html = ""

    if (item.type === "expr") {
      let exprHtml, text
      if (this.summarizeExprs) {
        text = new ExprUtils(this.schema).summarizeExpr(item.expr, this.locale)
        if (text.length > 30) {
          text = text.substr(0, 30) + "..."
        }

        exprHtml = _.escape(text)
      } else if (_.has(this.exprValues, item.id)) {
        // If has data
        const exprUtils = new ExprUtils(this.schema)
        const value = this.exprValues[item.id]

        if (value != null) {
          // Get expression type
          const exprType = exprUtils.getExprType(item.expr)

          // Format if can format
          if (exprType && canFormatType(exprType)) {
            text = formatValue(exprType, value, item.format)
          } else {
            text = exprUtils.stringifyExprLiteral(item.expr, value, this.locale)
          }

          exprHtml = _.escape(text)
        } else {
          exprHtml = '<span style="color: #DDD">---</span>'
        }
      } else {
        // Placeholder
        exprHtml = '<span class="text-muted">\u25a0\u25a0\u25a0</span>'
      }

      // Add label
      if (item.includeLabel) {
        const label = item.labelText || new ExprUtils(this.schema).summarizeExpr(item.expr, this.locale) + ":\u00A0"
        exprHtml = '<span class="text-muted">' + _.escape(label) + "</span>" + exprHtml
      }

      if (this.designMode) {
        html +=
          '\u2060<span data-embed="' +
          _.escape(JSON.stringify(item)) +
          '" class="mwater-visualization-text-widget-expr">' +
          (exprHtml || "\u00A0") +
          "</span>\u2060"
      } else {
        // View mode
        html += exprHtml
      }
    }

    return html
  }

  convertElemToItems(elem: any) {
    const items = super.convertElemToItems(elem)

    // Ensure exprs have unique ids
    const takenIds = {}
    var uniqueify = (items: any) => {
      for (let item of items) {
        if (item.type === "expr") {
          if (takenIds[item.id]) {
            item.id = uuid()
          }
          takenIds[item.id] = true
        }

        if (item.items) {
          uniqueify(item.items)
        }
      } 
    }

    uniqueify(items)

    return items
  }
}
