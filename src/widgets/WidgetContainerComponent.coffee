React = require 'react'
ReactDOM = require 'react-dom'
_ = require 'lodash'
H = React.DOM
DragSource = require('react-dnd').DragSource
DropTarget = require('react-dnd').DropTarget
DragDropContext = require('react-dnd').DragDropContext
HTML5Backend = require('react-dnd-html5-backend')

# Render a child element as draggable, resizable block, injecting handle connectors
# to child element
class LayoutComponent extends React.Component
  @propTypes:
    dragInfo: React.PropTypes.object.isRequired  # Opaque information to be used when a block is dragged
    canDrag: React.PropTypes.bool.isRequired     # True if draggable

  render: ->
    if @props.canDrag
      return React.cloneElement(React.Children.only(@props.children), {
        connectMoveHandle: @props.connectMoveHandle
        connectResizeHandle: @props.connectResizeHandle      
        })
    else
      return @props.children

moveSpec = {
  beginDrag: (props, monitor, component) -> 
    return props.dragInfo
  canDrag: (props, monitor) ->
    return props.canDrag
}

moveCollect = (connect, monitor) ->
  return { connectMoveHandle: connect.dragSource() }

MoveLayoutComponent = DragSource("block-move", moveSpec, moveCollect)(LayoutComponent)

resizeSpec = {
  beginDrag: (props, monitor, component) ->
    return props.dragInfo
  canDrag: (props, monitor) ->
    return props.canDrag
}

resizeCollect = (connect, monitor) ->
  return { connectResizeHandle: connect.dragSource() }

MoveResizeLayoutComponent = DragSource("block-resize", resizeSpec, resizeCollect)(MoveLayoutComponent)

# Container contains layouts to layout. It clones elems, injecting width, height and standardWidth into them before rendering them at the correct location.
class Container extends React.Component
  @propTypes:
    layoutEngine: React.PropTypes.object.isRequired
    layouts: React.PropTypes.object.isRequired # Lookup of id -> layout
    elems: React.PropTypes.object.isRequired # Lookup of id -> elem
    width: React.PropTypes.number.isRequired # width in pixels
    standardWidth: React.PropTypes.number.isRequired # width in pixels of a standard container that all other widths should scale to look like. Usually 1440
    connectDropTarget: React.PropTypes.func.isRequired # Injected by react-dnd wrapper
    onLayoutUpdate: React.PropTypes.func # Called with array of { id, widget, layout }. Null/undefined for readonly

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
    if not nextProps.isOver and (@state.moveHover or @state.resizeHover)
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

  # Render a particular layout. Allow visible to be false so that 
  # dragged elements can retain state
  renderLayout: (id, layout, visible=true) =>
    # Calculate bounds
    bounds = @props.layoutEngine.getLayoutBounds(layout)

    # Position absolutely
    style = { 
      position: "absolute"
      left: bounds.x
      top: bounds.y
    }

    if not visible
      style.display = "none"

    # Create dragInfo which is all the info needed to drop the layout
    dragInfo = {
      id: id
      bounds: bounds
    }

    # Clone element, injecting width, height, standardWidth and enclosing in a dnd block
    return H.div style: style, key: id,
      React.createElement(MoveResizeLayoutComponent, { dragInfo: dragInfo, canDrag: @props.onLayoutUpdate? }, 
        React.cloneElement(@props.elems[id], width: bounds.width, height: bounds.height, standardWidth: (bounds.width / @props.width) * @props.standardWidth))

  # Calculate a lookup of layouts incorporating hover info
  calculateLayouts: (props, state) ->
    # Get hovered block if present
    hoveredDragInfo = null
    hoveredLayout = null  # Layout of hovered block
    if state.moveHover
      hoveredDragInfo = state.moveHover.dragInfo
      hoveredRect = {
        x: state.moveHover.x
        y: state.moveHover.y
        width: state.moveHover.dragInfo.bounds.width
        height: state.moveHover.dragInfo.bounds.height
      }
      hoveredLayout = props.layoutEngine.rectToLayout(hoveredRect)

    if state.resizeHover
      hoveredDragInfo = state.resizeHover.dragInfo
      hoveredRect = {
        x: state.resizeHover.dragInfo.bounds.x
        y: state.resizeHover.dragInfo.bounds.y
        width: state.resizeHover.width
        height: state.resizeHover.height
      }
      hoveredLayout = props.layoutEngine.rectToLayout(hoveredRect)

    layouts = _.clone(props.layouts)

    # Add hovered layout
    if hoveredDragInfo
      layouts[hoveredDragInfo.id] = hoveredLayout

    # Perform layout
    layouts = props.layoutEngine.performLayout(layouts, if hoveredDragInfo then hoveredDragInfo.id)
    return layouts

  renderLayouts: (layouts) ->
    renderElems = []
    hover = @state.moveHover or @state.resizeHover

    # Render blocks in their adjusted position
    ids = []
    for id of layouts
      ids.push id
    for id in _.sortBy(ids)
      layout = layouts[id]
      if not hover or id != hover.dragInfo.id
        renderElems.push(@renderLayout(id, layout))
      else
        # Render it anyway so that its state is retained
        renderElems.push(@renderLayout(id, layout, false))
        renderElems.push(@renderPlaceholder(@props.layoutEngine.getLayoutBounds(layout)))

    return renderElems

  # This gets called 100s of times when dragging
  shouldComponentUpdate: (nextProps, nextState) ->
    if @props.width != nextProps.width
      return true

    if @props.layoutEngine != nextProps.layoutEngine
      return true

    layouts = @calculateLayouts(@props, @state)
    nextLayouts = @calculateLayouts(nextProps, nextState)

    if not _.isEqual(layouts, nextLayouts)
      return true

    if not _.isEqual(@props.elems, nextProps.elems)
      return true

    return false

  render: ->
    layouts = @calculateLayouts(@props, @state)

    # Determine height using layout engine
    style = {
      width: @props.width
      height: @props.layoutEngine.calculateHeight(layouts)
      position: "relative"
    }

    # Connect as a drop target
    @props.connectDropTarget(
      H.div style: style, 
        @renderLayouts(layouts)
    )

targetSpec = {
  drop: (props, monitor, component) ->
    if monitor.getItemType() == "block-move"
      rect = ReactDOM.findDOMNode(component).getBoundingClientRect()
      component.dropMoveLayout(
        dragInfo: monitor.getItem()
        x: monitor.getClientOffset().x - (monitor.getInitialClientOffset().x - monitor.getInitialSourceClientOffset().x) - rect.left
        y: monitor.getClientOffset().y - (monitor.getInitialClientOffset().y - monitor.getInitialSourceClientOffset().y) - rect.top
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
      rect = ReactDOM.findDOMNode(component).getBoundingClientRect()
      component.setMoveHover(
        dragInfo: monitor.getItem()
        x: monitor.getClientOffset().x - (monitor.getInitialClientOffset().x - monitor.getInitialSourceClientOffset().x) - rect.left
        y: monitor.getClientOffset().y - (monitor.getInitialClientOffset().y - monitor.getInitialSourceClientOffset().y) - rect.top
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
