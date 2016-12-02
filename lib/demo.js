var AutoSizeComponent, CalendarChartViewComponent, DataSource, DirectDashboardDataSource, DirectDatagridDataSource, DirectMapDataSource, H, ItemsHtmlConverter, LayeredChart, LayeredChartDesignerComponent, MWaterDashboardPane, MWaterDataSource, MWaterDatagridPane, MWaterDirectDashboardPane, MWaterDirectMapPane, MWaterLoaderComponent, MWaterMapPane, R, React, ReactDOM, RichTextComponent, RichTextPane, Schema, ServerDashboardDataSource, ServerMapDataSource, adminRegionMap, autoBoundsMap, badColorsMap, badColorsMap2, bufferMap, datagridDesign, design, doubleClickMap, imageWidgetDashboardDesign, mapAndChartDashboard, mapDesign, mapId, oldDashboardDesign, pageBreakProblem, querystring, rosterDatagridDesign, share, simpleBarChart, simplePieChart, testMedium, visualization, wholeWorldFuncMap,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

ReactDOM = require('react-dom');

H = React.DOM;

R = React.createElement;

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

DirectDatagridDataSource = require('./datagrids/DirectDatagridDataSource');

DirectDashboardDataSource = require('./dashboards/DirectDashboardDataSource');

DirectMapDataSource = require('./maps/DirectMapDataSource');

ServerMapDataSource = require('./maps/ServerMapDataSource');

ServerDashboardDataSource = require('./dashboards/ServerDashboardDataSource');

RichTextComponent = require('./richtext/RichTextComponent');

ItemsHtmlConverter = require('./richtext/ItemsHtmlConverter');

$(function() {
  var sample;
  sample = H.div({
    className: "container-fluid",
    style: {
      height: "100%",
      paddingLeft: 0,
      paddingRight: 0
    }
  }, H.style(null, 'html, body, #main { height: 100% }'), React.createElement(MWaterDirectMapPane, {
    apiUrl: "https://api.mwater.co/v3/",
    client: window.location.hash.substr(1)
  }));
  return ReactDOM.render(sample, document.getElementById("main"));
});

RichTextPane = (function(superClass) {
  extend(RichTextPane, superClass);

  function RichTextPane(props) {
    this.handleInsert = bind(this.handleInsert, this);
    RichTextPane.__super__.constructor.apply(this, arguments);
    this.state = {
      items: null
    };
  }

  RichTextPane.prototype.handleInsert = function(ev) {
    ev.preventDefault();
    return this.refs.editor.pasteHTML("x");
  };

  RichTextPane.prototype.renderExtraButtons = function() {
    return H.div({
      key: "x",
      className: "mwater-visualization-text-palette-item",
      onMouseDown: this.handleInsert
    }, "x");
  };

  RichTextPane.prototype.render = function() {
    return H.div({
      style: {
        paddingTop: 100
      }
    }, R(RichTextComponent, {
      ref: "editor",
      items: this.state.items,
      onItemsChange: (function(_this) {
        return function(items) {
          return _this.setState({
            items: items
          });
        };
      })(this),
      itemsHtmlConverter: new ItemsHtmlConverter(),
      extraPaletteButtons: this.renderExtraButtons()
    }));
  };

  return RichTextPane;

})(React.Component);

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
    url = this.props.apiUrl + ("dashboards/" + this.props.dashboardId + "?") + querystring.stringify({
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
      share: this.props.share,
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
          return H.div(null, "Error: " + error.message);
        }
        dashboardDataSource = new ServerDashboardDataSource({
          apiUrl: _this.props.apiUrl,
          client: _this.props.client,
          share: _this.props.share,
          dashboardId: _this.props.dashboardId
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

MWaterDirectDashboardPane = (function(superClass) {
  extend(MWaterDirectDashboardPane, superClass);

  function MWaterDirectDashboardPane(props) {
    this.handleDesignChange = bind(this.handleDesignChange, this);
    MWaterDirectDashboardPane.__super__.constructor.apply(this, arguments);
    this.state = {
      design: mapAndChartDashboard,
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

mapId = "fb92ca9ca9a04bfd8dc156b5ac71380d";

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
      client: this.props.client
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
          mapId: mapId,
          design: _this.state.design
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
      design: doubleClickMap,
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
          dataSource: config.dataSource,
          design: _this.state.design
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
            return console.log("Click " + tableId + ":" + rowId);
          },
          titleElem: "Sample"
        }));
      };
    })(this));
  };

  return MWaterDirectMapPane;

})(React.Component);

