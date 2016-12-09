Layer = require './Layer'
ExprCompiler = require('mwater-expressions').ExprCompiler
injectTableAlias = require('mwater-expressions').injectTableAlias

React = require 'react'
H = React.DOM

# TODO DEPRECATED. REPLACE WITH REAL MARKER AND BUFFER LAYERS

# Layer defined on the mWater server
# Design is:
# type: type of layer on server
# table: table to filter on (e.g. entities.water_point)
# minZoom: optional minimum zoom
# maxZoom: optional maximum zoom
module.exports = class MWaterServerLayer extends Layer
  # Called when the interactivity grid is clicked. 
  # arguments:
  #   ev: { data: interactivty data e.g. `{ id: 123 }` }
  #   options: 
  #     design: design of layer
  #     schema: schema to use
  #     dataSource: data source to use
  #     filters: compiled filters to apply to the popup
  # 
  # Returns:
  #   null/undefined to do nothing
  #   [table id, primary key] to open a default system popup if one is present
  #   React element to put into a popup
  onGridClick: (ev, options) ->
    if ev.data and ev.data.id
      return {
        row: { tableId: options.design.table, primaryKey: ev.data.id }
      }
      
    return null

  # Get min and max zoom levels
  getMinZoom: (design) -> return design.minZoom
  getMaxZoom: (design) -> return design.maxZoom

  # Get the legend to be optionally displayed on the map. Returns
  # a React element
  getLegend: (design, schema) ->
    # Create loading legend component
    # TODO hardcoded
    apiUrl = "https://api.mwater.co/v3/"
    React.createElement(LoadingLegend, 
      url: "#{apiUrl}maps/legend?type=#{design.type}")

  # Get a list of table ids that can be filtered on
  getFilterableTables: (design, schema) ->
    return if design.table then [design.table] else []

  # True if layer can be edited
  isEditable: () ->
    return false

  # Returns a cleaned design
  cleanDesign: (design, schema) ->
    return design

  # Validates design. Null if ok, message otherwise
  validateDesign: (design, schema) ->
    return null

# Simple class to load legend from server
class LoadingLegend extends React.Component
  @propTypes:  
    url: React.PropTypes.string

  constructor: ->
    super
    @state = { html: "Loading..." }

  componentDidMount: -> 
    $.get(@props.url).success (data) =>
      @setState(html: data)

  componentWillReceiveProps: (nextProps) ->
    if nextProps.url != @props.url
      $.get(nextProps.url).success (data) =>
        @setState(html: data)

  render: ->
    H.div 
      style: { font: "14px/16px Arial, Helvetica, sans-serif", color: "#555" }
      dangerouslySetInnerHTML: { __html: @state.html }
