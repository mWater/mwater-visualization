React = require 'react'
H = React.DOM
DragSource = require('react-dnd').DragSource
DropTarget = require('react-dnd').DropTarget
DragDropContext = require('react-dnd').DragDropContext
HTML5Backend = require('react-dnd/modules/backends/HTML5')

# Render a child element as draggable, resizable block, injecting handle connectors
# to child element
class LayoutComponent extends React.Component
  @propTypes:
    dragInfo: React.PropTypes.object.isRequired  # Opaque information to be used when a block is dragged

  render: ->
    React.cloneElement(React.Children.only(@props.children), {
      connectMoveHandle: @props.connectMoveHandle
      connectResizeHandle: @props.connectResizeHandle      
      })

moveSpec = {
  beginDrag: (props, monitor, component) -> 
    return props.dragInfo
}

moveCollect = (connect, monitor) ->
  return { connectMoveHandle: connect.dragSource() }

MoveLayoutComponent = DragSource("block-move", moveSpec, moveCollect)(LayoutComponent)

resizeSpec = {
  beginDrag: (props, monitor, component) ->
    return props.dragInfo
}

resizeCollect = (connect, monitor) ->
  return { connectResizeHandle: connect.dragSource() }

MoveResizeLayoutComponent = DragSource("block-resize", resizeSpec, resizeCollect)(MoveLayoutComponent)

# Container contains layouts to layout
class Container extends React.Component
  @propTypes:
    layoutEngine: React.PropTypes.object.isRequired
    layouts: React.PropTypes.object.isRequired # Lookup of id -> layout
    elems: React.PropTypes.object.isRequired # Lookup of id -> elem
    width: React.PropTypes.number.isRequired # width in pixels
    height: React.PropTypes.number.isRequired # height in pixels
    connectDropTarget: React.PropTypes.func.isRequired # Injected by react-dnd wrapper
    onLayoutUpdate: React.PropTypes.func.isRequired # Called with array of { id, widget, layout }

  constructor: (props) ->
    super
    @state = { moveHover: null, resizeHover: null }

  setMoveHover: (hoverInfo) ->
    @setState(moveHover: hoverInfo)

  setResizeHover: (hoverInfo) -> 
    @setState(resizeHover: hoverInfo)

  dropLayout: (id, droppedRect) ->
    # Stop hover
    @setState(moveHover: null, resizeHover: null)

    # Convert rect to layout
    droppedLayout = @props.layoutEngine.rectToLayout(droppedRect)

    # Insert dropped layout
    layouts = _.clone(@props.layouts)
    layouts[id] = droppedLayout

    # Perform layout
    layouts = @props.layoutEngine.performLayout(layouts, id)

    @props.onLayoutUpdate(layouts)
  
  # Called when a block is dropped
  dropMoveLayout: (dropInfo) -> 
    # Get rectangle of dropped block
    droppedRect = {
      x: dropInfo.x
      y: dropInfo.y
      width: dropInfo.dragInfo.bounds.width   # width and height are from drop info
      height: dropInfo.dragInfo.bounds.height
    }

    @dropLayout(dropInfo.dragInfo.id, droppedRect)
  
  dropResizeLayout: (dropInfo) ->
    # Get rectangle of hovered block
    droppedRect = {
      x: dropInfo.dragInfo.bounds.x
      y: dropInfo.dragInfo.bounds.y
      width: dropInfo.width
      height: dropInfo.height
    }

    @dropLayout(dropInfo.dragInfo.id, droppedRect)

  componentWillReceiveProps: (nextProps) ->
    # Reset hover if not over
    if not nextProps.isOver
      # Defer to prevent "Cannot dispatch in the middle of a dispatch." error
      _.defer () =>
        @setState(moveHover: null, resizeHover: null)

  renderPlaceholder: (bounds) ->
    H.div key: "placeholder", style: { 
      position: "absolute", 
      left: bounds.x
      top: bounds.y
      width: bounds.width
      height: bounds.height
      border: "dashed 3px #AAA"
      borderRadius: 5
      padding: 5
      position: "absolute"
    }

  renderLayout: (id, layout) =>
    # Calculate bounds
    bounds = @props.layoutEngine.getLayoutBounds(layout)

    # Position absolutely
    style = { 
      position: "absolute"
      left: bounds.x
      top: bounds.y
    }

    # Create dragInfo which is all the info needed to drop the layout
    dragInfo = {
      id: id
      bounds: bounds
    }

    # Clone element, injecting width, height and enclosing in a dnd block
    return H.div style: style, key: id,
      React.createElement(MoveResizeLayoutComponent, { dragInfo: dragInfo }, 
        React.cloneElement(@props.elems[id], width: bounds.width, height: bounds.height))

  renderLayouts: ->
    renderElems = []

    # Get hovered block if present
    hoveredDragInfo = null
    hoveredLayout = null  # Layout of hovered block
    if @state.moveHover
      hoveredDragInfo = @state.moveHover.dragInfo
      hoveredRect = {
        x: @state.moveHover.x
        y: @state.moveHover.y
        width: @state.moveHover.dragInfo.bounds.width
        height: @state.moveHover.dragInfo.bounds.height
      }
      hoveredLayout = @props.layoutEngine.rectToLayout(hoveredRect)

    if @state.resizeHover
      hoveredDragInfo = @state.resizeHover.dragInfo
      hoveredRect = {
        x: @state.resizeHover.dragInfo.bounds.x
        y: @state.resizeHover.dragInfo.bounds.y
        width: @state.resizeHover.width
        height: @state.resizeHover.height
      }
      hoveredLayout = @props.layoutEngine.rectToLayout(hoveredRect)

    layouts = _.clone(@props.layouts)

    # Add hovered layout
    if hoveredDragInfo
      layouts[hoveredDragInfo.id] = hoveredLayout

    # Perform layout
    layouts = @props.layoutEngine.performLayout(layouts, if hoveredDragInfo then hoveredDragInfo.id)

    # Render blocks in their adjusted position
    for id, layout of layouts
      if not hoveredLayout or id != hoveredDragInfo.id
        renderElems.push(@renderLayout(id, layout))
      else
        renderElems.push(@renderPlaceholder(@props.layoutEngine.getLayoutBounds(hoveredLayout)))

    return renderElems

  render: ->
    style = {
      width: @props.width
      height: @props.height
      position: "relative"
    }

    # Connect as a drop target
    @props.connectDropTarget(
      H.div style: style, 
        @renderLayouts()
    )

