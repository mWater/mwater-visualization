"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var AutoSizeComponent,
    DashboardComponent,
    DashboardUpgrader,
    DashboardUtils,
    DashboardViewComponent,
    ExprCleaner,
    ExprCompiler,
    LayoutManager,
    PropTypes,
    QuickfilterCompiler,
    QuickfiltersComponent,
    R,
    React,
    SettingsModalComponent,
    UndoStack,
    _,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

PropTypes = require('prop-types');
_ = require('lodash');
React = require('react');
R = React.createElement;
ExprCompiler = require("mwater-expressions").ExprCompiler;
ExprCleaner = require('mwater-expressions').ExprCleaner;
UndoStack = require('../UndoStack');
DashboardUtils = require('./DashboardUtils');
DashboardViewComponent = require('./DashboardViewComponent');
AutoSizeComponent = require('react-library/lib/AutoSizeComponent');
QuickfiltersComponent = require('../quickfilter/QuickfiltersComponent');
QuickfilterCompiler = require('../quickfilter/QuickfilterCompiler');
SettingsModalComponent = require('./SettingsModalComponent');
LayoutManager = require('../layouts/LayoutManager');
DashboardUpgrader = require('./DashboardUpgrader'); // Dashboard component that includes an action bar at the top
// Manages undo stack and quickfilter value

