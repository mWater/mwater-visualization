var H, LayerFactory, MWaterDataSource, MWaterLoaderComponent, MWaterTableSelectComponent, React, Schema, WidgetFactory, _, querystring,
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

module.exports = MWaterLoaderComponent = (function(superClass) {
  extend(MWaterLoaderComponent, superClass);

  MWaterLoaderComponent.propTypes = {
    apiUrl: React.PropTypes.string.isRequired,
    client: React.PropTypes.string,
    user: React.PropTypes.string,
    formIds: React.PropTypes.arrayOf(React.PropTypes.string),
    onFormIdsChange: React.PropTypes.func,
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
        name: "Custom Layer",
        type: "Markers",
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
    url = newProps.apiUrl + "jsonql/schema";
    query = {};
    if (newProps.client) {
      query.client = newProps.client;
    }
    if (newProps.formIds && newProps.formIds.length > 0) {
      query.formIds = newProps.formIds.join(',');
    }
    url += "?" + querystring.stringify(query);
    return $.getJSON(url, (function(_this) {
      return function(schemaJson) {
        var dataSource, layerFactory, schema, widgetFactory;
        if (!_this.mounted) {
          return;
        }
        schema = new Schema(schemaJson);
        dataSource = new MWaterDataSource(newProps.apiUrl, newProps.client, false);
        layerFactory = new LayerFactory({
          schema: schema,
          dataSource: dataSource,
          apiUrl: newProps.apiUrl,
          client: newProps.client,
          newLayers: [
            {
              name: "Custom Layer",
              type: "Markers",
              design: {}
            }
          ],
          onMarkerClick: newProps.onMarkerClick
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
    })(this)).fail((function(_this) {
      return function(xhr) {
        return _this.setState({
          error: xhr.responseText
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
            formIds: _this.props.formIds,
            onFormIdsChange: _this.props.onFormIdsChange
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

})(React.Component);
