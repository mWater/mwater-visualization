Layer = require './Layer'
ExpressionCompiler = require '../expressions/ExpressionCompiler'
injectTableAlias = require '../injectTableAlias'

React = require 'react'
H = React.DOM

# Layer defined on the mWater server
# Design is:
# type: type of layer on server
# table: table to filter on (e.g. entities.water_point)
module.exports = class MWaterServerLayer extends Layer
  # Pass design, client, apiUrl
  constructor: (options) ->
    @design = options.design
    @client = options.client
    @apiUrl = options.apiUrl

  getTileUrl: (filters) -> 
    @createUrl("png", filters)

  getUtfGridUrl: (filters) -> 
    @createUrl("grid.json", filters)

  # Create query string
  createUrl: (extension, filters) ->
    # TODO client
    url = "#{@apiUrl}maps/tiles/{z}/{x}/{y}.#{extension}?type=#{@design.type}&radius=1000"

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
