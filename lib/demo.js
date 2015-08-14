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
    return visualization_mwater.createSchema(this.props.apiUrl, null, null, null, (function(_this) {
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
      onDesignChange: this.handleDesignChange
    }));
  };

  return DashboardPane;

})(React.Component);

dashboardDesign = {
  "items": {
    "fc8d82bc-c485-4bc7-bc6d-b6c351f33813": {
      "layout": {
        "x": 0,
        "y": 0,
        "w": 12,
        "h": 12
      },
      "widget": {
        "type": "LayeredChart",
        "version": "0.0.0",
        "design": {
          "type": "pie",
          "layers": [
            {
              "xExpr": null,
              "yExpr": {
                "type": "scalar",
                "table": "entities.water_point",
                "joins": [],
                "expr": {
                  "type": "count",
                  "table": "entities.water_point"
                }
              },
              "colorExpr": {
                "type": "scalar",
                "table": "entities.water_point",
                "joins": [],
                "expr": {
                  "type": "field",
                  "table": "entities.water_point",
                  "column": "type"
                }
              },
              "filter": null,
              "table": "entities.water_point",
              "yAggr": "count"
            }
          ],
          "titleText": "Water Points by Type"
        }
      }
    },
    "34e1f95a-30f5-4d63-b90f-bd3d310db850": {
      "layout": {
        "x": 12,
        "y": 0,
        "w": 12,
        "h": 12
      },
      "widget": {
        "type": "LayeredChart",
        "version": "0.0.0",
        "design": {
          "type": "bar",
          "layers": [
            {
              "xExpr": {
                "type": "scalar",
                "table": "entities.water_point",
                "joins": ["source_notes"],
                "expr": {
                  "type": "field",
                  "table": "source_notes",
                  "column": "status"
                },
                "aggr": "last"
              },
              "yExpr": {
                "type": "scalar",
                "table": "entities.water_point",
                "joins": [],
                "expr": {
                  "type": "count",
                  "table": "entities.water_point"
                }
              },
              "colorExpr": null,
              "filter": null,
              "table": "entities.water_point",
              "yAggr": "count"
            }
          ],
          "titleText": "Water Points by Status",
          "transpose": false
        }
      }
    }
  }
};

$(function() {
  var sample;
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
