"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var DashboardUtils,
    DashboardViewComponent,
    ExprCleaner,
    ExprCompiler,
    ImplicitFilterBuilder,
    LayoutManager,
    PropTypes,
    R,
    React,
    ReactElementPrinter,
    WidgetFactory,
    WidgetScoper,
    WidgetScopesViewComponent,
    _,
    uuid,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

_ = require('lodash');
PropTypes = require('prop-types');
React = require('react');
R = React.createElement;
uuid = require('uuid');
ImplicitFilterBuilder = require('../ImplicitFilterBuilder');
DashboardUtils = require('./DashboardUtils');
ExprCompiler = require('mwater-expressions').ExprCompiler;
ExprCleaner = require('mwater-expressions').ExprCleaner;
WidgetFactory = require('../widgets/WidgetFactory');
WidgetScoper = require('../widgets/WidgetScoper');
ReactElementPrinter = require('react-library/lib/ReactElementPrinter');
LayoutManager = require('../layouts/LayoutManager');
WidgetScopesViewComponent = require('../widgets/WidgetScopesViewComponent'); // Displays a dashboard, handling removing of widgets. No title bar or other decorations.
// Handles scoping and stores the state of scope

module.exports = DashboardViewComponent = function () {
  var DashboardViewComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(DashboardViewComponent, _React$Component);

    var _super = _createSuper(DashboardViewComponent);

    (0, _createClass2["default"])(DashboardViewComponent, [{
      key: "getChildContext",
      // Pass locale down. Both here and DashboardViewComponent to ensure that quickfilters also get context
      value: function getChildContext() {
        return {
          locale: this.props.design.locale
        };
      }
    }]);

    function DashboardViewComponent(props) {
      var _this;

      (0, _classCallCheck2["default"])(this, DashboardViewComponent);
      _this = _super.call(this, props);
      _this.handleStorageChange = _this.handleStorageChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleScopeChange = _this.handleScopeChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleRemoveScope = _this.handleRemoveScope.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleItemsChange = _this.handleItemsChange.bind((0, _assertThisInitialized2["default"])(_this)); // Handle a change of the clipboard and determine which tables the clipboard block uses

      _this.handleClipboardChange = _this.handleClipboardChange.bind((0, _assertThisInitialized2["default"])(_this)); // Call to print the dashboard

      _this.print = _this.print.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleScrollToTOCEntry = _this.handleScrollToTOCEntry.bind((0, _assertThisInitialized2["default"])(_this));
      _this.state = {
        widgetScoper: new WidgetScoper() // Empty scoping

      };
      _this.widgetComps = {}; // Lookup of widget components by id

      return _this;
    }

    (0, _createClass2["default"])(DashboardViewComponent, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        var _this2 = this;

        if (this.props.initialTOCEntryScroll) {
          // Getting heights of widgets properly requires a 0 length timeout
          setTimeout(function () {
            return _this2.handleScrollToTOCEntry(_this2.props.initialTOCEntryScroll.widgetId, _this2.props.initialTOCEntryScroll.entryId);
          }, 0);
        } // Add listener to localstorage to update clipboard display


        return window.addEventListener('storage', this.handleStorageChange);
      }
    }, {
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        // Remove listener
        return window.addEventListener('storage', this.handleStorageChange);
      }
    }, {
      key: "handleStorageChange",
      value: function handleStorageChange() {
        boundMethodCheck(this, DashboardViewComponent);
        return this.forceUpdate();
      }
    }, {
      key: "handleScopeChange",
      value: function handleScopeChange(id, scope) {
        boundMethodCheck(this, DashboardViewComponent);
        return this.setState({
          widgetScoper: this.state.widgetScoper.applyScope(id, scope)
        });
      }
    }, {
      key: "handleRemoveScope",
      value: function handleRemoveScope(id) {
        boundMethodCheck(this, DashboardViewComponent);
        return this.setState({
          widgetScoper: this.state.widgetScoper.applyScope(id, null)
        });
      }
    }, {
      key: "handleItemsChange",
      value: function handleItemsChange(items) {
        var design;
        boundMethodCheck(this, DashboardViewComponent);
        design = _.extend({}, this.props.design, {
          items: items
        });
        return this.props.onDesignChange(design);
      }
    }, {
      key: "handleClipboardChange",
      value: function handleClipboardChange(block) {
        var err, tables;
        boundMethodCheck(this, DashboardViewComponent);

        try {
          // If empty, just set it
          if (!block) {
            window.localStorage.removeItem("DashboardViewComponent.clipboard");
            this.forceUpdate();
            return;
          } // Determine which tables are used (just peek for any uses of the table name. Not ideal, but easy)


          tables = _.pluck(_.filter(this.props.schema.getTables(), function (table) {
            return JSON.stringify(block).includes(JSON.stringify(table.id));
          }), "id"); // Store in clipboard

          window.localStorage.setItem("DashboardViewComponent.clipboard", JSON.stringify({
            block: block,
            tables: tables
          }));
          return this.forceUpdate();
        } catch (error) {
          err = error;
          return alert("Clipboard not available");
        }
      }
    }, {
      key: "getClipboardContents",
      value: function getClipboardContents() {
        var err;

        try {
          return JSON.parse(window.localStorage.getItem("DashboardViewComponent.clipboard") || "null");
        } catch (error) {
          err = error;
          return null;
        }
      }
    }, {
      key: "print",
      value: function print() {
        var elem, printer;
        boundMethodCheck(this, DashboardViewComponent); // Create element at 96 dpi (usual for browsers) and 7.5" across (letter - 0.5" each side). 1440 is double, so scale down
        // props are immutable in React 0.14+

        elem = R('div', {
          style: {
            transform: "scale(0.5)",
            transformOrigin: "top left"
          }
        }, R('div', {
          style: {
            width: 1440
          }
        }, R(DashboardViewComponent, _.extend({}, this.props, {
          width: 1440,
          onDesignChange: null
        }))));
        printer = new ReactElementPrinter();
        return printer.print(elem, {
          delay: 5000
        });
      } // Get filters from props filters combined with dashboard filters

    }, {
      key: "getCompiledFilters",
      value: function getCompiledFilters() {
        var compiledFilters;
        compiledFilters = DashboardUtils.getCompiledFilters(this.props.design, this.props.schema, DashboardUtils.getFilterableTables(this.props.design, this.props.schema));
        compiledFilters = compiledFilters.concat(this.props.filters || []);
        return compiledFilters;
      } // Get list of TOC entries

    }, {
      key: "getTOCEntries",
      value: function getTOCEntries(layoutManager) {
        var design, entries, entry, i, id, j, len, len1, ref, ref1, type, widget;
        entries = [];
        ref = layoutManager.getAllWidgets(this.props.design.items);

        for (i = 0, len = ref.length; i < len; i++) {
          var _ref$i = ref[i];
          id = _ref$i.id;
          type = _ref$i.type;
          design = _ref$i.design;
          widget = WidgetFactory.createWidget(type);
          ref1 = widget.getTOCEntries(design, this.props.namedStrings); // Add widgetId to each one

          for (j = 0, len1 = ref1.length; j < len1; j++) {
            entry = ref1[j];
            entries.push(_.extend({}, entry, {
              widgetId: id
            }));
          }
        }

        return entries;
      }
    }, {
      key: "handleScrollToTOCEntry",
      value: function handleScrollToTOCEntry(widgetId, entryId) {
        var widgetComp;
        boundMethodCheck(this, DashboardViewComponent);
        widgetComp = this.widgetComps[widgetId];

        if (!widgetComp) {
          return;
        }

        return typeof widgetComp.scrollToTOCEntry === "function" ? widgetComp.scrollToTOCEntry(entryId) : void 0;
      }
    }, {
      key: "renderScopes",
      value: function renderScopes() {
        return R(WidgetScopesViewComponent, {
          scopes: this.state.widgetScoper.getScopes(),
          onRemoveScope: this.handleRemoveScope
        });
      }
    }, {
      key: "render",
      value: function render() {
        var _this3 = this;

        var cantPasteMessage, clipboardContents, compiledFilters, filterableTables, layoutManager, renderWidget, style, tocEntries;
        layoutManager = LayoutManager.createLayoutManager(this.props.design.layout);
        compiledFilters = this.getCompiledFilters(); // Get filterable tables

        filterableTables = DashboardUtils.getFilterableTables(this.props.design, this.props.schema); // Determine toc entries

        tocEntries = this.getTOCEntries(layoutManager); // Get clipboard contents

        clipboardContents = this.getClipboardContents(); // Check if can't paste because of missing table

        if (clipboardContents && !_.all(clipboardContents.tables, function (table) {
          return _this3.props.schema.getTable(table);
        })) {
          cantPasteMessage = "Dashboard is missing one or more data sources needed for the copied item.";
        }

        renderWidget = function renderWidget(options) {
          var filters, implicitFilterBuilder, widget, widgetElem;
          widget = WidgetFactory.createWidget(options.type); // Get filters (passed in plus dashboard widget scoper filters)

          filters = compiledFilters.concat(_this3.state.widgetScoper.getFilters(options.id)); // Extend the filters to include implicit filters (filter children in 1-n relationships)

          if (_this3.props.design.implicitFiltersEnabled || _this3.props.design.implicitFiltersEnabled == null) {
            // Default is true
            implicitFilterBuilder = new ImplicitFilterBuilder(_this3.props.schema);
            filters = implicitFilterBuilder.extendFilters(filterableTables, filters);
          }

          widgetElem = widget.createViewElement({
            schema: _this3.props.schema,
            dataSource: _this3.props.dataSource,
            widgetDataSource: _this3.props.dashboardDataSource.getWidgetDataSource(options.id),
            design: options.design,
            scope: _this3.state.widgetScoper.getScope(options.id),
            filters: filters,
            onScopeChange: _this3.handleScopeChange.bind(null, options.id),
            onDesignChange: options.onDesignChange,
            width: options.width,
            height: options.height,
            onRowClick: _this3.props.onRowClick,
            namedStrings: _this3.props.namedStrings,
            tocEntries: tocEntries,
            onScrollToTOCEntry: _this3.handleScrollToTOCEntry
          }); // Keep references to widget elements

          widgetElem = React.cloneElement(widgetElem, {
            ref: function ref(c) {
              return _this3.widgetComps[options.id] = c;
            }
          });
          return widgetElem;
        };

        style = {
          height: "100%",
          position: "relative",
          overflow: "hidden" // Prevent this block from taking up too much space. Scrolling handled by layout manager

        }; // Render widget container

        return R("div", {
          style: style
        }, this.renderScopes(), layoutManager.renderLayout({
          items: this.props.design.items,
          onItemsChange: this.props.onDesignChange != null ? this.handleItemsChange : void 0,
          style: this.props.design.style,
          renderWidget: renderWidget,
          clipboard: clipboardContents != null ? clipboardContents.block : void 0,
          onClipboardChange: this.handleClipboardChange,
          cantPasteMessage: cantPasteMessage
        }));
      }
    }]);
    return DashboardViewComponent;
  }(React.Component);

  ;
  DashboardViewComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    // schema to use
    dataSource: PropTypes.object.isRequired,
    // data source to use. Only used when designing, for display uses dashboardDataSource
    dashboardDataSource: PropTypes.object.isRequired,
    // dashboard data source
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func,
    // Leave unset for readonly
    onRowClick: PropTypes.func,
    // Called with (tableId, rowId) when item is clicked
    namedStrings: PropTypes.object,
    // Optional lookup of string name to value. Used for {{branding}} and other replacement strings in text widget
    // Filters to add to the dashboard (includes extra filters and any quickfilters from the dashboard component. Does not include dashboard level filters)
    filters: PropTypes.arrayOf(PropTypes.shape({
      table: PropTypes.string.isRequired,
      // id table to filter
      jsonql: PropTypes.object.isRequired // jsonql filter with {alias} for tableAlias

    })),
    // Entry to scroll to initially when dashboard is loaded
    initialTOCEntryScroll: PropTypes.shape({
      widgetId: PropTypes.string.isRequired,
      entryId: PropTypes.any
    })
  };
  DashboardViewComponent.childContextTypes = {
    locale: PropTypes.string
  };
  return DashboardViewComponent;
}.call(void 0);