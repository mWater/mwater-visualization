var AutoSizeComponent, DashboardComponent, DashboardUpgrader, DashboardViewComponent, H, LayoutManager, QuickfilterCompiler, QuickfiltersComponent, R, React, SettingsModalComponent, UndoStack, _,
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

QuickfiltersComponent = require('../quickfilter/QuickfiltersComponent');

QuickfilterCompiler = require('../quickfilter/QuickfilterCompiler');

SettingsModalComponent = require('./SettingsModalComponent');

LayoutManager = require('../layouts/LayoutManager');

DashboardUpgrader = require('./DashboardUpgrader');

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
    printScaling: React.PropTypes.bool,
    onRowClick: React.PropTypes.func,
    quickfilterLocks: React.PropTypes.array,
    filters: React.PropTypes.arrayOf(React.PropTypes.shape({
      table: React.PropTypes.string.isRequired,
      jsonql: React.PropTypes.object.isRequired
    }))
  };

  DashboardComponent.defaultProps = {
    printScaling: true
  };

  DashboardComponent.childContextTypes = {
    locale: React.PropTypes.string
  };

  DashboardComponent.prototype.getChildContext = function() {
    return {
      locale: this.props.design.locale
    };
  };

  function DashboardComponent(props) {
    this.refDashboardView = bind(this.refDashboardView, this);
    this.handleUpgrade = bind(this.handleUpgrade, this);
    this.handleStyleChange = bind(this.handleStyleChange, this);
    this.handleToggleEditing = bind(this.handleToggleEditing, this);
    this.handleSettings = bind(this.handleSettings, this);
    this.handleSaveDesignFile = bind(this.handleSaveDesignFile, this);
    this.handleRedo = bind(this.handleRedo, this);
    this.handleUndo = bind(this.handleUndo, this);
    this.handlePrint = bind(this.handlePrint, this);
    this.getQuickfilterValues = bind(this.getQuickfilterValues, this);
    DashboardComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      undoStack: new UndoStack().push(props.design),
      quickfiltersValues: null,
      quickfiltersHeight: null,
      editing: LayoutManager.createLayoutManager(props.design.layout).isEmpty(props.design.items) && (props.onDesignChange != null)
    };
  }

  DashboardComponent.prototype.componentDidMount = function() {
    return this.updateHeight();
  };

  DashboardComponent.prototype.componentDidUpdate = function() {
    return this.updateHeight();
  };

  DashboardComponent.prototype.updateHeight = function() {
    if (this.refs.quickfilters) {
      if (this.state.quickfiltersHeight !== this.refs.quickfilters.offsetHeight) {
        return this.setState({
          quickfiltersHeight: this.refs.quickfilters.offsetHeight
        });
      }
    } else {
      return this.setState({
        quickfiltersHeight: 0
      });
    }
  };

  DashboardComponent.prototype.getQuickfilterValues = function() {
    return this.state.quickfiltersValues || [];
  };

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

  DashboardComponent.prototype.handleSettings = function() {
    return this.refs.settings.show(this.props.design);
  };

  DashboardComponent.prototype.handleToggleEditing = function() {
    return this.setState({
      editing: !this.state.editing
    });
  };

  DashboardComponent.prototype.handleStyleChange = function(style) {
    return this.props.onDesignChange(_.extend({}, this.props.design, {
      style: style || null
    }));
  };

  DashboardComponent.prototype.handleUpgrade = function() {
    var design;
    if (!confirm("This will upgrade your dashboard to the new kind with enhanced features. You can click Undo immediately afterwards if you wish to revert it. Continue?")) {
      return;
    }
    design = new DashboardUpgrader().upgrade(this.props.design);
    this.props.onDesignChange(design);
    return alert("Upgrade completed. Some widgets may need to be resized. Click Undo to revert back to old dashboard style.");
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

  DashboardComponent.prototype.renderStyleItem = function(style) {
    var content, isActive;
    isActive = (this.props.design.style || "default") === style;
    content = (function() {
      switch (style) {
        case "default":
          return [
            H.h4({
              className: "list-group-item-heading"
            }, "Classic Dashboard"), H.p({
              className: "list-group-item-text"
            }, "Ideal for data display with minimal text")
          ];
        case "greybg":
          return [
            H.h4({
              className: "list-group-item-heading"
            }, "Framed Dashboard"), H.p({
              className: "list-group-item-text"
            }, "Each widget is white on a grey background")
          ];
        case "story":
          return [
            H.h4({
              className: "list-group-item-heading"
            }, "Story"), H.p({
              className: "list-group-item-text"
            }, "Ideal for data-driven storytelling with lots of text. Responsive and mobile-friendly")
          ];
      }
    })();
    return H.a({
      key: style,
      className: "list-group-item " + (isActive ? "active" : ""),
      onClick: this.handleStyleChange.bind(null, style)
    }, content);
  };

  DashboardComponent.prototype.renderStyle = function() {
    return H.div({
      key: "style",
      className: "btn-group"
    }, H.button({
      type: "button",
      "data-toggle": "dropdown",
      className: "btn btn-link btn-sm dropdown-toggle"
    }, H.span({
      className: "fa fa-th-large"
    }), " Layout ", H.span({
      className: "caret"
    })), H.div({
      className: "dropdown-menu dropdown-menu-right list-group",
      style: {
        padding: 0,
        zIndex: 10000,
        width: 300
      }
    }, this.renderStyleItem("default"), this.renderStyleItem("greybg"), this.renderStyleItem("story")));
  };

  DashboardComponent.prototype.renderActionLinks = function() {
    return H.div(null, this.state.editing && (this.props.design.layout || "grid") === "grid" ? H.a({
      key: "upgrade",
      className: "btn btn-info btn-sm",
      onClick: this.handleUpgrade
    }, "Upgrade Dashboard...") : void 0, this.state.editing ? [
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
    }), " Print"), this.state.editing ? H.a({
      key: "settings",
      className: "btn btn-link btn-sm",
      onClick: this.handleSettings
    }, H.span({
      className: "glyphicon glyphicon-cog"
    }), " Settings") : void 0, this.state.editing ? this.renderStyle() : void 0, this.props.extraTitleButtonsElem, this.props.onDesignChange != null ? this.renderEditingSwitch() : void 0);
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
    return H.div({
      style: {
        position: "absolute",
        top: 40,
        left: 0,
        right: 0
      },
      ref: "quickfilters"
    }, R(QuickfiltersComponent, {
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
      })(this),
      locks: this.props.quickfilterLocks
    }));
  };

  DashboardComponent.prototype.refDashboardView = function(el) {
    return this.dashboardView = el;
  };

  DashboardComponent.prototype.render = function() {
    var filters;
    filters = this.props.filters || [];
    filters = filters.concat(new QuickfilterCompiler(this.props.schema).compile(this.props.design.quickfilters, this.state.quickfiltersValues, this.props.quickfilterLocks));
    return H.div({
      key: "view",
      style: {
        height: "100%",
        paddingTop: 40 + (this.state.quickfiltersHeight || 0),
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
          standardWidth: _this.props.printScaling ? 1440 : size.width,
          onRowClick: _this.props.onRowClick
        });
      };
    })(this)));
  };

  return DashboardComponent;

})(React.Component);