MWaterDatagridPane = (function(superClass) {
  extend(MWaterDatagridPane, superClass);

  function MWaterDatagridPane(props) {
    this.handleDesignChange = bind(this.handleDesignChange, this);
    MWaterDatagridPane.__super__.constructor.apply(this, arguments);
    this.state = {
      design: datagridDesign,
      extraTables: []
    };
  }

  MWaterDatagridPane.prototype.handleDesignChange = function(design) {
    this.setState({
      design: design
    });
    return console.log(JSON.stringify(design, null, 2));
  };

  MWaterDatagridPane.prototype.render = function() {
    return R(MWaterLoaderComponent, {
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
        var datagridDataSource;
        datagridDataSource = new DirectDatagridDataSource({
          schema: config.schema,
          dataSource: config.dataSource
        });
        return H.div({
          style: {
            height: "100%"
          }
        }, R(visualization.DatagridComponent, {
          schema: config.schema,
          dataSource: config.dataSource,
          datagridDataSource: datagridDataSource,
          design: _this.state.design,
          onDesignChange: _this.handleDesignChange,
          titleElem: "Sample",
          onRowDoubleClick: function() {
            return console.log(arguments);
          },
          canEditValue: function(tableId, rowId, expr, callback) {
            return callback(null, true);
          },
          updateValue: function(tableId, rowId, expr, value, callback) {
            console.log(value);
            return setTimeout(function() {
              return callback(null);
            }, 500);
          }
        }));
      };
    })(this));
  };

  return MWaterDatagridPane;

})(React.Component);

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
  ],
  "quickfilters": [
    {
      "table": "entities.water_point",
      "expr": {
        "type": "field",
        "table": "entities.water_point",
        "column": "type"
      },
      "label": null
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
  "layerViews": [
    {
      "id": "0c6525a2-1300-48db-b793-ba7806827f3c",
      "name": "Untitled Layer",
      "desc": "",
      "type": "Markers",
      "visible": false,
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
              "column": "drilling_method_other"
            },
            "colorMap": [
              {
                "value": null,
                "color": "#d49097"
              }, {
                "value": "a pied",
                "color": "#ba4f5a"
              }, {
                "value": "testing other",
                "color": "#81323a"
              }, {
                "value": "A pied",
                "color": "#3e181c"
              }
            ],
            "drawOrder": [null, "a pied", "testing other", "A pied"]
          }
        },
        "color": "#0088FF",
        "filter": null,
        "table": "entities.water_point",
        "popup": {
          "items": {
            "id": "root",
            "type": "root",
            "blocks": [
              {
                "id": "f5dcf519-0287-4f65-ab44-abdd609b704b",
                "type": "horizontal",
                "blocks": [
                  {
                    "id": "e50f7026-44f2-44fd-9c19-a2c412d6cf10",
                    "type": "vertical",
                    "blocks": [
                      {
                        "type": "widget",
                        "widgetType": "Text",
                        "design": {
                          "style": "title",
                          "items": [
                            {
                              "type": "expr",
                              "id": "1af0f88c-db39-46bb-ad5a-4777a7d0357d",
                              "expr": {
                                "type": "field",
                                "table": "entities.water_point",
                                "column": "name"
                              }
                            }
                          ]
                        },
                        "id": "b2becac4-db3c-48b8-92db-9f1d2da0df97"
                      }, {
                        "type": "widget",
                        "widgetType": "Text",
                        "design": {
                          "items": [
                            "Description: ", {
                              "type": "expr",
                              "id": "d3813f6f-a8c6-4783-80ca-70a18e8fa630",
                              "expr": {
                                "type": "field",
                                "table": "entities.water_point",
                                "column": "desc"
                              }
                            }, {
                              "type": "element",
                              "tag": "div",
                              "items": [
                                "Type: ", {
                                  "type": "expr",
                                  "id": "7c74bf50-d649-4e25-a80b-27504d029f4c",
                                  "expr": {
                                    "type": "field",
                                    "table": "entities.water_point",
                                    "column": "type"
                                  }
                                }, {
                                  "type": "element",
                                  "tag": "br",
                                  "items": []
                                }
                              ]
                            }
                          ]
                        },
                        "id": "47e4be90-cfad-4145-8afd-3adfb2ac2882"
                      }
                    ]
                  }, {
                    "type": "widget",
                    "widgetType": "Image",
                    "design": {},
                    "id": "858fb20f-5f5f-48cf-8fe3-a4f3639b7684"
                  }
                ]
              }
            ]
          }
        }
      }
    }, {
      "id": "cc3771af-ce10-48ee-b48a-e698513fa8bf",
      "name": "Untitled Layer",
      "desc": "",
      "type": "Buffer",
      "visible": false,
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
            ],
            "drawOrder": ["manual", "mechanical", "other"]
          }
        },
        "radius": 100000,
        "fillOpacity": 0.5,
        "filter": null,
        "table": "entities.water_point",
        "color": "#6244f8"
      }
    }
  ],
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

oldDashboardDesign = {
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
                      "column": "drilling_method_other"
                    },
                    "colorMap": [
                      {
                        "value": null,
                        "color": "#d49097"
                      }, {
                        "value": "a pied",
                        "color": "#ba4f5a"
                      }, {
                        "value": "testing other",
                        "color": "#81323a"
                      }, {
                        "value": "A pied",
                        "color": "#3e181c"
                      }
                    ],
                    "drawOrder": [null, "a pied", "testing other", "A pied"]
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

