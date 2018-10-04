PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
R = React.createElement

WidgetContainerComponent = require './WidgetContainerComponent'
LegoLayoutEngine = require './LegoLayoutEngine'

module.exports = class GridLayoutComponent extends React.Component
  @propTypes:
    width: PropTypes.number.isRequired
    standardWidth: PropTypes.number.isRequired  # TODO needed?
    items: PropTypes.any
    onItemsChange: PropTypes.func
    renderWidget: PropTypes.func.isRequired

  renderPageBreaks: (layoutEngine, layouts) ->
    # Get height
    height = layoutEngine.calculateHeight(layouts)

    # Page breaks are 8.5x11 with 0.5" margin 
    pageHeight = @props.width / 7.5 * 10

    number = Math.floor(height/pageHeight)

    elems = []
    if number > 0
      for i in [1..number]
        elems.push(R('div', className: "mwater-visualization-page-break", key: "page#{i}", style: { position: "absolute", top: i * pageHeight }))

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
    return R 'div', style: style,
      R WidgetContainerComponent, 
        layoutEngine: layoutEngine
        items: @props.items
        onItemsChange: @props.onItemsChange
        renderWidget: @props.renderWidget
        width: @props.width 
        standardWidth: @props.standardWidth
      @renderPageBreaks(layoutEngine, layouts)

