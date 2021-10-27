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
const rc_slider_1 = __importDefault(require("rc-slider"));
const LayerFactory_1 = __importDefault(require("./LayerFactory"));
const ui = __importStar(require("react-library/lib/bootstrap"));
const PopoverHelpComponent_1 = __importDefault(require("react-library/lib/PopoverHelpComponent"));
// A single row in the table of layer views. Handles the editor state
class MapLayerViewDesignerComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleVisibleClick = () => {
            return this.update({ visible: !this.props.layerView.visible });
        };
        this.handleHideLegend = (hideLegend) => {
            return this.update({ hideLegend });
        };
        this.handleGroupChange = (group) => {
            return this.update({ group });
        };
        this.handleToggleEditing = () => {
            return this.setState({ editing: !this.state.editing });
        };
        this.handleSaveEditing = (design) => {
            return this.update({ design });
        };
        this.handleRename = () => {
            if (this.props.allowEditingLayer) {
                const name = prompt("Enter new name", this.props.layerView.name);
                if (name) {
                    return this.update({ name });
                }
            }
        };
        this.handleOpacityChange = (newValue) => {
            return this.update({ opacity: newValue / 100 });
        };
        this.handleRemove = () => {
            if (confirm("Delete layer?")) {
                return this.props.onRemove();
            }
        };
        const layer = LayerFactory_1.default.createLayer(this.props.layerView.type);
        this.state = {
            editing: props.allowEditingLayer && layer.isIncomplete(this.props.layerView.design, this.props.schema) // Editing initially if incomplete
        };
    }
    update(updates) {
        return this.props.onLayerViewChange(lodash_1.default.extend({}, this.props.layerView, updates));
    }
    renderVisible() {
        if (this.props.layerView.visible) {
            return R("i", {
                className: "fa fa-fw fa-check-square",
                style: { color: "#2E6DA4" },
                onClick: this.handleVisibleClick
            });
        }
        else {
            return R("i", {
                className: "fa fa-fw fa-square",
                style: { color: "#DDDDDD" },
                onClick: this.handleVisibleClick
            });
        }
    }
    renderAdvanced() {
        return R("div", {
            key: "advanced",
            style: { display: "grid", gridTemplateColumns: "50% auto auto 1fr", alignItems: "center", columnGap: 5 }
        }, R(ui.Checkbox, { value: this.props.layerView.hideLegend, onChange: this.handleHideLegend, inline: true }, "Hide Legend"), R("label", { className: "text-muted", key: "label" }, "Group:"), R(ui.TextInput, {
            key: "input",
            value: this.props.layerView.group,
            onChange: this.handleGroupChange,
            style: { width: "5em" },
            placeholder: "None"
        }), R("div", null, R(PopoverHelpComponent_1.default, { placement: "top", key: "help" }, "Layers in the same group can only be selected one at a time")));
    }
    renderName() {
        return R("span", { className: "hover-display-parent", onClick: this.handleRename, style: { cursor: "pointer" } }, this.props.layerView.name, " ", R("span", { className: "hover-display-child fas fa-pencil-alt text-muted" }));
    }
    renderEditor() {
        const layer = LayerFactory_1.default.createLayer(this.props.layerView.type);
        return R("div", null, layer.isEditable()
            ? layer.createDesignerElement({
                design: this.props.layerView.design,
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                onDesignChange: this.handleSaveEditing,
                filters: this.props.filters
            })
            : undefined, this.renderOpacityControl(), this.renderAdvanced());
    }
    renderLayerEditToggle() {
        return R("div", { key: "edit", style: { marginBottom: this.state.editing ? 10 : undefined } }, R("a", { className: "link-plain", onClick: this.handleToggleEditing, style: { fontSize: 12 } }, this.state.editing
            ? [R("i", { className: "fa fa-caret-up" }), " Close"]
            : [R("i", { className: "fa fa-cog" }), " Customize..."]));
    }
    renderOpacityControl() {
        return R("div", { className: "mb-3", style: { paddingTop: 10 } }, R("label", { className: "text-muted" }, R("span", null, `Opacity: ${Math.round(this.props.layerView.opacity * 100)}%`)), R("div", { style: { padding: "10px" } }, react_1.default.createElement(rc_slider_1.default, {
            min: 0,
            max: 100,
            step: 1,
            tipTransitionName: "rc-slider-tooltip-zoom-down",
            value: this.props.layerView.opacity * 100,
            onChange: this.handleOpacityChange
        })));
    }
    renderDeleteLayer() {
        return R("div", { style: { float: "right", marginLeft: 10 }, key: "delete" }, R("a", { className: "link-plain", onClick: this.handleRemove }, R("i", { className: "fa fa-remove" })));
    }
    render() {
        const layer = LayerFactory_1.default.createLayer(this.props.layerView.type);
        const style = {
            cursor: "move",
            marginRight: 8,
            opacity: 0.5
        };
        // float: "right"
        return this.props.connectDragPreview(this.props.connectDropTarget(R("div", null, R("div", { style: { fontSize: 16 }, key: "layerView" }, this.props.connectDragSource
            ? this.props.connectDragSource(R("i", { className: "fa fa-bars", style }))
            : undefined, this.props.allowEditingLayer ? this.renderDeleteLayer() : undefined, this.renderVisible(), "\u00A0", this.renderName()), this.props.allowEditingLayer ? this.renderLayerEditToggle() : undefined, this.state.editing ? this.renderEditor() : undefined)));
    }
}
exports.default = MapLayerViewDesignerComponent;
