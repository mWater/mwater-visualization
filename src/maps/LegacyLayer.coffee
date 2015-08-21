Layer = require './Layer'
ExpressionCompiler = require '../expressions/ExpressionCompiler'
injectTableAlias = require '../injectTableAlias'

React = require 'react'
H = React.DOM

# Legacy server map
module.exports = class LegacyLayer extends Layer
  constructor: (design, schema, client) ->
    @design = design
    @schema = schema
    @client = client

  getTileUrl: (filters) -> 
    @createUrl("png", filters)

  getUtfGridUrl: (filters) -> 
    @createUrl("grid.json", filters)

  # Create query string
  createUrl: (extension, filters) ->
    # TODO client
    url = "https://api.mwater.co/v3/maps/tiles/{z}/{x}/{y}.#{extension}?type=#{@design.type}&radius=1000"

    if @client
      url += "&client=#{@client}"
      
    # Add where for any relevant filters
    relevantFilters = _.where(filters, table: "entities.water_point")

    # If any, create and
    whereClauses = _.map(relevantFilters, (f) => injectTableAlias(f.jsonql, "entities.water_point"))

    # Wrap if multiple
    if whereClauses.length > 1
      where = { type: "op", op: "and", exprs: whereClauses }
    else
      where = whereClauses[0]

    if where 
      url += "&where=" + encodeURIComponent(JSON.stringify(where))

    return url

  compileExpr: (expr) =>
    return new ExpressionCompiler(@schema).compileExpr(expr: expr, tableAlias: "main")

  # getLegend: -> null

  getFilterableTables: -> ['entities.water_point']

  getLegend: ->
    # Create loading legend component
    React.createElement(LoadingLegend, 
      url: "http://localhost:1234/v3/maps/legend?type=#{@design.type}")

class LoadingLegend extends React.Component
  @propTypes:  
    url: React.PropTypes.string

  constructor: ->
    super
    @state = { html: "Loading..." }

  componentDidMount: ->
    $.get(@props.url).success (data) =>
      @setState(html: data)

  render: ->
    H.div 
      style: { font: "14px/16px Arial, Helvetica, sans-serif", color: "#555" }
      dangerouslySetInnerHTML: { __html: @state.html }
