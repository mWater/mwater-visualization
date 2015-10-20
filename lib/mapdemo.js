var H, MapDemoComponent, React, ReactDOM, addServerLayerView, design, layerViews, newLayers, uuid, visualization, visualization_mwater,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

ReactDOM = require('react-dom');

H = React.DOM;

visualization_mwater = require('./systems/mwater');

visualization = require('./index');

uuid = require('node-uuid');

MapDemoComponent = (function(superClass) {
  extend(MapDemoComponent, superClass);

  function MapDemoComponent(props) {
    this.handleDesignChange = bind(this.handleDesignChange, this);
    MapDemoComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      design: this.props.initialDesign
    };
  }

  MapDemoComponent.prototype.componentDidMount = function() {
    return visualization_mwater.setup({
      apiUrl: this.props.apiUrl,
      client: this.props.client,
      onMarkerClick: (function(_this) {
        return function(table, id) {
          return alert(table + ":" + id);
        };
      })(this)
    }, (function(_this) {
      return function(err, results) {
        if (err) {
          throw err;
        }
        return _this.setState({
          schema: results.schema,
          widgetFactory: results.widgetFactory,
          dataSource: results.dataSource,
          layerFactory: results.layerFactory
        });
      };
    })(this));
  };

  MapDemoComponent.prototype.handleDesignChange = function(design) {
    this.setState({
      design: design
    });
    return console.log(JSON.stringify(design, null, 2));
  };

  MapDemoComponent.prototype.render = function() {
    if (!this.state.schema) {
      return H.div(null, "Loading...");
    }
    return H.div({
      style: {
        height: "100%"
      }
    }, H.style(null, 'html, body { height: 100% }'), React.createElement(visualization.MapComponent, {
      layerFactory: this.state.layerFactory,
      schema: this.state.schema,
      dataSource: this.state.dataSource,
      design: this.state.design,
      onDesignChange: this.handleDesignChange
    }));
  };

  return MapDemoComponent;

})(React.Component);

layerViews = [];

newLayers = [];

addServerLayerView = function(options) {
  newLayers.push({
    name: options.name,
    type: "MWaterServer",
    design: {
      type: options.type,
      table: "entities.water_point",
      minZoom: options.minZoom,
      maxZoom: options.maxZoom
    }
  });
  return layerViews.push({
    id: uuid.v4(),
    name: options.name,
    visible: options.visible === true,
    opacity: 1,
    type: "MWaterServer",
    group: options.group,
    design: {
      type: options.type,
      table: "entities.water_point",
      minZoom: options.minZoom,
      maxZoom: options.maxZoom
    }
  });
};

addServerLayerView({
  type: "safe_water_access",
  name: "Safe Water Access",
  group: "access",
  minZoom: 10
});

addServerLayerView({
  type: "water_access",
  name: "Functional Water Access",
  group: "access",
  minZoom: 10
});

addServerLayerView({
  type: "water_points_by_type",
  name: "Water Point Type",
  group: "points",
  visible: false
});

addServerLayerView({
  type: "functional_status",
  name: "Functionality",
  group: "points"
});

addServerLayerView({
  type: "ecoli_status",
  name: "E.Coli Level",
  group: "points"
});

newLayers.push({
  name: "Custom Layer",
  type: "Markers",
  design: {}
});

layerViews.push({
  "id": "9ff7edcd-1955-4986-b082-c5af71e4a089",
  "name": "Custom Layer",
  "desc": "",
  "type": "Markers",
  "design": {
    "sublayers": [
      {
        "axes": {
          "geometry": {
            "expr": {
              "type": "scalar",
              "table": "entities.water_point",
              "joins": [],
              "expr": {
                "type": "field",
                "table": "entities.water_point",
                "column": "location"
              }
            }
          }
        },
        "color": "#0088FF",
        "filter": null,
        "table": "entities.water_point"
      }
    ]
  },
  "visible": true,
  "opacity": 1
});

design = {
  baseLayer: "bing_road",
  layerViews: layerViews,
  filters: {},
  bounds: {
    w: 0,
    n: 0,
    e: 40,
    s: -25
  }
};

$(function() {
  var sample;
  sample = React.createElement(MapDemoComponent, {
    initialDesign: design,
    apiUrl: "https://api.mwater.co/v3/"
  });
  return ReactDOM.render(sample, document.body);
});
