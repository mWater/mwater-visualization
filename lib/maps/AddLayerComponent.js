var AddLayerComponent, H, LayerFactory, PropTypes, R, React, _, uuid,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

uuid = require('uuid');

LayerFactory = require('./LayerFactory');

module.exports = AddLayerComponent = (function(superClass) {
  extend(AddLayerComponent, superClass);

  function AddLayerComponent() {
    this.handleAddLayerView = bind(this.handleAddLayerView, this);
    this.handleAddLayer = bind(this.handleAddLayer, this);
    return AddLayerComponent.__super__.constructor.apply(this, arguments);
  }

  AddLayerComponent.propTypes = {
    layerNumber: PropTypes.number.isRequired,
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func.isRequired,
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired
  };

  AddLayerComponent.contextTypes = {
    addLayerElementFactory: PropTypes.func
  };

  AddLayerComponent.prototype.handleAddLayer = function(newLayer) {
    var layer, layerView;
    layerView = {
      id: uuid(),
      name: newLayer.name,
      desc: "",
      type: newLayer.type,
      visible: true,
      opacity: 1
    };
    layer = LayerFactory.createLayer(layerView.type);
    layerView.design = layer.cleanDesign(newLayer.design, this.props.schema);
    return this.handleAddLayerView(layerView);
  };

  AddLayerComponent.prototype.handleAddLayerView = function(layerView) {
    var design, layerViews;
    layerViews = this.props.design.layerViews.slice();
    layerViews.push(layerView);
    design = _.extend({}, this.props.design, {
      layerViews: layerViews
    });
    return this.props.onDesignChange(design);
  };

  AddLayerComponent.prototype.render = function() {
    var newLayers;
    if (this.context.addLayerElementFactory) {
      return this.context.addLayerElementFactory(this.props);
    }
    newLayers = [
      {
        label: "Marker Layer",
        name: "Untitled Layer",
        type: "Markers",
        design: {}
      }, {
        label: "Radius (circles) Layer",
        name: "Untitled Layer",
        type: "Buffer",
        design: {}
      }, {
        label: "Choropleth Layer",
        name: "Untitled Layer",
        type: "AdminChoropleth",
        design: {}
      }, {
        label: "Cluster Layer",
        name: "Untitled Layer",
        type: "Cluster",
        design: {}
      }, {
        label: "Custom Tile Url (advanced)",
        name: "Untitled Layer",
        type: "TileUrl",
        design: {}
      }
    ];
    return H.div({
      style: {
        margin: 5
      },
      key: "addLayer",
      className: "btn-group"
    }, H.button({
      type: "button",
      "data-toggle": "dropdown",
      className: "btn btn-primary dropdown-toggle"
    }, H.span({
      className: "glyphicon glyphicon-plus"
    }), " Add Layer ", H.span({
      className: "caret"
    })), H.ul({
      className: "dropdown-menu"
    }, _.map(newLayers, (function(_this) {
      return function(layer, i) {
        return H.li({
          key: "" + i
        }, H.a({
          onClick: _this.handleAddLayer.bind(null, layer)
        }, layer.label || layer.name));
      };
    })(this))));
  };

  return AddLayerComponent;

})(React.Component);
