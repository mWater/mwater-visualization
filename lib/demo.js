var AutoSizeComponent, CalendarChartViewComponent, DataSource, DirectDashboardDataSource, DirectMapDataSource, H, LayeredChart, LayeredChartDesignerComponent, MWaterDashboardPane, MWaterDataSource, MWaterDatagridDesignerPane, MWaterDatagridPane, MWaterDirectDashboardPane, MWaterDirectMapPane, MWaterLoaderComponent, MWaterMapPane, React, ReactDOM, Schema, ServerDashboardDataSource, ServerMapDataSource, dashboardDesign, dashboardId, datagridDesign, design, imageWidgetDashboardDesign, mapDesign, mapId, querystring, rosterDatagridDesign, share, visualization,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

ReactDOM = require('react-dom');

H = React.DOM;

querystring = require('querystring');

Schema = require('mwater-expressions').Schema;

DataSource = require('mwater-expressions').DataSource;

visualization = require('./index');

LayeredChart = require('./widgets/charts/LayeredChart');

LayeredChartDesignerComponent = require('./widgets/charts/LayeredChartDesignerComponent');

CalendarChartViewComponent = require('./widgets/charts/CalendarChartViewComponent');

MWaterLoaderComponent = require('./MWaterLoaderComponent');

MWaterDataSource = require('mwater-expressions/lib/MWaterDataSource');

AutoSizeComponent = require('react-library/lib/AutoSizeComponent');

DirectDashboardDataSource = require('./dashboards/DirectDashboardDataSource');

DirectMapDataSource = require('./maps/DirectMapDataSource');

ServerMapDataSource = require('./maps/ServerMapDataSource');

ServerDashboardDataSource = require('./dashboards/ServerDashboardDataSource');

dashboardId = "366702069dba44249d14bfccaa2d333e";

MWaterDashboardPane = (function(superClass) {
  extend(MWaterDashboardPane, superClass);

  function MWaterDashboardPane(props) {
    this.handleDesignChange = bind(this.handleDesignChange, this);
    MWaterDashboardPane.__super__.constructor.apply(this, arguments);
    this.state = {
      design: null,
      extraTables: []
    };
  }

  MWaterDashboardPane.prototype.componentWillMount = function() {
    var url;
    url = this.props.apiUrl + ("dashboards/" + dashboardId + "?") + querystring.stringify({
      client: this.props.client,
      share: this.props.share
    });
    return $.getJSON(url, (function(_this) {
      return function(dashboard) {
        return _this.setState({
          design: dashboard.design,
          extraTables: dashboard.extra_tables
        });
      };
    })(this));
  };

  MWaterDashboardPane.prototype.handleDesignChange = function(design) {};

  MWaterDashboardPane.prototype.render = function() {
    if (!this.state.design) {
      return H.div(null, "Loading...");
    }
    return React.createElement(MWaterLoaderComponent, {
      apiUrl: this.props.apiUrl,
      client: this.props.client,
      user: this.props.user,
      onExtraTablesChange: (function(_this) {
        return function(extraTables) {
          return _this.setState({
            extraTables: extraTables
          });
        };
      })(this),
      extraTables: this.state.extraTables
    }, (function(_this) {
      return function(error, config) {
        var dashboardDataSource;
        dashboardDataSource = new ServerDashboardDataSource({
          apiUrl: _this.props.apiUrl,
          client: _this.props.client,
          share: share,
          dashboardId: dashboardId
        });
        return H.div({
          style: {
            height: "100%"
          }
        }, React.createElement(visualization.DashboardComponent, {
          schema: config.schema,
          dataSource: config.dataSource,
          dashboardDataSource: dashboardDataSource,
          design: _this.state.design,
          onDesignChange: _this.handleDesignChange,
          titleElem: "Sample"
        }));
      };
    })(this));
  };

  return MWaterDashboardPane;

})(React.Component);

