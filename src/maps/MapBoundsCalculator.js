// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let MapBoundsCalculator;
import _ from 'lodash';
import async from 'async';
import LayerFactory from './LayerFactory';
import MapUtils from './MapUtils';

// Calculates map bounds given layers by unioning together
export default MapBoundsCalculator = class MapBoundsCalculator {
  constructor(schema, dataSource) {
    this.schema = schema;
    this.dataSource = dataSource;
  }

  // Gets the bounds for the map. Null for whole world. Callback as { n:, s:, w:, e: }
  getBounds(design, filters, callback) {
    const allBounds = [];

    // For each layer
    return async.each(design.layerViews, (layerView, cb) => {
      if (!layerView.visible) {
        return cb(null);
      }
        
      // Create layer
      const layer = LayerFactory.createLayer(layerView.type);
      
      // Ensure that valid
      const layerDesign = layer.cleanDesign(layerView.design, this.schema);
      if (layer.validateDesign(layerDesign, this.schema)) {
        return cb(null);
      }

      // Compile map filters
      const allFilters = (filters || []).concat(MapUtils.getCompiledFilters(design, this.schema, MapUtils.getFilterableTables(design, this.schema)));

      // Get bounds, including filters from map  
      return layer.getBounds(layerDesign, this.schema, this.dataSource, allFilters, (error, bounds) => {
        if (error) {
          return cb(error);
        }

        if (bounds) {
          allBounds.push(bounds);
        }
        return cb(null);
        });
    }
    , error => {
      if (error) {
        return callback(error);
      }

      // Union bounds
      if (allBounds.length === 0) {
        return callback(null);
      }

      return callback(null, {
        n: _.max(allBounds, "n").n,
        e: _.max(allBounds, "e").e,
        s: _.min(allBounds, "s").s,
        w: _.min(allBounds, "w").w
        });
    });
  }
};
