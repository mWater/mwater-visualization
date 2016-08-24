var DirectMapDataSource, ServerDashboardDataSource, ServerWidgetDataSource, ServerWidgetLayerDataSource, ServerWidgetLayerPopupWidgetDataSource, ServerWidgetMapDataSource, WidgetFactory, querystring;

querystring = require('querystring');

WidgetFactory = require('../widgets/WidgetFactory');

DirectMapDataSource = require('../maps/DirectMapDataSource');

module.exports = ServerDashboardDataSource = (function() {
  function ServerDashboardDataSource(options) {
    this.options = options;
  }

  ServerDashboardDataSource.prototype.getWidgetDataSource = function(widgetId) {
    return new ServerWidgetDataSource(_.extend({}, this.options, {
      widgetId: widgetId
    }));
  };

  return ServerDashboardDataSource;

})();

ServerWidgetDataSource = (function() {
  function ServerWidgetDataSource(options) {
    this.options = options;
  }

  ServerWidgetDataSource.prototype.getData = function(design, filters, callback) {
    var query, url;
    query = {
      client: this.options.client,
      share: this.options.share,
      filters: JSON.stringify(filters)
    };
    url = this.options.apiUrl + ("dashboards/" + this.options.dashboardId + "/widgets/" + this.options.widgetId + "/data?") + querystring.stringify(query);
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

  ServerWidgetDataSource.prototype.getMapDataSource = function(design) {
    return new ServerWidgetMapDataSource(this.options);
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
    return new ServerWidgetLayerDataSource(_.extend({}, this.options, {
      layerId: layerId
    }));
  };

  return ServerWidgetMapDataSource;

})();

ServerWidgetLayerDataSource = (function() {
  function ServerWidgetLayerDataSource(options) {
    this.options = options;
  }

  ServerWidgetLayerDataSource.prototype.getTileUrl = function(filters) {
    return this.createUrl(filters, "png");
  };

  ServerWidgetLayerDataSource.prototype.getUtfGridUrl = function(filters) {
    return this.createUrl(filters, "grid.json");
  };

  ServerWidgetLayerDataSource.prototype.getPopupWidgetDataSource = function(widgetId) {
    return new ServerWidgetLayerPopupWidgetDataSource(_.extend({}, this.options, {
      popupWidgetId: widgetId
    }));
  };

  ServerWidgetLayerDataSource.prototype.createUrl = function(filters, extension) {
    var query, url;
    query = {
      type: "dashboard_widget",
      client: this.options.client,
      share: this.options.share,
      dashboard: this.options.dashboardId,
      widget: this.options.widgetId,
      layer: this.options.layerId,
      filters: JSON.stringify(filters || [])
    };
    url = (this.options.apiUrl + "maps/tiles/{z}/{x}/{y}." + extension + "?") + querystring.stringify(query);
    if (url.match(/^https:\/\/api\.mwater\.co\//)) {
      url = url.replace(/^https:\/\/api\.mwater\.co\//, "https://{s}-api.mwater.co/");
    }
    return url;
  };

  return ServerWidgetLayerDataSource;

})();

ServerWidgetLayerPopupWidgetDataSource = (function() {
  function ServerWidgetLayerPopupWidgetDataSource(options) {
    this.options = options;
  }

  ServerWidgetLayerPopupWidgetDataSource.prototype.getData = function(filters, callback) {
    var query, url;
    query = {
      client: this.options.client,
      share: this.options.share,
      filters: JSON.stringify(filters)
    };
    url = this.options.apiUrl + ("dashboards/" + this.options.dashboardId + "/widgets/" + this.options.widgetId + "/layers/" + this.options.layerId + "/widgets/" + this.options.popupWidgetId + "/data?") + querystring.stringify(query);
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
