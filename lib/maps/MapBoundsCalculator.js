var LayerFactory, MapBoundsCalculator, MapUtils, _, async;

_ = require('lodash');

async = require('async');

LayerFactory = require('./LayerFactory');

MapUtils = require('./MapUtils');

module.exports = MapBoundsCalculator = (function() {
  function MapBoundsCalculator(schema, dataSource) {
    this.schema = schema;
    this.dataSource = dataSource;
  }

  MapBoundsCalculator.prototype.getBounds = function(design, filters, callback) {
    var allBounds;
    allBounds = [];
    return async.each(design.layerViews, (function(_this) {
      return function(layerView, cb) {
        var allFilters, layer, layerDesign;
        if (!layerView.visible) {
          return cb(null);
        }
        layer = LayerFactory.createLayer(layerView.type);
        layerDesign = layer.cleanDesign(layerView.design, _this.schema);
        if (layer.validateDesign(layerDesign, _this.schema)) {
          return cb(null);
        }
        allFilters = (filters || []).concat(MapUtils.getCompiledFilters(design, _this.schema, MapUtils.getFilterableTables(design, _this.schema)));
        return layer.getBounds(layerDesign, _this.schema, _this.dataSource, allFilters, function(error, bounds) {
          if (error) {
            return cb(error);
          }
          if (bounds) {
            allBounds.push(bounds);
          }
          return cb(null);
        });
      };
    })(this), (function(_this) {
      return function(error) {
        if (error) {
          return callback(error);
        }
        if (allBounds.length === 0) {
          return callback(null);
        }
        return callback(null, {
          n: _.max(allBounds, "n").n,
          e: _.max(allBounds, "e").e,
          s: _.min(allBounds, "s").s,
          w: _.min(allBounds, "w").w
        });
      };
    })(this));
  };

  return MapBoundsCalculator;

})();
