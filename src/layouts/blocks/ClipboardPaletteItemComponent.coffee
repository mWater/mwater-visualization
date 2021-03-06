_ = require 'lodash'
PropTypes = require('prop-types')
React = require 'react'
R = React.createElement
uuid = require 'uuid'

DragSourceComponent = require('../DragSourceComponent')("visualization-block")
DropTarget = require('react-dnd').DropTarget

# Clipboard item in a palette that has special properties
class ClipboardPaletteItemComponent extends React.Component
  @propTypes:
    clipboard: PropTypes.object
    onClipboardChange: PropTypes.func
    cantPasteMessage: PropTypes.string  # Set if can't paste current contents (usually because missing extra tables)

  createItem: =>
    # Add unique id
    return { block: _.extend({}, @props.clipboard, id: uuid()) }

  handleClear: =>
    if confirm("Clear clipboard?")
      @props.onClipboardChange(null)

  render: ->
    elem = @props.connectDropTarget(
      R 'div', 
        className: (if @props.clipboard and not @props.cantPasteMessage then "mwater-visualization-palette-item" else "mwater-visualization-palette-item disabled"), 
        style: (if @props.isOver then { backgroundColor: "#2485dd" }),
          R 'div', className: "title", key: "title",
            if @props.isOver then R('i', className: "fa fa-clone") else R('i', className: "fa fa-clipboard")
          R 'div', className: "subtitle", key: "subtitle",
            if @props.isOver then "Copy" else "Clipboard"
          if @props.cantPasteMessage
            R 'div', className: "tooltiptext", @props.cantPasteMessage
          else
            R 'div', className: "tooltiptext", 
              "Clipboard allows copying widgets for pasting on this dashboard or another dashboard. Drag a widget on to this clipboard to copy it."
          if @props.clipboard
            R 'div', className: "clearclipboard", onClick: @handleClear,
              R 'i', className: "fa fa-trash-o"
    )

    if @props.clipboard and not @props.cantPasteMessage
      elem = R DragSourceComponent, createDragItem: @createItem,
        elem
    return elem

blockTargetSpec =
  canDrop: (props, monitor) ->
    return true

  drop: (props, monitor, component) ->
    # Check that not from a nested one
    if monitor.didDrop()
      return

    props.onClipboardChange(monitor.getItem().block)
    return

collectTarget = (connect, monitor) ->
  return {
    connectDropTarget: connect.dropTarget()
    isOver: monitor.isOver({ shallow: true })
    canDrop: monitor.canDrop()
  }

module.exports = _.flow(DropTarget("visualization-block", blockTargetSpec, collectTarget))(ClipboardPaletteItemComponent)