module.exports = DashboardComponent = function () {
  var DashboardComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2["default"])(DashboardComponent, _React$Component);
    (0, _createClass2["default"])(DashboardComponent, [{
      key: "getChildContext",
      value: function getChildContext() {
        return {
          // Pass locale down. Both here and DashboardViewComponent to ensure that quickfilters also get context
          locale: this.props.design.locale,
          // Pass active tables down to table select components so they can present a shorter list
          activeTables: DashboardUtils.getFilterableTables(this.props.design, this.props.schema)
        };
      }
    }]);

    function DashboardComponent(props) {
      var _this;

      (0, _classCallCheck2["default"])(this, DashboardComponent);
      _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(DashboardComponent).call(this, props)); // Get the values of the quick filters

      _this.getQuickfilterValues = _this.getQuickfilterValues.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handlePrint = _this.handlePrint.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleUndo = _this.handleUndo.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleRedo = _this.handleRedo.bind((0, _assertThisInitialized2["default"])(_this)); // Saves a json file to disk

      _this.handleSaveDesignFile = _this.handleSaveDesignFile.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleSettings = _this.handleSettings.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleToggleEditing = _this.handleToggleEditing.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleRefreshData = _this.handleRefreshData.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleStyleChange = _this.handleStyleChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleDesignChange = _this.handleDesignChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleUpgrade = _this.handleUpgrade.bind((0, _assertThisInitialized2["default"])(_this));
      _this.refDashboardView = _this.refDashboardView.bind((0, _assertThisInitialized2["default"])(_this));
      _this.state = {
        undoStack: new UndoStack().push(props.design),
        quickfiltersValues: props.quickfiltersValues,
        quickfiltersHeight: null,
        // Height of quickfilters
        editing: LayoutManager.createLayoutManager(props.design.layout).isEmpty(props.design.items) && props.onDesignChange != null
      };
      return _this;
    }

    (0, _createClass2["default"])(DashboardComponent, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        return this.updateHeight();
      }
    }, {
      key: "componentDidUpdate",
      value: function componentDidUpdate() {
        return this.updateHeight();
      }
    }, {
      key: "updateHeight",
      value: function updateHeight() {
        // Calculate quickfilters height
        if (this.quickfilters) {
          if (this.state.quickfiltersHeight !== this.quickfilters.offsetHeight) {
            return this.setState({
              quickfiltersHeight: this.quickfilters.offsetHeight
            });
          }
        } else {
          return this.setState({
            quickfiltersHeight: 0
          });
        }
      }
    }, {
      key: "getQuickfilterValues",
      value: function getQuickfilterValues() {
        boundMethodCheck(this, DashboardComponent);
        return this.state.quickfiltersValues || [];
      }
    }, {
      key: "componentWillReceiveProps",
      value: function componentWillReceiveProps(nextProps) {
        var undoStack;
        undoStack = this.state.undoStack; // Clear stack if key changed

        if (nextProps.undoStackKey !== this.props.undoStackKey) {
          undoStack = new UndoStack();
        } // Save on stack


        undoStack = undoStack.push(nextProps.design);
        this.setState({
          undoStack: undoStack
        }); // Clear quickfilters if definition changed

        if (!_.isEqual(this.props.design.quickfilters, nextProps.design.quickfilters)) {
          this.setState({
            quickfiltersValues: nextProps.quickfiltersValues
          });
        }

        if (nextProps.onDesignChange == null) {
          return this.setState({
            editing: false
          });
        }
      }
    }, {
      key: "handlePrint",
      value: function handlePrint() {
        boundMethodCheck(this, DashboardComponent);
        return this.dashboardView.print();
      }
    }, {
      key: "handleUndo",
      value: function handleUndo() {
        var _this2 = this;

        var undoStack;
        boundMethodCheck(this, DashboardComponent);
        undoStack = this.state.undoStack.undo(); // We need to use callback as state is applied later

        return this.setState({
          undoStack: undoStack
        }, function () {
          return _this2.props.onDesignChange(undoStack.getValue());
        });
      }
    }, {
      key: "handleRedo",
      value: function handleRedo() {
        var _this3 = this;

        var undoStack;
        boundMethodCheck(this, DashboardComponent);
        undoStack = this.state.undoStack.redo(); // We need to use callback as state is applied later

        return this.setState({
          undoStack: undoStack
        }, function () {
          return _this3.props.onDesignChange(undoStack.getValue());
        });
      }
    }, {
      key: "handleSaveDesignFile",
      value: function handleSaveDesignFile() {
        var FileSaver, blob;
        boundMethodCheck(this, DashboardComponent); // Make a blob and save

        blob = new Blob([JSON.stringify(this.props.design, null, 2)], {
          type: "text/json"
        }); // Require at use as causes server problems

        FileSaver = require('file-saver');
        return FileSaver.saveAs(blob, "Dashboard.json");
      }
    }, {
      key: "handleSettings",
      value: function handleSettings() {
        boundMethodCheck(this, DashboardComponent);
        return this.settings.show(this.props.design);
      }
    }, {
      key: "handleToggleEditing",
      value: function handleToggleEditing() {
        boundMethodCheck(this, DashboardComponent);
        return this.setState({
          editing: !this.state.editing
        });
      }
    }, {
      key: "handleRefreshData",
      value: function handleRefreshData() {
        var base;
        boundMethodCheck(this, DashboardComponent);

        if (typeof (base = this.props.dataSource).clearCache === "function") {
          base.clearCache();
        }

        return this.forceUpdate();
      }
    }, {
      key: "handleStyleChange",
      value: function handleStyleChange(style) {
        boundMethodCheck(this, DashboardComponent);
        return this.props.onDesignChange(_.extend({}, this.props.design, {
          style: style || null
        }));
      }
    }, {
      key: "handleDesignChange",
      value: function handleDesignChange(design) {
        boundMethodCheck(this, DashboardComponent); // If quickfilters have changed, reset values

        if (!_.isEqual(this.props.design.quickfilters, design.quickfilters)) {
          this.setState({
            quickfiltersValues: null
          });
        }

        return this.props.onDesignChange(design);
      }
    }, {
      key: "handleUpgrade",
      value: function handleUpgrade() {
        var design;
        boundMethodCheck(this, DashboardComponent);

        if (!confirm("This will upgrade your dashboard to the new kind with enhanced features. You can click Undo immediately afterwards if you wish to revert it. Continue?")) {
          return;
        }

        design = new DashboardUpgrader().upgrade(this.props.design);
        this.props.onDesignChange(design);
        return alert("Upgrade completed. Some widgets may need to be resized. Click Undo to revert back to old dashboard style.");
      } // Get filters from props filters combined with dashboard filters

    }, {
      key: "getCompiledFilters",
      value: function getCompiledFilters() {
        var compiledFilters;
        compiledFilters = DashboardUtils.getCompiledFilters(this.props.design, this.props.schema, DashboardUtils.getFilterableTables(this.props.design, this.props.schema));
        compiledFilters = compiledFilters.concat(this.props.filters || []);
        return compiledFilters;
      }
    }, {
      key: "renderEditingSwitch",
      value: function renderEditingSwitch() {
        return R('a', {
          key: "edit",
          className: "btn btn-primary btn-sm ".concat(this.state.editing ? "active" : ""),
          onClick: this.handleToggleEditing
        }, R('span', {
          className: "glyphicon glyphicon-pencil"
        }), this.state.editing ? " Editing" : " Edit");
      }
    }, {
      key: "renderStyleItem",
      value: function renderStyleItem(style) {
        var content, isActive;
        isActive = (this.props.design.style || "default") === style;

        content = function () {
          switch (style) {
            case "default":
              return [R('h4', {
                key: "name",
                className: "list-group-item-heading"
              }, "Classic Dashboard"), R('p', {
                key: "description",
                className: "list-group-item-text"
              }, "Ideal for data display with minimal text")];

            case "greybg":
              return [R('h4', {
                key: "name",
                className: "list-group-item-heading"
              }, "Framed Dashboard"), R('p', {
                key: "description",
                className: "list-group-item-text"
              }, "Each widget is white on a grey background")];

            case "story":
              return [R('h4', {
                key: "name",
                className: "list-group-item-heading"
              }, "Story"), R('p', {
                key: "description",
                className: "list-group-item-text"
              }, "Ideal for data-driven storytelling with lots of text. Responsive and mobile-friendly")];
          }
        }();

        return R('a', {
          key: style,
          className: "list-group-item ".concat(isActive ? "active" : ""),
          onClick: this.handleStyleChange.bind(null, style)
        }, content);
      }
    }, {
      key: "renderStyle",
      value: function renderStyle() {
        return R('div', {
          key: "style",
          className: "btn-group"
        }, R('button', {
          type: "button",
          "data-toggle": "dropdown",
          className: "btn btn-link btn-sm dropdown-toggle"
        }, R('span', {
          className: "fa fa-th-large"
        }), " Layout ", R('span', {
          className: "caret"
        })), R('div', {
          className: "dropdown-menu dropdown-menu-right list-group",
          style: {
            padding: 0,
            zIndex: 10000,
            width: 300
          }
        }, this.renderStyleItem("default"), this.renderStyleItem("greybg"), this.renderStyleItem("story")));
      }
    }, {
      key: "renderActionLinks",
      value: function renderActionLinks() {
        return R('div', null, this.state.editing && (this.props.design.layout || "grid") === "grid" ? R('a', {
          key: "upgrade",
          className: "btn btn-info btn-sm",
          onClick: this.handleUpgrade
        }, "Upgrade Dashboard...") : void 0, this.state.editing ? [R('a', {
          key: "undo",
          className: "btn btn-link btn-sm ".concat(!this.state.undoStack.canUndo() ? "disabled" : ""),
          onClick: this.handleUndo
        }, R('span', {
          className: "glyphicon glyphicon-triangle-left"
        }), " Undo"), " ", R('a', {
          key: "redo",
          className: "btn btn-link btn-sm ".concat(!this.state.undoStack.canRedo() ? "disabled" : ""),
          onClick: this.handleRedo
        }, R('span', {
          className: "glyphicon glyphicon-triangle-right"
        }), " Redo")] : void 0, R('a', {
          key: "print",
          className: "btn btn-link btn-sm",
          onClick: this.handlePrint
        }, R('span', {
          className: "glyphicon glyphicon-print"
        }), " Print"), R('a', {
          key: "refresh",
          className: "btn btn-link btn-sm",
          onClick: this.handleRefreshData
        }, R('span', {
          className: "glyphicon glyphicon-refresh" // R 'a', key: "export", className: "btn btn-link btn-sm", onClick: @handleSaveDesignFile,
          //   R('span', className: "glyphicon glyphicon-download-alt")
          //   " Export"

        }), " Refresh"), this.state.editing ? R('a', {
          key: "settings",
          className: "btn btn-link btn-sm",
          onClick: this.handleSettings
        }, R('span', {
          className: "glyphicon glyphicon-cog"
        }), " Settings") : void 0, this.state.editing ? this.renderStyle() : void 0, this.props.extraTitleButtonsElem, this.props.onDesignChange != null ? this.renderEditingSwitch() : void 0);
      }
    }, {
      key: "renderTitleBar",
      value: function renderTitleBar() {
        return R('div', {
          style: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 40,
            padding: 4
          }
        }, R('div', {
          style: {
            "float": "right"
          }
        }, this.renderActionLinks()), this.props.titleElem);
      }
    }, {
      key: "renderQuickfilter",
      value: function renderQuickfilter() {
        var _this4 = this;

        return R('div', {
          style: {
            position: "absolute",
            top: 40,
            left: 0,
            right: 0
          },
          ref: function ref(c) {
            return _this4.quickfilters = c;
          }
        }, R(QuickfiltersComponent, {
          design: this.props.design.quickfilters,
          schema: this.props.schema,
          quickfiltersDataSource: this.props.dashboardDataSource.getQuickfiltersDataSource(),
          values: this.state.quickfiltersValues,
          onValuesChange: function onValuesChange(values) {
            return _this4.setState({
              quickfiltersValues: values
            });
          },
          locks: this.props.quickfilterLocks,
          filters: this.getCompiledFilters()
        }));
      }
    }, {
      key: "refDashboardView",
      value: function refDashboardView(el) {
        boundMethodCheck(this, DashboardComponent);
        return this.dashboardView = el;
      }
    }, {
      key: "render",
      value: function render() {
        var _this5 = this;

        var filters;
        filters = this.props.filters || []; // Compile quickfilters

        filters = filters.concat(new QuickfilterCompiler(this.props.schema).compile(this.props.design.quickfilters, this.state.quickfiltersValues, this.props.quickfilterLocks));
        return R('div', {
          key: "view",
          style: {
            height: "100%",
            paddingTop: 40 + (this.state.quickfiltersHeight || 0),
            position: "relative"
          }
        }, this.renderTitleBar(), this.renderQuickfilter(), this.props.onDesignChange != null ? R(SettingsModalComponent, {
          onDesignChange: this.handleDesignChange,
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          ref: function ref(c) {
            return _this5.settings = c;
          } // Dashboard view requires width, so use auto size component to inject it

        }) : void 0, R(AutoSizeComponent, {
          injectWidth: true,
          injectHeight: true
        }, function (size) {
          return R(DashboardViewComponent, {
            schema: _this5.props.schema,
            dataSource: _this5.props.dataSource,
            dashboardDataSource: _this5.props.dashboardDataSource,
            ref: _this5.refDashboardView,
            design: _this5.props.design,
            onDesignChange: _this5.state.editing ? _this5.props.onDesignChange : void 0,
            filters: filters,
            width: size.width,
            standardWidth: _this5.props.printScaling ? 1440 : size.width,
            onRowClick: _this5.props.onRowClick,
            namedStrings: _this5.props.namedStrings
          });
        }));
      }
    }]);
    return DashboardComponent;
  }(React.Component);

  ;
  DashboardComponent.propTypes = {
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func,
    // If not set, readonly
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    dashboardDataSource: PropTypes.object.isRequired,
    // dashboard data source
    titleElem: PropTypes.node,
    // Extra element to include in title at left
    extraTitleButtonsElem: PropTypes.node,
    // Extra elements to add to right
    undoStackKey: PropTypes.any,
    // Key that changes when the undo stack should be reset. Usually a document id or suchlike
    printScaling: PropTypes.bool,
    // True to scale for printing
    onRowClick: PropTypes.func,
    // Called with (tableId, rowId) when item is clicked
    namedStrings: PropTypes.object,
    // Optional lookup of string name to value. Used for {{branding}} and other replacement strings in text widget
    quickfilterLocks: PropTypes.array,
    // Locked quickfilter values. See README in quickfilters
    quickfiltersValues: PropTypes.array,
    // Initial quickfilter values
    // Filters to add to the dashboard
    filters: PropTypes.arrayOf(PropTypes.shape({
      table: PropTypes.string.isRequired,
      // id table to filter
      jsonql: PropTypes.object.isRequired // jsonql filter with {alias} for tableAlias

    }))
  };
  DashboardComponent.defaultProps = {
    printScaling: true
  };
  DashboardComponent.childContextTypes = {
    locale: PropTypes.string,
    activeTables: PropTypes.arrayOf(PropTypes.string.isRequired) // List of tables (ids) being used. Use this to present an initially short list to select from

  };
  return DashboardComponent;
}.call(void 0);