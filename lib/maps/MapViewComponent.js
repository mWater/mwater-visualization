var ExpressionBuilder, ExpressionCompiler, H, LeafletMapComponent, MapViewComponent, React,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

LeafletMapComponent = require('./LeafletMapComponent');

ExpressionBuilder = require('../expressions/ExpressionBuilder');

ExpressionCompiler = require('../expressions/ExpressionCompiler');

module.exports = MapViewComponent = (function(superClass) {
  extend(MapViewComponent, superClass);

  function MapViewComponent() {
    this.handleBoundsChange = bind(this.handleBoundsChange, this);
    return MapViewComponent.__super__.constructor.apply(this, arguments);
  }

  MapViewComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    layerFactory: React.PropTypes.object.isRequired,
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func.isRequired
  };

  MapViewComponent.prototype.handleBoundsChange = function(bounds) {
    var design;
    design = _.extend({}, this.props.design, {
      bounds: bounds
    });
    return this.props.onDesignChange(design);
  };

  MapViewComponent.prototype.shouldComponentUpdate = function(prevProps) {
    if (_.isEqual(_.omit(this.props.design, "bounds"), _.omit(prevProps.design, "bounds"))) {
      return false;
    }
    return true;
  };

  MapViewComponent.prototype.renderLegend = function(layers) {
    var legendItems, style;
    legendItems = _.compact(_.map(layers, (function(_this) {
      return function(layer, i) {
        var layerView;
        layerView = _this.props.design.layerViews[i];
        if (layerView.visible) {
          return {
            key: layerView.id,
            legend: layer.getLegend()
          };
        }
      };
    })(this)));
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
        }, i > 0 ? H.br() : void 0, item.legend);
      };
    })(this)));
  };

  MapViewComponent.prototype.render = function() {
    var compiledFilters, exprBuilder, exprCompiler, filters, layers, leafletLayers;
    exprBuilder = new ExpressionBuilder(this.props.schema);
    filters = _.values(this.props.design.filters);
    filters = _.filter(filters, (function(_this) {
      return function(expr) {
        return !exprBuilder.validateExpr(expr);
      };
    })(this));
    exprCompiler = new ExpressionCompiler(this.props.schema);
    compiledFilters = _.map(filters, (function(_this) {
      return function(expr) {
        var jsonql, table;
        table = exprBuilder.getExprTable(expr);
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
    layers = _.map(this.props.design.layerViews, (function(_this) {
      return function(layerView) {
        return _this.props.layerFactory.createLayer(layerView.type, layerView.design);
      };
    })(this));
    leafletLayers = _.map(layers, (function(_this) {
      return function(layer, i) {
        return {
          tileUrl: layer.getTileUrl(compiledFilters),
          utfGridUrl: layer.getUtfGridUrl(compiledFilters),
          visible: _this.props.design.layerViews[i].visible,
          opacity: _this.props.design.layerViews[i].opacity,
          minZoom: layer.getMinZoom(),
          maxZoom: layer.getMaxZoom(),
          onGridClick: layer.onGridClick.bind(layer)
        };
      };
    })(this));
    return React.createElement(LeafletMapComponent, {
      initialBounds: this.props.design.bounds,
      baseLayerId: this.props.design.baseLayer,
      layers: leafletLayers,
      width: this.props.width,
      height: this.props.height,
      legend: this.renderLegend(layers),
      onBoundsChange: this.handleBoundsChange
    });
  };

  return MapViewComponent;

})(React.Component);
