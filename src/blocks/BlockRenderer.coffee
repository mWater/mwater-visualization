React = require 'react'
H = React.DOM
R = React.createElement

DraggableBlockComponent = require "./DraggableBlockComponent"
DecoratedBlockComponent = require './DecoratedBlockComponent'

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
      when "text"
        return R TextBlockComponent, block: block, onBlockDrop: options.onBlockDrop, onBlockRemove: options.onBlockRemove
      when "image"
        return R ImageBlockComponent, block: block, onBlockDrop: options.onBlockDrop, onBlockRemove: options.onBlockRemove


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
      style: { height: "100%" }
      onlyBottom: true,
        H.div style: { padding: 10, height: "100%" },
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
    H.div null,
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

class TextBlockComponent extends React.Component
  @propTypes:
    block: React.PropTypes.object.isRequired
    onBlockDrop: React.PropTypes.func.isRequired # Called with (sourceBlock, targetBlock, side) when block is dropped on it. side is top, left, bottom, right
    onBlockRemove: React.PropTypes.func.isRequired # Called with (block) when block is removed

  render: ->
    R DraggableBlockComponent, 
      block: @props.block
      onBlockDrop: @props.onBlockDrop,
        R DecoratedBlockComponent, 
          onBlockRemove: @props.onBlockRemove.bind(null, @props.block),
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

class ImageBlockComponent extends React.Component
  @propTypes:
    block: React.PropTypes.object.isRequired
    onBlockDrop: React.PropTypes.func.isRequired # Called with (sourceBlock, targetBlock, side) when block is dropped on it. side is top, left, bottom, right
    onBlockRemove: React.PropTypes.func.isRequired # Called with (block) when block is removed

  render: ->
    R DraggableBlockComponent, 
      block: @props.block
      onBlockDrop: @props.onBlockDrop,
        R DecoratedBlockComponent, 
          style: { textAlign: "center" }
          onBlockRemove: @props.onBlockRemove.bind(null, @props.block),
          H.img src: "https://realfood.tesco.com/media/images/Orange-and-almond-srping-cake-hero-58d07750-0952-47eb-bc41-a1ef9b81c01a-0-472x310.jpg", style: { height: 150 }