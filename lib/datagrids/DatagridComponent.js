"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const AutoSizeComponent_1 = __importDefault(require("react-library/lib/AutoSizeComponent"));
const ActionCancelModalComponent_1 = __importDefault(require("react-library/lib/ActionCancelModalComponent"));
const mwater_expressions_1 = require("mwater-expressions");
const mwater_expressions_2 = require("mwater-expressions");
const mwater_expressions_3 = require("mwater-expressions");
const DatagridViewComponent_1 = __importDefault(require("./DatagridViewComponent"));
const DatagridDesignerComponent_1 = __importDefault(require("./DatagridDesignerComponent"));
const DatagridUtils_1 = __importDefault(require("./DatagridUtils"));
const QuickfiltersComponent_1 = __importDefault(require("../quickfilter/QuickfiltersComponent"));
const QuickfilterCompiler_1 = __importDefault(require("../quickfilter/QuickfilterCompiler"));
const FindReplaceModalComponent_1 = __importDefault(require("./FindReplaceModalComponent"));
// Datagrid with decorations
// See README.md for description of datagrid format
// Design should be cleaned already before being passed in (see DatagridUtils)
class DatagridComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        // Get the values of the quick filters
        this.getQuickfilterValues = () => {
            return this.state.quickfiltersValues || [];
        };
        // Get filters that are applied by the quickfilters
        this.getQuickfilterFilters = () => {
            return new QuickfilterCompiler_1.default(this.props.schema).compile(this.props.design.quickfilters, this.state.quickfiltersValues, this.props.quickfilterLocks);
        };
        this.handleCellEditingToggle = () => {
            if (this.state.cellEditingEnabled) {
                return this.setState({ cellEditingEnabled: false });
            }
            else {
                if (confirm("Turn on cell editing? This will allow you to edit the live data and is an advanced feature.")) {
                    return this.setState({ cellEditingEnabled: true });
                }
            }
        };
        this.handleEdit = () => {
            return this.setState({ editingDesign: true });
        };
        this.state = {
            editingDesign: false,
            cellEditingEnabled: false,
            quickfiltersHeight: null,
            quickfiltersValues: null
        };
    }
    reload() {
        var _a;
        return (_a = this.datagridView) === null || _a === void 0 ? void 0 : _a.reload();
    }
    componentDidMount() {
        return this.updateHeight();
    }
    componentDidUpdate() {
        return this.updateHeight();
    }
    updateHeight() {
        // Calculate quickfilters height
        if (this.quickfilters) {
            if (this.state.quickfiltersHeight !== this.quickfilters.offsetHeight) {
                return this.setState({ quickfiltersHeight: this.quickfilters.offsetHeight });
            }
        }
        else {
            return this.setState({ quickfiltersHeight: 0 });
        }
    }
    // Get datagrid filter compiled for quickfilter filtering
    getCompiledFilters() {
        let jsonql;
        const exprCompiler = new mwater_expressions_2.ExprCompiler(this.props.schema);
        const exprUtils = new mwater_expressions_1.ExprUtils(this.props.schema);
        const exprCleaner = new mwater_expressions_3.ExprCleaner(this.props.schema);
        const compiledFilters = [];
        if (this.props.design.filter) {
            jsonql = exprCompiler.compileExpr({ expr: this.props.design.filter, tableAlias: "{alias}" });
            if (jsonql) {
                compiledFilters.push({
                    table: this.props.design.table,
                    jsonql
                });
            }
        }
        // Add global filters
        for (let filter of this.props.design.globalFilters || []) {
            // Check if exists and is correct type
            const column = this.props.schema.getColumn(this.props.design.table, filter.columnId);
            if (!column) {
                continue;
            }
            const columnExpr = { type: "field", table: this.props.design.table, column: column.id };
            if (exprUtils.getExprType(columnExpr) !== filter.columnType) {
                continue;
            }
            // Create expr
            let expr = {
                type: "op",
                op: filter.op,
                table: this.props.design.table,
                exprs: [columnExpr].concat(filter.exprs)
            };
            // Clean expr
            expr = exprCleaner.cleanExpr(expr, { table: this.props.design.table });
            jsonql = exprCompiler.compileExpr({ expr, tableAlias: "{alias}" });
            if (jsonql) {
                compiledFilters.push({
                    table: this.props.design.table,
                    jsonql
                });
            }
        }
        return compiledFilters;
    }
    // Toggle to allow cell editing
    renderCellEdit() {
        if (!this.props.canEditValue || this.props.onDesignChange == null) {
            return null;
        }
        const label = [
            R("i", { className: this.state.cellEditingEnabled ? "fa fa-fw fa-check-square" : "fa fa-fw fa-square-o" }),
            " ",
            "Cell Editing"
        ];
        return R("a", {
            key: "cell-edit",
            className: "btn btn-link btn-sm",
            onClick: this.handleCellEditingToggle
        }, label);
    }
    renderEditButton() {
        if (!this.props.onDesignChange) {
            return null;
        }
        return R("button", {
            type: "button",
            className: "btn btn-primary",
            onClick: this.handleEdit
        }, R("span", { className: "fas fa-cog" }), " ", "Settings");
    }
    renderFindReplace() {
        if (!this.state.cellEditingEnabled) {
            return null;
        }
        return R("a", {
            key: "findreplace",
            className: "btn btn-link btn-sm",
            onClick: () => this.findReplaceModal.show()
        }, "Find/Replace");
    }
    renderTitleBar() {
        return R("div", { style: { position: "absolute", top: 0, left: 0, right: 0, height: 40, padding: 4 } }, R("div", { style: { float: "right" } }, this.renderFindReplace(), this.renderCellEdit(), this.renderEditButton(), this.props.extraTitleButtonsElem), this.props.titleElem);
    }
    renderQuickfilter() {
        return R("div", {
            style: { position: "absolute", top: 40, left: 0, right: 0 },
            ref: (c) => {
                this.quickfilters = c;
            }
        }, R(QuickfiltersComponent_1.default, {
            design: this.props.design.quickfilters,
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            quickfiltersDataSource: this.props.datagridDataSource.getQuickfiltersDataSource(),
            values: this.state.quickfiltersValues || [],
            onValuesChange: (values) => this.setState({ quickfiltersValues: values }),
            locks: this.props.quickfilterLocks,
            filters: this.getCompiledFilters()
        }));
    }
    // Renders the editor modal
    renderEditor() {
        if (!this.state.editingDesign) {
            return;
        }
        return R(DatagridEditorComponent, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            design: this.props.design,
            onDesignChange: (design) => {
                // If quickfilters have changed, reset values
                if (!lodash_1.default.isEqual(this.props.design.quickfilters, design.quickfilters)) {
                    this.setState({ quickfiltersValues: null });
                }
                this.props.onDesignChange(design);
                return this.setState({ editingDesign: false });
            },
            onCancel: () => this.setState({ editingDesign: false })
        });
    }
    renderFindReplaceModal(filters) {
        return R(FindReplaceModalComponent_1.default, {
            ref: (c) => {
                this.findReplaceModal = c;
            },
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            datagridDataSource: this.props.datagridDataSource,
            design: this.props.design,
            filters,
            canEditValue: this.props.canEditValue,
            updateValue: this.props.updateValue,
            onUpdate: () => {
                var _a;
                // Reload
                return (_a = this.datagridView) === null || _a === void 0 ? void 0 : _a.reload();
            }
        });
    }
    render() {
        var _a;
        let filters = this.props.filters || [];
        // Compile quickfilters
        filters = filters.concat(this.getQuickfilterFilters());
        const hasQuickfilters = ((_a = this.props.design.quickfilters) === null || _a === void 0 ? void 0 : _a[0]) != null;
        return R("div", {
            style: {
                width: "100%",
                height: "100%",
                position: "relative",
                paddingTop: 40 + (this.state.quickfiltersHeight || 0)
            }
        }, this.renderTitleBar(), this.renderQuickfilter(), this.renderEditor(), this.renderFindReplaceModal(filters), R(AutoSizeComponent_1.default, { injectWidth: true, injectHeight: true }, (size) => {
            // Clean before displaying
            const design = new DatagridUtils_1.default(this.props.schema).cleanDesign(this.props.design);
            if (!new DatagridUtils_1.default(this.props.schema).validateDesign(design)) {
                return R(DatagridViewComponent_1.default, {
                    ref: (view) => {
                        this.datagridView = view;
                    },
                    width: size.width - 1,
                    height: size.height - 1,
                    pageSize: 100,
                    schema: this.props.schema,
                    dataSource: this.props.dataSource,
                    datagridDataSource: this.props.datagridDataSource,
                    design,
                    filters,
                    onDesignChange: this.props.onDesignChange,
                    onRowClick: this.props.onRowClick,
                    onRowDoubleClick: this.props.onRowDoubleClick,
                    canEditValue: this.state.cellEditingEnabled ? this.props.canEditValue : undefined,
                    updateValue: this.state.cellEditingEnabled ? this.props.updateValue : undefined
                });
            }
            else if (this.props.onDesignChange) {
                return R("div", { style: { textAlign: "center", marginTop: size.height / 2 } }, R("a", { className: "btn btn-link", onClick: this.handleEdit }, "Click Here to Configure"));
            }
            else {
                return null;
            }
        }));
    }
}
exports.default = DatagridComponent;
/** Popup editor */
class DatagridEditorComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.state = {
            design: props.design
        };
    }
    render() {
        return R(ActionCancelModalComponent_1.default, {
            onAction: () => {
                this.props.onDesignChange(this.state.design);
                return this.setState({ design: this.props.design });
            },
            onCancel: this.props.onCancel,
            size: "large"
        }, R(DatagridDesignerComponent_1.default, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            design: this.state.design,
            onDesignChange: (design) => this.setState({ design })
        }));
    }
}
