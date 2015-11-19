Layer = require './Layer'
ExprCompiler = require('mwater-expressions').ExprCompiler
injectTableAlias = require('mwater-expressions').injectTableAlias

React = require 'react'
H = React.DOM

# Layer defined on the mWater server
# Design is:
# type: type of layer on server
# table: table to filter on (e.g. entities.water_point)
# minZoom: optional minimum zoom
# maxZoom: optional maximum zoom
module.exports = class MWaterServerLayer extends Layer
  # Pass design, client, apiUrl, onMarkerClick
  # onMarkerClick takes (table, id) and is the table and id of the row that is represented by the click
  constructor: (options) ->
    @design = options.design
    @client = options.client
    @apiUrl = options.apiUrl
    @onMarkerClick = options.onMarkerClick

  getTileUrl: (filters) -> 
    @createUrl("png", filters)

  getUtfGridUrl: (filters) -> 
    @createUrl("grid.json", filters)

  # Get min and max zoom levels
  getMinZoom: -> @design.minZoom
  getMaxZoom: -> @design.maxZoom

  # Called when the interactivity grid is clicked. Called with { data: interactivty data e.g. `{ id: 123 }` }
  onGridClick: (ev) ->
    if @onMarkerClick and ev.data and ev.data.id
      @onMarkerClick(@design.table, ev.data.id)

  # Create query string
  createUrl: (extension, filters) ->
    url = "#{@apiUrl}maps/tiles/{z}/{x}/{y}.#{extension}?type=#{@design.type}&radius=1000"

    # Add subdomains: {s} will be substituted with "a", "b" or "c" in leaflet for api.mwater.co only.
    # Used to speed queries
    if url.match(/^https:\/\/api\.mwater\.co\//)
      url = url.replace(/^https:\/\/api\.mwater\.co\//, "https://{s}-api.mwater.co/")

    if @client
      url += "&client=#{@client}"
      
    # Add where for any relevant filters
    relevantFilters = _.where(filters, table: @design.table)

    # If any, create and
    whereClauses = _.map(relevantFilters, (f) => injectTableAlias(f.jsonql, "main"))

    # Wrap if multiple
    if whereClauses.length > 1
      where = { type: "op", op: "and", exprs: whereClauses }
    else
      where = whereClauses[0]

    if where 
      url += "&where=" + encodeURIComponent(JSON.stringify(where))

    return url

  getFilterableTables: -> [@design.table]

  getLegend: ->
    # Create loading legend component
    React.createElement(LoadingLegend, 
      url: "#{@apiUrl}maps/legend?type=#{@design.type}")

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
