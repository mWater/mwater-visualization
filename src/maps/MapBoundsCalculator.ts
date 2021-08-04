import _ from "lodash"
import async from "async"
import LayerFactory from "./LayerFactory"
import * as MapUtils from "./MapUtils"

// Calculates map bounds given layers by unioning together
export default class MapBoundsCalculator {
  constructor(schema: any, dataSource: any) {
    this.schema = schema
    this.dataSource = dataSource
  }

  // Gets the bounds for the map. Null for whole world. Callback as { n:, s:, w:, e: }
  getBounds(design: any, filters: any, callback: any) {
    const allBounds: any = []

    // For each layer
    return async.each(
      design.layerViews,
      (layerView, cb) => {
        if (!layerView.visible) {
          return cb(null)
        }

        // Create layer
        const layer = LayerFactory.createLayer(layerView.type)

        // Ensure that valid
        const layerDesign = layer.cleanDesign(layerView.design, this.schema)
        if (layer.validateDesign(layerDesign, this.schema)) {
          return cb(null)
        }

        // Compile map filters
        const allFilters = (filters || []).concat(
          MapUtils.getCompiledFilters(design, this.schema, MapUtils.getFilterableTables(design, this.schema))
        )

        // Get bounds, including filters from map
        return layer.getBounds(layerDesign, this.schema, this.dataSource, allFilters, (error: any, bounds: any) => {
          if (error) {
            return cb(error)
          }

          if (bounds) {
            allBounds.push(bounds)
          }
          return cb(null)
        })
      },
      (error) => {
        if (error) {
          return callback(error)
        }

        // Union bounds
        if (allBounds.length === 0) {
          return callback(null)
        }

        return callback(null, {
          n: _.max(allBounds, "n").n,
          e: _.max(allBounds, "e").e,
          s: _.min(allBounds, "s").s,
          w: _.min(allBounds, "w").w
        })
      }
    )
  }
}