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
  # Gets the layer definition as JsonQL + CSS in format:
  #   {
  #     layers: array of { id: layer id, jsonql: jsonql that includes "the_webmercator_geom" as a column }
  #     css: carto css
  #     interactivity: (optional) { layer: id of layer, fields: array of field names }
  #   }
  # arguments:
  #   design: design of layer
  #   schema: schema to use
  #   filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to put in table alias
  getJsonQLCss: (design, schema, filters) ->
    # Create design
    layerDef = {
      layers: _.map(design.sublayers, (sublayer, i) =>
        { 
          id: "layer#{i}"
          jsonql: @createJsonQL(sublayer, schema, filters)
        })
      css: @createCss(design, schema)
      interactivity: { # TODO Interactivity is only first sublayer!
        layer: "layer0"
        fields: ["id"]
      }
    }

    return layerDef

  createJsonQL: (sublayer, schema, filters) ->
    axisBuilder = new AxisBuilder(schema: schema)
    exprCompiler = new ExprCompiler(schema)

    # Compile geometry axis
    geometryExpr = axisBuilder.compileAxis(axis: sublayer.axes.geometry, tableAlias: "innerquery")

    # Convert to Web mercator (3857)
    geometryExpr = { type: "op", op: "ST_Transform", exprs: [geometryExpr, 3857] }

    # row_number() over (partition by st_snaptogrid(location, !pixel_width!*5, !pixel_height!*5)) AS r
    cluster = { 
      type: "select" 
      expr: { type: "op", op: "row_number", exprs: [] }
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
        { type: "select", expr: { type: "field", tableAlias: "innerquery", column: schema.getTable(sublayer.table).primaryKey }, alias: "id" } # main primary key as id
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

  # Creates CartoCSS
  createCss: (design, schema) ->
    css = ""
    _.each design.sublayers, (sublayer, index) =>
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

  # Called when the interactivity grid is clicked. 
  # arguments:
  #   ev: { data: interactivty data e.g. `{ id: 123 }` }
  #   options: 
  #     design: design of layer
  #     schema: schema to use
  #     dataSource: data source to use
  # 
  # Returns:
  #   null/undefined to do nothing
  #   [table id, primary key] to open a default system popup if one is present
  #   React element to put into a popup
  onGridClick: (ev, options) ->
    if ev.data and ev.data.id
      return [options.design.sublayers[0].table, ev.data.id]
    return null

  # Get min and max zoom levels
  getMinZoom: (design) -> return null
  getMaxZoom: (design) -> return null

  # Get the legend to be optionally displayed on the map. Returns
  # a React element
  getLegend: (design, schema) ->
    # TODO
    return null

  # Get a list of table ids that can be filtered on
  getFilterableTables: (design, schema) ->
    return []

  # True if layer can be edited
  isEditable: (design, schema) ->
    return true

  # Creates a design element with specified options
  # options:
  #   design: design of layer
  #   schema: schema to use
  #   dataSource: data source to use
  #   onDesignChange: function called when design changes
  createDesignerElement: (options) ->
    # Clean on way in and out
    React.createElement(MarkersLayerDesignerComponent,
      schema: options.schema
      dataSource: options.dataSource
      design: @cleanDesign(options.design, options.schema)
      onDesignChange: (design) =>
        options.onDesignChange(@cleanDesign(design, options.schema)))

  # Returns a cleaned design
  cleanDesign: (design, schema) ->
    exprCleaner = new ExprCleaner(schema)
    axisBuilder = new AxisBuilder(schema: schema)

    # TODO clones entirely
    design = _.cloneDeep(design)
    design.sublayers = design.sublayers or [{}]

    for sublayer in design.sublayers
      sublayer.axes = sublayer.axes or {}
      sublayer.color = sublayer.color or "#0088FF"

      sublayer.axes.geometry = axisBuilder.cleanAxis(axis: sublayer.axes.geometry, table: sublayer.table, types: ['geometry'], aggrNeed: "none")
      sublayer.axes.color = axisBuilder.cleanAxis(axis: sublayer.axes.color, table: sublayer.table, types: ['enum', 'text', 'boolean'], aggrNeed: "none")

      sublayer.filter = exprCleaner.cleanExpr(sublayer.filter, { table: sublayer.table })

    return design

  # Validates design. Null if ok, message otherwise
  validateDesign: (design, schema) ->
    axisBuilder = new AxisBuilder(schema: schema)

    if design.sublayers.length < 1
      return "No sublayers"

    for sublayer in design.sublayers
      if not sublayer.axes or not sublayer.axes.geometry
        return "Missing axes"

      error = axisBuilder.validateAxis(axis: sublayer.axes.geometry)
      if error then return error

    return null
