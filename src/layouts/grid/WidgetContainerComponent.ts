// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import PropTypes from "prop-types"
import React from "react"
import ReactDOM from "react-dom"
import _ from "lodash"
const R = React.createElement
import { DragSource } from "react-dnd"
import { DropTarget } from "react-dnd"
import DecoratedBlockComponent from "../DecoratedBlockComponent"

// Render a child element as draggable, resizable block, injecting handle connectors
// to child element
class LayoutComponent extends React.Component {
  static initClass() {
    this.propTypes = {
      dragInfo: PropTypes.object.isRequired, // Opaque information to be used when a block is dragged
      canDrag: PropTypes.bool.isRequired
    }
    // True if draggable
  }

  render() {
    if (this.props.canDrag) {
      return React.cloneElement(React.Children.only(this.props.children), {
        connectMoveHandle: this.props.connectMoveHandle,
        connectResizeHandle: this.props.connectResizeHandle
      })
    } else {
      return this.props.children
    }
  }
}
LayoutComponent.initClass()

const moveSpec = {
  beginDrag(props: any, monitor: any, component: any) {
    return props.dragInfo
  },
  canDrag(props: any, monitor: any) {
    return props.canDrag
  }
}

function moveCollect(connect: any, monitor: any) {
  return {
    connectMoveHandle: connect.dragSource()
  }
}

const MoveLayoutComponent = DragSource("block-move", moveSpec, moveCollect)(LayoutComponent)

const resizeSpec = {
  beginDrag(props: any, monitor: any, component: any) {
    return props.dragInfo
  },
  canDrag(props: any, monitor: any) {
    return props.canDrag
  }
}

function resizeCollect(connect: any, monitor: any) {
  return {
    connectResizeHandle: connect.dragSource()
  }
}

const MoveResizeLayoutComponent = DragSource("block-resize", resizeSpec, resizeCollect)(MoveLayoutComponent)

// Container contains layouts to layout. It renders widgets at the correct location.
class Container extends React.Component {
  static initClass() {
    this.propTypes = {
      layoutEngine: PropTypes.object.isRequired,
      items: PropTypes.object.isRequired, // Lookup of id -> { widget:, layout: }
      onItemsChange: PropTypes.func, // Called with lookup of id -> { widget:, layout: }
      renderWidget: PropTypes.func.isRequired, // Renders a widget
      width: PropTypes.number.isRequired, // width in pixels
      connectDropTarget: PropTypes.func.isRequired
    }
    // Injected by react-dnd wrapper
  }

  constructor(props: any) {
    super(props)
    this.state = { moveHover: null, resizeHover: null }
  }

  setMoveHover(hoverInfo: any) {
    return this.setState({ moveHover: hoverInfo })
  }

  setResizeHover(hoverInfo: any) {
    return this.setState({ resizeHover: hoverInfo })
  }

  dropLayout(id: any, droppedRect: any, widget: any) {
    // Stop hover
    this.setState({ moveHover: null, resizeHover: null })

    // Convert rect to layout
    const droppedLayout = this.props.layoutEngine.rectToLayout(droppedRect)

    // Insert dropped layout
    let items = _.clone(this.props.items)
    items[id] = { layout: droppedLayout, widget }

    let layouts = {}
    for (id in items) {
      const item = items[id]
      layouts[id] = item.layout
    }

    // Perform layout
    layouts = this.props.layoutEngine.performLayout(layouts, id)

    // Update item layouts
    items = _.mapValues(items, (item, id) => {
      return _.extend({}, item, { layout: layouts[id] })
    })

    return this.props.onItemsChange(items)
  }

  // Called when a block is dropped
  dropMoveLayout(dropInfo: any) {
    // Get rectangle of dropped block
    const droppedRect = {
      x: dropInfo.x,
      y: dropInfo.y,
      width: dropInfo.dragInfo.bounds.width, // width and height are from drop info
      height: dropInfo.dragInfo.bounds.height
    }

    return this.dropLayout(dropInfo.dragInfo.id, droppedRect, dropInfo.dragInfo.widget)
  }

