import PropTypes from "prop-types"
import React from "react"
const R = React.createElement
import _ from "lodash"
import TextComponent from "./TextComponent"
import TextWidget from "./TextWidget"
import AsyncLoadComponent from "react-library/lib/AsyncLoadComponent"
import { DataSource, Schema } from "mwater-expressions"

export interface TextWidgetComponentProps {
  design: any
  /** Called with new design. null/undefined for readonly */
  onDesignChange?: any
  filters?: any
  schema: Schema
  /** Data source to use for chart */
  dataSource: DataSource
  widgetDataSource: any
  width?: number
  height?: number
  /** Table that is filtered to have one row */
  singleRowTable?: string
  namedStrings?: any
}

// Widget which displays styled text with embedded expressions
export default class TextWidgetComponent extends AsyncLoadComponent<TextWidgetComponentProps> {
  constructor(props: any) {
    super(props)

    this.state = {
      // Map of expression id to expression value
      exprValues: {},
      error: null,
      cacheExpiry: props.dataSource.getCacheExpiry() // Save cache expiry to see if changes
    }
  }

  // Override to determine if a load is needed. Not called on mounting
  isLoadNeeded(newProps: any, oldProps: any) {
    // Get expression items recursively
    function getExprItems(items: any) {
      let exprItems = []
      for (let item of items || []) {
        if (item.type === "expr") {
          exprItems.push(item)
        }
        if (item.items) {
          exprItems = exprItems.concat(getExprItems(item.items))
        }
      }
      return exprItems
    }

    // Reload if filters or expressions have changed or cache expiry
    return (
      !_.isEqual(newProps.filters, oldProps.filters) ||
      !_.isEqual(getExprItems(newProps.design.items), getExprItems(oldProps.design.items)) ||
      newProps.dataSource.getCacheExpiry() !== this.state.cacheExpiry
    )
  }

  // Call callback with state changes
  load(props: any, prevProps: any, callback: any) {
    // Shortcut if no expressions in text widget
    const widget = new TextWidget()
    if (widget.getExprItems(props.design.items).length === 0) {
      callback({ error: null, exprValues: {} }, props.dataSource.getCacheExpiry())
      return
    }

    // Get data
    return props.widgetDataSource.getData(props.design, props.filters, (error: any, data: any) => {
      return callback({ error, exprValues: data || {}, cacheExpiry: props.dataSource.getCacheExpiry() })
    })
  }

  scrollToTOCEntry(entryId: any) {
    // Find entry in divComp
    const entries = this.divComp.querySelectorAll("h1,h2,h3,h4,h5,h6,h7,h8,h9")

    const entry = entries[entryId]
    if (entry) {
      return entry.scrollIntoView(true)
    }
  }

  render() {
    // If loading, don't display old values
    const exprValues = !this.state.loading ? this.state.exprValues : {}

    return R(
      "div",
      {
        ref: (c) => {
          return (this.divComp = c)
        }
      },
      R(TextComponent, {
        design: this.props.design,
        onDesignChange: this.props.onDesignChange,
        filters: this.props.filters,
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        exprValues,
        width: this.props.width,
        height: this.props.height,
        singleRowTable: this.props.singleRowTable,
        namedStrings: this.props.namedStrings
      })
    )
  }
}
