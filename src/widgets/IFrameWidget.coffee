React = require 'react'
H = React.DOM
R = React.createElement
_ = require 'lodash'

Widget = require './Widget'

module.exports = class IFrameWidget extends Widget
  # Creates a React element that is a view of the widget 
  # options:
  #  schema: schema to use
  #  dataSource: data source to use
  #  widgetDataSource: Gives data to the widget in a way that allows client-server separation and secure sharing. See definition in WidgetDataSource.
  #  design: widget design
  #  scope: scope of the widget (when the widget self-selects a particular scope)
  #  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
  #  onScopeChange: called with scope of widget
  #  onDesignChange: called with new design. null/undefined for readonly
  #  width: width in pixels on screen
  #  height: height in pixels on screen
  #  standardWidth: standard width of the widget in pixels. If greater than width, widget should scale up, if less, should scale down.
  #  singleRowTable: optional table name of table that will be filtered to have a single row present. Widget designer should optionally account for this
  createViewElement: (options) ->
    # Put here so IFrameWidget can be created on server
    IFrameWidgetComponent = require './IFrameWidgetComponent'
    
    return R IFrameWidgetComponent,
      design: options.design
      onDesignChange: options.onDesignChange
      width: options.width
      height: options.height

  # Determine if widget is auto-height, which means that a vertical height is not required.
  isAutoHeight: -> false
