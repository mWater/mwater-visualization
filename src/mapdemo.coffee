React = require 'react'
H = React.DOM
AutoSizeComponent = require './AutoSizeComponent'
MapViewComponent = require './maps/MapViewComponent'
MapDesignerComponent = require './maps/MapDesignerComponent'

$ ->
  sample = H.div style: { height: "100%", width: "100%" },
    H.style null, ''' html, body { height: 100% }'''
    H.div style: { position: "absolute", width: "70%", height: "100%" }, 
      React.createElement(AutoSizeComponent, injectWidth: true, injectHeight: true, 
        React.createElement(MapViewComponent)
      )
    H.div style: { position: "absolute", left: "70%", width: "30%" }, 
      React.createElement(MapDesignerComponent)

  React.render(sample, document.body)



