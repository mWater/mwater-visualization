React = require 'react'
H = React.DOM
R = React.createElement

LegoLayoutEngine = require './LegoLayoutEngine'
WidgetContainerComponent = require './WidgetContainerComponent'
DecoratedBlockComponent = require '../DecoratedBlockComponent'

module.exports = class GridLayoutManager
  # Renders the layout as a react element
  # options:
  #  width: width of layout
  #  items: opaque items object that layout manager understands
  #  onItemsChange: Called when items changes
  #  renderWidget: called with ({ id:, type:, design:, onDesignChange:, width:, height:  })
  renderLayout: (options) ->
    return R GridLayoutComponent, 
      width: options.width # TODO needed?
      standardWidth: options.standardWidth # TODO doc. needed?
      items: options.items
      onItemsChange: options.onItemsChange
      renderWidget: options.renderWidget


class GridLayoutComponent extends React.Component
  @propTypes:
    width: React.PropTypes.number.isRequired
    standardWidth: React.PropTypes.number.isRequired  # TODO needed?
    items: React.PropTypes.any
    onItemsChange: React.PropTypes.func
    renderWidget: React.PropTypes.func.isRequired

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

  handleLayoutUpdate: (layouts) =>
    # Update item layouts
    items = _.mapValues(@props.items, (item, id) =>
      return _.extend({}, item, layout: layouts[id])
      )
    @props.onItemsChange(items)

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

    # Create widget elems
    elems = _.mapValues @props.items, (item, id) =>
      R WidgetComponent,
        id: id
        type: item.widget.type
        design: item.widget.design
        onDesignChange: if @props.onItemsChange? then @handleWidgetDesignChange.bind(null, id)
        onBlockRemove: @handleRemove.bind(null, id)
        renderWidget: @props.renderWidget

    style = {
      height: "100%"
      position: "relative"
    }

    # Render widget container
    return H.div null,
      R WidgetContainerComponent, 
        layoutEngine: layoutEngine
        layouts: layouts
        elems: elems
        onLayoutUpdate: if @props.onItemsChange? then @handleLayoutUpdate
        width: @props.width 
        standardWidth: @props.standardWidth
      @renderPageBreaks(layoutEngine, layouts)


class WidgetComponent extends React.Component
  render: ->
    # TODO injects width, height too late
    R DecoratedBlockComponent,
      connectMoveHandle: @props.connectMoveHandle
      connectResizeHandle: @props.connectResizeHandle
      onBlockRemove: @props.onBlockRemove,
        @props.renderWidget({
          id: @props.id
          type: @props.type
          design: @props.design
          onDesignChange: @props.onDesignChange
          width: @props.width
          height: @props.height
        })
