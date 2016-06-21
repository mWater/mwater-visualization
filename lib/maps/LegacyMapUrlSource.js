var LayerFactory, LegacyMapUrlSource, _;

_ = require('lodash');

LayerFactory = require('./LayerFactory');

module.exports = LegacyMapUrlSource = (function() {
  function LegacyMapUrlSource(options) {
    this.apiUrl = options.apiUrl;
    this.client = options.client;
    this.mapDesign = options.mapDesign;
    this.schema = options.schema;
  }

  LegacyMapUrlSource.prototype.getTileUrl = function(layerId, filters) {
    var design, jsonqlCss, layer, layerView;
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
    jsonqlCss = layer.getJsonQLCss(design, this.schema, filters);
    if (_.isString(jsonqlCss)) {
      return this.createLegacyUrl(design, "png", filters);
    }
    return this.createUrl("png", jsonqlCss, filters);
  };

  LegacyMapUrlSource.prototype.getUtfGridUrl = function(layerId, filters) {
    var design, jsonqlCss, layer, layerView;
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
    jsonqlCss = layer.getJsonQLCss(design, this.schema, filters);
    if (_.isString(jsonqlCss)) {
      return this.createLegacyUrl(design, "grid.json", filters);
    }
    return this.createUrl("grid.json", jsonqlCss, filters);
  };

  LegacyMapUrlSource.prototype.createUrl = function(extension, jsonqlCss, filters) {
    var query, url;
    query = "type=jsonql";
    if (this.client) {
      query += "&client=" + this.client;
    }
    query += "&design=" + encodeURIComponent(JSON.stringify(jsonqlCss));
    url = (this.apiUrl + "maps/tiles/{z}/{x}/{y}." + extension + "?") + query;
    if (url.match(/^https:\/\/api\.mwater\.co\//)) {
      url = url.replace(/^https:\/\/api\.mwater\.co\//, "https://{s}-api.mwater.co/");
    }
    return url;
  };

  LegacyMapUrlSource.prototype.createLegacyUrl = function(design, extension, filters) {
    var relevantFilters, url, where, whereClauses;
    url = this.apiUrl + "maps/tiles/{z}/{x}/{y}." + extension + "?type=" + design.type + "&radius=1000";
    if (url.match(/^https:\/\/api\.mwater\.co\//)) {
      url = url.replace(/^https:\/\/api\.mwater\.co\//, "https://{s}-api.mwater.co/");
    }
    if (this.client) {
      url += "&client=" + this.client;
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

  return LegacyMapUrlSource;

})();
