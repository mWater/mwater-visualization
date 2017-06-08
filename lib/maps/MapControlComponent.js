var BaseLayerDesignerComponent, H, MapControlComponent, MapLayersDesignerComponent, PropTypes, R, React,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

React = require('react');

H = React.DOM;

R = React.createElement;

MapLayersDesignerComponent = require('./MapLayersDesignerComponent');

BaseLayerDesignerComponent = require('./BaseLayerDesignerComponent');

module.exports = MapControlComponent = (function(superClass) {
  extend(MapControlComponent, superClass);

  function MapControlComponent() {
    return MapControlComponent.__super__.constructor.apply(this, arguments);
  }

  MapControlComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func.isRequired
  };

  MapControlComponent.prototype.render = function() {
    return H.div({
      style: {
        padding: 5
      }
    }, R(MapLayersDesignerComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      design: this.props.design,
      onDesignChange: this.props.onDesignChange,
      allowEditingLayers: false
    }), H.br(), H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, "Map Style"), R(BaseLayerDesignerComponent, {
      design: this.props.design,
      onDesignChange: this.props.onDesignChange
    })));
  };

  return MapControlComponent;

})(React.Component);