oldDashboardDesign = {
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

bufferMap = {
  "baseLayer": "cartodb_positron",
  "layerViews": [
    {
      "id": "6991fe14-03eb-4cf1-a4f5-6e3ebe581482",
      "name": "Untitled Layer",
      "desc": "",
      "type": "Buffer",
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
              "type": "scalar",
              "table": "entities.water_point",
              "joins": ["!indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9.Water point"],
              "expr": {
                "type": "op",
                "op": "last",
                "table": "indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9",
                "exprs": [
                  {
                    "type": "field",
                    "table": "indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9",
                    "column": "Functionality"
                  }
                ]
              }
            },
            "colorMap": [
              {
                "value": "Partially functional",
                "color": "#ff7f0e"
              }, {
                "value": "Functional",
                "color": "#7ed321"
              }, {
                "value": "Not functional",
                "color": "#d0021b"
              }, {
                "value": null,
                "color": "#9b9b9b"
              }, {
                "value": "No longer exists",
                "color": "#000000"
              }
            ],
            "drawOrder": ["Functional", "Partially functional", "Not functional", "No longer exists", null]
          }
        },
        "radius": 1000,
        "fillOpacity": 0.5,
        "filter": null,
        "table": "entities.water_point",
        "color": "#9b9b9b"
      }
    }
  ],
  "filters": {},
  "bounds": {
    "w": 32.01690673828125,
    "n": -1.9606767908079445,
    "e": 33.86260986328125,
    "s": -3.424320686307251
  }
};

adminRegionMap = {
  "baseLayer": "cartodb_positron",
  "layerViews": [
    {
      "id": "f17cae2c-6357-432f-aaff-c3f98cbc374e",
      "name": "Untitled Layer",
      "desc": "",
      "type": "AdminChoropleth",
      "visible": true,
      "opacity": 1,
      "design": {
        "color": "#FFFFFF",
        "adminRegionExpr": {
          "type": "field",
          "table": "entities.water_point",
          "column": "admin_region"
        },
        "axes": {
          "color": {
            "expr": {
              "type": "op",
              "op": "percent where",
              "table": "entities.water_point",
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
                }, null
              ]
            },
            "xform": {
              "type": "bin",
              "numBins": 6,
              "min": 0,
              "max": 100
            },
            "colorMap": [
              {
                "value": 0,
                "color": "#c1cce6"
              }, {
                "value": 1,
                "color": "#9daed8"
              }, {
                "value": 2,
                "color": "#7c93cb"
              }, {
                "value": 3,
                "color": "#5b79be"
              }, {
                "value": 4,
                "color": "#4361a8"
              }, {
                "value": 5,
                "color": "#344c83"
              }, {
                "value": 6,
                "color": "#273962"
              }, {
                "value": 7,
                "color": "#1a2642"
              }, {
                "value": null,
                "color": "#0d1321"
              }
            ],
            "drawOrder": [0, 1, 2, 3, 4, 5, 6, 7, null]
          }
        },
        "fillOpacity": 0.75,
        "displayNames": true,
        "filter": null,
        "scope": "eb3e12a2-de1e-49a9-8afd-966eb55d47eb",
        "detailLevel": 2,
        "table": "entities.water_point"
      }
    }
  ],
  "filters": {},
  "bounds": {
    "w": 27.916259765625,
    "n": -0.7470491450051796,
    "e": 42.681884765625,
    "s": -12.37219737335794
  }
};

