var DashboardDesignerComponent, H, LegoLayoutEngine, React, UndoStack, uuid,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

uuid = require('node-uuid');

LegoLayoutEngine = require('./LegoLayoutEngine');

UndoStack = require('./UndoStack');

module.exports = DashboardDesignerComponent = (function(superClass) {
  extend(DashboardDesignerComponent, superClass);

  DashboardDesignerComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func.isRequired,
    selectedWidgetId: React.PropTypes.string,
    onSelectedWidgetIdChange: React.PropTypes.func.isRequired,
    isDesigning: React.PropTypes.bool.isRequired,
    onIsDesigningChange: React.PropTypes.func,
    widgetFactory: React.PropTypes.object.isRequired
  };

  function DashboardDesignerComponent(props) {
    this.handleRedo = bind(this.handleRedo, this);
    this.handleUndo = bind(this.handleUndo, this);
    this.handleAddWidget = bind(this.handleAddWidget, this);
    this.handleDesignChange = bind(this.handleDesignChange, this);
    DashboardDesignerComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      undoStack: new UndoStack().push(props.design)
    };
  }

  DashboardDesignerComponent.prototype.componentWillReceiveProps = function(nextProps) {
    return this.setState({
      undoStack: this.state.undoStack.push(nextProps.design)
    });
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

  DashboardDesignerComponent.prototype.findOpenLayout = function(width, height) {
    var layoutEngine, layouts;
    layoutEngine = new LegoLayoutEngine(100, 24);
    layouts = _.pluck(_.values(this.props.design.items), "layout");
    return layoutEngine.appendLayout(layouts, width, height);
  };

  DashboardDesignerComponent.prototype.addWidget = function(type, version, design, width, height) {
    var id, item, items, layout;
    layout = this.findOpenLayout(12, 12);
    item = {
      layout: layout,
      widget: {
        type: type,
        version: version,
        design: design
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

  DashboardDesignerComponent.prototype.handleAddWidget = function(wt) {
    return this.addWidget(wt.type, wt.version, wt.design, 12, 12);
  };

  DashboardDesignerComponent.prototype.handleUndo = function() {
    var undoStack;
    undoStack = this.state.undoStack.undo();
    return this.setState({
      undoStack: undoStack
    }, (function(_this) {
      return function() {
        return _this.props.onDesignChange(undoStack.getValue());
      };
    })(this));
  };

  DashboardDesignerComponent.prototype.handleRedo = function() {
    var undoStack;
    undoStack = this.state.undoStack.redo();
    return this.setState({
      undoStack: undoStack
    }, (function(_this) {
      return function() {
        return _this.props.onDesignChange(undoStack.getValue());
      };
    })(this));
  };

  DashboardDesignerComponent.prototype.renderUndoRedo = function() {
    return H.div({
      key: "undoredo"
    }, H.button({
      key: "undo",
      type: "button",
      className: "btn btn-default btn-xs",
      onClick: this.handleUndo,
      disabled: !this.state.undoStack.canUndo()
    }, H.span({
      className: "glyphicon glyphicon-triangle-left"
    }), " Undo"), " ", H.button({
      key: "redo",
      type: "button",
      className: "btn btn-default btn-xs",
      onClick: this.handleRedo,
      disabled: !this.state.undoStack.canRedo()
    }, H.span({
      className: "glyphicon glyphicon-triangle-right"
    }), " Redo"));
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
    }, _.map(this.props.widgetFactory.getNewWidgetsTypes(), (function(_this) {
      return function(wt) {
        return H.li({
          key: wt.name
        }, H.a({
          onClick: _this.handleAddWidget.bind(null, wt)
        }, wt.name));
      };
    })(this)))));
  };

  DashboardDesignerComponent.prototype.renderWidgetDesigner = function() {
    var widget, widgetDef;
    widgetDef = this.props.design.items[this.props.selectedWidgetId].widget;
    widget = this.props.widgetFactory.createWidget(widgetDef.type, widgetDef.version, widgetDef.design);
    return widget.createDesignerElement({
      onDesignChange: this.handleDesignChange
    });
  };

  DashboardDesignerComponent.prototype.render = function() {
    return H.div(null, this.renderUndoRedo(), H.br(), !this.props.selectedWidgetId ? this.renderGeneralDesigner() : this.renderWidgetDesigner());
  };

  return DashboardDesignerComponent;

})(React.Component);
