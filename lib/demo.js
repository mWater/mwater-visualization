var DashboardPane, H, LayeredChart, LayeredChartDesignerComponent, TestPane, dashboardDesign, visualization, visualization_mwater,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

H = React.DOM;

visualization_mwater = require('./systems/mwater');

visualization = require('./index');

LayeredChart = require('./widgets/charts/LayeredChart');

LayeredChartDesignerComponent = require('./widgets/charts/LayeredChartDesignerComponent');

TestPane = (function(superClass) {
  extend(TestPane, superClass);

  function TestPane(props) {
    this.handleDesignChange = bind(this.handleDesignChange, this);
    TestPane.__super__.constructor.apply(this, arguments);
    this.state = {
      design: {
        layers: []
      }
    };
  }

  TestPane.prototype.componentDidMount = function() {
    return visualization_mwater.setup({
      apiUrl: this.props.apiUrl,
      client: this.props.client,
      onMarkerClick: (function(_this) {
        return function(table, id) {
          return alert(table + ":" + id);
        };
      })(this),
      newLayers: [
        {
          name: "Functional Status",
          type: "MWaterServer",
          design: {
            type: "functional_status",
            table: "entities.water_point"
          }
        }, {
          name: "Custom Layer",
          type: "Markers",
          design: {}
        }
      ],
      onFormTableSelect: function(id) {
        return alert(id);
      }
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

  TestPane.prototype.handleDesignChange = function(design) {
    return this.setState({
      design: design
    });
  };

  TestPane.prototype.render = function() {
    if (!this.state.widgetFactory) {
      return H.div(null, "Loading...");
    }
    return React.createElement(LayeredChartDesignerComponent, {
      design: this.state.design,
      schema: this.state.schema,
      dataSource: this.state.dataSource,
      onDesignChange: this.handleDesignChange
    });
  };

  return TestPane;

})(React.Component);

DashboardPane = (function(superClass) {
  extend(DashboardPane, superClass);

  function DashboardPane(props) {
    this.handleDesignChange = bind(this.handleDesignChange, this);
    DashboardPane.__super__.constructor.apply(this, arguments);
    this.state = {
      design: dashboardDesign
    };
  }

  DashboardPane.prototype.componentDidMount = function() {
    return visualization_mwater.setup({
      apiUrl: this.props.apiUrl,
      client: this.props.client,
      onMarkerClick: (function(_this) {
        return function(table, id) {
          return alert(table + ":" + id);
        };
      })(this),
      newLayers: [
        {
          name: "Functional Status",
          type: "MWaterServer",
          design: {
            type: "functional_status",
            table: "entities.water_point"
          }
        }, {
          name: "Custom Layer",
          type: "Markers",
          design: {}
        }
      ],
      onFormTableSelect: function(id) {
        return alert(id);
      }
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

  DashboardPane.prototype.handleDesignChange = function(design) {
    return this.setState({
      design: design
    });
  };

  DashboardPane.prototype.render = function() {
    if (!this.state.widgetFactory) {
      return H.div(null, "Loading...");
    }
    return H.div({
      style: {
        height: "100%"
      }
    }, React.createElement(visualization.DashboardComponent, {
      design: this.state.design,
      widgetFactory: this.state.widgetFactory,
      onDesignChange: this.handleDesignChange,
      titleElem: "Sample"
    }));
  };

  return DashboardPane;

})(React.Component);

$(function() {
  var FloatingWindowComponent, sample;
  FloatingWindowComponent = require('./FloatingWindowComponent');
  sample = H.div({
    className: "container-fluid",
    style: {
      height: "100%"
    }
  }, H.style(null, 'html, body { height: 100% }'), React.createElement(DashboardPane, {
    apiUrl: "https://api.mwater.co/v3/"
  }));
  return React.render(sample, document.body);
});

dashboardDesign = {
  "items": {
    "b854aa65-7644-4b67-b0a4-d2344e7eb43a": {
      "layout": {
        "x": 0,
        "y": 0,
        "w": 8,
        "h": 8
      },
      "widget": {
        "type": "LayeredChart",
        design: {
          "version": 1,
          "type": "line",
          "layers": [
            {
              "axes": {
                "x": {
                  "expr": {
                    "type": "scalar",
                    "table": "entities.water_point",
                    "joins": [],
                    "expr": {
                      "type": "field",
                      "table": "entities.water_point",
                      "column": "_created_on"
                    }
                  },
                  "xform": {
                    "type": "date"
                  }
                },
                "y": {
                  "expr": {
                    "type": "scalar",
                    "table": "entities.water_point",
                    "joins": [],
                    "expr": {
                      "type": "count",
                      "table": "entities.water_point"
                    }
                  },
                  "xform": null,
                  "aggr": "count"
                }
              },
              "filter": null,
              "table": "entities.water_point",
              "cumulative": true
            }
          ]
        }
      }
    }
  }
};
