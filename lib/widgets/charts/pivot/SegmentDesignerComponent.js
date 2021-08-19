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
const ui = __importStar(require("react-library/lib/bootstrap"));
const AxisComponent_1 = __importDefault(require("../../../axes/AxisComponent"));
const ColorComponent_1 = __importDefault(require("../../../ColorComponent"));
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
const mwater_expressions_ui_2 = require("mwater-expressions-ui");
// Design a single segment of a pivot table
class SegmentDesignerComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleSingleMode = () => {
            this.update({ valueAxis: null });
            return this.setState({ mode: "single" });
        };
        this.handleMultipleMode = () => {
            return this.setState({ mode: "multiple" });
        };
        this.handleValueAxisChange = (valueAxis) => {
            return this.update({ valueAxis });
        };
        this.handleLabelChange = (ev) => {
            return this.update({ label: ev.target.value });
        };
        this.handleFilterChange = (filter) => {
            return this.update({ filter });
        };
        this.handleOrderExprChange = (orderExpr) => {
            return this.update({ orderExpr });
        };
        this.handleOrderDirChange = (orderDir) => {
            return this.update({ orderDir });
        };
        this.state = {
            // Mode switcher to make UI clearer
            mode: props.segment.label == null && !props.segment.valueAxis ? null : props.segment.valueAxis ? "multiple" : "single"
        };
    }
    componentDidMount() {
        var _a;
        return (_a = this.labelElem) === null || _a === void 0 ? void 0 : _a.focus();
    }
    // Updates segment with the specified changes
    update(changes) {
        const segment = lodash_1.default.extend({}, this.props.segment, changes);
        return this.props.onChange(segment);
    }
    renderMode() {
        return R(ui.FormGroup, {
            labelMuted: true,
            label: "Type"
        }, R("div", { key: "single", className: "radio" }, R("label", null, R("input", { type: "radio", checked: this.state.mode === "single", onChange: this.handleSingleMode }), `Single ${this.props.segmentType}`, R("span", { className: "text-muted" }, ` - used for summary ${this.props.segmentType}s and empty ${this.props.segmentType}s`))), R("div", { key: "multiple", className: "radio" }, R("label", null, R("input", { type: "radio", checked: this.state.mode === "multiple", onChange: this.handleMultipleMode }), `Multiple ${this.props.segmentType}s`, R("span", { className: "text-muted" }, " - disaggregate data by a field"))));
    }
    renderLabel() {
        return R(ui.FormGroup, {
            labelMuted: true,
            label: "Label",
            help: this.state.mode === "multiple" ? `Optional label for the ${this.props.segmentType}s` : undefined
        }, R("input", {
            ref: (elem) => {
                return (this.labelElem = elem);
            },
            type: "text",
            className: "form-control",
            value: this.props.segment.label || "",
            onChange: this.handleLabelChange
        }));
    }
    renderValueAxis() {
        return R(ui.FormGroup, {
            labelMuted: true,
            label: "Field",
            help: "Field to disaggregate data by"
        }, R("div", { style: { marginLeft: 8 } }, R(AxisComponent_1.default, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            table: this.props.table,
            types: ["enum", "text", "boolean", "date"],
            aggrNeed: "none",
            value: this.props.segment.valueAxis,
            onChange: this.handleValueAxisChange,
            allowExcludedValues: true,
            filters: this.props.filters
        })));
    }
    renderFilter() {
        return R(ui.FormGroup, {
            labelMuted: true,
            label: [R(ui.Icon, { id: "glyphicon-filter" }), " Filters"],
            hint: `Filters all data associated with this ${this.props.segmentType}`
        }, R(mwater_expressions_ui_2.FilterExprComponent, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            onChange: this.handleFilterChange,
            table: this.props.table,
            value: this.props.segment.filter
        }));
    }
    renderStyling() {
        return R(ui.FormGroup, {
            labelMuted: true,
            label: "Styling"
        }, R("label", { className: "checkbox-inline", key: "bold" }, R("input", {
            type: "checkbox",
            checked: this.props.segment.bold === true,
            onChange: (ev) => this.update({ bold: ev.target.checked })
        }), "Bold"), R("label", { className: "checkbox-inline", key: "italic" }, R("input", {
            type: "checkbox",
            checked: this.props.segment.italic === true,
            onChange: (ev) => this.update({ italic: ev.target.checked })
        }), "Italic"), this.props.segment.valueAxis && this.props.segment.label
            ? R("label", { className: "checkbox-inline", key: "valueLabelBold" }, R("input", {
                type: "checkbox",
                checked: this.props.segment.valueLabelBold === true,
                onChange: (ev) => this.update({ valueLabelBold: ev.target.checked })
            }), "Header Bold")
            : undefined, this.props.segment.valueAxis && this.props.segment.label
            ? R("div", { style: { paddingTop: 5 } }, "Shade filler cells: ", R(ColorComponent_1.default, {
                color: this.props.segment.fillerColor,
                onChange: (color) => this.update({ fillerColor: color })
            }))
            : undefined);
    }
    renderBorders() {
        return R(ui.FormGroup, {
            labelMuted: true,
            label: "Borders"
        }, R("div", { key: "before" }, this.props.segmentType === "row" ? "Top: " : "Left: "), R(BorderComponent, {
            value: this.props.segment.borderBefore,
            defaultValue: 2,
            onChange: (value) => this.update({ borderBefore: value })
        }), R("div", { key: "within" }, "Within: "), R(BorderComponent, {
            value: this.props.segment.borderWithin,
            defaultValue: 1,
            onChange: (value) => this.update({ borderWithin: value })
        }), R("div", { key: "after" }, this.props.segmentType === "row" ? "Bottom: " : "Right: "), R(BorderComponent, {
            value: this.props.segment.borderAfter,
            defaultValue: 2,
            onChange: (value) => this.update({ borderAfter: value })
        }));
    }
    renderOrderExpr() {
        return R(ui.FormGroup, {
            labelMuted: true,
            label: [R(ui.Icon, { id: "fa-sort-amount-asc" }), " Sort"],
            hint: `Sorts the display of this ${this.props.segmentType}`
        }, R(mwater_expressions_ui_1.ExprComponent, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            onChange: this.handleOrderExprChange,
            table: this.props.table,
            types: ["enum", "text", "boolean", "date", "datetime", "number"],
            aggrStatuses: ["aggregate"],
            value: this.props.segment.orderExpr
        }), this.props.segment.orderExpr
            ? R("div", null, R(ui.Radio, {
                value: this.props.segment.orderDir || "asc",
                radioValue: "asc",
                onChange: this.handleOrderDirChange,
                inline: true
            }, "Ascending"), R(ui.Radio, {
                value: this.props.segment.orderDir || "asc",
                radioValue: "desc",
                onChange: this.handleOrderDirChange,
                inline: true
            }, "Descending"))
            : undefined);
    }
    render() {
        return R("div", null, this.renderMode(), this.state.mode ? this.renderLabel() : undefined, this.state.mode === "multiple" ? this.renderValueAxis() : undefined, this.state.mode ? this.renderFilter() : undefined, this.state.mode === "multiple" ? this.renderOrderExpr() : undefined, this.state.mode ? this.renderStyling() : undefined, this.state.mode ? this.renderBorders() : undefined);
    }
}
exports.default = SegmentDesignerComponent;
// Allows setting border heaviness
class BorderComponent extends react_1.default.Component {
    render() {
        const value = this.props.value != null ? this.props.value : this.props.defaultValue;
        return R("span", null, R("label", { className: "radio-inline" }, R("input", { type: "radio", checked: value === 0, onClick: () => this.props.onChange(0) }), "None"), R("label", { className: "radio-inline" }, R("input", { type: "radio", checked: value === 1, onClick: () => this.props.onChange(1) }), "Light"), R("label", { className: "radio-inline" }, R("input", { type: "radio", checked: value === 2, onClick: () => this.props.onChange(2) }), "Medium"), R("label", { className: "radio-inline" }, R("input", { type: "radio", checked: value === 3, onClick: () => this.props.onChange(3) }), "Heavy"));
    }
}
