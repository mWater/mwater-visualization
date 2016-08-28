var DashboardViewComponent, DragDropContextComponent, H, HTML5Backend, LayoutManager, NestableDragDropContext, R, React, ReactElementPrinter, WidgetFactory, WidgetScoper, WidgetScopesViewComponent, uuid,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

R = React.createElement;

uuid = require('node-uuid');

HTML5Backend = require('react-dnd-html5-backend');

NestableDragDropContext = require("react-library/lib/NestableDragDropContext");

WidgetFactory = require('../widgets/WidgetFactory');

WidgetScoper = require('../widgets/WidgetScoper');

ReactElementPrinter = require('react-library/lib/ReactElementPrinter');

LayoutManager = require('../layouts/LayoutManager');

WidgetScopesViewComponent = require('../widgets/WidgetScopesViewComponent');

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
    this.handleItemsChange = bind(this.handleItemsChange, this);
    this.handleRemoveScope = bind(this.handleRemoveScope, this);
    this.handleScopeChange = bind(this.handleScopeChange, this);
    DashboardViewComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      widgetScoper: new WidgetScoper()
    };
  }

  DashboardViewComponent.prototype.handleScopeChange = function(id, scope) {
    return this.setState({
      widgetScoper: this.state.widgetScoper.applyScope(id, scope)
    });
  };

  DashboardViewComponent.prototype.handleRemoveScope = function(id) {
    return this.setState({
      widgetScoper: this.state.widgetScoper.applyScope(id, null)
    });
  };

  DashboardViewComponent.prototype.handleItemsChange = function(items) {
    var design;
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
    }, R(DashboardViewComponent, _.extend({}, this.props, {
      width: 1440,
      standardWidth: 1440,
      onDesignChange: null
    })));
    printer = new ReactElementPrinter();
    return printer.print(elem, {
      delay: 5000
    });
  };

  DashboardViewComponent.prototype.renderScopes = function() {
    return R(WidgetScopesViewComponent, {
      scopes: this.state.widgetScoper.getScopes(),
      onRemoveScope: this.handleRemoveScope
    });
  };

  DashboardViewComponent.prototype.render = function() {
    var layoutManager, renderWidget, style;
    layoutManager = LayoutManager.createLayoutManager(this.props.design.layout);
    renderWidget = (function(_this) {
      return function(options) {
        var filters, widget;
        widget = WidgetFactory.createWidget(options.type);
        filters = _this.props.filters || [];
        filters = filters.concat(_this.state.widgetScoper.getFilters(options.id));
        return widget.createViewElement({
          schema: _this.props.schema,
          dataSource: _this.props.dataSource,
          widgetDataSource: _this.props.dashboardDataSource.getWidgetDataSource(options.id),
          design: options.design,
          scope: _this.state.widgetScoper.getScope(options.id),
          filters: filters,
          onScopeChange: _this.handleScopeChange.bind(null, options.id),
          onDesignChange: options.onDesignChange,
          width: options.width,
          height: options.height,
          standardWidth: options.standardWidth
        });
      };
    })(this);
    style = {
      height: "100%",
      position: "relative"
    };
    return R(DragDropContextComponent, {
      style: style
    }, this.renderScopes(), layoutManager.renderLayout({
      width: this.props.width,
      standardWidth: this.props.standardWidth,
      items: this.props.design.items,
      onItemsChange: this.props.onDesignChange != null ? this.handleItemsChange : void 0,
      style: this.props.design.style,
      renderWidget: renderWidget
    }));
  };

  return DashboardViewComponent;

})(React.Component);

DragDropContextComponent = (function(superClass) {
  extend(DragDropContextComponent, superClass);

  function DragDropContextComponent() {
    return DragDropContextComponent.__super__.constructor.apply(this, arguments);
  }

  DragDropContextComponent.prototype.render = function() {
    return H.div(this.props);
  };

  return DragDropContextComponent;

})(React.Component);

DragDropContextComponent = NestableDragDropContext(HTML5Backend)(DragDropContextComponent);