design = {
  "items": {
    "id": "root",
    "type": "root",
    "blocks": [
      {
        "type": "widget",
        "widgetType": "Text",
        "design": {
          "style": "title",
          "items": ["The Water Situation"]
        },
        "id": "2fb6f7f9-212f-4488-abb6-9662eacc879f"
      }, {
        "type": "widget",
        "widgetType": "Text",
        "design": {
          "items": [
            "We have ", {
              "type": "expr",
              "id": "b0e56d85-7999-4dfa-84ac-a4f6b4878f53",
              "expr": {
                "type": "op",
                "op": "count",
                "table": "entities.water_point",
                "exprs": []
              }
            }, " water points in mWater. Of these, ", {
              "type": "expr",
              "id": "9accfd63-7ae9-4e8e-a784-dfc259977d4c",
              "expr": {
                "type": "op",
                "table": "entities.water_point",
                "op": "count where",
                "exprs": [
                  {
                    "type": "op",
                    "table": "entities.water_point",
                    "op": "= any",
                    "exprs": [
                      {
                        "type": "field",
                        "table": "entities.water_point",
                        "column": "type"
                      }, {
                        "type": "literal",
                        "valueType": "enumset",
                        "value": ["Protected dug well", "Unprotected dug well"]
                      }
                    ]
                  }
                ]
              }
            }, " are dug wells!"
          ]
        },
        "id": "09c8981b-3869-410d-bd90-4a5a012314a8"
      }, {
        "id": "bc90d763-5429-40bc-b76b-b0d3868d7cfc",
        "type": "horizontal",
        "blocks": [
          {
            "type": "widget",
            "aspectRatio": 1.4,
            "widgetType": "Image",
            "design": {
              "imageUrl": null,
              "uid": null,
              "expr": {
                "type": "field",
                "table": "entities.community",
                "column": "photos"
              }
            },
            "id": "e5360947-b1f6-4d85-8b07-8e15f3ef6d33"
          }, {
            "type": "widget",
            "aspectRatio": 1.4,
            "widgetType": "LayeredChart",
            "design": {
              "version": 2,
              "layers": [
                {
                  "axes": {
                    "x": {
                      "expr": {
                        "type": "field",
                        "table": "entities.water_point",
                        "column": "_created_on"
                      },
                      "xform": {
                        "type": "yearmonth"
                      }
                    },
                    "y": {
                      "expr": {
                        "type": "op",
                        "op": "count",
                        "table": "entities.water_point",
                        "exprs": []
                      },
                      "xform": null
                    }
                  },
                  "filter": {
                    "type": "op",
                    "table": "entities.water_point",
                    "op": "thisyear",
                    "exprs": [
                      {
                        "type": "field",
                        "table": "entities.water_point",
                        "column": "_created_on"
                      }
                    ]
                  },
                  "table": "entities.water_point",
                  "cumulative": false
                }
              ],
              "type": "bar",
              "titleText": "Water points added by month 2016"
            },
            "id": "906863e8-3b03-4b6c-b70f-f4cd4adc002b"
          }
        ]
      }
    ]
  },
  "layout": "blocks",
  style: "greybg"
};

