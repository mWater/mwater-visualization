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
      formIds: [],
      onFormIdsChange: function(ids) {
        return alert(JSON.stringify(ids));
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
      onDesignChange: this.handleDesignChange,
      titleElem: "Hello!"
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
        "design": {
          "type": "donut",
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
                "color": {
                  "expr": {
                    "type": "scalar",
                    "table": "entities.water_point",
                    "joins": ["source_notes"],
                    "aggr": "last",
                    "expr": {
                      "type": "field",
                      "table": "source_notes",
                      "column": "status"
                    }
                  }
                }
              },
              "filter": null,
              "table": "entities.water_point"
            }
          ],
          "version": 1,
          "titleText": "Functional Status of Water Points"
        }
      }
    },
    "cd96f28e-3757-42b2-a00a-0fced38c92d5": {
      "layout": {
        "x": 8,
        "y": 0,
        "w": 8,
        "h": 8
      },
      "widget": {
        "type": "LayeredChart",
        "design": {
          "version": 1,
          "type": "bar",
          "layers": [
            {
              "axes": {
                "x": {
                  "expr": {
                    "type": "field",
                    "table": "entities.water_point",
                    "column": "type"
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
                  "aggr": "count"
                }
              },
              "filter": null,
              "table": "entities.water_point"
            }
          ],
          "transpose": true,
          "titleText": "Water Points by Type"
        }
      }
    },
    "3f4a1842-9c14-49fe-9e5d-4c19ae6ba6ec": {
      "layout": {
        "x": 0,
        "y": 8,
        "w": 11,
        "h": 7
      },
      "widget": {
        "type": "Map",
        "design": {
          "baseLayer": "bing_road",
          "layerViews": [],
          "filters": {},
          "bounds": {
            "w": 28.487548828125,
            "n": -0.06591795420830737,
            "e": 37.44140625,
            "s": -5.5941182188847876
          }
        }
      }
    },
    "353760a5-8976-418d-95cd-0d11ba4aa308": {
      "layout": {
        "x": 11,
        "y": 8,
        "w": 8,
        "h": 8
      },
      "widget": {
        "type": "Markdown",
        "design": {
          "markdown": "### Sample Dashboard\n\nText widgets can be freely mixed with maps, charts and tables. Charts are connected with each other so that clicking on a bar or slice will filter other views.\n"
        }
      }
    }
  }
};
