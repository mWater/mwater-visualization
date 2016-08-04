var AutoSizeComponent, DashboardComponent, DashboardUtils, DashboardViewComponent, H, LayoutManager, QuickfilterCompiler, QuickfiltersComponent, R, React, SettingsModalComponent, UndoStack, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

UndoStack = require('../UndoStack');

DashboardViewComponent = require('./DashboardViewComponent');

AutoSizeComponent = require('react-library/lib/AutoSizeComponent');

DashboardUtils = require('./DashboardUtils');

QuickfiltersComponent = require('../quickfilter/QuickfiltersComponent');

QuickfilterCompiler = require('../quickfilter/QuickfilterCompiler');

SettingsModalComponent = require('./SettingsModalComponent');

LayoutManager = require('../layouts/LayoutManager');

module.exports = DashboardComponent = (function(superClass) {
  extend(DashboardComponent, superClass);

  DashboardComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    dashboardDataSource: React.PropTypes.object.isRequired,
    titleElem: React.PropTypes.node,
    extraTitleButtonsElem: React.PropTypes.node,
    undoStackKey: React.PropTypes.any,
    printScaling: React.PropTypes.bool
  };

  DashboardComponent.defaultProps = {
    printScaling: true
  };

  function DashboardComponent(props) {
    this.refDashboardView = bind(this.refDashboardView, this);
    this.handleToggleEditing = bind(this.handleToggleEditing, this);
    this.handleSettings = bind(this.handleSettings, this);
    this.handleAddWidget = bind(this.handleAddWidget, this);
    this.handleSaveDesignFile = bind(this.handleSaveDesignFile, this);
    this.handleRedo = bind(this.handleRedo, this);
    this.handleUndo = bind(this.handleUndo, this);
    this.handlePrint = bind(this.handlePrint, this);
    DashboardComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      undoStack: new UndoStack().push(props.design),
      quickfiltersValues: null,
      editing: LayoutManager.createLayoutManager(props.design.layout).isEmpty(props.design.items)
    };
  }

  DashboardComponent.prototype.componentWillReceiveProps = function(nextProps) {
    var undoStack;
    undoStack = this.state.undoStack;
    if (nextProps.undoStackKey !== this.props.undoStackKey) {
      undoStack = new UndoStack();
    }
    undoStack = undoStack.push(nextProps.design);
    this.setState({
      undoStack: undoStack
    });
    if (!_.isEqual(this.props.design.quickfilters, nextProps.design.quickfilters)) {
      this.setState({
        quickfiltersValues: null
      });
    }
    if (nextProps.onDesignChange == null) {
      return this.setState({
        editing: false
      });
    }
  };

  DashboardComponent.prototype.handlePrint = function() {
    return this.dashboardView.print();
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
    var blob, filesaver;
    blob = new Blob([JSON.stringify(this.props.design, null, 2)], {
      type: "text/json"
    });
    filesaver = require('filesaver.js');
    return filesaver(blob, "Dashboard.json");
  };

  DashboardComponent.prototype.handleAddWidget = function(wt) {
    var design;
    design = DashboardUtils.addWidget(this.props.design, wt.type, wt.design, 8, 8);
    return this.props.onDesignChange(design);
  };

  DashboardComponent.prototype.handleSettings = function() {
    return this.refs.settings.show(this.props.design);
  };

  DashboardComponent.prototype.handleToggleEditing = function() {
    return this.setState({
      editing: !this.state.editing
    });
  };

  DashboardComponent.prototype.renderEditingSwitch = function() {
    return H.a({
      key: "edit",
      className: "btn btn-primary btn-sm " + (this.state.editing ? "active" : ""),
      onClick: this.handleToggleEditing
    }, H.span({
      className: "glyphicon glyphicon-pencil"
    }), this.state.editing ? " Editing" : " Edit");
  };

  DashboardComponent.prototype.renderActionLinks = function() {
    return H.div(null, this.state.editing ? [
      H.a({
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
      }), " Redo")
    ] : void 0, H.a({
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
    }), " Export"), this.state.editing ? H.a({
      key: "settings",
      className: "btn btn-link btn-sm",
      onClick: this.handleSettings
    }, H.span({
      className: "glyphicon glyphicon-cog"
    }), " Settings") : void 0, this.props.extraTitleButtonsElem, this.props.onDesignChange != null ? this.renderEditingSwitch() : void 0);
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

  DashboardComponent.prototype.renderQuickfilter = function() {
    return R(QuickfiltersComponent, {
      design: this.props.design.quickfilters,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      values: this.state.quickfiltersValues,
      onValuesChange: (function(_this) {
        return function(values) {
          return _this.setState({
            quickfiltersValues: values
          });
        };
      })(this)
    });
  };

  DashboardComponent.prototype.refDashboardView = function(el) {
    return this.dashboardView = el;
  };

  DashboardComponent.prototype.render = function() {
    var filters;
    filters = new QuickfilterCompiler(this.props.schema).compile(this.props.design.quickfilters, this.state.quickfiltersValues);
    return H.div({
      key: "view",
      style: {
        height: "100%",
        paddingTop: 40,
        paddingRight: 20,
        position: "relative"
      }
    }, this.renderTitleBar(), this.renderQuickfilter(), this.props.onDesignChange != null ? R(SettingsModalComponent, {
      onDesignChange: this.props.onDesignChange,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      ref: "settings"
    }) : void 0, R(AutoSizeComponent, {
      injectWidth: true,
      injectHeight: true
    }, (function(_this) {
      return function(size) {
        return R(DashboardViewComponent, {
          schema: _this.props.schema,
          dataSource: _this.props.dataSource,
          dashboardDataSource: _this.props.dashboardDataSource,
          ref: _this.refDashboardView,
          design: _this.props.design,
          onDesignChange: _this.state.editing ? _this.props.onDesignChange : void 0,
          filters: filters,
          width: size.width,
          standardWidth: _this.props.printScaling ? 1440 : size.width
        });
      };
    })(this)));
  };

  return DashboardComponent;

})(React.Component);