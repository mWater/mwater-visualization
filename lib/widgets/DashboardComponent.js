var AutoSizeComponent, DashboardComponent, DashboardDesignerComponent, DashboardViewComponent, H, React, UndoStack,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

UndoStack = require('./../UndoStack');

DashboardViewComponent = require('./DashboardViewComponent');

DashboardDesignerComponent = require('./DashboardDesignerComponent');

AutoSizeComponent = require('./../AutoSizeComponent');

module.exports = DashboardComponent = (function(superClass) {
  extend(DashboardComponent, superClass);

  DashboardComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func.isRequired,
    widgetFactory: React.PropTypes.object.isRequired
  };

  function DashboardComponent(props) {
    this.handleAddWidget = bind(this.handleAddWidget, this);
    this.handleRedo = bind(this.handleRedo, this);
    this.handleUndo = bind(this.handleUndo, this);
    this.handlePrint = bind(this.handlePrint, this);
    DashboardComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      undoStack: new UndoStack().push(props.design)
    };
  }

  DashboardComponent.prototype.componentWillReceiveProps = function(nextProps) {
    return this.setState({
      undoStack: this.state.undoStack.push(nextProps.design)
    });
  };

  DashboardComponent.prototype.handlePrint = function() {
    return this.refs.dashboardViewContainer.getChild().print();
  };

  DashboardComponent.prototype.handleUndo = function() {
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

  DashboardComponent.prototype.handleRedo = function() {
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

  DashboardComponent.prototype.findOpenLayout = function(width, height) {
    var layoutEngine, layouts;
    layoutEngine = new LegoLayoutEngine(100, 24);
    layouts = _.pluck(_.values(this.props.design.items), "layout");
    return layoutEngine.appendLayout(layouts, width, height);
  };

  DashboardComponent.prototype.addWidget = function(type, version, design, width, height) {
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
    return this.props.onDesignChange(design);
  };

  DashboardComponent.prototype.handleAddWidget = function(wt) {
    return this.addWidget(wt.type, wt.version, wt.design, 12, 12);
  };

  DashboardComponent.prototype.renderAddWidget = function() {
    return H.div({
      className: "btn-group btn-sm"
    }, H.button({
      type: "button",
      "data-toggle": "dropdown",
      className: "btn btn-link dropdown-toggle"
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
    })(this))));
  };

  DashboardComponent.prototype.renderActionLinks = function() {
    return H.div({
      style: {
        textAlign: "right",
        position: "absolute",
        top: 0,
        right: 20
      }
    }, H.a({
      key: "print",
      className: "btn btn-link btn-sm",
      onClick: this.handlePrint
    }, H.span({
      className: "glyphicon glyphicon-print"
    }), " Print"), H.a({
      key: "undo",
      className: "btn btn-link btn-sm " + (!this.state.undoStack.canUndo() ? "disabled" : ""),
      onClick: this.handleUndo
    }, H.span({
      className: "glyphicon glyphicon-triangle-left"
    }), " Undo"), " ", H.a({
      key: "redo",
      className: "btn btn-link btn-sm " + (!this.state.undoStack.canRedo() ? "disabled" : ""),
      onClick: this.handleRedo
    }, H.span({
      className: "glyphicon glyphicon-triangle-right"
    }), " Redo"));
  };

  DashboardComponent.prototype.render = function() {
    return H.div({
      key: "view",
      style: {
        height: "100%",
        overflowY: "auto",
        paddingTop: 30,
        paddingRight: 20,
        paddingLeft: 5,
        position: "relative"
      }
    }, this.renderActionLinks(), React.createElement(AutoSizeComponent, {
      injectWidth: true,
      ref: "dashboardViewContainer"
    }, React.createElement(DashboardViewComponent, {
      design: this.props.design,
      onDesignChange: this.props.onDesignChange,
      widgetFactory: this.props.widgetFactory
    })));
  };

  return DashboardComponent;

})(React.Component);
