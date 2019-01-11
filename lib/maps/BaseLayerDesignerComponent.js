var BaseLayerDesignerComponent, PropTypes, R, Rcslider, React, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

R = React.createElement;

Rcslider = require('rc-slider')["default"];

module.exports = BaseLayerDesignerComponent = (function(superClass) {
  extend(BaseLayerDesignerComponent, superClass);

  function BaseLayerDesignerComponent() {
    this.handleOpacityChange = bind(this.handleOpacityChange, this);
    this.handleBaseLayerChange = bind(this.handleBaseLayerChange, this);
    return BaseLayerDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  BaseLayerDesignerComponent.propTypes = {
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func.isRequired
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
    return R('div', {
      key: id,
      className: className,
      style: {
        display: "inline-block"
      },
      onClick: this.handleBaseLayerChange.bind(null, id)
    }, name);
  };

  BaseLayerDesignerComponent.prototype.handleOpacityChange = function(newValue) {
    return this.updateDesign({
      baseLayerOpacity: newValue / 100
    });
  };

  BaseLayerDesignerComponent.prototype.renderOpacityControl = function() {
    var opacity;
    if (this.props.design.baseLayerOpacity != null) {
      opacity = this.props.design.baseLayerOpacity;
    } else {
      opacity = 1;
    }
    return R('div', {
      className: 'form-group',
      style: {
        paddingTop: 10
      }
    }, R('label', {
      className: 'text-muted'
    }, R('span', null, "Opacity: " + (Math.round(opacity * 100)) + "%")), R('div', {
      style: {
        padding: '10px'
      }
    }, React.createElement(Rcslider, {
      min: 0,
      max: 100,
      step: 1,
      tipTransitionName: "rc-slider-tooltip-zoom-down",
      value: opacity * 100,
      onChange: this.handleOpacityChange
    })));
  };

  BaseLayerDesignerComponent.prototype.render = function() {
    return R('div', {
      className: "form-group"
    }, R('label', {
      className: "text-muted"
    }, "Background Map"), R('div', {
      style: {
        marginLeft: 10
      }
    }, R('div', null, this.renderBaseLayer("cartodb_positron", "Light"), this.renderBaseLayer("cartodb_dark_matter", "Dark"), this.renderBaseLayer("bing_road", "Roads"), this.renderBaseLayer("bing_aerial", "Satellite"), this.renderBaseLayer("blank", "Blank")), this.renderOpacityControl()));
  };

  return BaseLayerDesignerComponent;

})(React.Component);