targetSpec = {
  drop: (props, monitor, component) ->
    if monitor.getItemType() == "block-move"
      component.dropMoveLayout(
        dragInfo: monitor.getItem()
        x: monitor.getClientOffset().x - (monitor.getInitialClientOffset().x - monitor.getInitialSourceClientOffset().x)
        y: monitor.getClientOffset().y - (monitor.getInitialClientOffset().y - monitor.getInitialSourceClientOffset().y)
        )
    if monitor.getItemType() == "block-resize"
      component.dropResizeLayout({
        dragInfo: monitor.getItem()
        width: monitor.getItem().bounds.width + monitor.getDifferenceFromInitialOffset().x
        height: monitor.getItem().bounds.height + monitor.getDifferenceFromInitialOffset().y
        })
    return
  hover: (props, monitor, component) ->
    if monitor.getItemType() == "block-move"
      component.setMoveHover(
        dragInfo: monitor.getItem()
        x: monitor.getClientOffset().x - (monitor.getInitialClientOffset().x - monitor.getInitialSourceClientOffset().x)
        y: monitor.getClientOffset().y - (monitor.getInitialClientOffset().y - monitor.getInitialSourceClientOffset().y)
        )
    if monitor.getItemType() == "block-resize"
      component.setResizeHover({
        dragInfo: monitor.getItem()
        width: monitor.getItem().bounds.width + monitor.getDifferenceFromInitialOffset().x
        height: monitor.getItem().bounds.height + monitor.getDifferenceFromInitialOffset().y
        })
    return
}

targetCollect = (connect, monitor) ->
  return {
    connectDropTarget: connect.dropTarget()
    isOver: monitor.isOver()
    clientOffset: monitor.getClientOffset()
  }

module.exports = DragDropContainer = DragDropContext(HTML5Backend)(DropTarget(["block-move", "block-resize"], targetSpec, targetCollect)(Container))
