PropTypes = require('prop-types')
React = require 'react'
H = React.DOM
R = React.createElement

MapLayersDesignerComponent = require './MapLayersDesignerComponent'
BaseLayerDesignerComponent = require './BaseLayerDesignerComponent'

# Allows controlling readonly map
module.exports = class MapControlComponent extends React.Component
  @propTypes:
    schema: PropTypes.object.isRequired # Schema to use
    dataSource: PropTypes.object.isRequired
    design: PropTypes.object.isRequired  # See Map Design.md
    onDesignChange: PropTypes.func.isRequired # Called with new design

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