MWaterDirectDashboardPane = (function(superClass) {
  extend(MWaterDirectDashboardPane, superClass);

  function MWaterDirectDashboardPane(props) {
    this.handleDesignChange = bind(this.handleDesignChange, this);
    MWaterDirectDashboardPane.__super__.constructor.apply(this, arguments);
    this.state = {
      design: design,
      extraTables: []
    };
  }

  MWaterDirectDashboardPane.prototype.handleDesignChange = function(design) {
    this.setState({
      design: design
    });
    return console.log(JSON.stringify(design, null, 2));
  };

  MWaterDirectDashboardPane.prototype.render = function() {
    return React.createElement(MWaterLoaderComponent, {
      apiUrl: this.props.apiUrl,
      client: this.props.client,
      user: this.props.user,
      onExtraTablesChange: (function(_this) {
        return function(extraTables) {
          return _this.setState({
            extraTables: extraTables
          });
        };
      })(this),
      extraTables: this.state.extraTables
    }, (function(_this) {
      return function(error, config) {
        var dashboardDataSource;
        if (error) {
          alert("Error: " + error.message);
          return null;
        }
        dashboardDataSource = new DirectDashboardDataSource({
          apiUrl: _this.props.apiUrl,
          client: _this.props.client,
          design: _this.state.design,
          schema: config.schema,
          dataSource: config.dataSource
        });
        return H.div({
          style: {
            height: "100%"
          }
        }, React.createElement(visualization.DashboardComponent, {
          schema: config.schema,
          dataSource: config.dataSource,
          dashboardDataSource: dashboardDataSource,
          design: _this.state.design,
          onDesignChange: _this.handleDesignChange,
          titleElem: "Sample"
        }));
      };
    })(this));
  };

  return MWaterDirectDashboardPane;

})(React.Component);

mapId = "ed291fa35f994c0094aba62b57ac004c";

share = "testshareid";

MWaterMapPane = (function(superClass) {
  extend(MWaterMapPane, superClass);

  function MWaterMapPane(props) {
    this.handleDesignChange = bind(this.handleDesignChange, this);
    MWaterMapPane.__super__.constructor.apply(this, arguments);
    this.state = {
      design: null,
      extraTables: []
    };
  }

  MWaterMapPane.prototype.componentWillMount = function() {
    var url;
    url = this.props.apiUrl + ("maps/" + mapId + "?") + querystring.stringify({
      client: this.props.client,
      share: share
    });
    return $.getJSON(url, (function(_this) {
      return function(map) {
        return _this.setState({
          design: map.design,
          extraTables: map.extra_tables
        });
      };
    })(this));
  };

  MWaterMapPane.prototype.handleDesignChange = function(design) {
    this.setState({
      design: design
    });
    return console.log(JSON.stringify(design, null, 2));
  };

  MWaterMapPane.prototype.render = function() {
    if (!this.state.design) {
      return H.div(null, "Loading...");
    }
    return React.createElement(MWaterLoaderComponent, {
      apiUrl: this.props.apiUrl,
      client: this.props.client,
      share: share,
      user: this.props.user,
      extraTables: this.state.extraTables,
      onExtraTablesChange: (function(_this) {
        return function(extraTables) {
          return _this.setState({
            extraTables: extraTables
          });
        };
      })(this)
    }, (function(_this) {
      return function(error, config) {
        var mapDataSource;
        mapDataSource = new ServerMapDataSource({
          apiUrl: _this.props.apiUrl,
          client: _this.props.client,
          share: share,
          mapId: mapId
        });
        return H.div({
          style: {
            height: "100%"
          }
        }, React.createElement(visualization.MapComponent, {
          schema: config.schema,
          dataSource: config.dataSource,
          design: _this.state.design,
          mapDataSource: mapDataSource,
          onDesignChange: _this.handleDesignChange,
          onRowClick: function(tableId, rowId) {
            return alert(tableId + ":" + rowId);
          },
          titleElem: "Sample"
        }));
      };
    })(this));
  };

  return MWaterMapPane;

})(React.Component);

