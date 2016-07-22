React = require 'react'
H = React.DOM
R = React.createElement
TabbedComponent = require('react-library/lib/TabbedComponent')
MapLayersDesignerComponent = require './MapLayersDesignerComponent'
MapFiltersDesignerComponent = require './MapFiltersDesignerComponent'

module.exports = class MapDesignerComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired # Schema to use
    dataSource: React.PropTypes.object.isRequired # Data source to use
    design: React.PropTypes.object.isRequired  # See Map Design.md
    onDesignChange: React.PropTypes.func.isRequired # Called with new design

  render: ->
    H.div style: { padding: 5 },
      H.div className: "form-group",
        H.label className: "text-muted", 
          "Map Style"
  
        R BaseLayerDesignerComponent,
          schema: @props.schema
          design: @props.design
          onDesignChange: @props.onDesignChange

      H.div className: "form-group",
        H.label className: "text-muted", 
          "Layers"

        R MapLayersDesignerComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          design: @props.design
          onDesignChange: @props.onDesignChange

      H.div className: "form-group",
        H.label className: "text-muted", 
          "Filters"

        R MapFiltersDesignerComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          design: @props.design
          onDesignChange: @props.onDesignChange

# Designer for config
class BaseLayerDesignerComponent extends React.Component
  @propTypes:
    design: React.PropTypes.object.isRequired  # See Map Design.md
    onDesignChange: React.PropTypes.func.isRequired # Called with new design

  # Updates design with the specified changes
  updateDesign: (changes) ->
    design = _.extend({}, @props.design, changes)
    @props.onDesignChange(design)

  handleBaseLayerChange: (baseLayer) =>
    @updateDesign(baseLayer: baseLayer)

  renderBaseLayer: (id, name) ->
    className = "mwater-visualization-layer"
    if id == @props.design.baseLayer
      className += " checked"
    
    H.div 
      key: id
      className: className
      style: { display: "inline-block" },
      onClick: @handleBaseLayerChange.bind(null, id),
        name

  render: ->
    H.div style: { marginLeft: 10 }, 
      @renderBaseLayer("bing_road", "Roads")
      @renderBaseLayer("bing_aerial", "Satellite")
      @renderBaseLayer("cartodb_positron", "Light")
      @renderBaseLayer("cartodb_dark_matter", "Dark")
