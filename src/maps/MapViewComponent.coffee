React = require 'react'
LeafletMapComponent = require './LeafletMapComponent'

module.exports = class MapViewComponent extends React.Component
  render: ->
    React.createElement(LeafletMapComponent,
      initialCenter: [0,0], 
      initialZoom: 5, 
      baseLayerId: "bing_road"
      width: @props.width
      height: @props.height)
