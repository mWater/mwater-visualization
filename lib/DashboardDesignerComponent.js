var DashboardDesignerComponent, H, React,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

module.exports = DashboardDesignerComponent = (function(superClass) {
  extend(DashboardDesignerComponent, superClass);

  function DashboardDesignerComponent() {
    this.handleDesignChange = bind(this.handleDesignChange, this);
    return DashboardDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  DashboardDesignerComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func.isRequired,
    selectedWidgetId: React.PropTypes.string,
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

  DashboardDesignerComponent.prototype.render = function() {
    var widget, widgetDef;
    if (!this.props.selectedWidgetId) {
      return H.div(null, H.i(null, "Select a widget to begin"));
    }
    widgetDef = this.props.design.items[this.props.selectedWidgetId].widget;
    widget = this.props.widgetFactory.createWidget(widgetDef.type, widgetDef.version, widgetDef.design);
    return widget.createDesignerElement({
      onDesignChange: this.handleDesignChange
    });
  };

  return DashboardDesignerComponent;

})(React.Component);