  dropResizeLayout(dropInfo: any) {
    // Get rectangle of hovered block
    const droppedRect = {
      x: dropInfo.dragInfo.bounds.x,
      y: dropInfo.dragInfo.bounds.y,
      width: dropInfo.width,
      height: dropInfo.height
    }

    return this.dropLayout(dropInfo.dragInfo.id, droppedRect, dropInfo.dragInfo.widget)
  }

  componentWillReceiveProps(nextProps: any) {
    // Reset hover if not over
    if (!nextProps.isOver && (this.state.moveHover || this.state.resizeHover)) {
      // Defer to prevent "Cannot dispatch in the middle of a dispatch." error
      return _.defer(() => {
        return this.setState({ moveHover: null, resizeHover: null })
      })
    }
  }

  handleRemove = (id: any) => {
    // Update item layouts
    const items = _.omit(this.props.items, id)
    return this.props.onItemsChange(items)
  }

  handleWidgetDesignChange = (id: any, widgetDesign: any) => {
    let { widget } = this.props.items[id]
    widget = _.extend({}, widget, { design: widgetDesign })

    let item = this.props.items[id]
    item = _.extend({}, item, { widget })

    const items = _.clone(this.props.items)
    items[id] = item

    return this.props.onItemsChange(items)
  }

  renderPlaceholder(bounds: any) {
    return R("div", {
      key: "placeholder",
      style: {
        position: "absolute",
        left: bounds.x,
        top: bounds.y,
        width: bounds.width,
        height: bounds.height,
        border: "dashed 3px #AAA",
        borderRadius: 5,
        padding: 5,
        position: "absolute"
      }
    })
  }

  // Render a particular layout. Allow visible to be false so that
  // dragged elements can retain state
  renderItem = (id: any, item: any, layout: any, visible = true) => {
    // Calculate bounds
    const bounds = this.props.layoutEngine.getLayoutBounds(layout)

    // Position absolutely
    const style = {
      position: "absolute",
      left: bounds.x,
      top: bounds.y
    }

    if (!visible) {
      style.display = "none"
    }

    // Create dragInfo which is all the info needed to drop the layout
    const dragInfo = {
      id,
      bounds,
      widget: item.widget
    }

    let elem = this.props.renderWidget({
      id,
      type: item.widget.type,
      design: item.widget.design,
      onDesignChange: this.props.onItemsChange != null ? this.handleWidgetDesignChange.bind(null, id) : undefined,
      width: bounds.width - 10,
      height: bounds.height - 10
    })

    // Render decorated if editable
    if (this.props.onItemsChange) {
      elem = React.createElement(
        DecoratedBlockComponent,
        // style: { width: bounds.width, height: bounds.height }
        { onBlockRemove: this.handleRemove.bind(null, id) },
        elem
      )
    } else {
      elem = R(
        "div",
        { className: "mwater-visualization-block-view" },
        // style: { width: bounds.width, height: bounds.height },
        elem
      )
    }

    // Clone element, injecting width, height and enclosing in a dnd block
    return R(
      "div",
      { style, key: id },
      React.createElement(MoveResizeLayoutComponent, { dragInfo, canDrag: this.props.onItemsChange != null }, elem)
    )
  }

  // Calculate a lookup of layouts incorporating hover info
  calculateLayouts(props: any, state: any) {
    // Get hovered block if present
    let hoveredRect, id
    let hoveredDragInfo = null
    let hoveredLayout = null // Layout of hovered block
    if (state.moveHover) {
      hoveredDragInfo = state.moveHover.dragInfo
      hoveredRect = {
        x: state.moveHover.x,
        y: state.moveHover.y,
        width: state.moveHover.dragInfo.bounds.width,
        height: state.moveHover.dragInfo.bounds.height
      }
      hoveredLayout = props.layoutEngine.rectToLayout(hoveredRect)
    }

    if (state.resizeHover) {
      hoveredDragInfo = state.resizeHover.dragInfo
      hoveredRect = {
        x: state.resizeHover.dragInfo.bounds.x,
        y: state.resizeHover.dragInfo.bounds.y,
        width: state.resizeHover.width,
        height: state.resizeHover.height
      }
      hoveredLayout = props.layoutEngine.rectToLayout(hoveredRect)
    }

    let layouts = {}
    for (id in props.items) {
      const item = props.items[id]
      layouts[id] = item.layout
    }

    // Add hovered layout
    if (hoveredDragInfo) {
      layouts[hoveredDragInfo.id] = hoveredLayout
    }

    // Perform layout
    layouts = props.layoutEngine.performLayout(layouts, hoveredDragInfo ? hoveredDragInfo.id : undefined)
    return layouts
  }

