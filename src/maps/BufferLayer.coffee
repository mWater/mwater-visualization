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
Layer which draws a buffer around geometries (i.e. a radius circle around points)

Design is:
  table: table to get data from
  axes: axes (see below)
  filter: optional logical expression to filter by
  color: color of layer (e.g. #FF8800). Color axis overrides
  fillOpacity: Opacity to fill the circles (0-1)
  radius: radius to draw in meters
  minZoom: minimum zoom level
  maxZoom: maximum zoom level

  popup: contains items: which is BlocksLayoutManager items. Will be displayed when the circle is clicked
  popupFilterJoins: customizable filtering for popup. See PopupFilterJoins.md

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
      interactivity: {
        layer: "layer0"
        fields: ["id"]
      }
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
      st_transform(<geometry axis>, 3857) as the_geom_webmercator,
      radius * 2 / (!pixel_width! * cos(st_ymin(st_transform(geometryExpr, 4326)) * 0.017453293) as width
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

    # Convert to Web mercator (3857)
    geometryExpr = { type: "op", op: "ST_Transform", exprs: [geometryExpr, 3857] }

    # radius * 2 / (!pixel_width! * cos(st_ymin(st_transform(geometryExpr, 4326)) * 0.017453293) + 1 # add one to make always visible
    widthExpr = {
      type: "op"
      op: "+"
      exprs: [
        {
          type: "op"
          op: "/"
          exprs: [{ type: "op", op: "*", exprs: [design.radius, 2] }, { type: "op", op: "*", exprs: [
            { type: "token", token: "!pixel_height!" }
            { type: "op", op: "cos", exprs: [
              { type: "op", op: "*", exprs: [
                { type: "op", op: "ST_YMIN", exprs: [{ type: "op", op: "ST_Transform", exprs: [geometryExpr, 4326]}] }
                0.017453293
              ]}
            ]}
           ]}
          ]
        }
        2
      ]
    }

    selects = [
      { type: "select", expr: { type: "field", tableAlias: "main", column: schema.getTable(design.table).primaryKey }, alias: "id" } # main primary key as id
      { type: "select", expr: geometryExpr, alias: "the_geom_webmercator" }
      { type: "select", expr: widthExpr, alias: "width" } # Width of circles
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

    # Sort order
    if design.axes.color and design.axes.color.colorMap
      # TODO should use categories, not colormap order
      order = design.axes.color.drawOrder or _.pluck(design.axes.color.colorMap, "value")
      categories = axisBuilder.getCategories(design.axes.color, order)

      cases = _.map categories, (category, i) =>
        {
          when: if category.value? then { type: "op", op: "=", exprs: [colorExpr, category.value] } else { type: "op", op: "is null", exprs: [colorExpr] }
          then: order.indexOf(category.value) or -1
        }

      if cases.length > 0
        query.orderBy = [
          {
            expr: {
              type: "case"
              cases: cases
            }
            direction: "desc" # Reverse color map order
          }
        ]

    return query

  createCss: (design, schema) ->
    css = '''
      #layer0 {
        marker-fill-opacity: ''' + design.fillOpacity + ''';
        marker-type: ellipse;
        marker-width: [width];
        marker-line-width: 0;
        marker-allow-overlap: true;
        marker-ignore-placement: true;
        marker-fill: ''' + (design.color or "transparent") + ''';
      }
    '''

    # If color axes, add color conditions
    if design.axes.color?.colorMap
      for item in design.axes.color.colorMap
        # If invisible
        if _.includes(design.axes.color.excludedValues, item.value)
          css += "#layer0 [color=#{JSON.stringify(item.value)}] { marker-fill-opacity: 0; }\n"  
        else
          css += "#layer0 [color=#{JSON.stringify(item.value)}] { marker-fill: #{item.color}; }\n"

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
            name: "Selected #{ids.length} Circle(s)"
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
    # TODO technically should pad for the radius, but we always pad by 20% anyway so it should be fine
    @getBoundsFromExpr(schema, dataSource, design.table, design.axes.geometry.expr, design.filter, filters, callback)

  getMinZoom: (design) -> design.minZoom

  # Removed as was making deceptively not present
  # # Get min and max zoom levels
  # getMinZoom: (design) ->
  #   # Earth is 40000km around, is 256 pixels. So zoom z radius map of r takes up 2*r*256*2^z/40000000 meters.
  #   # So zoom with 5 pixels across = log2(4000000*5/(2*r*256))
  #   if design.radius
  #     zoom = Math.ceil(Math.log(40000000*5/(2*design.radius*256))/Math.log(2))
  #     if design.minZoom?
  #       return Math.max(zoom, design.minZoom)
  #     return zoom
  #   else
  #     return design.minZoom

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
      name: name
      dataSource: dataSource
      filters: _.compact(_filters)
      axis: axisBuilder.cleanAxis(axis: design.axes.color, table: design.table, types: ['enum', 'text', 'boolean','date'], aggrNeed: "none")
      radiusLayer: true
      defaultColor: design.color

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
    BufferLayerDesignerComponent = require './BufferLayerDesignerComponent'

    # Clean on way in and out
    React.createElement(BufferLayerDesignerComponent,
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
      # Default color
      draft.color = design.color or "#0088FF"

      draft.axes = design.axes or {}
      draft.radius = design.radius or 1000
      draft.fillOpacity = if design.fillOpacity? then design.fillOpacity else 0.5

      draft.axes.geometry = axisBuilder.cleanAxis(axis: original(draft.axes.geometry), table: design.table, types: ['geometry'], aggrNeed: "none")
      draft.axes.color = axisBuilder.cleanAxis(axis: original(draft.axes.color), table: design.table, types: ['enum', 'text', 'boolean','date'], aggrNeed: "none")

      draft.filter = exprCleaner.cleanExpr(design.filter, { table: design.table })
      return
    )

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

    selects = [
      { type: "select", expr: { type: "field", tableAlias: "main", column: schema.getTable(design.table).primaryKey }, alias: "id" } # main primary key as id
      { type: "select", expr: bufferedGeometry, alias: "the_geom_webmercator" }
    ]

    extraFields = ["code", "name", "desc", "type", "photos"]

    for field in extraFields
      column = schema.getColumn(design.table, field)

      if column
        selects.push({ type: "select", expr: { type: "field", tableAlias: "main", column: field }, alias: field })

    # Add color select if color axis
    if design.axes.color
      valueExpr = exprCompiler.compileExpr(expr: design.axes.color.expr, tableAlias: "main")
      colorExpr = axisBuilder.compileAxis(axis: design.axes.color, tableAlias: "main")
      selects.push({ type: "select", expr: valueExpr, alias: "value" })
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

    if design.axes.color and design.axes.color.colorMap
      order = design.axes.color.drawOrder or _.pluck(design.axes.color.colorMap, "value")
      categories = axisBuilder.getCategories(design.axes.color, _.pluck(design.axes.color.colorMap, "value"))

      cases = _.map categories, (category, i) =>
        {
          when: if category.value? then { type: "op", op: "=", exprs: [colorExpr, category.value] } else { type: "op", op: "is null", exprs: [colorExpr] }
          then: order.indexOf(category.value) or -1
        }

      if cases.length > 0
        query.orderBy = [
          {
            expr: {
              type: "case"
              cases: cases
            }
            direction: "desc" # Reverse color map order
          }
        ]

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

    visitor.addPolygon(list.join(" "), row.color, false, row.name, visitor.buildDescription(row))
