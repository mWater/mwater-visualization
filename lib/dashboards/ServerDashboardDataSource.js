"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var $, LayerFactory, ServerDashboardDataSource, ServerQuickfilterDataSource, ServerWidgetDataSource, ServerWidgetLayerDataSource, ServerWidgetLayerPopupWidgetDataSource, ServerWidgetMapDataSource, _, compressJson, injectTableAlias, querystring;

_ = require('lodash');
$ = require('jquery');
querystring = require('querystring');
injectTableAlias = require('mwater-expressions').injectTableAlias;
compressJson = require('../compressJson');
LayerFactory = require('../maps/LayerFactory'); // Uses mWater server to get widget data to allow sharing with unprivileged users

module.exports = ServerDashboardDataSource =
/*#__PURE__*/
function () {
  // options:
  //   apiUrl: API url to use for talking to mWater server
  //   client: client id to use for talking to mWater server
  //   share: share id to use for talking to mWater server
  //   dashboardId: dashboard id to use on server
  //   dataSource: data source that is used for determining cache expiry
  //   rev: revision to use to allow caching
  function ServerDashboardDataSource(options) {
    (0, _classCallCheck2.default)(this, ServerDashboardDataSource);
    this.options = options;
  } // Gets the widget data source for a specific widget


  (0, _createClass2.default)(ServerDashboardDataSource, [{
    key: "getWidgetDataSource",
    value: function getWidgetDataSource(widgetId) {
      return new ServerWidgetDataSource(_.extend({}, this.options, {
        widgetId: widgetId
      }));
    }
  }, {
    key: "getQuickfiltersDataSource",
    value: function getQuickfiltersDataSource() {
      return new ServerQuickfilterDataSource(this.options);
    }
  }]);
  return ServerDashboardDataSource;
}();

ServerQuickfilterDataSource =
/*#__PURE__*/
function () {
  // options:
  //   apiUrl: API url to use for talking to mWater server
  //   client: client id to use for talking to mWater server
  //   share: share id to use for talking to mWater server
  //   dashboardId: dashboard id to use on server
  //   dataSource: data source that is used for determining cache expiry
  //   rev: revision to use to allow caching
  function ServerQuickfilterDataSource(options) {
    (0, _classCallCheck2.default)(this, ServerQuickfilterDataSource);
    this.options = options;
  } // Gets the values of the quickfilter at index


  (0, _createClass2.default)(ServerQuickfilterDataSource, [{
    key: "getValues",
    value: function getValues(index, expr, filters, offset, limit, callback) {
      var cacheExpiry, headers, query, seconds, url;
      query = {
        client: this.options.client,
        share: this.options.share,
        filters: compressJson(filters),
        offset: offset,
        limit: limit,
        rev: this.options.rev
      };
      url = this.options.apiUrl + "dashboards/".concat(this.options.dashboardId, "/quickfilters/").concat(index, "/values?") + querystring.stringify(query);
      headers = {};
      cacheExpiry = this.options.dataSource.getCacheExpiry();

      if (cacheExpiry) {
        seconds = Math.floor((new Date().getTime() - cacheExpiry) / 1000);
        headers['Cache-Control'] = "max-age=".concat(seconds);
      }

      return $.ajax({
        dataType: "json",
        method: "GET",
        url: url,
        headers: headers
      }).done(function (data) {
        return callback(null, data);
      }).fail(function (xhr) {
        console.log(xhr.responseText);
        return callback(new Error(xhr.responseText));
      });
    }
  }]);
  return ServerQuickfilterDataSource;
}();

ServerWidgetDataSource =
/*#__PURE__*/
function () {
  // options:
  //   apiUrl: API url to use for talking to mWater server
  //   client: client id to use for talking to mWater server
  //   share: share id to use for talking to mWater server
  //   dashboardId: dashboard id to use on server
  //   dataSource: data source that is used for determining cache expiry
  //   rev: revision to use to allow caching
  //   widgetId: widget id to use
  function ServerWidgetDataSource(options) {
    (0, _classCallCheck2.default)(this, ServerWidgetDataSource);
    this.options = options;
  } // Get the data that the widget needs. The widget should implement getData method (see above) to get the data from the server
  //  design: design of the widget. Ignored in the case of server-side rendering
  //  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct


  (0, _createClass2.default)(ServerWidgetDataSource, [{
    key: "getData",
    value: function getData(design, filters, callback) {
      var cacheExpiry, headers, query, seconds, url;
      query = {
        client: this.options.client,
        share: this.options.share,
        filters: compressJson(filters),
        rev: this.options.rev
      };
      url = this.options.apiUrl + "dashboards/".concat(this.options.dashboardId, "/widgets/").concat(this.options.widgetId, "/data?") + querystring.stringify(query);
      headers = {};
      cacheExpiry = this.options.dataSource.getCacheExpiry();

      if (cacheExpiry) {
        seconds = Math.floor((new Date().getTime() - cacheExpiry) / 1000);
        headers['Cache-Control'] = "max-age=".concat(seconds);
      }

      return $.ajax({
        dataType: "json",
        method: "GET",
        url: url,
        headers: headers
      }).done(function (data) {
        return callback(null, data);
      }).fail(function (xhr) {
        console.log(xhr.responseText);
        return callback(new Error(xhr.responseText));
      });
    } // For map widgets, the following is required

  }, {
    key: "getMapDataSource",
    value: function getMapDataSource(design) {
      return new ServerWidgetMapDataSource(_.extend({}, this.options, {
        design: design
      }));
    } // Get the url to download an image (by id from an image or imagelist column)
    // Height, if specified, is minimum height needed. May return larger image

  }, {
    key: "getImageUrl",
    value: function getImageUrl(imageId, height) {
      var url;
      url = this.options.apiUrl + "images/".concat(imageId);

      if (height) {
        url += "?h=".concat(height);
      }

      return url;
    }
  }]);
  return ServerWidgetDataSource;
}();

