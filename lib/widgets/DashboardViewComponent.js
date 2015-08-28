var DashboardViewComponent, H, LegoLayoutEngine, React, ReactElementPrinter, WidgetContainerComponent, WidgetScoper,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

LegoLayoutEngine = require('./LegoLayoutEngine');

WidgetScoper = require('./WidgetScoper');

WidgetContainerComponent = require('./WidgetContainerComponent');

ReactElementPrinter = require('./../ReactElementPrinter');

module.exports = DashboardViewComponent = (function(superClass) {
  extend(DashboardViewComponent, superClass);

  DashboardViewComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func.isRequired,
    width: React.PropTypes.number,
    widgetFactory: React.PropTypes.object.isRequired
  };

  function DashboardViewComponent(props) {
    this.renderScope = bind(this.renderScope, this);
    this.print = bind(this.print, this);
    this.handleDesignChange = bind(this.handleDesignChange, this);
    this.handleRemoveScope = bind(this.handleRemoveScope, this);
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
    }, React.createElement(DashboardViewComponent, _.extend(this.props, {
      width: 7.5 * 96 * 2
    })));
    printer = new ReactElementPrinter();
    return printer.print(elem);
  };

  DashboardViewComponent.prototype.renderScope = function(id) {
    var scope, style;
    style = {
      cursor: "pointer",
      borderRadius: 4,
      border: "solid 1px #BBB",
      padding: "1px 5px 1px 5px",
      color: "#666",
      backgroundColor: "#EEE",
      display: "inline-block",
      marginLeft: 4,
      marginRight: 4
    };
    scope = this.state.widgetScoper.getScope(id);
    if (!scope) {
      return null;
    }
    return H.div({
      key: id,
      style: style,
      onClick: this.handleRemoveScope.bind(null, id)
    }, scope.name, " ", H.span({
      className: "glyphicon glyphicon-remove"
    }));
  };

  DashboardViewComponent.prototype.renderScopes = function() {
    var scopes;
    scopes = this.state.widgetScoper.getScopes();
    if (_.compact(_.values(scopes)).length === 0) {
      return null;
    }
    return H.div({
      className: "alert alert-info"
    }, H.span({
      className: "glyphicon glyphicon-filter"
    }), " Filters: ", _.map(_.keys(scopes), this.renderScope));
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
    var elems, layoutEngine, layouts, style, widgets;
    layoutEngine = new LegoLayoutEngine(this.props.width, 24);
    layouts = _.mapValues(this.props.design.items, "layout");
    widgets = _.mapValues(this.props.design.items, (function(_this) {
      return function(item) {
        return _this.props.widgetFactory.createWidget(item.widget.type, item.widget.design);
      };
    })(this));
    elems = _.mapValues(widgets, (function(_this) {
      return function(widget, id) {
        return widget.createViewElement({
          scope: _this.state.widgetScoper.getScope(id),
          filters: _this.state.widgetScoper.getFilters(id),
          onScopeChange: _this.handleScopeChange.bind(null, id),
          onRemove: _this.handleRemove.bind(null, id),
          onDesignChange: _this.handleDesignChange.bind(null, id)
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
      onLayoutUpdate: this.handleLayoutUpdate,
      width: this.props.width
    }), this.renderPageBreaks(layoutEngine, layouts)));
  };

  return DashboardViewComponent;

})(React.Component);
