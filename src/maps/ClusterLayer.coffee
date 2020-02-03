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

###
Layer which clusters markers, counting them

Design is:
  table: table to get data from
  axes: axes (see below)
  filter: optional logical expression to filter by
  textColor: color of text. default #FFFFFF
  fillColor: color of markers that text is drawn on. default #337ab7
  minZoom: minimum zoom level
  maxZoom: maximum zoom level

axes:
  geometry: locations to cluster

###
module.exports = class ClusterLayer extends Layer
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
    Query:
      Works by first snapping to grid and then clustering the clusters with slower DBSCAN method

      select 
        ST_Centroid(ST_Collect(center)) as the_geom_webmercator,
        sum(cnt) as cnt, 
        log(sum(cnt)) * 6 + 14 as size from 
          (
            select 
            ST_ClusterDBSCAN(center, (!pixel_width!*30 + !pixel_height!*30)/2, 1) over () as clust,
            sub1.center as center,
            cnt as cnt
            from
            (
              select 
              count(*) as cnt, 
              ST_Centroid(ST_Collect(<geometry axis>)) as center, 
              ST_Snaptogrid(<geometry axis>, !pixel_width!*40, !pixel_height!*40) as grid
              from <table> as main
              where <geometry axis> && !bbox! 
                and <geometry axis> is not null
                and <other filters>
              group by 3
            ) as sub1
          ) as sub2 
        group by sub2.clust

    ###

    # Compile geometry axis
    geometryExpr = axisBuilder.compileAxis(axis: design.axes.geometry, tableAlias: "main")

    # Convert to Web mercator (3857)
    geometryExpr = { type: "op", op: "ST_Transform", exprs: [geometryExpr, 3857] }

    # ST_Centroid(ST_Collect(<geometry axis>))
    centerExpr = {
      type: "op"
      op: "ST_Centroid"
      exprs: [
        {
          type: "op"
          op: "ST_Collect"
          exprs: [geometryExpr]
        }
      ]
    }

    # ST_Snaptogrid(<geometry axis>, !pixel_width!*40, !pixel_height!*40)
    gridExpr = {
      type: "op"
      op: "ST_Snaptogrid"
      exprs: [
        geometryExpr
        {
          type: "op"
          op: "*"
          exprs: [{ type: "token", token: "!pixel_width!" }, 40]
        }
        {
          type: "op"
          op: "*"
          exprs: [{ type: "token", token: "!pixel_width!" }, 40]
        }
      ]
    }

    # Create inner query
    innerQuery = {
      type: "query"
      selects: [
        { type: "select", expr: { type: "op", op: "count", exprs: [] }, alias: "cnt" }
        { type: "select", expr: centerExpr, alias: "center" }
        { type: "select", expr: gridExpr, alias: "grid" }
      ]
      from: exprCompiler.compileTable(design.table, "main")
      groupBy: [3]
    }

    # Create filters. First ensure geometry and limit to bounding box
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
      whereClauses.push(exprCompiler.compileExpr(expr: design.filter, tableAlias: "main"))

    # Then add extra filters passed in, if relevant
    # Get relevant filters
    relevantFilters = _.where(filters, table: design.table)
    for filter in relevantFilters
      whereClauses.push(injectTableAlias(filter.jsonql, "main"))

    whereClauses = _.compact(whereClauses)

    # Wrap if multiple
    if whereClauses.length > 1
      innerQuery.where = { type: "op", op: "and", exprs: whereClauses }
    else
      innerQuery.where = whereClauses[0]

    # Create next level
    # select 
    # ST_ClusterDBSCAN(center, (!pixel_width!*30 + !pixel_height!*30)/2, 1) over () as clust,
    # sub1.center as center,
    # cnt as cnt from () as innerquery
    clustExpr = {
      type: "op"
      op: "ST_ClusterDBSCAN"
      exprs: [
        { type: "field", tableAlias: "innerquery", column: "center" }
        { type: "op", op: "/", exprs: [
          { type: "op", op: "+", exprs: [
            { type: "op", op: "*", exprs: [{ type: "token", token: "!pixel_width!" }, 30] }
            { type: "op", op: "*", exprs: [{ type: "token", token: "!pixel_height!" }, 30] }
            ]}
          , 2]}
        1
      ]
    }

    inner2Query = {
      type: "query"
      selects: [
        { type: "select", expr: clustExpr, over: {}, alias: "clust" }
        { type: "select", expr: { type: "field", tableAlias: "innerquery", column: "center" }, alias: "center" }
        { type: "select", expr: { type: "field", tableAlias: "innerquery", column: "cnt" }, alias: "cnt" }
      ]
      from: { type: "subquery", query: innerQuery, alias: "innerquery" }
    }

    # Create final level
    # ST_Centroid(ST_Collect(center)) as the_geom_webmercator,
    # sum(cnt) as cnt, 
    # log(sum(cnt)) * 6 + 14 as size from 

    # ST_Centroid(ST_Collect(center))
    centerExpr = {
      type: "op"
      op: "ST_Centroid"
      exprs: [
        {
          type: "op"
          op: "ST_Collect"
          exprs: [{ type: "field", tableAlias: "inner2query", column: "center" }]
        }
      ]
    }

    cntExpr = { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "inner2query", column: "cnt" }] }

    sizeExpr = {
      type: "op"
      op: "+"
      exprs: [{ type: "op", op: "*", exprs: [{ type: "op", op: "log", exprs: [cntExpr] }, 6] }, 14]
    }

    query = {
      type: "query"
      selects: [
        { type: "select", expr: centerExpr, alias: "the_geom_webmercator" }
        { type: "select", expr: cntExpr, alias: "cnt" }
        { type: "select", expr: sizeExpr, alias: "size" }
      ]
      from: { type: "subquery", query: inner2Query, alias: "inner2query" }
      groupBy: [{ type: "field", tableAlias: "inner2query", column: "clust" }]
    }

    return query

  createCss: (design, schema) ->
    css = '''
      #layer0 [cnt>1] {
        marker-width: [size];
        marker-line-color: white;
        marker-line-width: 4;
        marker-line-opacity: 0.6;
        marker-placement: point;
        marker-type: ellipse;
        marker-allow-overlap: true;
        marker-fill: ''' + (design.fillColor or "#337ab7") + ''';
      }

      #layer0::l1 [cnt>1] { 
        text-name: [cnt];
        text-face-name: 'Arial Bold';
        text-allow-overlap: true;
        text-fill: ''' + (design.textColor or "white") + ''';
      }

      #layer0 [cnt=1] {
        marker-width: 10;
        marker-line-color: white;
        marker-line-width: 2;
        marker-line-opacity: 0.6;
        marker-placement: point;
        marker-type: ellipse;
        marker-allow-overlap: true;
        marker-fill: ''' + (design.fillColor or "#337ab7") + ''';
      }
    '''

    return css

  # # Called when the interactivity grid is clicked.
  # # arguments:
  # #   ev: { data: interactivty data e.g. `{ id: 123 }` }
  # #   options:
  # #     design: design of layer
  # #     schema: schema to use
  # #     dataSource: data source to use
  # #     layerDataSource: layer data source
  # #     scopeData: current scope data if layer is scoping
  # #     filters: compiled filters to apply to the popup
  # #
  # # Returns:
  # #   null/undefined
  # #   or
  # #   {
  # #     scope: scope to apply ({ name, filter, data })
  # #     row: { tableId:, primaryKey: }  # row that was selected
  # #     popup: React element to put into a popup
  # #   }
  # onGridClick: (ev, clickOptions) ->
  #   # TODO abstract most to base class
  #   if ev.data and ev.data.id
  #     table = clickOptions.design.table
  #     results = {}

  #     # Scope toggle item if ctrl-click
  #     if ev.event.originalEvent.shiftKey
  #       ids = clickOptions.scopeData or []
  #       if ev.data.id in ids
  #         ids = _.without(ids, ev.data.id)
  #       else
  #         ids = ids.concat([ev.data.id])

  #       # Create filter for rows
  #       filter = {
  #         table: table
  #         jsonql: { type: "op", op: "=", modifier: "any", exprs: [
  #           { type: "field", tableAlias: "{alias}", column: clickOptions.schema.getTable(table).primaryKey }
  #           { type: "literal", value: ids }
  #         ]}
  #       }

  #       # Scope to item
  #       if ids.length > 0
  #         results.scope = {
  #           name: "Selected #{ids.length} Circle(s)"
  #           filter: filter
  #           data: ids
  #         }
  #       else
  #         results.scope = null

  #     # Popup
  #     if clickOptions.design.popup and not ev.event.originalEvent.shiftKey
  #       BlocksLayoutManager = require '../layouts/blocks/BlocksLayoutManager'
  #       WidgetFactory = require '../widgets/WidgetFactory'

  #       results.popup = new BlocksLayoutManager().renderLayout({
  #         items: clickOptions.design.popup.items
  #         style: "popup"
  #         renderWidget: (options) =>
  #           widget = WidgetFactory.createWidget(options.type)

  #           # Create filters for single row
  #           filter = {
  #             table: table
  #             jsonql: { type: "op", op: "=", exprs: [
  #               { type: "field", tableAlias: "{alias}", column: clickOptions.schema.getTable(table).primaryKey }
  #               { type: "literal", value: ev.data.id }
  #             ]}
  #           }

  #           filters = clickOptions.filters.concat([filter])

  #           # Get data source for widget
  #           widgetDataSource = clickOptions.layerDataSource.getPopupWidgetDataSource(clickOptions.design, options.id)

  #           return widget.createViewElement({
  #             schema: clickOptions.schema
  #             dataSource: clickOptions.dataSource
  #             widgetDataSource: widgetDataSource
  #             design: options.design
  #             scope: null
  #             filters: filters
  #             onScopeChange: null
  #             onDesignChange: null
  #             width: options.width
  #             height: options.height
  #             standardWidth: options.standardWidth
  #           })
  #         })
  #     else if not ev.event.originalEvent.shiftKey
  #       results.row = { tableId: table, primaryKey: ev.data.id }

  #     return results
  #   else
  #     return null

  # Gets the bounds of the layer as GeoJSON
  getBounds: (design, schema, dataSource, filters, callback) ->
    @getBoundsFromExpr(schema, dataSource, design.table, design.axes.geometry.expr, design.filter, filters, callback)

  getMinZoom: (design) -> design.minZoom

  getMaxZoom: (design) -> design.maxZoom

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
      defaultColor: design.fillColor or "#337ab7"
      symbol: 'font-awesome/circle'
      name: name
      dataSource: dataSource
      filters: _.compact(_filters)

  # Get a list of table ids that can be filtered on
  getFilterableTables: (design, schema) ->
    return if design.table then [design.table] else []

  # True if layer can be edited
  isEditable: () -> true

  # True if layer is incomplete (e.g. brand new) and should be editable immediately
  isIncomplete: (design, schema) ->
    return @validateDesign(design, schema)?

  # Creates a design element with specified options
  # options:
  #   design: design of layer
  #   schema: schema to use
  #   dataSource: data source to use
  #   onDesignChange: function called when design changes
  #   filters: array of filters
  createDesignerElement: (options) ->
    # Require here to prevent server require problems
    ClusterLayerDesignerComponent = require './ClusterLayerDesignerComponent'

    # Clean on way in and out
    React.createElement(ClusterLayerDesignerComponent,
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
      # Default colors
      draft.textColor = design.textColor or "white"
      draft.fillColor = design.fillColor or "#337ab7"

      draft.axes = design.axes or {}

      draft.axes.geometry = axisBuilder.cleanAxis(axis: original(draft.axes.geometry), table: design.table, types: ['geometry'], aggrNeed: "none")

      draft.filter = exprCleaner.cleanExpr(design.filter, { table: design.table })
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

    return null

  # TODO NO KML SUPPORT