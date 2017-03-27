var AsyncLoadComponent, H, LoadingComponent, MWaterAddRelatedFormComponent, MWaterDataSource, MWaterLoaderComponent, MWaterTableSelectComponent, R, React, Schema, _, mWaterLoader, querystring,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

Schema = require('mwater-expressions').Schema;

MWaterDataSource = require('mwater-expressions/lib/MWaterDataSource');

MWaterTableSelectComponent = require('./MWaterTableSelectComponent');

MWaterAddRelatedFormComponent = require('./MWaterAddRelatedFormComponent');

querystring = require('querystring');

AsyncLoadComponent = require('react-library/lib/AsyncLoadComponent');

LoadingComponent = require('react-library/lib/LoadingComponent');

mWaterLoader = require('./mWaterLoader');

module.exports = MWaterLoaderComponent = (function(superClass) {
  extend(MWaterLoaderComponent, superClass);

  MWaterLoaderComponent.propTypes = {
    apiUrl: React.PropTypes.string.isRequired,
    client: React.PropTypes.string,
    share: React.PropTypes.string,
    user: React.PropTypes.string,
    asUser: React.PropTypes.string,
    extraTables: React.PropTypes.arrayOf(React.PropTypes.string),
    onExtraTablesChange: React.PropTypes.func,
    addLayerElementFactory: React.PropTypes.func,
    children: React.PropTypes.func.isRequired
  };

  function MWaterLoaderComponent() {
    this.handleAddTable = bind(this.handleAddTable, this);
    MWaterLoaderComponent.__super__.constructor.apply(this, arguments);
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
            error: "Cannot load one of the forms that this depends on. Perhaps the administrator has not shared the form with you?"
          });
        }
        return callback({
          schema: config.schema,
          dataSource: config.dataSource
        });
      };
    })(this));
  };

  MWaterLoaderComponent.childContextTypes = {
    tableSelectElementFactory: React.PropTypes.func,
    addLayerElementFactory: React.PropTypes.func,
    decorateScalarExprTreeSectionChildren: React.PropTypes.func
  };

  MWaterLoaderComponent.prototype.getChildContext = function() {
    var context;
    context = {};
    context.tableSelectElementFactory = (function(_this) {
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
    })(this);
    if (this.props.addLayerElementFactory) {
      context.addLayerElementFactory = this.props.addLayerElementFactory;
    }
    context.decorateScalarExprTreeSectionChildren = (function(_this) {
      return function(options) {
        if (options.tableId.match(/^entities\./) && options.section.id === "!related_forms") {
          return H.div(null, options.children, R(MWaterAddRelatedFormComponent, {
            table: options.tableId,
            apiUrl: _this.props.apiUrl,
            client: _this.props.client,
            user: _this.props.user,
            schema: _this.state.schema,
            onSelect: _this.handleAddTable
          }));
        } else {
          return options.children;
        }
      };
    })(this);
    return context;
  };

  MWaterLoaderComponent.prototype.handleAddTable = function(table) {
    var extraTables;
    extraTables = _.union(this.props.extraTables, [table]);
    return this.props.onExtraTablesChange(extraTables);
  };

  MWaterLoaderComponent.prototype.render = function() {
    if (!this.state.schema && !this.state.error) {
      return React.createElement(LoadingComponent);
    }
    return this.props.children(this.state.error, {
      schema: this.state.schema,
      dataSource: this.state.dataSource
    });
  };

  return MWaterLoaderComponent;

})(AsyncLoadComponent);
