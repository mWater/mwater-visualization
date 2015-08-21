var H, MapDemoComponent, addLegacyLayerView, design, layerViews, newLayers, visualization, visualization_mwater,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

H = React.DOM;

visualization_mwater = require('./systems/mwater');

visualization = require('./index');

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
          schema: _this.props.schema,
          apiUrl: _this.props.apiUrl,
          client: _this.props.client,
          newLayers: newLayers
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

addLegacyLayerView = function(id, name, visible) {
  newLayers.push({
    name: name,
    type: "MWaterServer",
    design: {
      type: id,
      table: "entities.water_point"
    }
  });
  return layerViews.push({
    id: id,
    name: name,
    visible: visible === true,
    opacity: 1,
    type: "MWaterServer",
    design: {
      type: id,
      table: "entities.water_point"
    }
  });
};

addLegacyLayerView("water_points_by_type", "Water Point Type", true);

addLegacyLayerView("functional_status", "Functionality");

addLegacyLayerView("ecoli_status", "E.Coli Level");

addLegacyLayerView("water_access", "Functional Water Access");

addLegacyLayerView("safe_water_access", "Safe Water Access");

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
