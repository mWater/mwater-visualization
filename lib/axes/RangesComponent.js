"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const uuid_1 = __importDefault(require("uuid"));
const update_object_1 = __importDefault(require("update-object"));
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
const NumberInputComponent_1 = __importDefault(require("react-library/lib/NumberInputComponent"));
const ReorderableListComponent_1 = __importDefault(require("react-library/lib/reorderable/ReorderableListComponent"));
// Allows setting of ranges
class RangesComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleRangeChange = (index, range) => {
            const ranges = this.props.xform.ranges.slice();
            ranges[index] = range;
            return this.props.onChange((0, update_object_1.default)(this.props.xform, { ranges: { $set: ranges } }));
        };
        this.handleAddRange = () => {
            const ranges = this.props.xform.ranges.slice();
            ranges.push({ id: (0, uuid_1.default)(), minOpen: false, maxOpen: true });
            return this.props.onChange((0, update_object_1.default)(this.props.xform, { ranges: { $set: ranges } }));
        };
        this.handleRemoveRange = (index) => {
            const ranges = this.props.xform.ranges.slice();
            ranges.splice(index, 1);
            return this.props.onChange((0, update_object_1.default)(this.props.xform, { ranges: { $set: ranges } }));
        };
        this.renderRange = (range, index, connectDragSource, connectDragPreview, connectDropTarget) => {
            return R(RangeComponent, {
                key: range.id,
                range,
                onChange: this.handleRangeChange.bind(null, index),
                onRemove: this.handleRemoveRange.bind(null, index),
                connectDragSource,
                connectDragPreview,
                connectDropTarget
            });
        };
        this.handleReorder = (ranges) => {
            return this.props.onChange((0, update_object_1.default)(this.props.xform, { ranges: { $set: ranges } }));
        };
    }
    render() {
        return R("div", null, R("table", null, this.props.xform.ranges.length > 0
            ? R("thead", null, R("tr", null, R("th", null, " "), R("th", { key: "min", colSpan: 2, style: { textAlign: "center" } }, "From"), R("th", { key: "and" }, ""), R("th", { key: "max", colSpan: 2, style: { textAlign: "center" } }, "To"), R("th", { key: "label", colSpan: 1, style: { textAlign: "center" } }, "Label"), R("th", { key: "remove" })))
            : undefined, react_1.default.createElement(ReorderableListComponent_1.default, {
            items: this.props.xform.ranges,
            onReorder: this.handleReorder,
            renderItem: this.renderRange,
            getItemId: (range) => range.id,
            element: R("tbody", null)
        })), 
        //          _.map @props.xform.ranges, (range, i) =>
        //            R RangeComponent, key: range.id, range: range, onChange: @handleRangeChange.bind(null, i), onRemove: @handleRemoveRange.bind(null, i)
        R("button", { className: "btn btn-link btn-sm", type: "button", onClick: this.handleAddRange }, R("span", { className: "fas fa-plus" }), " Add Range"));
    }
}
exports.default = RangesComponent;
// Single range (row)
class RangeComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleMinOpenChange = (minOpen) => {
            return this.props.onChange((0, update_object_1.default)(this.props.range, { minOpen: { $set: minOpen } }));
        };
        this.handleMaxOpenChange = (maxOpen) => {
            return this.props.onChange((0, update_object_1.default)(this.props.range, { maxOpen: { $set: maxOpen } }));
        };
    }
    render() {
        let placeholder = "";
        if (this.props.range.minValue != null) {
            if (this.props.range.minOpen) {
                placeholder = `> ${this.props.range.minValue}`;
            }
            else {
                placeholder = `>= ${this.props.range.minValue}`;
            }
        }
        if (this.props.range.maxValue != null) {
            if (placeholder) {
                placeholder += " and ";
            }
            if (this.props.range.maxOpen) {
                placeholder += `< ${this.props.range.maxValue}`;
            }
            else {
                placeholder += `<= ${this.props.range.maxValue}`;
            }
        }
        return this.props.connectDragPreview(this.props.connectDropTarget(R("tr", null, R("td", null, this.props.connectDragSource(R("span", { className: "fa fa-bars" }))), R("td", { key: "minOpen" }, R(mwater_expressions_ui_1.LinkComponent, {
            dropdownItems: [
                { id: true, name: "greater than" },
                { id: false, name: "greater than or equal to" }
            ],
            onDropdownItemClicked: this.handleMinOpenChange
        }, this.props.range.minOpen ? "greater than" : "greater than or equal to")), R("td", { key: "minValue" }, R(NumberInputComponent_1.default, {
            value: this.props.range.minValue,
            placeholder: "None",
            small: true,
            onChange: (v) => this.props.onChange((0, update_object_1.default)(this.props.range, { minValue: { $set: v } }))
        })), R("td", { key: "and" }, "\u00A0and\u00A0"), R("td", { key: "maxOpen" }, R(mwater_expressions_ui_1.LinkComponent, {
            dropdownItems: [
                { id: true, name: "less than" },
                { id: false, name: "less than or equal to" }
            ],
            onDropdownItemClicked: this.handleMaxOpenChange
        }, this.props.range.maxOpen ? "less than" : "less than or equal to")), R("td", { key: "maxValue" }, R(NumberInputComponent_1.default, {
            value: this.props.range.maxValue,
            placeholder: "None",
            small: true,
            onChange: (v) => this.props.onChange((0, update_object_1.default)(this.props.range, { maxValue: { $set: v } }))
        })), R("td", { key: "label" }, R("input", {
            type: "text",
            className: "form-control form-control-sm",
            value: this.props.range.label || "",
            placeholder,
            onChange: (ev) => this.props.onChange((0, update_object_1.default)(this.props.range, { label: { $set: ev.target.value || null } }))
        })), R("td", { key: "remove" }, R("button", { className: "btn btn-sm btn-link", type: "button", onClick: this.props.onRemove }, R("span", { className: "fas fa-times" }))))));
    }
}