ServerWidgetMapDataSource =
/*#__PURE__*/
function () {
  // options:
  //   apiUrl: API url to use for talking to mWater server
  //   design: design of the map widget
  //   client: client id to use for talking to mWater server
  //   share: share id to use for talking to mWater server
  //   dashboardId: dashboard id to use on server
  //   dataSource: data source that is used for determining cache expiry
  //   rev: revision to use to allow caching
  //   widgetId: widget id to use
  function ServerWidgetMapDataSource(options) {
    (0, _classCallCheck2.default)(this, ServerWidgetMapDataSource);
    this.options = options;
  } // Gets the data source for a layer


  (0, _createClass2.default)(ServerWidgetMapDataSource, [{
    key: "getLayerDataSource",
    value: function getLayerDataSource(layerId) {
      var layerView; // Get layerView

      layerView = _.findWhere(this.options.design.layerViews, {
        id: layerId
      });

      if (!layerView) {
        return null;
      }

      return new ServerWidgetLayerDataSource(_.extend({}, this.options, {
        layerView: layerView
      }));
    } // Gets the bounds for the map. Null for no opinion. Callback as { n:, s:, w:, e: }

  }, {
    key: "getBounds",
    value: function getBounds(design, filters, callback) {
      var cacheExpiry, headers, query, seconds, url;
      query = {
        client: this.options.client,
        share: this.options.share,
        filters: compressJson(filters),
        rev: this.options.rev
      };
      url = this.options.apiUrl + "dashboards/".concat(this.options.dashboardId, "/widgets/").concat(this.options.widgetId, "/bounds?") + querystring.stringify(query);
      headers = {};
      cacheExpiry = this.options.dataSource.getCacheExpiry();

      if (cacheExpiry) {
        seconds = Math.floor((new Date().getTime() - cacheExpiry) / 1000);
        headers['Cache-Control'] = "max-age=".concat(seconds);
      }

      return $.ajax({
        dataType: "json",
        method: "GET",
        url: url,
        headers: headers
      }).done(function (data) {
        return callback(null, data);
      }).fail(function (xhr) {
        console.log(xhr.responseText);
        return callback(new Error(xhr.responseText));
      });
    }
  }]);
  return ServerWidgetMapDataSource;
}();

