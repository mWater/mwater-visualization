"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const update_object_1 = __importDefault(require("update-object"));
const ColorComponent_1 = __importDefault(require("../ColorComponent"));
const ReorderableListComponent_1 = __importDefault(require("react-library/lib/reorderable/ReorderableListComponent"));
const immer_1 = __importDefault(require("immer"));
// Category map for an axis. Controls the colorMap values and excludedValues
// Can be collapsed
class CategoryMapComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleReorder = (map) => {
            const order = lodash_1.default.pluck(map, "value");
            return this.props.onChange((0, update_object_1.default)(this.props.axis, { drawOrder: { $set: order } }));
        };
        this.handleColorChange = (value, color) => {
            // Delete if present for value
            const colorMap = lodash_1.default.filter(this.props.axis.colorMap || [], (item) => item.value !== value);
            // Add if color present
            if (color) {
                colorMap.push({ value, color });
            }
            return this.props.onChange((0, update_object_1.default)(this.props.axis, { colorMap: { $set: colorMap } }));
        };
        this.handleExcludeChange = (value, ev) => {
            let excludedValues;
            if (ev.target.checked) {
                excludedValues = lodash_1.default.difference(this.props.axis.excludedValues || [], [value]);
            }
            else {
                excludedValues = lodash_1.default.union(this.props.axis.excludedValues || [], [value]);
            }
            return this.props.onChange((0, update_object_1.default)(this.props.axis, { excludedValues: { $set: excludedValues } }));
        };
        this.handleNullLabelChange = (e) => {
            const name = prompt("Enter label for none value", this.props.axis.nullLabel || "None");
            if (name) {
                return this.props.onChange((0, update_object_1.default)(this.props.axis, { nullLabel: { $set: name } }));
            }
        };
        this.handleCategoryLabelChange = (category, e) => {
            let { label } = category;
            if (this.props.axis.categoryLabels) {
                label = this.props.axis.categoryLabels[JSON.stringify(category.value)] || label;
            }
            const name = prompt("Enter label or blank to reset", label);
            if (name != null) {
                if (name) {
                    return this.props.onChange((0, immer_1.default)(this.props.axis, (draft) => {
                        draft.categoryLabels = draft.categoryLabels || {};
                        draft.categoryLabels[JSON.stringify(category.value)] = name;
                    }));
                }
                else {
                    return this.props.onChange((0, immer_1.default)(this.props.axis, (draft) => {
                        draft.categoryLabels = draft.categoryLabels || {};
                        delete draft.categoryLabels[JSON.stringify(category.value)];
                    }));
                }
            }
        };
        this.handleToggle = () => {
            return this.setState({ collapsed: !this.state.collapsed });
        };
        // Category is { value: category value, label: category label }
        this.renderCategory = (category, index, connectDragSource, connectDragPreview, connectDropTarget) => {
            const labelStyle = {
                verticalAlign: "middle",
                marginLeft: 5
            };
            const iconStyle = {
                cursor: "move",
                marginRight: 8,
                opacity: 0.5,
                fontSize: 12,
                height: 20
            };
            const colorPickerStyle = {
                verticalAlign: "middle",
                lineHeight: 1,
                display: "inline-block",
                marginLeft: 5
            };
            let elem = R("div", { key: category.value }, connectDragSource ? connectDragSource(R("i", { className: "fa fa-bars", style: iconStyle })) : undefined, this.props.allowExcludedValues
                ? R("input", {
                    type: "checkbox",
                    style: { marginLeft: 5, marginBottom: 5, verticalAlign: "middle" },
                    checked: !lodash_1.default.includes(this.props.axis.excludedValues || [], category.value),
                    onChange: this.handleExcludeChange.bind(null, category.value)
                })
                : undefined, this.props.showColorMap
                ? R("div", { style: colorPickerStyle }, R(ColorComponent_1.default, {
                    key: "color",
                    color: this.lookupColor(category.value),
                    onChange: (color) => this.handleColorChange(category.value, color)
                }))
                : undefined, R("span", { style: labelStyle }, this.renderLabel(category)));
            if (connectDropTarget) {
                elem = connectDropTarget(elem);
            }
            if (connectDragPreview) {
                elem = connectDragPreview(elem);
            }
            return elem;
        };
        this.state = {
            collapsed: !props.initiallyExpanded // Start collapsed
        };
    }
    // Gets the current color value if known
    lookupColor(value) {
        const item = lodash_1.default.find(this.props.axis.colorMap || [], (item) => item.value === value);
        if (item) {
            return item.color;
        }
        return null;
    }
    renderLabel(category) {
        let { label } = category;
        if (this.props.axis.categoryLabels) {
            label = this.props.axis.categoryLabels[JSON.stringify(category.value)] || label;
        }
        if (category.value != null) {
            return R("a", {
                className: "link-plain",
                onClick: this.handleCategoryLabelChange.bind(null, category),
                style: { cursor: "pointer" }
            }, label);
        }
        else {
            return R("a", { className: "link-plain", onClick: this.handleNullLabelChange, style: { cursor: "pointer" } }, label, R("span", { style: { fontSize: 12, marginLeft: 4 } }, "(click to change label for none value)"));
        }
    }
    renderReorderable() {
        const drawOrder = this.props.axis.drawOrder || lodash_1.default.pluck(this.props.axis.colorMap || [], "value");
        const orderedCategories = lodash_1.default.sortBy(this.props.categories || [], (category) => {
            return lodash_1.default.indexOf(drawOrder, category.value);
        });
        return R("div", null, this.renderToggle(), R(ReorderableListComponent_1.default, {
            items: orderedCategories,
            onReorder: this.handleReorder,
            renderItem: this.renderCategory,
            getItemId: (item) => item.value
        }));
    }
    renderNonReorderable() {
        return R("div", null, this.renderToggle(), lodash_1.default.map(this.props.categories || [], (category) => this.renderCategory(category)));
    }
    renderToggle() {
        if (this.state.collapsed) {
            return R("div", null, R("a", { className: "link-plain", onClick: this.handleToggle }, "Show Values ", R("i", { className: "fa fa-caret-down" })));
        }
        else {
            return R("div", null, R("a", { className: "link-plain", onClick: this.handleToggle }, "Hide Values ", R("i", { className: "fa fa-caret-up" })));
        }
    }
    render() {
        if (this.state.collapsed) {
            return this.renderToggle();
        }
        if (this.props.reorderable) {
            return this.renderReorderable();
        }
        else {
            return this.renderNonReorderable();
        }
    }
}
exports.default = CategoryMapComponent;
