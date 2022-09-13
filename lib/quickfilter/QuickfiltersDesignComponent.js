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
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const update_object_1 = __importDefault(require("update-object"));
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
const mwater_expressions_1 = require("mwater-expressions");
const ui = __importStar(require("react-library/lib/bootstrap"));
const ListEditorComponent_1 = require("react-library/lib/ListEditorComponent");
// Displays quick filters and allows their value to be modified
class QuickfiltersDesignComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleDesignChange = (design) => {
            design = design.slice();
            // Update merged, clearing if not mergeable
            for (let index = 0, end = design.length, asc = 0 <= end; asc ? index < end : index > end; asc ? index++ : index--) {
                if (design[index].merged && !this.isMergeable(design, index)) {
                    design[index] = lodash_1.default.extend({}, design[index], { merged: false });
                }
            }
            return this.props.onDesignChange(design);
        };
        this.renderQuickfilter = (item, index) => {
            return R(QuickfilterDesignComponent, {
                key: index,
                design: item,
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                tables: this.props.tables,
                mergeable: this.isMergeable(this.props.design, index),
                onChange: (newItem) => {
                    const design = this.props.design.slice();
                    design[index] = newItem;
                    return this.handleDesignChange(design);
                },
                onRemove: this.handleRemove.bind(null, index)
            });
        };
        this.handleAdd = () => {
            // Add blank to end
            const design = this.props.design.concat([{ expr: null }]);
            return this.props.onDesignChange(design);
        };
        this.handleRemove = (index) => {
            const design = this.props.design.slice();
            design.splice(index, 1);
            return this.props.onDesignChange(design);
        };
    }
    // Determine if quickfilter at index is mergeable with previous (same type, id table and enum values)
    isMergeable(design, index) {
        if (index === 0) {
            return false;
        }
        const exprUtils = new mwater_expressions_1.ExprUtils(this.props.schema);
        const type = exprUtils.getExprType(design[index].expr);
        const prevType = exprUtils.getExprType(design[index - 1].expr);
        const idTable = exprUtils.getExprIdTable(design[index].expr);
        const prevIdTable = exprUtils.getExprIdTable(design[index - 1].expr);
        const enumValues = exprUtils.getExprEnumValues(design[index].expr);
        const prevEnumValues = exprUtils.getExprEnumValues(design[index - 1].expr);
        const multi = design[index].multi || false;
        const prevMulti = design[index - 1].multi || false;
        if (multi !== prevMulti) {
            return false;
        }
        if (!type || type !== prevType) {
            return false;
        }
        if (idTable !== prevIdTable) {
            return false;
        }
        if (enumValues && !lodash_1.default.isEqual(lodash_1.default.pluck(enumValues, "id"), lodash_1.default.pluck(prevEnumValues || [], "id"))) {
            return false;
        }
        return true;
    }
    render() {
        return R("div", null, react_1.default.createElement(ListEditorComponent_1.ListEditorComponent, { items: this.props.design, onItemsChange: this.handleDesignChange, renderItem: this.renderQuickfilter, getReorderableKey: (item, index) => index }), this.props.tables.length > 0
            ? R("button", { type: "button", className: "btn btn-sm btn-link", onClick: this.handleAdd }, R("span", { className: "fas fa-plus" }), " Add Quick Filter")
            : undefined);
    }
}
exports.default = QuickfiltersDesignComponent;
/** Single quickfilter design component */
class QuickfilterDesignComponent extends react_1.default.Component {
    constructor(props) {
        var _a;
        super(props);
        this.handleTableChange = (table) => {
            this.setState({ table });
            const design = {
                expr: null
            };
            return this.props.onChange(design);
        };
        this.handleExprChange = (expr) => {
            return this.props.onChange(update_object_1.default(this.props.design, { expr: { $set: expr } }));
        };
        this.handleLabelChange = (ev) => {
            return this.props.onChange(update_object_1.default(this.props.design, { label: { $set: ev.target.value } }));
        };
        this.handleMergedChange = (merged) => {
            return this.props.onChange(update_object_1.default(this.props.design, { merged: { $set: merged } }));
        };
        this.handleMultiChange = (multi) => {
            return this.props.onChange(update_object_1.default(this.props.design, { multi: { $set: multi } }));
        };
        // Store table to allow selecting table first, then expression
        this.state = {
            table: ((_a = props.design.expr) === null || _a === void 0 ? void 0 : _a.table) || props.tables[0]
        };
    }
    render() {
        // Determine type of expression
        const exprType = new mwater_expressions_1.ExprUtils(this.props.schema).getExprType(this.props.design.expr);
        return R("div", {}, R("div", { className: "mb-3 mt-1", key: "table" }, R("label", { className: "text-muted" }, "Data Source"), R(ui.Select, {
            value: this.state.table,
            options: lodash_1.default.map(this.props.tables, (table) => ({
                value: table,
                label: mwater_expressions_1.ExprUtils.localizeString(this.props.schema.getTable(table).name)
            })),
            onChange: this.handleTableChange,
            nullLabel: "Select..."
        })), R("div", { className: "mb-3", key: "expr" }, R("label", { className: "text-muted" }, "Filter By"), R("div", null, R(mwater_expressions_ui_1.ExprComponent, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            table: this.state.table,
            value: this.props.design.expr,
            onChange: this.handleExprChange,
            types: ["enum", "text", "enumset", "date", "datetime", "id[]", "text[]"]
        }))), this.props.design.expr
            ? R("div", { className: "mb-3", key: "label" }, R("label", { className: "text-muted" }, "Label"), R("input", {
                type: "text",
                className: "form-control form-control-sm",
                value: this.props.design.label || "",
                onChange: this.handleLabelChange,
                placeholder: "Optional Label"
            }))
            : undefined, this.props.mergeable
            ? R(ui.Checkbox, {
                value: this.props.design.merged,
                onChange: this.handleMergedChange
            }, "Merge with previous quickfilter ", R("span", { className: "text-muted" }, "- displays as one single control that filters both"))
            : undefined, ["enum", "text", "enumset", "id[]", "text[]"].includes(exprType)
            ? R(ui.Checkbox, {
                value: this.props.design.multi,
                onChange: this.handleMultiChange
            }, "Allow multiple selections")
            : undefined);
    }
}
