var AutoSizeComponent, DashboardComponent, DashboardUtils, DashboardViewComponent, H, React, UndoStack, filesaver,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

UndoStack = require('./../UndoStack');

DashboardViewComponent = require('./DashboardViewComponent');

AutoSizeComponent = require('./../AutoSizeComponent');

filesaver = require('filesaver.js');

DashboardUtils = require('./DashboardUtils');

module.exports = DashboardComponent = (function(superClass) {
  extend(DashboardComponent, superClass);

  DashboardComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func.isRequired,
    widgetFactory: React.PropTypes.object.isRequired,
    titleElem: React.PropTypes.node,
    extraTitleButtonsElem: React.PropTypes.node,
    undoStackKey: React.PropTypes.any
  };

  function DashboardComponent(props) {
    this.handleAddWidget = bind(this.handleAddWidget, this);
    this.handleSaveDesignFile = bind(this.handleSaveDesignFile, this);
    this.handleRedo = bind(this.handleRedo, this);
    this.handleUndo = bind(this.handleUndo, this);
    this.handlePrint = bind(this.handlePrint, this);
    DashboardComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      undoStack: new UndoStack().push(props.design)
    };
  }

  DashboardComponent.prototype.componentWillReceiveProps = function(nextProps) {
    var undoStack;
    undoStack = this.state.undoStack;
    if (nextProps.undoStackKey !== this.props.undoStackKey) {
      undoStack = new UndoStack();
    }
    undoStack = undoStack.push(nextProps.design);
    return this.setState({
      undoStack: undoStack
    });
  };

  DashboardComponent.prototype.handlePrint = function() {
    return this.refs.dashboardView.print();
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

  DashboardComponent.prototype.handleSaveDesignFile = function() {
    var blob;
    blob = new Blob([JSON.stringify(this.props.design, null, 2)], {
      type: "text/json"
    });
    return filesaver(blob, "Dashboard.json");
  };

  DashboardComponent.prototype.handleAddWidget = function(wt) {
    var design;
    design = DashboardUtils.addWidget(this.props.design, wt.type, wt.design, 8, 8);
    return this.props.onDesignChange(design);
  };

  DashboardComponent.prototype.renderAddWidget = function() {
    return H.div({
      key: "add",
      className: "btn-group"
    }, H.button({
      type: "button",
      "data-toggle": "dropdown",
      className: "btn btn-link btn-sm dropdown-toggle"
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
    return H.div(null, this.renderAddWidget(), H.a({
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
    }), " Redo"), H.a({
      key: "print",
      className: "btn btn-link btn-sm",
      onClick: this.handlePrint
    }, H.span({
      className: "glyphicon glyphicon-print"
    }), " Print"), H.a({
      key: "export",
      className: "btn btn-link btn-sm",
      onClick: this.handleSaveDesignFile
    }, H.span({
      className: "glyphicon glyphicon-download-alt"
    }), " Export"), this.props.extraTitleButtonsElem);
  };

  DashboardComponent.prototype.renderTitleBar = function() {
    return H.div({
      style: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 40,
        padding: 4
      }
    }, H.div({
      style: {
        float: "right"
      }
    }, this.renderActionLinks()), this.props.titleElem);
  };

  DashboardComponent.prototype.render = function() {
    return H.div({
      key: "view",
      style: {
        height: "100%",
        paddingTop: 40,
        paddingRight: 20,
        paddingLeft: 5,
        position: "relative"
      }
    }, this.renderTitleBar(), React.createElement(AutoSizeComponent, {
      injectWidth: true
    }, React.createElement(DashboardViewComponent, {
      ref: "dashboardView",
      design: this.props.design,
      onDesignChange: this.props.onDesignChange,
      widgetFactory: this.props.widgetFactory
    })));
  };

  return DashboardComponent;

})(React.Component);
