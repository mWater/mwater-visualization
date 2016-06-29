var DashboardViewComponent, H, LegoLayoutEngine, React, ReactElementPrinter, WidgetContainerComponent, WidgetFactory, WidgetScoper, WidgetScopesViewComponent, uuid,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

LegoLayoutEngine = require('./LegoLayoutEngine');

WidgetFactory = require('./WidgetFactory');

WidgetScoper = require('./WidgetScoper');

WidgetContainerComponent = require('./WidgetContainerComponent');

ReactElementPrinter = require('react-library/lib/ReactElementPrinter');

WidgetScopesViewComponent = require('./WidgetScopesViewComponent');

uuid = require('node-uuid');

module.exports = DashboardViewComponent = (function(superClass) {
  extend(DashboardViewComponent, superClass);

  DashboardViewComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    dashboardDataSource: React.PropTypes.object.isRequired,
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func,
    width: React.PropTypes.number,
    standardWidth: React.PropTypes.number,
    filters: React.PropTypes.arrayOf(React.PropTypes.shape({
      table: React.PropTypes.string.isRequired,
      jsonql: React.PropTypes.object.isRequired
    }))
  };

  DashboardViewComponent.defaultProps = {
    standardWidth: 1440
  };

  function DashboardViewComponent(props) {
    this.print = bind(this.print, this);
    this.handleDesignChange = bind(this.handleDesignChange, this);
    this.handleRemoveScope = bind(this.handleRemoveScope, this);
    this.handleDuplicate = bind(this.handleDuplicate, this);
    this.handleRemove = bind(this.handleRemove, this);
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

  DashboardViewComponent.prototype.handleScopeChange = function(id, scope) {
    return this.setState({
      widgetScoper: this.state.widgetScoper.applyScope(id, scope)
    });
  };

  DashboardViewComponent.prototype.handleRemove = function(id) {
    var design, items;
    items = _.omit(this.props.design.items, id);
    design = _.extend({}, this.props.design, {
      items: items
    });
    return this.props.onDesignChange(design);
  };

  DashboardViewComponent.prototype.handleDuplicate = function(id) {
    var design, item, items;
    item = this.props.design.items[id];
    items = _.extend({}, this.props.design.items);
    items[uuid.v4()] = item;
    design = _.extend({}, this.props.design, {
      items: items
    });
    return this.props.onDesignChange(design);
  };

  DashboardViewComponent.prototype.handleRemoveScope = function(id) {
    return this.setState({
      widgetScoper: this.state.widgetScoper.applyScope(id, null)
    });
  };

  DashboardViewComponent.prototype.handleDesignChange = function(id, widgetDesign) {
    var design, item, items, widget;
    widget = this.props.design.items[id].widget;
    widget = _.extend({}, widget, {
      design: widgetDesign
    });
    item = this.props.design.items[id];
    item = _.extend({}, item, {
      widget: widget
    });
    items = _.clone(this.props.design.items);
    items[id] = item;
    design = _.extend({}, this.props.design, {
      items: items
    });
    return this.props.onDesignChange(design);
  };

  DashboardViewComponent.prototype.print = function() {
    var elem, printer;
    elem = H.div({
      style: {
        transform: "scale(0.5)",
        transformOrigin: "top left"
      }
    }, React.createElement(DashboardViewComponent, _.extend({}, this.props, {
      width: 1440
    })));
    printer = new ReactElementPrinter();
    return printer.print(elem, {
      delay: 5000
    });
  };

  DashboardViewComponent.prototype.renderScopes = function() {
    return React.createElement(WidgetScopesViewComponent, {
      scopes: this.state.widgetScoper.getScopes(),
      onRemoveScope: this.handleRemoveScope
    });
  };

  DashboardViewComponent.prototype.renderPageBreaks = function(layoutEngine, layouts) {
    var elems, height, i, j, number, pageHeight, ref;
    height = layoutEngine.calculateHeight(layouts);
    pageHeight = this.props.width / 7.5 * 10;
    number = Math.floor(height / pageHeight);
    elems = [];
    if (number > 0) {
      for (i = j = 1, ref = number; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
        elems.push(H.div({
          className: "mwater-visualization-page-break",
          style: {
            position: "absolute",
            top: i * pageHeight
          }
        }));
      }
    }
    return elems;
  };

  DashboardViewComponent.prototype.render = function() {
    var elems, layoutEngine, layouts, style;
    layoutEngine = new LegoLayoutEngine(this.props.width, 24);
    layouts = _.mapValues(this.props.design.items, "layout");
    elems = _.mapValues(this.props.design.items, (function(_this) {
      return function(item, id) {
        var filters, widget;
        widget = WidgetFactory.createWidget(item.widget.type);
        filters = _this.props.filters || [];
        filters = filters.concat(_this.state.widgetScoper.getFilters(id));
        return widget.createViewElement({
          schema: _this.props.schema,
          dataSource: _this.props.dataSource,
          widgetDataSource: _this.props.dashboardDataSource.getWidgetDataSource(id),
          design: item.widget.design,
          scope: _this.state.widgetScoper.getScope(id),
          filters: filters,
          onScopeChange: _this.handleScopeChange.bind(null, id),
          onRemove: _this.props.onDesignChange != null ? _this.handleRemove.bind(null, id) : void 0,
          onDuplicate: _this.props.onDesignChange != null ? _this.handleDuplicate.bind(null, id) : void 0,
          onDesignChange: _this.props.onDesignChange != null ? _this.handleDesignChange.bind(null, id) : void 0
        });
      };
    })(this));
    style = {
      height: "100%",
      position: "relative"
    };
    return H.div({
      style: style,
      className: "mwater-visualization-dashboard",
      onClick: this.handleClick
    }, H.div(null, this.renderScopes(), React.createElement(WidgetContainerComponent, {
      layoutEngine: layoutEngine,
      layouts: layouts,
      elems: elems,
      onLayoutUpdate: this.props.onDesignChange != null ? this.handleLayoutUpdate : void 0,
      width: this.props.width,
      standardWidth: this.props.standardWidth
    }), this.renderPageBreaks(layoutEngine, layouts)));
  };

  return DashboardViewComponent;

})(React.Component);
