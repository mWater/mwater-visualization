import PropTypes from "prop-types"
import React, { CSSProperties } from "react"
const R = React.createElement
import _ from "lodash"
import RichTextComponent from "../../richtext/RichTextComponent"
import ExprInsertModalComponent from "./ExprInsertModalComponent"
import ExprUpdateModalComponent from "./ExprUpdateModalComponent"
import ExprItemsHtmlConverter from "../../richtext/ExprItemsHtmlConverter"
import { TextWidgetDesign } from "./TextWidgetDesign"
import { DataSource, Schema } from "mwater-expressions"

export interface TextComponentProps {
  design: TextWidgetDesign
  onDesignChange?: (design: TextWidgetDesign) => void
  schema: Schema
  dataSource: DataSource
  /** Expression values */
  exprValues: { [key: string]: any }
  width?: number
  height?: number
  
  /** Table that is filtered to have one row */
  singleRowTable?: string

  /** Optional lookup of string name to value. Used for {{branding}} and other replacement strings in text widget */
  namedStrings?: { [key: string]: string }
}

// Text component which is provided with the data it needs, rather than loading it.
// Used by TextWidgetComponent and also by other components that embed text fields
export default class TextComponent extends React.Component<TextComponentProps> {
  static contextTypes = { locale: PropTypes.string }
  exprInsertModal: ExprInsertModalComponent | null
  exprUpdateModal: ExprUpdateModalComponent | null
  editor: RichTextComponent | null

  createItemsHtmlConverter() {
    return new ExprItemsHtmlConverter(
      this.props.schema,
      this.props.onDesignChange != null,
      this.props.exprValues,
      // Display summaries if in design more and singleRowTable is set
      this.props.onDesignChange != null && this.props.singleRowTable != null,
      // Only replace named strings if not editing
      this.props.onDesignChange == null ? this.props.namedStrings : undefined,
      this.context.locale
    )
  }

  handleItemsChange = (items: any) => {
    const design = { ...this.props.design, items }
    return this.props.onDesignChange!(design)
  }

  handleInsertExpr = (item: any) => {
    const html = '<div data-embed="' + _.escape(JSON.stringify(item)) + '"></div>'

    return this.editor!.pasteHTML(html)
  }

  replaceItem(item: any) {
    var replaceItemInItems = (items: any[], item: any): any[] =>
      _.map(items, function (i) {
        if (i.id === item.id) {
          return item
        } else if (i.items) {
          return _.extend({}, i, { items: replaceItemInItems(i.items, item) })
        } else {
          return i
        }
      })

    const items = replaceItemInItems(this.props.design.items || [], item)
    return this.props.onDesignChange!({ ...this.props.design, items })
  }

  handleItemClick = (item: any) => {
    return this.exprUpdateModal!.open(item, (item: any) => {
      // Replace in items
      return this.replaceItem(item)
    })
  }

  handleAddExpr = (ev: any) => {
    ev.preventDefault()
    return this.exprInsertModal!.open()
  }

  renderExtraPaletteButtons() {
    return R(
      "div",
      { key: "expr", className: "mwater-visualization-text-palette-item", onMouseDown: this.handleAddExpr },
      R("i", { className: "fa fa-plus" }),
      " Field"
    )
  }

  renderModals() {
    return [
      R(ExprInsertModalComponent, {
        key: "exprInsertModal",
        ref: (c: ExprInsertModalComponent | null) => {
          this.exprInsertModal = c
        },
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        onInsert: this.handleInsertExpr,
        singleRowTable: this.props.singleRowTable
      }),
      R(ExprUpdateModalComponent, {
        key: "exprUpdateModal",
        ref: (c: ExprUpdateModalComponent | null) => {
          this.exprUpdateModal = c
        },
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        singleRowTable: this.props.singleRowTable
      })
    ]
  }

  refRichTextComponent = (c: RichTextComponent | null) => {
    this.editor = c
  }

  render() {
    const style: CSSProperties = {
      position: "relative"
    }

    style.width = this.props.width
    style.height = this.props.height

    return R(
      "div",
      null,
      this.renderModals(),
      R(RichTextComponent, {
        ref: this.refRichTextComponent,
        className: `mwater-visualization-text-widget-style-${this.props.design.style || "default"}`,
        style,
        items: this.props.design.items,
        onItemsChange: this.props.onDesignChange ? this.handleItemsChange : undefined,
        onItemClick: this.handleItemClick,
        itemsHtmlConverter: this.createItemsHtmlConverter(),
        includeHeadings: this.props.design.style === "default" || !this.props.design.style,
        extraPaletteButtons: this.renderExtraPaletteButtons()
      })
    )
  }
}
