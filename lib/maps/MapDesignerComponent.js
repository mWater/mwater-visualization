var H, MapConfigDesignerComponent, MapDesignerComponent, MapFiltersDesignerComponent, MapLayersDesignerComponent, React, TabbedComponent,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

React = require('react');

H = React.DOM;

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
          dataSource: this.props.dataSource,
          design: this.props.design,
          layerFactory: this.props.layerFactory,
          onDesignChange: this.props.onDesignChange
        })
      }, {
        id: "config",
        label: [
          H.span({
            className: "glyphicon glyphicon-cog"
          }), " Config"
        ],
        elem: React.createElement(MapConfigDesignerComponent, {
          schema: this.props.schema,
          design: this.props.design,
          layerFactory: this.props.layerFactory,
          onDesignChange: this.props.onDesignChange
        })
      }
    ];
    return React.createElement(TabbedComponent, {
      tabs: tabs,
      initialTabId: "layers"
    });
  };

  return MapDesignerComponent;

})(React.Component);

MapConfigDesignerComponent = (function(superClass) {
  extend(MapConfigDesignerComponent, superClass);

  function MapConfigDesignerComponent() {
    this.handleBaseLayerChange = bind(this.handleBaseLayerChange, this);
    return MapConfigDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  MapConfigDesignerComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func.isRequired
  };

  MapConfigDesignerComponent.prototype.updateDesign = function(changes) {
    var design;
    design = _.extend({}, this.props.design, changes);
    return this.props.onDesignChange(design);
  };

  MapConfigDesignerComponent.prototype.handleBaseLayerChange = function(baseLayer) {
    return this.updateDesign({
      baseLayer: baseLayer
    });
  };

  MapConfigDesignerComponent.prototype.renderBaseLayer = function(id, name) {
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

  MapConfigDesignerComponent.prototype.render = function() {
    return H.div({
      className: "form-group",
      style: {
        margin: 5
      }
    }, H.label({
      className: "text-muted"
    }, "Base Layer"), H.div({
      style: {
        marginLeft: 10
      }
    }, this.renderBaseLayer("bing_road", "Roads"), this.renderBaseLayer("bing_aerial", "Satellite")));
  };

  return MapConfigDesignerComponent;

})(React.Component);
