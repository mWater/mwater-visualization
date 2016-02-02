var CalendarChartViewComponent, DataSource, H, LayerFactory, LayeredChart, LayeredChartDesignerComponent, MWaterDashboardPane, MWaterDataSource, MWaterLoaderComponent, MWaterMapPane, MapPane, React, ReactDOM, Schema, WidgetFactory, dashboardDesign, mapDesign, visualization,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

ReactDOM = require('react-dom');

H = React.DOM;

Schema = require('mwater-expressions').Schema;

DataSource = require('mwater-expressions').DataSource;

visualization = require('./index');

LayeredChart = require('./widgets/charts/LayeredChart');

LayeredChartDesignerComponent = require('./widgets/charts/LayeredChartDesignerComponent');

LayerFactory = require('./maps/LayerFactory');

WidgetFactory = require('./widgets/WidgetFactory');

CalendarChartViewComponent = require('./widgets/charts/CalendarChartViewComponent');

MWaterLoaderComponent = require('./MWaterLoaderComponent');

MWaterDataSource = require('mwater-expressions/lib/MWaterDataSource');

MWaterDashboardPane = (function(superClass) {
  extend(MWaterDashboardPane, superClass);

  function MWaterDashboardPane(props) {
    this.handleDesignChange = bind(this.handleDesignChange, this);
    MWaterDashboardPane.__super__.constructor.apply(this, arguments);
    this.state = {
      design: dashboardDesign,
      formIds: []
    };
  }

  MWaterDashboardPane.prototype.handleDesignChange = function(design) {
    this.setState({
      design: design
    });
    return console.log(JSON.stringify(design, null, 2));
  };

  MWaterDashboardPane.prototype.render = function() {
    return React.createElement(MWaterLoaderComponent, {
      apiUrl: this.props.apiUrl,
      client: this.props.client,
      user: this.props.user,
      onFormIdsChange: (function(_this) {
        return function(formIds) {
          return _this.setState({
            formIds: formIds
          });
        };
      })(this),
      formIds: this.state.formIds
    }, (function(_this) {
      return function(error, config) {
        return H.div({
          style: {
            height: "100%"
          }
        }, React.createElement(visualization.DashboardComponent, {
          schema: config.schema,
          dataSource: config.dataSource,
          design: _this.state.design,
          widgetFactory: config.widgetFactory,
          onDesignChange: _this.handleDesignChange,
          titleElem: "Sample"
        }));
      };
    })(this));
  };

  return MWaterDashboardPane;

})(React.Component);

MWaterMapPane = (function(superClass) {
  extend(MWaterMapPane, superClass);

  function MWaterMapPane(props) {
    this.handleDesignChange = bind(this.handleDesignChange, this);
    MWaterMapPane.__super__.constructor.apply(this, arguments);
    this.state = {
      design: mapDesign,
      formIds: []
    };
  }

  MWaterMapPane.prototype.handleDesignChange = function(design) {
    this.setState({
      design: design
    });
    return console.log(JSON.stringify(design, null, 2));
  };

  MWaterMapPane.prototype.render = function() {
    return React.createElement(MWaterLoaderComponent, {
      apiUrl: this.props.apiUrl,
      client: this.props.client,
      user: this.props.user,
      onFormIdsChange: (function(_this) {
        return function(formIds) {
          return _this.setState({
            formIds: formIds
          });
        };
      })(this),
      formIds: this.state.formIds
    }, (function(_this) {
      return function(error, config) {
        return H.div({
          style: {
            height: "100%"
          }
        }, React.createElement(visualization.MapComponent, {
          schema: config.schema,
          dataSource: config.dataSource,
          design: _this.state.design,
          layerFactory: config.layerFactory,
          onDesignChange: _this.handleDesignChange,
          titleElem: "Sample"
        }));
      };
    })(this));
  };

  return MWaterMapPane;

})(React.Component);

MapPane = (function(superClass) {
  extend(MapPane, superClass);

  function MapPane(props) {
    this.handleDesignChange = bind(this.handleDesignChange, this);
    MapPane.__super__.constructor.apply(this, arguments);
    this.state = {
      schema: null,
      dataSource: null,
      design: mapDesign,
      layerFactory: null
    };
  }

  MapPane.prototype.componentDidMount = function() {
    return $.getJSON(this.props.apiUrl + "jsonql/schema", (function(_this) {
      return function(schemaJson) {
        var dataSource, layerFactory, schema;
        schema = new Schema(schemaJson);
        dataSource = new MWaterDataSource(_this.props.apiUrl, _this.props.client, {
          serverCaching: false,
          localCaching: true
        });
        layerFactory = new LayerFactory({
          schema: schema,
          dataSource: dataSource,
          apiUrl: _this.props.apiUrl,
          client: _this.props.client,
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
          onMarkerClick: function(table, id) {
            return alert(table + ":" + id);
          }
        });
        return _this.setState({
          schema: schema,
          dataSource: dataSource,
          layerFactory: layerFactory
        });
      };
    })(this));
  };

  MapPane.prototype.handleDesignChange = function(design) {
    this.setState({
      design: design
    });
    return console.log(JSON.stringify(design, null, 2));
  };

  MapPane.prototype.render = function() {
    return React.createElement(visualization.MapComponent, {
      layerFactory: this,
      schema: React.PropTypes.object.isRequired,
      dataSource: React.PropTypes.object.isRequired,
      design: React.PropTypes.object.isRequired,
      onDesignChange: React.PropTypes.func
    });
  };

  return MapPane;

})(React.Component);