ServerWidgetLayerDataSource =
/*#__PURE__*/
function () {
  // options:
  //   apiUrl: API url to use for talking to mWater server
  //   client: client id to use for talking to mWater server
  //   share: share id to use for talking to mWater server
  //   dashboardId: dashboard id to use on server
  //   dataSource: data source that is used for determining cache expiry
  //   rev: revision to use to allow caching
  //   widgetId: widget id to use
  //   layerView: layer view of map inside widget
  function ServerWidgetLayerDataSource(options) {
    (0, _classCallCheck2.default)(this, ServerWidgetLayerDataSource);
    this.options = options;
  } // Get the url for the image tiles with the specified filters applied
  // Called with (design, filters) where design is the layer design and filters are filters to apply. Returns URL


  (0, _createClass2.default)(ServerWidgetLayerDataSource, [{
    key: "getTileUrl",
    value: function getTileUrl(design, filters) {
      var layer; // Handle special cases

      if (this.options.layerView.type === "MWaterServer") {
        return this.createLegacyUrl(this.options.layerView.design, "png", filters);
      } // Create layer


      layer = LayerFactory.createLayer(this.options.layerView.type); // If layer has tiles url directly available

      if (layer.getLayerDefinitionType() === "TileUrl") {
        return layer.getTileUrl(this.options.layerView.design, filters);
      }

      return this.createUrl(filters, "png");
    } // Get the url for the interactivity tiles with the specified filters applied
    // Called with (design, filters) where design is the layer design and filters are filters to apply. Returns URL

  }, {
    key: "getUtfGridUrl",
    value: function getUtfGridUrl(design, filters) {
      var layer; // Handle special cases

      if (this.options.layerView.type === "MWaterServer") {
        return this.createLegacyUrl(this.options.layerView.design, "grid.json", filters);
      } // Create layer


      layer = LayerFactory.createLayer(this.options.layerView.type); // If layer has tiles url directly available

      if (layer.getLayerDefinitionType() === "TileUrl") {
        return layer.getUtfGridUrl(this.options.layerView.design, filters);
      }

      return this.createUrl(filters, "grid.json");
    } // Gets widget data source for a popup widget

  }, {
    key: "getPopupWidgetDataSource",
    value: function getPopupWidgetDataSource(design, widgetId) {
      return new ServerWidgetLayerPopupWidgetDataSource(_.extend({}, this.options, {
        popupWidgetId: widgetId
      }));
    } // Create url

  }, {
    key: "createUrl",
    value: function createUrl(filters, extension) {
      var cacheExpiry, query, url;
      query = {
        type: "dashboard_widget",
        client: this.options.client,
        share: this.options.share,
        dashboard: this.options.dashboardId,
        widget: this.options.widgetId,
        layer: this.options.layerView.id,
        rev: this.options.rev,
        filters: compressJson(filters || [])
      }; // Make URL change when cache expired

      cacheExpiry = this.options.dataSource.getCacheExpiry();

      if (cacheExpiry) {
        query.cacheExpiry = cacheExpiry;
      }

      url = "".concat(this.options.apiUrl, "maps/tiles/{z}/{x}/{y}.").concat(extension, "?") + querystring.stringify(query); // Add subdomains: {s} will be substituted with "a", "b" or "c" in leaflet for api.mwater.co only.
      // Used to speed queries

      if (url.match(/^https:\/\/api\.mwater\.co\//)) {
        url = url.replace(/^https:\/\/api\.mwater\.co\//, "https://{s}-api.mwater.co/");
      }

      return url;
    } // Create query string

  }, {
    key: "createLegacyUrl",
    value: function createLegacyUrl(design, extension, filters) {
      var relevantFilters, url, where, whereClauses;
      url = "".concat(this.options.apiUrl, "maps/tiles/{z}/{x}/{y}.").concat(extension, "?type=").concat(design.type, "&radius=1000"); // Add subdomains: {s} will be substituted with "a", "b" or "c" in leaflet for api.mwater.co only.
      // Used to speed queries

      if (url.match(/^https:\/\/api\.mwater\.co\//)) {
        url = url.replace(/^https:\/\/api\.mwater\.co\//, "https://{s}-api.mwater.co/");
      }

      if (this.options.client) {
        url += "&client=".concat(this.options.client);
      }

      if (this.options.share) {
        url += "&share=".concat(this.options.share);
      } // Add where for any relevant filters


      relevantFilters = _.where(filters, {
        table: design.table
      }); // If any, create and

      whereClauses = _.map(relevantFilters, function (f) {
        return injectTableAlias(f.jsonql, "main");
      }); // Wrap if multiple

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
        url += "&where=" + encodeURIComponent(compressJson(where));
      }

      return url;
    }
  }]);
  return ServerWidgetLayerDataSource;
}();

ServerWidgetLayerPopupWidgetDataSource =
/*#__PURE__*/
function () {
  // options:
  //   apiUrl: API url to use for talking to mWater server
  //   client: client id to use for talking to mWater server
  //   share: share id to use for talking to mWater server
  //   dashboardId: dashboard id to use on server
  //   dataSource: data source that is used for determining cache expiry
  //   rev: revision to use to allow caching
  //   widgetId: widget id to use
  //   layerView: layer view of map inside widget
  //   popupWidgetId: id of popup widget
  function ServerWidgetLayerPopupWidgetDataSource(options) {
    (0, _classCallCheck2.default)(this, ServerWidgetLayerPopupWidgetDataSource);
    this.options = options;
  } // Get the data that the widget needs. The widget should implement getData method (see above) to get the actual data on the server
  //  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
  //  callback: (error, data)


  (0, _createClass2.default)(ServerWidgetLayerPopupWidgetDataSource, [{
    key: "getData",
    value: function getData(design, filters, callback) {
      var cacheExpiry, headers, query, seconds, url;
      query = {
        client: this.options.client,
        share: this.options.share,
        filters: compressJson(filters),
        rev: this.options.rev
      };
      url = this.options.apiUrl + "dashboards/".concat(this.options.dashboardId, "/widgets/").concat(this.options.widgetId, "/layers/").concat(this.options.layerView.id, "/widgets/").concat(this.options.popupWidgetId, "/data?") + querystring.stringify(query);
      headers = {};
      cacheExpiry = this.options.dataSource.getCacheExpiry();

      if (cacheExpiry) {
        seconds = Math.floor((new Date().getTime() - cacheExpiry) / 1000);
        headers['Cache-Control'] = "max-age=".concat(seconds);
      }

      return $.ajax({
        dataType: "json",
        method: "GET",
        url: url,
        headers: headers
      }).done(function (data) {
        return callback(null, data);
      }).fail(function (xhr) {
        console.log(xhr.responseText);
        return callback(new Error(xhr.responseText));
      });
    } // Get the url to download an image (by id from an image or imagelist column)
    // Height, if specified, is minimum height needed. May return larger image

  }, {
    key: "getImageUrl",
    value: function getImageUrl(imageId, height) {
      var url;
      url = this.options.apiUrl + "images/".concat(imageId);

      if (height) {
        url += "?h=".concat(height);
      }

      return url;
    }
  }]);
  return ServerWidgetLayerPopupWidgetDataSource;
}();