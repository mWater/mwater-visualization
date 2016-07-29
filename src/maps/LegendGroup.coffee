React = require 'react'
H = React.DOM
_ = require 'lodash'

module.exports = class LegendGroup extends React.Component
  @propTypes:
    name: React.PropTypes.string
    items: React.PropTypes.array

  render: ->
    titleStyle =
      margin: 2
      fontWeight: 'bold'

    H.div null,
      H.p key: 'legend-group-title', style: titleStyle, @props.name
      _.map @props.items, (item) =>
        React.createElement(LegendItem, {color: item.color, name: item.name, key: item.name})

class LegendItem extends React.Component
  @propTypes:
    color: React.PropTypes.string
    name: React.PropTypes.string

  render: ->
    indicatorStyle =
      height: 10
      width: 10
      backgroundColor: @props.color
      display: 'inline-block'
      marginRight: 4
    H.div null,
      H.span style: indicatorStyle, ""
      H.span null, @props.name