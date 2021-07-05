"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prop_types_1 = __importDefault(require("prop-types"));
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const mwater_expressions_1 = require("mwater-expressions");
const mwater_expressions_2 = require("mwater-expressions");
const TabbedComponent_1 = __importDefault(require("react-library/lib/TabbedComponent"));
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
const mwater_expressions_ui_2 = require("mwater-expressions-ui");
const OrderBysDesignerComponent_1 = __importDefault(require("./OrderBysDesignerComponent"));
const ReorderableListComponent_1 = __importDefault(require("react-library/lib/reorderable/ReorderableListComponent"));
const QuickfiltersDesignComponent_1 = __importDefault(require("../quickfilter/QuickfiltersDesignComponent"));
const LabeledExprGenerator_1 = __importDefault(require("./LabeledExprGenerator"));
const TableSelectComponent_1 = __importDefault(require("../TableSelectComponent"));
const uuid_1 = __importDefault(require("uuid"));
const update_object_1 = __importDefault(require("update-object"));
const bootstrap_1 = __importDefault(require("react-library/lib/bootstrap"));
const valueFormatter_1 = require("../valueFormatter");
const valueFormatter_2 = require("../valueFormatter");
// Designer for the datagrid. Currenly allows only single-table designs (no subtable rows)
class DatagridDesignerComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleTableChange = (table) => {
            const design = {
                table,
                columns: []
            };
            return this.props.onDesignChange(design);
        };
        this.handleColumnsChange = (columns) => {
            return this.props.onDesignChange(update_object_1.default(this.props.design, { columns: { $set: columns } }));
        };
        this.handleFilterChange = (filter) => {
            return this.props.onDesignChange(update_object_1.default(this.props.design, { filter: { $set: filter } }));
        };
        this.handleGlobalFiltersChange = (globalFilters) => {
            return this.props.onDesignChange(update_object_1.default(this.props.design, { globalFilters: { $set: globalFilters } }));
        };
        this.handleOrderBysChange = (orderBys) => {
            return this.props.onDesignChange(update_object_1.default(this.props.design, { orderBys: { $set: orderBys } }));
        };
    }
    // Render the tabs of the designer
    renderTabs() {
        return R(TabbedComponent_1.default, {
            initialTabId: "columns",
            tabs: [
                {
                    id: "columns",
                    label: "Columns",
                    elem: R(ColumnsDesignerComponent, {
                        schema: this.props.schema,
                        dataSource: this.props.dataSource,
                        table: this.props.design.table,
                        columns: this.props.design.columns,
                        onColumnsChange: this.handleColumnsChange
                    })
                },
                {
                    id: "filter",
                    label: "Filter",
                    // Here because of modal scroll issue
                    elem: R("div", { style: { marginBottom: 200 } }, R(mwater_expressions_ui_2.FilterExprComponent, {
                        schema: this.props.schema,
                        dataSource: this.props.dataSource,
                        table: this.props.design.table,
                        value: this.props.design.filter,
                        onChange: this.handleFilterChange
                    }), this.context.globalFiltersElementFactory
                        ? R("div", { style: { marginTop: 20 } }, this.context.globalFiltersElementFactory({
                            schema: this.props.schema,
                            dataSource: this.props.dataSource,
                            filterableTables: [this.props.design.table],
                            globalFilters: this.props.design.globalFilters,
                            onChange: this.handleGlobalFiltersChange,
                            nullIfIrrelevant: true
                        }))
                        : undefined)
                },
                {
                    id: "order",
                    label: "Sorting",
                    elem: R("div", { style: { marginBottom: 200 } }, R(OrderBysDesignerComponent_1.default, {
                        schema: this.props.schema,
                        dataSource: this.props.dataSource,
                        table: this.props.design.table,
                        orderBys: this.props.design.orderBys,
                        onChange: this.handleOrderBysChange
                    }))
                },
                {
                    id: "quickfilters",
                    label: "Quickfilters",
                    elem: R("div", { style: { marginBottom: 200 } }, R(QuickfiltersDesignComponent_1.default, {
                        design: this.props.design.quickfilters,
                        onDesignChange: (design) => this.props.onDesignChange(update_object_1.default(this.props.design, { quickfilters: { $set: design } })),
                        schema: this.props.schema,
                        dataSource: this.props.dataSource,
                        tables: [this.props.design.table]
                    }))
                },
                {
                    id: "options",
                    label: "Options",
                    elem: R("div", { style: { marginBottom: 200 } }, R(DatagridOptionsComponent, {
                        design: this.props.design,
                        onDesignChange: this.props.onDesignChange
                    }))
                }
            ]
        });
    }
    render() {
        return R("div", null, R("label", null, "Data Source:"), R(TableSelectComponent_1.default, {
            schema: this.props.schema,
            value: this.props.design.table,
            onChange: this.handleTableChange
        }), this.props.design.table ? this.renderTabs() : undefined);
    }
}
exports.default = DatagridDesignerComponent;
DatagridDesignerComponent.contextTypes = { globalFiltersElementFactory: prop_types_1.default.func };
// Datagrid Options
class DatagridOptionsComponent extends react_1.default.Component {
    render() {
        return R(bootstrap_1.default.FormGroup, { label: "Display Options" }, R(bootstrap_1.default.Checkbox, {
            value: this.props.design.showRowNumbers,
            onChange: (showRowNumbers) => this.props.onDesignChange(update_object_1.default(this.props.design, { showRowNumbers: { $set: showRowNumbers } }))
        }, "Show row numbers"));
    }
}
// Columns list
class ColumnsDesignerComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleColumnChange = (columnIndex, column) => {
            const columns = this.props.columns.slice();
            // Handle remove
            if (!column) {
                columns.splice(columnIndex, 1);
            }
            else if (lodash_1.default.isArray(column)) {
                // Handle array case
                Array.prototype.splice.apply(columns, [columnIndex, 1].concat(column));
            }
            else {
                columns[columnIndex] = column;
            }
            return this.props.onColumnsChange(columns);
        };
        this.handleAddColumn = () => {
            const columns = this.props.columns.slice();
            columns.push({ id: uuid_1.default(), type: "expr", width: 150 });
            return this.props.onColumnsChange(columns);
        };
        this.handleAddIdColumn = () => {
            const columns = this.props.columns.slice();
            // TODO we should display label when available but without breaking Peter's id downloads. Need format field to indicate raw id.
            columns.push({
                id: uuid_1.default(),
                type: "expr",
                width: 150,
                expr: { type: "id", table: this.props.table },
                label: "Unique Id"
            });
            return this.props.onColumnsChange(columns);
        };
        this.handleAddDefaultColumns = () => {
            // Create labeled expressions
            const labeledExprs = new LabeledExprGenerator_1.default(this.props.schema).generate(this.props.table, {
                headerFormat: "text"
            });
            let columns = [];
            for (let labeledExpr of labeledExprs) {
                columns.push({
                    id: uuid_1.default(),
                    width: 150,
                    type: "expr",
                    label: null,
                    expr: labeledExpr.expr
                });
            }
            columns = this.props.columns.concat(columns);
            return this.props.onColumnsChange(columns);
        };
        this.handleRemoveAllColumns = () => {
            return this.props.onColumnsChange([]);
        };
        this.renderColumn = (column, columnIndex, connectDragSource, connectDragPreview, connectDropTarget) => {
            return R(ColumnDesignerComponent, {
                key: columnIndex,
                schema: this.props.schema,
                table: this.props.table,
                dataSource: this.props.dataSource,
                column,
                onColumnChange: this.handleColumnChange.bind(null, columnIndex),
                connectDragSource,
                connectDragPreview,
                connectDropTarget
            });
        };
    }
    render() {
        return R("div", { style: { height: "auto", overflowY: "auto", overflowX: "hidden" } }, R("div", { style: { textAlign: "right" }, key: "options" }, R("button", {
            key: "addAll",
            type: "button",
            className: "btn btn-link btn-xs",
            onClick: this.handleAddDefaultColumns
        }, R("span", { className: "glyphicon glyphicon-plus" }), " Add Default Columns"), R("button", {
            key: "removeAll",
            type: "button",
            className: "btn btn-link btn-xs",
            onClick: this.handleRemoveAllColumns
        }, R("span", { className: "glyphicon glyphicon-remove" }), " Remove All Columns")), R(ReorderableListComponent_1.default, {
            items: this.props.columns,
            onReorder: this.props.onColumnsChange,
            renderItem: this.renderColumn,
            getItemId: (item) => item.id
        }), R("button", {
            key: "add",
            type: "button",
            className: "btn btn-link",
            onClick: this.handleAddColumn
        }, R("span", { className: "glyphicon glyphicon-plus" }), " Add Column"), R("button", {
            key: "add-id",
            type: "button",
            className: "btn btn-link",
            onClick: this.handleAddIdColumn
        }, R("span", { className: "glyphicon glyphicon-plus" }), " Add Unique Id (advanced)"));
    }
}
// Column item
class ColumnDesignerComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleExprChange = (expr) => {
            return this.props.onColumnChange(update_object_1.default(this.props.column, { expr: { $set: expr } }));
        };
        this.handleLabelChange = (label) => {
            return this.props.onColumnChange(update_object_1.default(this.props.column, { label: { $set: label } }));
        };
        this.handleFormatChange = (ev) => {
            return this.props.onColumnChange(update_object_1.default(this.props.column, { format: { $set: ev.target.value } }));
        };
        this.handleSplitEnumset = () => {
            const exprUtils = new mwater_expressions_1.ExprUtils(this.props.schema);
            return this.props.onColumnChange(lodash_1.default.map(exprUtils.getExprEnumValues(this.props.column.expr), (enumVal) => {
                return {
                    id: uuid_1.default(),
                    type: "expr",
                    width: 150,
                    expr: {
                        type: "op",
                        op: "contains",
                        table: this.props.table,
                        exprs: [this.props.column.expr, { type: "literal", valueType: "enumset", value: [enumVal.id] }]
                    }
                };
            }));
        };
        this.handleSplitGeometry = () => {
            return this.props.onColumnChange([
                {
                    id: uuid_1.default(),
                    type: "expr",
                    width: 150,
                    expr: {
                        type: "op",
                        op: "latitude",
                        table: this.props.table,
                        exprs: [this.props.column.expr]
                    }
                },
                {
                    id: uuid_1.default(),
                    type: "expr",
                    width: 150,
                    expr: {
                        type: "op",
                        op: "longitude",
                        table: this.props.table,
                        exprs: [this.props.column.expr]
                    }
                }
            ]);
        };
        this.render = () => {
            const exprUtils = new mwater_expressions_1.ExprUtils(this.props.schema);
            const exprValidator = new mwater_expressions_2.ExprValidator(this.props.schema);
            // Get type of current expression
            const type = exprUtils.getExprType(this.props.column.expr);
            // Determine allowed types
            const allowedTypes = [
                "text",
                "number",
                "enum",
                "enumset",
                "boolean",
                "date",
                "datetime",
                "image",
                "imagelist",
                "text[]",
                "geometry"
            ];
            // If type id, allow id (e.g. don't allow to be added directly, but keep if present)
            if (type === "id") {
                allowedTypes.push("id");
            }
            const error = exprValidator.validateExpr(this.props.column.expr, {
                aggrStatuses: ["individual", "literal", "aggregate"]
            });
            const elem = R("div", { className: "row" }, R("div", { className: "col-xs-1" }, this.props.connectDragSource(R("span", { className: "text-muted fa fa-bars" }))), R("div", { className: "col-xs-6" }, // style: { border: "solid 1px #DDD", padding: 4 },
            R(mwater_expressions_ui_1.ExprComponent, {
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                table: this.props.table,
                value: this.props.column.expr,
                aggrStatuses: ["literal", "individual", "aggregate"],
                types: allowedTypes,
                onChange: this.handleExprChange
            }), this.renderSplit(), this.renderFormat(), error ? R("i", { className: "fa fa-exclamation-circle text-danger" }) : undefined), R("div", { className: "col-xs-4" }, R("input", {
                type: "text",
                className: "form-control",
                placeholder: exprUtils.summarizeExpr(this.props.column.expr),
                value: this.props.column.label,
                onChange: (ev) => this.handleLabelChange(ev.target.value)
            })), R("div", { className: "col-xs-1" }, R("a", { onClick: this.props.onColumnChange.bind(null, null) }, R("span", { className: "glyphicon glyphicon-remove" }))));
            return this.props.connectDropTarget(this.props.connectDragPreview(elem));
        };
    }
    // Render options to split a column, such as an enumset to booleans or geometry to lat/lng
    renderSplit() {
        const exprUtils = new mwater_expressions_1.ExprUtils(this.props.schema);
        const exprType = exprUtils.getExprType(this.props.column.expr);
        switch (exprType) {
            case "enumset":
                return R("a", { className: "btn btn-xs btn-link", onClick: this.handleSplitEnumset }, R("i", { className: "fa fa-chain-broken" }), " Split by options");
                break;
            case "geometry":
                return R("a", { className: "btn btn-xs btn-link", onClick: this.handleSplitGeometry }, R("i", { className: "fa fa-chain-broken" }), " Split by lat/lng");
                break;
        }
        return null;
    }
    renderFormat() {
        const exprUtils = new mwater_expressions_1.ExprUtils(this.props.schema);
        const exprType = exprUtils.getExprType(this.props.column.expr);
        const formats = valueFormatter_1.getFormatOptions(exprType);
        if (!formats) {
            return null;
        }
        return R("div", { className: "form-group" }, R("label", { className: "text-muted" }, "Format"), ": ", R("select", {
            value: this.props.column.format != null ? this.props.column.format : valueFormatter_2.getDefaultFormat(exprType),
            className: "form-control",
            style: { width: "auto", display: "inline-block" },
            onChange: this.handleFormatChange
        }, lodash_1.default.map(formats, (format) => R("option", { key: format.value, value: format.value }, format.label))));
    }
}