MWaterDirectMapPane = (function(superClass) {
  extend(MWaterDirectMapPane, superClass);

  function MWaterDirectMapPane(props) {
    this.handleDesignChange = bind(this.handleDesignChange, this);
    MWaterDirectMapPane.__super__.constructor.apply(this, arguments);
    this.state = {
      design: mapDesign,
      extraTables: []
    };
  }

  MWaterDirectMapPane.prototype.handleDesignChange = function(design) {
    this.setState({
      design: design
    });
    return console.log(JSON.stringify(design, null, 2));
  };

  MWaterDirectMapPane.prototype.render = function() {
    return React.createElement(MWaterLoaderComponent, {
      apiUrl: this.props.apiUrl,
      client: this.props.client,
      user: this.props.user,
      extraTables: this.state.extraTables,
      onExtraTablesChange: (function(_this) {
        return function(extraTables) {
          return _this.setState({
            extraTables: extraTables
          });
        };
      })(this)
    }, (function(_this) {
      return function(error, config) {
        var mapDataSource;
        mapDataSource = new DirectMapDataSource({
          apiUrl: _this.props.apiUrl,
          client: _this.props.client,
          schema: config.schema,
          mapDesign: _this.state.design
        });
        return H.div({
          style: {
            height: "100%"
          }
        }, React.createElement(visualization.MapComponent, {
          schema: config.schema,
          dataSource: config.dataSource,
          design: _this.state.design,
          mapDataSource: mapDataSource,
          onDesignChange: _this.handleDesignChange,
          titleElem: "Sample"
        }));
      };
    })(this));
  };

  return MWaterDirectMapPane;

})(React.Component);

MWaterDatagridDesignerPane = (function(superClass) {
  extend(MWaterDatagridDesignerPane, superClass);

  function MWaterDatagridDesignerPane(props) {
    this.handleDesignChange = bind(this.handleDesignChange, this);
    MWaterDatagridDesignerPane.__super__.constructor.apply(this, arguments);
    this.state = {
      design: {},
      extraTables: []
    };
  }

  MWaterDatagridDesignerPane.prototype.handleDesignChange = function(design) {
    this.setState({
      design: design
    });
    return console.log(JSON.stringify(design, null, 2));
  };

  MWaterDatagridDesignerPane.prototype.render = function() {
    return React.createElement(MWaterLoaderComponent, {
      apiUrl: this.props.apiUrl,
      client: this.props.client,
      user: this.props.user,
      onExtraTablesChange: (function(_this) {
        return function(extraTables) {
          return _this.setState({
            extraTables: extraTables
          });
        };
      })(this),
      extraTables: this.state.extraTables
    }, (function(_this) {
      return function(error, config) {
        return H.div({
          style: {
            height: "100%"
          }
        }, React.createElement(visualization.DatagridDesignerComponent, {
          schema: config.schema,
          dataSource: config.dataSource,
          design: _this.state.design,
          onDesignChange: _this.handleDesignChange
        }));
      };
    })(this));
  };

  return MWaterDatagridDesignerPane;

})(React.Component);

MWaterDatagridPane = (function(superClass) {
  extend(MWaterDatagridPane, superClass);

  function MWaterDatagridPane(props) {
    this.handleDesignChange = bind(this.handleDesignChange, this);
    MWaterDatagridPane.__super__.constructor.apply(this, arguments);
    this.state = {
      design: rosterDatagridDesign,
      extraTables: ["responses:3aee880e079a417ea51d388d95217edf"]
    };
  }

  MWaterDatagridPane.prototype.handleDesignChange = function(design) {
    this.setState({
      design: design
    });
    return console.log(JSON.stringify(design, null, 2));
  };

  MWaterDatagridPane.prototype.render = function() {
    return React.createElement(MWaterLoaderComponent, {
      apiUrl: this.props.apiUrl,
      client: this.props.client,
      user: this.props.user,
      onExtraTablesChange: (function(_this) {
        return function(extraTables) {
          return _this.setState({
            extraTables: extraTables
          });
        };
      })(this),
      extraTables: this.state.extraTables
    }, (function(_this) {
      return function(error, config) {
        return H.div({
          style: {
            height: "100%"
          }
        }, React.createElement(AutoSizeComponent, {
          injectWidth: true,
          injectHeight: true
        }, function(size) {
          return React.createElement(visualization.DatagridComponent, {
            width: size.width,
            height: size.height,
            schema: config.schema,
            dataSource: config.dataSource,
            design: _this.state.design,
            onDesignChange: _this.handleDesignChange,
            canEditCell: function(tableId, rowId, expr, callback) {
              return callback(null, true);
            },
            updateCell: function(tableId, rowId, expr, value, callback) {
              console.log(value);
              return setTimeout(function() {
                return callback(null);
              });
            },
            500: 500
          });
        }));
      };
    })(this));
  };

  return MWaterDatagridPane;

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
  }, H.style(null, 'html, body, #main { height: 100% }'), React.createElement(MWaterDirectDashboardPane, {
    apiUrl: "https://api.mwater.co/v3/",
    client: window.location.hash.substr(1)
  }));
  return ReactDOM.render(sample, document.getElementById("main"));
});

