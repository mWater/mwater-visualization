import React from "react"
const R = React.createElement
import _ from "lodash"
import Widget from "./Widget"

export default class IFrameWidget extends Widget {
  // Creates a React element that is a view of the widget
  // options:
  //  schema: schema to use
  //  dataSource: data source to use
  //  widgetDataSource: Gives data to the widget in a way that allows client-server separation and secure sharing. See definition in WidgetDataSource.
  //  design: widget design
  //  scope: scope of the widget (when the widget self-selects a particular scope)
  //  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
  //  onScopeChange: called with scope of widget
  //  onDesignChange: called with new design. null/undefined for readonly
  //  width: width in pixels on screen
  //  height: height in pixels on screen
  //  singleRowTable: optional table name of table that will be filtered to have a single row present. Widget designer should optionally account for this
  createViewElement(options: any) {
    // Put here so IFrameWidget can be created on server
    const IFrameWidgetComponent = require("./IFrameWidgetComponent").default

    return R(IFrameWidgetComponent, {
      design: options.design,
      onDesignChange: options.onDesignChange,
      width: options.width,
      height: options.height
    })
  }

  // Determine if widget is auto-height, which means that a vertical height is not required.
  isAutoHeight() {
    return false
  }
}
