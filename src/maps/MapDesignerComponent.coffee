React = require 'react'
H = React.DOM
TabbedComponent = require '../TabbedComponent'
MapLayersDesignerComponent = require './MapLayersDesignerComponent'
MapFiltersDesignerComponent = require './MapFiltersDesignerComponent'

module.exports = class MapDesignerComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired # Schema to use
    layerFactory: React.PropTypes.object.isRequired # Layer factory to use
    design: React.PropTypes.object.isRequired  # See Map Design.md
    onDesignChange: React.PropTypes.func.isRequired # Called with new design

  render: ->
    tabs = [
      { 
        id: "layers"
        label: [H.span(className: "glyphicon glyphicon-align-justify"), " Layers"]
        elem: React.createElement(MapLayersDesignerComponent, 
          schema: @props.schema,
          design: @props.design, 
          layerFactory: @props.layerFactory,
          onDesignChange: @props.onDesignChange) 
      }
      { 
        id: "filters"
        label: [H.span(className: "glyphicon glyphicon-filter"), " Filters"]
        elem: React.createElement(MapFiltersDesignerComponent, 
          schema: @props.schema,
          design: @props.design, 
          layerFactory: @props.layerFactory,
          onDesignChange: @props.onDesignChange) 
      }
      { 
        id: "save"
        label: [H.span(className: "glyphicon glyphicon-saved"), " Saved"]
        elem: "LOAD/SAVE"
      }
    ]

    React.createElement(TabbedComponent, 
      tabs: tabs
      initialTabId: "layers")

