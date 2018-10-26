var AsyncLoadComponent, LoadingComponent, MWaterContextComponent, MWaterLoaderComponent, PropTypes, R, React, Schema, _, mWaterLoader, querystring,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

R = React.createElement;

Schema = require('mwater-expressions').Schema;

querystring = require('querystring');

AsyncLoadComponent = require('react-library/lib/AsyncLoadComponent');

LoadingComponent = require('react-library/lib/LoadingComponent');

mWaterLoader = require('./mWaterLoader');

MWaterContextComponent = require('./MWaterContextComponent');

module.exports = MWaterLoaderComponent = (function(superClass) {
  extend(MWaterLoaderComponent, superClass);

  MWaterLoaderComponent.propTypes = {
    apiUrl: PropTypes.string.isRequired,
    client: PropTypes.string,
    share: PropTypes.string,
    user: PropTypes.string,
    asUser: PropTypes.string,
    extraTables: PropTypes.arrayOf(PropTypes.string),
    onExtraTablesChange: PropTypes.func,
    addLayerElementFactory: PropTypes.func,
    children: PropTypes.func.isRequired
  };

  function MWaterLoaderComponent(props) {
    MWaterLoaderComponent.__super__.constructor.call(this, props);
    this.state = {
      error: null,
      schema: null,
      dataSource: null
    };
    this.mounted = false;
  }

  MWaterLoaderComponent.prototype.isLoadNeeded = function(newProps, oldProps) {
    return !_.isEqual(_.pick(newProps, "apiUrl", "client", "user", "share", "asUser", "extraTables"), _.pick(oldProps, "apiUrl", "client", "user", "share", "asUser", "extraTables"));
  };

  MWaterLoaderComponent.prototype.load = function(props, prevProps, callback) {
    return mWaterLoader({
      apiUrl: props.apiUrl,
      client: props.client,
      share: props.share,
      asUser: props.asUser,
      extraTables: props.extraTables
    }, (function(_this) {
      return function(error, config) {
        if (error) {
          console.log(error.message);
          return callback({
            error: "Cannot load one of the forms that this depends on. Perhaps the administrator has not shared the form with you? Details: " + error.message
          });
        }
        return callback({
          schema: config.schema,
          dataSource: config.dataSource
        });
      };
    })(this));
  };

  MWaterLoaderComponent.prototype.render = function() {
    if (!this.state.schema && !this.state.error) {
      return React.createElement(LoadingComponent);
    }
    return R(MWaterContextComponent, {
      apiUrl: this.props.apiUrl,
      client: this.props.client,
      user: this.props.user,
      extraTables: this.props.extraTables,
      onExtraTablesChange: this.props.onExtraTablesChange,
      addLayerElementFactory: this.props.addLayerElementFactory
    }, this.props.children(this.state.error, {
      schema: this.state.schema,
      dataSource: this.state.dataSource
    }));
  };

  return MWaterLoaderComponent;

})(AsyncLoadComponent);
