_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

storiesOf = require('@kadira/storybook').storiesOf
action = require('@kadira/storybook').action

LeafletMapComponent = require '../src/maps/LeafletMapComponent'

storiesOf('Leaflet', module)
  .add 'normal', => 
    R LeafletMapComponent, 
      baseLayerId: "bing_road"
      width: "100%"
      height: 600
      layers: []
    
  .add 'popup', => 
    R LeafletMapComponent, 
      baseLayerId: "bing_road"
      width: "100%"
      height: 600
      layers: []
      popup: {
        lat: 30
        lng: -20
        contents: H.div null, "Hello!!!"
      }

  .add 'popup2', => 
    R LeafletMapComponent, 
      baseLayerId: "bing_road"
      width: "100%"
      height: 600
      layers: []
      popup: {
        lat: 35
        lng: -20
        contents: H.div null, "Hello2!!!"
      }
  #   R LeafletMapComponent, 
  #     baseLayerId: "bing_road"
  #     width: "100%"
  #     height: 600
  #     layers: [
  #       {
  #         tileUrl: "http://localhost:1234/v3/maps/tiles/{z}/{x}/{y}.png?type=cluster"
  #         visible: true
  #       }
  #     ]
    