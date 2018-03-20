var DashboardUtils, DashboardViewComponent, DragDropContextComponent, ExprCleaner, ExprCompiler, H, HTML5Backend, ImplicitFilterBuilder, LayoutManager, NestableDragDropContext, PropTypes, R, React, ReactElementPrinter, WidgetFactory, WidgetScoper, WidgetScopesViewComponent, uuid,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

React = require('react');

H = React.DOM;

R = React.createElement;

uuid = require('uuid');

HTML5Backend = require('react-dnd-html5-backend');

NestableDragDropContext = require("react-library/lib/NestableDragDropContext");

ImplicitFilterBuilder = require('../ImplicitFilterBuilder');

DashboardUtils = require('./DashboardUtils');

ExprCompiler = require('mwater-expressions').ExprCompiler;

ExprCleaner = require('mwater-expressions').ExprCleaner;

WidgetFactory = require('../widgets/WidgetFactory');

WidgetScoper = require('../widgets/WidgetScoper');

ReactElementPrinter = require('react-library/lib/ReactElementPrinter');

LayoutManager = require('../layouts/LayoutManager');

WidgetScopesViewComponent = require('../widgets/WidgetScopesViewComponent');

module.exports = DashboardViewComponent = (function(superClass) {
  extend(DashboardViewComponent, superClass);

  DashboardViewComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    dashboardDataSource: PropTypes.object.isRequired,
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func,
    width: PropTypes.number,
    standardWidth: PropTypes.number,
    onRowClick: PropTypes.func,
    namedStrings: PropTypes.object,
    filters: PropTypes.arrayOf(PropTypes.shape({
      table: PropTypes.string.isRequired,
      jsonql: PropTypes.object.isRequired
    }))
  };

  DashboardViewComponent.defaultProps = {
    standardWidth: 1440
  };

  DashboardViewComponent.childContextTypes = {
    locale: PropTypes.string
  };

  DashboardViewComponent.prototype.getChildContext = function() {
    return {
      locale: this.props.design.locale
    };
  };

  function DashboardViewComponent(props) {
    this.handleScrollToTOCEntry = bind(this.handleScrollToTOCEntry, this);
    this.print = bind(this.print, this);
    this.handleItemsChange = bind(this.handleItemsChange, this);
    this.handleRemoveScope = bind(this.handleRemoveScope, this);
    this.handleScopeChange = bind(this.handleScopeChange, this);
    DashboardViewComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      widgetScoper: new WidgetScoper()
    };
    this.widgetComps = {};
  }

  DashboardViewComponent.prototype.handleScopeChange = function(id, scope) {
    return this.setState({
      widgetScoper: this.state.widgetScoper.applyScope(id, scope)
    });
  };

  DashboardViewComponent.prototype.handleRemoveScope = function(id) {
    return this.setState({
      widgetScoper: this.state.widgetScoper.applyScope(id, null)
    });
  };

  DashboardViewComponent.prototype.handleItemsChange = function(items) {
    var design;
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
    }, H.div({
      style: {
        width: 1440
      }
    }, R(DashboardViewComponent, _.extend({}, this.props, {
      width: 1440,
      standardWidth: 1440,
      onDesignChange: null
    }))));
    printer = new ReactElementPrinter();
    return printer.print(elem, {
      delay: 5000
    });
  };

  DashboardViewComponent.prototype.getCompiledFilters = function() {
    var compiledFilters;
    compiledFilters = DashboardUtils.getCompiledFilters(this.props.design, this.props.schema, DashboardUtils.getFilterableTables(this.props.design, this.props.schema));
    compiledFilters = compiledFilters.concat(this.props.filters || []);
    return compiledFilters;
  };

  DashboardViewComponent.prototype.getTOCEntries = function(layoutManager) {
    var design, entries, entry, i, id, j, len, len1, ref, ref1, ref2, type, widget;
    entries = [];
    ref = layoutManager.getAllWidgets(this.props.design.items);
    for (i = 0, len = ref.length; i < len; i++) {
      ref1 = ref[i], id = ref1.id, type = ref1.type, design = ref1.design;
      widget = WidgetFactory.createWidget(type);
      ref2 = widget.getTOCEntries(design);
      for (j = 0, len1 = ref2.length; j < len1; j++) {
        entry = ref2[j];
        entries.push(_.extend({}, entry, {
          widgetId: id
        }));
      }
    }
    return entries;
  };

  DashboardViewComponent.prototype.handleScrollToTOCEntry = function(widgetId, entryId) {
    var widgetComp;
    widgetComp = this.widgetComps[widgetId];
    if (!widgetComp) {
      return;
    }
    return typeof widgetComp.scrollToTOCEntry === "function" ? widgetComp.scrollToTOCEntry(entryId) : void 0;
  };

  DashboardViewComponent.prototype.renderScopes = function() {
    return R(WidgetScopesViewComponent, {
      scopes: this.state.widgetScoper.getScopes(),
      onRemoveScope: this.handleRemoveScope
    });
  };

  DashboardViewComponent.prototype.render = function() {
    var compiledFilters, filterableTables, layoutManager, renderWidget, style, tocEntries;
    layoutManager = LayoutManager.createLayoutManager(this.props.design.layout);
    compiledFilters = this.getCompiledFilters();
    filterableTables = DashboardUtils.getFilterableTables(this.props.design, this.props.schema);
    tocEntries = this.getTOCEntries(layoutManager);
    renderWidget = (function(_this) {
      return function(options) {
        var filters, implicitFilterBuilder, widget, widgetElem;
        widget = WidgetFactory.createWidget(options.type);
        filters = compiledFilters.concat(_this.state.widgetScoper.getFilters(options.id));
        if (_this.props.design.implicitFiltersEnabled || (_this.props.design.implicitFiltersEnabled == null)) {
          implicitFilterBuilder = new ImplicitFilterBuilder(_this.props.schema);
          filters = implicitFilterBuilder.extendFilters(filterableTables, filters);
        }
        widgetElem = widget.createViewElement({
          schema: _this.props.schema,
          dataSource: _this.props.dataSource,
          widgetDataSource: _this.props.dashboardDataSource.getWidgetDataSource(options.id),
          design: options.design,
          scope: _this.state.widgetScoper.getScope(options.id),
          filters: filters,
          onScopeChange: _this.handleScopeChange.bind(null, options.id),
          onDesignChange: options.onDesignChange,
          width: options.width,
          height: options.height,
          standardWidth: options.standardWidth,
          onRowClick: _this.props.onRowClick,
          namedStrings: _this.props.namedStrings,
          tocEntries: tocEntries,
          onScrollToTOCEntry: _this.handleScrollToTOCEntry
        });
        widgetElem = React.cloneElement(widgetElem, {
          ref: (function(c) {
            return _this.widgetComps[options.id] = c;
          })
        });
        return widgetElem;
      };
    })(this);
    style = {
      height: "100%",
      position: "relative"
    };
    return R(DragDropContextComponent, {
      style: style
    }, this.renderScopes(), layoutManager.renderLayout({
      width: this.props.width,
      standardWidth: this.props.standardWidth,
      items: this.props.design.items,
      onItemsChange: this.props.onDesignChange != null ? this.handleItemsChange : void 0,
      style: this.props.design.style,
      renderWidget: renderWidget
    }));
  };

  return DashboardViewComponent;

})(React.Component);

DragDropContextComponent = (function(superClass) {
  extend(DragDropContextComponent, superClass);

  function DragDropContextComponent() {
    return DragDropContextComponent.__super__.constructor.apply(this, arguments);
  }

  DragDropContextComponent.prototype.render = function() {
    return H.div(this.props);
  };

  return DragDropContextComponent;

})(React.Component);

DragDropContextComponent = NestableDragDropContext(HTML5Backend)(DragDropContextComponent);
