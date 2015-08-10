React = require 'react'
H = React.DOM
TabbedComponent = require '../TabbedComponent'

module.exports = class MapDesignerComponent extends React.Component
  render: ->
    tabs = [
      { 
        id: "layers"
        label: [H.span(className: "glyphicon glyphicon-align-justify"), " Layers"]
        elem: React.createElement(MapLayersComponent) 
      }
      { 
        id: "filters"
        label: [H.span(className: "glyphicon glyphicon-filter"), " Filters"]
        elem: React.createElement(MapFiltersComponent, schema: @props.schema)
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

class MapLayersComponent extends React.Component
  renderLayerGearMenu: ->
    H.div className: "btn-group", style: { float: "right" },
      H.button type: "button", className: "btn btn-link dropdown-toggle", "data-toggle": "dropdown",
        H.span className: "glyphicon glyphicon-cog"
      H.ul className: "dropdown-menu dropdown-menu-right",
        H.li(null, H.a(null, "Edit Layer"))
        H.li(null, H.a(null, "Set Opacity"))
        H.li(null, H.a(null, "Remove Layer"))

  renderLayer: (name, desc, visible) ->
    H.li className: "list-group-item",
      @renderLayerGearMenu()
      H.div className: (if visible then "mwater-visualization-layer checked" else "mwater-visualization-layer"), 
        name
        # H.br()
        # H.small null, desc

  renderBaseLayer: ->
    H.div style: { margin: 5, marginBottom: 10 },
      H.label className: "radio-inline",
        H.input type: "radio", checked: true, "Roads"
      H.label className: "radio-inline",
        H.input type: "radio", checked: false, "Satellite"

  render: ->
    H.div style: { padding: 5 }, 
      @renderBaseLayer()

      H.ul className: "list-group", 
        @renderLayer("E.Coli Status", "WHO Standard E.Coli Colors", true)
        @renderLayer("Safe Water Access", "Within 1000 meters of safe, functional water", true)
        @renderLayer("Arsenic", "Arsenic levels, WHO standard")

      H.div style: { margin: 5 }, 
        H.button type: "button", className: "btn btn-default",
          H.span className: "glyphicon glyphicon-plus"
          " Add Layer"

LogicalExprComponent = require '../expressions/LogicalExprComponent'

class MapFiltersComponent extends React.Component
  render: ->
    H.div style: { margin: 5 }, 
      H.h4 null, "Water Points"
      React.createElement(LogicalExprComponent, 
        schema: @props.schema
        onChange: @handleFilterChange
        table: "a"
        value: {})

