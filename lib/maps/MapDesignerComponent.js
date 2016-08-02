var BaseLayerDesignerComponent, H, MapDesignerComponent, MapFiltersDesignerComponent, MapLayersDesignerComponent, R, React, TabbedComponent,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

React = require('react');

H = React.DOM;

R = React.createElement;

TabbedComponent = require('react-library/lib/TabbedComponent');

MapLayersDesignerComponent = require('./MapLayersDesignerComponent');

MapFiltersDesignerComponent = require('./MapFiltersDesignerComponent');

module.exports = MapDesignerComponent = (function(superClass) {
  extend(MapDesignerComponent, superClass);

  function MapDesignerComponent() {
    return MapDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  MapDesignerComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func.isRequired
  };

  MapDesignerComponent.prototype.render = function() {
    return H.div({
      style: {
        padding: 5
      }
    }, H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, "Map Style"), R(BaseLayerDesignerComponent, {
      schema: this.props.schema,
      design: this.props.design,
      onDesignChange: this.props.onDesignChange
    })), H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, "Layers"), R(MapLayersDesignerComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      design: this.props.design,
      onDesignChange: this.props.onDesignChange
    })), H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, "Filters"), H.p({
      className: "help-block"
    }, "Optionally filter all data on the map"), R(MapFiltersDesignerComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      design: this.props.design,
      onDesignChange: this.props.onDesignChange
    })));
  };

  return MapDesignerComponent;

})(React.Component);

BaseLayerDesignerComponent = (function(superClass) {
  extend(BaseLayerDesignerComponent, superClass);

  function BaseLayerDesignerComponent() {
    this.handleBaseLayerChange = bind(this.handleBaseLayerChange, this);
    return BaseLayerDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  BaseLayerDesignerComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func.isRequired
  };

  BaseLayerDesignerComponent.prototype.updateDesign = function(changes) {
    var design;
    design = _.extend({}, this.props.design, changes);
    return this.props.onDesignChange(design);
  };

  BaseLayerDesignerComponent.prototype.handleBaseLayerChange = function(baseLayer) {
    return this.updateDesign({
      baseLayer: baseLayer
    });
  };

  BaseLayerDesignerComponent.prototype.renderBaseLayer = function(id, name) {
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

  BaseLayerDesignerComponent.prototype.render = function() {
    return H.div({
      style: {
        marginLeft: 10
      }
    }, this.renderBaseLayer("bing_road", "Roads"), this.renderBaseLayer("bing_aerial", "Satellite"), this.renderBaseLayer("cartodb_positron", "Light"), this.renderBaseLayer("cartodb_dark_matter", "Dark"));
  };

  return BaseLayerDesignerComponent;

})(React.Component);
