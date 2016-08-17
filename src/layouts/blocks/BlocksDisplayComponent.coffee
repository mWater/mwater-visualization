_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement
uuid = require 'node-uuid'

HTML5Backend = require('react-dnd-html5-backend')
NestableDragDropContext = require  "react-library/lib/NestableDragDropContext"

DraggableBlockComponent = require "./DraggableBlockComponent"
DecoratedBlockComponent = require '../DecoratedBlockComponent'

PaletteItemComponent = require './PaletteItemComponent'
blockUtils = require './blockUtils'

AutoSizeComponent = require('react-library/lib/AutoSizeComponent')

class BlocksDisplayComponent extends React.Component
  @propTypes:
    items: React.PropTypes.object.isRequired
    onItemsChange: React.PropTypes.func

    # Renders a widget. Passed (options)
    #  id: id of widget
    #  type: type of the widget
    #  design: design of the widget
    #  onDesignChange: called with new design of widget
    #  width: width to render. null for auto
    #  height: height to render. null for auto
    renderWidget: React.PropTypes.func.isRequired

  handleBlockDrop: (sourceBlock, targetBlock, side) =>
    # Remove source
    items = blockUtils.removeBlock(@props.items, sourceBlock)
    items = blockUtils.dropBlock(items, sourceBlock, targetBlock, side)
    @props.onItemsChange(items)

  handleBlockRemove: (block) =>
    items = blockUtils.removeBlock(@props.items, block)
    @props.onItemsChange(items)

  renderBlock: (block) =>
    elem = null

    switch block.type
      when "root"
        return R RootBlockComponent, key: block.id, block: block, renderBlock: @renderBlock, onBlockDrop: @handleBlockDrop, onBlockRemove: @handleBlockRemove
      when "vertical"
        return R VerticalBlockComponent, key: block.id, block: block, renderBlock: @renderBlock, onBlockDrop: @handleBlockDrop, onBlockRemove: @handleBlockRemove
      when "horizontal"
        return R HorizontalBlockComponent, key: block.id, block: block, renderBlock: @renderBlock, onBlockDrop: @handleBlockDrop, onBlockRemove: @handleBlockRemove
      when "spacer"
        elem = R AutoSizeComponent, { injectWidth: true, key: block.id }, 
          (size) =>
            H.div id: block.id, style: {
              width: size.width
              height: if block.aspectRatio? then size.width / block.aspectRatio
            }

        if @props.onItemsChange
          elem = R DraggableBlockComponent, 
            key: block.id
            block: block
            onBlockDrop: @handleBlockDrop,
              R DecoratedBlockComponent, 
                key: block.id
                aspectRatio: block.aspectRatio
                onAspectRatioChange: if block.aspectRatio? then (aspectRatio) => @props.onItemsChange(blockUtils.updateBlock(@props.items, _.extend({}, block, aspectRatio: aspectRatio)))
                onBlockRemove: (if @props.onItemsChange then @handleBlockDrop.bind(null, block)),
                  elem
    
      when "widget"
        elem = R AutoSizeComponent, { injectWidth: true, key: block.id }, 
          (size) =>
            @props.renderWidget({
              id: block.id
              type: block.widgetType
              design: block.design
              onDesignChange: if @props.onItemsChange then (design) => @props.onItemsChange(blockUtils.updateBlock(@props.items, _.extend({}, block, design: design)))
              width: size.width
              height: if block.aspectRatio? then size.width / block.aspectRatio
            })

        if @props.onItemsChange
          elem = R DraggableBlockComponent, 
            key: block.id
            block: block
            onBlockDrop: @handleBlockDrop,
              R DecoratedBlockComponent, 
                key: block.id
                aspectRatio: block.aspectRatio
                onAspectRatioChange: if block.aspectRatio? then (aspectRatio) => @props.onItemsChange(blockUtils.updateBlock(@props.items, _.extend({}, block, aspectRatio: aspectRatio)))
                onBlockRemove: (if @props.onItemsChange then @handleBlockDrop.bind(null, block)),
                  elem
      else
        throw new Error("Unknown block type #{block.type}")

    # Wrap block in padding
    return H.div style: { paddingLeft: 15, paddingRight: 15, paddingBottom: 15 },
      elem

  createBlockItem: (block) ->
    # Add unique id
    return () -> { block: _.extend({}, block, id: uuid.v4()) }

  renderPalette: ->
    H.td key: "palette", style: { width: 102, verticalAlign: "top", height: "100%" }, 
      H.div className: "mwater-visualization-palette", style: { height: "100%" },
        R PaletteItemComponent, 
          createItem: @createBlockItem({ type: "widget", widgetType: "Text", design: { style: "title" } })
          title: H.i className: "fa fa-font"
          subtitle: "Title"
        R PaletteItemComponent, 
          createItem: @createBlockItem({ type: "widget", widgetType: "Text", design: {} })
          title: H.i className: "fa fa-align-left"
          subtitle: "Text"
        R PaletteItemComponent,
          createItem: @createBlockItem({ type: "widget", aspectRatio: 1.4, widgetType: "Image", design: {} })
          title: H.i className: "fa fa-picture-o"
          subtitle: "Image"
        R PaletteItemComponent,
          createItem: @createBlockItem({ type: "widget", aspectRatio: 1.4, widgetType: "LayeredChart", design: {} })
          title: H.i className: "fa fa-bar-chart"
          subtitle: "Chart"
        R PaletteItemComponent,
          createItem: @createBlockItem({ type: "widget", aspectRatio: 1.4, widgetType: "Map", design: { baseLayer: "bing_road", layerViews: [], filters: {}, bounds: { w: -40, n: 25, e: 40, s: -25 } } })
          title: H.i className: "fa fa-map-o"
          subtitle: "Map"
        R PaletteItemComponent,
          createItem: @createBlockItem({ type: "widget", aspectRatio: 1.4, widgetType: "TableChart", design: {} })
          title: H.i className: "fa fa-table"
          subtitle: "Table"
        R PaletteItemComponent,
          createItem: @createBlockItem({ type: "widget", aspectRatio: 1.4, widgetType: "CalendarChart", design: {} })
          title: H.i className: "fa fa-calendar"
          subtitle: "Calendar"
        R PaletteItemComponent,
          createItem: @createBlockItem({ type: "widget", aspectRatio: 1.4, widgetType: "ImageMosaicChart", design: {} })
          title: H.i className: "fa fa-th"
          subtitle: "Mosaic"
        R PaletteItemComponent,
          createItem: @createBlockItem({ type: "spacer", aspectRatio: 1.4 })
          title: H.i className: "fa fa-square-o"
          subtitle: "Spacer"
        R PaletteItemComponent,
          createItem: @createBlockItem({ type: "widget", aspectRatio: 16.0/9.0, widgetType: "IFrame", design: {} })
          title: H.i className: "fa fa-youtube-play"
          subtitle: "Video"

  render: ->
    return H.table style: { width: "100%", height: "100%", tableLayout: "fixed" },
      H.tbody null,
        H.tr null,
          if @props.onItemsChange
            @renderPalette()
          H.td key: "design", style: { verticalAlign: "top", height: "100%" },
            @renderBlock(@props.items)

