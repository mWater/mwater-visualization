var BlocksLayoutManager, DirectLayerDataSource, DirectMapDataSource, DirectWidgetDataSource, LayerFactory, MapDataSource, WidgetFactory, _, injectTableAlias,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

LayerFactory = require('./LayerFactory');

injectTableAlias = require('mwater-expressions').injectTableAlias;

MapDataSource = require('./MapDataSource');

DirectWidgetDataSource = require('../widgets/DirectWidgetDataSource');

BlocksLayoutManager = require('../layouts/blocks/BlocksLayoutManager');

WidgetFactory = require('../widgets/WidgetFactory');

module.exports = DirectMapDataSource = (function(superClass) {
  extend(DirectMapDataSource, superClass);

  function DirectMapDataSource(options) {
    this.options = options;
  }

  DirectMapDataSource.prototype.getLayerDataSource = function(layerId) {
    return new DirectLayerDataSource(_.extend({}, this.options, {
      layerId: layerId
    }));
  };

  return DirectMapDataSource;

})(MapDataSource);

DirectLayerDataSource = (function() {
  function DirectLayerDataSource(options) {
    this.options = options;
  }

  DirectLayerDataSource.prototype.getTileUrl = function(filters) {
    var design, jsonqlCss, layer, layerView;
    layerView = _.findWhere(this.options.design.layerViews, {
      id: this.options.layerId
    });
    if (!layerView) {
      return null;
    }
    layer = LayerFactory.createLayer(layerView.type);
    design = layer.cleanDesign(layerView.design, this.options.schema);
    if (layer.validateDesign(design, this.options.schema)) {
      return null;
    }
    if (layerView.type === "MWaterServer") {
      return this.createLegacyUrl(design, "png", filters);
    }
    if (layerView.type === "TileUrl") {
      return design.tileUrl;
    }
    jsonqlCss = layer.getJsonQLCss(design, this.options.schema, filters);
    return this.createUrl("png", jsonqlCss);
  };

  DirectLayerDataSource.prototype.getUtfGridUrl = function(filters) {
    var design, jsonqlCss, layer, layerView;
    layerView = _.findWhere(this.options.design.layerViews, {
      id: this.options.layerId
    });
    if (!layerView) {
      return null;
    }
    layer = LayerFactory.createLayer(layerView.type);
    design = layer.cleanDesign(layerView.design, this.options.schema);
    if (layer.validateDesign(design, this.options.schema)) {
      return null;
    }
    if (layerView.type === "MWaterServer") {
      return this.createLegacyUrl(design, "grid.json", filters);
    }
    if (layerView.type === "TileUrl") {
      return null;
    }
    jsonqlCss = layer.getJsonQLCss(design, this.options.schema, filters);
    return this.createUrl("grid.json", jsonqlCss);
  };

  DirectLayerDataSource.prototype.getPopupWidgetDataSource = function(widgetId) {
    var design, ref, type, widget;
    ref = new BlocksLayoutManager().getWidgetTypeAndDesign(this.options.design.popup.items, widgetId), type = ref.type, design = ref.design;
    widget = WidgetFactory.createWidget(type);
    return new DirectWidgetDataSource({
      widget: widget,
      design: design,
      schema: options.schema,
      dataSource: options.dataSource,
      apiUrl: options.apiUrl,
      client: options.client
    });
  };

  DirectLayerDataSource.prototype.createUrl = function(extension, jsonqlCss) {
    var query, url;
    query = "type=jsonql";
    if (this.options.client) {
      query += "&client=" + this.options.client;
    }
    query += "&design=" + encodeURIComponent(JSON.stringify(jsonqlCss));
    url = (this.options.apiUrl + "maps/tiles/{z}/{x}/{y}." + extension + "?") + query;
    if (url.match(/^https:\/\/api\.mwater\.co\//)) {
      url = url.replace(/^https:\/\/api\.mwater\.co\//, "https://{s}-api.mwater.co/");
    }
    return url;
  };

  DirectLayerDataSource.prototype.createLegacyUrl = function(design, extension, filters) {
    var relevantFilters, url, where, whereClauses;
    url = this.options.apiUrl + "maps/tiles/{z}/{x}/{y}." + extension + "?type=" + design.type + "&radius=1000";
    if (url.match(/^https:\/\/api\.mwater\.co\//)) {
      url = url.replace(/^https:\/\/api\.mwater\.co\//, "https://{s}-api.mwater.co/");
    }
    if (this.client) {
      url += "&client=" + this.options.client;
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

  return DirectLayerDataSource;

})();
