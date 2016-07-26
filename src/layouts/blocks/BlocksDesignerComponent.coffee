React = require 'react'
H = React.DOM
R = React.createElement

HTML5Backend = require('react-dnd-html5-backend')
NestableDragDropContext = require  "react-library/lib/NestableDragDropContext"

DraggableBlockComponent = require "./DraggableBlockComponent"
DecoratedBlockComponent = require './DecoratedBlockComponent'

BlockPaletteComponent = require './BlockPaletteComponent'
blockUtils = require './blockUtils'

AutoSizeComponent = require('react-library/lib/AutoSizeComponent')

class BlocksDesignerComponent extends React.Component
  @propTypes:
    design: React.PropTypes.object.isRequired
    onDesignChange: React.PropTypes.func.isRequired

    # Renders a widget. Passed (options)
    #  type: type of the widget
    #  design: design of the widget
    #  width: width to render. null for auto
    #  height: height to render. null for auto
    renderWidget: React.PropTypes.func.isRequired

  handleBlockDrop: (sourceBlock, targetBlock, side) =>
    # Remove source
    design = blockUtils.removeBlock(@props.design, sourceBlock)
    design = blockUtils.dropBlock(design, sourceBlock, targetBlock, side)
    @props.onDesignChange(design)

  handleBlockRemove: (block) =>
    design = blockUtils.removeBlock(@props.design, block)
    @props.onDesignChange(design)

  renderBlock: (block) =>
    switch block.type
      when "root"
        return R RootBlockComponent, block: block, renderBlock: @renderBlock, onBlockDrop: @handleBlockDrop, onBlockRemove: @handleBlockRemove
      when "vertical"
        return R VerticalBlockComponent, block: block, renderBlock: @renderBlock, onBlockDrop: @handleBlockDrop, onBlockRemove: @handleBlockRemove
      when "horizontal"
        return R HorizontalBlockComponent, block: block, renderBlock: @renderBlock, onBlockDrop: @handleBlockDrop, onBlockRemove: @handleBlockRemove
      when "widget"
        return R DraggableBlockComponent, 
          block: block
          onBlockDrop: @handleBlockDrop,
            R DecoratedBlockComponent, 
              onBlockRemove: @handleBlockDrop.bind(null, block),
                R AutoSizeComponent, { injectWidth: true }, 
                  (size) =>
                    @props.renderWidget(type: block.widgetType, design: block.design, width: size.width, height: size.width * 0.8)

  renderPalette: ->
    H.td key: "palette", style: { width: "1%", verticalAlign: "top", height: "100%" }, 
      H.div className: "mwater-visualization-block-palette", style: { height: "100%" },
        R BlockPaletteComponent, block: { type: "text" },
          H.div className: "mwater-visualization-block-palette-item",
            H.div className: "icon",
              H.i className: "fa fa-font"
            H.div className: "title",
              "Text"
        R BlockPaletteComponent, block: { type: "image" },
          H.div className: "mwater-visualization-block-palette-item",
            H.div className: "icon",
              H.i className: "fa fa-picture-o"
            H.div className: "title",
              "Image"
        R BlockPaletteComponent, block: { type: "chart" },
          H.div className: "mwater-visualization-block-palette-item",
            H.div className: "icon",
              H.i className: "fa fa-bar-chart"
            H.div className: "title",
              "Chart"

  render: ->
    H.table style: { width: "100%", height: "100%" },
      H.tbody null,
        H.tr null,
          @renderPalette()
          H.td key: "design", style: { verticalAlign: "top", height: "100%" },
            @renderBlock(@props.design)

module.exports = NestableDragDropContext(HTML5Backend)(BlocksDesignerComponent)

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
            @props.renderBlock(block)


class VerticalBlockComponent extends React.Component
  @propTypes:
    block: React.PropTypes.object.isRequired
    renderBlock: React.PropTypes.func.isRequired
    onBlockDrop: React.PropTypes.func.isRequired # Called with (sourceBlock, targetBlock, side) when block is dropped on it. side is top, left, bottom, right
    onBlockRemove: React.PropTypes.func.isRequired # Called with (block) when block is removed

  render: ->
    H.div null,
      _.map @props.block.design.blocks, (block) =>
        @props.renderBlock(block)


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
              @props.renderBlock(block)
