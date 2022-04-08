"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
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
class FindReplaceModalComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            replaceColumn: null,
            withExpr: null,
            conditionExpr: null,
            busy: false
        };
    }
    show() {
        return this.setState({ open: true, busy: false });
    }
    performReplace() {
        return __awaiter(this, void 0, void 0, function* () {
            const exprUtils = new mwater_expressions_1.ExprUtils(this.props.schema);
            const exprCompiler = new mwater_expressions_2.ExprCompiler(this.props.schema);
            const exprCleaner = new mwater_expressions_1.ExprCleaner(this.props.schema);
            const design = this.props.design;
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
            // Add global filters
            for (let filter of design.globalFilters || []) {
                // Check if exists and is correct type
                const column = this.props.schema.getColumn(design.table, filter.columnId);
                if (!column) {
                    continue;
                }
                const columnExpr = { type: "field", table: design.table, column: column.id };
                if (exprUtils.getExprType(columnExpr) !== filter.columnType) {
                    continue;
                }
                // Create expr
                let expr = { type: "op", op: filter.op, table: design.table, exprs: [columnExpr].concat(filter.exprs) };
                // Clean expr
                expr = exprCleaner.cleanExpr(expr, { table: design.table });
                wheres.push(exprCompiler.compileExpr({ expr, tableAlias: "main" }));
            }
            // Add extra filters
            for (let extraFilter of this.props.filters || []) {
                if (extraFilter.table === this.props.design.table) {
                    wheres.push(mwater_expressions_3.injectTableAlias(extraFilter.jsonql, "main"));
                }
            }
            query.where = { type: "op", op: "and", exprs: lodash_1.default.compact(wheres) };
            this.setState({ busy: true });
            try {
                const rows = yield this.props.dataSource.performQuery(query);
                // Confirm
                if (!confirm(`Replace ${rows.length} values? This cannot be undone.`)) {
                    return;
                }
                // Perform updates
                yield this.props.updateExprValues(this.props.design.table, rows.map(row => ({
                    primaryKey: row.id,
                    expr: replaceExpr,
                    value: row.withValue
                })));
                alert("Success");
                this.setState({ open: false });
                this.props.onUpdate();
            }
            catch (error) {
                alert(`Error: ${error.message}`);
            }
            finally {
                this.setState({ busy: false });
            }
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
        if (this.state.busy) {
            return R("div", null, R("h3", null, "Working..."), R("div", { className: "progress" }, R("div", { className: "progress-bar progress-bar-striped progress-bar-animated", style: { width: `100%` } })));
        }
        return R("div", null, R("div", { key: "replace", className: "mb-3" }, R("label", null, "Column with data to replace: "), R(react_select_1.default, {
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
                return R("div", { key: "with", className: "mb-3" }, R("label", null, "Value to replace data with: "), R(mwater_expressions_ui_1.ExprComponent, {
                    schema: this.props.schema,
                    dataSource: this.props.dataSource,
                    table: this.props.design.table,
                    value: this.state.withExpr,
                    onChange: (value) => this.setState({ withExpr: value }),
                    types: [exprUtils.getExprType(replaceExpr)],
                    enumValues: exprUtils.getExprEnumValues(replaceExpr) || undefined,
                    idTable: exprUtils.getExprIdTable(replaceExpr) || undefined,
                    preferLiteral: true,
                    placeholder: "(Blank)"
                }));
            }
            return null;
        })(), R("div", { key: "condition", className: "mb-3" }, R("label", null, "Only in rows that (optional):"), R(mwater_expressions_ui_1.ExprComponent, {
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
                    className: "btn btn-secondary"
                }, "Cancel"),
                R("button", {
                    key: "apply",
                    type: "button",
                    disabled: !this.state.replaceColumn || this.state.busy,
                    onClick: () => this.performReplace(),
                    className: "btn btn-primary"
                }, "Apply")
            ]
        }, this.renderContents());
    }
}
exports.default = FindReplaceModalComponent;
