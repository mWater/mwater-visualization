PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
R = React.createElement

DraggableBlockComponent = require "./DraggableBlockComponent"

module.exports = class HorizontalBlockComponent extends React.Component
  @propTypes:
    block: PropTypes.object.isRequired
    renderBlock: PropTypes.func.isRequired
    onBlockDrop: PropTypes.func   # Called with (sourceBlock, targetBlock, side) when block is dropped on it. side is top, left, bottom, right
    onBlockRemove: PropTypes.func # Called with (block) when block is removed
    onBlockUpdate: PropTypes.func # Called with (block) when block is updated

  constructor: (props) ->
    super(props)

    @state = {
      dragIndex: null       # index of splitter being dragged
      dragInitialX: null    # Initial drag x
      dragXOffset: null     # Offset of drag (pixels dragged from start)
      leftSize: null
      rightSize: null
    }

    @blockRefs = {}

  componentWillUnmount: ->
    # Remove listeners
    document.removeEventListener("mousemove", @handleMouseMove)
    document.removeEventListener("mouseup", @handleMouseUp)
    
  handleMouseDown: (index, ev) =>
    # Prevent html5 drag
    ev.preventDefault()

    # Get sizes of two blocks
    @setState(dragIndex: index, leftSize: @blockRefs["block#{index}"].offsetWidth, rightSize: @blockRefs["block#{index + 1}"].offsetWidth)

    document.addEventListener("mousemove", @handleMouseMove)
    document.addEventListener("mouseup", @handleMouseUp)

  handleMouseMove: (ev) =>
    if not @state.dragInitialX
      @setState(dragInitialX: ev.clientX)
      return
  
    dragXOffset = ev.clientX - @state.dragInitialX

    # Can't make left block too small
    if dragXOffset < -@state.leftSize + 100
      dragXOffset = -@state.leftSize + 100

    # Can't make right block too small
    if dragXOffset > @state.rightSize - 100
      dragXOffset = @state.rightSize - 100

    @setState(dragXOffset: dragXOffset)

  handleMouseUp: (ev) =>
    # Remove listeners
    document.removeEventListener("mousemove", @handleMouseMove)
    document.removeEventListener("mouseup", @handleMouseUp)

    # Determine weights of two blocks
    weights = (@props.block.weights or [])
    newLeftSize = @state.leftSize + @state.dragXOffset
    newRightSize = @state.rightSize - @state.dragXOffset

    # Get current weights
    leftWeight = (weights[@state.dragIndex] or 1)
    rightWeight = (weights[@state.dragIndex + 1] or 1)

    weights[@state.dragIndex] = (leftWeight + rightWeight) * newLeftSize / (newLeftSize + newRightSize) 
    weights[@state.dragIndex + 1] = (leftWeight + rightWeight) * newRightSize / (newLeftSize + newRightSize) 

    block = _.extend({}, @props.block, weights: weights)
    @props.onBlockUpdate(block)

    @setState(dragIndex: null, dragInitialX: null, dragXOffset: null)

  render: ->
    # Calculate widths (percentages)
    totalWeight = 0
    for index in [0...@props.block.blocks.length]
      weight = (@props.block.weights or [])[index] or 1
      totalWeight += (@props.block.weights or [])[index] or 1

    percentages = []
    for index in [0...@props.block.blocks.length]
      weight = (@props.block.weights or [])[index] or 1
      percentages[index] = (weight * 100) / totalWeight

    if @props.onBlockUpdate?
      elem = R 'table', style: { width: "100%", tableLayout: "fixed", position: "relative", paddingTop: 5 }, className: "mwater-visualization-horizontal-block", # Add padding to allow dropping
        R 'tbody', null,
          R 'tr', null,
            _.map @props.block.blocks, (block, index) =>
              [
                if index > 0 and @props.onBlockUpdate?
                  R 'td', 
                    style: { width: 5, position: "relative", left: @state.dragXOffset }
                    key: "splitter#{index}"
                    className: "mwater-visualization-horizontal-block-splitter #{if index - 1 == @state.dragIndex then "active" else ""}"
                    onMouseDown: @handleMouseDown.bind(null, index - 1)
                R 'td', 
                  style: { width: "#{percentages[index]}%", verticalAlign: "top" }, 
                  key: block.id, 
                  ref: ((c) => @blockRefs["block#{index}"] = c),
                    @props.renderBlock(block)
              ]              

      # Allow dropping
      elem = R DraggableBlockComponent, 
        block: @props.block
        onBlockDrop: @props.onBlockDrop,
          elem

      return elem

    else  # Simplify in this case for printing
      return R 'div', className: "mwater-visualization-horizontal-block",
        _.map @props.block.blocks, (block, index) =>
          [
            R 'div', 
              style: { width: "#{percentages[index]}%", verticalAlign: "top", display: "inline-block" }, 
              key: block.id, 
              ref: ((c) => @blockRefs["block#{index}"] = c),
              className: "mwater-visualization-horizontal-block-item",
                @props.renderBlock(block)
          ]              


  # handleAspectMouseDown: (ev) =>
  #   # Get height of overall block
  #   @setState(aspectDragY: ev.currentTarget.parentElement.offsetHeight, initialAspectDragY: ev.currentTarget.parentElement.offsetHeight)

  #   document.addEventListener("mousemove", @handleMouseMove)
  #   document.addEventListener("mouseup", @handleMouseUp)

  # handleMouseMove: (ev) =>
  #   if @state.initialClientY?
  #     aspectDragY = @state.initialAspectDragY + ev.clientY - @state.initialClientY
  #     if aspectDragY > 20
  #       @setState(aspectDragY: aspectDragY)
  #   else
  #     @setState(initialClientY: ev.clientY)

  # handleMouseUp: (ev) =>
  #   # Remove listeners
  #   document.removeEventListener("mousemove", @handleMouseMove)
  #   document.removeEventListener("mouseup", @handleMouseUp)

  #   # Fire new aspect ratio
  #   @props.onAspectRatioChange(@props.aspectRatio / (@state.aspectDragY / @state.initialAspectDragY))
  #   @setState(aspectDragY: null, initialAspectDragY: null, initialClientY: null)

  # renderAspectDrag: ->
  #   if @state.aspectDragY?
  #     lineStyle = { 
  #       position: "absolute"
  #       borderTop: "solid 3px #38D"
  #       top: @state.aspectDragY
  #       left: 0
  #       right: 0
  #     }
  #     return R 'div', style: lineStyle, key: "aspectDrag"
  #   else
  #     return null
  
  # render: ->
  #   elem = R 'div', className: "mwater-visualization-decorated-block", style: @props.style,
  #     @props.children
    
  #     @renderAspectDrag()

  #     if not @props.isDragging and @props.connectMoveHandle?
  #       @props.connectMoveHandle(R 'div', key: "move", className: "mwater-visualization-decorated-block-move",
  #         R 'i', className: "fa fa-arrows")

  #     if not @props.isDragging and @props.onBlockRemove?
  #       R 'div', key: "remove", className: "mwater-visualization-decorated-block-remove", onClick: @props.onBlockRemove,
  #         R 'i', className: "fa fa-times"

  #     if not @props.isDragging and @props.onAspectRatioChange?
  #       # TODO sometimes drags (onDragStart) and so doesn't work. Disable dragging?
  #       R 'div', key: "aspect", className: "mwater-visualization-decorated-block-aspect", onMouseDown: @handleAspectMouseDown,
  #         R 'i', className: "fa fa-arrows-v"

  #     if not @props.isDragging and @props.connectResizeHandle?
  #       @props.connectResizeHandle(R 'div', key: "resize", className: "mwater-visualization-decorated-block-resize",
  #         R 'i', className: "fa fa-expand fa-rotate-90")

  #   if @props.connectDragPreview
  #     elem = @props.connectDragPreview(elem)

  #   return elem

