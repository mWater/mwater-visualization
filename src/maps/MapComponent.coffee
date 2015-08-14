React = require 'react'
H = React.DOM

MapViewComponent = require './MapViewComponent'
MapDesignerComponent = require './MapDesignerComponent'
AutoSizeComponent = require './../AutoSizeComponent'

# Map with designer on right
module.exports = class MapComponent extends React.Component
  @propTypes:
    layerFactory: React.PropTypes.object.isRequired
    schema: React.PropTypes.object.isRequired

    design: React.PropTypes.object.isRequired
    onDesignChange: React.PropTypes.func.isRequired

  render: ->
    H.div style: { width: "100%", height: "100%", position: "relative" },
      H.div style: { position: "absolute", width: "70%", height: "100%" }, 
        React.createElement(AutoSizeComponent, injectWidth: true, injectHeight: true, 
          React.createElement(MapViewComponent, 
            schema: @props.schema, 
            design: @props.design
            onDesignChange: @props.onDesignChange
            layerFactory: @props.layerFactory)
        )
      H.div style: { position: "absolute", left: "70%", width: "30%", height: "100%", borderLeft: "solid 3px #AAA" }, 
        React.createElement(MapDesignerComponent, 
          schema: @props.schema, 
          design: @props.design, 
          onDesignChange: @props.onDesignChange
          layerFactory: @props.layerFactory)