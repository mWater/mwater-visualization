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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let DashboardComponent;
const prop_types_1 = __importDefault(require("prop-types"));
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const UndoStack_1 = __importDefault(require("../UndoStack"));
const DashboardUtils = __importStar(require("./DashboardUtils"));
const DashboardViewComponent_1 = __importDefault(require("./DashboardViewComponent"));
const QuickfiltersComponent_1 = __importDefault(require("../quickfilter/QuickfiltersComponent"));
const QuickfilterCompiler_1 = __importDefault(require("../quickfilter/QuickfilterCompiler"));
const SettingsModalComponent_1 = __importDefault(require("./SettingsModalComponent"));
const LayoutManager_1 = __importDefault(require("../layouts/LayoutManager"));
const DashboardUpgrader_1 = __importDefault(require("./DashboardUpgrader"));
const LayoutOptionsComponent_1 = require("./LayoutOptionsComponent");
const ModalWindowComponent_1 = __importDefault(require("react-library/lib/ModalWindowComponent"));
const layoutOptions_1 = require("./layoutOptions");
// Dashboard component that includes an action bar at the top
// Manages undo stack and quickfilter value
exports.default = DashboardComponent = (function () {
    var _a;
    DashboardComponent = (_a = class DashboardComponent extends react_1.default.Component {
            constructor(props) {
                super(props);
                // Get the values of the quick filters
                this.getQuickfilterValues = () => {
                    return this.state.quickfiltersValues || [];
                };
                this.handlePrint = () => {
                    return this.dashboardView.print();
                };
                this.handleUndo = () => {
                    const undoStack = this.state.undoStack.undo();
                    // We need to use callback as state is applied later
                    return this.setState({ undoStack }, () => this.props.onDesignChange(undoStack.getValue()));
                };
                this.handleRedo = () => {
                    const undoStack = this.state.undoStack.redo();
                    // We need to use callback as state is applied later
                    return this.setState({ undoStack }, () => this.props.onDesignChange(undoStack.getValue()));
                };
                // Saves a json file to disk
                this.handleSaveDesignFile = () => {
                    // Make a blob and save
                    const blob = new Blob([JSON.stringify(this.props.design, null, 2)], { type: "text/json" });
                    // Require at use as causes server problems
                    const FileSaver = require("file-saver");
                    return FileSaver.saveAs(blob, "Dashboard.json");
                };
                this.handleSettings = () => {
                    return this.settings.show(this.props.design);
                };
                this.handleToggleEditing = () => {
                    return this.setState({ editing: !this.state.editing });
                };
                this.handleOpenLayoutOptions = () => {
                    return this.setState({ layoutOptionsOpen: true });
                };
                this.handleRefreshData = () => {
                    var _a, _b;
                    (_b = (_a = this.props.dataSource).clearCache) === null || _b === void 0 ? void 0 : _b.call(_a);
                    return this.setState({ refreshKey: this.state.refreshKey + 1 });
                };
                this.handleStyleChange = (style) => {
                    return this.props.onDesignChange(lodash_1.default.extend({}, this.props.design, { style: style || null }));
                };
                this.handleDesignChange = (design) => {
                    // If quickfilters have changed, reset values
                    if (!lodash_1.default.isEqual(this.props.design.quickfilters, design.quickfilters)) {
                        this.setState({ quickfiltersValues: null });
                    }
                    return this.props.onDesignChange(design);
                };
                this.handleShowQuickfilters = () => {
                    return this.setState({ hideQuickfilters: false });
                };
                this.handleUpgrade = () => {
                    if (!confirm("This will upgrade your dashboard to the new kind with enhanced features. You can click Undo immediately afterwards if you wish to revert it. Continue?")) {
                        return;
                    }
                    const design = new DashboardUpgrader_1.default().upgrade(this.props.design);
                    this.props.onDesignChange(design);
                    return alert("Upgrade completed. Some widgets may need to be resized. Click Undo to revert back to old dashboard style.");
                };
                this.refDashboardView = (el) => {
                    return (this.dashboardView = el);
                };
                const layoutOptions = layoutOptions_1.getLayoutOptions(props.design);
                this.state = {
                    undoStack: new UndoStack_1.default().push(props.design),
                    quickfiltersValues: props.quickfiltersValues,
                    editing: LayoutManager_1.default.createLayoutManager(props.design.layout).isEmpty(props.design.items) &&
                        props.onDesignChange != null,
                    layoutOptionsOpen: false,
                    hideQuickfilters: layoutOptions.hideQuickfiltersWidth != null &&
                        layoutOptions.hideQuickfiltersWidth > document.body.clientWidth,
                    refreshKey: 1
                };
            }
            getChildContext() {
                return {
                    // Pass locale down. Both here and DashboardViewComponent to ensure that quickfilters also get context
                    locale: this.props.design.locale,
                    // Pass active tables down to table select components so they can present a shorter list
                    activeTables: DashboardUtils.getFilterableTables(this.props.design, this.props.schema)
                };
            }
            componentWillReceiveProps(nextProps) {
                let { undoStack } = this.state;
                // Clear stack if key changed
                if (nextProps.undoStackKey !== this.props.undoStackKey) {
                    undoStack = new UndoStack_1.default();
                }
                // Save on stack
                undoStack = undoStack.push(nextProps.design);
                this.setState({ undoStack });
                // Clear quickfilters if definition changed
                if (!lodash_1.default.isEqual(this.props.design.quickfilters, nextProps.design.quickfilters)) {
                    this.setState({ quickfiltersValues: nextProps.quickfiltersValues });
                }
                if (nextProps.onDesignChange == null) {
                    return this.setState({ editing: false });
                }
            }
            // Get filters from props filters combined with dashboard filters
            getCompiledFilters() {
                let compiledFilters = DashboardUtils.getCompiledFilters(this.props.design, this.props.schema, DashboardUtils.getFilterableTables(this.props.design, this.props.schema));
                compiledFilters = compiledFilters.concat(this.props.filters || []);
                return compiledFilters;
            }
            renderEditingSwitch() {
                return R("a", {
                    key: "edit",
                    className: `btn btn-primary btn-sm ${this.state.editing ? "active" : ""}`,
                    onClick: this.handleToggleEditing
                }, R("span", { className: "glyphicon glyphicon-pencil" }), this.state.editing ? " Editing" : " Edit");
            }
            renderStyleItem(style) {
                const isActive = (this.props.design.style || "default") === style;
                const content = (() => {
                    switch (style) {
                        case "default":
                            return [
                                R("h4", { key: "name", className: "list-group-item-heading" }, "Classic Dashboard"),
                                R("p", { key: "description", className: "list-group-item-text" }, "Ideal for data display with minimal text")
                            ];
                        case "greybg":
                            return [
                                R("h4", { key: "name", className: "list-group-item-heading" }, "Framed Dashboard"),
                                R("p", { key: "description", className: "list-group-item-text" }, "Each widget is white on a grey background")
                            ];
                        case "story":
                            return [
                                R("h4", { key: "name", className: "list-group-item-heading" }, "Story"),
                                R("p", { key: "description", className: "list-group-item-text" }, "Ideal for data-driven storytelling with lots of text. Responsive and mobile-friendly")
                            ];
                    }
                })();
                return R("a", {
                    key: style,
                    className: `list-group-item ${isActive ? "active" : ""}`,
                    onClick: this.handleStyleChange.bind(null, style)
                }, content);
            }
            renderStyle() {
                return R("button", { type: "button", key: "style", className: "btn btn-link btn-sm", onClick: this.handleOpenLayoutOptions }, R("span", { className: "fa fa-mobile" }), R("span", { className: "hide-600px" }, " Layout "));
            }
            renderActionLinks() {
                return R("div", null, this.state.editing && (this.props.design.layout || "grid") === "grid"
                    ? R("a", { key: "upgrade", className: "btn btn-info btn-sm", onClick: this.handleUpgrade }, "Upgrade Dashboard...")
                    : undefined, this.state.editing
                    ? [
                        R("a", {
                            key: "undo",
                            className: `btn btn-link btn-sm ${!this.state.undoStack.canUndo() ? "disabled" : ""}`,
                            onClick: this.handleUndo
                        }, R("span", { className: "glyphicon glyphicon-triangle-left" }), R("span", { className: "hide-600px" }, " Undo")),
                        " ",
                        R("a", {
                            key: "redo",
                            className: `btn btn-link btn-sm ${!this.state.undoStack.canRedo() ? "disabled" : ""}`,
                            onClick: this.handleRedo
                        }, R("span", { className: "glyphicon glyphicon-triangle-right" }), R("span", { className: "hide-600px" }, " Redo"))
                    ]
                    : undefined, R("a", { key: "print", className: "btn btn-link btn-sm", onClick: this.handlePrint }, R("span", { className: "glyphicon glyphicon-print" }), R("span", { className: "hide-600px" }, " Print")), R("a", { key: "refresh", className: "btn btn-link btn-sm", onClick: this.handleRefreshData }, R("span", { className: "glyphicon glyphicon-refresh" }), R("span", { className: "hide-600px" }, " Refresh")), this.state.hideQuickfilters && this.props.design.quickfilters && this.props.design.quickfilters.length > 0
                    ? R("a", { key: "showQuickfilters", className: "btn btn-link btn-sm", onClick: this.handleShowQuickfilters }, R("span", { className: "fa fa-filter" }), R("span", { className: "hide-600px" }, " Show Filters"))
                    : undefined, 
                // R 'a', key: "export", className: "btn btn-link btn-sm", onClick: @handleSaveDesignFile,
                //   R('span', className: "glyphicon glyphicon-download-alt")
                //   " Export"
                this.state.editing
                    ? R("a", { key: "settings", className: "btn btn-link btn-sm", onClick: this.handleSettings }, R("span", { className: "glyphicon glyphicon-cog" }), R("span", { className: "hide-600px" }, " Settings"))
                    : undefined, this.state.editing ? this.renderStyle() : undefined, this.props.extraTitleButtonsElem, this.props.onDesignChange != null ? this.renderEditingSwitch() : undefined);
            }
            renderTitleBar() {
                return R("div", { style: { height: 40, padding: 4 } }, R("div", { style: { float: "right" } }, this.renderActionLinks()), this.props.titleElem);
            }
            renderQuickfilter() {
                return R(QuickfiltersComponent_1.default, {
                    design: this.props.design.quickfilters,
                    schema: this.props.schema,
                    dataSource: this.props.dataSource,
                    quickfiltersDataSource: this.props.dashboardDataSource.getQuickfiltersDataSource(),
                    values: this.state.quickfiltersValues,
                    onValuesChange: (values) => this.setState({ quickfiltersValues: values }),
                    locks: this.props.quickfilterLocks,
                    filters: this.getCompiledFilters(),
                    hideTopBorder: this.props.hideTitleBar,
                    onHide: () => this.setState({ hideQuickfilters: true })
                });
            }
            render() {
                let filters = this.props.filters || [];
                // Compile quickfilters
                filters = filters.concat(new QuickfilterCompiler_1.default(this.props.schema).compile(this.props.design.quickfilters, this.state.quickfiltersValues, this.props.quickfilterLocks));
                const dashboardView = R(DashboardViewComponent_1.default, {
                    schema: this.props.schema,
                    dataSource: this.props.dataSource,
                    dashboardDataSource: this.props.dashboardDataSource,
                    ref: this.refDashboardView,
                    design: this.props.design,
                    onDesignChange: this.state.editing ? this.props.onDesignChange : undefined,
                    filters,
                    onRowClick: this.props.onRowClick,
                    namedStrings: this.props.namedStrings,
                    hideScopes: this.state.hideQuickfilters,
                    refreshKey: this.state.refreshKey
                });
                const readonlyDashboardView = R(DashboardViewComponent_1.default, {
                    schema: this.props.schema,
                    dataSource: this.props.dataSource,
                    dashboardDataSource: this.props.dashboardDataSource,
                    ref: this.refDashboardView,
                    design: this.props.design,
                    filters,
                    onRowClick: this.props.onRowClick,
                    namedStrings: this.props.namedStrings,
                    hideScopes: this.state.hideQuickfilters
                });
                return R("div", {
                    style: {
                        display: "grid",
                        gridTemplateRows: this.props.hideTitleBar ? "auto 1fr" : "auto auto 1fr",
                        height: "100%"
                    }
                }, !this.props.hideTitleBar ? this.renderTitleBar() : undefined, R("div", null, !this.state.hideQuickfilters ? this.renderQuickfilter() : undefined), dashboardView, this.props.onDesignChange != null
                    ? R(SettingsModalComponent_1.default, {
                        onDesignChange: this.handleDesignChange,
                        schema: this.props.schema,
                        dataSource: this.props.dataSource,
                        ref: (c) => {
                            return (this.settings = c);
                        }
                    })
                    : undefined, this.state.layoutOptionsOpen
                    ? R(ModalWindowComponent_1.default, { isOpen: true, outerPadding: 10, innerPadding: 10 }, R(LayoutOptionsComponent_1.LayoutOptionsComponent, {
                        design: this.props.design,
                        onDesignChange: this.props.onDesignChange,
                        onClose: () => this.setState({ layoutOptionsOpen: false }),
                        dashboardView: readonlyDashboardView,
                        quickfiltersView: this.renderQuickfilter()
                    }))
                    : undefined);
            }
        },
        _a.propTypes = {
            design: prop_types_1.default.object.isRequired,
            onDesignChange: prop_types_1.default.func,
            schema: prop_types_1.default.object.isRequired,
            dataSource: prop_types_1.default.object.isRequired,
            dashboardDataSource: prop_types_1.default.object.isRequired,
            titleElem: prop_types_1.default.node,
            extraTitleButtonsElem: prop_types_1.default.node,
            undoStackKey: prop_types_1.default.any,
            printScaling: prop_types_1.default.bool,
            onRowClick: prop_types_1.default.func,
            namedStrings: prop_types_1.default.object,
            quickfilterLocks: prop_types_1.default.array,
            quickfiltersValues: prop_types_1.default.array,
            // Filters to add to the dashboard
            filters: prop_types_1.default.arrayOf(prop_types_1.default.shape({
                table: prop_types_1.default.string.isRequired,
                jsonql: prop_types_1.default.object.isRequired // jsonql filter with {alias} for tableAlias
            })),
            hideTitleBar: prop_types_1.default.bool // True to hide title bar and related controls
        },
        _a.defaultProps = { printScaling: true },
        _a.childContextTypes = {
            locale: prop_types_1.default.string,
            activeTables: prop_types_1.default.arrayOf(prop_types_1.default.string.isRequired)
        },
        _a);
    return DashboardComponent;
})();
