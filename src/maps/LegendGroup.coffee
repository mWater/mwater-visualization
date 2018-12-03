PropTypes = require('prop-types')
React = require 'react'
R = React.createElement
_ = require 'lodash'

module.exports = class LegendGroup extends React.Component
  @propTypes:
    items: PropTypes.array
    radiusLayer: PropTypes.bool
    defaultColor: PropTypes.string
    name: PropTypes.string
    symbol: PropTypes.string
    markerSize: PropTypes.number

  @defaultProps:
    items: []
    radiusLayer: false
    symbol: null

  render: ->
    R 'div', style: { marginBottom: 5},
      React.createElement(LegendItem, {hasChildren: @props.items.length > 0,symbol:@props.symbol, markerSize: @props.markerSize, color: @props.defaultColor, name: @props.name, key: @props.name, radiusLayer: @props.radiusLayer})
      _.map @props.items, (item) =>
        React.createElement(LegendItem, {isChild: true, symbol: @props.symbol, markerSize: @props.markerSize, color: item.color, name: item.name, key: item.name, radiusLayer: @props.radiusLayer})

class LegendItem extends React.Component
  @propTypes:
    color: PropTypes.string
    name: PropTypes.string
    radiusLayer: PropTypes.bool
    symbol: PropTypes.string
    markerSize: PropTypes.number
    hasChildren: PropTypes.bool
    isChild: PropTypes.bool

  @defaultProps:
    radiusLayer: false
    hasChildren: false
    isChild: false

  renderSymbol: ->
    symbolStyle =
      color: @props.color
      display: 'inline-block'
      marginRight: 4
      fontSize: @props.markerSize

    className = @props.symbol.replace('font-awesome/' , 'fa fa-')
    R 'span', {className: className, style: symbolStyle}, ""

  renderColorIndicator: ->
    indicatorStyle =
      height: 10
      width: 10
      backgroundColor: @props.color
      display: 'inline-block'
      marginRight: 4

    if @props.radiusLayer
      indicatorStyle['borderRadius'] = 5

    R 'span', style: indicatorStyle, ""

  renderIndicator: ->
    if @props.symbol
      @renderSymbol()
    else
      @renderColorIndicator()

  render: ->

    titleStyle = {}
    if not @props.isChild
      titleStyle =
        margin: 2
        fontWeight: 'bold'

    containerStyle =
      paddingLeft: if @props.isChild then 5 else 0

    R 'div', style: containerStyle,
      if not @props.hasChildren
        @renderIndicator()
      R 'span', {style: titleStyle}, @props.name