var DashboardPane, DataSource, H, LayerFactory, LayeredChart, LayeredChartDesignerComponent, MWaterDashboardPane, MWaterDataSource, MWaterLoaderComponent, React, ReactDOM, Schema, WidgetFactory, dashboardDesign, visualization,
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

MWaterLoaderComponent = require('./MWaterLoaderComponent');

MWaterDataSource = require('mwater-expressions/lib/MWaterDataSource');

DashboardPane = (function(superClass) {
  extend(DashboardPane, superClass);

  function DashboardPane(props) {
    this.handleDesignChange = bind(this.handleDesignChange, this);
    DashboardPane.__super__.constructor.apply(this, arguments);
    this.state = {
      schema: null,
      dataSource: null,
      design: dashboardDesign
    };
  }

  DashboardPane.prototype.componentDidMount = function() {
    return $.getJSON(this.props.apiUrl + "jsonql/schema", (function(_this) {
      return function(schemaJson) {
        var dataSource, layerFactory, schema, widgetFactory;
        schema = new Schema(schemaJson);
        dataSource = new MWaterDataSource(_this.props.apiUrl, _this.props.client, false);
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
        widgetFactory = new WidgetFactory({
          schema: schema,
          dataSource: dataSource,
          layerFactory: layerFactory
        });
        return _this.setState({
          schema: schema,
          dataSource: dataSource,
          layerFactory: layerFactory,
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
      onDesignChange: this.handleDesignChange,
      titleElem: "Sample"
    }));
  };

  return DashboardPane;

})(React.Component);

MWaterDashboardPane = (function(superClass) {
  extend(MWaterDashboardPane, superClass);

  function MWaterDashboardPane(props) {
    this.handleDesignChange = bind(this.handleDesignChange, this);
    MWaterDashboardPane.__super__.constructor.apply(this, arguments);
    this.state = {
      design: dashboardDesign,
      formIds: ["e24f0a0ec11643cab3c21c07de2f6889"]
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

$(function() {
  var sample;
  sample = H.div({
    className: "container-fluid",
    style: {
      height: "100%"
    }
  }, H.style(null, 'html, body, #main { height: 100% }'), React.createElement(MWaterDashboardPane, {
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

dashboardDesign = {
  "items": {
    "e845bb49-8c50-44e5-9b4c-7bf5a2765284": {
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
                "color": {
                  "expr": {
                    "type": "field",
                    "table": "responses:e24f0a0ec11643cab3c21c07de2f6889",
                    "column": "data:ef40dba8338d4ebdbbc5808e78969e95:value"
                  },
                  "xform": null
                },
                "y": {
                  "expr": {
                    "type": "id",
                    "table": "responses:e24f0a0ec11643cab3c21c07de2f6889"
                  },
                  "aggr": "count",
                  "xform": null
                }
              },
              "filter": null,
              "table": "responses:e24f0a0ec11643cab3c21c07de2f6889"
            }
          ],
          "type": "donut"
        }
      }
    }
  }
};
