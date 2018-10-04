PropTypes = require('prop-types')
React = require 'react'
ReactDOM = require 'react-dom'
_ = require 'lodash'
R = React.createElement
DragSource = require('react-dnd').DragSource
DropTarget = require('react-dnd').DropTarget
DragDropContext = require('react-dnd').DragDropContext
DecoratedBlockComponent = require '../DecoratedBlockComponent'

# Render a child element as draggable, resizable block, injecting handle connectors
# to child element
class LayoutComponent extends React.Component
  @propTypes:
    dragInfo: PropTypes.object.isRequired  # Opaque information to be used when a block is dragged
    canDrag: PropTypes.bool.isRequired     # True if draggable

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

# Container contains layouts to layout. It renders widgets at the correct location.
class Container extends React.Component
  @propTypes:
    layoutEngine: PropTypes.object.isRequired
    items: PropTypes.object.isRequired # Lookup of id -> { widget:, layout: }
    onItemsChange: PropTypes.func # Called with lookup of id -> { widget:, layout: }
    renderWidget: PropTypes.func.isRequired # Renders a widget
    width: PropTypes.number.isRequired # width in pixels
    standardWidth: PropTypes.number.isRequired # width in pixels of a standard container that all other widths should scale to look like. Usually 1440
    connectDropTarget: PropTypes.func.isRequired # Injected by react-dnd wrapper

  constructor: (props) ->
    super(props)
    @state = { moveHover: null, resizeHover: null }

  setMoveHover: (hoverInfo) ->
    @setState(moveHover: hoverInfo)

  setResizeHover: (hoverInfo) -> 
    @setState(resizeHover: hoverInfo)

  dropLayout: (id, droppedRect, widget) ->
    # Stop hover
    @setState(moveHover: null, resizeHover: null)

    # Convert rect to layout
    droppedLayout = @props.layoutEngine.rectToLayout(droppedRect)

    # Insert dropped layout
    items = _.clone(@props.items)
    items[id] = { layout: droppedLayout, widget: widget }

    layouts = {}
    for id, item of items
      layouts[id] = item.layout

    # Perform layout
    layouts = @props.layoutEngine.performLayout(layouts, id)

    # Update item layouts
    items = _.mapValues(items, (item, id) =>
      return _.extend({}, item, layout: layouts[id])
      )

    @props.onItemsChange(items)
  
  # Called when a block is dropped
  dropMoveLayout: (dropInfo) -> 
    # Get rectangle of dropped block
    droppedRect = {
      x: dropInfo.x
      y: dropInfo.y
      width: dropInfo.dragInfo.bounds.width   # width and height are from drop info
      height: dropInfo.dragInfo.bounds.height
    }

    @dropLayout(dropInfo.dragInfo.id, droppedRect, dropInfo.dragInfo.widget)
  
  dropResizeLayout: (dropInfo) ->
    # Get rectangle of hovered block
    droppedRect = {
      x: dropInfo.dragInfo.bounds.x
      y: dropInfo.dragInfo.bounds.y
      width: dropInfo.width
      height: dropInfo.height
    }

    @dropLayout(dropInfo.dragInfo.id, droppedRect, dropInfo.dragInfo.widget)

  componentWillReceiveProps: (nextProps) ->
    # Reset hover if not over
    if not nextProps.isOver and (@state.moveHover or @state.resizeHover)
      # Defer to prevent "Cannot dispatch in the middle of a dispatch." error
      _.defer () =>
        @setState(moveHover: null, resizeHover: null)

  handleRemove: (id) =>
    # Update item layouts
    items = _.omit(@props.items, id)
    @props.onItemsChange(items)

  handleWidgetDesignChange: (id, widgetDesign) =>
    widget = @props.items[id].widget
    widget = _.extend({}, widget, design: widgetDesign)

    item = @props.items[id]
    item = _.extend({}, item, widget: widget)

    items = _.clone(@props.items)
    items[id] = item

    @props.onItemsChange(items)

  renderPlaceholder: (bounds) ->
    R 'div', key: "placeholder", style: { 
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
  renderItem: (id, item, layout, visible=true) =>
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
      widget: item.widget
    }

    elem = @props.renderWidget({ 
      id: id
      type: item.widget.type
      design: item.widget.design
      onDesignChange: if @props.onItemsChange? then @handleWidgetDesignChange.bind(null, id)
      width: bounds.width - 10
      height: bounds.height - 10 
      standardWidth: ((bounds.width - 10) / @props.width) * @props.standardWidth 
    })

    # Render decorated if editable
    if @props.onItemsChange
      elem = React.createElement DecoratedBlockComponent,
        # style: { width: bounds.width, height: bounds.height }
        onBlockRemove: @handleRemove.bind(null, id),
          elem
    else
      elem = R 'div', className: "mwater-visualization-block-view",
        # style: { width: bounds.width, height: bounds.height },
        elem

    # Clone element, injecting width, height, standardWidth and enclosing in a dnd block
    return R 'div', style: style, key: id,
      React.createElement(MoveResizeLayoutComponent, { dragInfo: dragInfo, canDrag: @props.onItemsChange? }, 
        elem)

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

    layouts = {}
    for id, item of props.items
      layouts[id] = item.layout

    # Add hovered layout
    if hoveredDragInfo
      layouts[hoveredDragInfo.id] = hoveredLayout

    # Perform layout
    layouts = props.layoutEngine.performLayout(layouts, if hoveredDragInfo then hoveredDragInfo.id)
    return layouts

  renderItems: (items) ->
    layouts = @calculateLayouts(@props, @state)

    renderElems = []
    hover = @state.moveHover or @state.resizeHover

    # Render blocks in their adjusted position
    ids = []
    for id of items
      ids.push id
    if hover and hover.dragInfo.id not in ids
      ids.push hover.dragInfo.id

    for id in _.sortBy(ids)
      item = items[id]
      if not hover or id != hover.dragInfo.id
        renderElems.push(@renderItem(id, item, layouts[id]))
      else
        # Render it anyway so that its state is retained
        if item
          renderElems.push(@renderItem(id, item, layouts[id], false))
        renderElems.push(@renderPlaceholder(@props.layoutEngine.getLayoutBounds(layouts[id])))

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
    # Determine height using layout engine
    style = {
      width: @props.width
      height: "100%" # @props.layoutEngine.calculateHeight(layouts)
      position: "relative"
    }

    # Connect as a drop target
    @props.connectDropTarget(
      R 'div', style: style, 
        @renderItems(@props.items)
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

module.exports = DropTarget(["block-move", "block-resize"], targetSpec, targetCollect)(Container)