datagridDesign = {
  "table": "entities.water_point",
  "columns": [
    {
      "id": "5859b3fc-64f0-42c1-a035-9dffbfd13132",
      "type": "expr",
      "width": 150,
      "expr": {
        "type": "field",
        "table": "entities.water_point",
        "column": "code"
      }
    }, {
      "id": "a2c21f4f-2f15-4d11-b2cc-eba8c85e0bbb",
      "type": "expr",
      "width": 150,
      "expr": {
        "type": "field",
        "table": "entities.water_point",
        "column": "desc"
      }
    }, {
      "id": "4162d2d4-c8d0-4e13-8075-7e42f44e57c2",
      "type": "expr",
      "width": 150,
      "expr": {
        "type": "field",
        "table": "entities.water_point",
        "column": "location"
      }
    }, {
      "id": "d5bb43c5-5666-43d9-aef5-3b20fe0d8eee",
      "type": "expr",
      "width": 150,
      "expr": {
        "type": "field",
        "table": "entities.water_point",
        "column": "location_accuracy"
      }
    }, {
      "id": "220f48a7-565f-4374-b42d-eed32a799421",
      "type": "expr",
      "width": 150,
      "expr": {
        "type": "field",
        "table": "entities.water_point",
        "column": "location_altitude"
      }
    }, {
      "id": "dcab1083-a60f-4def-bd7d-de4c9dff4945",
      "type": "expr",
      "width": 150,
      "expr": {
        "type": "field",
        "table": "entities.water_point",
        "column": "name"
      }
    }, {
      "id": "34671083-a60f-4def-bd7d-de4c9dff4945",
      "type": "expr",
      "width": 150,
      "expr": {
        "type": "field",
        "table": "entities.water_point",
        "column": "type"
      }
    }, {
      "id": "3e53e5f9-149d-4a69-8e90-a18a19efc843",
      "type": "expr",
      "width": 150,
      "expr": {
        "type": "field",
        "table": "entities.water_point",
        "column": "photos"
      }
    }, {
      "id": "aea0a8fd-1470-46ea-93e8-939b0797b0f6",
      "type": "expr",
      "width": 150,
      "expr": {
        "type": "field",
        "table": "entities.water_point",
        "column": "_created_by"
      }
    }, {
      "id": "918804c5-769e-4e4a-aacf-762d4474eb61",
      "type": "expr",
      "width": 150,
      "expr": {
        "type": "field",
        "table": "entities.water_point",
        "column": "_created_on"
      }
    }
  ]
};

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
  "baseLayer": "cartodb_positron",
  "layerViews": [],
  "filters": {},
  "bounds": {
    "w": 10.590820312499998,
    "n": 15.241789855961722,
    "e": 41.4404296875,
    "s": -27.33273513685913
  }
};

imageWidgetDashboardDesign = {
  "items": {
    "3f8ffda5-79c4-423d-95f3-152b94bba6d4": {
      "layout": {
        "x": 0,
        "y": 0,
        "w": 9,
        "h": 7
      },
      "widget": {
        "type": "Image",
        "design": {
          "uid": "cfce4760503a422d88da67ef55b1e82b",
          "imageUrl": null,
          "expr": null
        }
      }
    }
  }
};

