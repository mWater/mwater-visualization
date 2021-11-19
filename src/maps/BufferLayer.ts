import _ from "lodash"
import produce, { original } from "immer"
import { JsonQLExpr, JsonQLQuery, JsonQLSelect } from "jsonql"
import { DataSource, ExprCleaner, ExprCompiler, ExprValidator, injectTableAlias, Schema } from "mwater-expressions"
import React from "react"
import { JsonQLFilter } from "../JsonQLFilter"
import AxisBuilder from "../axes/AxisBuilder"
import { BufferLayerDesign } from "./BufferLayerDesign"
import Layer, { OnGridClickOptions, VectorTileDef } from "./Layer"
import { OnGridClickResults } from "./maps"
import { compileColorMapToMapbox } from "./mapboxUtils"

import LegendGroup from "./LegendGroup"
import LayerLegendComponent from "./LayerLegendComponent"
import * as PopupFilterJoinsUtils from "./PopupFilterJoinsUtils"
import { AnyLayer } from "maplibre-gl"

/*
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

*/
export default class BufferLayer extends Layer<BufferLayerDesign> {
  /** Gets the type of layer definition */
  getLayerDefinitionType(): "VectorTile" {
    return "VectorTile"
  }

  getVectorTile(
    design: BufferLayerDesign,
    sourceId: string,
    schema: Schema,
    filters: JsonQLFilter[],
    opacity: number
  ): VectorTileDef {
    const jsonql = this.createJsonQL(design, schema, filters)

    const mapLayers: AnyLayer[] = []

    // If color axes, add color conditions
    const color = compileColorMapToMapbox(design.axes.color || undefined, design.color || "transparent")

    mapLayers.push({
      id: `${sourceId}:fill`,
      type: "fill",
      source: sourceId,
      "source-layer": "circles",
      paint: {
        "fill-opacity": design.fillOpacity * opacity,
        "fill-color": color,
        "fill-outline-color": "transparent"
      }
    })

    // if (design.borderStyle == "color") {
    //   mapLayers.push({
    //     'id': `${sourceId}:line`,
    //     'type': 'line',
    //     'source': sourceId,
    //     'source-layer': 'grid',
    //     paint: {
    //       "line-color": color,
    //       // Make darker if fill opacity is higher
    //       "line-opacity": (1 - (1 - design.fillOpacity!) / 2) * opacity,
    //       "line-width": 1
    //     }
    //   })
    // }

    return {
      sourceLayers: [{ id: "circles", jsonql: jsonql }],
      ctes: [],
      mapLayers: mapLayers,
      mapLayersHandleClicks: [`${sourceId}:fill`]
    }
  }

