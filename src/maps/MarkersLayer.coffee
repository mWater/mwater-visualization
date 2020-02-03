_ = require 'lodash'
React = require 'react'
R = React.createElement
produce = require('immer').default
original = require('immer').original

Layer = require './Layer'
ExprCompiler = require('mwater-expressions').ExprCompiler
injectTableAlias = require('mwater-expressions').injectTableAlias
ExprCleaner = require('mwater-expressions').ExprCleaner
ExprUtils = require('mwater-expressions').ExprUtils
AxisBuilder = require '../axes/AxisBuilder'
LegendGroup = require('./LegendGroup')
LayerLegendComponent = require './LayerLegendComponent'
PopupFilterJoinsUtils = require './PopupFilterJoinsUtils'

###
Layer that is composed of markers
Design is:
  table: table to get data from
  axes: axes (see below)
  filter: optional logical expression to filter by
  color: color of layer (e.g. #FF8800). Color axis overrides
  symbol: symbol to use for layer. e.g. "font-awesome/bell". Will be converted on server to proper uri.
  markerSize: size in pixels of the markers. Default 10.
  popup: contains items: which is BlocksLayoutManager items. Will be displayed when the marker is clicked
  popupFilterJoins: customizable filtering for popup. See PopupFilterJoins.md
  minZoom: minimum zoom level
  maxZoom: maximum zoom level

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
        { type: "select", expr: { type: "op", op: "ST_GeometryType", exprs: [{ type: "field", tableAlias: "innerquery", column: "the_geom_webmercator" }] }, alias: "geometry_type" } # ST_GeometryType(innerquery.the_geom_webmercator) as geometry_type
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

    # Should only display markers when it is a point geometry
    css += '''
      #layer0[geometry_type='ST_Point'] {
        marker-fill: ''' + (design.color or "#666666") + ''';
        marker-width: ''' + (design.markerSize or 10) + ''';
        marker-line-color: white;
        ''' + stroke + '''
        marker-line-opacity: 0.6;
        marker-placement: point;
        ''' + symbol + '''
        marker-allow-overlap: true;
      }
      #layer0 {
        line-color: ''' + (design.color or "#666666") + ''';
        line-width: 3;
      }
      #layer0[geometry_type='ST_Polygon'],#layer0[geometry_type='ST_MultiPolygon'] {
        polygon-fill: ''' + (design.color or "#666666") + ''';
        polygon-opacity: 0.25;
      }

    '''

    # If color axes, add color conditions
    if design.axes.color and design.axes.color.colorMap
      for item in design.axes.color.colorMap
        # If invisible
        if _.includes(design.axes.color.excludedValues, item.value)
          css += '''
            #layer0[color=''' + JSON.stringify(item.value) + '''] { line-opacity: 0; marker-line-opacity: 0; marker-fill-opacity: 0; polygon-opacity: 0; }
          '''  
        else
          css += '''
            #layer0[color=''' + JSON.stringify(item.value) + '''] { line-color: ''' + item.color + ''' }
            #layer0[color=''' + JSON.stringify(item.value) + '''][geometry_type='ST_Point'] { marker-fill: ''' + item.color + ''' }
            #layer0[color=''' + JSON.stringify(item.value) + '''][geometry_type='ST_Polygon'],#layer0[color=''' + JSON.stringify(item.value) + '''][geometry_type='ST_MultiPolygon'] { 
              polygon-fill: ''' + item.color + '''
            }
          '''

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
      table = clickOptions.design.table
      results = {}

      # Scope toggle item if ctrl-click
      if ev.event.originalEvent.shiftKey
        ids = clickOptions.scopeData or []
        if ev.data.id in ids
          ids = _.without(ids, ev.data.id)
        else
          ids = ids.concat([ev.data.id])

        # Create filter for rows
        filter = {
          table: table
          jsonql: { type: "op", op: "=", modifier: "any", exprs: [
            { type: "field", tableAlias: "{alias}", column: clickOptions.schema.getTable(table).primaryKey }
            { type: "literal", value: ids }
          ]}
        }

        # Scope to item
        if ids.length > 0
          results.scope = {
            name: "Selected #{ids.length} Markers(s)"
            filter: filter
            data: ids
          }
        else
          results.scope = null

      # Popup
      if clickOptions.design.popup and not ev.event.originalEvent.shiftKey
        # Create filter using popupFilterJoins
        popupFilterJoins = clickOptions.design.popupFilterJoins or PopupFilterJoinsUtils.createDefaultPopupFilterJoins(table)
        popupFilters = PopupFilterJoinsUtils.createPopupFilters(popupFilterJoins, clickOptions.schema, table, ev.data.id)

        BlocksLayoutManager = require '../layouts/blocks/BlocksLayoutManager'
        WidgetFactory = require '../widgets/WidgetFactory'

        results.popup = new BlocksLayoutManager().renderLayout({
          items: clickOptions.design.popup.items
          style: "popup"
          renderWidget: (options) =>
            widget = WidgetFactory.createWidget(options.type)

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
      else if not ev.event.originalEvent.shiftKey
        results.row = { tableId: table, primaryKey: ev.data.id }

      return results
    else
      return null

  # Gets the bounds of the layer as GeoJSON
  getBounds: (design, schema, dataSource, filters, callback) ->
    @getBoundsFromExpr(schema, dataSource, design.table, design.axes.geometry.expr, design.filter, filters, callback)

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
      defaultColor: design.color
      symbol: design.symbol or 'font-awesome/circle'
      markerSize: design.markerSize
      name: name
      dataSource: dataSource
      filters: _.compact(_filters)
      axis: axisBuilder.cleanAxis(axis: design.axes.color, table: design.table, types: ['enum', 'text', 'boolean','date'], aggrNeed: "none")

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
  #   filters: array of filters
  createDesignerElement: (options) ->
    # Require here to prevent server require problems
    MarkersLayerDesignerComponent = require './MarkersLayerDesignerComponent'

    # Clean on way in and out
    React.createElement(MarkersLayerDesignerComponent,
      schema: options.schema
      dataSource: options.dataSource
      design: @cleanDesign(options.design, options.schema)
      filters: options.filters
      onDesignChange: (design) =>
        options.onDesignChange(@cleanDesign(design, options.schema)))

  # Returns a cleaned design
  cleanDesign: (design, schema) ->
    exprCleaner = new ExprCleaner(schema)
    axisBuilder = new AxisBuilder(schema: schema)

    design = produce(design, (draft) =>
      # Migrate legacy sublayers
      if design.sublayers?[0]
        draft.axes = design.sublayers[0].axes
        draft.table = design.sublayers[0].table
        draft.filter = design.sublayers[0].filter
        draft.color = design.sublayers[0].color
        draft.symbol = design.sublayers[0].symbol
        draft.markerSize = design.sublayers[0].markerSize
        delete draft.sublayers

      draft.axes = draft.axes or {}
      draft.color = draft.color or "#0088FF"

      draft.axes.geometry = axisBuilder.cleanAxis(axis: original(draft.axes.geometry), table: draft.table, types: ['geometry'], aggrNeed: "none")
      draft.axes.color = axisBuilder.cleanAxis(axis: original(draft.axes.color), table: draft.table, types: ['enum', 'text', 'boolean','date'], aggrNeed: "none")

      draft.filter = exprCleaner.cleanExpr(original(draft.filter), { table: draft.table })
      return
    )

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

    # Check that doesn't compile to null (persistent bug that haven't been able to track down)
    if not axisBuilder.compileAxis(axis: design.axes.geometry, tableAlias: "innerquery")
      return "Null geometry axis"

    return null

  createKMLExportJsonQL: (design, schema, filters) ->
    axisBuilder = new AxisBuilder(schema: schema)
    exprCompiler = new ExprCompiler(schema)

    # Compile geometry axis
    geometryExpr = axisBuilder.compileAxis(axis: design.axes.geometry, tableAlias: "innerquery")

    # Convert to Web mercator (3857)
    geometryExpr = { type: "op", op: "ST_Transform", exprs: [geometryExpr, 4326] }

    # Select _id, location and clustered row number
    innerquery = {
      type: "query"
      selects: [
        { type: "select", expr: { type: "field", tableAlias: "innerquery", column: schema.getTable(design.table).primaryKey }, alias: "id" } # main primary key as id
        { type: "select", expr: { type: "op", op: "ST_XMIN", exprs: [geometryExpr]}, alias: "longitude" } # innerquery.the_geom_webmercator as the_geom_webmercator
        { type: "select", expr: { type: "op", op: "ST_YMIN", exprs: [geometryExpr]}, alias: "latitude" } # innerquery.the_geom_webmercator as the_geom_webmercator
      ]
      from: exprCompiler.compileTable(design.table, "innerquery")
    }

    extraFields = ["code", "name", "desc", "type", "photos"]

    for field in extraFields
      column = schema.getColumn(design.table, field)

      if column
        innerquery.selects.push({ type: "select", expr: { type: "field", tableAlias: "innerquery", column: field }, alias: field })

    # Add color select if color axis
    if design.axes.color
      colorExpr = axisBuilder.compileAxis(axis: design.axes.color, tableAlias: "innerquery")
      valueExpr = exprCompiler.compileExpr(expr: design.axes.color.expr, tableAlias: "innerquery")
      innerquery.selects.push({ type: "select", expr: colorExpr, alias: "color" })
      innerquery.selects.push({ type: "select", expr: valueExpr, alias: "value" })

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

    return innerquery


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
    visitor.addPoint(row.latitude, row.longitude, row.name, visitor.buildDescription(row), row.color)
