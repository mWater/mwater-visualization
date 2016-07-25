React = require 'react'
H = React.DOM
R = React.createElement

DraggableBlockComponent = require "./DraggableBlockComponent"


module.exports = class BlockRenderer
  # renders a block. Passed (options)
  #  block: block to render
  #  orientation: "horizontal" or "vertical"
  #  renderBlock: own function
  #  onBlockDrop: called with (sourceBlock, targetBlock, side) when block is dropped on it. side is top, left, bottom, right
  #  onBlockRemove: called with (block) when block is removed
  renderBlock: (options) =>
    block = options.block

    switch block.type
      when "root"
        return R RootBlockComponent, block: block, renderBlock: @renderBlock, onBlockDrop: options.onBlockDrop, onBlockRemove: options.onBlockRemove
      when "vertical"
        return R VerticalBlockComponent, block: block, renderBlock: @renderBlock, onBlockDrop: options.onBlockDrop, onBlockRemove: options.onBlockRemove
      when "horizontal"
        return R HorizontalBlockComponent, block: block, renderBlock: @renderBlock, onBlockDrop: options.onBlockDrop, onBlockRemove: options.onBlockRemove
      else
        return R OtherBlockComponent, block: block, onBlockDrop: options.onBlockDrop, onBlockRemove: options.onBlockRemove


class RootBlockComponent extends React.Component
  @propTypes:
    block: React.PropTypes.object.isRequired
    renderBlock: React.PropTypes.func.isRequired
    onBlockDrop: React.PropTypes.func.isRequired # Called with (sourceBlock, targetBlock, side) when block is dropped on it. side is top, left, bottom, right
    onBlockRemove: React.PropTypes.func.isRequired # Called with (block) when block is removed

  render: ->
    R DraggableBlockComponent, 
      block: @props.block
      onBlockDrop: @props.onBlockDrop
      onBlockRemove: @props.onBlockDrop
      canMove: false
      canRemove: false
      onlyBottom: true,
      H.div style: { padding: 10 },
        _.map @props.block.design.blocks, (block) =>
          @props.renderBlock({
            block: block
            orientation: "vertical"
            renderBlock: @props.renderBlock
            onBlockDrop: @props.onBlockDrop
            onBlockRemove: @props.onBlockRemove
          })


class VerticalBlockComponent extends React.Component
  @propTypes:
    block: React.PropTypes.object.isRequired
    renderBlock: React.PropTypes.func.isRequired
    onBlockDrop: React.PropTypes.func.isRequired # Called with (sourceBlock, targetBlock, side) when block is dropped on it. side is top, left, bottom, right
    onBlockRemove: React.PropTypes.func.isRequired # Called with (block) when block is removed

  render: ->
    R DraggableBlockComponent, 
      block: @props.block
      onBlockDrop: @props.onBlockDrop
      onBlockRemove: @props.onBlockDrop
      canMove: false
      canRemove: false,
      _.map @props.block.design.blocks, (block) =>
        @props.renderBlock({
          block: block
          orientation: "vertical"
          renderBlock: @props.renderBlock
          onBlockDrop: @props.onBlockDrop
          onBlockRemove: @props.onBlockRemove
        })


class HorizontalBlockComponent extends React.Component
  @propTypes:
    block: React.PropTypes.object.isRequired
    renderBlock: React.PropTypes.func.isRequired
    onBlockDrop: React.PropTypes.func.isRequired # Called with (sourceBlock, targetBlock, side) when block is dropped on it. side is top, left, bottom, right
    onBlockRemove: React.PropTypes.func.isRequired # Called with (block) when block is removed

  render: ->
    R DraggableBlockComponent, 
      block: @props.block
      onBlockDrop: @props.onBlockDrop
      onBlockRemove: @props.onBlockDrop
      canMove: false
      canRemove: false,
      H.table style: { width: "100%" },
        H.tbody null,
          H.tr null,
            _.map @props.block.design.blocks, (block) =>
              H.td style: { width: "#{100/@props.block.design.blocks.length}%", verticalAlign: "top" }, key: block.id,
                @props.renderBlock({
                  block: block
                  orientation: "horizontal"
                  renderBlock: @props.renderBlock
                  onBlockDrop: @props.onBlockDrop
                  onBlockRemove: @props.onBlockRemove
                })

class OtherBlockComponent extends React.Component
  @propTypes:
    block: React.PropTypes.object.isRequired
    onBlockDrop: React.PropTypes.func.isRequired # Called with (sourceBlock, targetBlock, side) when block is dropped on it. side is top, left, bottom, right
    onBlockRemove: React.PropTypes.func.isRequired # Called with (block) when block is removed

  render: ->
    R DraggableBlockComponent, 
      block: @props.block
      onBlockDrop: @props.onBlockDrop
      onBlockRemove: @props.onBlockDrop
      canMove: true
      canRemove: true,
        H.div style: { height: 50, backgroundColor: "#EEE" },
          JSON.stringify(@props.block)