  createJsonQL(design: BufferLayerDesign, schema: Schema, filters: JsonQLFilter[]): JsonQLQuery {
    let colorExpr: JsonQLExpr
    const axisBuilder = new AxisBuilder({ schema })
    const exprCompiler = new ExprCompiler(schema)

    // Expression for the envelope of the tile
    const envelopeExpr: JsonQLExpr = {
      type: "scalar",
      from: { type: "table", table: "tile", alias: "tile" },
      expr: { type: "field", tableAlias: "tile", column: "envelope" }
    }

    /*
    Query:
      select
      <primary key> as id,
      [<color axis> as color,
      ST_AsMVTGeom(<geometry axis>, (select tile.envelope from tile as tile) as the_geom_webmercator,
      from <table> as main
      where
        <geometry axis> is not null
        * Bounding box filter for speed
      and <geometry axis> &&
      ST_Transform(ST_Expand(
        * Prevent 3857 overflow (i.e. > 85 degrees lat)
        ST_Intersection(
          ST_Transform(!bbox!, 4326),
          ST_Expand(ST_MakeEnvelope(-180, -85, 180, 85, 4326), -<radius in degrees>))
        , <radius in degrees>})
      , 3857)
      and <other filters>
    */

    // Compile geometry axis
    let geometryExpr = axisBuilder.compileAxis({ axis: design.axes.geometry!, tableAlias: "main" })

    // radius / cos(st_ymax(st_transform(geometryExpr, 4326)) * 0.017453293)
    const bufferAmountExpr: JsonQLExpr = {
      type: "op",
      op: "/",
      exprs: [
        design.radius,
        {
          type: "op",
          op: "cos",
          exprs: [
            {
              type: "op",
              op: "*",
              exprs: [
                { type: "op", op: "ST_YMax", exprs: [{ type: "op", op: "ST_Transform", exprs: [geometryExpr, 4326] }] },
                0.017453293
              ]
            }
          ]
        }
      ]
    }

    const bufferExpr: JsonQLExpr = {
      type: "op",
      op: "ST_Buffer",
      exprs: [geometryExpr, bufferAmountExpr]
    }

    const selects: JsonQLSelect[] = [
      {
        type: "select",
        expr: { type: "field", tableAlias: "main", column: schema.getTable(design.table)!.primaryKey },
        alias: "id"
      }, // main primary key as id
      {
        type: "select",
        expr: { type: "op", op: "ST_AsMVTGeom", exprs: [bufferExpr, envelopeExpr] },
        alias: "the_geom_webmercator"
      }
    ]

    // Add color select if color axis
    if (design.axes.color) {
      colorExpr = axisBuilder.compileAxis({ axis: design.axes.color, tableAlias: "main" })
      selects.push({ type: "select", expr: colorExpr, alias: "color" })
    }

    // Create select
    const query: JsonQLQuery = {
      type: "query",
      selects,
      from: exprCompiler.compileTable(design.table, "main")
    }

    // To prevent buffer from exceeding coordinates
    // ST_Transform(ST_Expand(
    //     # Prevent 3857 overflow (i.e. > 85 degrees lat)
    //     ST_Intersection(
    //       ST_Transform(!bbox!, 4326),
    //       ST_Expand(ST_MakeEnvelope(-180, -85, 180, 85, 4326), -<radius in degrees>))
    //     , <radius in degrees>})
    //   , 3857)
    // TODO document how we compute this
    const radiusDeg = design.radius / 100000

    const boundingBox: JsonQLExpr = {
      type: "op",
      op: "ST_Transform",
      exprs: [
        {
          type: "op",
          op: "ST_Expand",
          exprs: [
            {
              type: "op",
              op: "ST_Intersection",
              exprs: [
                { type: "op", op: "ST_Transform", exprs: [envelopeExpr, 4326] },
                {
                  type: "op",
                  op: "ST_Expand",
                  exprs: [{ type: "op", op: "ST_MakeEnvelope", exprs: [-180, -85, 180, 85, 4326] }, -radiusDeg]
                }
              ]
            },
            radiusDeg
          ]
        },
        3857
      ]
    }

    // Create filters. First ensure geometry and limit to bounding box
    let whereClauses: JsonQLExpr[] = [
      { type: "op", op: "is not null", exprs: [geometryExpr] },
      {
        type: "op",
        op: "&&",
        exprs: [geometryExpr, boundingBox]
      }
    ]

    // Then add filters baked into layer
    if (design.filter) {
      whereClauses.push(exprCompiler.compileExpr({ expr: design.filter, tableAlias: "main" }))
    }

    // Then add extra filters passed in, if relevant
    // Get relevant filters
    const relevantFilters = _.where(filters, { table: design.table })
    for (let filter of relevantFilters) {
      whereClauses.push(injectTableAlias(filter.jsonql, "main"))
    }

    whereClauses = _.compact(whereClauses)

    // Wrap if multiple
    if (whereClauses.length > 1) {
      query.where = { type: "op", op: "and", exprs: whereClauses }
    } else {
      query.where = whereClauses[0]
    }

    // Sort order
    if (design.axes.color && design.axes.color.colorMap) {
      // TODO should use categories, not colormap order
      const order = design.axes.color.drawOrder || _.pluck(design.axes.color.colorMap, "value")
      const categories = axisBuilder.getCategories(design.axes.color, order)

      const cases = _.map(categories, (category, i) => {
        return {
          when:
            category.value != null
              ? ({ type: "op", op: "=", exprs: [colorExpr, category.value] } as JsonQLExpr)
              : ({ type: "op", op: "is null", exprs: [colorExpr] } as JsonQLExpr),
          then: order.indexOf(category.value) || -1
        }
      })

      if (cases.length > 0) {
        query.orderBy = [
          {
            expr: {
              type: "case",
              cases
            },
            direction: "desc" // Reverse color map order
          }
        ]
      }
    }

    return query
  }

