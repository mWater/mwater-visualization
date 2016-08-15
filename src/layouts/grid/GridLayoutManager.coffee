_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

uuid = require 'node-uuid'
LayoutManager = require '../LayoutManager'

module.exports = class GridLayoutManager extends LayoutManager
  renderPalette: (width) ->
    PaletteItemComponent = require './PaletteItemComponent'

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
      R PaletteItemComponent,
        createItem: createWidgetItem("IFrame", {})
        title: H.i className: "fa fa-youtube-play"
        subtitle: "Video"

  # Renders the layout as a react element
  # options:
  #  width: width of layout
  #  items: opaque items object that layout manager understands
  #  onItemsChange: Called when items changes
  #  renderWidget: called with ({ id:, type:, design:, onDesignChange:, width:, height:  })
  renderLayout: (options) ->
    GridLayoutComponent = require './GridLayoutComponent'

    if options.onItemsChange?
      return H.div style: { position: "relative", height: "100%" }, 
        @renderPalette(options.width)
        H.div style: { position: "absolute", left: 108, top: 0, right: 0, bottom: 0 },
          R GridLayoutComponent, 
            width: options.width - 108
            standardWidth: options.standardWidth - 108 # TODO 102? doc. needed?
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

  # Gets { type, design } of a widget
  getWidgetTypeAndDesign: (items, widgetId) -> 
    return items[widgetId]?.widget