wholeWorldFuncMap = {
  "baseLayer": "cartodb_positron",
  "layerViews": [
    {
      "id": "83530ec5-6c08-477c-8c1e-e5ee0077f14f",
      "desc": "",
      "name": "% Functional",
      "type": "AdminChoropleth",
      "design": {
        "axes": {
          "color": {
            "expr": {
              "op": "percent where",
              "type": "op",
              "exprs": [
                {
                  "op": "= any",
                  "type": "op",
                  "exprs": [
                    {
                      "expr": {
                        "op": "last",
                        "type": "op",
                        "exprs": [
                          {
                            "type": "field",
                            "table": "indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9",
                            "column": "Functionality"
                          }
                        ],
                        "table": "indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9"
                      },
                      "type": "scalar",
                      "joins": ["!indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9.Water point"],
                      "table": "entities.water_point"
                    }, {
                      "type": "literal",
                      "value": ["Functional"],
                      "valueType": "enumset"
                    }
                  ],
                  "table": "entities.water_point"
                }, {
                  "op": "is not null",
                  "type": "op",
                  "exprs": [
                    {
                      "expr": {
                        "op": "last",
                        "type": "op",
                        "exprs": [
                          {
                            "type": "field",
                            "table": "indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9",
                            "column": "Functionality"
                          }
                        ],
                        "table": "indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9"
                      },
                      "type": "scalar",
                      "joins": ["!indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9.Water point"],
                      "table": "entities.water_point"
                    }
                  ],
                  "table": "entities.water_point"
                }
              ],
              "table": "entities.water_point"
            },
            "xform": {
              "max": 100,
              "min": 0,
              "type": "bin",
              "numBins": 6
            },
            "colorMap": [
              {
                "color": "#c8e6c1",
                "value": 0
              }, {
                "color": "#a4d699",
                "value": 1
              }, {
                "color": "#84c874",
                "value": 2
              }, {
                "color": "#60b84c",
                "value": 3
              }, {
                "color": "#4c963c",
                "value": 4
              }, {
                "color": "#3a712d",
                "value": 5
              }, {
                "color": "#25491d",
                "value": 6
              }, {
                "color": "#13240f",
                "value": 7
              }
            ],
            "drawOrder": [0, 1, 2, 3, 4, 5, 6, 7]
          }
        },
        "color": "#FFFFFF",
        "scope": null,
        "table": "entities.water_point",
        "filter": null,
        "detailLevel": 0,
        "fillOpacity": 0.75,
        "displayNames": true,
        "adminRegionExpr": {
          "type": "field",
          "table": "entities.water_point",
          "column": "admin_region"
        },
        "scopeLevel": null
      },
      "opacity": 1,
      "visible": true
    }
  ],
  "filters": {},
  "bounds": {
    "w": -21.181640624999996,
    "n": 35.60371874069731,
    "e": 69.43359375,
    "s": -33.7243396617476
  }
};

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
        "id": "9bec34a2-f0e5-4a0b-88e8-3406521408bf",
        "type": "horizontal",
        "blocks": [
          {
            "type": "widget",
            "aspectRatio": 1.4,
            "widgetType": "TableChart",
            "design": {
              "version": 1,
              "columns": [
                {
                  "textAxis": {
                    "expr": {
                      "type": "field",
                      "table": "entities.water_point",
                      "column": "name"
                    }
                  }
                }, {
                  "textAxis": {
                    "expr": {
                      "type": "field",
                      "table": "entities.water_point",
                      "column": "type"
                    }
                  }
                }
              ],
              "orderings": [],
              "table": "entities.water_point",
              "titleText": "This is a really long title This is a really long title This is a really long title This is a really long title "
            },
            "id": "ca85906f-c6cd-4729-a52f-984c28d625a8"
          }, {
            "type": "widget",
            "aspectRatio": 1.4,
            "widgetType": "Map",
            "design": {
              "baseLayer": "cartodb_positron",
              "layerViews": [
                {
                  "id": "471776be-5c67-4d0d-a0fd-d406cc60c44c",
                  "name": "Untitled Layer",
                  "desc": "",
                  "type": "AdminChoropleth",
                  "visible": false,
                  "opacity": 1,
                  "design": {
                    "color": "#FFFFFF",
                    "adminRegionExpr": {
                      "type": "field",
                      "table": "entities.water_point",
                      "column": "admin_region"
                    },
                    "axes": {
                      "color": {
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
                            }, null
                          ]
                        },
                        "xform": {
                          "type": "bin",
                          "numBins": 6,
                          "min": 0,
                          "max": 100
                        },
                        "colorMap": [
                          {
                            "value": 0,
                            "color": "#c1cce6"
                          }, {
                            "value": 1,
                            "color": "#99abd6"
                          }, {
                            "value": 2,
                            "color": "#748dc8"
                          }, {
                            "value": 3,
                            "color": "#4c6db8"
                          }, {
                            "value": 4,
                            "color": "#3c5796"
                          }, {
                            "value": 5,
                            "color": "#2d4171"
                          }, {
                            "value": 6,
                            "color": "#1d2a49"
                          }, {
                            "value": 7,
                            "color": "#0f1524"
                          }
                        ],
                        "drawOrder": [0, 1, 2, 3, 4, 5, 6, 7]
                      }
                    },
                    "fillOpacity": 0.75,
                    "displayNames": true,
                    "filter": null,
                    "scope": "eb3e12a2-de1e-49a9-8afd-966eb55d47eb",
                    "detailLevel": 1,
                    "table": "entities.water_point"
                  }
                }, {
                  "id": "fc9a4641-8319-471d-9e80-c2c3a6b11e34",
                  "name": "Untitled Layer",
                  "desc": "",
                  "type": "Markers",
                  "visible": false,
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
                          "column": "drilling_method_other"
                        },
                        "colorMap": [
                          {
                            "value": "A pied",
                            "color": "#1f77b4"
                          }, {
                            "value": "a pied",
                            "color": "#aec7e8"
                          }, {
                            "value": "testing other",
                            "color": "#ff7f0e"
                          }, {
                            "value": null,
                            "color": "#ffbb78"
                          }
                        ],
                        "drawOrder": ["A pied", "a pied", "testing other", null]
                      }
                    },
                    "color": "#0088FF",
                    "filter": null,
                    "table": "entities.water_point"
                  }
                }, {
                  "id": "c8fe521e-1577-4b4c-98a9-c2c5aba964e5",
                  "name": "Untitled Layer",
                  "desc": "",
                  "type": "Buffer",
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
                          "column": "_created_on"
                        },
                        "xform": {
                          "type": "month"
                        },
                        "colorMap": [
                          {
                            "value": "01",
                            "color": "#1f77b4"
                          }, {
                            "value": "02",
                            "color": "#ff7f0e"
                          }, {
                            "value": "03",
                            "color": "#2ca02c"
                          }, {
                            "value": "04",
                            "color": "#d62728"
                          }, {
                            "value": "05",
                            "color": "#9467bd"
                          }, {
                            "value": "06",
                            "color": "#8c564b"
                          }, {
                            "value": "07",
                            "color": "#e377c2"
                          }, {
                            "value": "08",
                            "color": "#7f7f7f"
                          }, {
                            "value": "09",
                            "color": "#bcbd22"
                          }, {
                            "value": "10",
                            "color": "#17becf"
                          }, {
                            "value": "11",
                            "color": "#1f77b4"
                          }, {
                            "value": "12",
                            "color": "#ff7f0e"
                          }
                        ],
                        "drawOrder": ["03", "01", "04", "12", "05", "06", "07", "08", "09", "10", "11", "02"]
                      }
                    },
                    "radius": 50000,
                    "fillOpacity": 0.5,
                    "filter": null,
                    "table": "entities.water_point"
                  }
                }
              ],
              "filters": {},
              "bounds": {
                "w": 28.63037109375,
                "n": -1.625758360412755,
                "e": 41.06689453125,
                "s": -10.336536087082974
              }
            },
            "id": "a4148cd8-457f-4424-b464-c427f1b630de"
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
  "style": "greybg"
};

