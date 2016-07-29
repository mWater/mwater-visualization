_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

uuid = require 'node-uuid'

LegoLayoutEngine = require './LegoLayoutEngine'
WidgetContainerComponent = require './WidgetContainerComponent'
PaletteItemComponent = require './PaletteItemComponent'

module.exports = class GridLayoutManager
  renderPalette: (width) ->
    createWidgetItem = (type, design) ->
      # Add unique id
      return () -> { id: uuid.v4(), widget: { type: type, design: design }, bounds: { x: 0, y: 0, width: width/3, height: width/4 } } 

    H.div className: "mwater-visualization-palette", style: { position: "absolute", top: 0, left: 0, bottom: 0 },
      R PaletteItemComponent, 
        createItem: createWidgetItem("Text", { style: "title" })
        title: H.i className: "fa fa-font"
        subtitle: "Title"
      R PaletteItemComponent, 
        createItem: createWidgetItem("Text", {})
        title: H.i className: "fa fa-align-left"
        subtitle: "Text"
      # R PaletteItemComponent,
      #   createItem: @createBlockItem({ type: "image" })
      #   title: H.i className: "fa fa-picture-o"
      #   subtitle: "Image"
      R PaletteItemComponent,
        createItem: createWidgetItem("LayeredChart", {})
        title: H.i className: "fa fa-bar-chart"
        subtitle: "Chart"
      R PaletteItemComponent,
        createItem: createWidgetItem("Map", { baseLayer: "bing_road", layerViews: [], filters: {}, bounds: { w: -40, n: 25, e: 40, s: -25 } })
        title: H.i className: "fa fa-map-o"
        subtitle: "Map"
      R PaletteItemComponent,
        createItem: createWidgetItem("TableChart", {})
        title: H.i className: "fa fa-table"
        subtitle: "Table"
      R PaletteItemComponent,
        createItem: createWidgetItem("CalendarChart", {})
        title: H.i className: "fa fa-calendar"
        subtitle: "Calendar"
      R PaletteItemComponent,
        createItem: createWidgetItem("ImageMosaicChart", {})
        title: H.i className: "fa fa-th"
        subtitle: "Mosaic"

  # Renders the layout as a react element
  # options:
  #  width: width of layout
  #  items: opaque items object that layout manager understands
  #  onItemsChange: Called when items changes
  #  renderWidget: called with ({ id:, type:, design:, onDesignChange:, width:, height:  })
  renderLayout: (options) ->
    if options.onItemsChange?
      return H.div style: { position: "relative", height: "100%" }, 
        @renderPalette(options.width)
        H.div style: { position: "absolute", left: 102, top: 0, right: 0, bottom: 0 },
          R GridLayoutComponent, 
            width: options.width - 102 
            standardWidth: options.standardWidth - 102 # TODO 102? doc. needed?
            items: options.items
            onItemsChange: options.onItemsChange
            renderWidget: options.renderWidget
    else
      return H.div style: { position: "relative", height: "100%" }, 
        R GridLayoutComponent, 
          width: options.width
          standardWidth: options.standardWidth
          items: options.items
          onItemsChange: options.onItemsChange
          renderWidget: options.renderWidget

  # Tests if dashboard has any items
  isEmpty: (items) ->
    return _.isEmpty(items)

class GridLayoutComponent extends React.Component
  @propTypes:
    width: React.PropTypes.number.isRequired
    standardWidth: React.PropTypes.number.isRequired  # TODO needed?
    items: React.PropTypes.any
    onItemsChange: React.PropTypes.func
    renderWidget: React.PropTypes.func.isRequired

  renderPageBreaks: (layoutEngine, layouts) ->
    # Get height
    height = layoutEngine.calculateHeight(layouts)

    # Page breaks are 8.5x11 with 0.5" margin 
    pageHeight = @props.width / 7.5 * 10

    number = Math.floor(height/pageHeight)

    elems = []
    if number > 0
      for i in [1..number]
        elems.push(H.div(className: "mwater-visualization-page-break", style: { position: "absolute", top: i * pageHeight }))

    return elems

  render: ->
    # Create layout engine
    layoutEngine = new LegoLayoutEngine(@props.width, 24)

    # Get layouts indexed by id
    layouts = _.mapValues(@props.items, "layout")

    style = {
      height: "100%"
      position: "relative"
    }

    # Render widget container
    return H.div style: style,
      R WidgetContainerComponent, 
        layoutEngine: layoutEngine
        items: @props.items
        onItemsChange: @props.onItemsChange
        renderWidget: @props.renderWidget
        width: @props.width 
        standardWidth: @props.standardWidth
      @renderPageBreaks(layoutEngine, layouts)


class WidgetComponent extends React.Component
  render: ->
    # Render decorated if editable
    if @props.onDesignChange
      return R DecoratedBlockComponent,
        connectMoveHandle: @props.connectMoveHandle
        connectResizeHandle: @props.connectResizeHandle
        onBlockRemove: @props.onBlockRemove,
          @props.renderWidget({
            id: @props.id
            type: @props.type
            design: @props.design
            onDesignChange: @props.onDesignChange
            width: @props.width - 10 # for padding
            height: @props.height - 10 # for padding
          })
    else
      return H.div className: "mwater-visualization-block-view", 
        @props.renderWidget({
          id: @props.id
          type: @props.type
          design: @props.design
          onDesignChange: @props.onDesignChange
          width: @props.width - 10
          height: @props.height - 10
        })