$(function() {
  var sample;
  sample = H.div({
    className: "container-fluid",
    style: {
      height: "100%",
      paddingLeft: 0,
      paddingRight: 0
    }
  }, H.style(null, 'html, body, #main { height: 100% }'), React.createElement(MWaterMapPane, {
    apiUrl: "https://api.mwater.co/v3/",
    client: window.location.hash.substr(1)
  }));
  return ReactDOM.render(sample, document.getElementById("main"));
});

MWaterDataSource = (function(superClass) {
  extend(MWaterDataSource, superClass);

  function MWaterDataSource(apiUrl, client, caching) {
    if (caching == null) {
      caching = true;
    }
    this.apiUrl = apiUrl;
    this.client = client;
    this.caching = caching;
  }

  MWaterDataSource.prototype.performQuery = function(query, cb) {
    var headers, url;
    url = this.apiUrl + "jsonql?jsonql=" + encodeURIComponent(JSON.stringify(query));
    if (this.client) {
      url += "&client=" + this.client;
    }
    headers = {};
    if (!this.caching) {
      headers['Cache-Control'] = "no-cache";
    }
    return $.ajax({
      dataType: "json",
      url: url,
      headers: headers
    }).done((function(_this) {
      return function(rows) {
        return cb(null, rows);
      };
    })(this)).fail((function(_this) {
      return function(xhr) {
        return cb(new Error(xhr.responseText));
      };
    })(this));
  };

  return MWaterDataSource;

})(DataSource);

mapDesign = {
  "baseLayer": "bing_road",
  "layerViews": [
    {
      name: "Functional Status",
      type: "MWaterServer",
      design: {
        type: "functional_status",
        table: "entities.water_point"
      },
      visible: true
    }
  ],
  filters: {},
  bounds: {
    w: -40,
    n: 25,
    e: 40,
    s: -25
  }
};

dashboardDesign = {
  "items": {
    "d41a2dd2-85bd-46d8-af9a-a650af4c0047": {
      "layout": {
        "x": 16,
        "y": 0,
        "w": 8,
        "h": 6
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
                },
                "headerText": "This is a reallyyyyyyyyyy long title "
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
                "aggr": "count",
                "headerText": "This is a reallyyyyyyyyyy long title "
              }
            }, {
              "textAxis": {
                "expr": {
                  "type": "field",
                  "table": "entities.water_point",
                  "column": "desc"
                }
              },
              "headerText": "This is a reallyyyyyyyyyy long title "
            }
          ],
          "orderings": [],
          "table": "entities.water_point",
          "titleText": "TEST",
          "filter": {
            "type": "op",
            "table": "entities.water_point",
            "op": "=",
            "exprs": [
              {
                "type": "field",
                "table": "entities.water_point",
                "column": "code"
              }, {
                "type": "literal",
                "valueType": "text",
                "value": "10007"
              }
            ]
          }
        }
      }
    },
    "d2ea9c20-bcd3-46f6-8f78-ccb795d1a91a": {
      "layout": {
        "x": 0,
        "y": 0,
        "w": 8,
        "h": 8
      },
      "widget": {
        "type": "Map",
        "design": {
          "baseLayer": "bing_road",
          "layerViews": [
            {
              "id": "827187bf-a5fd-4d07-b34b-1e213407f96d",
              "name": "Custom Layer",
              "desc": "",
              "type": "Markers",
              "design": {
                "sublayers": [
                  {
                    "axes": {
                      "geometry": {
                        "expr": {
                          "type": "field",
                          "table": "entities.water_point",
                          "column": "location"
                        },
                        "xform": null
                      },
                      "color": {
                        "expr": {
                          "type": "field",
                          "table": "entities.water_point",
                          "column": "type"
                        },
                        "xform": null,
                        "colorMap": [
                          {
                            "value": "Protected dug well",
                            "color": "#d0021b"
                          }, {
                            "value": "Piped into dwelling",
                            "color": "#4a90e2"
                          }
                        ]
                      }
                    },
                    "color": "#0088FF",
                    "filter": null,
                    "table": "entities.water_point",
                    "symbol": "font-awesome/star"
                  }
                ]
              },
              "visible": true,
              "opacity": 1
            }
          ],
          "filters": {},
          "bounds": {
            "w": -103.7548828125,
            "n": 23.160563309048314,
            "e": -92.4169921875,
            "s": 12.382928338487408
          }
        }
      }
    },
    "9ef85e17-73aa-4b5f-8363-95f9a2e24193": {
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
          "layers": [
            {
              "axes": {
                "x": {
                  "expr": {
                    "type": "field",
                    "table": "entities.water_point",
                    "column": "type"
                  },
                  "xform": null
                },
                "y": {
                  "expr": {
                    "type": "id",
                    "table": "entities.water_point"
                  },
                  "aggr": "count",
                  "xform": null
                }
              },
              "filter": null,
              "table": "entities.water_point"
            }
          ],
          "type": "bar"
        }
      }
    }
  }
};
