React = require 'react'
H = React.DOM

Layer = require './Layer'
ExpressionCompiler = require '../expressions/ExpressionCompiler'
injectTableAlias = require '../injectTableAlias'
MarkersLayerDesignerComponent = require './MarkersLayerDesignerComponent'
ExpressionBuilder = require '../expressions/ExpressionBuilder'
AxisBuilder = require '../expressions/axes/AxisBuilder'

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
    # Check if valid
    # TODO clean/validate order??
    if not @design.axes or not @design.axes.geometry
      return null

    @createUrl("png", filters)

  getUtfGridUrl: (filters) -> 
    return null
    # @createUrl("grid.json", filters)

  # Create query string
  createUrl: (extension, filters) ->
    query = "type=jsonql"
    if @client
      query += "&client=" + @client

    # Create design
    mapDesign = {
      layers: [
        { 
          id: "layer0"
          jsonql: @createJsonQL(filters)
        }
      ]
      css: @createCss()
      # interactivity: {
      #   layer: "layer0"
      #   fields: ["id"]
      # }
    }
    query += "&design=" + encodeURIComponent(JSON.stringify(mapDesign))

    return "#{@apiUrl}maps/tiles/{z}/{x}/{y}.#{extension}?" + query

  createJsonQL: (filters) ->
    axisBuilder = new AxisBuilder(schema: @schema)
    exprCompiler = new ExpressionCompiler(@schema)
    exprBuilder = new ExpressionBuilder(@schema)

    # Compile geometry axis
    geometryExpr = axisBuilder.compileAxis(axis: @design.axes.geometry, tableAlias: "innerquery")

    # row_number() over (partition by st_snaptogrid(location, !pixel_width!*5, !pixel_height!*5)) AS r
    cluster = { 
      type: "select" 
      expr: { type: "op", op: "row_number" }
      over: { partitionBy: [
        { type: "op", op: "ST_SnapToGrid", exprs: [
          geometryExpr
          { type: "op", op: "*", exprs: [{ type: "token", token: "!pixel_width!" }, 5]}
          { type: "op", op: "*", exprs: [{ type: "token", token: "!pixel_height!" }, 5]}
          ] }
        ]}
      alias: "r"
    }

    # Select _id, location and clustered row number
    innerquery = { 
      type: "query"
      selects: [
        # { type: "select", expr: { type: "field", tableAlias: "main", column: "_id" }, alias: "id" } # main._id as id
        { type: "select", expr: geometryExpr, alias: "the_geom_webmercator" } # geometry as the_geom_webmercator
        cluster
      ]
      from: exprCompiler.compileTable(@design.table, "innerquery")
    }

    # Create filters. First limit to bounding box
    whereClauses = [
      { 
        type: "op"
        op: "&&"
        exprs: [
          geometryExpr
          { type: "token", token: "!bbox!" }
        ]
      }
    ]

    # Then add filters baked into layer
    if @design.filter
      whereClauses.push(exprCompiler.compileExpr(expr: @design.filter, tableAlias: "innerquery"))

    # Then add extra filters passed in, if relevant
    # Get relevant filters
    relevantFilters = _.where(filters, table: @design.table)
    for filter in relevantFilters
      whereClauses.push(injectTableAlias(filter.jsonql, "innerquery"))

    # Wrap if multiple
    if whereClauses.length > 1
      innerquery.where = { type: "op", op: "and", exprs: whereClauses }
    else
      innerquery.where = whereClauses[0]

    # Create outer query which takes where r <= 3 to limit # of points in a cluster
    outerquery = {
      type: "query"
      selects: [
        # { type: "select", expr: { type: "op", op: "::text", exprs: [{ type: "field", tableAlias: "innerquery", column: "id" }]}, alias: "id" } # innerquery._id::text as id
        { type: "select", expr: { type: "field", tableAlias: "innerquery", column: "the_geom_webmercator" }, alias: "the_geom_webmercator" } # innerquery.the_geom_webmercator as the_geom_webmercator
      ]
      from: { type: "subquery", query: innerquery, alias: "innerquery" }
      where: { type: "op", op: "<=", exprs: [{ type: "field", tableAlias: "innerquery", column: "r" }, 3]}
    }

    return outerquery

  createCss: ->
    '''
    #layer0 {
      marker-fill: #0088FF;
      marker-width: 10;
      marker-line-color: white;
      marker-line-width: 1;
      marker-line-opacity: 0.6;
      marker-placement: point;
      marker-type: ellipse;
      marker-allow-overlap: true;
    }
    '''

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

    exprBuilder = new ExpressionBuilder(@schema)
    axisBuilder = new AxisBuilder(schema: @schema)

    for axisKey, axis of design.axes
      design.axes[axisKey] = axisBuilder.cleanAxis(axis, design.table, "none")

    design.filter = exprBuilder.cleanExpr(design.filter, design.table)

    return design

  # Pass in onDesignChange
  createDesignerElement: (options) ->
    # Clean on way in and out
    React.createElement(MarkersLayerDesignerComponent,
      schema: @schema
      design: @cleanDesign(@design)
      onDesignChange: (design) =>
        options.onDesignChange(@cleanDesign(design)))