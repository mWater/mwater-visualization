React = require 'react'
H = React.DOM

Layer = require './Layer'
ExprCompiler = require('mwater-expressions').ExprCompiler
ExprUtils = require('mwater-expressions').ExprUtils
injectTableAlias = require('mwater-expressions').injectTableAlias
ExprCleaner = require('mwater-expressions').ExprCleaner
AxisBuilder = require '../axes/AxisBuilder'
AdminIndicatorChoroplethLayerDesigner = require './AdminIndicatorChoroplethLayerDesigner'

###
Layer that is composed of administrative regions colored by an indicator
Design is:
  scope: _id of overall admin region. Null for whole world.
  detailLevel: admin level to disaggregate to 

  table: table to get data from
  adminRegionExpr: expression to get admin region id for calculations

  condition: filter for numerator
  basis: optional filter for numerator and denominator
  factor: optional value to use for calculating
###
module.exports = class AdminIndicatorChoroplethLayer extends Layer
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
      # interactivity: { 
      #   layer: "layer0"
      #   fields: ["id"]
      # }
    }
    
    return layerDef

  createJsonQL: (design, schema, filters) ->
    axisBuilder = new AxisBuilder(schema: schema)
    exprCompiler = new ExprCompiler(schema)

    # select _id, /*shape, */
    # (select sum(case when wp.type = 'Protected dug well' then 1.0 else 0.0 end)::decimal/sum(1.0)
    # from entities.water_point as wp inner join admin_region_subtrees on wp.admin_region = admin_region_subtrees.descendant where admin_region_subtrees.ancestor = admin_regions._id)
    # from admin_regions 
    # where shape && !bbox! and path ->> 0 = 'eb3e12a2-de1e-49a9-8afd-966eb55d47eb' and level = 1  

    # Compile adminRegionExpr
    compiledAdminRegionExpr = exprCompiler.compileExpr(expr: design.adminRegionExpr, tableAlias: "innerquery")

    # Compile condition expression
    compiledCondition = exprCompiler.compileExpr(expr: design.condition, tableAlias: "innerquery")

    # Compile basis expression
    compiledBasis = exprCompiler.compileExpr(expr: design.basis, tableAlias: "innerquery")

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
                    cases: [{ 
                      when: compiledCondition
                      then: 1 
                    }]
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
        left: exprCompiler.compileTable(design.table, "innerquery")
        right: { type: "table", table: "admin_region_subtrees", alias: "admin_region_subtrees" }
        kind: "inner"
        on: {
          type: "op"
          op: "="
          exprs: [
            compiledAdminRegionExpr
            { type: "field", tableAlias: "admin_region_subtrees", column: "descendant" }
          ]
        }
      }
    }

    whereClauses = [
      {
        type: "op"
        op: "="
        exprs: [
          { type: "field", tableAlias: "admin_region_subtrees", column: "ancestor" }
          { type: "field", tableAlias: "admin_regions", column: "_id" }
        ]
      }      
    ]

    # Add basis
    if compiledBasis
      whereClauses.push(compiledBasis)

    # Then add extra filters passed in, if relevant
    relevantFilters = _.where(filters, table: design.table)
    for filter in relevantFilters
      whereClauses.push(injectTableAlias(filter.jsonql, "innerquery"))
    whereClauses = _.compact(whereClauses)

    valueQuery.where = { type: "op", op: "and", exprs: whereClauses }

    # Now create outer query
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
    ]

    if design.scope
      wheres.push({
        type: "op"
        op: "="
        exprs: [
          { type: "op", op: "->>", exprs: [{ type: "field", tableAlias: "admin_regions", column: "path" }, 0] }
          design.scope
        ]
      })

    # Level to display
    wheres.push({
      type: "op"
      op: "="
      exprs: [
        { type: "field", tableAlias: "admin_regions", column: "level" }
        design.detailLevel
      ]
    })

    query = {
      type: "query"
      selects: [
        { type: "select", expr: { type: "field", tableAlias: "admin_regions", column: "_id" }, alias: "id" }
        { type: "select", expr: { type: "field", tableAlias: "admin_regions", column: "shape_simplified" }, alias: "the_geom_webmercator" }
        { type: "select", expr: { type: "field", tableAlias: "admin_regions", column: "name" }, alias: "name" }
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

  createCss: (design, schema, filters) ->
    css = '''
      #layer0 {
        line-color: #000;
        line-width: 1.5;
        line-opacity: 0.5;
        polygon-opacity: 0.7;
        polygon-fill: #ffffff;
        text-name: [name];
        text-face-name: 'Times New Roman'; 
        /* text-halo-radius: 1;
        text-halo-fill: #DDD;        */
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
    # if ev.data and ev.data.id
    #   return [options.design.table, ev.data.id]
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
    return [design.table]

  # True if layer can be edited
  isEditable: (design, schema) ->
    return true

  # Returns a cleaned design
  cleanDesign: (design, schema) ->
    exprCleaner = new ExprCleaner(schema)

    # TODO clones entirely
    design = _.cloneDeep(design)

    design.condition = exprCleaner.cleanExpr(design.condition, { table: design.table, types: ['boolean'] })
    design.basis = exprCleaner.cleanExpr(design.basis, { table: design.table, types: ['boolean'] })
    design.adminRegionExpr = exprCleaner.cleanExpr(design.adminRegionExpr, { table: design.table, types: ["id"], idTable: "admin_regions" })
    design.factor = exprCleaner.cleanExpr(design.factor, { table: design.table, types: ["number"] })

    return design

  # Validates design. Null if ok, message otherwise
  validateDesign: (design, schema) ->
    exprUtils = new ExprUtils(schema)

    if not design.table
      return "Missing table"

    if not design.detailLevel?
      return "Missing detail level"

    if not design.adminRegionExpr or exprUtils.getExprType(design.adminRegionExpr) != "id"
      return "Missing admin region expr"

    if not design.condition
      return "Missing condition"
  
    return null

  # Creates a design element with specified options
  # options:
  #   design: design of layer
  #   schema: schema to use
  #   dataSource: data source to use
  #   onDesignChange: function called when design changes
  createDesignerElement: (options) ->
    # Clean on way in and out
    React.createElement(AdminIndicatorChoroplethLayerDesigner,
      schema: options.schema
      dataSource: options.dataSource
      design: @cleanDesign(options.design, options.schema)
      onDesignChange: (design) =>
        options.onDesignChange(@cleanDesign(design, options.schema)))
