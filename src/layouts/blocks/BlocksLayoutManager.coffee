_ = require 'lodash'
React = require 'react'
R = React.createElement
uuid = require 'uuid'

LayoutManager = require '../LayoutManager'

module.exports = class BlocksLayoutManager extends LayoutManager
  # Renders the layout as a react element
  # options:
  #  width: width of layout (ignored here) TODO use for printing? standardWidth?
  #  items: opaque items object that layout manager understands
  #  onItemsChange: Called when items changes
  #  renderWidget: called with ({ id:, type:, design:, onDesignChange:, width:, height:  })
  #  style: style to use for layout. null for default
  #  disableMaps: true to disable maps
  #  clipboard: clipboard contents
  #  onClipboardChange: called when clipboard is changed
  #  cantPasteMesssage: message to display if clipboard can't be pasted into current dashboard
  renderLayout: (options) ->
    BlocksDisplayComponent = require './BlocksDisplayComponent'
    return R BlocksDisplayComponent,
      items: options.items or { id: "root", type: "root", blocks: [] }
      onItemsChange: options.onItemsChange
      style: options.style
      renderWidget: options.renderWidget
      disableMaps: options.disableMaps
      clipboard: options.clipboard
      onClipboardChange: options.onClipboardChange
      cantPasteMessage: options.cantPasteMessage

  # Tests if dashboard has any items
  isEmpty: (items) ->
    return not items or items.blocks?.length == 0

  # Gets { type, design } of a widget
  getWidgetTypeAndDesign: (items, widgetId) -> 
    if items.type == "widget" and items.id == widgetId
      return { type: items.widgetType, design: items.design }

    if items.blocks
      for block in items.blocks
        value = @getWidgetTypeAndDesign(block, widgetId)
        if value
          return value
        
    return null

  # Gets all widgets in items as array of { id, type, design }
  getAllWidgets: (items) ->
    if items.type == "widget" 
      return [{ id: items.id, type: items.widgetType, design: items.design }]

    if items.blocks
      return _.flatten(_.map(items.blocks, (item) => @getAllWidgets(item)))
      
    return []

  # Add a widget, returning new items
  addWidget: (items, widgetType, widgetDesign) ->
    # Add to root block
    items = items or { type: "root", id: "root", blocks: [] }
    items.blocks.push({ type: "widget", id: uuid(), widgetType: widgetType, design: widgetDesign, aspectRatio: 1.4 })

    return items
