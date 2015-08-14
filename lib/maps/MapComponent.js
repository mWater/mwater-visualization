var AutoSizeComponent, H, MapComponent, MapDesignerComponent, MapViewComponent, React,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

MapViewComponent = require('./MapViewComponent');

MapDesignerComponent = require('./MapDesignerComponent');

AutoSizeComponent = require('./../AutoSizeComponent');

module.exports = MapComponent = (function(superClass) {
  extend(MapComponent, superClass);

  function MapComponent() {
    return MapComponent.__super__.constructor.apply(this, arguments);
  }

  MapComponent.propTypes = {
    layerFactory: React.PropTypes.object.isRequired,
    schema: React.PropTypes.object.isRequired,
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func.isRequired
  };

  MapComponent.prototype.render = function() {
    return H.div({
      style: {
        width: "100%",
        height: "100%",
        position: "relative"
      }
    }, H.div({
      style: {
        position: "absolute",
        width: "70%",
        height: "100%"
      }
    }, React.createElement(AutoSizeComponent, {
      injectWidth: true,
      injectHeight: true
    }, React.createElement(MapViewComponent, {
      schema: this.props.schema,
      design: this.props.design,
      onDesignChange: this.props.onDesignChange,
      layerFactory: this.props.layerFactory
    }))), H.div({
      style: {
        position: "absolute",
        left: "70%",
        width: "30%",
        height: "100%",
        borderLeft: "solid 3px #AAA"
      }
    }, React.createElement(MapDesignerComponent, {
      schema: this.props.schema,
      design: this.props.design,
      onDesignChange: this.props.onDesignChange,
      layerFactory: this.props.layerFactory
    })));
  };

  return MapComponent;

})(React.Component);
