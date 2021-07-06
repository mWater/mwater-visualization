export default class LayoutManager {
  // Renders the layout as a react element
  // options:
  //  width: width of layout
  //  items: opaque items object that layout manager understands
  //  onItemsChange: Called when items changes
  //  renderWidget: called with ({ id:, type:, design:, onDesignChange:, width:, height:  })
  //  style: style to use for layout. null for default
  //  layoutOptions: layout options to use
  //  disableMaps: true to disable maps
  renderLayout(options: any) {
    return null
  }

  // Tests if dashboard has any items
  isEmpty(items: any) {
    return true
  }

  // Gets { type, design } of a widget
  getWidgetTypeAndDesign(items: any, widgetId: any) {
    return null
  }

  // Gets all widgets in items as array of { id, type, design }
  getAllWidgets(items: any) {
    return []
  }

  static createLayoutManager(type: any) {
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

    return {
      addWidget(items: any, widgetType: any, widgetDesign: any) {
        throw new Error("Not implemented")
      }
    }
  }
}
