"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var LayerFactory, MapBoundsCalculator, MapUtils, _, async;

_ = require('lodash');
async = require('async');
LayerFactory = require('./LayerFactory');
MapUtils = require('./MapUtils'); // Calculates map bounds given layers by unioning together

module.exports = MapBoundsCalculator =
/*#__PURE__*/
function () {
  function MapBoundsCalculator(schema, dataSource) {
    (0, _classCallCheck2.default)(this, MapBoundsCalculator);
    this.schema = schema;
    this.dataSource = dataSource;
  } // Gets the bounds for the map. Null for whole world. Callback as { n:, s:, w:, e: }


  (0, _createClass2.default)(MapBoundsCalculator, [{
    key: "getBounds",
    value: function getBounds(design, filters, callback) {
      var _this = this;

      var allBounds;
      allBounds = []; // For each layer

      return async.each(design.layerViews, function (layerView, cb) {
        var allFilters, layer, layerDesign;

        if (!layerView.visible) {
          return cb(null);
        } // Create layer


        layer = LayerFactory.createLayer(layerView.type); // Ensure that valid

        layerDesign = layer.cleanDesign(layerView.design, _this.schema);

        if (layer.validateDesign(layerDesign, _this.schema)) {
          return cb(null);
        } // Compile map filters


        allFilters = (filters || []).concat(MapUtils.getCompiledFilters(design, _this.schema, MapUtils.getFilterableTables(design, _this.schema))); // Get bounds, including filters from map  

        return layer.getBounds(layerDesign, _this.schema, _this.dataSource, allFilters, function (error, bounds) {
          if (error) {
            return cb(error);
          }

          if (bounds) {
            allBounds.push(bounds);
          }

          return cb(null);
        });
      }, function (error) {
        if (error) {
          return callback(error);
        } // Union bounds


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
  }]);
  return MapBoundsCalculator;
}();