module.exports = NestableDragDropContext(HTML5Backend)(BlocksDisplayComponent)

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
      style: { height: "100%", padding: 30 }
      onlyBottom: true,
        H.div key: "root",
          _.map @props.block.blocks, (block) =>
            @props.renderBlock(block)


class VerticalBlockComponent extends React.Component
  @propTypes:
    block: React.PropTypes.object.isRequired
    renderBlock: React.PropTypes.func.isRequired
    onBlockDrop: React.PropTypes.func.isRequired # Called with (sourceBlock, targetBlock, side) when block is dropped on it. side is top, left, bottom, right
    onBlockRemove: React.PropTypes.func.isRequired # Called with (block) when block is removed

  render: ->
    H.div null,
      _.map @props.block.blocks, (block) =>
        @props.renderBlock(block)


class HorizontalBlockComponent extends React.Component
  @propTypes:
    block: React.PropTypes.object.isRequired
    renderBlock: React.PropTypes.func.isRequired
    onBlockDrop: React.PropTypes.func.isRequired # Called with (sourceBlock, targetBlock, side) when block is dropped on it. side is top, left, bottom, right
    onBlockRemove: React.PropTypes.func.isRequired # Called with (block) when block is removed

  render: ->
    H.table style: { width: "100%", tableLayout: "fixed" },
      H.tbody null,
        H.tr null,
          _.map @props.block.blocks, (block) =>
            H.td style: { width: "#{100/@props.block.blocks.length}%", verticalAlign: "top" }, key: block.id,
              @props.renderBlock(block)
