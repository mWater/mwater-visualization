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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
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
const update_1 = __importDefault(require("react-library/lib/update"));
const rc_slider_1 = __importDefault(require("rc-slider"));
const AxisComponent_1 = __importDefault(require("../../../axes/AxisComponent"));
const ColorComponent_1 = __importDefault(require("../../../ColorComponent"));
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
const mwater_expressions_ui_2 = require("mwater-expressions-ui");
// Design an intersection of a pivot table
class IntersectionDesignerComponent extends react_1.default.Component {
    constructor(...args) {
        super(...args);
        this.handleBackgroundColorAxisChange = (backgroundColorAxis) => {
            const opacity = this.props.intersection.backgroundColorOpacity || 1;
            return this.update({ backgroundColorAxis, backgroundColorOpacity: opacity });
        };
        this.handleBackgroundColorChange = (backgroundColor) => {
            const opacity = this.props.intersection.backgroundColorOpacity || 1;
            return this.update({ backgroundColor, backgroundColorOpacity: opacity });
        };
        this.handleBackgroundColorConditionsChange = (backgroundColorConditions) => {
            const opacity = this.props.intersection.backgroundColorOpacity || 1;
            return this.update({ backgroundColorConditions, backgroundColorOpacity: opacity });
        };
        this.handleBackgroundColorOpacityChange = (newValue) => {
            return this.update({ backgroundColorOpacity: newValue / 100 });
        };
        this.handleFilterChange = (filter) => {
            return this.update({ filter });
        };
        this.update = this.update.bind(this);
    }
    // Updates intersection with the specified changes
    update() {
        return (0, update_1.default)(this.props.intersection, this.props.onChange, arguments);
    }
    renderValueAxis() {
        return R(ui.FormGroup, {
            labelMuted: true,
            label: "Calculation",
            help: "This is the calculated value that is displayed. Leave as blank to make an empty section"
        }, R(AxisComponent_1.default, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            table: this.props.table,
            types: ["enum", "text", "boolean", "date", "number"],
            aggrNeed: "required",
            value: this.props.intersection.valueAxis,
            onChange: this.update("valueAxis"),
            showFormat: true,
            filters: this.props.filters
        }));
    }
    renderNullValue() {
        if (this.props.intersection.valueAxis) {
            return R(ui.FormGroup, {
                labelMuted: true,
                label: "Show Empty Cells as"
            }, R(ui.TextInput, {
                value: this.props.intersection.valueAxis.nullLabel,
                emptyNull: true,
                onChange: this.update("valueAxis.nullLabel"),
                placeholder: "Blank"
            }));
        }
    }
    renderFilter() {
        return R(ui.FormGroup, {
            labelMuted: true,
            label: [R(ui.Icon, { id: "glyphicon-filter" }), " Filters"]
        }, R(mwater_expressions_ui_1.FilterExprComponent, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            onChange: this.handleFilterChange,
            table: this.props.table,
            value: this.props.intersection.filter
        }));
    }
    renderStyling() {
        return R(ui.FormGroup, {
            labelMuted: true,
            key: "styling",
            label: "Styling"
        }, R(ui.Checkbox, { key: "bold", inline: true, value: this.props.intersection.bold, onChange: this.update("bold") }, "Bold"), R(ui.Checkbox, { key: "italic", inline: true, value: this.props.intersection.italic, onChange: this.update("italic") }, "Italic"));
    }
    renderBackgroundColorConditions() {
        return R(BackgroundColorConditionsComponent, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            table: this.props.table,
            colorConditions: this.props.intersection.backgroundColorConditions,
            onChange: this.handleBackgroundColorConditionsChange
        });
    }
    renderBackgroundColorAxis() {
        return R(ui.FormGroup, {
            labelMuted: true,
            label: "Background Color From Values",
            help: "This is an optional background color to set on cells that is controlled by the data"
        }, R(AxisComponent_1.default, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            table: this.props.table,
            types: ["enum", "text", "boolean", "date"],
            aggrNeed: "required",
            value: this.props.intersection.backgroundColorAxis,
            onChange: this.handleBackgroundColorAxisChange,
            showColorMap: true,
            filters: this.props.filters
        }));
    }
    renderBackgroundColor() {
        if (this.props.intersection.backgroundColorAxis) {
            return;
        }
        return R(ui.FormGroup, {
            labelMuted: true,
            label: "Background Color",
            help: "This is an optional background color to set on all cells"
        }, R(ColorComponent_1.default, {
            color: this.props.intersection.backgroundColor,
            onChange: this.handleBackgroundColorChange
        }));
    }
    renderBackgroundColorOpacityControl() {
        var _a;
        if (!this.props.intersection.backgroundColorAxis &&
            !this.props.intersection.backgroundColor &&
            !((_a = this.props.intersection.backgroundColorConditions) === null || _a === void 0 ? void 0 : _a[0])) {
            return;
        }
        return R(ui.FormGroup, {
            labelMuted: true,
            label: `Background Opacity: ${Math.round(this.props.intersection.backgroundColorOpacity * 100)}%`
        }, R(rc_slider_1.default, {
            min: 0,
            max: 100,
            step: 1,
            tipTransitionName: "rc-slider-tooltip-zoom-down",
            value: this.props.intersection.backgroundColorOpacity * 100,
            onChange: this.handleBackgroundColorOpacityChange
        }));
    }
    render() {
        return R("div", null, this.renderValueAxis(), this.renderNullValue(), this.renderFilter(), this.renderStyling(), this.renderBackgroundColorAxis(), this.renderBackgroundColorConditions(), this.renderBackgroundColor(), this.renderBackgroundColorOpacityControl());
    }
}
exports.default = IntersectionDesignerComponent;
// Displays background color conditions
class BackgroundColorConditionsComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleAdd = () => {
            const colorConditions = (this.props.colorConditions || []).slice();
            colorConditions.push({});
            return this.props.onChange(colorConditions);
        };
        this.handleChange = (index, colorCondition) => {
            const colorConditions = this.props.colorConditions.slice();
            colorConditions[index] = colorCondition;
            return this.props.onChange(colorConditions);
        };
        this.handleRemove = (index) => {
            const colorConditions = this.props.colorConditions.slice();
            colorConditions.splice(index, 1);
            return this.props.onChange(colorConditions);
        };
    }
    render() {
        // List conditions
        return R(ui.FormGroup, {
            label: "Color Conditions",
            labelMuted: true,
            help: "Add conditions that, if met, set the color of the cell. Useful for flagging certain values"
        }, lodash_1.default.map(this.props.colorConditions, (colorCondition, i) => {
            return R(BackgroundColorConditionComponent, {
                key: i,
                colorCondition,
                table: this.props.table,
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                onChange: this.handleChange.bind(null, i),
                onRemove: this.handleRemove.bind(null, i)
            });
        }), R(ui.Button, { type: "link", size: "sm", onClick: this.handleAdd }, R(ui.Icon, { id: "fa-plus" }), " Add Condition"));
    }
}
// Displays single background color condition
class BackgroundColorConditionComponent extends react_1.default.Component {
    constructor(...args) {
        super(...args);
        this.update = this.update.bind(this);
    }
    // Updates intersection with the specified changes
    update() {
        return (0, update_1.default)(this.props.colorCondition, this.props.onChange, arguments);
    }
    render() {
        return R("div", { className: "card" }, R("div", { className: "card-body" }, R(ui.FormGroup, {
            labelMuted: true,
            label: "Condition"
        }, R(mwater_expressions_ui_2.ExprComponent, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            onChange: this.update("condition"),
            types: ["boolean"],
            aggrStatuses: ["aggregate", "literal"],
            table: this.props.table,
            value: this.props.colorCondition.condition
        })), R(ui.FormGroup, {
            labelMuted: true,
            label: "Color",
            hint: "Color to display when condition is met"
        }, R(ColorComponent_1.default, {
            color: this.props.colorCondition.color,
            onChange: this.update("color")
        }))));
    }
}
