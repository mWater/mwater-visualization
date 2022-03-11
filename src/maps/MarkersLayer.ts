import _ from "lodash"
import React from "react"

import { original, produce } from "immer"

import Layer, { OnGridClickOptions, VectorTileDef } from "./Layer"
import { ExprCompiler, ExprCleaner, injectTableAlias, Schema, DataSource, ExprValidator } from "mwater-expressions"
import AxisBuilder from "../axes/AxisBuilder"
import { OnGridClickResults } from "./maps"
import { JsonQLFilter } from "../index"
import { JsonQLExpr, JsonQLQuery, JsonQLScalar, JsonQLSelect, JsonQLSelectQuery } from "jsonql"
import { MarkersLayerDesign } from "./MarkersLayerDesign"
import { compileColorMapToMapbox } from "./mapboxUtils"
import LayerLegendComponent from "./LayerLegendComponent"
import * as PopupFilterJoinsUtils from "./PopupFilterJoinsUtils"

export default class MarkersLayer extends Layer<MarkersLayerDesign> {
  /** Gets the type of layer definition */
  getLayerDefinitionType(): "VectorTile" {
    return "VectorTile"
  }

  getVectorTile(
    design: MarkersLayerDesign,
    sourceId: string,
    schema: Schema,
    filters: JsonQLFilter[],
    opacity: number
  ): VectorTileDef {
    const jsonql = this.createJsonQL(design, schema, filters)

    const mapLayers: mapboxgl.AnyLayer[] = []

    // If color axes, add color conditions
    const color = compileColorMapToMapbox(design.axes.color, design.color || "#666666")

    // Add polygons
    mapLayers.push({
      id: `${sourceId}:polygons`,
      type: "fill",
      source: sourceId,
      "source-layer": "main",
      paint: {
        "fill-color": color,
        "fill-opacity": 0.25 * opacity
      },
      filter: [
        "any",
        ["==", ["get", "geometry_type"], "ST_Polygon"],
        ["==", ["get", "geometry_type"], "ST_MultiPolygon"]
      ]
    })

    // Add polygon outlines and lines
    mapLayers.push({
      id: `${sourceId}:polygon-outlines`,
      type: "line",
      source: sourceId,
      "source-layer": "main",
      paint: {
        "line-color": color,
        "line-width": design.lineWidth != null ? design.lineWidth : 3,
        "line-opacity": opacity
      },
      filter: [
        "any",
        ["==", ["get", "geometry_type"], "ST_Polygon"],
        ["==", ["get", "geometry_type"], "ST_MultiPolygon"]
      ]
    })

    // Add lines
    mapLayers.push({
      id: `${sourceId}:lines`,
      type: "line",
      source: sourceId,
      "source-layer": "main",
      paint: {
        "line-color": color,
        "line-width": design.lineWidth != null ? design.lineWidth : 3,
        "line-opacity": opacity
      },
      filter: ["any", ["==", ["get", "geometry_type"], "ST_Linestring"]]
    })

    // Add markers
    if (!design.symbol) {
      mapLayers.push({
        id: `${sourceId}:points`,
        type: "circle",
        source: sourceId,
        "source-layer": "main",
        paint: {
          "circle-color": color,
          "circle-opacity": 0.8 * opacity,
          "circle-stroke-color": "white",
          "circle-stroke-width": 1,
          "circle-stroke-opacity": 0.5 * opacity,
          "circle-radius": (design.markerSize || 10) / 2
        },
        filter: ["==", ["get", "geometry_type"], "ST_Point"]
      })
    } else {
      mapLayers.push({
        id: `${sourceId}:points`,
        type: "symbol",
        source: sourceId,
        "source-layer": "main",
        layout: {
          "icon-image": design.symbol,
          "icon-allow-overlap": true,
          "icon-size": (design.markerSize || 10) / 14 // For some reason, scales down from 20 to 14. No idea why
        },
        paint: {
          "icon-color": color,
          "icon-opacity": opacity
        },
        filter: ["==", ["get", "geometry_type"], "ST_Point"]
      })
    }

    return {
      sourceLayers: [{ id: "main", jsonql }],
      ctes: [],
      minZoom: design.minZoom,
      maxZoom: design.maxZoom,
      mapLayers: mapLayers,
      mapLayersHandleClicks: [
        `${sourceId}:polygons`,
        `${sourceId}:polygon-outlines`,
        `${sourceId}:lines`,
        `${sourceId}:points`
      ]
    }
  }

