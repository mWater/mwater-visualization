import { ReactElement, ReactNode } from "react"
import { BlocksLayoutOptions } from "../dashboards/layoutOptions"

/** Responsible for laying out items, rendering widgets and holding them in a data structure that is layout manager specific */
export default class LayoutManager {
  /** Renders the layout as a react element */
  renderLayout(options: {
    /** width of layout */
    width: number
    /** opaque items object that layout manager understands */
    items: any
    /** Called when items changes */
    onItemsChange: (items: any) => void

    /** called with ({ id:, type:, design:, onDesignChange:, width:, height:  }) */
    renderWidget: (options: {
      id: string
      type: string
      design: any
      onDesignChange: (design: any) => void
      width: number
      height: number
    }) => ReactElement

    /** style to use for layout. null for default */
    style: string | null

    /** layout options to use */
    layoutOptions: BlocksLayoutOptions | null

    /** true to disable maps */
    disableMaps?: boolean

    /** clipboard contents */
    clipboard: any

    /** called when clipboard is changed */
    onClipboardChange: (clipboard: any) => void

    /** message to display if clipboard can't be pasted into current dashboard */
    cantPasteMesssage: string
  }): ReactNode {
    return null
  }

  /** Tests if dashboard has any items */
  isEmpty(items: any): boolean {
    return true
  }

  /** Gets { type, design } of a widget */
  getWidgetTypeAndDesign(items: any, widgetId: string): { type: string; design: any } {
    throw new Error("Not implemented")
  }

  /** Gets all widgets in items as array of { id, type, design } */
  getAllWidgets(items: any): { id: string; type: string; design: any }[] {
    return []
  }

  static createLayoutManager(type: string): LayoutManager {
    // Default is old grid type
    type = type || "grid"

    switch (type) {
      case "grid": // Old one
        var GridLayoutManager = require("./grid/GridLayoutManager").default
        return new GridLayoutManager()
        break

      case "blocks": // New one
        var BlocksLayoutManager = require("./blocks/BlocksLayoutManager").default
        return new BlocksLayoutManager()
        break

      default:
        throw new Error(`Unknown layout manager type ${type}`)
    }
  }

  addWidget(items: any, widgetType: string, widgetDesign: any): any {
    throw new Error("Not implemented")
  }
}
