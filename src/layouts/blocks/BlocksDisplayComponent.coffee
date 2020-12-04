PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
R = React.createElement
uuid = require 'uuid'

DraggableBlockComponent = require "./DraggableBlockComponent"
DecoratedBlockComponent = require '../DecoratedBlockComponent'

PaletteItemComponent = require './PaletteItemComponent'
ClipboardPaletteItemComponent = require './ClipboardPaletteItemComponent'
blockUtils = require './blockUtils'

AutoSizeComponent = require('react-library/lib/AutoSizeComponent')

HorizontalBlockComponent = require './HorizontalBlockComponent'

getDefaultLayoutOptions = require('../../dashboards/layoutOptions').getDefaultLayoutOptions

###
Renders the complete layout of the blocks and also optionally a palette to the left
that can be used to drag new items into the layout. Palette is only displayed if onItemsChange is not null
###
class BlocksDisplayComponent extends React.Component
  @propTypes:
    items: PropTypes.object.isRequired
    onItemsChange: PropTypes.func

    style: PropTypes.string   # Stylesheet to use. null for default
    layoutOptions: PropTypes.object # layout options to use

    # Renders a widget. Passed (options)
    #  id: id of widget
    #  type: type of the widget
    #  design: design of the widget
    #  onDesignChange: called with new design of widget
    #  width: width to render. null for auto
    #  height: height to render. null for auto
    renderWidget: PropTypes.func.isRequired

    # True to prevent maps
    disableMaps: PropTypes.bool

    # Including onClipboardChange adds a clipboard palette item that can be used to copy and paste widgets
    clipboard: PropTypes.object
    onClipboardChange: PropTypes.func
    cantPasteMessage: PropTypes.string  # Set if can't paste current contents (usually because missing extra tables)

  handleBlockDrop: (sourceBlock, targetBlock, side) =>
    # Remove source from items
    items = blockUtils.removeBlock(@props.items, sourceBlock)

    # Remove source from target also
    targetBlock = blockUtils.removeBlock(targetBlock, sourceBlock)

    items = blockUtils.dropBlock(items, sourceBlock, targetBlock, side)
    items = blockUtils.cleanBlock(items)
    @props.onItemsChange(items)

  handleBlockRemove: (block) =>
    items = blockUtils.removeBlock(@props.items, block)
    items = blockUtils.cleanBlock(items)
    @props.onItemsChange(items)

  handleBlockUpdate: (block) =>
    items = blockUtils.updateBlock(@props.items, block)
    items = blockUtils.cleanBlock(items)
    @props.onItemsChange(items)

  renderBlock: (block, collapseColumns = false) =>
    elem = null

    switch block.type
      when "root"
        return R RootBlockComponent, 
          key: block.id 
          block: block 
          collapseColumns: collapseColumns
          renderBlock: @renderBlock
          onBlockDrop: if @props.onItemsChange? then @handleBlockDrop
          onBlockRemove: if @props.onItemsChange? then @handleBlockRemove

      when "vertical"
        return R VerticalBlockComponent, 
          key: block.id 
          block: block 
          collapseColumns: collapseColumns
          renderBlock: @renderBlock
          onBlockDrop: if @props.onItemsChange? then @handleBlockDrop
          onBlockRemove: if @props.onItemsChange? then @handleBlockRemove

      when "horizontal"
        return R HorizontalBlockComponent, 
          key: block.id 
          block: block 
          collapseColumns: collapseColumns
          renderBlock: @renderBlock
          onBlockDrop: if @props.onItemsChange? then @handleBlockDrop
          onBlockRemove: if @props.onItemsChange? then @handleBlockRemove
          onBlockUpdate: if @props.onItemsChange? then @handleBlockUpdate

      when "spacer"
        elem = R AutoSizeComponent, { injectWidth: true, key: block.id }, 
          (size) =>
            R 'div', id: block.id, style: {
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
    return R 'div', key: block.id, className: "mwater-visualization-block mwater-visualization-block-#{block.type}",
      elem

  createBlockItem: (block) ->
    # Add unique id
    return () -> { block: _.extend({}, block, id: uuid()) }

  renderPalette: ->
    R 'div', key: "palette", style: { width: 141, height: "100%", position: "absolute", top: 0, left: 0 }, 
      R 'div', className: "mwater-visualization-palette", style: { height: "100%" },
        R PaletteItemComponent, 
          createItem: @createBlockItem({ type: "widget", widgetType: "Text", design: { style: "title" } })
          title: R 'i', className: "fa fa-font"
          subtitle: "Title"
        R PaletteItemComponent, 
          createItem: @createBlockItem({ type: "widget", widgetType: "Text", design: {} })
          title: R 'i', className: "fa fa-align-left"
          subtitle: "Text"
        R PaletteItemComponent,
          createItem: @createBlockItem({ type: "widget", aspectRatio: 1.4, widgetType: "Image", design: {} })
          title: R 'i', className: "fa fa-picture-o"
          subtitle: "Image"
        R PaletteItemComponent,
          createItem: @createBlockItem({ type: "widget", aspectRatio: 1.4, widgetType: "LayeredChart", design: {} })
          title: R 'i', className: "fa fa-bar-chart"
          subtitle: "Chart"
        if not @props.disableMaps
          R PaletteItemComponent,
            createItem: @createBlockItem({ type: "widget", aspectRatio: 1.4, widgetType: "Map", design: { baseLayer: "bing_road", layerViews: [], filters: {}, bounds: { w: -40, n: 25, e: 40, s: -25 } } })
            title: R 'i', className: "fa fa-map-o"
            subtitle: "Map"
        R PaletteItemComponent,
          createItem: @createBlockItem({ type: "widget", aspectRatio: 1.4, widgetType: "TableChart", design: {} })
          title: R 'i', className: "fa fa-table"
          subtitle: "Table"
        R PaletteItemComponent,
          createItem: @createBlockItem({ type: "widget", widgetType: "PivotChart", design: {} })
          title: R 'img', width: 24, height: 24, src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAb0lEQVRIx91VQQrAIAwzo/7/ydllG0MQS21EzMW2ICFtoyBZlLDn/LOgySPAG1xFDDmBtZI6efoMvODozkyL2IlTCOisfS2KrqG0RXus6fkEVBIw08khE62aQY0ogMdEswqwYouwvQ8s+4M576m4Ae/tET/u1taEAAAAAElFTkSuQmCC"
          subtitle: "Pivot"
        R PaletteItemComponent,
          createItem: @createBlockItem({ type: "widget", aspectRatio: 1.4, widgetType: "CalendarChart", design: {} })
          title: R 'i', className: "fa fa-calendar"
          subtitle: "Calendar"
        R PaletteItemComponent,
          createItem: @createBlockItem({ type: "widget", aspectRatio: 1.4, widgetType: "ImageMosaicChart", design: {} })
          title: R 'i', className: "fa fa-th"
          subtitle: "Mosaic"
        R PaletteItemComponent,
          createItem: @createBlockItem({ type: "spacer", aspectRatio: 1.4 })
          title: R 'i', className: "fa fa-square-o"
          subtitle: "Spacer"
        R PaletteItemComponent,
          createItem: @createBlockItem({ type: "widget", aspectRatio: 16.0/9.0, widgetType: "IFrame", design: {} })
          title: R 'i', className: "fa fa-youtube-play"
          subtitle: "Video"
        R PaletteItemComponent,
          createItem: @createBlockItem({ type: "widget", widgetType: "TOC", design: { numbering: false, borderWeight: 2, header: "Contents" } })
          title: R 'i', className: "fa fa-list-ol"
          subtitle: "TOC"
        if @props.onClipboardChange
          R ClipboardPaletteItemComponent,
            clipboard: @props.clipboard
            onClipboardChange: @props.onClipboardChange
            cantPasteMessage: @props.cantPasteMessage

  render: ->
    layoutOptions = @props.layoutOptions or getDefaultLayoutOptions()
    if @props.onItemsChange
      return R 'div', style: { width: "100%", height: "100%", overflow: "hidden", position: "relative" }, 
        @renderPalette()
        R 'div', style: { position: "absolute", left: 141, top: 0, bottom: 0, right: 0, overflow: "auto" }, className: "mwater-visualization-block-parent-outer mwater-visualization-block-parent-outer-#{@props.style or "default"} mwater-visualization-block-editing", 
          R 'div', key: "inner", className: "mwater-visualization-block-parent-inner mwater-visualization-block-parent-inner-#{@props.style or "default"}",
            @renderBlock(@props.items)
    else
      return R AutoSizeComponent, { injectWidth: true, injectHeight: true }, 
        (size) => 
          outerParentStyle = { width: "100%", height: "100%", overflowX: "auto" }
          innerParentStyle = {}

          # Remove padding if small
          if size.width < 600
            innerParentStyle.padding = "0px"
            
          # Scroll/scale
          innerParentStyle.maxWidth = layoutOptions.maximumWidth or undefined
          
          if layoutOptions.belowMinimumWidth == "scroll"
            innerParentStyle.minWidth = layoutOptions.minimumWidth or undefined
          else
            if layoutOptions.minimumWidth? and size.width < layoutOptions.minimumWidth
              scale = size.width / layoutOptions.minimumWidth
              outerParentStyle.transform = "scale(#{scale})"
              outerParentStyle.width = size.width / scale
              outerParentStyle.height = size.height / scale
              outerParentStyle.transformOrigin = "top left"

          return R 'div', style: outerParentStyle, className: "mwater-visualization-block-parent-outer mwater-visualization-block-parent-outer-#{@props.style or "default"} mwater-visualization-block-viewing",
            R 'div', key: "inner", className: "mwater-visualization-block-parent-inner mwater-visualization-block-parent-inner-#{@props.style or "default"}", style: innerParentStyle,
              @renderBlock(@props.items, layoutOptions.collapseColumnsWidth? and size.width <= layoutOptions.collapseColumnsWidth)

module.exports = BlocksDisplayComponent

class RootBlockComponent extends React.Component
  @propTypes:
    block: PropTypes.object.isRequired
    collapseColumns: PropTypes.bool
    renderBlock: PropTypes.func.isRequired
    onBlockDrop: PropTypes.func # Called with (sourceBlock, targetBlock, side) when block is dropped on it. side is top, left, bottom, right
    onBlockRemove: PropTypes.func # Called with (block) when block is removed

  render: ->
    elem = R 'div', key: "root",
      _.map @props.block.blocks, (block) =>
        @props.renderBlock(block, @props.collapseColumns)

    # If draggable
    if @props.onBlockDrop?
      return R DraggableBlockComponent, 
        block: @props.block
        onBlockDrop: @props.onBlockDrop
        style: { height: "100%" },
        onlyBottom: true,
          elem
    else
      return elem

class VerticalBlockComponent extends React.Component
  @propTypes:
    block: PropTypes.object.isRequired
    collapseColumns: PropTypes.bool
    renderBlock: PropTypes.func.isRequired
    onBlockDrop: PropTypes.func # Called with (sourceBlock, targetBlock, side) when block is dropped on it. side is top, left, bottom, right
    onBlockRemove: PropTypes.func # Called with (block) when block is removed

  render: ->
    R 'div', null,
      _.map @props.block.blocks, (block) =>
        @props.renderBlock(block, @props.collapseColumns)


