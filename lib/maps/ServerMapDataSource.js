var MapDataSource, ServerMapDataSource, _, querystring,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

querystring = require('querystring');

MapDataSource = require('./MapDataSource');

module.exports = ServerMapDataSource = (function(superClass) {
  extend(ServerMapDataSource, superClass);

  function ServerMapDataSource(options) {
    this.apiUrl = options.apiUrl;
    this.client = options.client;
    this.share = options.share;
    this.mapId = options.mapId;
  }

  ServerMapDataSource.prototype.getTileUrl = function(layerId, filters) {
    return this.createUrl(layerId, filters, "png");
  };

  ServerMapDataSource.prototype.getUtfGridUrl = function(layerId, filters) {
    return this.createUrl(layerId, filters, "grid.json");
  };

  ServerMapDataSource.prototype.createUrl = function(layerId, filters, extension) {
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

  return ServerMapDataSource;

})(MapDataSource);
