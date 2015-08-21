React = require 'react'
H = React.DOM

Layer = require './Layer'
ExpressionCompiler = require '../expressions/ExpressionCompiler'
injectTableAlias = require '../injectTableAlias'
MarkersLayerDesignerComponent = require './MarkersLayerDesignerComponent'

###
Layer that is composed of markers
Design is:
  table: table to get data from
  axes: axes (see below)
  filter: optional logical expression to filter by
  color: color of layer (e.g. #FF8800). Color axis overrides

axes:
  geometry: where to place markers
  color: color axis (to split into series based on a color)
###
module.exports = class MarkersLayer extends Layer
  # Pass design, client, apiUrl, schema
  constructor: (options) ->
    @design = options.design
    @client = options.client
    @apiUrl = options.apiUrl
    @schema = options.schema

  getTileUrl: (filters) -> 
    @createUrl("png", filters)

  getUtfGridUrl: (filters) -> 
    @createUrl("grid.json", filters)

  # Create query string
  createUrl: (extension, filters) ->
    return null

    # # TODO client
    # url = "#{@apiUrl}maps/tiles/{z}/{x}/{y}.#{extension}?type=#{@design.type}&radius=1000"

    # if @client
    #   url += "&client=#{@client}"
      
    # # Add where for any relevant filters
    # relevantFilters = _.where(filters, table: @design.table)

    # # If any, create and
    # whereClauses = _.map(relevantFilters, (f) => injectTableAlias(f.jsonql, "main"))

    # # Wrap if multiple
    # if whereClauses.length > 1
    #   where = { type: "op", op: "and", exprs: whereClauses }
    # else
    #   where = whereClauses[0]

    # if where 
    #   url += "&where=" + encodeURIComponent(JSON.stringify(where))

    # return url

  getFilterableTables: -> 
    if @design.table
      return [@design.table]
    else
      return []

  getLegend: ->
    # return H.div null, "Legend here"
    # # # Create loading legend component
    # # React.createElement(LoadingLegend, 
    # #   url: "#{@apiUrl}maps/legend?type=#{@design.type}")
  
  isEditable: -> true

  # Returns a cleaned design
  # TODO this is awkward since the design is part of the object too
  cleanDesign: (design) ->
    # TODO clones entirely
    design = _.cloneDeep(design)
    design.axes = design.axes or {}

    # TODO table, filters, etc.
    return design

  # Pass in onDesignChange
  createDesignerElement: (options) ->
    # Clean on way in and out
    React.createElement(MarkersLayerDesignerComponent,
      schema: @schema
      design: @cleanDesign(@design)
      onDesignChange: (design) =>
        options.onDesignChange(@cleanDesign(design)))