dashboardDesign = {
  "items": {
    "c83b1d83-bc2b-4c87-a7fc-2e4bcd7694d8": {
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
              "id": "53c9d731-dbe6-4987-b0ef-434a944b26b5",
              "name": "Water points",
              "desc": "",
              "type": "Markers",
              "visible": true,
              "opacity": 1,
              "design": {
                "axes": {
                  "geometry": {
                    "expr": {
                      "type": "field",
                      "table": "entities.water_point",
                      "column": "location"
                    }
                  },
                  "color": {
                    "expr": {
                      "type": "field",
                      "table": "entities.water_point",
                      "column": "drilling_method"
                    },
                    "colorMap": [
                      {
                        "value": "manual",
                        "color": "#d49097"
                      }, {
                        "value": "mechanical",
                        "color": "#a9424c"
                      }, {
                        "value": "other",
                        "color": "#542126"
                      }
                    ]
                  }
                },
                "color": "#0088FF",
                "filter": null,
                "table": "entities.water_point",
                "symbol": "font-awesome/star"
              }
            }, {
              "id": "53c9d731-dbe6-4987-b0ef-434a944b26a5",
              "name": "Schools",
              "desc": "",
              "type": "Markers",
              "visible": true,
              "opacity": 1,
              "design": {
                "axes": {
                  "geometry": {
                    "expr": {
                      "type": "field",
                      "table": "entities.school",
                      "column": "location"
                    }
                  }
                },
                "color": "#5e354c",
                "filter": null,
                "table": "entities.school",
                "symbol": "font-awesome/h-square"
              }
            }, {
              "id": "656b346f-c4ee-41e7-b6bc-2c7361403d62",
              "name": "Affected Area",
              "desc": "",
              "type": "Buffer",
              "visible": true,
              "opacity": 1,
              "design": {
                "axes": {
                  "geometry": {
                    "expr": {
                      "type": "field",
                      "table": "entities.water_system",
                      "column": "location"
                    }
                  },
                  "color": {
                    "expr": {
                      "type": "scalar",
                      "table": "entities.water_system",
                      "joins": ["!entities.water_point.water_system"],
                      "expr": {
                        "type": "op",
                        "op": "count",
                        "table": "entities.water_point",
                        "exprs": []
                      }
                    },
                    "xform": {
                      "type": "bin",
                      "numBins": 6,
                      "min": 1,
                      "max": 3000
                    },
                    "colorMap": [
                      {
                        "value": 0,
                        "color": "#9c9ede"
                      }, {
                        "value": 1,
                        "color": "#7375b5"
                      }, {
                        "value": 2,
                        "color": "#4a5584"
                      }, {
                        "value": 3,
                        "color": "#cedb9c"
                      }, {
                        "value": 4,
                        "color": "#b5cf6b"
                      }, {
                        "value": 5,
                        "color": "#8ca252"
                      }, {
                        "value": 6,
                        "color": "#637939"
                      }, {
                        "value": 7,
                        "color": "#e7cb94"
                      }
                    ],
                    "drawOrder": [7, 2, 5, 6, 1, 0, 3, 4]
                  }
                },
                "radius": 500000,
                "fillOpacity": 0.5,
                "filter": null,
                "table": "entities.water_system",
                "color": "#25250e"
              }
            }, {
              "id": "1ae794c7-77e5-41c5-beba-54734221a7ba",
              "name": "Water surfaces",
              "desc": "",
              "type": "AdminChoropleth",
              "visible": true,
              "opacity": 1,
              "design": {
                "color": "#8f5c5c",
                "adminRegionExpr": {
                  "type": "scalar",
                  "table": "entities.surface_water",
                  "joins": ["admin_region"],
                  "expr": {
                    "type": "id",
                    "table": "admin_regions"
                  }
                },
                "axes": {
                  "color": {
                    "expr": {
                      "type": "op",
                      "op": "count",
                      "table": "entities.surface_water",
                      "exprs": []
                    },
                    "xform": {
                      "type": "bin",
                      "numBins": 6,
                      "min": 0,
                      "max": 1000
                    },
                    "colorMap": [
                      {
                        "value": 0,
                        "color": "#c1e6e6"
                      }, {
                        "value": 1,
                        "color": "#99d6d6"
                      }, {
                        "value": 2,
                        "color": "#74c8c8"
                      }, {
                        "value": 3,
                        "color": "#4cb8b8"
                      }, {
                        "value": 4,
                        "color": "#3c9696"
                      }, {
                        "value": 5,
                        "color": "#2d7171"
                      }, {
                        "value": 6,
                        "color": "#1d4949"
                      }, {
                        "value": 7,
                        "color": "#0f2424"
                      }
                    ]
                  }
                },
                "fillOpacity": 0.75,
                "displayNames": true,
                "filter": null,
                "scope": null,
                "detailLevel": 0,
                "table": "entities.surface_water"
              }
            }
          ],
          "filters": {},
          "bounds": {
            "w": -69.9609375,
            "n": 57.136239319177434,
            "e": 69.9609375,
            "s": -57.13623931917743
          }
        }
      }
    }
  }
};

