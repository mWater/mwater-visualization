React = require 'react'
H = React.DOM
_ = require 'lodash'

module.exports = class LegendGroup extends React.Component
  @propTypes:
    items: React.PropTypes.array
    radiusLayer: React.PropTypes.bool
    defaultColor: React.PropTypes.string
    name: React.PropTypes.string
    symbol: React.PropTypes.string

  @defaultProps:
    items: []
    radiusLayer: false
    symbol: null

  render: ->
    H.div style: { marginBottom: 5},
      React.createElement(LegendItem, {hasChildren: @props.items.length > 0,symbol:@props.symbol,color: @props.defaultColor, name: @props.name, key: @props.name, radiusLayer: @props.radiusLayer})
      _.map @props.items, (item) =>
        React.createElement(LegendItem, {isChild: true, symbol:@props.symbol,color: item.color, name: item.name, key: item.name, radiusLayer: @props.radiusLayer})

class LegendItem extends React.Component
  @propTypes:
    color: React.PropTypes.string
    name: React.PropTypes.string
    radiusLayer: React.PropTypes.bool
    symbol: React.PropTypes.string
    hasChildren: React.PropTypes.bool
    isChild: React.PropTypes.bool

  @defaultProps:
    radiusLayer: false
    hasChildren: false
    isChild: false

  renderSymbol: ->
    symbolStyle =
      color: @props.color
      display: 'inline-block'
      marginRight: 4

    className = @props.symbol.replace('font-awesome/' , 'fa fa-')
    H.span {className: className, style: symbolStyle}, ""

  renderColorIndicator: ->
    indicatorStyle =
      height: 10
      width: 10
      backgroundColor: @props.color
      display: 'inline-block'
      marginRight: 4

    if @props.radiusLayer
      indicatorStyle['borderRadius'] = 5

    H.span style: indicatorStyle, ""

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

    H.div style: containerStyle,
      if not @props.hasChildren
        @renderIndicator()
      H.span {style: titleStyle}, @props.name