autoBoundsMap = {
  "baseLayer": "cartodb_positron",
  "layerViews": [
    {
      "id": "6991fe14-03eb-4cf1-a4f5-6e3ebe581482",
      "name": "Untitled Layer",
      "desc": "",
      "type": "Buffer",
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
              "type": "scalar",
              "table": "entities.water_point",
              "joins": ["!indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9.Water point"],
              "expr": {
                "type": "op",
                "op": "last",
                "table": "indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9",
                "exprs": [
                  {
                    "type": "field",
                    "table": "indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9",
                    "column": "Functionality"
                  }
                ]
              }
            },
            "colorMap": [
              {
                "value": "Partially functional",
                "color": "#ff7f0e"
              }, {
                "value": "Functional",
                "color": "#7ed321"
              }, {
                "value": "Not functional",
                "color": "#d0021b"
              }, {
                "value": null,
                "color": "#9b9b9b"
              }, {
                "value": "No longer exists",
                "color": "#000000"
              }
            ],
            "drawOrder": ["Functional", "Partially functional", "Not functional", "No longer exists", null]
          }
        },
        "radius": 1000,
        "fillOpacity": 0.5,
        "filter": null,
        "table": "entities.water_point",
        "color": "#9b9b9b"
      }
    }
  ],
  "filters": {
    "entities.water_point": {
      "type": "op",
      "table": "entities.water_point",
      "op": "within",
      "exprs": [
        {
          "type": "field",
          "table": "entities.water_point",
          "column": "admin_region"
        }, {
          "type": "literal",
          "valueType": "id",
          "idTable": "admin_regions",
          "value": "316f16a2-89e1-46b4-8a4b-561478997000"
        }
      ]
    }
  },
  "bounds": {
    "w": 32.01690673828125,
    "n": -1.9606767908079445,
    "e": 33.86260986328125,
    "s": -3.424320686307251
  },
  autoBounds: true
};

testMedium = {
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
        "id": "bf69f1c3-aa74-4f53-b3d1-878a5cc2c71f",
        "type": "horizontal",
        "blocks": [
          {
            "type": "widget",
            "widgetType": "Text",
            "design": {
              "items": [
                {
                  "type": "element",
                  "tag": "h1",
                  "items": ["How it is"]
                }, "The new Sustainable Development Goal target for safely managed drinking water raises the bar from simply providing access to a water source to proving that the water is safe to drink and is being managed to prevent contamination. ", {
                  "type": "element",
                  "tag": "h2",
                  "items": ["What's new"]
                }, {
                  "type": "element",
                  "tag": "div",
                  "items": ["The water quality crisis is a significant new challenge, with studies indicating that up to 2 billion people drink contaminated water every day. Recent evidence from nationally representative surveys by UNICEF indicates that water stored in households is at the greatest risk and over 80% of samples tested contain fecal bacteria. "]
                }, {
                  "type": "element",
                  "tag": "div",
                  "items": ["Improving water safety means more than just testing; local water managers must be empowered to identify and control risks, monitor operations, and respond quickly to changing conditions such as drought or contamination events."]
                }
              ]
            },
            "id": "09c8981b-3869-410d-bd90-4a5a012314a8"
          }, {
            "type": "spacer",
            "aspectRatio": 1.4,
            "id": "ba931d1d-3e29-47d5-b264-04ca5e0f10da"
          }
        ],
        "weights": [1.6406417112299465, 0.3593582887700535]
      }, {
        "id": "d640a32c-2ed6-4a3e-b746-07dcc2c0b1cc",
        "type": "horizontal",
        "blocks": [
          {
            "type": "widget",
            "widgetType": "Text",
            "design": {
              "items": [
                {
                  "type": "element",
                  "tag": "span",
                  "items": ["Managing digital data and implementing mobile data collection, and how they are now scaling globally. The Water Trust and the Millennium Water Alliance will also talk about the real world issues faced every day in the process of using mWater: planning a digital M&E strategy, training staff to move from paper to mobiles, im"]
                }
              ]
            },
            "id": "8eabe8c1-e23b-4d89-8179-a5ec84f9d538"
          }, {
            "type": "widget",
            "aspectRatio": 1.4,
            "widgetType": "Image",
            "design": {
              "imageUrl": "https://cdn-images-1.medium.com/max/600/1*7o1w_pkB_jHoKSUeYotY1Q.jpeg",
              "uid": null,
              "expr": null,
              caption: "Some serious stuff here"
            },
            "id": "2412f938-7b5e-4ab4-984d-5e04beca5956"
          }
        ],
        "weights": [1.1358288770053475, 0.8641711229946524]
      }
    ]
  },
  "layout": "blocks",
  "style": "default"
};

