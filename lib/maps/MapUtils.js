var LayerFactory, _;

_ = require('lodash');

LayerFactory = require('./LayerFactory');

exports.canConvertToClusterMap = function(design) {
  return _.any(design.layerViews, function(lv) {
    return lv.type === "Markers";
  });
};

exports.convertToClusterMap = function(design) {
  var layerViews;
  layerViews = _.map(design.layerViews, (function(_this) {
    return function(lv) {
      var ref;
      if (lv.type !== "Markers") {
        return lv;
      }
      lv = _.cloneDeep(lv);
      lv.type = "Cluster";
      lv.design = {
        table: lv.design.table,
        axes: {
          geometry: (ref = lv.design.axes) != null ? ref.geometry : void 0
        },
        filter: lv.design.filter,
        fillColor: lv.design.color,
        minZoom: lv.design.minZoom,
        maxZoom: lv.design.maxZoom
      };
      return lv;
    };
  })(this));
  return _.extend({}, design, {
    layerViews: layerViews
  });
};

exports.getFilterableTables = function(design, schema) {
  var filterableTables, i, layer, layerView, len, ref;
  filterableTables = [];
  ref = design.layerViews;
  for (i = 0, len = ref.length; i < len; i++) {
    layerView = ref[i];
    layer = LayerFactory.createLayer(layerView.type);
    filterableTables = _.uniq(filterableTables.concat(layer.getFilterableTables(layerView.design, schema)));
  }
  return filterableTables = _.filter(filterableTables, (function(_this) {
    return function(table) {
      return schema.getTable(table);
    };
  })(this));
};
