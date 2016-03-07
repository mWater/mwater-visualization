var AsyncLoadComponent, H, LayerFactory, MWaterDataSource, MWaterLoaderComponent, MWaterTableSelectComponent, React, Schema, WidgetFactory, _, querystring,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

Schema = require('mwater-expressions').Schema;

LayerFactory = require('./maps/LayerFactory');

WidgetFactory = require('./widgets/WidgetFactory');

MWaterDataSource = require('mwater-expressions/lib/MWaterDataSource');

MWaterTableSelectComponent = require('./MWaterTableSelectComponent');

querystring = require('querystring');

AsyncLoadComponent = require('react-library/lib/AsyncLoadComponent');

module.exports = MWaterLoaderComponent = (function(superClass) {
  extend(MWaterLoaderComponent, superClass);

  MWaterLoaderComponent.propTypes = {
    apiUrl: React.PropTypes.string.isRequired,
    client: React.PropTypes.string,
    user: React.PropTypes.string,
    extraTables: React.PropTypes.arrayOf(React.PropTypes.string),
    onExtraTablesChange: React.PropTypes.func,
    onMarkerClick: React.PropTypes.func,
    newLayers: React.PropTypes.arrayOf(React.PropTypes.shape({
      name: React.PropTypes.string.isRequired,
      type: React.PropTypes.string.isRequired,
      design: React.PropTypes.object.isRequired
    })),
    children: React.PropTypes.func.isRequired
  };

  MWaterLoaderComponent.defaultProps = {
    newLayers: [
      {
        label: "Custom Marker Layer",
        name: "Untitled Layer",
        type: "Markers",
        design: {}
      }, {
        label: "Choropleth Indicator Layer (experimental)",
        name: "Untitled Layer",
        type: "AdminIndicatorChoropleth",
        design: {}
      }
    ]
  };

  function MWaterLoaderComponent() {
    MWaterLoaderComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      error: null,
      schema: null,
      dataSource: null,
      widgetFactory: null,
      layerFactory: null
    };
    this.mounted = false;
  }

  MWaterLoaderComponent.prototype.isLoadNeeded = function(newProps, oldProps) {
    return !_.isEqual(_.pick(newProps, "apiUrl", "client", "user", "extraTables"), _.pick(oldProps, "apiUrl", "client", "user", "extraTables"));
  };

  MWaterLoaderComponent.prototype.load = function(props, prevProps, callback) {
    var query, url;
    url = props.apiUrl + "jsonql/schema";
    query = {};
    if (props.client) {
      query.client = props.client;
    }
    if (props.extraTables && props.extraTables.length > 0) {
      query.extraTables = props.extraTables.join(',');
    }
    url += "?" + querystring.stringify(query);
    return $.getJSON(url, (function(_this) {
      return function(schemaJson) {
        var dataSource, layerFactory, schema, widgetFactory;
        schema = new Schema(schemaJson);
        dataSource = new MWaterDataSource(props.apiUrl, props.client, {
          serverCaching: false,
          localCaching: true
        });
        layerFactory = new LayerFactory({
          schema: schema,
          dataSource: dataSource,
          apiUrl: props.apiUrl,
          client: props.client,
          newLayers: props.newLayers,
          onMarkerClick: props.onMarkerClick
        });
        widgetFactory = new WidgetFactory({
          schema: schema,
          dataSource: dataSource,
          layerFactory: layerFactory
        });
        return callback({
          schema: schema,
          dataSource: dataSource,
          layerFactory: layerFactory,
          widgetFactory: widgetFactory
        });
      };
    })(this)).fail((function(_this) {
      return function(xhr) {
        console.log(xhr.responseText);
        return callback({
          error: "Cannot load one of the forms that this depends on. Perhaps the administrator has not shared the form with you?"
        });
      };
    })(this));
  };

  MWaterLoaderComponent.childContextTypes = {
    tableSelectElementFactory: React.PropTypes.func
  };

  MWaterLoaderComponent.prototype.getChildContext = function() {
    return {
      tableSelectElementFactory: (function(_this) {
        return function(schema, value, onChange) {
          return React.createElement(MWaterTableSelectComponent, {
            apiUrl: _this.props.apiUrl,
            client: _this.props.client,
            schema: schema,
            user: _this.props.user,
            table: value,
            onChange: onChange,
            extraTables: _this.props.extraTables,
            onExtraTablesChange: _this.props.onExtraTablesChange
          });
        };
      })(this)
    };
  };

  MWaterLoaderComponent.prototype.render = function() {
    if (!this.state.schema && !this.state.error) {
      return H.div(null, "Loading...");
    }
    return this.props.children(this.state.error, {
      schema: this.state.schema,
      dataSource: this.state.dataSource,
      layerFactory: this.state.layerFactory,
      widgetFactory: this.state.widgetFactory
    });
  };

  return MWaterLoaderComponent;

})(AsyncLoadComponent);
