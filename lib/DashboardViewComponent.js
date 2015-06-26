var DashboardViewComponent, H, LegoLayoutEngine, React, WidgetContainerComponent, WidgetScoper,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

LegoLayoutEngine = require('./LegoLayoutEngine');

WidgetScoper = require('./WidgetScoper');

WidgetContainerComponent = require('./WidgetContainerComponent');

module.exports = DashboardViewComponent = (function(superClass) {
  extend(DashboardViewComponent, superClass);

  DashboardViewComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func.isRequired,
    selectedWidgetId: React.PropTypes.string,
    onSelectedWidgetIdChange: React.PropTypes.func.isRequired,
    isDesigning: React.PropTypes.bool.isRequired,
    onIsDesigningChange: React.PropTypes.func,
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    widgetFactory: React.PropTypes.object.isRequired
  };

  function DashboardViewComponent(props) {
    this.handleClick = bind(this.handleClick, this);
    this.handleScopeChange = bind(this.handleScopeChange, this);
    this.handleLayoutUpdate = bind(this.handleLayoutUpdate, this);
    DashboardViewComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      widgetScoper: new WidgetScoper()
    };
  }

  DashboardViewComponent.prototype.handleLayoutUpdate = function(layouts) {
    var design, items;
    items = _.mapValues(this.props.design.items, (function(_this) {
      return function(item, id) {
        return _.extend({}, item, {
          layout: layouts[id]
        });
      };
    })(this));
    design = _.extend({}, this.props.design, {
      items: items
    });
    return this.props.onDesignChange(design);
  };

  DashboardViewComponent.prototype.handleScopeChange = function(scope, filter) {
    return this.setState({
      widgetScoper: this.state.widgetScoper.applyScope(id, scope, filter)
    });
  };

  DashboardViewComponent.prototype.handleClick = function(ev) {
    ev.stopPropagation();
    return this.props.onSelectedWidgetIdChange(null);
  };

  DashboardViewComponent.prototype.render = function() {
    var elems, layoutEngine, layouts, widgets;
    layoutEngine = new LegoLayoutEngine(this.props.width, 12);
    layouts = _.mapValues(this.props.design.items, "layout");
    widgets = _.mapValues(this.props.design.items, (function(_this) {
      return function(item) {
        return _this.props.widgetFactory.createWidget(item.widget.type, item.widget.version, item.widget.design);
      };
    })(this));
    elems = _.mapValues(widgets, (function(_this) {
      return function(widget, id) {
        return widget.createViewElement({
          width: 0,
          height: 0,
          selected: id === _this.props.selectedWidgetId,
          onSelect: _this.props.onSelectedWidgetIdChange.bind(null, id),
          scope: _this.state.widgetScoper.getScope(id),
          filters: _this.state.widgetScoper.getFilters(id),
          onScopeChange: _this.handleScopeChange
        });
      };
    })(this));
    return H.div({
      onClick: this.handleClick
    }, React.createElement(WidgetContainerComponent, {
      layoutEngine: layoutEngine,
      layouts: layouts,
      elems: elems,
      onLayoutUpdate: this.handleLayoutUpdate,
      width: this.props.width,
      height: this.props.height
    }));
  };

  return DashboardViewComponent;

})(React.Component);
