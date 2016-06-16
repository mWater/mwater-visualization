React = require 'react'
H = React.DOM
TabbedComponent = require('react-library/lib/TabbedComponent')
MapLayersDesignerComponent = require './MapLayersDesignerComponent'
MapFiltersDesignerComponent = require './MapFiltersDesignerComponent'

module.exports = class MapDesignerComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired # Schema to use
    dataSource: React.PropTypes.object.isRequired # Data source to use
    layerFactory: React.PropTypes.object.isRequired # Layer factory to use
    design: React.PropTypes.object.isRequired  # See Map Design.md
    onDesignChange: React.PropTypes.func.isRequired # Called with new design

  render: ->
    tabs = [
      { 
        id: "layers"
        label: [H.span(className: "glyphicon glyphicon-align-justify"), " Layers"]
        elem: React.createElement(MapLayersDesignerComponent, 
          schema: @props.schema
          design: @props.design
          layerFactory: @props.layerFactory
          onDesignChange: @props.onDesignChange) 
      }
      { 
        id: "filters"
        label: [H.span(className: "glyphicon glyphicon-filter"), " Filters"]
        elem: React.createElement(MapFiltersDesignerComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          design: @props.design
          layerFactory: @props.layerFactory
          onDesignChange: @props.onDesignChange) 
      }
      { 
        id: "config"
        label: [H.span(className: "glyphicon glyphicon-cog"), " Config"]
        elem: React.createElement(MapConfigDesignerComponent, 
          schema: @props.schema
          design: @props.design
          layerFactory: @props.layerFactory
          onDesignChange: @props.onDesignChange) 
      }
    ]

    React.createElement(TabbedComponent, 
      tabs: tabs
      initialTabId: "layers")


# Designer for config
class MapConfigDesignerComponent extends React.Component
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
    H.div className: "form-group", style: { margin: 5 },
      H.label className: "text-muted", "Base Layer"
      H.div style: { marginLeft: 10 }, 
        @renderBaseLayer("bing_road", "Roads")
        @renderBaseLayer("bing_aerial", "Satellite")
        @renderBaseLayer("cartodb_positron", "Monochrome Light")
