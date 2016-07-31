_ = require 'lodash'
React = require 'react'
H = React.DOM

Layer = require './Layer'
ExprCompiler = require('mwater-expressions').ExprCompiler
injectTableAlias = require('mwater-expressions').injectTableAlias
ExprCleaner = require('mwater-expressions').ExprCleaner
ExprUtils = require('mwater-expressions').ExprUtils
AxisBuilder = require '../axes/AxisBuilder'
LegendGroup = require './LegendGroup'

###
Layer which draws a buffer around geometries (i.e. a radius circle around points)

Design is:
  table: table to get data from
  axes: axes (see below)
  filter: optional logical expression to filter by
  color: color of layer (e.g. #FF8800). Color axis overrides
  fillOpacity: Opacity to fill the circles (0-1)
  radius: radius to draw in meters

axes:
  geometry: where to draw buffers around
  color: color axis 

###
module.exports = class BufferLayer extends Layer
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
      layers: [{ id: "layer0", jsonql: @createJsonQL(design, schema, filters) }]
      css: @createCss(design, schema, filters)
    }
    
    return layerDef

  createJsonQL: (design, schema, filters) ->
    axisBuilder = new AxisBuilder(schema: schema)
    exprCompiler = new ExprCompiler(schema)

    ### 
    Query:
      select 
      <primary key> as id,
      [<color axis> as color,
      st_transform(st_buffer(st_transform(<geometry axis>, 4326)::geography, <radius>)::geometry, 3857) as the_geom_webmercator
      from <table> as main
      where
        <geometry axis> is not null
        # Bounding box filter for speed 
      and <geometry axis> && 
      ST_Transform(ST_Expand(
        # Prevent 3857 overflow (i.e. > 85 degrees lat) 
        ST_Intersection(
          ST_Transform(!bbox!, 4326),
          ST_Expand(ST_MakeEnvelope(-180, -85, 180, 85, 4326), -<radius in degrees>))
        , <radius in degrees>})
      , 3857)
      and <other filters>
    ###

    # Compile geometry axis
    geometryExpr = axisBuilder.compileAxis(axis: design.axes.geometry, tableAlias: "main")

    # st_transform(st_buffer(st_transform(<geometry axis>, 4326)::geography, <radius>)::geometry, 3857) as the_geom_webmercator
    bufferedGeometry = {
      type: "op", op: "ST_Transform", exprs: [
        { type: "op", op: "::geometry", exprs: [
          { type: "op", op: "ST_Buffer", exprs: [
            { type: "op", op: "::geography", exprs: [{ type: "op", op: "ST_Transform", exprs: [geometryExpr, 4326] }] }
            design.radius
            ]}
          ]}
        3857
      ]
    }
    # geometryExpr = { type: "op", op: "ST_Transform", exprs: [geometryExpr, 3857] }

    selects = [
      { type: "select", expr: { type: "field", tableAlias: "main", column: schema.getTable(design.table).primaryKey }, alias: "id" } # main primary key as id
      { type: "select", expr: bufferedGeometry, alias: "the_geom_webmercator" } 
    ]

    # Add color select if color axis
    if design.axes.color
      colorExpr = axisBuilder.compileAxis(axis: design.axes.color, tableAlias: "main")
      selects.push({ type: "select", expr: colorExpr, alias: "color" })
    
    # Select _id, location and clustered row number
    query = { 
      type: "query"
      selects: selects
      from: exprCompiler.compileTable(design.table, "main")
    }

    # ST_Transform(ST_Expand(
    #     # Prevent 3857 overflow (i.e. > 85 degrees lat) 
    #     ST_Intersection(
    #       ST_Transform(!bbox!, 4326),
    #       ST_Expand(ST_MakeEnvelope(-180, -85, 180, 85, 4326), -<radius in degrees>))
    #     , <radius in degrees>})
    #   , 3857)
    # TODO document how we compute this
    radiusDeg = design.radius / 100000

    boundingBox = {
      type: "op"
      op: "ST_Transform"
      exprs: [
        { type: "op", op: "ST_Expand", exprs: [
          { type: "op", op: "ST_Intersection", exprs: [
            { type: "op", op: "ST_Transform", exprs: [
              { type: "token", token: "!bbox!" } 
              4326
              ]}
            { type: "op", op: "ST_Expand", exprs: [
              { type: "op", op: "ST_MakeEnvelope", exprs: [-180, -85, 180, 85, 4326] }
              -radiusDeg
              ]}
            ]}
          radiusDeg
          ]}
        3857
      ]
    }

    # Create filters. First ensure geometry and limit to bounding box
    whereClauses = [
      { type: "op", op: "is not null", exprs: [geometryExpr] }
      { 
        type: "op"
        op: "&&"
        exprs: [
          geometryExpr
          boundingBox
        ]
      }
    ]

    # Then add filters baked into layer
    if design.filter
      whereClauses.push(exprCompiler.compileExpr(expr: design.filter, tableAlias: "main"))

    # Then add extra filters passed in, if relevant
    # Get relevant filters
    relevantFilters = _.where(filters, table: design.table)
    for filter in relevantFilters
      whereClauses.push(injectTableAlias(filter.jsonql, "main"))

    whereClauses = _.compact(whereClauses)
    
    # Wrap if multiple
    if whereClauses.length > 1
      query.where = { type: "op", op: "and", exprs: whereClauses }
    else
      query.where = whereClauses[0]

    return query

  createCss: (design, schema) ->
    css = ""
    
    if design.color
      css += '''
        #layer0 {
          opacity: ''' + design.fillOpacity + ''';
          polygon-fill: ''' + design.color + ''';
        }
      '''

    # If color axes, add color conditions
    if design.axes.color and design.axes.color.colorMap
      for item, i in design.axes.color.colorMap
        css += "#layer0::#{i} [color=#{JSON.stringify(item.value)}] { polygon-fill: #{item.color}; opacity: #{design.fillOpacity}; }\n"

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
    return null

  # Get min and max zoom levels
  getMinZoom: (design) -> 
    # TODO hide when zoomed out too far
    return null

  getMaxZoom: (design) -> null

  # Get the legend to be optionally displayed on the map. Returns
  # a React element
  getLegend: (design, schema, name) ->
    exprUtils = new ExprUtils(schema)
    if design.axes.color and design.axes.color.colorMap
      enums = exprUtils.getExprEnumValues(design.axes.color.expr)

      colors = _.map design.axes.color.colorMap, (colorItem) =>
        {color: colorItem.color, name: ExprUtils.localizeString(_.find(enums, {id: colorItem.value}).name) }
      colors.push({ color: design.color, name: "None"})
    else
      colors = [{ color: design.color, name: "None"}]

    layerTitleStyle =
      margin: 2
      fontWeight: 'bold'
      borderBottom: '1px solid #cecece'
    H.div null,
      H.p style: layerTitleStyle, name
      React.createElement(LegendGroup, {items: colors, key: design.axes.geometry.expr.table})

  # Get a list of table ids that can be filtered on
  getFilterableTables: (design, schema) -> [design.table]

  # True if layer can be edited
  isEditable: (design, schema) -> true

  # True if layer is incomplete (e.g. brand new) and should be editable immediately
  isIncomplete: (design, schema) ->
    return @validateDesign(design, schema)?

  # Creates a design element with specified options
  # options:
  #   design: design of layer
  #   schema: schema to use
  #   dataSource: data source to use
  #   onDesignChange: function called when design changes
  createDesignerElement: (options) ->
    # Require here to prevent server require problems
    BufferLayerDesignerComponent = require './BufferLayerDesignerComponent'

    # Clean on way in and out
    React.createElement(BufferLayerDesignerComponent,
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

    design.axes = design.axes or {}
    design.radius = design.radius or 1000
    design.fillOpacity = if design.fillOpacity? then design.fillOpacity else 0.5

    design.axes.geometry = axisBuilder.cleanAxis(axis: design.axes.geometry, table: design.table, types: ['geometry'], aggrNeed: "none")
    design.axes.color = axisBuilder.cleanAxis(axis: design.axes.color, table: design.table, types: ['enum', 'text', 'boolean'], aggrNeed: "none")

    design.filter = exprCleaner.cleanExpr(design.filter, { table: design.table })

    return design

  # Validates design. Null if ok, message otherwise
  validateDesign: (design, schema) ->
    axisBuilder = new AxisBuilder(schema: schema)

    if not design.table
      return "Missing table"

    if not design.radius?
      return "Missing radius"

    if not design.axes or not design.axes.geometry
      return "Missing axes"

    error = axisBuilder.validateAxis(axis: design.axes.geometry)
    if error then return error

    error = axisBuilder.validateAxis(axis: design.axes.color)
    if error then return error
  
    return null

  createKMLExportJsonQL: (design, schema, filters) ->
    axisBuilder = new AxisBuilder(schema: schema)
    exprCompiler = new ExprCompiler(schema)
    # Compile geometry axis
    geometryExpr = axisBuilder.compileAxis(axis: design.axes.geometry, tableAlias: "main")

    # st_transform(st_buffer(st_transform(<geometry axis>, 4326)::geography, <radius>)::geometry, 3857) as the_geom_webmercator
    bufferedGeometry = {
      type: "op", op: "ST_AsGeoJson", exprs: [
        { type: "op", op: "::geometry", exprs: [
          { type: "op", op: "ST_Buffer", exprs: [
            { type: "op", op: "::geography", exprs: [{ type: "op", op: "ST_Transform", exprs: [geometryExpr, 4326] }] }
            design.radius
            ]}
          ]}
      ]
    }

    # bufferedGeometry = {
    #   type: "op", op: "ST_Transform", exprs: [
    #     { type: "op", op: "::geometry", exprs: [
    #       { type: "op", op: "ST_Buffer", exprs: [
    #         { type: "op", op: "::geography", exprs: [{ type: "op", op: "ST_Transform", exprs: [geometryExpr, 4326] }] }
    #         design.radius
    #         ]}
    #       ]}
    #     3857
    #   ]
    # }
    # geometryExpr = { type: "op", op: "ST_Transform", exprs: [geometryExpr, 3857] }

    selects = [
      { type: "select", expr: { type: "field", tableAlias: "main", column: schema.getTable(design.table).primaryKey }, alias: "id" } # main primary key as id
      { type: "select", expr: bufferedGeometry, alias: "the_geom_webmercator" } 
    ]

    # Add color select if color axis
    if design.axes.color
      colorExpr = axisBuilder.compileAxis(axis: design.axes.color, tableAlias: "main")
      selects.push({ type: "select", expr: colorExpr, alias: "color" })
    
    # Select _id, location and clustered row number
    query = { 
      type: "query"
      selects: selects
      from: exprCompiler.compileTable(design.table, "main")
    }

    # ST_Transform(ST_Expand(
    #     # Prevent 3857 overflow (i.e. > 85 degrees lat) 
    #     ST_Intersection(
    #       ST_Transform(!bbox!, 4326),
    #       ST_Expand(ST_MakeEnvelope(-180, -85, 180, 85, 4326), -<radius in degrees>))
    #     , <radius in degrees>})
    #   , 3857)
    # TODO document how we compute this
    radiusDeg = design.radius / 100000

    # Create filters. First ensure geometry and limit to bounding box
    whereClauses = [
      { type: "op", op: "is not null", exprs: [geometryExpr] }
    ]

    # Then add filters baked into layer
    if design.filter
      whereClauses.push(exprCompiler.compileExpr(expr: design.filter, tableAlias: "main"))

    # Then add extra filters passed in, if relevant
    # Get relevant filters
    relevantFilters = _.where(filters, table: design.table)
    for filter in relevantFilters
      whereClauses.push(injectTableAlias(filter.jsonql, "main"))

    whereClauses = _.compact(whereClauses)
    
    # Wrap if multiple
    if whereClauses.length > 1
      query.where = { type: "op", op: "and", exprs: whereClauses }
    else
      query.where = whereClauses[0]

    return query

  getKMLExportJsonQL: (design, schema, filters) ->
    style = {
      color: design.color
      opacity: design.fillOpacity
    }

    if design.axes.color and design.axes.color.colorMap
      style.colorMap = design.axes.color.colorMap
      
    layerDef = {
      layers: [{ id: "layer0", jsonql: @createKMLExportJsonQL(design, schema, filters) , style: style}]
    }
    
    return layerDef

  acceptKmlVisitorForRow: (visitor, row) ->
    data = JSON.parse(row.the_geom_webmercator)

    outer = data.coordinates[0]
    inner = data.coordinates.slice(1)

    list = _.map(outer, (coordinates) ->
      coordinates.join(",")
    )

    visitor.addPolygon(list.join(" "), row.color)