  renderItems(items: any) {
    let id
    const layouts = this.calculateLayouts(this.props, this.state)

    const renderElems = []
    const hover = this.state.moveHover || this.state.resizeHover

    // Render blocks in their adjusted position
    const ids = []
    for (id in items) {
      ids.push(id)
    }
    if (hover && !ids.includes(hover.dragInfo.id)) {
      ids.push(hover.dragInfo.id)
    }

    for (id of _.sortBy(ids)) {
      const item = items[id]
      if (!hover || id !== hover.dragInfo.id) {
        renderElems.push(this.renderItem(id, item, layouts[id]))
      } else {
        // Render it anyway so that its state is retained
        if (item) {
          renderElems.push(this.renderItem(id, item, layouts[id], false))
        }
        renderElems.push(this.renderPlaceholder(this.props.layoutEngine.getLayoutBounds(layouts[id])))
      }
    }

    return renderElems
  }

  // This gets called 100s of times when dragging
  shouldComponentUpdate(nextProps: any, nextState: any) {
    if (this.props.width !== nextProps.width) {
      return true
    }

    if (this.props.layoutEngine !== nextProps.layoutEngine) {
      return true
    }

    const layouts = this.calculateLayouts(this.props, this.state)
    const nextLayouts = this.calculateLayouts(nextProps, nextState)

    if (!_.isEqual(layouts, nextLayouts)) {
      return true
    }

    if (!_.isEqual(this.props.elems, nextProps.elems)) {
      return true
    }

    return false
  }

  render() {
    // Determine height using layout engine
    const style = {
      width: this.props.width,
      height: "100%", // @props.layoutEngine.calculateHeight(layouts)
      position: "relative"
    }

    // Connect as a drop target
    return this.props.connectDropTarget(R("div", { style }, this.renderItems(this.props.items)))
  }
}
Container.initClass()

const targetSpec = {
  drop(props: any, monitor: any, component: any) {
    if (monitor.getItemType() === "block-move") {
      const rect = ReactDOM.findDOMNode(component).getBoundingClientRect()
      component.dropMoveLayout({
        dragInfo: monitor.getItem(),
        x:
          monitor.getClientOffset().x -
          (monitor.getInitialClientOffset().x - monitor.getInitialSourceClientOffset().x) -
          rect.left,
        y:
          monitor.getClientOffset().y -
          (monitor.getInitialClientOffset().y - monitor.getInitialSourceClientOffset().y) -
          rect.top
      })
    }
    if (monitor.getItemType() === "block-resize") {
      component.dropResizeLayout({
        dragInfo: monitor.getItem(),
        width: monitor.getItem().bounds.width + monitor.getDifferenceFromInitialOffset().x,
        height: monitor.getItem().bounds.height + monitor.getDifferenceFromInitialOffset().y
      })
    }
  },
  hover(props: any, monitor: any, component: any) {
    if (monitor.getItemType() === "block-move") {
      const rect = ReactDOM.findDOMNode(component).getBoundingClientRect()
      component.setMoveHover({
        dragInfo: monitor.getItem(),
        x:
          monitor.getClientOffset().x -
          (monitor.getInitialClientOffset().x - monitor.getInitialSourceClientOffset().x) -
          rect.left,
        y:
          monitor.getClientOffset().y -
          (monitor.getInitialClientOffset().y - monitor.getInitialSourceClientOffset().y) -
          rect.top
      })
    }
    if (monitor.getItemType() === "block-resize") {
      component.setResizeHover({
        dragInfo: monitor.getItem(),
        width: monitor.getItem().bounds.width + monitor.getDifferenceFromInitialOffset().x,
        height: monitor.getItem().bounds.height + monitor.getDifferenceFromInitialOffset().y
      })
    }
  }
}

function targetCollect(connect: any, monitor: any) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    clientOffset: monitor.getClientOffset()
  }
}

export default DropTarget(["block-move", "block-resize"], targetSpec, targetCollect)(Container)
