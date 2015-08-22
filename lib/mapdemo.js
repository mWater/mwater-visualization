var H, MapDemoComponent, addServerLayerView, design, layerViews, newLayers, uuid, visualization, visualization_mwater,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

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
    return visualization_mwater.createSchema({
      apiUrl: this.props.apiUrl,
      client: this.props.client
    }, (function(_this) {
      return function(err, schema) {
        var dataSource, layerFactory, widgetFactory;
        if (err) {
          throw err;
        }
        dataSource = visualization_mwater.createDataSource(_this.props.apiUrl, _this.props.client);
        widgetFactory = new visualization.WidgetFactory(schema, dataSource);
        layerFactory = new visualization.LayerFactory({
          schema: schema,
          apiUrl: _this.props.apiUrl,
          client: _this.props.client,
          newLayers: newLayers,
          onMarkerClick: function(table, id) {
            return alert(table + ":" + id);
          }
        });
        return _this.setState({
          schema: schema,
          widgetFactory: widgetFactory,
          dataSource: dataSource,
          layerFactory: layerFactory
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
  visible: true
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
    apiUrl: "http://localhost:1234/v3/"
  });
  return React.render(sample, document.body);
});