  // Gets the layer definition as JsonQL + CSS in format:
  //   {
  //     layers: array of { id: layer id, jsonql: jsonql that includes "the_webmercator_geom" as a column }
  //     css: carto css
  //     interactivity: (optional) { layer: id of layer, fields: array of field names }
  //   }
  // arguments:
  //   design: design of layer
  //   schema: schema to use
  //   filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to put in table alias
  getJsonQLCss(design: BufferLayerDesign, schema: Schema, filters: JsonQLFilter[]) {
    // Create design
    const layerDef = {
      layers: [{ id: "layer0", jsonql: this.createMapnikJsonQL(design, schema, filters) }],
      css: this.createCss(design, schema),
      interactivity: {
        layer: "layer0",
        fields: ["id"]
      }
    }

    return layerDef
  }

  createMapnikJsonQL(design: BufferLayerDesign, schema: Schema, filters: JsonQLFilter[]) {
    let colorExpr: JsonQLExpr
    const axisBuilder = new AxisBuilder({ schema })
    const exprCompiler = new ExprCompiler(schema)

    /*
    Query:
      select
      <primary key> as id,
      [<color axis> as color,
      st_transform(<geometry axis>, 3857) as the_geom_webmercator,
      radius * 2 / (!pixel_width! * cos(st_ymin(st_transform(geometryExpr, 4326)) * 0.017453293) as width
      from <table> as main
      where
        <geometry axis> is not null
        * Bounding box filter for speed
      and <geometry axis> &&
      ST_Transform(ST_Expand(
        * Prevent 3857 overflow (i.e. > 85 degrees lat)
        ST_Intersection(
          ST_Transform(!bbox!, 4326),
          ST_Expand(ST_MakeEnvelope(-180, -85, 180, 85, 4326), -<radius in degrees>))
        , <radius in degrees>})
      , 3857)
      and <other filters>
    */

    // Compile geometry axis
    let geometryExpr = axisBuilder.compileAxis({ axis: design.axes.geometry!, tableAlias: "main" })

    // radius * 2 / (!pixel_width! * cos(st_ymin(st_transform(geometryExpr, 4326)) * 0.017453293) + 1 # add one to make always visible
    const widthExpr: JsonQLExpr = {
      type: "op",
      op: "+",
      exprs: [
        {
          type: "op",
          op: "/",
          exprs: [
            { type: "op", op: "*", exprs: [design.radius, 2] },
            {
              type: "op",
              op: "*",
              exprs: [
                { type: "op", op: "nullif", exprs: [{ type: "token", token: "!pixel_height!" }, 0] },
                {
                  type: "op",
                  op: "cos",
                  exprs: [
                    {
                      type: "op",
                      op: "*",
                      exprs: [
                        {
                          type: "op",
                          op: "ST_YMIN",
                          exprs: [{ type: "op", op: "ST_Transform", exprs: [geometryExpr, 4326] }]
                        },
                        0.017453293
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        2
      ]
    }

    const selects: JsonQLSelect[] = [
      {
        type: "select",
        expr: { type: "field", tableAlias: "main", column: schema.getTable(design.table)!.primaryKey },
        alias: "id"
      }, // main primary key as id
      { type: "select", expr: geometryExpr, alias: "the_geom_webmercator" },
      { type: "select", expr: widthExpr, alias: "width" } // Width of circles
    ]

    // Add color select if color axis
    if (design.axes.color) {
      colorExpr = axisBuilder.compileAxis({ axis: design.axes.color, tableAlias: "main" })
      selects.push({ type: "select", expr: colorExpr, alias: "color" })
    }

    // Select _id, location and clustered row number
    const query: JsonQLQuery = {
      type: "query",
      selects,
      from: exprCompiler.compileTable(design.table, "main")
    }

    // ST_Transform(ST_Expand(
    //     # Prevent 3857 overflow (i.e. > 85 degrees lat)
    //     ST_Intersection(
    //       ST_Transform(!bbox!, 4326),
    //       ST_Expand(ST_MakeEnvelope(-180, -85, 180, 85, 4326), -<radius in degrees>))
    //     , <radius in degrees>})
    //   , 3857)
    // TODO document how we compute this
    const radiusDeg = design.radius / 100000

    const boundingBox: JsonQLExpr = {
      type: "op",
      op: "ST_Transform",
      exprs: [
        {
          type: "op",
          op: "ST_Expand",
          exprs: [
            {
              type: "op",
              op: "ST_Intersection",
              exprs: [
                { type: "op", op: "ST_Transform", exprs: [{ type: "token", token: "!bbox!" }, 4326] },
                {
                  type: "op",
                  op: "ST_Expand",
                  exprs: [{ type: "op", op: "ST_MakeEnvelope", exprs: [-180, -85, 180, 85, 4326] }, -radiusDeg]
                }
              ]
            },
            radiusDeg
          ]
        },
        3857
      ]
    }

    // Create filters. First ensure geometry and limit to bounding box
    let whereClauses: JsonQLExpr[] = [
      { type: "op", op: "is not null", exprs: [geometryExpr] },
      {
        type: "op",
        op: "&&",
        exprs: [geometryExpr, boundingBox]
      }
    ]

    // Then add filters baked into layer
    if (design.filter) {
      whereClauses.push(exprCompiler.compileExpr({ expr: design.filter, tableAlias: "main" }))
    }

    // Then add extra filters passed in, if relevant
    // Get relevant filters
    const relevantFilters = _.where(filters, { table: design.table })
    for (let filter of relevantFilters) {
      whereClauses.push(injectTableAlias(filter.jsonql, "main"))
    }

    whereClauses = _.compact(whereClauses)

    // Wrap if multiple
    if (whereClauses.length > 1) {
      query.where = { type: "op", op: "and", exprs: whereClauses }
    } else {
      query.where = whereClauses[0]
    }

    // Sort order
    if (design.axes.color && design.axes.color.colorMap) {
      // TODO should use categories, not colormap order
      const order = design.axes.color.drawOrder || _.pluck(design.axes.color.colorMap, "value")
      const categories = axisBuilder.getCategories(design.axes.color, order)

      const cases = _.map(categories, (category, i) => {
        return {
          when:
            category.value != null
              ? ({ type: "op", op: "=", exprs: [colorExpr, category.value] } as JsonQLExpr)
              : ({ type: "op", op: "is null", exprs: [colorExpr] } as JsonQLExpr),
          then: order.indexOf(category.value) || -1
        }
      })

      if (cases.length > 0) {
        query.orderBy = [
          {
            expr: {
              type: "case",
              cases
            },
            direction: "desc" // Reverse color map order
          }
        ]
      }
    }

    return query
  }

  createCss(design: BufferLayerDesign, schema: Schema) {
    let css =
      `\
#layer0 {
  marker-fill-opacity: ` +
      design.fillOpacity +
      `;
marker-type: ellipse;
marker-width: [width];
marker-line-width: 0;
marker-allow-overlap: true;
marker-ignore-placement: true;
marker-fill: ` +
      (design.color || "transparent") +
      `;
}\
`

    // If color axes, add color conditions
    if (design.axes.color != null && design.axes.color.colorMap != null) {
      for (let item of design.axes.color.colorMap) {
        // If invisible
        if ((design.axes.color.excludedValues || []).includes(item.value)) {
          css += `#layer0 [color=${JSON.stringify(item.value)}] { marker-fill-opacity: 0; }\n`
        } else {
          css += `#layer0 [color=${JSON.stringify(item.value)}] { marker-fill: ${item.color}; }\n`
        }
      }
    }

    return css
  }

  // Called when the interactivity grid is clicked.
  // arguments:
  //   ev: { data: interactivty data e.g. `{ id: 123 }` }
  //   clickOptions:
  //     design: design of layer
  //     schema: schema to use
  //     dataSource: data source to use
  //     layerDataSource: layer data source
  //     scopeData: current scope data if layer is scoping
  //     filters: compiled filters to apply to the popup
  //
  // Returns:
  //   null/undefined
  //   or
  //   {
  //     scope: scope to apply ({ name, filter, data })
  //     row: { tableId:, primaryKey: }  # row that was selected
  //     popup: React element to put into a popup
  //   }
  onGridClick(ev: { data: any; event: any }, clickOptions: OnGridClickOptions<BufferLayerDesign>): OnGridClickResults {
    // TODO abstract most to base class
    if (ev.data && ev.data.id) {
      const { table } = clickOptions.design
      const results: OnGridClickResults = {}

      // Scope toggle item if ctrl-click
      if (ev.event.originalEvent.shiftKey) {
        let ids = clickOptions.scopeData || []
        if (ids.includes(ev.data.id)) {
          ids = _.without(ids, ev.data.id)
        } else {
          ids = ids.concat([ev.data.id])
        }

        // Create filter for rows
        const filter = {
          table,
          jsonql: {
            type: "op",
            op: "=",
            modifier: "any",
            exprs: [
              { type: "field", tableAlias: "{alias}", column: clickOptions.schema.getTable(table)!.primaryKey },
              { type: "literal", value: ids }
            ]
          }
        }

        // Create filter expression for rows
        const filterExpr = {
          table,
          type: "op",
          op: "= any",
          exprs: [
            { type: "id", table },
            { type: "literal", valueType: "id[]", value: ids }
          ]
        }

        // Scope to item
        if (ids.length > 0) {
          results.scope = {
            name: `Selected ${ids.length} Circle(s)`,
            filter,
            filterExpr,
            data: ids
          }
        } else {
          results.scope = null
        }
      }

      // Popup
      if (clickOptions.design.popup && !ev.event.originalEvent.shiftKey) {
        // Create filter using popupFilterJoins
        const popupFilterJoins =
          clickOptions.design.popupFilterJoins || PopupFilterJoinsUtils.createDefaultPopupFilterJoins(table)
        const popupFilters = PopupFilterJoinsUtils.createPopupFilters(
          popupFilterJoins,
          clickOptions.schema,
          table,
          ev.data.id
        )

        const BlocksLayoutManager = require("../layouts/blocks/BlocksLayoutManager").default
        const WidgetFactory = require("../widgets/WidgetFactory").default

        results.popup = new BlocksLayoutManager().renderLayout({
          items: clickOptions.design.popup.items,
          style: "popup",
          renderWidget: (options: any) => {
            const widget = WidgetFactory.createWidget(options.type)

            const filters = clickOptions.filters.concat(popupFilters)

            // Get data source for widget
            const widgetDataSource = clickOptions.layerDataSource.getPopupWidgetDataSource(
              clickOptions.design,
              options.id
            )

            return widget.createViewElement({
              schema: clickOptions.schema,
              dataSource: clickOptions.dataSource,
              widgetDataSource,
              design: options.design,
              scope: null,
              filters,
              onScopeChange: null,
              onDesignChange: null,
              width: options.width,
              height: options.height
            })
          }
        })
      } else if (!ev.event.originalEvent.shiftKey) {
        results.row = { tableId: table, primaryKey: ev.data.id }
      }

      return results
    } else {
      return null
    }
  }

  // Gets the bounds of the layer as GeoJSON
  getBounds(design: BufferLayerDesign, schema: Schema, dataSource: DataSource, filters: JsonQLFilter[], callback: any) {
    // TODO technically should pad for the radius, but we always pad by 20% anyway so it should be fine
    return this.getBoundsFromExpr(
      schema,
      dataSource,
      design.table,
      design.axes.geometry!.expr,
      design.filter || null,
      filters,
      callback
    )
  }

  getMinZoom(design: BufferLayerDesign) {
    return design.minZoom
  }

  // Removed as was making deceptively not present
  // # Get min and max zoom levels
  // getMinZoom: (design) ->
  //   # Earth is 40000km around, is 256 pixels. So zoom z radius map of r takes up 2*r*256*2^z/40000000 meters.
  //   # So zoom with 5 pixels across = log2(4000000*5/(2*r*256))
  //   if design.radius
  //     zoom = Math.ceil(Math.log(40000000*5/(2*design.radius*256))/Math.log(2))
  //     if design.minZoom?
  //       return Math.max(zoom, design.minZoom)
  //     return zoom
  //   else
  //     return design.minZoom

  getMaxZoom(design: BufferLayerDesign) {
    return design.maxZoom || 21
  }

  // Get the legend to be optionally displayed on the map. Returns
  // a React element
  getLegend(
    design: BufferLayerDesign,
    schema: Schema,
    name: string,
    dataSource: DataSource,
    locale: string,
    filters: JsonQLFilter[]
  ) {
    const _filters = filters.slice()
    if (design.filter != null) {
      const exprCompiler = new ExprCompiler(schema)
      const jsonql = exprCompiler.compileExpr({ expr: design.filter, tableAlias: "{alias}" })
      if (jsonql) {
        _filters.push({ table: (design.filter as any).table, jsonql })
      }
    }

    const axisBuilder = new AxisBuilder({ schema })
    return React.createElement(LayerLegendComponent, {
      schema,
      name,
      filters: _.compact(_filters),
      axis: axisBuilder.cleanAxis({
        axis: design.axes.color,
        table: design.table,
        types: ["enum", "text", "boolean", "date"],
        aggrNeed: "none"
      })!,
      radiusLayer: true,
      defaultColor: design.color,
      locale
    })
  }

  // Get a list of table ids that can be filtered on
  getFilterableTables(design: BufferLayerDesign, schema: Schema) {
    if (design.table) {
      return [design.table]
    } else {
      return []
    }
  }

  // True if layer can be edited
  isEditable() {
    return true
  }

  // True if layer is incomplete (e.g. brand new) and should be editable immediately
  isIncomplete(design: BufferLayerDesign, schema: Schema) {
    return this.validateDesign(design, schema) != null
  }

  // Creates a design element with specified options
  // options:
  //   design: design of layer
  //   schema: schema to use
  //   dataSource: data source to use
  //   onDesignChange: function called when design changes
  //   filters: array of filters
  createDesignerElement(options: {
    design: BufferLayerDesign
    schema: Schema
    dataSource: DataSource
    onDesignChange: (design: BufferLayerDesign) => void
    filters: JsonQLFilter[]
  }): React.ReactElement<{}> {
    // Require here to prevent server require problems
    const BufferLayerDesignerComponent = require("./BufferLayerDesignerComponent").default

    // Clean on way in and out
    return React.createElement(BufferLayerDesignerComponent, {
      schema: options.schema,
      dataSource: options.dataSource,
      design: this.cleanDesign(options.design, options.schema),
      filters: options.filters,
      onDesignChange: (design: BufferLayerDesign) => {
        return options.onDesignChange(this.cleanDesign(design, options.schema))
      }
    })
  }

  // Returns a cleaned design
  cleanDesign(design: BufferLayerDesign, schema: Schema) {
    const exprCleaner = new ExprCleaner(schema)
    const axisBuilder = new AxisBuilder({ schema })

    design = produce(design, (draft) => {
      // Default color
      draft.color = design.color || "#0088FF"

      draft.axes = design.axes || {}
      draft.radius = design.radius || 1000
      draft.fillOpacity = design.fillOpacity != null ? design.fillOpacity : 0.5

      draft.axes.geometry = axisBuilder.cleanAxis({
        axis: draft.axes.geometry ? original(draft.axes.geometry) || null : null,
        table: design.table,
        types: ["geometry"],
        aggrNeed: "none"
      })
      draft.axes.color = axisBuilder.cleanAxis({
        axis: draft.axes.color ? original(draft.axes.color) || null : null,
        table: design.table,
        types: ["enum", "text", "boolean", "date"],
        aggrNeed: "none"
      })

      draft.filter = exprCleaner.cleanExpr(design.filter || null, { table: design.table })
    })

    return design
  }

  // Validates design. Null if ok, message otherwise
  validateDesign(design: BufferLayerDesign, schema: Schema) {
    const axisBuilder = new AxisBuilder({ schema })
    const exprValidator = new ExprValidator(schema)

    if (!design.table) {
      return "Missing table"
    }

    if (design.radius == null) {
      return "Missing radius"
    }

    if (!design.axes || !design.axes.geometry) {
      return "Missing axes"
    }

    let error = axisBuilder.validateAxis({ axis: design.axes.geometry })
    if (error) {
      return error
    }

    // Check type of axis (prevents blank axes)
    if (axisBuilder.getAxisType(design.axes.geometry) != "geometry") {
      return "Geometry axis required"
    }

    error = axisBuilder.validateAxis({ axis: design.axes.color })
    if (error) {
      return error
    }

    // Validate filter
    error = exprValidator.validateExpr(design.filter || null)
    if (error) {
      return error
    }

    return null
  }

  createKMLExportJsonQL(design: BufferLayerDesign, schema: Schema, filters: JsonQLFilter[]) {
    let colorExpr: JsonQLExpr
    const axisBuilder = new AxisBuilder({ schema })
    const exprCompiler = new ExprCompiler(schema)
    // Compile geometry axis
    const geometryExpr = axisBuilder.compileAxis({ axis: design.axes.geometry!, tableAlias: "main" })

    // st_transform(st_buffer(st_transform(<geometry axis>, 4326)::geography, <radius>)::geometry, 3857) as the_geom_webmercator
    const bufferedGeometry: JsonQLExpr = {
      type: "op",
      op: "ST_AsGeoJson",
      exprs: [
        {
          type: "op",
          op: "::geometry",
          exprs: [
            {
              type: "op",
              op: "ST_Buffer",
              exprs: [
                {
                  type: "op",
                  op: "::geography",
                  exprs: [{ type: "op", op: "ST_Transform", exprs: [geometryExpr, 4326] }]
                },
                design.radius
              ]
            }
          ]
        }
      ]
    }

    const selects: JsonQLSelect[] = [
      {
        type: "select",
        expr: { type: "field", tableAlias: "main", column: schema.getTable(design.table)!.primaryKey },
        alias: "id"
      }, // main primary key as id
      { type: "select", expr: bufferedGeometry, alias: "the_geom_webmercator" }
    ]

    const extraFields = ["code", "name", "desc", "type", "photos"]

    for (let field of extraFields) {
      const column = schema.getColumn(design.table, field)

      if (column) {
        selects.push({ type: "select", expr: { type: "field", tableAlias: "main", column: field }, alias: field })
      }
    }

    // Add color select if color axis
    if (design.axes.color) {
      const valueExpr = exprCompiler.compileExpr({ expr: design.axes.color.expr, tableAlias: "main" })
      colorExpr = axisBuilder.compileAxis({ axis: design.axes.color, tableAlias: "main" })
      selects.push({ type: "select", expr: valueExpr, alias: "value" })
      selects.push({ type: "select", expr: colorExpr, alias: "color" })
    }

    // Select _id, location and clustered row number
    const query: JsonQLQuery = {
      type: "query",
      selects,
      from: exprCompiler.compileTable(design.table, "main")
    }

    // ST_Transform(ST_Expand(
    //     # Prevent 3857 overflow (i.e. > 85 degrees lat)
    //     ST_Intersection(
    //       ST_Transform(!bbox!, 4326),
    //       ST_Expand(ST_MakeEnvelope(-180, -85, 180, 85, 4326), -<radius in degrees>))
    //     , <radius in degrees>})
    //   , 3857)
    // TODO document how we compute this
    const radiusDeg = design.radius / 100000

    // Create filters. First ensure geometry and limit to bounding box
    let whereClauses: JsonQLExpr[] = [{ type: "op", op: "is not null", exprs: [geometryExpr] }]

    // Then add filters baked into layer
    if (design.filter) {
      whereClauses.push(exprCompiler.compileExpr({ expr: design.filter, tableAlias: "main" }))
    }

    // Then add extra filters passed in, if relevant
    // Get relevant filters
    const relevantFilters = _.where(filters, { table: design.table })
    for (let filter of relevantFilters) {
      whereClauses.push(injectTableAlias(filter.jsonql, "main"))
    }

    whereClauses = _.compact(whereClauses)

    // Wrap if multiple
    if (whereClauses.length > 1) {
      query.where = { type: "op", op: "and", exprs: whereClauses }
    } else {
      query.where = whereClauses[0]
    }

    if (design.axes.color && design.axes.color.colorMap) {
      const order = design.axes.color.drawOrder || _.pluck(design.axes.color.colorMap, "value")
      const categories = axisBuilder.getCategories(design.axes.color, _.pluck(design.axes.color.colorMap, "value"))

      const cases = _.map(categories, (category, i) => {
        return {
          when:
            category.value != null
              ? ({ type: "op", op: "=", exprs: [colorExpr, category.value] } as JsonQLExpr)
              : ({ type: "op", op: "is null", exprs: [colorExpr] } as JsonQLExpr),
          then: order.indexOf(category.value) || -1
        }
      })

      if (cases.length > 0) {
        query.orderBy = [
          {
            expr: {
              type: "case",
              cases
            },
            direction: "desc" // Reverse color map order
          }
        ]
      }
    }

    return query
  }

  getKMLExportJsonQL(design: BufferLayerDesign, schema: Schema, filters: JsonQLFilter[]) {
    const style: any = {
      color: design.color,
      opacity: design.fillOpacity
    }

    if (design.axes.color && design.axes.color.colorMap) {
      style.colorMap = design.axes.color.colorMap
    }

    const layerDef = {
      layers: [{ id: "layer0", jsonql: this.createKMLExportJsonQL(design, schema, filters), style }]
    }

    return layerDef
  }

  acceptKmlVisitorForRow(visitor: any, row: any) {
    const data = JSON.parse(row.the_geom_webmercator)

    const outer = data.coordinates[0]
    const inner = data.coordinates.slice(1)

    const list = _.map(outer, (coordinates: any) => coordinates.join(","))

    return visitor.addPolygon(list.join(" "), row.color, false, row.name, visitor.buildDescription(row))
  }
}
