PropTypes = require('prop-types')
React = require 'react'
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
    R 'div', style: { padding: 5 },
      R MapLayersDesignerComponent, 
        schema: @props.schema
        dataSource: @props.dataSource
        design: @props.design
        onDesignChange: @props.onDesignChange
        allowEditingLayers: false

      R('br')

      R 'div', className: "form-group",
        R 'label', className: "text-muted", 
          "Map Style"
  
        R BaseLayerDesignerComponent,
          design: @props.design
          onDesignChange: @props.onDesignChange

