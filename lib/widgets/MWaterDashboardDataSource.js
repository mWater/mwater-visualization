var DirectMapUrlSource, MWaterDashboardDataSource, MWaterWidgetDataSource, WidgetFactory, querystring;

querystring = require('querystring');

WidgetFactory = require('./WidgetFactory');

DirectMapUrlSource = require('../maps/DirectMapUrlSource');

module.exports = MWaterDashboardDataSource = (function() {
  function MWaterDashboardDataSource(apiUrl, client, share, dashboardId) {
    this.apiUrl = apiUrl;
    this.client = client;
    this.share = share;
    this.dashboardId = dashboardId;
  }

  MWaterDashboardDataSource.prototype.getWidgetDataSource = function(widgetId) {
    return new MWaterWidgetDataSource(this.apiUrl, this.client, this.share, this.dashboardId, widgetId);
  };

  return MWaterDashboardDataSource;

})();

MWaterWidgetDataSource = (function() {
  function MWaterWidgetDataSource(apiUrl, client, share, dashboardId, widgetId) {
    this.apiUrl = apiUrl;
    this.client = client;
    this.share = share;
    this.dashboardId = dashboardId;
    this.widgetId = widgetId;
  }

  MWaterWidgetDataSource.prototype.getData = function(filters, callback) {
    var query, url;
    query = {
      client: this.client,
      share: this.share,
      filters: JSON.stringify(filters)
    };
    url = this.apiUrl + ("dashboards/" + this.dashboardId + "/widget_data/" + this.widgetId + "?") + querystring.stringify(query);
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

  MWaterWidgetDataSource.prototype.getTileUrl = function(layerId, filters) {
    return this.createUrl(layerId, filters, "png");
  };

  MWaterWidgetDataSource.prototype.getUtfGridUrl = function(layerId, filters) {
    return this.createUrl(layerId, filters, "grid.json");
  };

  MWaterWidgetDataSource.prototype.createUrl = function(layerId, filters, extension) {
    var query, url;
    query = {
      type: "dashboard_widget",
      client: this.client,
      share: this.share,
      dashboard: this.dashboardId,
      widget: this.widgetId,
      layer: layerId,
      filters: JSON.stringify(filters || [])
    };
    url = (this.apiUrl + "maps/tiles/{z}/{x}/{y}." + extension + "?") + querystring.stringify(query);
    if (url.match(/^https:\/\/api\.mwater\.co\//)) {
      url = url.replace(/^https:\/\/api\.mwater\.co\//, "https://{s}-api.mwater.co/");
    }
    return url;
  };

  return MWaterWidgetDataSource;

})();
