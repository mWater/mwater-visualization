var _;

_ = require('lodash');

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
