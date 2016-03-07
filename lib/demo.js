var CalendarChartViewComponent, DataSource, H, LayerFactory, LayeredChart, LayeredChartDesignerComponent, MWaterDashboardPane, MWaterDataSource, MWaterDatagridDesignerPane, MWaterLoaderComponent, MWaterMapPane, React, ReactDOM, Schema, WidgetFactory, dashboardDesign, mapDesign, visualization,
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
      extraTables: []
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
      extraTables: []
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
    apiUrl: "http://localhost:1234/v3/",
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
      name: "Choropleth",
      type: "AdminIndicatorChoropleth",
      design: {
        scope: '39dc194a-ffed-4a9c-95bf-1761a8d0b794',
        table: "entities.water_point",
        adminRegionExpr: {
          type: "scalar",
          table: "entities.water_point",
          joins: ['admin_region'],
          expr: {
            type: "id",
            table: "admin_regions"
          }
        },
        detailLevel: 1,
        condition: {
          type: "op",
          op: "=",
          table: "entities.water_point",
          exprs: [
            {
              type: "field",
              table: "entities.water_point",
              column: "type"
            }, {
              type: "literal",
              valueType: "enum",
              value: "Protected dug well"
            }
          ]
        }
      },
      visible: true
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
    "942e0cee-fd4f-4ff6-b394-c1091180ecdb": {
      "layout": {
        "x": 0,
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
                  "type": "field",
                  "table": "entities.water_point",
                  "column": "name"
                }
              }
            }
          ],
          "orderings": [],
          "table": "entities.water_point",
          "filter": {
            "type": "op",
            "table": "entities.water_point",
            "op": "within",
            "exprs": [
              {
                "type": "scalar",
                "table": "entities.water_point",
                "joins": ["admin_region"],
                "expr": {
                  "type": "id",
                  "table": "admin_regions"
                }
              }, {
                "type": "literal",
                "valueType": "id",
                "idTable": "admin_regions",
                "value": "abed5734-4598-45ac-8d7b-def868c2cb7c"
              }
            ]
          }
        }
      }
    }
  }
};