badColorsMap = {
  "baseLayer": "cartodb_positron",
  "layerViews": [
    {
      "id": "f17c9aca-f418-4718-a349-0aecc708fdc4",
      "name": "Untitled Layer",
      "desc": "",
      "type": "AdminChoropleth",
      "visible": true,
      "opacity": 1,
      "design": {
        "color": "#FFFFFF",
        "adminRegionExpr": {
          "type": "field",
          "table": "entities.water_point",
          "column": "admin_region"
        },
        "axes": {
          "color": {
            "expr": {
              "type": "op",
              "op": "percent where",
              "table": "entities.water_point",
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
                }, null
              ]
            },
            "xform": {
              "type": "bin",
              "numBins": 6,
              "min": 0,
              "max": 100
            },
            "colorMap": [
              {
                "value": 0,
                "color": "#9e0142"
              }, {
                "value": 1,
                "color": "#e1524a"
              }, {
                "value": 2,
                "color": "#fba35e"
              }, {
                "value": 3,
                "color": "#fee89a"
              }, {
                "value": 4,
                "color": "#ebf7a6"
              }, {
                "value": 5,
                "color": "#a0d9a3"
              }, {
                "value": 6,
                "color": "#4ba0b1"
              }, {
                "value": 7,
                "color": "#5e4fa2"
              }, {
                "value": null,
                "color": "#aaaaaa"
              }
            ],
            "drawOrder": [0, 1, 2, 3, 4, 5, 6, 7, null]
          }
        },
        "fillOpacity": 0.75,
        "displayNames": true,
        "filter": null,
        "table": "entities.water_point",
        "scope": "eb3e12a2-de1e-49a9-8afd-966eb55d47eb",
        "scopeLevel": 0,
        "detailLevel": 1
      }
    }
  ],
  "filters": {
    "entities.water_point": null
  },
  "bounds": {
    "w": 24.873046874999996,
    "n": 3.469557303061473,
    "e": 45.6591796875,
    "s": -19.16592425362801
  },
  "autoBounds": false
};

badColorsMap2 = {
  "baseLayer": "cartodb_positron",
  "layerViews": [
    {
      "id": "8e22dc94-049a-4b20-85dc-70429328eb68",
      "name": "Untitled Layer",
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
              "column": "type"
            },
            "colorMap": [
              {
                "value": "Protected dug well",
                "color": "#377eb8"
              }, {
                "value": "Unprotected dug well",
                "color": "#4daf4a"
              }, {
                "value": "Borehole or tubewell",
                "color": "#984ea3"
              }, {
                "value": "Protected spring",
                "color": "#ff7f00"
              }, {
                "value": "Unprotected spring",
                "color": "#ffff33"
              }, {
                "value": "Rainwater",
                "color": "#a65628"
              }, {
                "value": "Surface water",
                "color": "#f781bf"
              }, {
                "value": "Piped into dwelling",
                "color": "#999999"
              }, {
                "value": "Piped into yard/plot",
                "color": "#e41a1c"
              }, {
                "value": "Piped into public tap or basin",
                "color": "#377eb8"
              }, {
                "value": "Bottled water",
                "color": "#4daf4a"
              }, {
                "value": "Tanker truck",
                "color": "#984ea3"
              }, {
                "value": "Cart with small tank/drum",
                "color": "#ff7f00"
              }, {
                "value": "other",
                "color": "#ffff33"
              }, {
                "value": null,
                "color": "#aaaaaa"
              }
            ],
            "drawOrder": ["Protected dug well", "Unprotected dug well", "Borehole or tubewell", "Protected spring", "Unprotected spring", "Rainwater", "Surface water", "Piped into dwelling", "Piped into yard/plot", "Piped into public tap or basin", "Bottled water", "Tanker truck", "Cart with small tank/drum", "other", null]
          }
        },
        "color": "#0088FF",
        "filter": {
          "type": "op",
          "table": "entities.water_point",
          "op": "within",
          "exprs": [
            {
              "type": "field",
              "table": "entities.water_point",
              "column": "admin_region"
            }, {
              "type": "literal",
              "valueType": "id",
              "idTable": "admin_regions",
              "value": "316f16a2-89e1-46b4-8a4b-561478997000"
            }
          ]
        },
        "table": "entities.water_point",
        "popup": {
          "items": {
            "id": "root",
            "type": "root",
            "blocks": [
              {
                "type": "widget",
                "widgetType": "Text",
                "design": {
                  "style": "title",
                  "items": [
                    {
                      "type": "expr",
                      "id": "ac490926-5a04-4b01-8679-54375970c8d8",
                      "expr": {
                        "type": "field",
                        "table": "entities.water_point",
                        "column": "name"
                      },
                      "includeLabel": false
                    }
                  ]
                },
                "id": "5c4264d1-183c-4c03-b8a7-1d6ba2466ad7"
              }
            ]
          }
        }
      }
    }
  ],
  "filters": {
    "entities.water_point": null
  },
  "bounds": {
    "n": -1.71348600000001,
    "e": 33.775625,
    "s": -3.4254440000000197,
    "w": 32.045458
  },
  "autoBounds": true
};

