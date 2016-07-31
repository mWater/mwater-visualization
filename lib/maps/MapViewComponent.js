var ExprCompiler, ExprUtils, H, LayerFactory, LeafletMapComponent, MapViewComponent, React,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

LeafletMapComponent = require('./LeafletMapComponent');

ExprUtils = require('mwater-expressions').ExprUtils;

ExprCompiler = require('mwater-expressions').ExprCompiler;

LayerFactory = require('./LayerFactory');

module.exports = MapViewComponent = (function(superClass) {
  extend(MapViewComponent, superClass);

  function MapViewComponent() {
    this.handleGridClick = bind(this.handleGridClick, this);
    this.handleBoundsChange = bind(this.handleBoundsChange, this);
    return MapViewComponent.__super__.constructor.apply(this, arguments);
  }

  MapViewComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    mapUrlSource: React.PropTypes.shape({
      getTileUrl: React.PropTypes.func.isRequired,
      getUtfGridUrl: React.PropTypes.func.isRequired
    }).isRequired,
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func,
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    onRowClick: React.PropTypes.func,
    extraFilters: React.PropTypes.arrayOf(React.PropTypes.shape({
      table: React.PropTypes.string.isRequired,
      jsonql: React.PropTypes.object.isRequired
    })),
    dragging: React.PropTypes.bool,
    touchZoom: React.PropTypes.bool,
    scrollWheelZoom: React.PropTypes.bool
  };

  MapViewComponent.prototype.handleBoundsChange = function(bounds) {
    var design;
    if (this.props.onDesignChange == null) {
      return;
    }
    design = _.extend({}, this.props.design, {
      bounds: bounds
    });
    return this.props.onDesignChange(design);
  };

  MapViewComponent.prototype.handleGridClick = function(layer, design, ev) {
    var base, results;
    results = layer.onGridClick(ev, {
      design: design,
      schema: this.props.schema,
      dataSource: this.props.dataSource
    });
    if (_.isArray(results)) {
      return typeof (base = this.props).onRowClick === "function" ? base.onRowClick(results[0], results[1]) : void 0;
    }
  };

  MapViewComponent.prototype.renderLegend = function() {
    var legendItems, style;
    legendItems = _.compact(_.map(this.props.design.layerViews, (function(_this) {
      return function(layerView) {
        var layer;
        layer = LayerFactory.createLayer(layerView.type);
        if (layer.validateDesign(layer.cleanDesign(layerView.design, _this.props.schema), _this.props.schema)) {
          return null;
        }
        if (layerView.visible) {
          return {
            key: layerView.id,
            legend: layer.getLegend(layerView.design, _this.props.schema, layerView.name)
          };
        }
      };
    })(this)));
    console.log(legendItems);
    if (legendItems.length === 0) {
      return;
    }
    style = {
      padding: 7,
      background: "rgba(255,255,255,0.8)",
      boxShadow: "0 0 15px rgba(0,0,0,0.2)",
      borderRadius: 5
    };
    return H.div({
      style: style
    }, _.map(legendItems, (function(_this) {
      return function(item, i) {
        return H.div({
          key: item.key
        }, item.legend);
      };
    })(this)));
  };

  MapViewComponent.prototype.render = function() {
    var compiledFilters, design, exprCompiler, exprUtils, filters, index, j, layer, layerView, leafletLayer, leafletLayers, len, ref;
    exprUtils = new ExprUtils(this.props.schema);
    filters = _.values(this.props.design.filters);
    exprCompiler = new ExprCompiler(this.props.schema);
    compiledFilters = _.map(filters, (function(_this) {
      return function(expr) {
        var jsonql, table;
        table = exprUtils.getExprTable(expr);
        jsonql = exprCompiler.compileExpr({
          expr: expr,
          tableAlias: "{alias}"
        });
        return {
          table: table,
          jsonql: jsonql
        };
      };
    })(this));
    if (this.props.extraFilters) {
      compiledFilters = compiledFilters.concat(this.props.extraFilters);
    }
    leafletLayers = [];
    ref = this.props.design.layerViews;
    for (index = j = 0, len = ref.length; j < len; index = ++j) {
      layerView = ref[index];
      layer = LayerFactory.createLayer(layerView.type);
      design = layer.cleanDesign(layerView.design, this.props.schema);
      if (layer.validateDesign(design, this.props.schema)) {
        continue;
      }
      leafletLayer = {
        tileUrl: this.props.mapUrlSource.getTileUrl(layerView.id, compiledFilters),
        utfGridUrl: this.props.mapUrlSource.getUtfGridUrl(layerView.id, compiledFilters),
        visible: layerView.visible,
        opacity: layerView.opacity,
        minZoom: layer.getMinZoom(design),
        maxZoom: layer.getMaxZoom(design),
        onGridClick: this.handleGridClick.bind(null, layer, design)
      };
      leafletLayers.push(leafletLayer);
    }
    return React.createElement(LeafletMapComponent, {
      initialBounds: this.props.design.bounds,
      baseLayerId: this.props.design.baseLayer,
      layers: leafletLayers,
      width: this.props.width,
      height: this.props.height,
      legend: this.renderLegend(),
      dragging: this.props.dragging,
      touchZoom: this.props.touchZoom,
      scrollWheelZoom: this.props.scrollWheelZoom,
      onBoundsChange: this.handleBoundsChange
    });
  };

  return MapViewComponent;

})(React.Component);
