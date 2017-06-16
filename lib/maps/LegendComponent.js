var H, LayerFactory, LegendComponent, PropTypes, R, React, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

LayerFactory = require('./LayerFactory');

module.exports = LegendComponent = (function(superClass) {
  extend(LegendComponent, superClass);

  function LegendComponent() {
    return LegendComponent.__super__.constructor.apply(this, arguments);
  }

  LegendComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    layerViews: PropTypes.array.isRequired,
    zoom: PropTypes.number
  };

  LegendComponent.prototype.render = function() {
    var legendItems, style;
    legendItems = _.compact(_.map(this.props.layerViews, (function(_this) {
      return function(layerView) {
        var design, layer, maxZoom, minZoom;
        layer = LayerFactory.createLayer(layerView.type);
        design = layer.cleanDesign(layerView.design, _this.props.schema);
        if (layer.validateDesign(design, _this.props.schema)) {
          return null;
        }
        if (!layerView.visible) {
          return null;
        }
        minZoom = layer.getMinZoom(design);
        maxZoom = layer.getMaxZoom(design);
        if ((minZoom != null) && (_this.props.zoom != null) && _this.props.zoom < minZoom) {
          return null;
        }
        if ((maxZoom != null) && (_this.props.zoom != null) && _this.props.zoom > maxZoom) {
          return null;
        }
        return {
          key: layerView.id,
          legend: layer.getLegend(design, _this.props.schema, layerView.name)
        };
      };
    })(this)));
    if (legendItems.length === 0) {
      return null;
    }
    style = {
      padding: 7,
      background: "rgba(255,255,255,0.8)",
      boxShadow: "0 0 15px rgba(0,0,0,0.2)",
      borderRadius: 5,
      position: 'absolute',
      right: 10,
      bottom: 35,
      maxHeight: '85%',
      overflowY: 'auto',
      zIndex: 1000,
      fontSize: 12
    };
    return H.div({
      style: style
    }, _.map(legendItems, (function(_this) {
      return function(item, i) {
        return [
          H.div({
            key: item.key
          }, item.legend)
        ];
      };
    })(this)));
  };

  return LegendComponent;

})(React.Component);
