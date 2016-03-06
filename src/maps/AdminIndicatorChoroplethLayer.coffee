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


    # select _id, shape, 
    # (select sum(case when valuequery.type = 'Protected dug well' then 1 else 0 end)::decimal/sum(1)
    # from entities.water_point as valuequery where valuequery.admin_region in (select subtree._id from admin_regions as subtree where subtree.path @> json_build_array(admin_regions._id)::jsonb)
    # from admin_regions 
    # where shape && !bbox! and path ->> 0 = 'abed5734-4598-45ac-8d7b-def868c2cb7c' and level = 1  

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
                    cases: [{ when: { type: "op", op: "=", exprs: [{ type: "field", tableAlias: "valuequery", column: "type" }, "Protected dug well"]}, then: 1 }]
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
      from: { type: "table", table: "entities.water_point", alias: "valuequery" }
      where: {
        type: "op"
        op: "in"
        exprs: [
          { type: "field", tableAlias: "valuequery", column: "admin_region" }
          { 
            type: "scalar"
            expr: { type: "field", tableAlias: "subtree", column: "_id" }
            from: { type: "table", table: "admin_regions", alias: "subtree" }
            where: { 
              type: "op"
              op: "@>"
              exprs: [
                { type: "field", tableAlias: "subtree", column: "path" }
                { type: "op", op: "::jsonb", exprs: [{ type: "op", op: "json_build_array", exprs: [{ type: "field", tableAlias: "admin_regions", column: "_id" }] }] }                
              ]
            }
          }
        ]
      }
    }


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
        exprs: [
          { 
            type: "op"
            op: "&&"
            exprs: [
              { type: "field", tableAlias: "admin_regions", column: "shape" }
              { type: "token", token: "!bbox!" }
            ]
          }
          {
            type: "op"
            op: "="
            exprs: [
              { type: "op", op: "->>", exprs: [{ type: "field", tableAlias: "admin_regions", column: "path" }, 0] }
              "39dc194a-ffed-4a9c-95bf-1761a8d0b794"
            ]
          }
          {
            type: "op"
            op: "="
            exprs: [
              { type: "field", tableAlias: "admin_regions", column: "level" }
              1
            ]
          }
        ]
      }
    }

    # # Then add extra filters passed in, if relevant
    # # Get relevant filters
    # relevantFilters = _.where(filters, table: sublayer.table)
    # for filter in relevantFilters
    #   whereClauses.push(injectTableAlias(filter.jsonql, "innerquery"))

    # whereClauses = _.compact(whereClauses)
    
    # # Wrap if multiple
    # if whereClauses.length > 1
    #   innerquery.where = { type: "op", op: "and", exprs: whereClauses }
    # else
    #   innerquery.where = whereClauses[0]

    # Create outer query which takes where r <= 3 to limit # of points in a cluster
    # outerquery = {
    #   type: "query"
    #   selects: [
    #     { type: "select", expr: { type: "op", op: "::text", exprs: [{ type: "field", tableAlias: "innerquery", column: "id" }]}, alias: "id" } # innerquery._id::text as id
    #     { type: "select", expr: { type: "field", tableAlias: "innerquery", column: "the_geom_webmercator" }, alias: "the_geom_webmercator" } # innerquery.the_geom_webmercator as the_geom_webmercator
    #   ]
    #   from: { type: "subquery", query: innerquery, alias: "innerquery" }
    #   where: { type: "op", op: "<=", exprs: [{ type: "field", tableAlias: "innerquery", column: "r" }, 3]}
    # }

    # # Add color select if color axis
    # if sublayer.axes.color
    #   outerquery.selects.push({ type: "select", expr: { type: "field", tableAlias: "innerquery", column: "color" }, alias: "color" }) # innerquery.color as color

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

  # getFilterableTables: -> 
  #   return _.uniq(_.compact(_.pluck(@design.sublayers, "table")))

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