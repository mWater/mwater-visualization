var MWaterMapUrlSource, _, querystring;

_ = require('lodash');

querystring = require('querystring');

module.exports = MWaterMapUrlSource = (function() {
  function MWaterMapUrlSource(options) {
    this.apiUrl = options.apiUrl;
    this.client = options.client;
    this.share = options.share;
    this.mapId = options.mapId;
  }

  MWaterMapUrlSource.prototype.getTileUrl = function(layerId, filters) {
    return this.createUrl(layerId, filters, "png");
  };

  MWaterMapUrlSource.prototype.getUtfGridUrl = function(layerId, filters) {
    return this.createUrl(layerId, filters, "grid.json");
  };

  MWaterMapUrlSource.prototype.createUrl = function(layerId, filters, extension) {
    var query, url;
    query = {
      type: "maps",
      client: this.client,
      share: this.share,
      map: this.mapId,
      layer: layerId,
      filters: JSON.stringify(filters || [])
    };
    url = (this.apiUrl + "maps/tiles/{z}/{x}/{y}." + extension + "?") + querystring.stringify(query);
    if (url.match(/^https:\/\/api\.mwater\.co\//)) {
      url = url.replace(/^https:\/\/api\.mwater\.co\//, "https://{s}-api.mwater.co/");
    }
    return url;
  };

  return MWaterMapUrlSource;

})();
