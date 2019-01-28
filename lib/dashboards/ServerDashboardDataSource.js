var $, ServerDashboardDataSource, ServerQuickfilterDataSource, ServerWidgetDataSource, ServerWidgetLayerDataSource, ServerWidgetLayerPopupWidgetDataSource, ServerWidgetMapDataSource, injectTableAlias, querystring;

$ = require('jquery');

querystring = require('querystring');

injectTableAlias = require('mwater-expressions').injectTableAlias;

module.exports = ServerDashboardDataSource = (function() {
  function ServerDashboardDataSource(options) {
    this.options = options;
  }

  ServerDashboardDataSource.prototype.getWidgetDataSource = function(widgetId) {
    return new ServerWidgetDataSource(_.extend({}, this.options, {
      widgetId: widgetId
    }));
  };

  ServerDashboardDataSource.prototype.getQuickfiltersDataSource = function() {
    return new ServerQuickfilterDataSource(this.options);
  };

  return ServerDashboardDataSource;

})();

ServerQuickfilterDataSource = (function() {
  function ServerQuickfilterDataSource(options) {
    this.options = options;
  }

  ServerQuickfilterDataSource.prototype.getValues = function(index, expr, filters, offset, limit, callback) {
    var cacheExpiry, headers, query, seconds, url;
    query = {
      client: this.options.client,
      share: this.options.share,
      filters: JSON.stringify(filters),
      offset: offset,
      limit: limit,
      rev: this.options.rev
    };
    url = this.options.apiUrl + ("dashboards/" + this.options.dashboardId + "/quickfilters/" + index + "/values?") + querystring.stringify(query);
    headers = {};
    cacheExpiry = this.options.dataSource.getCacheExpiry();
    if (cacheExpiry) {
      seconds = Math.floor((new Date().getTime() - cacheExpiry) / 1000);
      headers['Cache-Control'] = "max-age=" + seconds;
    }
    return $.ajax({
      dataType: "json",
      method: "GET",
      url: url,
      headers: headers
    }).done((function(_this) {
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

  return ServerQuickfilterDataSource;

})();

ServerWidgetDataSource = (function() {
  function ServerWidgetDataSource(options) {
    this.options = options;
  }

  ServerWidgetDataSource.prototype.getData = function(design, filters, callback) {
    var cacheExpiry, headers, query, seconds, url;
    query = {
      client: this.options.client,
      share: this.options.share,
      filters: JSON.stringify(filters),
      rev: this.options.rev
    };
    url = this.options.apiUrl + ("dashboards/" + this.options.dashboardId + "/widgets/" + this.options.widgetId + "/data?") + querystring.stringify(query);
    headers = {};
    cacheExpiry = this.options.dataSource.getCacheExpiry();
    if (cacheExpiry) {
      seconds = Math.floor((new Date().getTime() - cacheExpiry) / 1000);
      headers['Cache-Control'] = "max-age=" + seconds;
    }
    return $.ajax({
      dataType: "json",
      method: "GET",
      url: url,
      headers: headers
    }).done((function(_this) {
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

  ServerWidgetDataSource.prototype.getMapDataSource = function(design) {
    return new ServerWidgetMapDataSource(_.extend({}, this.options, {
      design: design
    }));
  };

  ServerWidgetDataSource.prototype.getImageUrl = function(imageId, height) {
    var url;
    url = this.options.apiUrl + ("images/" + imageId);
    if (height) {
      url += "?h=" + height;
    }
    return url;
  };

  return ServerWidgetDataSource;

})();

ServerWidgetMapDataSource = (function() {
  function ServerWidgetMapDataSource(options) {
    this.options = options;
  }

  ServerWidgetMapDataSource.prototype.getLayerDataSource = function(layerId) {
    var layerView;
    layerView = _.findWhere(this.options.design.layerViews, {
      id: layerId
    });
    if (!layerView) {
      return null;
    }
    return new ServerWidgetLayerDataSource(_.extend({}, this.options, {
      layerView: layerView
    }));
  };

  ServerWidgetMapDataSource.prototype.getBounds = function(design, filters, callback) {
    var cacheExpiry, headers, query, seconds, url;
    query = {
      client: this.options.client,
      share: this.options.share,
      filters: JSON.stringify(filters),
      rev: this.options.rev
    };
    url = this.options.apiUrl + ("dashboards/" + this.options.dashboardId + "/widgets/" + this.options.widgetId + "/bounds?") + querystring.stringify(query);
    headers = {};
    cacheExpiry = this.options.dataSource.getCacheExpiry();
    if (cacheExpiry) {
      seconds = Math.floor((new Date().getTime() - cacheExpiry) / 1000);
      headers['Cache-Control'] = "max-age=" + seconds;
    }
    return $.ajax({
      dataType: "json",
      method: "GET",
      url: url,
      headers: headers
    }).done((function(_this) {
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

  return ServerWidgetMapDataSource;

})();

ServerWidgetLayerDataSource = (function() {
  function ServerWidgetLayerDataSource(options) {
    this.options = options;
  }

  ServerWidgetLayerDataSource.prototype.getTileUrl = function(design, filters) {
    if (this.options.layerView.type === "MWaterServer") {
      return this.createLegacyUrl(this.options.layerView.design, "png", filters);
    }
    if (this.options.layerView.type === "TileUrl") {
      return this.options.layerView.design.tileUrl;
    }
    return this.createUrl(filters, "png");
  };

  ServerWidgetLayerDataSource.prototype.getUtfGridUrl = function(design, filters) {
    if (this.options.layerView.type === "MWaterServer") {
      return this.createLegacyUrl(this.options.layerView.design, "grid.json", filters);
    }
    if (this.options.layerView.type === "TileUrl") {
      return null;
    }
    return this.createUrl(filters, "grid.json");
  };

  ServerWidgetLayerDataSource.prototype.getPopupWidgetDataSource = function(design, widgetId) {
    return new ServerWidgetLayerPopupWidgetDataSource(_.extend({}, this.options, {
      popupWidgetId: widgetId
    }));
  };

  ServerWidgetLayerDataSource.prototype.createUrl = function(filters, extension) {
    var cacheExpiry, query, url;
    query = {
      type: "dashboard_widget",
      client: this.options.client,
      share: this.options.share,
      dashboard: this.options.dashboardId,
      widget: this.options.widgetId,
      layer: this.options.layerView.id,
      rev: this.options.rev,
      filters: JSON.stringify(filters || [])
    };
    cacheExpiry = this.options.dataSource.getCacheExpiry();
    if (cacheExpiry) {
      query.cacheExpiry = cacheExpiry;
    }
    url = (this.options.apiUrl + "maps/tiles/{z}/{x}/{y}." + extension + "?") + querystring.stringify(query);
    if (url.match(/^https:\/\/api\.mwater\.co\//)) {
      url = url.replace(/^https:\/\/api\.mwater\.co\//, "https://{s}-api.mwater.co/");
    }
    return url;
  };

  ServerWidgetLayerDataSource.prototype.createLegacyUrl = function(design, extension, filters) {
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

  return ServerWidgetLayerDataSource;

})();

ServerWidgetLayerPopupWidgetDataSource = (function() {
  function ServerWidgetLayerPopupWidgetDataSource(options) {
    this.options = options;
  }

  ServerWidgetLayerPopupWidgetDataSource.prototype.getData = function(design, filters, callback) {
    var cacheExpiry, headers, query, seconds, url;
    query = {
      client: this.options.client,
      share: this.options.share,
      filters: JSON.stringify(filters),
      rev: this.options.rev
    };
    url = this.options.apiUrl + ("dashboards/" + this.options.dashboardId + "/widgets/" + this.options.widgetId + "/layers/" + this.options.layerView.id + "/widgets/" + this.options.popupWidgetId + "/data?") + querystring.stringify(query);
    headers = {};
    cacheExpiry = this.options.dataSource.getCacheExpiry();
    if (cacheExpiry) {
      seconds = Math.floor((new Date().getTime() - cacheExpiry) / 1000);
      headers['Cache-Control'] = "max-age=" + seconds;
    }
    return $.ajax({
      dataType: "json",
      method: "GET",
      url: url,
      headers: headers
    }).done((function(_this) {
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

  ServerWidgetLayerPopupWidgetDataSource.prototype.getImageUrl = function(imageId, height) {
    var url;
    url = this.options.apiUrl + ("images/" + imageId);
    if (height) {
      url += "?h=" + height;
    }
    return url;
  };

  return ServerWidgetLayerPopupWidgetDataSource;

})();
