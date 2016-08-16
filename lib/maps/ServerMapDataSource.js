var LayerFactory, MapDataSource, ServerMapDataSource, _, injectTableAlias, querystring,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

querystring = require('querystring');

MapDataSource = require('./MapDataSource');

LayerFactory = require('./LayerFactory');

injectTableAlias = require('mwater-expressions').injectTableAlias;

module.exports = ServerMapDataSource = (function(superClass) {
  extend(ServerMapDataSource, superClass);

  function ServerMapDataSource(options) {
    this.apiUrl = options.apiUrl;
    this.client = options.client;
    this.mapDesign = options.mapDesign;
    this.schema = options.schema;
    this.share = options.share;
    this.mapId = options.mapId;
  }

  ServerMapDataSource.prototype.getTileUrl = function(layerId, filters) {
    var design, layer, layerView;
    layerView = _.findWhere(this.mapDesign.layerViews, {
      id: layerId
    });
    if (!layerView) {
      return null;
    }
    layer = LayerFactory.createLayer(layerView.type);
    design = layer.cleanDesign(layerView.design, this.schema);
    if (layer.validateDesign(design, this.schema)) {
      return null;
    }
    if (layerView.type === "MWaterServer") {
      return this.createLegacyUrl(design, "png", filters);
    }
    if (layerView.type === "TileUrl") {
      return design.tileUrl;
    }
    return this.createUrl(layerId, filters, "png");
  };

  ServerMapDataSource.prototype.getUtfGridUrl = function(layerId, filters) {
    var design, layer, layerView;
    layerView = _.findWhere(this.mapDesign.layerViews, {
      id: layerId
    });
    if (!layerView) {
      return null;
    }
    layer = LayerFactory.createLayer(layerView.type);
    design = layer.cleanDesign(layerView.design, this.schema);
    if (layer.validateDesign(design, this.schema)) {
      return null;
    }
    if (layerView.type === "MWaterServer") {
      return this.createLegacyUrl(design, "grid.json", filters);
    }
    if (layerView.type === "TileUrl") {
      return null;
    }
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

  ServerMapDataSource.prototype.createLegacyUrl = function(design, extension, filters) {
    var relevantFilters, url, where, whereClauses;
    url = this.apiUrl + "maps/tiles/{z}/{x}/{y}." + extension + "?type=" + design.type + "&radius=1000";
    if (url.match(/^https:\/\/api\.mwater\.co\//)) {
      url = url.replace(/^https:\/\/api\.mwater\.co\//, "https://{s}-api.mwater.co/");
    }
    if (this.client) {
      url += "&client=" + this.client;
    }
    if (this.share) {
      url += "&share=" + this.share;
    }
    relevantFilters = _.where(filters, {
      table: design.table
    });
    whereClauses = _.map(relevantFilters, (function(_this) {
      return function(f) {
        return injectTableAlias(f.jsonql, "main");
      };
    })(this));
    if (whereClauses.length > 1) {
      where = {
        type: "op",
        op: "and",
        exprs: whereClauses
      };
    } else {
      where = whereClauses[0];
    }
    if (where) {
      url += "&where=" + encodeURIComponent(JSON.stringify(where));
    }
    return url;
  };

  return ServerMapDataSource;

})(MapDataSource);
