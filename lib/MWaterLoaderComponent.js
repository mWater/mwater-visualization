var H, LayerFactory, MWaterDataSource, MWaterLoaderComponent, MWaterTableSelectComponent, React, Schema, WidgetFactory, _, querystring,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

Schema = require('mwater-expressions').Schema;

LayerFactory = require('./maps/LayerFactory');

WidgetFactory = require('./widgets/WidgetFactory');

MWaterDataSource = require('./MWaterDataSource');

MWaterTableSelectComponent = require('./MWaterTableSelectComponent');

querystring = require('querystring');

module.exports = MWaterLoaderComponent = (function(superClass) {
  extend(MWaterLoaderComponent, superClass);

  MWaterLoaderComponent.propTypes = {
    apiUrl: React.PropTypes.string.isRequired,
    client: React.PropTypes.string,
    user: React.PropTypes.string,
    formIds: React.PropTypes.arrayOf(React.PropTypes.string),
    onFormIdsChange: React.PropTypes.func.isRequired,
    onMarkerClick: React.PropTypes.func,
    children: React.PropTypes.func.isRequired
  };

  function MWaterLoaderComponent() {
    MWaterLoaderComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      schema: null,
      dataSource: null,
      widgetFactory: null,
      layerFactory: null
    };
    this.mounted = false;
  }

  MWaterLoaderComponent.prototype.componentDidMount = function() {
    this.mounted = true;
    return this.updateSchema(this.props, null);
  };

  MWaterLoaderComponent.prototype.componentWillReceiveProps = function(nextProps) {
    return this.updateSchema(nextProps, this.props);
  };

  MWaterLoaderComponent.prototype.componentWillUnmount = function() {
    return this.mounted = false;
  };

  MWaterLoaderComponent.prototype.updateSchema = function(newProps, oldProps) {
    var query, url;
    if (oldProps && _.isEqual(newProps.formIds, oldProps.formIds)) {
      return;
    }
    url = this.props.apiUrl + "jsonql/schema";
    query = {};
    if (this.props.client) {
      query.client = this.props.client;
    }
    if (this.props.formIds && this.props.formIds.length > 0) {
      query.formIds = this.props.formIds.join(',');
    }
    url += "?" + querystring.stringify(query);
    return $.getJSON(url, (function(_this) {
      return function(schemaJson) {
        var dataSource, layerFactory, schema, widgetFactory;
        if (!_this.mounted) {
          return;
        }
        schema = new Schema(schemaJson);
        dataSource = new MWaterDataSource(_this.props.apiUrl, _this.props.client, false);
        layerFactory = new LayerFactory({
          schema: schema,
          dataSource: dataSource,
          apiUrl: _this.props.apiUrl,
          client: _this.props.client,
          newLayers: [
            {
              name: "Custom Layer",
              type: "Markers",
              design: {}
            }
          ],
          onMarkerClick: _this.props.onMarkerClick
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
            onChange: onChange
          });
        };
      })(this)
    };
  };

  MWaterLoaderComponent.prototype.render = function() {
    if (!this.state.schema) {
      return H.div(null, "Loading...");
    }
    return this.props.children({
      schema: this.state.schema,
      dataSource: this.state.dataSource,
      layerFactory: this.state.layerFactory,
      widgetFactory: this.state.widgetFactory
    });
  };

  return MWaterLoaderComponent;

})(React.Component);
