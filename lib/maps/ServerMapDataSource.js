var LayerFactory, MapDataSource, ServerLayerDataSource, ServerMapDataSource, ServerMapLayerPopupWidgetDataSource, _, injectTableAlias, querystring,
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
    this.options = options;
  }

  ServerMapDataSource.prototype.getLayerDataSource = function(layerId) {
    var layerView;
    layerView = _.findWhere(this.options.design.layerViews, {
      id: layerId
    });
    if (!layerView) {
      return null;
    }
    return new ServerLayerDataSource(_.extend({}, this.options, {
      layerView: layerView
    }));
  };

  return ServerMapDataSource;

})(MapDataSource);

ServerLayerDataSource = (function() {
  function ServerLayerDataSource(options) {
    this.options = options;
  }

  ServerLayerDataSource.prototype.getTileUrl = function(filters) {
    if (this.options.layerView.type === "MWaterServer") {
      return this.createLegacyUrl(this.options.layerView.design, "png", filters);
    }
    if (this.options.layerView.type === "TileUrl") {
      return this.options.layerView.design.tileUrl;
    }
    return this.createUrl(filters, "png");
  };

  ServerLayerDataSource.prototype.getUtfGridUrl = function(filters) {
    if (this.options.layerView.type === "MWaterServer") {
      return this.createLegacyUrl(this.options.layerView.design, "grid.json", filters);
    }
    if (this.options.layerView.type === "TileUrl") {
      return null;
    }
    return this.createUrl(filters, "grid.json");
  };

  ServerLayerDataSource.prototype.getPopupWidgetDataSource = function(widgetId) {
    return new ServerMapLayerPopupWidgetDataSource({
      apiUrl: this.options.apiUrl,
      client: this.options.client,
      share: this.options.share,
      mapId: this.options.mapId,
      rev: this.options.rev,
      layerId: this.options.layerView.id,
      popupWidgetId: widgetId
    });
  };

  ServerLayerDataSource.prototype.createUrl = function(filters, extension) {
    var query, url;
    query = {
      type: "maps",
      client: this.options.client,
      share: this.options.share,
      map: this.options.mapId,
      layer: this.options.layerView.id,
      filters: JSON.stringify(filters || []),
      rev: this.options.rev
    };
    url = (this.options.apiUrl + "maps/tiles/{z}/{x}/{y}." + extension + "?") + querystring.stringify(query);
    if (url.match(/^https:\/\/api\.mwater\.co\//)) {
      url = url.replace(/^https:\/\/api\.mwater\.co\//, "https://{s}-api.mwater.co/");
    }
    return url;
  };

  ServerLayerDataSource.prototype.createLegacyUrl = function(design, extension, filters) {
    var relevantFilters, url, where, whereClauses;
    url = this.options.apiUrl + "maps/tiles/{z}/{x}/{y}." + extension + "?type=" + design.type + "&radius=1000";
    if (url.match(/^https:\/\/api\.mwater\.co\//)) {
      url = url.replace(/^https:\/\/api\.mwater\.co\//, "https://{s}-api.mwater.co/");
    }
    if (this.options.client) {
      url += "&client=" + this.options.client;
    }
    if (this.options.share) {
      url += "&share=" + this.options.share;
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

  return ServerLayerDataSource;

})();

ServerMapLayerPopupWidgetDataSource = (function() {
  function ServerMapLayerPopupWidgetDataSource(options) {
    this.options = options;
  }

  ServerMapLayerPopupWidgetDataSource.prototype.getData = function(design, filters, callback) {
    var query, url;
    query = {
      client: this.options.client,
      share: this.options.share,
      filters: JSON.stringify(filters),
      rev: this.options.rev
    };
    url = this.options.apiUrl + ("maps/" + this.options.mapId + "/layers/" + this.options.layerId + "/widgets/" + this.options.popupWidgetId + "/data?") + querystring.stringify(query);
    return $.getJSON(url, (function(_this) {
      return function(data) {
        return callback(null, data);
      };
    })(this)).fail((function(_this) {
      return function(xhr) {
        console.log(xhr.responseText);
        return callback(new Error(xhr.responseText));
      };
    })(this));
  };

  ServerMapLayerPopupWidgetDataSource.prototype.getImageUrl = function(imageId, height) {
    var url;
    url = this.options.apiUrl + ("images/" + imageId);
    if (height) {
      url += "?h=" + height;
    }
    return url;
  };

  return ServerMapLayerPopupWidgetDataSource;

})();
