"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var $, LayerFactory, MapDataSource, ServerLayerDataSource, ServerMapDataSource, ServerMapLayerPopupWidgetDataSource, _, compressJson, injectTableAlias, querystring;

$ = require('jquery');
_ = require('lodash');
querystring = require('querystring');
MapDataSource = require('./MapDataSource');
LayerFactory = require('./LayerFactory');
injectTableAlias = require('mwater-expressions').injectTableAlias;
compressJson = require('../compressJson'); // Get map urls for map stored on server

module.exports = ServerMapDataSource =
/*#__PURE__*/
function (_MapDataSource) {
  (0, _inherits2.default)(ServerMapDataSource, _MapDataSource);

  // Create map url source that uses map design stored on server
  // options:
  //   schema: schema to use
  //   design: design of entire map
  //   share: share id to use for talking to mWater server
  //   apiUrl: API url to use for talking to mWater server
  //   client: client id to use for talking to mWater server
  //   mapId: map id to use on server
  //   rev: revision to use to allow caching
  function ServerMapDataSource(options) {
    var _this;

    (0, _classCallCheck2.default)(this, ServerMapDataSource);
    _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(ServerMapDataSource).call(this));
    _this.options = options;
    return _this;
  } // Gets the data source for a layer


  (0, _createClass2.default)(ServerMapDataSource, [{
    key: "getLayerDataSource",
    value: function getLayerDataSource(layerId) {
      var layerView; // Get layerView

      layerView = _.findWhere(this.options.design.layerViews, {
        id: layerId
      });

      if (!layerView) {
        return null;
      }

      return new ServerLayerDataSource(_.extend({}, this.options, {
        layerView: layerView
      }));
    } // Gets the bounds for the map. Null for no opinion. Callback as { n:, s:, w:, e: }

  }, {
    key: "getBounds",
    value: function getBounds(design, filters, callback) {
      var query, url;
      query = {
        client: this.options.client,
        share: this.options.share,
        filters: compressJson(filters),
        rev: this.options.rev
      };
      url = this.options.apiUrl + "maps/".concat(this.options.mapId, "/bounds?") + querystring.stringify(query);
      return $.getJSON(url, function (data) {
        return callback(null, data);
      }).fail(function (xhr) {
        console.log(xhr.responseText);
        return callback(new Error(xhr.responseText));
      });
    }
  }]);
  return ServerMapDataSource;
}(MapDataSource);

ServerLayerDataSource =
/*#__PURE__*/
function () {
  // Create map url source that uses map design stored on server
  // options:
  //   apiUrl: API url to use for talking to mWater server
  //   client: client id to use for talking to mWater server
  //   design: design of entire map
  //   schema: schema to use
  //   share: share id to use for talking to mWater server
  //   mapId: map id to use on server
  //   rev: revision to use to allow caching
  //   layerView: layer view
  function ServerLayerDataSource(options) {
    (0, _classCallCheck2.default)(this, ServerLayerDataSource);
    this.options = options;
  } // Get the url for the image tiles with the specified filters applied
  // Called with (design, filters) where design is the design of the layer and filters are filters to apply. Returns URL


  (0, _createClass2.default)(ServerLayerDataSource, [{
    key: "getTileUrl",
    value: function getTileUrl(design, filters) {
      // Handle special cases
      if (this.options.layerView.type === "MWaterServer") {
        return this.createLegacyUrl(design, "png", filters);
      }

      if (this.options.layerView.type === "TileUrl") {
        return design.tileUrl;
      }

      return this.createUrl(filters, "png");
    } // Get the url for the interactivity tiles with the specified filters applied
    // Called with (design, filters) where design is the design of the layer and filters are filters to apply. Returns URL

  }, {
    key: "getUtfGridUrl",
    value: function getUtfGridUrl(design, filters) {
      // Handle special cases
      if (this.options.layerView.type === "MWaterServer") {
        return this.createLegacyUrl(design, "grid.json", filters);
      }

      if (this.options.layerView.type === "TileUrl") {
        return null;
      }

      return this.createUrl(filters, "grid.json");
    } // Gets widget data source for a popup widget

  }, {
    key: "getPopupWidgetDataSource",
    value: function getPopupWidgetDataSource(design, widgetId) {
      return new ServerMapLayerPopupWidgetDataSource({
        apiUrl: this.options.apiUrl,
        client: this.options.client,
        share: this.options.share,
        mapId: this.options.mapId,
        rev: this.options.rev,
        layerId: this.options.layerView.id,
        popupWidgetId: widgetId
      });
    }
  }, {
    key: "createUrl",
    value: function createUrl(filters, extension) {
      var query, url;
      query = {
        type: "maps",
        client: this.options.client,
        share: this.options.share,
        map: this.options.mapId,
        layer: this.options.layerView.id,
        filters: compressJson(filters || []),
        rev: this.options.rev
      };
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
  return ServerLayerDataSource;
}();

ServerMapLayerPopupWidgetDataSource =
/*#__PURE__*/
function () {
  // options:
  //   apiUrl: API url to use for talking to mWater server
  //   client: client id to use for talking to mWater server
  //   share: share id to use for talking to mWater server
  //   mapId: map id to use on server
  //   rev: revision to use to allow caching
  //   layerId: layer id to use
  //   popupWidgetId: id of popup widget
  function ServerMapLayerPopupWidgetDataSource(options) {
    (0, _classCallCheck2.default)(this, ServerMapLayerPopupWidgetDataSource);
    this.options = options;
  } // Get the data that the widget needs. The widget should implement getData method (see above) to get the actual data on the server
  //  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
  //  callback: (error, data)


  (0, _createClass2.default)(ServerMapLayerPopupWidgetDataSource, [{
    key: "getData",
    value: function getData(design, filters, callback) {
      var query, url;
      query = {
        client: this.options.client,
        share: this.options.share,
        filters: compressJson(filters),
        rev: this.options.rev
      };
      url = this.options.apiUrl + "maps/".concat(this.options.mapId, "/layers/").concat(this.options.layerId, "/widgets/").concat(this.options.popupWidgetId, "/data?") + querystring.stringify(query);
      return $.getJSON(url, function (data) {
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
  return ServerMapLayerPopupWidgetDataSource;
}();