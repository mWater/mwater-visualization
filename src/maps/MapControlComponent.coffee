React = require 'react'
H = React.DOM
R = React.createElement

MapLayersDesignerComponent = require './MapLayersDesignerComponent'
BaseLayerDesignerComponent = require './BaseLayerDesignerComponent'

# Allows controlling readonly map
module.exports = class MapControlComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired # Schema to use
    dataSource: React.PropTypes.object.isRequired
    design: React.PropTypes.object.isRequired  # See Map Design.md
    onDesignChange: React.PropTypes.func.isRequired # Called with new design

  render: ->
    H.div style: { padding: 5 },
      R MapLayersDesignerComponent, 
        schema: @props.schema
        dataSource: @props.dataSource
        design: @props.design
        onDesignChange: @props.onDesignChange
        allowEditingLayers: false

      H.br()

      H.div className: "form-group",
        H.label className: "text-muted", 
          "Map Style"
  
        R BaseLayerDesignerComponent,
          design: @props.design
          onDesignChange: @props.onDesignChange