pageBreakProblem = {
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
        "id": "bf69f1c3-aa74-4f53-b3d1-878a5cc2c71f",
        "type": "horizontal",
        "blocks": [
          {
            "type": "widget",
            "widgetType": "Text",
            "design": {
              "items": [
                {
                  "type": "element",
                  "tag": "h1",
                  "items": ["How it is"]
                }, "The new Sustainable Development Goal target for safely managed drinking water raises the bar from simply providing access to a water source to proving that the water is safe to drink and is being managed to prevent contamination. ", {
                  "type": "element",
                  "tag": "h2",
                  "items": ["What's new"]
                }, {
                  "type": "element",
                  "tag": "div",
                  "items": ["The water quality crisis is a significant new challenge, with studies indicating that up to 2 billion people drink contaminated water every day. Recent evidence from nationally representative surveys by UNICEF indicates that water stored in households is at the greatest risk and over 80% of samples tested contain fecal bacteria. "]
                }, {
                  "type": "element",
                  "tag": "div",
                  "items": ["Improving water safety means more than just testing; local water managers must be empowered to identify and control risks, monitor operations, and respond quickly to changing conditions such as drought or contamination events."]
                }
              ]
            },
            "id": "09c8981b-3869-410d-bd90-4a5a012314a8"
          }, {
            "type": "spacer",
            "aspectRatio": 1.4,
            "id": "ba931d1d-3e29-47d5-b264-04ca5e0f10da"
          }
        ],
        "weights": [1.6406417112299465, 0.3593582887700535]
      }, {
        "type": "widget",
        "widgetType": "Text",
        "design": {
          "items": [
            {
              "type": "element",
              "tag": "span",
              "items": ["Managing digital data and implementing mobile data collection, and how they are now scaling globally. The Water Trust and the Millennium Water Alliance will also talk about the real world issues faced every day in the process of using mWater: planning a digital M&E strategy, training staff to move from paper to mobiles, im"]
            }
          ]
        },
        "id": "8eabe8c1-e23b-4d89-8179-a5ec84f9d538"
      }, {
        "type": "widget",
        "aspectRatio": 1.4,
        "widgetType": "Image",
        "design": {
          "imageUrl": "https://cdn-images-1.medium.com/max/600/1*7o1w_pkB_jHoKSUeYotY1Q.jpeg",
          "uid": null,
          "expr": null,
          "caption": "Some serious stuff here"
        },
        "id": "2412f938-7b5e-4ab4-984d-5e04beca5956"
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
                    "column": "type"
                  }
                },
                "y": {
                  "expr": {
                    "type": "op",
                    "op": "count",
                    "table": "entities.water_point",
                    "exprs": []
                  }
                }
              },
              "filter": null,
              "table": "entities.water_point"
            }
          ],
          "type": "bar"
        },
        "id": "e77cd4f4-27b5-4c47-b5de-2c776093e467"
      }, {
        "type": "widget",
        "aspectRatio": 1.4,
        "widgetType": "Map",
        "design": {
          "baseLayer": "bing_road",
          "layerViews": [],
          "filters": {},
          "bounds": {
            "w": -40,
            "n": 25,
            "e": 40,
            "s": -25
          }
        },
        "id": "e5c308ec-4874-4fab-bd9c-c9bc253ef60e"
      }
    ]
  },
  "layout": "blocks",
  "style": "default"
};

simpleBarChart = {
  "items": {
    "id": "root",
    "type": "root",
    "blocks": [
      {
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
                    "column": "type"
                  }
                },
                "y": {
                  "expr": {
                    "type": "op",
                    "op": "count",
                    "table": "entities.water_point",
                    "exprs": []
                  }
                }
              },
              "filter": null,
              "table": "entities.water_point"
            }
          ],
          "type": "bar",
          "transpose": true
        },
        "id": "f375fe0a-04ff-454e-8269-fbbafa7e3f8d"
      }
    ]
  },
  "layout": "blocks",
  "style": "greybg"
};

simplePieChart = {
  "items": {
    "id": "root",
    "type": "root",
    "blocks": [
      {
        "type": "widget",
        "aspectRatio": 1.4,
        "widgetType": "LayeredChart",
        "design": {
          "version": 2,
          "layers": [
            {
              "axes": {
                "y": {
                  "expr": {
                    "type": "op",
                    "op": "count",
                    "table": "entities.water_point",
                    "exprs": []
                  }
                },
                "color": {
                  "expr": {
                    "type": "field",
                    "table": "entities.water_point",
                    "column": "type"
                  },
                  "colorMap": [
                    {
                      "value": "Protected dug well",
                      "color": "#377eb8"
                    }, {
                      "value": "Unprotected dug well",
                      "color": "#4daf4a"
                    }, {
                      "value": "Borehole or tubewell",
                      "color": "#984ea3"
                    }, {
                      "value": "Protected spring",
                      "color": "#ff7f00"
                    }, {
                      "value": "Unprotected spring",
                      "color": "#ffff33"
                    }, {
                      "value": "Rainwater",
                      "color": "#a65628"
                    }, {
                      "value": "Surface water",
                      "color": "#f781bf"
                    }, {
                      "value": "Piped into dwelling",
                      "color": "#999999"
                    }, {
                      "value": "Piped into yard/plot",
                      "color": "#e41a1c"
                    }, {
                      "value": "Piped into public tap or basin",
                      "color": "#377eb8"
                    }, {
                      "value": "Bottled water",
                      "color": "#4daf4a"
                    }, {
                      "value": "Tanker truck",
                      "color": "#984ea3"
                    }, {
                      "value": "Cart with small tank/drum",
                      "color": "#ff7f00"
                    }, {
                      "value": "other",
                      "color": "#ffff33"
                    }, {
                      "value": null,
                      "color": "#aaaaaa"
                    }
                  ],
                  "drawOrder": ["Protected dug well", "Unprotected dug well", "Borehole or tubewell", "Protected spring", "Unprotected spring", "Rainwater", "Surface water", "Piped into dwelling", "Piped into yard/plot", "Piped into public tap or basin", "Bottled water", "Tanker truck", "Cart with small tank/drum", "other", null],
                  "excludedValues": []
                }
              },
              "filter": null,
              "table": "entities.water_point"
            }
          ],
          "type": "pie",
          "transpose": true
        },
        "id": "f375fe0a-04ff-454e-8269-fbbafa7e3f8d"
      }
    ]
  },
  "layout": "blocks",
  "style": "greybg",
  "quickfilters": [
    {
      "expr": {
        "type": "field",
        "table": "entities.water_point",
        "column": "type"
      },
      "label": null
    }
  ]
};

