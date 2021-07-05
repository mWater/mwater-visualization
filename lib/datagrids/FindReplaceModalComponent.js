"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let FindReplaceModalComponent;
const prop_types_1 = __importDefault(require("prop-types"));
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const async_1 = __importDefault(require("async"));
const react_select_1 = __importDefault(require("react-select"));
const AutoSizeComponent_1 = __importDefault(require("react-library/lib/AutoSizeComponent"));
const DatagridViewComponent_1 = __importDefault(require("./DatagridViewComponent"));
const DirectDatagridDataSource_1 = __importDefault(require("./DirectDatagridDataSource"));
const ModalPopupComponent_1 = __importDefault(require("react-library/lib/ModalPopupComponent"));
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
const mwater_expressions_1 = require("mwater-expressions");
const mwater_expressions_2 = require("mwater-expressions");
const mwater_expressions_3 = require("mwater-expressions");
// Modal to perform find/replace on datagrid
exports.default = FindReplaceModalComponent = (function () {
    var _a;
    FindReplaceModalComponent = (_a = class FindReplaceModalComponent extends react_1.default.Component {
            constructor(props) {
                super(props);
                this.state = {
                    open: false,
                    replaceColumn: null,
                    withExpr: null,
                    conditionExpr: null,
                    progress: null // 0-100 when working
                };
            }
            show() {
                return this.setState({ open: true, progress: null });
            }
            performReplace() {
                const exprUtils = new mwater_expressions_1.ExprUtils(this.props.schema);
                const exprCompiler = new mwater_expressions_2.ExprCompiler(this.props.schema);
                // Get expr of replace column
                const replaceExpr = lodash_1.default.findWhere(this.props.design.columns, { id: this.state.replaceColumn }).expr;
                // Get ids and with value, filtered by filters, design.filter and conditionExpr (if present)
                const query = {
                    type: "query",
                    selects: [
                        {
                            type: "select",
                            expr: {
                                type: "field",
                                tableAlias: "main",
                                column: this.props.schema.getTable(this.props.design.table).primaryKey
                            },
                            alias: "id"
                        },
                        {
                            type: "select",
                            expr: exprCompiler.compileExpr({ expr: this.state.withExpr, tableAlias: "main" }),
                            alias: "withValue"
                        }
                    ],
                    from: { type: "table", table: this.props.design.table, alias: "main" }
                };
                // Filter by filter
                const wheres = [];
                if (this.props.design.filter) {
                    wheres.push(exprCompiler.compileExpr({ expr: this.props.design.filter, tableAlias: "main" }));
                }
                // Filter by conditionExpr
                if (this.state.conditionExpr) {
                    wheres.push(exprCompiler.compileExpr({ expr: this.state.conditionExpr, tableAlias: "main" }));
                }
                // Add extra filters
                for (let extraFilter of this.props.filters || []) {
                    if (extraFilter.table === this.props.design.table) {
                        wheres.push(mwater_expressions_3.injectTableAlias(extraFilter.jsonql, "main"));
                    }
                }
                query.where = { type: "op", op: "and", exprs: lodash_1.default.compact(wheres) };
                this.setState({ progress: 0 });
                // Number completed (twice for each row, once to check can edit and other to perform)
                let completed = 0;
                return this.props.dataSource.performQuery(query, (error, rows) => {
                    if (error) {
                        this.setState({ progress: null });
                        alert(`Error: ${error.message}`);
                        return;
                    }
                    // Check canEditValue on each one
                    return async_1.default.mapLimit(rows, 10, (row, cb) => {
                        // Abort if closed
                        if (!this.state.open) {
                            return;
                        }
                        // Prevent stack overflow
                        return lodash_1.default.defer(() => {
                            // First half
                            completed += 1;
                            this.setState({ progress: (completed * 50) / rows.length });
                            return this.props.canEditValue(this.props.design.table, row.id, replaceExpr, cb);
                        });
                    }, (error, canEdits) => {
                        if (error) {
                            this.setState({ progress: null });
                            alert(`Error: ${error.message}`);
                            return;
                        }
                        if (!lodash_1.default.all(canEdits)) {
                            this.setState({ progress: null });
                            alert("You do not have permission to replace all values");
                            return;
                        }
                        // Confirm
                        if (!confirm(`Replace ${canEdits.length} values? This cannot be undone.`)) {
                            this.setState({ progress: null });
                            return;
                        }
                        // Perform updateValue on each one
                        // Do one at a time to prevent conflicts. TODO should do all at once in a transaction.
                        return async_1.default.eachLimit(rows, 1, (row, cb) => {
                            // Abort if closed
                            if (!this.state.open) {
                                return;
                            }
                            // Prevent stack overflow
                            return lodash_1.default.defer(() => {
                                // First half
                                completed += 1;
                                this.setState({ progress: (completed * 50) / rows.length });
                                return this.props.updateValue(this.props.design.table, row.id, replaceExpr, row.withValue, cb);
                            });
                        }, (error) => {
                            var _a, _b;
                            if (error) {
                                this.setState({ progress: null });
                                alert(`Error: ${error.message}`);
                                return;
                            }
                            alert("Success");
                            this.setState({ progress: null, open: false });
                            return (_b = (_a = this.props).onUpdate) === null || _b === void 0 ? void 0 : _b.call(_a);
                        });
                    });
                });
            }
            renderPreview() {
                const exprUtils = new mwater_expressions_1.ExprUtils(this.props.schema);
                // Replace "replace" column with fake case statement to simulate change
                const design = lodash_1.default.clone(this.props.design);
                design.columns = lodash_1.default.map(design.columns, (column) => {
                    // Unchanged if not replace column
                    if (column.id !== this.state.replaceColumn) {
                        return column;
                    }
                    const expr = {
                        type: "case",
                        table: this.props.design.table,
                        cases: [
                            {
                                when: this.state.conditionExpr || { type: "literal", valueType: "boolean", value: true },
                                then: this.state.withExpr
                            }
                        ],
                        // Unchanged
                        else: column.expr
                    };
                    // Specify label to prevent strange titles
                    return lodash_1.default.extend({}, column, {
                        expr,
                        label: column.label || exprUtils.summarizeExpr(column.expr, this.props.design.locale)
                    });
                });
                return R(AutoSizeComponent_1.default, { injectWidth: true }, (size) => {
                    return R(DatagridViewComponent_1.default, {
                        width: size.width,
                        height: 400,
                        schema: this.props.schema,
                        dataSource: this.props.dataSource,
                        datagridDataSource: new DirectDatagridDataSource_1.default({
                            schema: this.props.schema,
                            dataSource: this.props.dataSource
                        }),
                        design,
                        filters: this.props.filters
                    });
                });
            }
            renderContents() {
                let value;
                const exprUtils = new mwater_expressions_1.ExprUtils(this.props.schema);
                // Determine which columns are replace-able. Excludes subtables and aggregates
                const replaceColumns = lodash_1.default.filter(this.props.design.columns, (column) => !column.subtable && exprUtils.getExprAggrStatus(column.expr) === "individual");
                const replaceColumnOptions = lodash_1.default.map(replaceColumns, (column) => ({
                    value: column.id,
                    label: column.label || exprUtils.summarizeExpr(column.expr, this.props.design.locale)
                }));
                // Show progress
                if (this.state.progress != null) {
                    return R("div", null, R("h3", null, "Working..."), R("div", { className: "progress" }, R("div", { className: "progress-bar", style: { width: `${this.state.progress}%` } })));
                }
                return R("div", null, R("div", { key: "replace", className: "form-group" }, R("label", null, "Column with data to replace: "), R(react_select_1.default, {
                    options: replaceColumnOptions,
                    value: lodash_1.default.findWhere(replaceColumnOptions, { value: this.state.replaceColumn }) || null,
                    onChange: (opt) => this.setState({ replaceColumn: opt.value }),
                    placeholder: "Select Column...",
                    styles: {
                        // Keep menu above fixed data table headers
                        menu: (style) => lodash_1.default.extend({}, style, { zIndex: 2 })
                    }
                })), (() => {
                    if (this.state.replaceColumn) {
                        // Get expr of replace column
                        const replaceExpr = lodash_1.default.findWhere(this.props.design.columns, { id: this.state.replaceColumn }).expr;
                        return R("div", { key: "with", className: "form-group" }, R("label", null, "Value to replace data with: "), R(mwater_expressions_ui_1.ExprComponent, {
                            schema: this.props.schema,
                            dataSource: this.props.dataSource,
                            table: this.props.design.table,
                            value: this.state.withExpr,
                            onChange: (value) => this.setState({ withExpr: value }),
                            types: [exprUtils.getExprType(replaceExpr)],
                            enumValues: exprUtils.getExprEnumValues(replaceExpr),
                            idTable: exprUtils.getExprIdTable(replaceExpr),
                            preferLiteral: true,
                            placeholder: "(Blank)"
                        }));
                    }
                })(), R("div", { key: "condition", className: "form-group" }, R("label", null, "Only in rows that (optional):"), R(mwater_expressions_ui_1.ExprComponent, {
                    schema: this.props.schema,
                    dataSource: this.props.dataSource,
                    table: this.props.design.table,
                    value: this.state.conditionExpr,
                    onChange: (value) => this.setState({ conditionExpr: value }),
                    types: ["boolean"],
                    placeholder: "All Rows"
                })), R("div", { key: "preview" }, R("h4", null, "Preview"), this.renderPreview()));
            }
            render() {
                if (!this.state.open) {
                    return null;
                }
                return R(ModalPopupComponent_1.default, {
                    size: "large",
                    header: "Find/Replace",
                    footer: [
                        R("button", {
                            key: "cancel",
                            type: "button",
                            onClick: () => this.setState({ open: false }),
                            className: "btn btn-default"
                        }, "Cancel"),
                        R("button", {
                            key: "apply",
                            type: "button",
                            disabled: !this.state.replaceColumn || this.state.progress != null,
                            onClick: () => this.performReplace(),
                            className: "btn btn-primary"
                        }, "Apply")
                    ]
                }, this.renderContents());
            }
        },
        _a.propTypes = {
            schema: prop_types_1.default.object.isRequired,
            dataSource: prop_types_1.default.object.isRequired,
            design: prop_types_1.default.object.isRequired,
            filters: prop_types_1.default.arrayOf(prop_types_1.default.shape({
                table: prop_types_1.default.string.isRequired,
                jsonql: prop_types_1.default.object.isRequired // jsonql filter with {alias} for tableAlias
            })),
            // Check if expression of table row is editable
            // If present, called with (tableId, rowId, expr, callback). Callback should be called with (error, true/false)
            canEditValue: prop_types_1.default.func,
            // Update table row expression with a new value
            // Called with (tableId, rowId, expr, value, callback). Callback should be called with (error)
            updateValue: prop_types_1.default.func,
            onUpdate: prop_types_1.default.func
        },
        _a);
    return FindReplaceModalComponent;
})();
