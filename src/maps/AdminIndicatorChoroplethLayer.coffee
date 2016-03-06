React = require 'react'
H = React.DOM

Layer = require './Layer'
ExprCompiler = require('mwater-expressions').ExprCompiler
injectTableAlias = require('mwater-expressions').injectTableAlias
ExprCleaner = require('mwater-expressions').ExprCleaner
AxisBuilder = require '../axes/AxisBuilder'

###
Layer that is composed of administrative regions colored by an indicator
Design is:
  table: table to get data from
  adminRegionExpr: expression to get admin region id

  condition: filter for numerator
  basis: optional filter for numerator and denominator
  factor: optional value to use for calculating
###
module.exports = class AdminIndicatorChoroplethLayer extends Layer
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
    return
    # if @onMarkerClick and ev.data and ev.data.id
    #   @onMarkerClick(@design.sublayers[0].table, ev.data.id)

  # Create query string
  createUrl: (extension, design, filters) ->
    query = "type=jsonql"
    if @client
      query += "&client=" + @client

    # Create design
    mapDesign = {
      layers: [{ id: "layer0", jsonql: @createJsonQL(design, filters)
        }
      ]
      css: @createCss()
      # interactivity: { 
      #   layer: "layer0"
      #   fields: ["id"]
      # }
    }

    query += "&design=" + encodeURIComponent(JSON.stringify(mapDesign))

    url = "#{@apiUrl}maps/tiles/{z}/{x}/{y}.#{extension}?" + query

    # Add subdomains: {s} will be substituted with "a", "b" or "c" in leaflet for api.mwater.co only.
    # Used to speed queries
    if url.match(/^https:\/\/api\.mwater\.co\//)
      url = url.replace(/^https:\/\/api\.mwater\.co\//, "https://{s}-api.mwater.co/")

    return url

  createJsonQL: (design, filters) ->
    axisBuilder = new AxisBuilder(schema: @schema)
    exprCompiler = new ExprCompiler(@schema)


    # select _id, /*shape, */
    # (select sum(case when wp.type = 'Protected dug well' then 1.0 else 0.0 end)::decimal/sum(1.0)
    # from entities.water_point as wp inner join admin_region_subtrees on wp.admin_region = admin_region_subtrees.descendant where admin_region_subtrees.ancestor = admin_regions._id)
    # from admin_regions 
    # where shape && !bbox! and path ->> 0 = '39dc194a-ffed-4a9c-95bf-1761a8d0b794' and level = 1  

    valueQuery = {
      type: "scalar"
      expr: {
        type: "op"
        op: "/"
        exprs: [
          { 
            type: "op"
            op: "::decimal"
            exprs: [
              { 
                type: "op"
                op: "sum"
                exprs: [
                  { 
                    type: "case"
                    cases: [{ when: { type: "op", op: "=", exprs: [{ type: "field", tableAlias: "innerquery", column: "type" }, "Protected dug well"]}, then: 1 }]
                    else: 0
                  }
                ]
              }
            ]
          }
          { 
            type: "op"
            op: "sum"
            exprs: [1]
          }
        ]
      }
      from: {
        type: "join"
        left: { type: "table", table: "entities.water_point", alias: "innerquery" }
        right: { type: "table", table: "admin_region_subtrees", alias: "admin_region_subtrees" }
        kind: "inner"
        on: {
          type: "op"
          op: "="
          exprs: [
            { type: "field", tableAlias: "innerquery", column: "admin_region" }
            { type: "field", tableAlias: "admin_region_subtrees", column: "descendant" }
          ]
        }
      }
      where: {
        type: "op"
        op: "="
        exprs: [
          { type: "field", tableAlias: "admin_region_subtrees", column: "ancestor" }
          { type: "field", tableAlias: "admin_regions", column: "_id" }
        ]
      }
    }

    # Then add extra filters passed in, if relevant
    relevantFilters = _.where(filters, table: design.table)
    extraWhereClauses = []
    for filter in relevantFilters
      extraWhereClauses.push(injectTableAlias(filter.jsonql, "innerquery"))
    extraWhereClauses = _.compact(extraWhereClauses)

    if extraWhereClauses.length > 0
      valueQuery.where = { type: "op", op: "and", exprs: [valueQuery.where].concat(extraWhereClauses) }

    wheres = [
      # Bounding box
      { 
        type: "op"
        op: "&&"
        exprs: [
          { type: "field", tableAlias: "admin_regions", column: "shape" }
          { type: "token", token: "!bbox!" }
        ]
      }
      # Outer administative region
      {
        type: "op"
        op: "="
        exprs: [
          { type: "op", op: "->>", exprs: [{ type: "field", tableAlias: "admin_regions", column: "path" }, 0] }
          "39dc194a-ffed-4a9c-95bf-1761a8d0b794"
        ]
      }
      # Level to display
      {
        type: "op"
        op: "="
        exprs: [
          { type: "field", tableAlias: "admin_regions", column: "level" }
          1
        ]
      }
    ]

    query = {
      type: "query"
      selects: [
        { type: "select", expr: { type: "field", tableAlias: "admin_regions", column: "_id" }, alias: "id" }
        { type: "select", expr: { type: "field", tableAlias: "admin_regions", column: "shape" }, alias: "the_geom_webmercator" }
        { type: "select", expr: valueQuery, alias: "value" } 
      ]
      from: { type: "table", table: "admin_regions", alias: "admin_regions" }
      where: {
        type: "op"
        op: "and"
        exprs: wheres
      }
    }

    return query

  createCss: ->
    css = '''
      #layer0 {
        line-color: #000;
        line-width: 1.5;
        line-opacity: 0.5;
        polygon-opacity: 0.7;
        polygon-fill: #ffffff;
      }
    '''

    colors = [
      "#f7fbff"
      "#deebf7"
      "#c6dbef"
      "#9ecae1"
      "#6baed6"
      "#4292c6"
      "#2171b5"
      "#08519c"
      "#08306b"
    ]

    for i in [0...9]
      css += "\n#layer0 [value >= #{i/9}][value <= #{(i+1)/9}] { polygon-fill: #{colors[i]} }"

    return css

  getFilterableTables: -> 
    return [@design.table]

  # getLegend: ->
  #   # return H.div null, "Legend here"
  #   # # # Create loading legend component
  #   # # React.createElement(LoadingLegend, 
  #   # #   url: "#{@apiUrl}maps/legend?type=#{@design.type}")
  
  # isEditable: -> true

  # # True if layer is incomplete (e.g. brand new) and should be editable immediately
  # isIncomplete: ->
  #   return @validateDesign(@cleanDesign(@design))

  # # Returns a cleaned design
  # # TODO this is awkward since the design is part of the object too
  # cleanDesign: (design) ->
  #   exprCleaner = new ExprCleaner(@schema)
  #   axisBuilder = new AxisBuilder(schema: @schema)

  #   # TODO clones entirely
  #   design = _.cloneDeep(design)
  #   design.sublayers = design.sublayers or [{}]

  #   for sublayer in design.sublayers
  #     sublayer.axes = sublayer.axes or {}
  #     sublayer.color = sublayer.color or "#0088FF"

  #     for axisKey, axis of sublayer.axes
  #       sublayer.axes[axisKey] = axisBuilder.cleanAxis(axis: axis, table: sublayer.table, aggrNeed: "none")

  #     sublayer.filter = exprCleaner.cleanExpr(sublayer.filter, { table: sublayer.table })

  #   return design

  validateDesign: (design) ->
    return null
  #   axisBuilder = new AxisBuilder(schema: @schema)

  #   if design.sublayers.length < 1
  #     return "No sublayers"

  #   for sublayer in design.sublayers
  #     if not sublayer.axes or not sublayer.axes.geometry
  #       return "Missing axes"

  #     error = axisBuilder.validateAxis(axis: sublayer.axes.geometry)
  #     if error then return error

  #   return null

  # # Pass in onDesignChange
  # createDesignerElement: (options) ->
  #   # Clean on way in and out
  #   React.createElement(MarkersLayerDesignerComponent,
  #     schema: @schema
  #     dataSource: @dataSource
  #     design: @cleanDesign(@design)
  #     onDesignChange: (design) =>
  #       options.onDesignChange(@cleanDesign(design)))