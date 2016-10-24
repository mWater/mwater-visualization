var ActionCancelModalComponent, FiltersDesignerComponent, H, LayoutManager, QuickfiltersDesignComponent, R, React, SettingsModalComponent, WidgetFactory, _, update,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

update = require('update-object');

LayoutManager = require('../layouts/LayoutManager');

WidgetFactory = require('../widgets/WidgetFactory');

ActionCancelModalComponent = require('react-library/lib/ActionCancelModalComponent');

QuickfiltersDesignComponent = require('../quickfilter/QuickfiltersDesignComponent');

FiltersDesignerComponent = require('../FiltersDesignerComponent');

module.exports = SettingsModalComponent = (function(superClass) {
  extend(SettingsModalComponent, superClass);

  SettingsModalComponent.propTypes = {
    onDesignChange: React.PropTypes.func.isRequired,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired
  };

  function SettingsModalComponent(props) {
    this.handleFiltersChange = bind(this.handleFiltersChange, this);
    this.handleDesignChange = bind(this.handleDesignChange, this);
    this.handleCancel = bind(this.handleCancel, this);
    this.handleSave = bind(this.handleSave, this);
    SettingsModalComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      design: null
    };
  }

  SettingsModalComponent.prototype.show = function(design) {
    return this.setState({
      design: design
    });
  };

  SettingsModalComponent.prototype.handleSave = function() {
    this.props.onDesignChange(this.state.design);
    return this.setState({
      design: null
    });
  };

  SettingsModalComponent.prototype.handleCancel = function() {
    return this.setState({
      design: null
    });
  };

  SettingsModalComponent.prototype.handleDesignChange = function(design) {
    return this.setState({
      design: design
    });
  };

  SettingsModalComponent.prototype.handleFiltersChange = function(filters) {
    var design;
    design = _.extend({}, this.state.design, {
      filters: filters
    });
    return this.handleDesignChange(design);
  };

  SettingsModalComponent.prototype.render = function() {
    var filterableTables, i, layoutManager, len, ref, widget, widgetItem;
    if (!this.state.design) {
      return null;
    }
    layoutManager = LayoutManager.createLayoutManager(this.state.design.layout);
    filterableTables = [];
    ref = layoutManager.getAllWidgets(this.state.design.items);
    for (i = 0, len = ref.length; i < len; i++) {
      widgetItem = ref[i];
      widget = WidgetFactory.createWidget(widgetItem.type);
      filterableTables = filterableTables.concat(widget.getFilterableTables(widgetItem.design, this.props.schema));
    }
    filterableTables = _.filter(_.uniq(filterableTables), (function(_this) {
      return function(table) {
        return _this.props.schema.getTable(table);
      };
    })(this));
    return R(ActionCancelModalComponent, {
      size: "large",
      onCancel: this.handleCancel,
      onAction: this.handleSave
    }, H.div({
      style: {
        paddingBottom: 200
      }
    }, H.h4(null, "Quick Filters"), H.div({
      className: "text-muted"
    }, "Quick filters are shown to the user at the top of the dashboard and can be used to filter data of widgets."), R(QuickfiltersDesignComponent, {
      design: this.state.design.quickfilters,
      onDesignChange: (function(_this) {
        return function(design) {
          return _this.handleDesignChange(update(_this.state.design, {
            quickfilters: {
              $set: design
            }
          }));
        };
      })(this),
      schema: this.props.schema,
      dataSource: this.props.dataSource
    }), H.h4({
      style: {
        paddingTop: 10
      }
    }, "Filters"), H.div({
      className: "text-muted"
    }, "Filters are built in to the dashboard and cannot be changed by viewers of the dashboard."), filterableTables.length > 0 ? R(FiltersDesignerComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      filters: this.state.design.filters,
      onFiltersChange: this.handleFiltersChange,
      filterableTables: filterableTables
    }) : "Nothing to filter. Add widgets to the dashboard"));
  };

  return SettingsModalComponent;

})(React.Component);
