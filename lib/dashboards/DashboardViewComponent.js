"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const prop_types_1 = __importDefault(require("prop-types"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const ImplicitFilterBuilder_1 = __importDefault(require("../ImplicitFilterBuilder"));
const DashboardUtils = __importStar(require("./DashboardUtils"));
const WidgetFactory_1 = __importDefault(require("../widgets/WidgetFactory"));
const WidgetScoper_1 = __importDefault(require("../widgets/WidgetScoper"));
const ReactElementPrinter_1 = __importDefault(require("react-library/lib/ReactElementPrinter"));
const LayoutManager_1 = __importDefault(require("../layouts/LayoutManager"));
const WidgetScopesViewComponent_1 = __importDefault(require("../widgets/WidgetScopesViewComponent"));
const layoutOptions_1 = require("./layoutOptions");
const WidgetComponent_1 = require("./WidgetComponent");
/**
 * Displays a dashboard, handling removing of widgets. No title bar or other decorations.
 * Handles scoping and stores the state of scope
 */
class DashboardViewComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleStorageChange = () => {
            return this.forceUpdate();
        };
        this.handleScopeChange = (id, scope) => {
            return this.setState({ widgetScoper: this.state.widgetScoper.applyScope(id, scope) });
        };
        this.handleRemoveScope = (id) => {
            return this.setState({ widgetScoper: this.state.widgetScoper.applyScope(id, null) });
        };
        this.handleItemsChange = (items) => {
            const design = lodash_1.default.extend({}, this.props.design, { items });
            return this.props.onDesignChange(design);
        };
        // Handle a change of the clipboard and determine which tables the clipboard block uses
        this.handleClipboardChange = (block) => {
            try {
                // If empty, just set it
                if (!block) {
                    window.localStorage.removeItem("DashboardViewComponent.clipboard");
                    this.forceUpdate();
                    return;
                }
                // Determine which tables are used (just peek for any uses of the table name. Not ideal, but easy)
                const tables = lodash_1.default.pluck(lodash_1.default.filter(this.props.schema.getTables(), (table) => JSON.stringify(block).includes(JSON.stringify(table.id))), "id");
                // Store in clipboard
                window.localStorage.setItem("DashboardViewComponent.clipboard", JSON.stringify({ block, tables }));
                return this.forceUpdate();
            }
            catch (err) {
                return alert("Clipboard not available");
            }
        };
        // Call to print the dashboard
        this.print = () => {
            // Create element at 1080 wide (use as standard printing width)
            const elem = R("div", { style: { width: 1080 } }, R(DashboardViewComponent, lodash_1.default.extend({}, this.props, { onDesignChange: null, printMode: true })));
            const printer = new ReactElementPrinter_1.default();
            return printer.print(elem, { delay: 5000 });
        };
        this.handleScrollToTOCEntry = (widgetId, entryId) => {
            var _a;
            const widgetComp = this.widgetComps[widgetId];
            if (!widgetComp) {
                return;
            }
            // Call scrollToTOCEntry if present
            return (_a = widgetComp.scrollToTOCEntry) === null || _a === void 0 ? void 0 : _a.call(widgetComp, entryId);
        };
        this.compRef = (widgetId, comp) => {
            return (this.widgetComps[widgetId] = comp);
        };
        this.state = {
            widgetScoper: new WidgetScoper_1.default() // Empty scoping
        };
        this.widgetComps = {}; // Lookup of widget components by id
    }
    // Pass locale down. Both here and DashboardViewComponent to ensure that quickfilters also get context
    getChildContext() {
        return { locale: this.props.design.locale };
    }
    componentDidMount() {
        if (this.props.initialTOCEntryScroll) {
            // Getting heights of widgets properly requires a 0 length timeout
            setTimeout(() => {
                return this.handleScrollToTOCEntry(this.props.initialTOCEntryScroll.widgetId, this.props.initialTOCEntryScroll.entryId);
            }, 0);
        }
        // Add listener to localstorage to update clipboard display
        return window.addEventListener("storage", this.handleStorageChange);
    }
    componentWillUnmount() {
        // Remove listener
        return window.addEventListener("storage", this.handleStorageChange);
    }
    getClipboardContents() {
        try {
            return JSON.parse(window.localStorage.getItem("DashboardViewComponent.clipboard") || "null");
        }
        catch (err) {
            return null;
        }
    }
    // Get filters from props filters combined with dashboard filters
    getCompiledFilters() {
        let compiledFilters = DashboardUtils.getCompiledFilters(this.props.design, this.props.schema, DashboardUtils.getFilterableTables(this.props.design, this.props.schema));
        compiledFilters = compiledFilters.concat(this.props.filters || []);
        return compiledFilters;
    }
    // Get list of TOC entries
    getTOCEntries(layoutManager) {
        const entries = [];
        for (let { id, type, design } of layoutManager.getAllWidgets(this.props.design.items)) {
            const widget = WidgetFactory_1.default.createWidget(type);
            // Add widgetId to each one
            for (let entry of widget.getTOCEntries(design, this.props.namedStrings)) {
                entries.push(lodash_1.default.extend({}, entry, { widgetId: id }));
            }
        }
        return entries;
    }
    renderScopes() {
        return R(WidgetScopesViewComponent_1.default, {
            scopes: this.state.widgetScoper.getScopes(),
            onRemoveScope: this.handleRemoveScope
        });
    }
    render() {
        let cantPasteMessage = "";
        const layoutManager = LayoutManager_1.default.createLayoutManager(this.props.design.layout);
        const compiledFilters = this.getCompiledFilters();
        // Get filterable tables
        const filterableTables = DashboardUtils.getFilterableTables(this.props.design, this.props.schema);
        // Determine toc entries
        const tocEntries = this.getTOCEntries(layoutManager);
        // Get clipboard contents
        const clipboardContents = this.getClipboardContents();
        // Check if can't paste because of missing table
        if (clipboardContents && !lodash_1.default.all(clipboardContents.tables, (table) => this.props.schema.getTable(table))) {
            cantPasteMessage = "Dashboard is missing one or more data sources needed for the copied item.";
        }
        const renderWidget = (options) => {
            const widget = WidgetFactory_1.default.createWidget(options.type);
            // Get filters (passed in plus dashboard widget scoper filters)
            let filters = compiledFilters.concat(this.state.widgetScoper.getFilters(options.id));
            // Extend the filters to include implicit filters (filter children in 1-n relationships)
            if (this.props.design.implicitFiltersEnabled || this.props.design.implicitFiltersEnabled == null) {
                // Default is true
                const implicitFilterBuilder = new ImplicitFilterBuilder_1.default(this.props.schema);
                filters = implicitFilterBuilder.extendFilters(filterableTables, filters);
            }
            const widgetElem = R(WidgetComponent_1.WidgetComponent, {
                key: options.id,
                id: options.id,
                type: options.type,
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                dashboardDataSource: this.props.dashboardDataSource,
                design: options.design,
                scope: this.state.widgetScoper.getScope(options.id),
                filters,
                onScopeChange: this.handleScopeChange.bind(null, options.id),
                onDesignChange: options.onDesignChange,
                width: options.width,
                height: options.height,
                onRowClick: this.props.onRowClick,
                namedStrings: this.props.namedStrings,
                tocEntries,
                onScrollToTOCEntry: this.handleScrollToTOCEntry,
                // Keep references to widget elements
                widgetRef: this.compRef.bind(null, options.id),
                refreshKey: this.props.refreshKey
            });
            return widgetElem;
        };
        const style = {
            height: "100%",
            position: "relative"
        };
        if (!this.props.printMode) {
            // Prevent this block from taking up too much space. Scrolling handled by layout manager.
            // Setting overflow-x stops the inner div from becoming too tall
            style.overflowX = "auto";
        }
        // Render widget container
        return R("div", { style }, !this.props.hideScopes ? this.renderScopes() : undefined, layoutManager.renderLayout({
            items: this.props.design.items,
            onItemsChange: this.props.onDesignChange != null ? this.handleItemsChange : undefined,
            style: this.props.design.style || null,
            layoutOptions: (0, layoutOptions_1.getLayoutOptions)(this.props.design),
            renderWidget,
            clipboard: clipboardContents === null || clipboardContents === void 0 ? void 0 : clipboardContents.block,
            onClipboardChange: this.handleClipboardChange,
            cantPasteMessage
        }));
    }
}
exports.default = DashboardViewComponent;
DashboardViewComponent.childContextTypes = { locale: prop_types_1.default.string };
