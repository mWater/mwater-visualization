var AxisBuilder, ExprCleaner, ExprCompiler, ExprUtils, H, Layer, LegendGroup, R, React, TileUrlLayer, TileUrlLayerDesignerComponent, _, injectTableAlias,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

Layer = require('./Layer');

ExprCompiler = require('mwater-expressions').ExprCompiler;

ExprUtils = require('mwater-expressions').ExprUtils;

injectTableAlias = require('mwater-expressions').injectTableAlias;

ExprCleaner = require('mwater-expressions').ExprCleaner;

ExprUtils = require('mwater-expressions').ExprUtils;

AxisBuilder = require('../axes/AxisBuilder');

LegendGroup = require('./LegendGroup');


/*
Layer that is a custom Leaflet-style url tile layer
Design is:
  tileUrl: Url with {s}, {z}, {x}, {y}
 */

module.exports = TileUrlLayer = (function(superClass) {
  extend(TileUrlLayer, superClass);

  function TileUrlLayer() {
    return TileUrlLayer.__super__.constructor.apply(this, arguments);
  }

  TileUrlLayer.prototype.getMinZoom = function(design) {
    return null;
  };

  TileUrlLayer.prototype.getMaxZoom = function(design) {
    return null;
  };

  TileUrlLayer.prototype.isEditable = function() {
    return true;
  };

  TileUrlLayer.prototype.isIncomplete = function(design, schema) {
    return this.validateDesign(this.cleanDesign(design, schema), schema) != null;
  };

  TileUrlLayer.prototype.createDesignerElement = function(options) {
    return R(TileUrlLayerDesignerComponent, {
      design: options.design,
      onDesignChange: options.onDesignChange
    });
  };

  TileUrlLayer.prototype.cleanDesign = function(design, schema) {
    return design;
  };

  TileUrlLayer.prototype.validateDesign = function(design, schema) {
    if (!design.tileUrl) {
      return "Missing Url";
    }
    return null;
  };

  return TileUrlLayer;

})(Layer);

TileUrlLayerDesignerComponent = (function(superClass) {
  extend(TileUrlLayerDesignerComponent, superClass);

  function TileUrlLayerDesignerComponent() {
    this.handleTileUrlChange = bind(this.handleTileUrlChange, this);
    return TileUrlLayerDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  TileUrlLayerDesignerComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func.isRequired
  };

  TileUrlLayerDesignerComponent.prototype.handleTileUrlChange = function(ev) {
    return this.props.onDesignChange(_.extend({}, this.props.design, {
      tileUrl: ev.target.value
    }));
  };

  TileUrlLayerDesignerComponent.prototype.render = function() {
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, "Url (containing {z}, {x} and {y})"), H.input({
      type: "text",
      className: "form-control",
      value: this.props.design.tileUrl || "",
      onChange: this.handleTileUrlChange
    }));
  };

  return TileUrlLayerDesignerComponent;

})(React.Component);
