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
LayerLegendComponent = require './LayerLegendComponent'
PopupFilterJoinsUtils = require './PopupFilterJoinsUtils'

###
Layer that is composed of administrative regions colored
Design is:
  scope: _id of overall admin region. Null for whole world.
  scopeLevel: admin level of scope. Default is 0 (entire country) if scope is set
  detailLevel: admin level to disaggregate to

  table: table to get data from
  adminRegionExpr: expression to get admin region id for calculations

  axes: axes (see below)

  filter: optional logical expression to filter by
  color: default color (e.g. #FF8800). Color axis overrides
  fillOpacity: opacity of fill of regions (0-1)

  displayNames: true to display name labels on admin regions

  popup: contains items: which is BlocksLayoutManager items. Will be displayed when the region is clicked
  popupFilterJoins: customizable filtering for popup. See PopupFilterJoins.md
  minZoom: minimum zoom level
  maxZoom: maximum zoom level

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
      interactivity: {
        layer: "layer0"
        fields: ["id", "name"]
      }
    }

    return layerDef

  createJsonQL: (design, schema, filters) ->
    axisBuilder = new AxisBuilder(schema: schema)
    exprCompiler = new ExprCompiler(schema)

    ###
    E.g:
    select name, shape_simplified, regions.color from
    admin_regions as admin_regions2
    left outer join
    (
      select admin_regions.level2 as id,
      count(innerquery.*) as color
      from
      admin_regions inner join
      entities.water_point as innerquery
      on innerquery.admin_region = admin_regions._id
      where admin_regions.level0 = 'eb3e12a2-de1e-49a9-8afd-966eb55d47eb'
      group by 1
    ) as regions on regions.id = admin_regions2._id
    where admin_regions2.level = 2 and admin_regions2.level0 = 'eb3e12a2-de1e-49a9-8afd-966eb55d47eb'
    ###

    # Verify that scopeLevel is an integer to prevent injection
    if design.scopeLevel? and design.scopeLevel not in [0, 1, 2, 3, 4, 5]
      throw new Error("Invalid scope level")

    # Verify that detailLevel is an integer to prevent injection
    if design.detailLevel not in [0, 1, 2, 3, 4, 5]
      throw new Error("Invalid detail level")

    # Compile adminRegionExpr
    compiledAdminRegionExpr = exprCompiler.compileExpr(expr: design.adminRegionExpr, tableAlias: "innerquery")

    # Create inner query
    innerQuery = {
      type: "query"
      selects: [
        { type: "select", expr: { type: "field", tableAlias: "admin_regions", column: "level#{design.detailLevel}" }, alias: "id" }
      ]
      from: {
        type: "join"
        kind: "inner"
        left: { type: "table", table: "admin_regions", alias: "admin_regions" }
        right: exprCompiler.compileTable(design.table, "innerquery")
        on: {
          type: "op"
          op: "="
          exprs: [
            compiledAdminRegionExpr
            { type: "field", tableAlias: "admin_regions", column: "_id" }
          ]
        }
      }
      groupBy: [1]
    }

    # Add color select if color axis
    if design.axes.color
      colorExpr = axisBuilder.compileAxis(axis: design.axes.color, tableAlias: "innerquery")
      innerQuery.selects.push({ type: "select", expr: colorExpr, alias: "color" })

    # Add label select if color axis
    if design.axes.label
      labelExpr = axisBuilder.compileAxis(axis: design.axes.label, tableAlias: "innerquery")
      innerQuery.selects.push({ type: "select", expr: labelExpr, alias: "label" })

    whereClauses = []

    if design.scope
      whereClauses.push({
        type: "op"
        op: "="
        exprs: [
          { type: "field", tableAlias: "admin_regions", column: "level#{design.scopeLevel or 0}" }
          design.scope
        ]
      })

    # Then add filters
    if design.filter
      whereClauses.push(exprCompiler.compileExpr(expr: design.filter, tableAlias: "innerquery"))

    # Then add extra filters passed in, if relevant
    relevantFilters = _.where(filters, table: design.table)
    for filter in relevantFilters
      whereClauses.push(injectTableAlias(filter.jsonql, "innerquery"))

    whereClauses = _.compact(whereClauses)

    if whereClauses.length > 0
      innerQuery.where = { type: "op", op: "and", exprs: whereClauses }

    # Now create outer query
    query = {
      type: "query"
      selects: [
        { type: "select", expr: { type: "field", tableAlias: "admin_regions2", column: "_id" }, alias: "id" }
        { type: "select", expr: { type: "field", tableAlias: "admin_regions2", column: "shape_simplified" }, alias: "the_geom_webmercator" }
        { type: "select", expr: { type: "field", tableAlias: "admin_regions2", column: "name" }, alias: "name" }
      ]
      from: {
        type: "join"
        kind: "left"
        left: { type: "table", table: "admin_regions", alias: "admin_regions2" }
        right: { type: "subquery", query: innerQuery, alias: "regions" }
        on: {
          type: "op"
          op: "="
          exprs: [
            { type: "field", tableAlias: "regions", column: "id" }
            { type: "field", tableAlias: "admin_regions2", column: "_id" }
          ]
        }
      }
      where: {
        type: "op"
        op: "and"
        exprs: [
          # Level to display
          {
            type: "op"
            op: "="
            exprs: [
              { type: "field", tableAlias: "admin_regions2", column: "level" }
              design.detailLevel
            ]
          }
        ]
      }
    }

    # Scope overall
    if design.scope
      query.where.exprs.push({
        type: "op"
        op: "="
        exprs: [
          { type: "field", tableAlias: "admin_regions2", column: "level#{design.scopeLevel or 0}" }
          design.scope
        ]
      })

    # Bubble up color and label
    if design.axes.color
      query.selects.push({ type: "select", expr: { type: "field", tableAlias: "regions", column: "color"}, alias: "color" })

    # Add label select if color axis
    if design.axes.label
      query.selects.push({ type: "select", expr: { type: "field", tableAlias: "regions", column: "label"}, alias: "label" })

    return query

  createCss: (design, schema, filters) ->
    css = '''
      #layer0 {
        line-color: #000;
        line-width: 1.5;
        line-opacity: 0.6;
        polygon-opacity: ''' + design.fillOpacity + ''';
        polygon-fill: ''' + (design.color or "transparent") + ''';
        opacity: ''' +  design.fillOpacity + '''; 
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
        # If invisible
        if _.includes(design.axes.color.excludedValues, item.value)
          css += "#layer0 [color=#{JSON.stringify(item.value)}] { line-color: transparent; polygon-opacity: 0; polygon-fill: transparent; }\n"  
          if design.displayNames
            css += "#layer0::labels [color=#{JSON.stringify(item.value)}] { text-opacity: 0; text-halo-opacity: 0; }\n"  
        else
          css += "#layer0 [color=#{JSON.stringify(item.value)}] { polygon-fill: #{item.color}; }\n"

    return css

  # Called when the interactivity grid is clicked.
  # arguments:
  #   ev: { data: interactivty data e.g. `{ id: 123 }` }
  #   clickOptions:
  #     design: design of layer
  #     schema: schema to use
  #     dataSource: data source to use
  #     layerDataSource: layer data source
  #     scopeData: current scope data if layer is scoping
  #     filters: compiled filters to apply to the popup
  #
  # Returns:
  #   null/undefined
  #   or
  #   {
  #     scope: scope to apply ({ name, filter, data })
  #     row: { tableId:, primaryKey: }  # row that was selected
  #     popup: React element to put into a popup
  #   }
  onGridClick: (ev, clickOptions) ->
    # TODO abstract most to base class
    if ev.data and ev.data.id
      results = { }

      # Create filter for single row
      table = clickOptions.design.table

      # Compile adminRegionExpr
      exprCompiler = new ExprCompiler(clickOptions.schema)
      filterExpr = {
        type: "op"
        op: "within"
        table: table
        exprs: [
          clickOptions.design.adminRegionExpr
          { type: "literal", idTable: "admin_regions", valueType: "id", value: ev.data.id }
        ]
      }
      compiledFilterExpr = exprCompiler.compileExpr(expr: filterExpr, tableAlias: "{alias}")

      # Filter within
      filter = {
        table: table
        jsonql: compiledFilterExpr
      }

      if ev.event.originalEvent.shiftKey
        # Scope to region, unless already scoped
        if clickOptions.scopeData == ev.data.id
          results.scope = null
        else
          results.scope = {
            name: ev.data.name
            filter: filter
            data: ev.data.id
          }

      else if clickOptions.design.popup
        # Create default popup filter joins
        defaultPopupFilterJoins = {}
        if clickOptions.design.adminRegionExpr
          defaultPopupFilterJoins[clickOptions.design.table] = clickOptions.design.adminRegionExpr

        # Create filter using popupFilterJoins
        popupFilterJoins = clickOptions.design.popupFilterJoins or defaultPopupFilterJoins
        popupFilters = PopupFilterJoinsUtils.createPopupFilters(popupFilterJoins, clickOptions.schema, table, ev.data.id, true)

        # Add filter for admin region
        popupFilters.push({
          table: "admin_regions"
          jsonql: { type: "op", op: "=", exprs: [{ type: "field", tableAlias: "{alias}", column: "_id" }, { type: "literal", value: ev.data.id }]}
        })

        BlocksLayoutManager = require '../layouts/blocks/BlocksLayoutManager'
        WidgetFactory = require '../widgets/WidgetFactory'

        results.popup = new BlocksLayoutManager().renderLayout({
          items: clickOptions.design.popup.items
          style: "popup"
          renderWidget: (options) =>
            widget = WidgetFactory.createWidget(options.type)

            # Create filters for single row
            filters = clickOptions.filters.concat(popupFilters)

            # Get data source for widget
            widgetDataSource = clickOptions.layerDataSource.getPopupWidgetDataSource(clickOptions.design, options.id)

            return widget.createViewElement({
              schema: clickOptions.schema
              dataSource: clickOptions.dataSource
              widgetDataSource: widgetDataSource
              design: options.design
              scope: null
              filters: filters
              onScopeChange: null
              onDesignChange: null
              width: options.width
              height: options.height
              standardWidth: options.standardWidth
            })
          })

      return results
    else
      return null

  # Gets the bounds of the layer as GeoJSON
  getBounds: (design, schema, dataSource, filters, callback) ->
    # Whole world
    if not design.scope
      return callback(null)

    # Get just scope. Ignore filters and get entire scope
    filters = [{
      table: "admin_regions"
      jsonql: {
        type: "op"
        op: "="
        exprs: [
          { type: "field", tableAlias: "{alias}", column: "_id" }
          design.scope
        ]
      }
    }]

    @getBoundsFromExpr(schema, dataSource, "admin_regions", { type: "field", table: "admin_regions", column: "shape" }, null, filters, callback)

  # Get min and max zoom levels
  getMinZoom: (design) -> return design.minZoom
  getMaxZoom: (design) -> return design.maxZoom

  # Get the legend to be optionally displayed on the map. Returns
  # a React element
  getLegend: (design, schema, name, dataSource, filters = []) ->
    _filters = filters.slice()
    if design.filter?
      exprCompiler = new ExprCompiler(schema)
      jsonql = exprCompiler.compileExpr(expr: design.filter, tableAlias: "{alias}")
      if jsonql
        _filters.push({ table: design.filter.table, jsonql: jsonql })
    axisBuilder = new AxisBuilder(schema: schema)

    React.createElement LayerLegendComponent,
      schema: schema
      name: name
      dataSource: dataSource
      filters: _.compact(_filters)
      axis: axisBuilder.cleanAxis(axis: design.axes.color, table: design.table, types: ['enum', 'text', 'boolean','date'], aggrNeed: "required")
      defaultColor: design.color

  # Get a list of table ids that can be filtered on
  getFilterableTables: (design, schema) ->
    return if design.table then [design.table] else []

  # True if layer can be edited
  isEditable: () ->
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

    design.axes.color = axisBuilder.cleanAxis(axis: design.axes.color, table: design.table, types: ['enum', 'text', 'boolean','date'], aggrNeed: "required")
    design.axes.label = axisBuilder.cleanAxis(axis: design.axes.label, table: design.table, types: ['text', 'number'], aggrNeed: "required")

    design.filter = exprCleaner.cleanExpr(design.filter, { table: design.table })

    if not design.detailLevel?
      design.detailLevel = 0

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
  #   filters: array of filters
  createDesignerElement: (options) ->
    # Require here to prevent server require problems
    AdminChoroplethLayerDesigner = require './AdminChoroplethLayerDesigner'

    # Clean on way in and out
    React.createElement(AdminChoroplethLayerDesigner,
      schema: options.schema
      dataSource: options.dataSource
      design: @cleanDesign(options.design, options.schema)
      filters: options.filters
      onDesignChange: (design) =>
        options.onDesignChange(@cleanDesign(design, options.schema)))

  createKMLExportJsonQL: (design, schema, filters) ->
    axisBuilder = new AxisBuilder(schema: schema)
    exprCompiler = new ExprCompiler(schema)

    # Verify that scopeLevel is an integer to prevent injection
    if design.scopeLevel? and design.scopeLevel not in [0, 1, 2, 3, 4, 5]
      throw new Error("Invalid scope level")

    # Verify that detailLevel is an integer to prevent injection
    if design.detailLevel not in [0, 1, 2, 3, 4, 5]
      throw new Error("Invalid detail level")

    # Compile adminRegionExpr
    compiledAdminRegionExpr = exprCompiler.compileExpr(expr: design.adminRegionExpr, tableAlias: "innerquery")

    # Create inner query
    innerQuery = {
      type: "query"
      selects: [
        { type: "select", expr: { type: "field", tableAlias: "admin_regions", column: "level#{design.detailLevel}" }, alias: "id" }
      ]
      from: {
        type: "join"
        kind: "inner"
        left: { type: "table", table: "admin_regions", alias: "admin_regions" }
        right: exprCompiler.compileTable(design.table, "innerquery")
        on: {
          type: "op"
          op: "="
          exprs: [
            compiledAdminRegionExpr
            { type: "field", tableAlias: "admin_regions", column: "_id" }
          ]
        }
      }
      groupBy: [1]
    }

    # Add color select if color axis
    if design.axes.color
      valueExpr = exprCompiler.compileExpr(expr: design.axes.color.expr, tableAlias: "innerquery")
      colorExpr = axisBuilder.compileAxis(axis: design.axes.color, tableAlias: "innerquery")
      innerQuery.selects.push({ type: "select", expr: colorExpr, alias: "color" })
      innerQuery.selects.push({ type: "select", expr: valueExpr, alias: "value" })

    # Add label select if color axis
    if design.axes.label
      labelExpr = axisBuilder.compileAxis(axis: design.axes.label, tableAlias: "innerquery")
      innerQuery.selects.push({ type: "select", expr: labelExpr, alias: "label" })

    whereClauses = []

    if design.scope
      whereClauses.push({
        type: "op"
        op: "="
        exprs: [
          { type: "field", tableAlias: "admin_regions", column: "level#{design.scopeLevel or 0}" }
          design.scope
        ]
      })

    # Then add filters
    if design.filter
      whereClauses.push(exprCompiler.compileExpr(expr: design.filter, tableAlias: "innerquery"))

    # Then add extra filters passed in, if relevant
    relevantFilters = _.where(filters, table: design.table)
    for filter in relevantFilters
      whereClauses.push(injectTableAlias(filter.jsonql, "innerquery"))

    whereClauses = _.compact(whereClauses)

    if whereClauses.length > 0
      innerQuery.where = { type: "op", op: "and", exprs: whereClauses }

    adminGeometry = {
      type: "op", op: "ST_AsGeoJson", exprs: [
        {
          type: "op", op: "ST_Transform", exprs: [
            {type: "field", tableAlias: "admin_regions2", column: "shape_simplified"},
            4326
          ]
        }
      ]
    }

    # Now create outer query
    query = {
      type: "query"
      selects: [
        { type: "select", expr: { type: "field", tableAlias: "admin_regions2", column: "_id" }, alias: "id" }
        { type: "select", expr: adminGeometry, alias: "the_geom_webmercator" }
        { type: "select", expr: { type: "field", tableAlias: "admin_regions2", column: "name" }, alias: "name" }
      ]
      from: {
        type: "join"
        kind: "left"
        left: { type: "table", table: "admin_regions", alias: "admin_regions2" }
        right: { type: "subquery", query: innerQuery, alias: "regions" }
        on: {
          type: "op"
          op: "="
          exprs: [
            { type: "field", tableAlias: "regions", column: "id" }
            { type: "field", tableAlias: "admin_regions2", column: "_id" }
          ]
        }
      }
      where: {
        type: "op"
        op: "and"
        exprs: [
          # Level to display
          {
            type: "op"
            op: "="
            exprs: [
              { type: "field", tableAlias: "admin_regions2", column: "level" }
              design.detailLevel
            ]
          }
        ]
      }
    }

    # Scope overall
    if design.scope
      query.where.exprs.push({
        type: "op"
        op: "="
        exprs: [
          { type: "field", tableAlias: "admin_regions2", column: "level#{design.scopeLevel or 0}" }
          design.scope
        ]
      })

    # Bubble up color and label
    if design.axes.color
      query.selects.push({ type: "select", expr: { type: "field", tableAlias: "regions", column: "color"}, alias: "color" })
      query.selects.push({ type: "select", expr: { type: "field", tableAlias: "regions", column: "value"}, alias: "value" })

    # Add label select if color axis
    if design.axes.label
      query.selects.push({ type: "select", expr: { type: "field", tableAlias: "regions", column: "label"}, alias: "label" })

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

    visitor.addPolygon(list.join(" "), row.color, data.type == "MultiPolygon", row.name, visitor.buildDescription(row))
