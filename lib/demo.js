var AutoSizeComponent, CalendarChartViewComponent, DataSource, DirectDashboardDataSource, DirectMapDataSource, H, LayeredChart, LayeredChartDesignerComponent, MWaterDashboardPane, MWaterDataSource, MWaterDatagridDesignerPane, MWaterDatagridPane, MWaterDirectDashboardPane, MWaterDirectMapPane, MWaterLoaderComponent, MWaterMapPane, React, ReactDOM, Schema, ServerDashboardDataSource, ServerMapDataSource, dashboardDesign, dashboardId, datagridDesign, design, mapDesign, mapId, querystring, rosterDatagridDesign, share, visualization,
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
  },
  "layout": "blocks"
};

MWaterDirectDashboardPane = (function(superClass) {
  extend(MWaterDirectDashboardPane, superClass);

  function MWaterDirectDashboardPane(props) {
    this.handleDesignChange = bind(this.handleDesignChange, this);
    MWaterDirectDashboardPane.__super__.constructor.apply(this, arguments);
    this.state = {
      design: dashboardDesign,
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
  "baseLayer": "bing_road",
  "layerViews": [
    {
      "id": "afbf76a3-29b8-4a11-882c-42aa21a3ca7a",
      "name": "Untitled Layer",
      "desc": "",
      "type": "AdminChoropleth",
      "visible": true,
      "opacity": 1,
      "design": {
        "adminRegionExpr": {
          "type": "scalar",
          "table": "entities.water_point",
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
              "op": "percent where",
              "table": "entities.water_point",
              "exprs": []
            },
            "xform": {
              "type": "bin",
              "numBins": 6,
              "min": 0,
              "max": 100
            },
            "colorMap": [
              {
                "value": 1,
                "color": "#f8e71c"
              }, {
                "value": 2,
                "color": "#7ed321"
              }, {
                "value": 3,
                "color": "#f5a623"
              }, {
                "value": 4,
                "color": "#d0021b"
              }, {
                "value": 5,
                "color": "#4725f0"
              }
            ]
          }
        },
        "opacity": 1,
        "nameLabels": true,
        "filter": null,
        "scope": "eb3e12a2-de1e-49a9-8afd-966eb55d47eb",
        "detailLevel": 1,
        "table": "entities.water_point",
        "color": "#9b9b9b"
      }
    }
  ],
  filters: {},
  bounds: {
    "w": 23.1591796875,
    "n": 4.214943141390651,
    "e": 44.2529296875,
    "s": -18.583775688370928
  }
};

dashboardDesign = {
  "items": {
    "4ed3415c-30c1-45fe-8984-dbffb9dd42d1": {
      "layout": {
        "x": 0,
        "y": 0,
        "w": 8,
        "h": 8
      },
      "widget": {
        "type": "LayeredChart",
        "design": {
          "xAxisLabelText": "",
          "yAxisLabelText": "",
          "version": 2,
          "layers": [
            {
              "axes": {
                "color": {
                  "expr": {
                    "type": "scalar",
                    "table": "entities.water_point",
                    "joins": ["!indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9.Water point"],
                    "expr": {
                      "type": "field",
                      "table": "indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9",
                      "column": "Functionality"
                    },
                    "aggr": "last"
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
              "filter": {
                "type": "op",
                "table": "entities.water_point",
                "op": "= any",
                "exprs": [
                  {
                    "type": "scalar",
                    "table": "entities.water_point",
                    "joins": ["!indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9.Water point"],
                    "expr": {
                      "type": "field",
                      "table": "indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9",
                      "column": "Functionality"
                    },
                    "aggr": "last"
                  }, {
                    "type": "literal",
                    "valueType": "enumset",
                    "value": []
                  }
                ]
              },
              "table": "entities.water_point"
            }
          ],
          "type": "donut"
        }
      }
    },
    "1219bae7-b616-4c53-8423-a6495ecf26f9": {
      "layout": {
        "x": 16,
        "y": 0,
        "w": 8,
        "h": 8
      },
      "widget": {
        "type": "ImageMosaicChart",
        "design": {
          "version": 1,
          "imageAxis": {
            "expr": {
              "type": "field",
              "table": "entities.community",
              "column": "photos"
            }
          },
          "filter": null,
          "table": "entities.community",
          "titleText": "gfhfdg hdfgh dfh"
        }
      }
    },
    "c84506e8-727d-4515-9579-fd66220ebdea": {
      "layout": {
        "x": 8,
        "y": 0,
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
                  "type": "op",
                  "op": "count",
                  "table": "entities.water_point",
                  "exprs": []
                }
              },
              "headerText": "# Water points"
            }, {
              "textAxis": {
                "expr": {
                  "type": "op",
                  "table": "entities.water_point",
                  "op": "percent where",
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
              },
              "headerText": "% Dug Wells"
            }, {
              "textAxis": {
                "expr": {
                  "type": "scalar",
                  "table": "entities.water_point",
                  "joins": ["admin_region"],
                  "expr": {
                    "type": "field",
                    "table": "admin_regions",
                    "column": "country"
                  }
                }
              },
              "headerText": "Country"
            }
          ],
          "orderings": [
            {
              "axis": {
                "expr": {
                  "type": "op",
                  "op": "count",
                  "table": "entities.water_point",
                  "exprs": []
                }
              },
              "direction": "desc"
            }
          ],
          "table": "entities.water_point"
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
