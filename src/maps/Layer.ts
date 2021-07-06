import _ from "lodash"
import AxisBuilder from "../axes/AxisBuilder"
import { ExprCompiler } from "mwater-expressions"
import { injectTableAlias } from "mwater-expressions"
import { default as bbox } from "@turf/bbox"

// Defines a layer for a map which has all the logic for rendering the specific data to be viewed
export default class Layer {
  // Gets the type of layer definition ("JsonQLCss"/"TileUrl"/"VectorTile")
  getLayerDefinitionType() {
    return "JsonQLCss"
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
  getJsonQLCss(design: any, schema: any, filters: any) {
    throw new Error("Not implemented")
  }

  // Gets the tile url for definition type "TileUrl"
  getTileUrl(design: any, filters: any) {
    throw new Error("Not implemented")
  }

  // Gets the utf grid url for definition type "TileUrl"
  getUtfGridUrl(design: any, filters: any) {
    throw new Error("Not implemented")
  }

  // Gets the layer definition for "VectorTile" type
  getVectorTile(design: any, filters: any) {
    throw new Error("Not implemented")
  }

  // Called when the interactivity grid is clicked.
  // arguments:
  //   ev: { data: interactivty data e.g. `{ id: 123 }` }
  //   options:
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
  onGridClick(ev: any, options: any) {
    return null
  }

  // Gets the bounds of the layer as GeoJSON
  getBounds(design: any, schema: any, dataSource: any, filters: any, callback: any) {
    return callback(null)
  }

  // Get min and max zoom levels
  getMinZoom(design: any) {
    return null
  }
  getMaxZoom(design: any) {
    return null
  }

  // Get the legend to be optionally displayed on the map. Returns
  // a React element
  getLegend(design: any, schema: any, name: any, dataSource: any, locale: any, filters = []) {
    return null
  }

  // Get a list of table ids that can be filtered on
  getFilterableTables(design: any, schema: any) {
    return []
  }

  // True if layer can be edited
  isEditable() {
    return false
  }

  // True if layer is incomplete (e.g. brand new) and should be editable immediately
  isIncomplete(design: any, schema: any) {
    return this.validateDesign(this.cleanDesign(design, schema), schema) != null
  }

  // Creates a design element with specified options.
  // Design should be cleaned on the way in and on way out.
  // options:
  //   design: design of layer
  //   schema: schema to use
  //   dataSource: data source to use
  //   onDesignChange: function called when design changes
  createDesignerElement(options: any) {
    throw new Error("Not implemented")
  }

  // Returns a cleaned design
  cleanDesign(design: any, schema: any) {
    return design
  }

  // Validates design. Null if ok, message otherwise
  validateDesign(design: any, schema: any) {
    return null
  }

  // arguments:
  //   design: design of layer
  //   schema: schema to use
  //   filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to put in table alias
  getKMLExportJsonQL(design: any, schema: any, filters: any) {
    throw new Error("Not implemented")
  }

  // Convenience function to get the bounds of a geometry expression with filters
  getBoundsFromExpr(
    schema: any,
    dataSource: any,
    table: any,
    geometryExpr: any,
    filterExpr: any,
    filters: any,
    callback: any
  ) {
    const exprCompiler = new ExprCompiler(schema)
    const compiledGeometryExpr = exprCompiler.compileExpr({ expr: geometryExpr, tableAlias: "main" })

    // Create where clause from filters
    let where = {
      type: "op",
      op: "and",
      exprs: _.pluck(_.where(filters, { table }), "jsonql")
    }

    if (filterExpr) {
      where.exprs.push(exprCompiler.compileExpr({ expr: filterExpr, tableAlias: "main" }))
    }

    // Compact and inject alias
    where.exprs = _.compact(where.exprs)
    where = injectTableAlias(where, "main")

    // Get bounds
    const boundsQuery = {
      type: "query",
      selects: [
        {
          type: "select",
          expr: {
            type: "op",
            op: "::json",
            exprs: [
              {
                type: "op",
                op: "ST_AsGeoJSON",
                exprs: [
                  {
                    type: "op",
                    op: "ST_Transform",
                    exprs: [
                      {
                        type: "op",
                        op: "ST_SetSRID",
                        exprs: [{ type: "op", op: "ST_Extent", exprs: [compiledGeometryExpr] }, 3857]
                      },
                      4326
                    ]
                  }
                ]
              }
            ]
          },
          alias: "bounds"
        }
      ],
      from: { type: "table", table, alias: "main" },
      where
    }

    return dataSource.performQuery(boundsQuery, (err: any, results: any) => {
      if (err) {
        return callback(err)
      } else {
        // Null if no bounds can be calculated
        let bounds = null

        if (results[0].bounds) {
          const [w, s, e, n] = bbox(results[0].bounds)
          // Pad to 10km if point
          if (w === e && n === s) {
            bounds = {
              w: w - 0.1,
              s: s - 0.1,
              e: e + 0.1,
              n: n + 0.1
            }
            // Pad bounds to prevent too small box (10m)
          } else {
            bounds = {
              w: w - 0.001,
              s: s - 0.001,
              e: e + 0.001,
              n: n + 0.001
            }
          }
        }

        return callback(null, bounds)
      }
    })
  }
}