rosterDatagridDesign = {
  "table": "responses:3aee880e079a417ea51d388d95217edf",
  subtables: [
    {
      id: "r1",
      joins: ["data:cb4661bb948c4c188f6b94bc7bb3ce1f"]
    }
  ],
  "columns": [
    {
      "id": "5fa704cf-f08b-4ff0-9b33-3814238a021a",
      "type": "expr",
      "width": 150,
      "expr": {
        "type": "field",
        "table": "responses:3aee880e079a417ea51d388d95217edf",
        "column": "deployment"
      }
    }, {
      "id": "7e90248c-aa7e-4c90-b08a-7be61ac849d1",
      "type": "expr",
      "width": 150,
      "expr": {
        "type": "field",
        "table": "responses:3aee880e079a417ea51d388d95217edf",
        "column": "user"
      }
    }, {
      "id": "5882d5b6-ee8c-44a0-abc2-a1782d9d1593",
      "type": "expr",
      "width": 150,
      "expr": {
        "type": "field",
        "table": "responses:3aee880e079a417ea51d388d95217edf",
        "column": "status"
      }
    }, {
      "id": "1efa41fa-f173-467b-92ab-144d0899cf1b",
      "type": "expr",
      "width": 150,
      "expr": {
        "type": "field",
        "table": "responses:3aee880e079a417ea51d388d95217edf",
        "column": "code"
      }
    }, {
      "id": "39cadddf-0ec7-401f-ade0-39bc726dbc5b",
      "type": "expr",
      "width": 150,
      "expr": {
        "type": "field",
        "table": "responses:3aee880e079a417ea51d388d95217edf",
        "column": "submittedOn"
      }
    }, {
      "id": "efc513f6-94b2-4399-a98f-3fbec3a0d502",
      "type": "expr",
      "width": 150,
      "expr": {
        "type": "field",
        "table": "responses:3aee880e079a417ea51d388d95217edf",
        "column": "data:ec3613ba32184bf6bd69911055efad71:value"
      }
    }, {
      "id": "79520f3e-71fd-4907-8dc6-6b25741a7277",
      "type": "expr",
      "width": 150,
      "expr": {
        "type": "field",
        "table": "responses:3aee880e079a417ea51d388d95217edf",
        "column": "data:4a276bc577254a63943cf77f86f86382:value"
      }
    }, {
      "id": "roster1",
      "type": "expr",
      width: 200,
      subtable: "r1",
      expr: {
        type: "field",
        table: "responses:3aee880e079a417ea51d388d95217edf:roster:cb4661bb948c4c188f6b94bc7bb3ce1f",
        column: "data:37c99596f2e14feaa313431a91e3e620:value"
      }
    }
  ]
};
