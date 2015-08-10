var ExpressionBuilder, LeafletMapComponent, MapViewComponent, React,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

LeafletMapComponent = require('./LeafletMapComponent');

ExpressionBuilder = require('../expressions/ExpressionBuilder');

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

  MapViewComponent.prototype.render = function() {
    var exprBuilder, filters, layers;
    exprBuilder = new ExpressionBuilder(this.props.schema);
    filters = _.values(this.props.design.filters);
    filters = _.filter(filters, (function(_this) {
      return function(expr) {
        return !exprBuilder.validateExpr(expr);
      };
    })(this));
    layers = _.map(this.props.design.layerViews, (function(_this) {
      return function(layerView) {
        var layer;
        layer = _this.props.layerFactory.createLayer(layerView.layer.type, layerView.layer.design);
        return {
          tileUrl: layer.getTileUrl(filters),
          utfGridUrl: layer.getUtfGridUrl(filters),
          visible: layerView.visible,
          opacity: layerView.opacity
        };
      };
    })(this));
    return React.createElement(LeafletMapComponent, {
      initialBounds: this.props.design.bounds,
      baseLayerId: this.props.design.baseLayer,
      layers: layers,
      width: this.props.width,
      height: this.props.height,
      onBoundsChange: this.handleBoundsChange
    });
  };

  return MapViewComponent;

})(React.Component);
