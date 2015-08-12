var H, MapLayersDesignerComponent, React,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

module.exports = MapLayersDesignerComponent = (function(superClass) {
  extend(MapLayersDesignerComponent, superClass);

  function MapLayersDesignerComponent() {
    this.renderLayerView = bind(this.renderLayerView, this);
    this.renderLayerGearMenu = bind(this.renderLayerGearMenu, this);
    this.handleVisibleClick = bind(this.handleVisibleClick, this);
    this.handleAddLayerView = bind(this.handleAddLayerView, this);
    this.handleRemoveLayerView = bind(this.handleRemoveLayerView, this);
    this.handleBaseLayerChange = bind(this.handleBaseLayerChange, this);
    this.updateLayerView = bind(this.updateLayerView, this);
    return MapLayersDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  MapLayersDesignerComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func.isRequired
  };

  MapLayersDesignerComponent.prototype.updateDesign = function(changes) {
    var design;
    design = _.extend({}, this.props.design, changes);
    return this.props.onDesignChange(design);
  };

  MapLayersDesignerComponent.prototype.updateLayerView = function(index, changes) {
    var layerView, layerViews;
    layerView = this.props.design.layerViews[index];
    layerView = _.extend({}, layerView, changes);
    layerViews = this.props.design.layerViews.slice();
    layerViews[index] = layerView;
    return this.updateDesign({
      layerViews: layerViews
    });
  };

  MapLayersDesignerComponent.prototype.handleBaseLayerChange = function(baseLayer) {
    return this.updateDesign({
      baseLayer: baseLayer
    });
  };

  MapLayersDesignerComponent.prototype.handleRemoveLayerView = function(index) {
    var layerViews;
    layerViews = this.props.design.layerViews.slice();
    layerViews.splice(index, 1);
    return this.updateDesign({
      layerViews: layerViews
    });
  };

  MapLayersDesignerComponent.prototype.handleAddLayerView = function() {
    return alert("TO DO");
  };

  MapLayersDesignerComponent.prototype.handleVisibleClick = function(index) {
    var layerView;
    layerView = this.props.design.layerViews[index];
    return this.updateLayerView(index, {
      visible: !layerView.visible
    });
  };

  MapLayersDesignerComponent.prototype.renderLayerGearMenu = function(layer, index) {
    return H.div({
      className: "btn-group",
      style: {
        float: "right"
      },
      key: "gear"
    }, H.button({
      type: "button",
      className: "btn btn-link dropdown-toggle",
      "data-toggle": "dropdown"
    }, H.span({
      className: "glyphicon glyphicon-cog"
    })), H.ul({
      className: "dropdown-menu dropdown-menu-right"
    }, H.li({
      key: "edit"
    }, H.a(null, "Edit Layer")), H.li({
      key: "opacity"
    }, H.a(null, "Set Opacity")), H.li({
      key: "remove"
    }, H.a({
      onClick: this.handleRemoveLayerView.bind(null, index)
    }, "Remove Layer"))));
  };

  MapLayersDesignerComponent.prototype.renderLayerView = function(layer, index) {
    var visibleClass;
    visibleClass = layer.visible ? "mwater-visualization-layer checked" : "mwater-visualization-layer";
    return H.li({
      className: "list-group-item",
      key: layer.id
    }, this.renderLayerGearMenu(layer, index), H.div({
      className: visibleClass,
      onClick: this.handleVisibleClick.bind(null, index),
      key: "layer"
    }, layer.name));
  };

  MapLayersDesignerComponent.prototype.renderBaseLayer = function(id, name) {
    var className;
    className = "mwater-visualization-layer";
    if (id === this.props.design.baseLayer) {
      className += " checked";
    }
    return H.div({
      key: id,
      className: className,
      style: {
        display: "inline-block"
      },
      onClick: this.handleBaseLayerChange.bind(null, id)
    }, name);
  };

  MapLayersDesignerComponent.prototype.renderBaseLayers = function() {
    return H.div({
      style: {
        margin: 5,
        marginBottom: 10
      },
      key: "baseLayers"
    }, this.renderBaseLayer("bing_road", "Roads"), this.renderBaseLayer("bing_aerial", "Satellite"));
  };

  MapLayersDesignerComponent.prototype.render = function() {
    return H.div({
      style: {
        padding: 5
      }
    }, this.renderBaseLayers(), H.ul({
      className: "list-group"
    }, _.map(this.props.design.layerViews, this.renderLayerView)), H.div({
      style: {
        margin: 5
      },
      key: "addLayer"
    }, H.button({
      type: "button",
      className: "btn btn-default",
      onClick: this.handleAddLayerView
    }, H.span({
      className: "glyphicon glyphicon-plus"
    }), " Add Layer")));
  };

  return MapLayersDesignerComponent;

})(React.Component);
