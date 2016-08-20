_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

WidgetContainerComponent = require './WidgetContainerComponent'
LegoLayoutEngine = require './LegoLayoutEngine'

module.exports = class GridLayoutComponent extends React.Component
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
        elems.push(H.div(className: "mwater-visualization-page-break", key: "page#{i}", style: { position: "absolute", top: i * pageHeight }))

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

