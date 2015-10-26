var DashboardPane, H, LayeredChart, LayeredChartDesignerComponent, React, ReactDOM, TestPane, dashboardDesign, visualization, visualization_mwater,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

ReactDOM = require('react-dom');

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
    this.state = {};
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
        var chart, design;
        if (err) {
          throw err;
        }
        chart = new LayeredChart({
          schema: results.schema,
          dataSource: results.dataSource
        });
        design = chart.cleanDesign({});
        return _this.setState({
          schema: results.schema,
          widgetFactory: results.widgetFactory,
          dataSource: results.dataSource,
          layerFactory: results.layerFactory,
          design: design
        });
      };
    })(this));
  };

  TestPane.prototype.handleDesignChange = function(design) {
    var chart;
    chart = new LayeredChart({
      schema: this.state.schema,
      dataSource: this.state.dataSource
    });
    this.setState({
      design: chart.cleanDesign(design)
    });
    return console.log(JSON.stringify(design, null, 2));
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
      titleElem: "Sample"
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
  }, H.style(null, 'html, body, #main { height: 100% }'), React.createElement(DashboardPane, {
    apiUrl: "https://api.mwater.co/v3/"
  }));
  return ReactDOM.render(sample, document.getElementById("main"));
});

dashboardDesign = {
  "items": {
    "e08ef8a3-34db-467d-ac78-f0f273d49f25": {
      "layout": {
        "x": 0,
        "y": 0,
        "w": 8,
        "h": 8
      },
      "widget": {
        "type": "Markdown",
        "design": {
          "markdown": "# Header 1\n## Header 2\n### Header 3\nText Text Text More Text\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        }
      }
    },
    "9d8df869-8869-4191-aa18-b58142f9c961": {
      "layout": {
        "x": 8,
        "y": 0,
        "w": 10,
        "h": 8
      },
      "widget": {
        "type": "LayeredChart",
        "design": {
          "version": 1,
          "layers": [
            {
              "axes": {
                "color": {
                  "expr": {
                    "type": "scalar",
                    "table": "entities.water_point",
                    "joins": [],
                    "expr": {
                      "type": "field",
                      "table": "entities.water_point",
                      "column": "type"
                    }
                  },
                  "xform": null
                },
                "y": {
                  "expr": {
                    "type": "scalar",
                    "table": "entities.water_point",
                    "expr": {
                      "type": "count",
                      "table": "entities.water_point"
                    },
                    "joins": []
                  },
                  "aggr": "count",
                  "xform": null
                }
              },
              "filter": null,
              "table": "entities.water_point"
            }
          ],
          "type": "donut"
        }
      }
    },
    "409d7b5b-e1d9-4e18-bd45-afdead7fe18f": {
      "layout": {
        "x": 0,
        "y": 8,
        "w": 18,
        "h": 8
      },
      "widget": {
        "type": "LayeredChart",
        "design": {
          "version": 1,
          "layers": [
            {
              "axes": {
                "x": {
                  "expr": {
                    "type": "scalar",
                    "table": "entities.news_item",
                    "joins": [],
                    "expr": {
                      "type": "field",
                      "table": "entities.news_item",
                      "column": "post_country"
                    }
                  },
                  "xform": null
                },
                "y": {
                  "expr": {
                    "type": "scalar",
                    "table": "entities.news_item",
                    "expr": {
                      "type": "count",
                      "table": "entities.news_item"
                    },
                    "joins": []
                  },
                  "aggr": "count",
                  "xform": null
                }
              },
              "filter": null,
              "table": "entities.news_item"
            }
          ],
          "type": "bar",
          "titleText": "Some Title"
        }
      }
    },
    "d41a2dd2-85bd-46d8-af9a-a650af4c0047": {
      "layout": {
        "x": 0,
        "y": 16,
        "w": 8,
        "h": 8
      },
      "widget": {
        "type": "TableChart",
        "design": {
          "version": 1,
          "columns": [
            {
              "textAxis": {
                "expr": {
                  "type": "scalar",
                  "table": "entities.water_point",
                  "joins": [],
                  "expr": {
                    "type": "field",
                    "table": "entities.water_point",
                    "column": "type"
                  }
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
          "orderings": [],
          "table": "entities.water_point",
          "titleText": "TEST"
        }
      }
    }
  }
};
