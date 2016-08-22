_ = require 'lodash'
React = require 'react'
H = React.DOM

Layer = require './Layer'
ExprCompiler = require('mwater-expressions').ExprCompiler
injectTableAlias = require('mwater-expressions').injectTableAlias
ExprCleaner = require('mwater-expressions').ExprCleaner
ExprUtils = require('mwater-expressions').ExprUtils
AxisBuilder = require '../axes/AxisBuilder'
LegendGroup = require('./LegendGroup')

###
Layer that is composed of markers
Design is:
  table: table to get data from
  axes: axes (see below)
  filter: optional logical expression to filter by
  color: color of layer (e.g. #FF8800). Color axis overrides
  symbol: symbol to use for layer. e.g. "font-awesome/bell". Will be converted on server to proper uri.
  popup: contains items: which is BlocksLayoutManager items. Will be displayed when the marker is clicked

LEGACY: sublayers array that contains above design

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
      layers: [
        {
          id: "layer0"
          jsonql: @createJsonQL(design, schema, filters)
        }
      ]
      css: @createCss(design, schema)
      interactivity: { 
        layer: "layer0"
        fields: ["id"]
      }
    }

    return layerDef

  createJsonQL: (design, schema, filters) ->
    axisBuilder = new AxisBuilder(schema: schema)
    exprCompiler = new ExprCompiler(schema)

    # Compile geometry axis
    geometryExpr = axisBuilder.compileAxis(axis: design.axes.geometry, tableAlias: "innerquery")

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
        { type: "select", expr: { type: "field", tableAlias: "innerquery", column: schema.getTable(design.table).primaryKey }, alias: "id" } # main primary key as id
        { type: "select", expr: geometryExpr, alias: "the_geom_webmercator" } # geometry as the_geom_webmercator
        cluster
      ]
      from: exprCompiler.compileTable(design.table, "innerquery")
    }

    # Add color select if color axis
    if design.axes.color
      colorExpr = axisBuilder.compileAxis(axis: design.axes.color, tableAlias: "innerquery")
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
    if design.filter
      whereClauses.push(exprCompiler.compileExpr(expr: design.filter, tableAlias: "innerquery"))

    # Then add extra filters passed in, if relevant
    # Get relevant filters
    relevantFilters = _.where(filters, table: design.table)
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
    if design.axes.color
      outerquery.selects.push({ type: "select", expr: { type: "field", tableAlias: "innerquery", column: "color" }, alias: "color" }) # innerquery.color as color

    return outerquery

  # Creates CartoCSS
  createCss: (design, schema) ->
    css = ""

    if design.symbol
      symbol = "marker-file: url(#{design.symbol});"
      stroke = "marker-line-width: 60;"
    else
      symbol = "marker-type: ellipse;"
      stroke = "marker-line-width: 1;"

    css += '''
      #layer0 {
        marker-fill: ''' + (design.color or "#666666") + ''';
        marker-width: 10;
        marker-line-color: white;
        ''' + stroke + '''
        marker-line-opacity: 0.6;
        marker-placement: point;
        ''' + symbol + '''
        marker-allow-overlap: true;
      }

    '''

    # If color axes, add color conditions
    if design.axes.color and design.axes.color.colorMap
      for item in design.axes.color.colorMap
        css += "#layer0 [color=#{JSON.stringify(item.value)}] { marker-fill: #{item.color} }\n"

    return css

  # Called when the interactivity grid is clicked. 
  # arguments:
  #   ev: { data: interactivty data e.g. `{ id: 123 }` }
  #   options: 
  #     design: design of layer
  #     schema: schema to use
  #     dataSource: data source to use
  #     layerDataSource: layer data source
  # 
  # Returns:
  #   null/undefined to do nothing
  #   [table id, primary key] to open a default system popup if one is present
  #   React element to put into a popup TODO udpate docs here
  onGridClick: (ev, clickOptions) ->
    # TODO abstract most to base class
    if ev.data and ev.data.id
      results = {
        row: { tableId: clickOptions.design.table, primaryKey: ev.data.id }
      }

      # Create filter for single row
      table = clickOptions.design.table

      ids = clickOptions.scopeData or []

      # Toggle marker
      if ev.data.id in ids
        ids = _.without(ids, ev.data.id)
      else
        ids = ids.concat([ev.data.id])

      filter = { 
        table: table
        jsonql: { type: "op", op: "=", modifier: "any", exprs: [
          { type: "field", tableAlias: "{alias}", column: clickOptions.schema.getTable(table).primaryKey }
          { type: "literal", value: ids }
        ]} 
      }

      # Scope to marker
      results.scope = {
        name: "Selected Marker(s)"
        filter: filter
        data: ids
      }

      if clickOptions.design.popup
        BlocksLayoutManager = require '../layouts/blocks/BlocksLayoutManager'
        WidgetFactory = require '../widgets/WidgetFactory'

        results.popup = new BlocksLayoutManager().renderLayout({
          items: clickOptions.design.popup.items
          renderWidget: (options) =>
            widget = WidgetFactory.createWidget(options.type)

            # Create filters for single row
            filters = [filter]

            # Get data source for widget
            widgetDataSource = clickOptions.layerDataSource.getPopupWidgetDataSource(options.id)

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
              standardWidth: null
            })  
          })

      return results
    else
      return null

  # Get min and max zoom levels
  getMinZoom: (design) -> return null
  getMaxZoom: (design) -> return null

  # Get the legend to be optionally displayed on the map. Returns
  # a React element
  getLegend: (design, schema, name) ->
    axisBuilder = new AxisBuilder(schema: schema)
    exprUtils = new ExprUtils(schema)

    if design.axes.color and design.axes.color.colorMap
      categories = axisBuilder.getCategories(design.axes.color)

      colors = _.map design.axes.color.colorMap, (colorItem) =>
        category = _.find(categories, {value: colorItem.value})
        _name = if category then ExprUtils.localizeString(category.label) else colorItem.value
        {color: colorItem.color, name: _name }
    else
      colors = []

    symbol = if design.symbol then design.symbol else 'font-awesome/circle'

    legendGroupProps =
      symbol: symbol
      items: colors
      key: design.axes.geometry.expr.table
      defaultColor: design.color
      name: name

    H.div null,
      React.createElement(LegendGroup, legendGroupProps)

  # Get a list of table ids that can be filtered on
  getFilterableTables: (design, schema) ->
    return if design.table then [design.table] else []

  # True if layer can be edited
  isEditable: () ->
    return true

  # Creates a design element with specified options
  # options:
  #   design: design of layer
  #   schema: schema to use
  #   dataSource: data source to use
  #   onDesignChange: function called when design changes
  createDesignerElement: (options) ->
    # Require here to prevent server require problems
    MarkersLayerDesignerComponent = require './MarkersLayerDesignerComponent'

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

    # Migrate legacy sublayers
    if design.sublayers?[0]
      design = _.extend({}, design, design.sublayers[0])
    delete design.sublayers

    design.axes = design.axes or {}
    design.color = design.color or "#0088FF"

    design.axes.geometry = axisBuilder.cleanAxis(axis: design.axes.geometry, table: design.table, types: ['geometry'], aggrNeed: "none")
    design.axes.color = axisBuilder.cleanAxis(axis: design.axes.color, table: design.table, types: ['enum', 'text', 'boolean'], aggrNeed: "none")

    design.filter = exprCleaner.cleanExpr(design.filter, { table: design.table })

    return design

  # Validates design. Null if ok, message otherwise
  validateDesign: (design, schema) ->
    axisBuilder = new AxisBuilder(schema: schema)

    if not design.table
      return "Missing table"

    if not design.axes or not design.axes.geometry
      return "Missing axes"

    error = axisBuilder.validateAxis(axis: design.axes.geometry)
    if error then return error

    return null

  createKMLExportJsonQL: (design, schema, filters) ->
    axisBuilder = new AxisBuilder(schema: schema)
    exprCompiler = new ExprCompiler(schema)

    # Compile geometry axis
    geometryExpr = axisBuilder.compileAxis(axis: design.axes.geometry, tableAlias: "innerquery")

    # Convert to Web mercator (3857)
    geometryExpr = { type: "op", op: "ST_Transform", exprs: [geometryExpr, 4326] }

    # row_number() over (partition by st_snaptogrid(location, !pixel_width!*5, !pixel_height!*5)) AS r
    cluster = {
      type: "select"
      expr: { type: "op", op: "row_number", exprs: [] }
      over: { partitionBy: [geometryExpr]}
      alias: "r"
    }

    # Select _id, location and clustered row number
    innerquery = {
      type: "query"
      selects: [
        { type: "select", expr: { type: "field", tableAlias: "innerquery", column: schema.getTable(design.table).primaryKey }, alias: "id" } # main primary key as id
        { type: "select", expr: geometryExpr, alias: "the_geom_webmercator" } # geometry as the_geom_webmercator
        cluster
      ]
      from: exprCompiler.compileTable(design.table, "innerquery")
    }

    # Add color select if color axis
    if design.axes.color
      colorExpr = axisBuilder.compileAxis(axis: design.axes.color, tableAlias: "innerquery")
      innerquery.selects.push({ type: "select", expr: colorExpr, alias: "color" })

    # Create filters. First limit to bounding box
    whereClauses = []

    # Then add filters baked into layer
    if design.filter
      whereClauses.push(exprCompiler.compileExpr(expr: design.filter, tableAlias: "innerquery"))

    # Then add extra filters passed in, if relevant
    # Get relevant filters
    relevantFilters = _.where(filters, table: design.table)
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
        { type: "select", expr: { type: "op", op: "ST_X", exprs: [{ type: "field", tableAlias: "innerquery", column: "the_geom_webmercator" }]}, alias: "longitude" } # innerquery.the_geom_webmercator as the_geom_webmercator
        { type: "select", expr: { type: "op", op: "ST_Y", exprs: [{ type: "field", tableAlias: "innerquery", column: "the_geom_webmercator" }]}, alias: "latitude" } # innerquery.the_geom_webmercator as the_geom_webmercator
      ]
      from: { type: "subquery", query: innerquery, alias: "innerquery" }
      where: { type: "op", op: "<=", exprs: [{ type: "field", tableAlias: "innerquery", column: "r" }, 3]}
    }

    # Add color select if color axis

    if design.axes.color
      outerquery.selects.push({ type: "select", expr: { type: "field", tableAlias: "innerquery", column: "color" }, alias: "color" }) # innerquery.color as color

    return outerquery


  createKMLExportStyleInfo: (design, schema, filters) ->
    if design.symbol
      symbol = design.symbol
    else
      symbol = "font-awesome/circle"

    style = {
      color: design.color
      symbol: symbol
    }

    if design.axes.color and design.axes.color.colorMap
      style.colorMap = design.axes.color.colorMap
      
    return style

  getKMLExportJsonQL: (design, schema, filters) ->
    layerDef = {
      layers: [
        {
          id: "layer0"
          jsonql: @createKMLExportJsonQL(design, schema, filters)
          style: @createKMLExportStyleInfo(design, schema, filters)
        }
      ]
    }

    return layerDef

  acceptKmlVisitorForRow: (visitor, row) ->
    visitor.addPoint(row.latitude, row.longitude, null, null, row.color)

