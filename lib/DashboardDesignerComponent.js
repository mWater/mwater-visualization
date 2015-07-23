var DashboardDesignerComponent, H, LegoLayoutEngine, React, uuid,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

uuid = require('node-uuid');

LegoLayoutEngine = require('./LegoLayoutEngine');

module.exports = DashboardDesignerComponent = (function(superClass) {
  extend(DashboardDesignerComponent, superClass);

  function DashboardDesignerComponent() {
    this.handleAddChart = bind(this.handleAddChart, this);
    this.handleDesignChange = bind(this.handleDesignChange, this);
    return DashboardDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  DashboardDesignerComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func.isRequired,
    selectedWidgetId: React.PropTypes.string,
    onSelectedWidgetIdChange: React.PropTypes.func.isRequired,
    isDesigning: React.PropTypes.bool.isRequired,
    onIsDesigningChange: React.PropTypes.func,
    widgetFactory: React.PropTypes.object.isRequired
  };

  DashboardDesignerComponent.prototype.handleDesignChange = function(widgetDesign) {
    var design, item, items, widget;
    widget = this.props.design.items[this.props.selectedWidgetId].widget;
    widget = _.extend({}, widget, {
      design: widgetDesign
    });
    item = this.props.design.items[this.props.selectedWidgetId];
    item = _.extend({}, item, {
      widget: widget
    });
    items = _.clone(this.props.design.items);
    items[this.props.selectedWidgetId] = item;
    design = _.extend({}, this.props.design, {
      items: items
    });
    return this.props.onDesignChange(design);
  };

  DashboardDesignerComponent.prototype.handleAddChart = function() {
    var design, id, item, items, layout, layoutEngine, layouts;
    layoutEngine = new LegoLayoutEngine(100, 24);
    layouts = _.pluck(_.values(this.props.design.items), "layout");
    layout = layoutEngine.appendLayout(layouts, 12, 12);
    item = {
      layout: layout,
      widget: {
        type: "LayeredChart",
        version: "0.0.0",
        design: {}
      }
    };
    id = uuid.v4();
    items = _.clone(this.props.design.items);
    items[id] = item;
    design = _.extend({}, this.props.design, {
      items: items
    });
    this.props.onDesignChange(design);
    return this.props.onSelectedWidgetIdChange(id);
  };

  DashboardDesignerComponent.prototype.renderGeneralDesigner = function() {
    return H.div(null, H.div(null, H.i(null, H.span({
      className: "glyphicon glyphicon-arrow-left"
    }), " Click on widgets to edit them")), H.br(), H.div({
      className: "btn-group"
    }, H.button({
      type: "button",
      "data-toggle": "dropdown",
      className: "btn btn-default dropdown-toggle"
    }, H.span({
      className: "glyphicon glyphicon-plus"
    }), " Add Widget ", H.span({
      className: "caret"
    })), H.ul({
      className: "dropdown-menu"
    }, H.li(null, H.a({
      onClick: this.handleAddChart
    }, "Chart")))));
  };

  DashboardDesignerComponent.prototype.render = function() {
    var widget, widgetDef;
    if (!this.props.selectedWidgetId) {
      return this.renderGeneralDesigner();
    }
    widgetDef = this.props.design.items[this.props.selectedWidgetId].widget;
    widget = this.props.widgetFactory.createWidget(widgetDef.type, widgetDef.version, widgetDef.design);
    return widget.createDesignerElement({
      onDesignChange: this.handleDesignChange
    });
  };

  return DashboardDesignerComponent;

})(React.Component);