  createJsonQL(design: MarkersLayerDesign, schema: Schema, filters: JsonQLFilter[]) {
    const axisBuilder = new AxisBuilder({ schema })
    const exprCompiler = new ExprCompiler(schema)

    // Expression of scale and envelope from tile table
    const scaleExpr: JsonQLScalar = {
      type: "scalar",
      expr: { type: "field", tableAlias: "tile", column: "scale" },
      from: { type: "table", table: "tile", alias: "tile" }
    }
    const envelopeExpr: JsonQLScalar = {
      type: "scalar",
      expr: { type: "field", tableAlias: "tile", column: "envelope" },
      from: { type: "table", table: "tile", alias: "tile" }
    }

    // Compile geometry axis
    let geometryExpr = axisBuilder.compileAxis({ axis: design.axes.geometry, tableAlias: "innerquery" })

    // row_number() over (partition by st_snaptogrid(location, tile.scale / 150, tile.scale / 150)) AS r
    const cluster: JsonQLSelect = {
      type: "select",
      expr: {
        type: "op",
        op: "row_number",
        exprs: [],
        over: {
          partitionBy: [
            {
              type: "op",
              op: "round",
              exprs: [
                {
                  type: "op",
                  op: "/",
                  exprs: [
                    { type: "op", op: "ST_XMin", exprs: [geometryExpr] },
                    { type: "op", op: "/", exprs: [scaleExpr, 150] }
                  ]
                }
              ]
            },
            {
              type: "op",
              op: "round",
              exprs: [
                {
                  type: "op",
                  op: "/",
                  exprs: [
                    { type: "op", op: "ST_YMin", exprs: [geometryExpr] },
                    { type: "op", op: "/", exprs: [scaleExpr, 150] }
                  ]
                }
              ]
            }
          ]
        }
      },
      alias: "r"
    }

    // Select _id, location and clustered row number
    const innerquery: JsonQLSelectQuery = {
      type: "query",
      selects: [
        {
          type: "select",
          expr: { type: "field", tableAlias: "innerquery", column: schema.getTable(design.table)!.primaryKey },
          alias: "id"
        }, // main primary key as id
        { type: "select", expr: geometryExpr, alias: "the_geom_webmercator" }, // geometry as the_geom_webmercator
        cluster
      ],
      from: exprCompiler.compileTable(design.table, "innerquery")
    }

    // Add color select if color axis
    if (design.axes.color) {
      const colorExpr = axisBuilder.compileAxis({ axis: design.axes.color, tableAlias: "innerquery" })
      innerquery.selects.push({ type: "select", expr: colorExpr, alias: "color" })
    }

    // Create filters. First limit to envelope
    let whereClauses: JsonQLExpr[] = [
      {
        type: "op",
        op: "&&",
        exprs: [geometryExpr, envelopeExpr]
      }
    ]

    // Then add filters baked into layer
    if (design.filter) {
      whereClauses.push(exprCompiler.compileExpr({ expr: design.filter, tableAlias: "innerquery" }))
    }

    // Then add extra filters passed in, if relevant
    // Get relevant filters
    const relevantFilters = _.where(filters, { table: design.table })
    for (let filter of relevantFilters) {
      whereClauses.push(injectTableAlias(filter.jsonql, "innerquery"))
    }

    whereClauses = _.compact(whereClauses)

    // Wrap if multiple
    if (whereClauses.length > 1) {
      innerquery.where = { type: "op", op: "and", exprs: whereClauses }
    } else {
      innerquery.where = whereClauses[0]
    }

    // Create outer query which takes where r <= 3 to limit # of points in a cluster
    const outerquery: JsonQLQuery = {
      type: "query",
      selects: [
        {
          type: "select",
          expr: { type: "field", tableAlias: "innerquery", column: "id" },
          alias: "id"
        }, // innerquery._id as id
        {
          type: "select",
          expr: {
            type: "op",
            op: "ST_AsMVTGeom",
            exprs: [{ type: "field", tableAlias: "innerquery", column: "the_geom_webmercator" }, envelopeExpr]
          },
          alias: "the_geom_webmercator"
        }, // innerquery.the_geom_webmercator as the_geom_webmercator
        {
          type: "select",
          expr: {
            type: "op",
            op: "ST_GeometryType",
            exprs: [{ type: "field", tableAlias: "innerquery", column: "the_geom_webmercator" }]
          },
          alias: "geometry_type"
        } // ST_GeometryType(innerquery.the_geom_webmercator) as geometry_type
      ],
      from: { type: "subquery", query: innerquery, alias: "innerquery" },
      where: { type: "op", op: "<=", exprs: [{ type: "field", tableAlias: "innerquery", column: "r" }, 3] }
    }

    // Add color select if color axis
    if (design.axes.color) {
      outerquery.selects.push({
        type: "select",
        expr: { type: "field", tableAlias: "innerquery", column: "color" },
        alias: "color"
      }) // innerquery.color as color
    }

    return outerquery
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
  getJsonQLCss(design: MarkersLayerDesign, schema: Schema, filters: JsonQLFilter[]) {
    // Create design
    const layerDef = {
      layers: [
        {
          id: "layer0",
          jsonql: this.createMapnikJsonQL(design, schema, filters)
        }
      ],
      css: this.createCss(design),
      interactivity: {
        layer: "layer0",
        fields: ["id"]
      }
    }

    return layerDef
  }

  createMapnikJsonQL(design: MarkersLayerDesign, schema: Schema, filters: JsonQLFilter[]): JsonQLQuery {
    const axisBuilder = new AxisBuilder({ schema })
    const exprCompiler = new ExprCompiler(schema)

    // Compile geometry axis
    let geometryExpr = axisBuilder.compileAxis({ axis: design.axes.geometry, tableAlias: "innerquery" })

    // row_number() over (partition by round(ST_XMin(location)/!pixel_width!*5), round(ST_YMin(location)/!pixel_height!*5)) AS r
    const cluster: JsonQLSelect = {
      type: "select",
      expr: {
        type: "op",
        op: "row_number",
        exprs: [],
        over: {
          partitionBy: [
            {
              type: "op",
              op: "round",
              exprs: [
                {
                  type: "op",
                  op: "/",
                  exprs: [
                    { type: "op", op: "ST_XMin", exprs: [geometryExpr] },
                    { type: "op", op: "*", exprs: [{ type: "token", token: "!pixel_width!" }, 5] }
                  ]
                }
              ]
            },
            {
              type: "op",
              op: "round",
              exprs: [
                {
                  type: "op",
                  op: "/",
                  exprs: [
                    { type: "op", op: "ST_YMin", exprs: [geometryExpr] },
                    { type: "op", op: "*", exprs: [{ type: "token", token: "!pixel_height!" }, 5] }
                  ]
                }
              ]
            }
          ]
        }
      },
      alias: "r"
    }

    // Select _id, location and clustered row number
    const innerquery: JsonQLSelectQuery = {
      type: "query",
      selects: [
        {
          type: "select",
          expr: { type: "field", tableAlias: "innerquery", column: schema.getTable(design.table)!.primaryKey },
          alias: "id"
        }, // main primary key as id
        { type: "select", expr: geometryExpr, alias: "the_geom_webmercator" }, // geometry as the_geom_webmercator
        cluster
      ],
      from: exprCompiler.compileTable(design.table, "innerquery")
    }

    // Add color select if color axis
    if (design.axes.color) {
      const colorExpr = axisBuilder.compileAxis({ axis: design.axes.color, tableAlias: "innerquery" })
      innerquery.selects.push({ type: "select", expr: colorExpr, alias: "color" })
    }

    // Create filters. First limit to bounding box
    let whereClauses: JsonQLExpr[] = [
      {
        type: "op",
        op: "&&",
        exprs: [geometryExpr, { type: "token", token: "!bbox!" }]
      }
    ]

    // Then add filters baked into layer
    if (design.filter) {
      whereClauses.push(exprCompiler.compileExpr({ expr: design.filter, tableAlias: "innerquery" }))
    }

    // Then add extra filters passed in, if relevant
    // Get relevant filters
    const relevantFilters = _.where(filters, { table: design.table })
    for (let filter of relevantFilters) {
      whereClauses.push(injectTableAlias(filter.jsonql, "innerquery"))
    }

    whereClauses = _.compact(whereClauses)

    // Wrap if multiple
    if (whereClauses.length > 1) {
      innerquery.where = { type: "op", op: "and", exprs: whereClauses }
    } else {
      innerquery.where = whereClauses[0]
    }

    // Create outer query which takes where r <= 3 to limit # of points in a cluster
    const outerquery: JsonQLQuery = {
      type: "query",
      selects: [
        {
          type: "select",
          expr: { type: "field", tableAlias: "innerquery", column: "id" },
          alias: "id"
        }, // innerquery._id as id
        {
          type: "select",
          expr: { type: "field", tableAlias: "innerquery", column: "the_geom_webmercator" },
          alias: "the_geom_webmercator"
        }, // innerquery.the_geom_webmercator as the_geom_webmercator
        {
          type: "select",
          expr: {
            type: "op",
            op: "ST_GeometryType",
            exprs: [{ type: "field", tableAlias: "innerquery", column: "the_geom_webmercator" }]
          },
          alias: "geometry_type"
        } // ST_GeometryType(innerquery.the_geom_webmercator) as geometry_type
      ],
      from: { type: "subquery", query: innerquery, alias: "innerquery" },
      where: { type: "op", op: "<=", exprs: [{ type: "field", tableAlias: "innerquery", column: "r" }, 3] }
    }

    // Add color select if color axis
    if (design.axes.color) {
      outerquery.selects.push({
        type: "select",
        expr: { type: "field", tableAlias: "innerquery", column: "color" },
        alias: "color"
      }) // innerquery.color as color
    }

    return outerquery
  }

  // Creates CartoCSS
  createCss(design: MarkersLayerDesign) {
    let stroke, symbol
    let css = ""

    if (design.symbol) {
      symbol = `marker-file: url(${design.symbol});`
      stroke = "marker-line-width: 60;"
    } else {
      symbol = "marker-type: ellipse;"
      stroke = "marker-line-width: 1;"
    }

    // Should only display markers when it is a point geometry
    css +=
      `\
#layer0[geometry_type='ST_Point'] {
  marker-fill: ` +
      (design.color || "#666666") +
      `;
marker-width: ` +
      (design.markerSize || 10) +
      `;
marker-line-color: white;\
` +
      stroke +
      `\
marker-line-opacity: 0.6;
marker-placement: point;\
` +
      symbol +
      `\
  marker-allow-overlap: true;
}
#layer0 {
  line-color: ` +
      (design.color || "#666666") +
      `;
line-width: ` +
      (design.lineWidth != null ? design.lineWidth : "3") +
      `;
}
#layer0[geometry_type='ST_Polygon'],#layer0[geometry_type='ST_MultiPolygon'] {
  polygon-fill: ` +
      (design.color || "#666666") +
      `;
  polygon-opacity: 0.25;
}
\
`

    // If color axes, add color conditions
    if (design.axes.color && design.axes.color.colorMap) {
      for (let item of design.axes.color.colorMap) {
        // If invisible
        if (_.includes(design.axes.color.excludedValues || [], item.value)) {
          css +=
            `\
#layer0[color=` +
            JSON.stringify(item.value) +
            `] { line-opacity: 0; marker-line-opacity: 0; marker-fill-opacity: 0; polygon-opacity: 0; }\
`
        } else {
          css +=
            `\
#layer0[color=` +
            JSON.stringify(item.value) +
            "] { line-color: " +
            item.color +
            ` }
#layer0[color=` +
            JSON.stringify(item.value) +
            "][geometry_type='ST_Point'] { marker-fill: " +
            item.color +
            ` }
#layer0[color=` +
            JSON.stringify(item.value) +
            "][geometry_type='ST_Polygon'],#layer0[color=" +
            JSON.stringify(item.value) +
            `][geometry_type='ST_MultiPolygon'] { 
polygon-fill: ` +
            item.color +
            `;\
}\
`
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
  onGridClick(ev: { data: any; event: any }, clickOptions: OnGridClickOptions<MarkersLayerDesign>): OnGridClickResults {
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

        // Scope to item
        if (ids.length > 0) {
          results.scope = {
            name: `Selected ${ids.length} Markers(s)`,
            filter,
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
  getBounds(
    design: MarkersLayerDesign,
    schema: Schema,
    dataSource: DataSource,
    filters: JsonQLFilter[],
    callback: any
  ) {
    return this.getBoundsFromExpr(
      schema,
      dataSource,
      design.table,
      design.axes.geometry.expr,
      design.filter || null,
      filters,
      callback
    )
  }

  // Get min and max zoom levels
  getMinZoom(design: MarkersLayerDesign) {
    return design.minZoom
  }
  getMaxZoom(design: MarkersLayerDesign) {
    return design.maxZoom || 21
  }

  // Get the legend to be optionally displayed on the map. Returns
  // a React element
  getLegend(
    design: MarkersLayerDesign,
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
      defaultColor: design.color,
      symbol: design.symbol || "font-awesome/circle",
      markerSize: design.markerSize,
      name,
      dataSource,
      filters: _.compact(_filters),
      axis: axisBuilder.cleanAxis({
        axis: design.axes.color || null,
        table: design.table,
        types: ["enum", "text", "boolean", "date"],
        aggrNeed: "none"
      }),
      locale
    })
  }

  // Get a list of table ids that can be filtered on
  getFilterableTables(design: MarkersLayerDesign, schema: Schema): string[] {
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

  // Creates a design element with specified options
  // options:
  //   design: design of layer
  //   schema: schema to use
  //   dataSource: data source to use
  //   onDesignChange: function called when design changes
  //   filters: array of filters
  createDesignerElement(options: {
    design: MarkersLayerDesign
    schema: Schema
    dataSource: DataSource
    onDesignChange: (design: MarkersLayerDesign) => void
    filters: JsonQLFilter[]
  }): React.ReactElement<{}> {
    // Require here to prevent server require problems
    const MarkersLayerDesignerComponent = require("./MarkersLayerDesignerComponent").default

    // Clean on way in and out
    return React.createElement(MarkersLayerDesignerComponent, {
      schema: options.schema,
      dataSource: options.dataSource,
      design: this.cleanDesign(options.design, options.schema),
      filters: options.filters,
      onDesignChange: (design: MarkersLayerDesign) => {
        return options.onDesignChange(this.cleanDesign(design, options.schema))
      }
    })
  }

  // Returns a cleaned design
  cleanDesign(design: MarkersLayerDesign, schema: Schema): MarkersLayerDesign {
    const exprCleaner = new ExprCleaner(schema)
    const axisBuilder = new AxisBuilder({ schema })

    // Migrate legacy sublayers
    if (design.sublayers) {
      design = _.extend({}, design, design.sublayers[0])
      delete design.sublayers
    }

    design = produce(design, (draft) => {
      draft.axes = design.axes || {}
      draft.color = design.color || "#0088FF"

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

      draft.filter = exprCleaner.cleanExpr(design.filter || null, { table: draft.table })
    })

    return design
  }

  // Validates design. Null if ok, message otherwise
  validateDesign(design: MarkersLayerDesign, schema: Schema) {
    const axisBuilder = new AxisBuilder({ schema })
    const exprValidator = new ExprValidator(schema)

    if (!design.table) {
      return "Missing table"
    }

    if (!design.axes || !design.axes.geometry) {
      return "Missing axes"
    }

    let error = axisBuilder.validateAxis({ axis: design.axes.geometry })
    if (error) {
      return error
    }

    // Validate color
    error = axisBuilder.validateAxis({ axis: design.axes.color || null })
    if (error) {
      return error
    }

    // Check that doesn't compile to null (persistent bug that haven't been able to track down)
    if (!axisBuilder.compileAxis({ axis: design.axes.geometry, tableAlias: "innerquery" })) {
      return "Null geometry axis"
    }

    // Validate filter
    error = exprValidator.validateExpr(design.filter || null)
    if (error) {
      return error
    }

    return null
  }

  createKMLExportJsonQL(design: MarkersLayerDesign, schema: Schema, filters: JsonQLFilter[]) {
    const axisBuilder = new AxisBuilder({ schema })
    const exprCompiler = new ExprCompiler(schema)

    // Compile geometry axis
    let geometryExpr = axisBuilder.compileAxis({ axis: design.axes.geometry, tableAlias: "innerquery" })

    // Select _id, location and clustered row number
    const innerquery: JsonQLSelectQuery = {
      type: "query",
      selects: [
        {
          type: "select",
          expr: { type: "field", tableAlias: "innerquery", column: schema.getTable(design.table)!.primaryKey },
          alias: "id"
        }, // main primary key as id
        { type: "select", expr: { type: "op", op: "ST_XMIN", exprs: [geometryExpr] }, alias: "longitude" }, // innerquery.the_geom_webmercator as the_geom_webmercator
        { type: "select", expr: { type: "op", op: "ST_YMIN", exprs: [geometryExpr] }, alias: "latitude" } // innerquery.the_geom_webmercator as the_geom_webmercator
      ],
      from: exprCompiler.compileTable(design.table, "innerquery")
    }

    const extraFields = ["code", "name", "desc", "type", "photos"]

    for (let field of extraFields) {
      const column = schema.getColumn(design.table, field)

      if (column) {
        innerquery.selects.push({
          type: "select",
          expr: { type: "field", tableAlias: "innerquery", column: field },
          alias: field
        })
      }
    }

    // Add color select if color axis
    if (design.axes.color) {
      const colorExpr = axisBuilder.compileAxis({ axis: design.axes.color, tableAlias: "innerquery" })
      const valueExpr = exprCompiler.compileExpr({ expr: design.axes.color.expr, tableAlias: "innerquery" })
      innerquery.selects.push({ type: "select", expr: colorExpr, alias: "color" })
      innerquery.selects.push({ type: "select", expr: valueExpr, alias: "value" })
    }

    // Create filters. First limit to bounding box
    let whereClauses = []

    // Then add filters baked into layer
    if (design.filter) {
      whereClauses.push(exprCompiler.compileExpr({ expr: design.filter, tableAlias: "innerquery" }))
    }

    // Then add extra filters passed in, if relevant
    // Get relevant filters
    const relevantFilters = _.where(filters, { table: design.table })
    for (let filter of relevantFilters) {
      whereClauses.push(injectTableAlias(filter.jsonql, "innerquery"))
    }

    whereClauses = _.compact(whereClauses)

    // Wrap if multiple
    if (whereClauses.length > 1) {
      innerquery.where = { type: "op", op: "and", exprs: whereClauses }
    } else {
      innerquery.where = whereClauses[0]
    }

    return innerquery
  }

  createKMLExportStyleInfo(design: MarkersLayerDesign, schema: Schema, filters: JsonQLFilter[]) {
    let symbol
    if (design.symbol) {
      ;({ symbol } = design)
    } else {
      symbol = "font-awesome/circle"
    }

    const style: any = {
      color: design.color,
      symbol
    }

    if (design.axes.color && design.axes.color.colorMap) {
      style.colorMap = design.axes.color.colorMap
    }

    return style
  }

  getKMLExportJsonQL(design: MarkersLayerDesign, schema: Schema, filters: JsonQLFilter[]) {
    const layerDef = {
      layers: [
        {
          id: "layer0",
          jsonql: this.createKMLExportJsonQL(design, schema, filters),
          style: this.createKMLExportStyleInfo(design, schema, filters)
        }
      ]
    }

    return layerDef
  }

  acceptKmlVisitorForRow(visitor: any, row: any) {
    return visitor.addPoint(row.latitude, row.longitude, row.name, visitor.buildDescription(row), row.color)
  }
}
