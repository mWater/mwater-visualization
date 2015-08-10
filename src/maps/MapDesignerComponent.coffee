React = require 'react'
H = React.DOM
TabbedComponent = require '../TabbedComponent'

module.exports = class MapDesignerComponent extends React.Component
  render: ->
    React.createElement(TabbedComponent, 
      tabs: [
        { id: "layers", label: "Layers", elem: "LAYERS"}
        { id: "filters", label: "Filters", elem: "FILTERS"}
        { id: "save", label: "Load/Save", elem: "LOAD/SAVE"}
        ]
      initialTabId: "layers")

class MapLayersComponent extends React.Component