mapAndChartDashboard = {
  "items": {
    "id": "root",
    "type": "root",
    "blocks": [
      {
        "id": "0a38cdac-aae2-4e2a-9f6c-020b3ce2745f",
        "type": "horizontal",
        "blocks": [
          {
            "type": "widget",
            "aspectRatio": 1.4,
            "widgetType": "Map",
            "design": {
              "baseLayer": "bing_road",
              "layerViews": [],
              "filters": {},
              "bounds": {
                "w": -40,
                "n": 25,
                "e": 40,
                "s": -25
              }
            },
            "id": "0a9afebf-516c-4538-9592-bb5806edb2c9"
          }, {
            "type": "widget",
            "aspectRatio": 1.4,
            "widgetType": "LayeredChart",
            "design": {
              "version": 2,
              "layers": [
                {
                  "axes": {
                    "y": {
                      "expr": {
                        "type": "op",
                        "op": "count",
                        "table": "entities.water_point",
                        "exprs": []
                      }
                    },
                    "color": {
                      "expr": {
                        "type": "field",
                        "table": "entities.water_point",
                        "column": "type"
                      },
                      "colorMap": [
                        {
                          "value": "Protected dug well",
                          "color": "#377eb8"
                        }, {
                          "value": "Unprotected dug well",
                          "color": "#4daf4a"
                        }, {
                          "value": "Borehole or tubewell",
                          "color": "#984ea3"
                        }, {
                          "value": "Protected spring",
                          "color": "#ff7f00"
                        }, {
                          "value": "Unprotected spring",
                          "color": "#ffff33"
                        }, {
                          "value": "Rainwater",
                          "color": "#a65628"
                        }, {
                          "value": "Surface water",
                          "color": "#f781bf"
                        }, {
                          "value": "Piped into dwelling",
                          "color": "#999999"
                        }, {
                          "value": "Piped into yard/plot",
                          "color": "#e41a1c"
                        }, {
                          "value": "Piped into public tap or basin",
                          "color": "#377eb8"
                        }, {
                          "value": "Bottled water",
                          "color": "#4daf4a"
                        }, {
                          "value": "Tanker truck",
                          "color": "#984ea3"
                        }, {
                          "value": "Cart with small tank/drum",
                          "color": "#ff7f00"
                        }, {
                          "value": "other",
                          "color": "#ffff33"
                        }, {
                          "value": null,
                          "color": "#aaaaaa"
                        }
                      ],
                      "drawOrder": ["Protected dug well", "Unprotected dug well", "Borehole or tubewell", "Protected spring", "Unprotected spring", "Rainwater", "Surface water", "Piped into dwelling", "Piped into yard/plot", "Piped into public tap or basin", "Bottled water", "Tanker truck", "Cart with small tank/drum", "other", null],
                      "excludedValues": []
                    }
                  },
                  "filter": null,
                  "table": "entities.water_point"
                }
              ],
              "type": "pie",
              "transpose": true
            },
            "id": "f375fe0a-04ff-454e-8269-fbbafa7e3f8d"
          }
        ]
      }
    ]
  },
  "layout": "blocks",
  "style": "greybg",
  "quickfilters": [
    {
      "expr": {
        "type": "field",
        "table": "entities.water_point",
        "column": "type"
      },
      "label": null
    }
  ]
};

doubleClickMap = {
  "baseLayer": "cartodb_positron",
  "layerViews": [
    {
      "id": "8e22dc94-049a-4b20-85dc-70429328eb68",
      "name": "Untitled Layer",
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
          }
        },
        "color": "#b71c1c",
        "filter": {
          "type": "op",
          "table": "entities.water_point",
          "op": "within",
          "exprs": [
            {
              "type": "field",
              "table": "entities.water_point",
              "column": "admin_region"
            }, {
              "type": "literal",
              "valueType": "id",
              "idTable": "admin_regions",
              "value": "316f16a2-89e1-46b4-8a4b-561478997000"
            }
          ]
        },
        "table": "entities.water_point"
      }
    }, {
      "id": "8397c6b6-9d22-493c-b28a-a9604d977e38",
      "name": "Untitled Layer",
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
          }
        },
        "color": "#0088FF",
        "filter": null,
        "table": "entities.water_point"
      }
    }
  ],
  "filters": {
    "entities.water_point": null
  },
  "bounds": {
    "n": -1.71348600000001,
    "e": 33.775625,
    "s": -3.4254440000000197,
    "w": 32.045458
  },
  "autoBounds": true
};
