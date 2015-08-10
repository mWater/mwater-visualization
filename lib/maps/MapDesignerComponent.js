var H, MapDesignerComponent, MapFiltersDesignerComponent, MapLayersDesignerComponent, React, TabbedComponent,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

TabbedComponent = require('../TabbedComponent');

MapLayersDesignerComponent = require('./MapLayersDesignerComponent');

MapFiltersDesignerComponent = require('./MapFiltersDesignerComponent');

module.exports = MapDesignerComponent = (function(superClass) {
  extend(MapDesignerComponent, superClass);

  function MapDesignerComponent() {
    return MapDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  MapDesignerComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    layerFactory: React.PropTypes.object.isRequired,
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func.isRequired
  };

  MapDesignerComponent.prototype.render = function() {
    var tabs;
    tabs = [
      {
        id: "layers",
        label: [
          H.span({
            className: "glyphicon glyphicon-align-justify"
          }), " Layers"
        ],
        elem: React.createElement(MapLayersDesignerComponent, {
          schema: this.props.schema,
          design: this.props.design,
          layerFactory: this.props.layerFactory,
          onDesignChange: this.props.onDesignChange
        })
      }, {
        id: "filters",
        label: [
          H.span({
            className: "glyphicon glyphicon-filter"
          }), " Filters"
        ],
        elem: React.createElement(MapFiltersDesignerComponent, {
          schema: this.props.schema,
          design: this.props.design,
          layerFactory: this.props.layerFactory,
          onDesignChange: this.props.onDesignChange
        })
      }, {
        id: "save",
        label: [
          H.span({
            className: "glyphicon glyphicon-saved"
          }), " Saved"
        ],
        elem: "LOAD/SAVE"
      }
    ];
    return React.createElement(TabbedComponent, {
      tabs: tabs,
      initialTabId: "layers"
    });
  };

  return MapDesignerComponent;

})(React.Component);
