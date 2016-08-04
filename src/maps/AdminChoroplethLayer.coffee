_ = require 'lodash'
React = require 'react'
H = React.DOM

Layer = require './Layer'
ExprCompiler = require('mwater-expressions').ExprCompiler
ExprUtils = require('mwater-expressions').ExprUtils
injectTableAlias = require('mwater-expressions').injectTableAlias
ExprCleaner = require('mwater-expressions').ExprCleaner
ExprUtils = require('mwater-expressions').ExprUtils
AxisBuilder = require '../axes/AxisBuilder'
LegendGroup = require('./LegendGroup')

###
Layer that is composed of administrative regions colored
Design is:
  scope: _id of overall admin region. Null for whole world.
  detailLevel: admin level to disaggregate to 

  table: table to get data from
  adminRegionExpr: expression to get admin region id for calculations

  axes: axes (see below)

  filter: optional logical expression to filter by
  color: default color (e.g. #FF8800). Color axis overrides
  fillOpacity: opacity of fill of regions (0-1)

  displayNames: true to display name labels on admin regions

axes:
  color: color axis 
  label: overrides the nameLabels to display text on each region

###
module.exports = class AdminChoroplethLayer extends Layer
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

    ###
    E.g.:
    select admin_regions._id, shape_simplified, 
      (select count(wp.*) as cnt from 
      admin_region_subtrees 
      inner join entities.water_point as wp on wp.admin_region = admin_region_subtrees.descendant
      where admin_region_subtrees.ancestor = admin_regions._id) as color

    from admin_regions 
    where shape && !bbox! and  path ->> 0 = 'eb3e12a2-de1e-49a9-8afd-966eb55d47eb' and level = 1  
    ###

    # Compile adminRegionExpr
    compiledAdminRegionExpr = exprCompiler.compileExpr(expr: design.adminRegionExpr, tableAlias: "innerquery")

    selects = [
      { type: "select", expr: { type: "field", tableAlias: "admin_regions", column: "_id" }, alias: "id" }
      { type: "select", expr: { type: "field", tableAlias: "admin_regions", column: "shape_simplified" }, alias: "the_geom_webmercator" }
      { type: "select", expr: { type: "field", tableAlias: "admin_regions", column: "name" }, alias: "name" }
    ]

    # Makes the scalar subquery needed to get a value
    createScalar = (expr) =>
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

      # Then add filters baked into layer
      if design.filter
        whereClauses.push(exprCompiler.compileExpr(expr: design.filter, tableAlias: "innerquery"))

      # Then add extra filters passed in, if relevant
      relevantFilters = _.where(filters, table: design.table)
      for filter in relevantFilters
        whereClauses.push(injectTableAlias(filter.jsonql, "innerquery"))
  
      whereClauses = _.compact(whereClauses)
      
      return {
        type: "scalar"
        expr: colorExpr
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
        where: { type: "op", op: "and", exprs: whereClauses }
      }

    # Add color select if color axis
    if design.axes.color
      colorExpr = axisBuilder.compileAxis(axis: design.axes.color, tableAlias: "innerquery")
      selects.push({ type: "select", expr: createScalar(colorExpr), alias: "color" })

    # Add label select if color axis
    if design.axes.label
      labelExpr = axisBuilder.compileAxis(axis: design.axes.label, tableAlias: "innerquery")
      selects.push({ type: "select", expr: createScalar(labelExpr), alias: "label" })

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
      selects: selects
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
        line-opacity: 0.6;
        polygon-opacity: ''' + design.fillOpacity + ''';
        polygon-fill: ''' + (design.color or "transparent") + ''';
      }

    '''

    if design.displayNames
      css += '''
      #layer0::labels {
        text-name: [name];
        text-face-name: 'Arial Regular'; 
        text-halo-radius: 2;
        text-halo-opacity: 0.5;
        text-halo-fill: #FFF;
      }
    '''

    # If color axes, add color conditions
    if design.axes.color and design.axes.color.colorMap
      for item in design.axes.color.colorMap
        css += "#layer0 [color=#{JSON.stringify(item.value)}] { polygon-fill: #{item.color}; opacity: #{design.fillOpacity}; }\n"

    # colors = [
    #   "#f7fbff"
    #   "#deebf7"
    #   "#c6dbef"
    #   "#9ecae1"
    #   "#6baed6"
    #   "#4292c6"
    #   "#2171b5"
    #   "#08519c"
    #   "#08306b"
    # ]

    # for i in [0...9]
    #   css += "\n#layer0 [value >= #{i/9}][value <= #{(i+1)/9}] { polygon-fill: #{colors[i]} }"

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
  getLegend: (design, schema, name) ->
    exprUtils = new ExprUtils(schema)
    
    if design.axes.color and design.axes.color.colorMap
      enums = exprUtils.getExprEnumValues(design.axes.color.expr)

      colors = _.map design.axes.color.colorMap, (colorItem) =>
        {color: colorItem.color, name: ExprUtils.localizeString(_.find(enums, {id: colorItem.value}).name) }
      colors.push({ color: design.color, name: "None"})
    else
      colors = []

    legendGroupProps =
      items: colors
      key: design.adminRegionExpr.expr.table
      defaultColor: design.color
      name: name

    layerTitleStyle =
      margin: 2
      fontWeight: 'bold'
      borderBottom: '1px solid #cecece'
    H.div null,
#      H.p style: layerTitleStyle, name
      React.createElement(LegendGroup, legendGroupProps)

  # Get a list of table ids that can be filtered on
  getFilterableTables: (design, schema) ->
    return [design.table]

  # True if layer can be edited
  isEditable: (design, schema) ->
    return true

  # Returns a cleaned design
  cleanDesign: (design, schema) ->
    exprCleaner = new ExprCleaner(schema)
    axisBuilder = new AxisBuilder(schema: schema)

    # TODO clones entirely
    design = _.cloneDeep(design)

    # Default color
    design.color = design.color or "#FFFFFF"

    design.adminRegionExpr = exprCleaner.cleanExpr(design.adminRegionExpr, { table: design.table, types: ["id"], idTable: "admin_regions" })

    design.axes = design.axes or {}
    design.fillOpacity = if design.fillOpacity? then design.fillOpacity else 0.75
    design.displayNames = if design.displayNames? then design.displayNames else true

    design.axes.color = axisBuilder.cleanAxis(axis: design.axes.color, table: design.table, types: ['enum', 'text', 'boolean'], aggrNeed: "required")
    design.axes.label = axisBuilder.cleanAxis(axis: design.axes.label, table: design.table, types: ['text', 'number'], aggrNeed: "required")

    design.filter = exprCleaner.cleanExpr(design.filter, { table: design.table })

    return design

  # Validates design. Null if ok, message otherwise
  validateDesign: (design, schema) ->
    exprUtils = new ExprUtils(schema)
    axisBuilder = new AxisBuilder(schema: schema)

    if not design.table
      return "Missing table"

    if not design.detailLevel?
      return "Missing detail level"

    if not design.adminRegionExpr or exprUtils.getExprType(design.adminRegionExpr) != "id"
      return "Missing admin region expr"

    if design.axes.color
      error = axisBuilder.validateAxis(axis: design.axes.color)
      if error then return error

    if design.axes.label
      error = axisBuilder.validateAxis(axis: design.axes.label)
      if error then return error
  
    return null

  # Creates a design element with specified options
  # options:
  #   design: design of layer
  #   schema: schema to use
  #   dataSource: data source to use
  #   onDesignChange: function called when design changes
  createDesignerElement: (options) ->
    # Require here to prevent server require problems
    AdminChoroplethLayerDesigner = require './AdminChoroplethLayerDesigner'

    # Clean on way in and out
    React.createElement(AdminChoroplethLayerDesigner,
      schema: options.schema
      dataSource: options.dataSource
      design: @cleanDesign(options.design, options.schema)
      onDesignChange: (design) =>
        options.onDesignChange(@cleanDesign(design, options.schema)))

  createKMLExportJsonQL: (design, schema, filters) ->
    axisBuilder = new AxisBuilder(schema: schema)
    exprCompiler = new ExprCompiler(schema)

    ###
    E.g.:
    select admin_regions._id, shape_simplified, 
      (select count(wp.*) as cnt from 
      admin_region_subtrees 
      inner join entities.water_point as wp on wp.admin_region = admin_region_subtrees.descendant
      where admin_region_subtrees.ancestor = admin_regions._id) as color

    from admin_regions 
    where shape && !bbox! and  path ->> 0 = 'eb3e12a2-de1e-49a9-8afd-966eb55d47eb' and level = 1  
    ###

    # Compile adminRegionExpr
    compiledAdminRegionExpr = exprCompiler.compileExpr(expr: design.adminRegionExpr, tableAlias: "innerquery")

    adminGeometry = {
      type: "op", op: "ST_AsGeoJson", exprs: [
        {
          type: "op", op: "ST_Transform", exprs: [
            {type: "field", tableAlias: "admin_regions", column: "shape_simplified"},
            4326
          ]
        }
      ]
    }

    selects = [
      { type: "select", expr: { type: "field", tableAlias: "admin_regions", column: "_id" }, alias: "id" }
      { type: "select", expr: adminGeometry, alias: "the_geom_webmercator" }
      { type: "select", expr: { type: "field", tableAlias: "admin_regions", column: "name" }, alias: "name" }
    ]

    # Makes the scalar subquery needed to get a value
    createScalar = (expr) =>
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

      # Then add filters baked into layer
      if design.filter
        whereClauses.push(exprCompiler.compileExpr(expr: design.filter, tableAlias: "innerquery"))

      # Then add extra filters passed in, if relevant
      relevantFilters = _.where(filters, table: design.table)
      for filter in relevantFilters
        whereClauses.push(injectTableAlias(filter.jsonql, "innerquery"))
  
      whereClauses = _.compact(whereClauses)
      
      return {
        type: "scalar"
        expr: colorExpr
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
        where: { type: "op", op: "and", exprs: whereClauses }
      }

    # Add color select if color axis
    if design.axes.color
      colorExpr = axisBuilder.compileAxis(axis: design.axes.color, tableAlias: "innerquery")
      selects.push({ type: "select", expr: createScalar(colorExpr), alias: "color" })

    # Add label select if color axis
    if design.axes.label
      labelExpr = axisBuilder.compileAxis(axis: design.axes.label, tableAlias: "innerquery")
      selects.push({ type: "select", expr: createScalar(labelExpr), alias: "label" })

    # Now create outer query
    wheres = []

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
      selects: selects
      from: { type: "table", table: "admin_regions", alias: "admin_regions" }
      where: {
        type: "op"
        op: "and"
        exprs: wheres
      }
    }

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
    if not row.the_geom_webmercator
      return

    if row.the_geom_webmercator.length == 0
      return

    data = JSON.parse(row.the_geom_webmercator)

    if data.coordinates.length == 0
      return

    if data.type == "MultiPolygon"
      outer = data.coordinates[0][0]  
    else
      outer = data.coordinates[0]


    list = _.map(outer, (coordinates) ->
      coordinates.join(",")
    )

    visitor.addPolygon(list.join(" "), row.color, data.type == "MultiPolygon")
    
