var DashboardPane, H, dashboardDesign, visualization, visualization_mwater,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

H = React.DOM;

visualization_mwater = require('./systems/mwater');

visualization = require('./index');

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
    return visualization_mwater.createSchema({
      apiUrl: this.props.apiUrl,
      client: this.props.client
    }, (function(_this) {
      return function(err, schema) {
        var dataSource, widgetFactory;
        if (err) {
          throw err;
        }
        dataSource = visualization_mwater.createDataSource(_this.props.apiUrl, _this.props.client);
        widgetFactory = new visualization.WidgetFactory(schema, dataSource);
        return _this.setState({
          widgetFactory: widgetFactory
        });
      };
    })(this));
  };

  DashboardPane.prototype.handleDesignChange = function(design) {
    this.setState({
      design: design
    });
    return console.log(JSON.stringify(design, null, 2));
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
      onDesignChange: this.handleDesignChange
    }));
  };

  return DashboardPane;

})(React.Component);

$(function() {
  var sample;
  sample = H.div({
    className: "container-fluid",
    style: {
      height: "100%"
    }
  }, H.style(null, 'html, body { height: 100% }'), React.createElement(DashboardPane, {
    apiUrl: "http://localhost:1234/v3/"
  }));
  return React.render(sample, document.body);
});

dashboardDesign = {
  "items": {
    "b854aa65-7644-4b67-b0a4-d2344e7eb43a": {
      "layout": {
        "x": 0,
        "y": 0,
        "w": 12,
        "h": 12
      },
      "widget": {
        "type": "LayeredChart",
        "design": {
          "type": "bar",
          "layers": [
            {
              "axes": {
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
                  "aggr": "count"
                },
                "x": {
                  "expr": {
                    "type": "scalar",
                    "table": "entities.water_point",
                    "joins": ["source_notes"],
                    "expr": {
                      "type": "count",
                      "table": "source_notes"
                    },
                    "aggr": "count"
                  }
                }
              },
              "filter": null,
              "table": "entities.water_point"
            }
          ]
        }
      }
    },
    "50cb2e15-3aed-43af-ba5f-fda8dc4e03fb": {
      "layout": {
        "x": 12,
        "y": 0,
        "w": 12,
        "h": 12
      },
      "widget": {
        "type": "TableChart",
        "design": {
          "columns": [
            {
              "textAxis": {
                "expr": {
                  "type": "field",
                  "table": "entities.water_point",
                  "column": "type"
                }
              }
            }, {
              "textAxis": {
                "expr": {
                  "type": "scalar",
                  "table": "entities.water_point",
                  "joins": [],
                  "expr": {
                    "type": "count",
                    "table": "entities.water_point"
                  }
                },
                "aggr": "count"
              }
            }
          ],
          "table": "entities.water_point"
        }
      }
    }
  }
};
