React = require 'react'
H = React.DOM

Layer = require './Layer'
ExprCompiler = require('mwater-expressions').ExprCompiler
injectTableAlias = require('mwater-expressions').injectTableAlias
MarkersLayerDesignerComponent = require './MarkersLayerDesignerComponent'
ExprCleaner = require('mwater-expressions').ExprCleaner
AxisBuilder = require '../axes/AxisBuilder'

###
Layer that is composed of markers
Design is:
  sublayers: array of sublayers

sublayer:
  table: table to get data from
  axes: axes (see below)
  filter: optional logical expression to filter by
  color: color of layer (e.g. #FF8800). Color axis overrides
  symbol: symbol to use for layer. e.g. "font-awesome/bell". Will be converted on server to proper uri.

axes:
  geometry: where to place markers
  color: color axis (to split into series based on a color)

###
module.exports = class MarkersLayer extends Layer
  # Pass design, client, apiUrl, schema, dataSource
  # onMarkerClick takes (table, id) and is the table and id of the row that is represented by the click
  constructor: (options) ->
    @design = options.design
    @client = options.client
    @apiUrl = options.apiUrl
    @schema = options.schema
    @dataSource = options.dataSource
    @onMarkerClick = options.onMarkerClick

  getTileUrl: (filters) -> 
    # Check if valid
    # TODO clean/validate order??
    design = @cleanDesign(@design)
    
    if @validateDesign(design)
      return null

    @createUrl("png", design, filters)

  getUtfGridUrl: (filters) -> 
    # Check if valid
    # TODO clean/validate order??
    design = @cleanDesign(@design)
    
    if @validateDesign(design)
      return null

    @createUrl("grid.json", design, filters)

  # Called when the interactivity grid is clicked. Called with { data: interactivty data e.g. `{ id: 123 }` }
  onGridClick: (ev) ->
    if @onMarkerClick and ev.data and ev.data.id
      @onMarkerClick(@design.sublayers[0].table, ev.data.id)

  # Create query string
  createUrl: (extension, design, filters) ->
    query = "type=jsonql"
    if @client
      query += "&client=" + @client

    # Create design
    mapDesign = {
      layers: _.map(design.sublayers, (sublayer, i) =>
        { 
          id: "layer#{i}"
          jsonql: @createJsonQL(sublayer, filters)
        })
      css: @createCss()
      interactivity: { # TODO Interactivity is only first sublayer!
        layer: "layer0"
        fields: ["id"]
      }
    }

    query += "&design=" + encodeURIComponent(JSON.stringify(mapDesign))

    url = "#{@apiUrl}maps/tiles/{z}/{x}/{y}.#{extension}?" + query

    # Add subdomains: {s} will be substituted with "a", "b" or "c" in leaflet for api.mwater.co only.
    # Used to speed queries
    if url.match(/^https:\/\/api\.mwater\.co\//)
      url = url.replace(/^https:\/\/api\.mwater\.co\//, "https://{s}-api.mwater.co/")

    return url

  createJsonQL: (sublayer, filters) ->
    axisBuilder = new AxisBuilder(schema: @schema)
    exprCompiler = new ExprCompiler(@schema)

    # Compile geometry axis
    geometryExpr = axisBuilder.compileAxis(axis: sublayer.axes.geometry, tableAlias: "innerquery")

    # Convert to Web mercator (3857)
    geometryExpr = { type: "op", op: "ST_Transform", exprs: [geometryExpr, 3857] }

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
        { type: "select", expr: { type: "field", tableAlias: "innerquery", column: @schema.getTable(sublayer.table).primaryKey }, alias: "id" } # main primary key as id
        { type: "select", expr: geometryExpr, alias: "the_geom_webmercator" } # geometry as the_geom_webmercator
        cluster
      ]
      from: exprCompiler.compileTable(sublayer.table, "innerquery")
    }

    # Add color select if color axis
    if sublayer.axes.color
      colorExpr = axisBuilder.compileAxis(axis: sublayer.axes.color, tableAlias: "innerquery")
      innerquery.selects.push({ type: "select", expr: colorExpr, alias: "color" })

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
    if sublayer.filter
      whereClauses.push(exprCompiler.compileExpr(expr: sublayer.filter, tableAlias: "innerquery"))

    # Then add extra filters passed in, if relevant
    # Get relevant filters
    relevantFilters = _.where(filters, table: sublayer.table)
    for filter in relevantFilters
      whereClauses.push(injectTableAlias(filter.jsonql, "innerquery"))

    whereClauses = _.compact(whereClauses)
    
    # Wrap if multiple
    if whereClauses.length > 1
      innerquery.where = { type: "op", op: "and", exprs: whereClauses }
    else
      innerquery.where = whereClauses[0]

    # Create outer query which takes where r <= 3 to limit # of points in a cluster
    outerquery = {
      type: "query"
      selects: [
        { type: "select", expr: { type: "op", op: "::text", exprs: [{ type: "field", tableAlias: "innerquery", column: "id" }]}, alias: "id" } # innerquery._id::text as id
        { type: "select", expr: { type: "field", tableAlias: "innerquery", column: "the_geom_webmercator" }, alias: "the_geom_webmercator" } # innerquery.the_geom_webmercator as the_geom_webmercator
      ]
      from: { type: "subquery", query: innerquery, alias: "innerquery" }
      where: { type: "op", op: "<=", exprs: [{ type: "field", tableAlias: "innerquery", column: "r" }, 3]}
    }

    # Add color select if color axis
    if sublayer.axes.color
      outerquery.selects.push({ type: "select", expr: { type: "field", tableAlias: "innerquery", column: "color" }, alias: "color" }) # innerquery.color as color

    return outerquery

  createCss: ->
    css = ""
    _.each @design.sublayers, (sublayer, index) =>
      if sublayer.symbol
        symbol = "marker-file: url(#{sublayer.symbol});"
      else
        symbol = "marker-type: ellipse;"

      css += '''
        #layer''' + index + ''' {
          marker-fill: ''' + (sublayer.color or "#666666") + ''';
          marker-width: 10;
          marker-line-color: white;
          marker-line-width: 1;
          marker-line-opacity: 0.6;
          marker-placement: point;
          ''' + symbol + '''
          marker-allow-overlap: true;
        }

      '''

      # If color axes, add color conditions
      if sublayer.axes.color and sublayer.axes.color.colorMap
        for item in sublayer.axes.color.colorMap
          css += "#layer#{index} [color=#{JSON.stringify(item.value)}] { marker-fill: #{item.color} }\n"

    return css

  getFilterableTables: -> 
    return _.uniq(_.compact(_.pluck(@design.sublayers, "table")))

  getLegend: ->
    # return H.div null, "Legend here"
    # # # Create loading legend component
    # # React.createElement(LoadingLegend, 
    # #   url: "#{@apiUrl}maps/legend?type=#{@design.type}")
  
  isEditable: -> true

  # Returns a cleaned design
  # TODO this is awkward since the design is part of the object too
  cleanDesign: (design) ->
    exprCleaner = new ExprCleaner(@schema)
    axisBuilder = new AxisBuilder(schema: @schema)

    # TODO clones entirely
    design = _.cloneDeep(design)
    design.sublayers = design.sublayers or [{}]

    for sublayer in design.sublayers
      sublayer.axes = sublayer.axes or {}
      sublayer.color = sublayer.color or "#0088FF"

      for axisKey, axis of sublayer.axes
        sublayer.axes[axisKey] = axisBuilder.cleanAxis(axis: axis, table: sublayer.table, aggrNeed: "none")

      sublayer.filter = exprCleaner.cleanExpr(sublayer.filter, { table: sublayer.table })

    return design

  validateDesign: (design) ->
    axisBuilder = new AxisBuilder(schema: @schema)

    if design.sublayers.length < 1
      return "No sublayers"

    for sublayer in design.sublayers
      if not sublayer.axes or not sublayer.axes.geometry
        return "Missing axes"

      error = axisBuilder.validateAxis(axis: sublayer.axes.geometry)
      if error then return error

    return null

  # Pass in onDesignChange
  createDesignerElement: (options) ->
    # Clean on way in and out
    React.createElement(MarkersLayerDesignerComponent,
      schema: @schema
      dataSource: @dataSource
      design: @cleanDesign(@design)
      onDesignChange: (design) =>
        options.onDesignChange(@cleanDesign(design)))