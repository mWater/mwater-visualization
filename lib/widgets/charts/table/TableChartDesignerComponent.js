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
const prop_types_1 = __importDefault(require("prop-types"));
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const uuid_1 = __importDefault(require("uuid"));
const mwater_expressions_1 = require("mwater-expressions");
const AxisBuilder_1 = __importDefault(require("../../../axes/AxisBuilder"));
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
const mwater_expressions_ui_2 = require("mwater-expressions-ui");
const OrderingsComponent_1 = __importDefault(require("./OrderingsComponent"));
const TableSelectComponent_1 = __importDefault(require("../../../TableSelectComponent"));
const ReorderableListComponent_1 = __importDefault(require("react-library/lib/reorderable/ReorderableListComponent"));
const ui = __importStar(require("react-library/lib/bootstrap"));
const valueFormatter_1 = require("../../../valueFormatter");
const valueFormatter_2 = require("../../../valueFormatter");
class TableChartDesignerComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleTitleTextChange = (ev) => {
            return this.updateDesign({ titleText: ev.target.value });
        };
        this.handleTableChange = (table) => {
            return this.updateDesign({ table });
        };
        this.handleFilterChange = (filter) => {
            return this.updateDesign({ filter });
        };
        this.handleOrderingsChange = (orderings) => {
            return this.updateDesign({ orderings });
        };
        this.handleLimitChange = (limit) => {
            return this.updateDesign({ limit });
        };
        this.handleColumnChange = (index, column) => {
            const columns = this.props.design.columns.slice();
            columns[index] = column;
            return this.updateDesign({ columns });
        };
        this.handleRemoveColumn = (index) => {
            const columns = this.props.design.columns.slice();
            columns.splice(index, 1);
            return this.updateDesign({ columns });
        };
        this.handleAddColumn = () => {
            const columns = this.props.design.columns.slice();
            columns.push({ id: uuid_1.default() });
            return this.updateDesign({ columns });
        };
        this.renderColumn = (column, index, connectDragSource, connectDragPreview, connectDropTarget) => {
            const style = {
                borderTop: "solid 1px #EEE",
                paddingTop: 10,
                paddingBottom: 10
            };
            return connectDragPreview(connectDropTarget(R("div", { key: index, style }, react_1.default.createElement(TableChartColumnDesignerComponent, {
                design: this.props.design,
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                index,
                onChange: this.handleColumnChange.bind(null, index),
                onRemove: this.handleRemoveColumn.bind(null, index),
                connectDragSource
            }))));
        };
        this.handleReorder = (map) => {
            return this.updateDesign({ columns: map });
        };
    }
    // Updates design with the specified changes
    updateDesign(changes) {
        const design = lodash_1.default.extend({}, this.props.design, changes);
        return this.props.onDesignChange(design);
    }
    renderTable() {
        return R("div", { className: "form-group" }, R("label", { className: "text-muted" }, R("i", { className: "fa fa-database" }), " ", "Data Source"), ": ", R(TableSelectComponent_1.default, {
            schema: this.props.schema,
            value: this.props.design.table,
            onChange: this.handleTableChange,
            filter: this.props.design.filter,
            onFilterChange: this.handleFilterChange
        }));
    }
    renderTitle() {
        return R("div", { className: "form-group" }, R("label", { className: "text-muted" }, "Title"), R("input", {
            type: "text",
            className: "form-control input-sm",
            value: this.props.design.titleText,
            onChange: this.handleTitleTextChange,
            placeholder: "Untitled"
        }));
    }
    renderColumns() {
        if (!this.props.design.table) {
            return;
        }
        return R("div", null, R(ReorderableListComponent_1.default, {
            items: this.props.design.columns,
            onReorder: this.handleReorder,
            renderItem: this.renderColumn,
            getItemId: (item) => item.id
        }), R("button", { className: "btn btn-default btn-sm", type: "button", onClick: this.handleAddColumn }, R("span", { className: "glyphicon glyphicon-plus" }), " Add Column"));
    }
    // return R 'div', className: "form-group",
    //   _.map(@props.design.columns, (column, i) => @renderColumn(i))
    //
    renderOrderings() {
        // If no table, hide
        if (!this.props.design.table) {
            return null;
        }
        return R("div", { className: "form-group" }, R("label", { className: "text-muted" }, R("span", { className: "glyphicon glyphicon-sort-by-attributes" }), " ", "Ordering"), R("div", { style: { marginLeft: 8 } }, react_1.default.createElement(OrderingsComponent_1.default, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            orderings: this.props.design.orderings,
            onOrderingsChange: this.handleOrderingsChange,
            table: this.props.design.table
        })));
    }
    renderFilter() {
        // If no table, hide
        if (!this.props.design.table) {
            return null;
        }
        return R("div", { className: "form-group" }, R("label", { className: "text-muted" }, R("span", { className: "glyphicon glyphicon-filter" }), " ", "Filters"), R("div", { style: { marginLeft: 8 } }, react_1.default.createElement(mwater_expressions_ui_2.FilterExprComponent, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            onChange: this.handleFilterChange,
            table: this.props.design.table,
            value: this.props.design.filter
        })));
    }
    renderLimit() {
        // If no table, hide
        if (!this.props.design.table) {
            return null;
        }
        return R("div", { className: "form-group" }, R("label", { className: "text-muted" }, "Maximum Number of Rows (up to 1000)"), R("div", { style: { marginLeft: 8 } }, R(ui.NumberInput, {
            value: this.props.design.limit,
            onChange: this.handleLimitChange,
            decimal: false,
            placeholder: "1000"
        })));
    }
    render() {
        return R("div", null, this.renderTable(), this.renderColumns(), this.props.design.table ? R("hr") : undefined, this.renderOrderings(), this.renderFilter(), this.renderLimit(), R("hr"), this.renderTitle());
    }
}
exports.default = TableChartDesignerComponent;
class TableChartColumnDesignerComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleExprChange = (expr) => {
            return this.updateTextAxis({ expr });
        };
        this.handleHeaderTextChange = (ev) => {
            return this.updateColumn({ headerText: ev.target.value });
        };
        this.handleAggrChange = (aggr) => {
            return this.updateTextAxis({ aggr });
        };
        this.handleFormatChange = (ev) => {
            return this.updateColumn({ format: ev.target.value });
        };
    }
    // Updates column with the specified changes
    updateColumn(changes) {
        const column = lodash_1.default.extend({}, this.props.design.columns[this.props.index], changes);
        return this.props.onChange(column);
    }
    updateTextAxis(changes) {
        const textAxis = lodash_1.default.extend({}, this.props.design.columns[this.props.index].textAxis, changes);
        return this.updateColumn({ textAxis });
    }
    renderRemove() {
        if (this.props.design.columns.length > 1) {
            return R("button", { className: "btn btn-xs btn-link pull-right", type: "button", onClick: this.props.onRemove }, R("span", { className: "glyphicon glyphicon-remove" }));
        }
    }
    renderExpr() {
        const column = this.props.design.columns[this.props.index];
        const title = "Value";
        return R("div", null, R("label", { className: "text-muted" }, title), ": ", react_1.default.createElement(mwater_expressions_ui_1.ExprComponent, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            table: this.props.design.table,
            value: column.textAxis ? column.textAxis.expr : undefined,
            onChange: this.handleExprChange,
            aggrStatuses: ["literal", "individual", "aggregate"]
        }));
    }
    renderFormat() {
        var _a;
        const column = this.props.design.columns[this.props.index];
        // Get type
        const exprUtils = new mwater_expressions_1.ExprUtils(this.props.schema);
        const exprType = exprUtils.getExprType((_a = column.textAxis) === null || _a === void 0 ? void 0 : _a.expr);
        const formats = valueFormatter_1.getFormatOptions(exprType);
        if (!formats) {
            return null;
        }
        return R("div", { className: "form-group" }, R("label", { className: "text-muted" }, "Format"), ": ", R("select", {
            value: column.format != null ? column.format : valueFormatter_2.getDefaultFormat(exprType),
            className: "form-control",
            style: { width: "auto", display: "inline-block" },
            onChange: this.handleFormatChange
        }, lodash_1.default.map(formats, (format) => R("option", { key: format.value, value: format.value }, format.label))));
    }
    renderHeader() {
        const column = this.props.design.columns[this.props.index];
        const axisBuilder = new AxisBuilder_1.default({ schema: this.props.schema });
        const placeholder = axisBuilder.summarizeAxis(column.textAxis, this.context.locale);
        return R("div", null, R("label", { className: "text-muted" }, "Header"), ": ", R("input", {
            type: "text",
            className: "form-control input-sm",
            style: { display: "inline-block", width: "15em" },
            value: column.headerText,
            onChange: this.handleHeaderTextChange,
            placeholder
        }));
    }
    render() {
        const iconStyle = {
            cursor: "move",
            marginRight: 8,
            opacity: 0.5,
            fontSize: 12,
            height: 20
        };
        return R("div", null, this.props.connectDragSource(R("i", { className: "fa fa-bars", style: iconStyle })), this.renderRemove(), R("label", null, `Column ${this.props.index + 1}`), R("div", { style: { marginLeft: 5 } }, this.renderExpr(), this.renderFormat(), this.renderHeader()));
    }
}
TableChartColumnDesignerComponent.contextTypes = { locale: prop_types_1.default.string };
