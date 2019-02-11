"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var BlocksLayoutManager, DirectLayerDataSource, DirectMapDataSource, DirectWidgetDataSource, LayerFactory, MapBoundsCalculator, MapDataSource, WidgetFactory, _, compressJson, injectTableAlias, querystring;

_ = require('lodash');
querystring = require('querystring');
LayerFactory = require('./LayerFactory');
injectTableAlias = require('mwater-expressions').injectTableAlias;
MapDataSource = require('./MapDataSource');
DirectWidgetDataSource = require('../widgets/DirectWidgetDataSource');
BlocksLayoutManager = require('../layouts/blocks/BlocksLayoutManager');
WidgetFactory = require('../widgets/WidgetFactory');
MapBoundsCalculator = require('./MapBoundsCalculator');
compressJson = require('../compressJson');

module.exports = DirectMapDataSource =
/*#__PURE__*/
function (_MapDataSource) {
  (0, _inherits2.default)(DirectMapDataSource, _MapDataSource);

  // Create map url source that uses direct jsonql maps
  // options:
  //   schema: schema to use
  //   dataSource: general data source
  //   design: design of entire map
  //   apiUrl: API url to use for talking to mWater server
  //   client: client id to use for talking to mWater server
  function DirectMapDataSource(options) {
    var _this;

    (0, _classCallCheck2.default)(this, DirectMapDataSource);
    _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(DirectMapDataSource).call(this));
    _this.options = options;
    return _this;
  } // Gets the data source for a layer


  (0, _createClass2.default)(DirectMapDataSource, [{
    key: "getLayerDataSource",
    value: function getLayerDataSource(layerId) {
      var layerView; // Get layerView

      layerView = _.findWhere(this.options.design.layerViews, {
        id: layerId
      });

      if (!layerView) {
        return null;
      }

      return new DirectLayerDataSource(_.extend({}, this.options, {
        layerView: layerView
      }));
    } // Gets the bounds for the map. Null for whole world. Callback as { n:, s:, w:, e: }

  }, {
    key: "getBounds",
    value: function getBounds(design, filters, callback) {
      return new MapBoundsCalculator(this.options.schema, this.options.dataSource).getBounds(design, filters, callback);
    }
  }]);
  return DirectMapDataSource;
}(MapDataSource);

DirectLayerDataSource =
/*#__PURE__*/
function () {
  // Create map url source that uses direct jsonql maps
  // options:
  //   schema: schema to use
  //   dataSource: general data source
  //   layerView: layerView to display
  //   apiUrl: API url to use for talking to mWater server
  //   client: client id to use for talking to mWater server
  function DirectLayerDataSource(options) {
    (0, _classCallCheck2.default)(this, DirectLayerDataSource);
    this.options = options;
  } // Get the url for the image tiles with the specified filters applied
  // Called with (design, filters) where design is the design of the layer and filters are filters to apply. Returns URL


  (0, _createClass2.default)(DirectLayerDataSource, [{
    key: "getTileUrl",
    value: function getTileUrl(design, filters) {
      var jsonqlCss, layer; // Create layer

      layer = LayerFactory.createLayer(this.options.layerView.type); // Handle special cases

      if (this.options.layerView.type === "MWaterServer") {
        return this.createLegacyUrl(design, "png", filters);
      }

      if (this.options.layerView.type === "TileUrl") {
        return design.tileUrl;
      } // Get JsonQLCss


      jsonqlCss = layer.getJsonQLCss(design, this.options.schema, filters);
      return this.createUrl("png", jsonqlCss);
    } // Get the url for the interactivity tiles with the specified filters applied
    // Called with (design, filters) where design is the design of the layer and filters are filters to apply. Returns URL

  }, {
    key: "getUtfGridUrl",
    value: function getUtfGridUrl(design, filters) {
      var jsonqlCss, layer; // Create layer

      layer = LayerFactory.createLayer(this.options.layerView.type); // Handle special cases

      if (this.options.layerView.type === "MWaterServer") {
        return this.createLegacyUrl(design, "grid.json", filters);
      }

      if (this.options.layerView.type === "TileUrl") {
        return null;
      } // Get JsonQLCss


      jsonqlCss = layer.getJsonQLCss(design, this.options.schema, filters);
      return this.createUrl("grid.json", jsonqlCss);
    } // Gets widget data source for a popup widget

  }, {
    key: "getPopupWidgetDataSource",
    value: function getPopupWidgetDataSource(design, widgetId) {
      var layer, type, widget; // Create layer

      layer = LayerFactory.createLayer(this.options.layerView.type); // Get widget

      var _getWidgetTypeAndDesi = new BlocksLayoutManager().getWidgetTypeAndDesign(design.popup.items, widgetId);

      type = _getWidgetTypeAndDesi.type;
      design = _getWidgetTypeAndDesi.design;
      // Create widget
      widget = WidgetFactory.createWidget(type);
      return new DirectWidgetDataSource({
        widget: widget,
        schema: this.options.schema,
        dataSource: this.options.dataSource,
        apiUrl: this.options.apiUrl,
        client: this.options.client
      });
    } // Create query string

  }, {
    key: "createUrl",
    value: function createUrl(extension, jsonqlCss) {
      var cacheExpiry, query, url;
      query = {
        type: "jsonql",
        design: compressJson(jsonqlCss)
      };

      if (this.options.client) {
        query.client = this.options.client;
      } // Make URL change when cache expired


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

      if (this.client) {
        url += "&client=".concat(this.options.client);
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
  return DirectLayerDataSource;
}();