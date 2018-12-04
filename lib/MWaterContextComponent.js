var MWaterAddRelatedFormComponent, MWaterAddRelatedIndicatorComponent, MWaterContextComponent, MWaterGlobalFiltersComponent, MWaterTableSelectComponent, PropTypes, R, React, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

R = React.createElement;

MWaterTableSelectComponent = require('./MWaterTableSelectComponent');

MWaterAddRelatedFormComponent = require('./MWaterAddRelatedFormComponent');

MWaterAddRelatedIndicatorComponent = require('./MWaterAddRelatedIndicatorComponent');

MWaterGlobalFiltersComponent = require('./MWaterGlobalFiltersComponent');

module.exports = MWaterContextComponent = (function(superClass) {
  extend(MWaterContextComponent, superClass);

  function MWaterContextComponent() {
    this.handleAddTable = bind(this.handleAddTable, this);
    return MWaterContextComponent.__super__.constructor.apply(this, arguments);
  }

  MWaterContextComponent.propTypes = {
    apiUrl: PropTypes.string.isRequired,
    client: PropTypes.string,
    user: PropTypes.string,
    extraTables: PropTypes.arrayOf(PropTypes.string),
    onExtraTablesChange: PropTypes.func,
    schema: PropTypes.object.isRequired,
    addLayerElementFactory: PropTypes.func
  };

  MWaterContextComponent.childContextTypes = {
    tableSelectElementFactory: PropTypes.func,
    addLayerElementFactory: PropTypes.func,
    globalFiltersElementFactory: PropTypes.func,
    decorateScalarExprTreeSectionChildren: PropTypes.func,
    isScalarExprTreeSectionInitiallyOpen: PropTypes.func,
    isScalarExprTreeSectionMatch: PropTypes.func
  };

  MWaterContextComponent.prototype.getChildContext = function() {
    var context;
    context = {};
    context.tableSelectElementFactory = (function(_this) {
      return function(props) {
        return React.createElement(MWaterTableSelectComponent, {
          apiUrl: _this.props.apiUrl,
          client: _this.props.client,
          schema: props.schema,
          user: _this.props.user,
          table: props.value,
          onChange: props.onChange,
          extraTables: _this.props.extraTables,
          onExtraTablesChange: _this.props.onExtraTablesChange,
          filter: props.filter,
          onFilterChange: props.onFilterChange
        });
      };
    })(this);
    if (this.props.addLayerElementFactory) {
      context.addLayerElementFactory = this.props.addLayerElementFactory;
    }
    context.globalFiltersElementFactory = (function(_this) {
      return function(props) {
        if (props.nullIfIrrelevant && !_.any(props.filterableTables, function(t) {
          return t.match(/^entities./);
        })) {
          return null;
        }
        return React.createElement(MWaterGlobalFiltersComponent, props);
      };
    })(this);
    context.decorateScalarExprTreeSectionChildren = (function(_this) {
      return function(options) {
        if (options.tableId.match(/^entities\./) && options.section.id === "!related_forms") {
          return R('div', {
            key: "_add_related_form_parent"
          }, options.children, R(MWaterAddRelatedFormComponent, {
            key: "_add_related_form",
            table: options.tableId,
            apiUrl: _this.props.apiUrl,
            client: _this.props.client,
            user: _this.props.user,
            schema: _this.props.schema,
            onSelect: _this.handleAddTable
          }));
        }
        if (options.tableId.match(/^entities\./) && options.section.id === "!indicators") {
          return R('div', {
            key: "_add_related_indicator_parent"
          }, options.children, R(MWaterAddRelatedIndicatorComponent, {
            key: "_add_related_indicator",
            table: options.tableId,
            apiUrl: _this.props.apiUrl,
            client: _this.props.client,
            user: _this.props.user,
            schema: _this.props.schema,
            onSelect: _this.handleAddTable,
            filter: options.filter
          }));
        } else {
          return options.children;
        }
      };
    })(this);
    context.isScalarExprTreeSectionMatch = (function(_this) {
      return function(options) {
        if (options.tableId.match(/^entities\./) && options.section.id === "!indicators") {
          return true;
        }
        return null;
      };
    })(this);
    context.isScalarExprTreeSectionInitiallyOpen = (function(_this) {
      return function(options) {
        if (options.tableId.match(/^entities\./) && options.section.id === "!indicators") {
          return true;
        }
        return null;
      };
    })(this);
    return context;
  };

  MWaterContextComponent.prototype.handleAddTable = function(table) {
    var extraTables;
    extraTables = _.union(this.props.extraTables, [table]);
    return this.props.onExtraTablesChange(extraTables);
  };

  MWaterContextComponent.prototype.render = function() {
    return this.props.children;
  };

  return MWaterContextComponent;

})(React.Component);
