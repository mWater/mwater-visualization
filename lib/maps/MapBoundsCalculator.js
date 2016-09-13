var LayerFactory, MapBoundsCalculator, async;

async = require('async');

LayerFactory = require('./LayerFactory');

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
        var layer;
        if (!layerView.visible) {
          return cb(null);
        }
        layer = LayerFactory.createLayer(layerView.type);
        return layer.getBounds(layerView.design, _this.schema, _this.dataSource, _.union(filters, design.filters), function(error, bounds) {
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
