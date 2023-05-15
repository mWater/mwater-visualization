"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
const prop_types_1 = __importDefault(require("prop-types"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const TabbedComponent_1 = __importDefault(require("react-library/lib/TabbedComponent"));
const NumberInputComponent_1 = __importDefault(require("react-library/lib/NumberInputComponent"));
const CheckboxComponent_1 = __importDefault(require("../CheckboxComponent"));
const react_onclickout_1 = __importDefault(require("react-onclickout"));
const MapLayersDesignerComponent_1 = __importDefault(require("./MapLayersDesignerComponent"));
const MapFiltersDesignerComponent_1 = __importDefault(require("./MapFiltersDesignerComponent"));
const BaseLayerDesignerComponent_1 = __importDefault(require("./BaseLayerDesignerComponent"));
const PopoverHelpComponent_1 = __importDefault(require("react-library/lib/PopoverHelpComponent"));
const MapUtils = __importStar(require("./MapUtils"));
const ui = __importStar(require("react-library/lib/bootstrap"));
const QuickfiltersDesignComponent_1 = __importDefault(require("../quickfilter/QuickfiltersDesignComponent"));
const immer_1 = __importDefault(require("immer"));
class MapDesignerComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleAttributionChange = (text) => {
            const design = Object.assign(Object.assign({}, this.props.design), { attribution: text });
            return this.props.onDesignChange(design);
        };
        this.handleAutoBoundsChange = (value) => {
            const design = Object.assign(Object.assign({}, this.props.design), { autoBounds: value });
            return this.props.onDesignChange(design);
        };
        this.handleShowLayerSwitcherChange = (value) => {
            const design = Object.assign(Object.assign({}, this.props.design), { showLayerSwitcher: value });
            return this.props.onDesignChange(design);
        };
        this.handleConvertToClusterMap = () => {
            return this.props.onDesignChange(MapUtils.convertToClusterMap(this.props.design));
        };
        this.handleConvertToMarkersMap = () => {
            return this.props.onDesignChange(MapUtils.convertToMarkersMap(this.props.design));
        };
        this.handleInitialLegendDisplayChange = (value) => {
            const design = Object.assign(Object.assign({}, this.props.design), { initialLegendDisplay: value });
            return this.props.onDesignChange(design);
        };
    }
    getChildContext() {
        return {
            // Pass active tables down to table select components so they can present a shorter list
            activeTables: MapUtils.getFilterableTables(this.props.design, this.props.schema)
        };
    }
    renderOptionsTab() {
        return R("div", null, R(BaseLayerDesignerComponent_1.default, {
            design: this.props.design,
            onDesignChange: this.props.onDesignChange
        }), R(CheckboxComponent_1.default, {
            checked: this.props.design.autoBounds,
            onChange: this.handleAutoBoundsChange
        }, R("span", { className: "text-muted" }, "Automatic zoom ", R(PopoverHelpComponent_1.default, { placement: "left" }, "Automatically zoom to the complete data whenever the map is loaded or the filters change"))), R(CheckboxComponent_1.default, {
            checked: this.props.design.showLayerSwitcher,
            onChange: this.handleShowLayerSwitcherChange
        }, R("span", { className: "text-muted" }, "Show Layer Switcher ", R(PopoverHelpComponent_1.default, { placement: "left" }, "Show a control in the map allowing switching layers"))), R(ui.FormGroup, { label: "Initial Legend Display", labelMuted: true }, R(ui.Select, {
            value: this.props.design.initialLegendDisplay || "open",
            onChange: this.handleInitialLegendDisplayChange,
            options: [
                { value: "open", label: "Open" },
                { value: "closed", label: "Closed" },
                { value: "closedIfSmall", label: "Open if wide enough" }
            ],
            style: { width: "auto" }
        })), MapUtils.canConvertToClusterMap(this.props.design)
            ? R("div", { key: "tocluster" }, R("a", { onClick: this.handleConvertToClusterMap, className: "btn btn-link btn-sm" }, "Convert to cluster map"))
            : undefined, MapUtils.canConvertToMarkersMap(this.props.design)
            ? R("div", { key: "toMarker" }, R("a", { onClick: this.handleConvertToMarkersMap, className: "btn btn-link btn-sm" }, "Convert to markers map"))
            : undefined, R(AttributionComponent, {
            text: this.props.design.attribution,
            onTextChange: this.handleAttributionChange
        }), R("br"), R(AdvancedOptionsComponent, {
            design: this.props.design,
            onDesignChange: this.props.onDesignChange
        }));
    }
    render() {
        const filterableTables = MapUtils.getFilterableTables(this.props.design, this.props.schema);
        const filters = (this.props.filters || []).concat(MapUtils.getCompiledFilters(this.props.design, this.props.schema, filterableTables));
        const tabs = [
            {
                id: "layers",
                label: [R("i", { className: "fa fa-bars" }), " Layers"],
                elem: R(MapLayersDesignerComponent_1.default, {
                    schema: this.props.schema,
                    dataSource: this.props.dataSource,
                    design: this.props.design,
                    onDesignChange: this.props.onDesignChange,
                    allowEditingLayers: true,
                    filters: lodash_1.default.compact(filters)
                })
            },
            {
                id: "filters",
                label: [R("i", { className: "fa fa-filter" }), " Filters"],
                elem: R(MapFiltersDesignerComponent_1.default, {
                    schema: this.props.schema,
                    dataSource: this.props.dataSource,
                    design: this.props.design,
                    onDesignChange: this.props.onDesignChange
                })
            },
            {
                id: "options",
                label: [R("i", { className: "fa fa-cog" }), " Options"],
                elem: this.renderOptionsTab()
            }
        ];
        if (this.props.enableQuickFilters) {
            tabs.splice(2, 0, {
                id: "quickfilters",
                label: [R("i", { className: "fa fa-bolt" }), " ", T("Quickfilters")],
                elem: R("div", { style: { marginBottom: 200 } }, R(QuickfiltersDesignComponent_1.default, {
                    design: this.props.design.quickfilters || [],
                    onDesignChange: (qfDesign) => {
                        this.props.onDesignChange((0, immer_1.default)(this.props.design, (draft) => {
                            draft.quickfilters = qfDesign;
                        }));
                    },
                    schema: this.props.schema,
                    dataSource: this.props.dataSource,
                    tables: filterableTables
                }))
            });
        }
        return R("div", { style: { padding: 5 } }, R(TabbedComponent_1.default, {
            initialTabId: "layers",
            tabs
        }));
    }
}
exports.default = MapDesignerComponent;
MapDesignerComponent.childContextTypes = { activeTables: prop_types_1.default.arrayOf(prop_types_1.default.string.isRequired) };
// Attribution inline editing
class AttributionComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleTextChange = (e) => {
            return this.props.onTextChange(e.target.value);
        };
        this.handleClickOut = () => {
            return this.setState({ editing: false });
        };
        this.handleTextClick = () => {
            return this.setState({ editing: true });
        };
        this.state = {
            editing: false
        };
    }
    renderEditor() {
        return R(react_onclickout_1.default, { onClickOut: this.handleClickOut }, R("input", { onChange: this.handleTextChange, value: this.props.text, className: "form-control" }));
    }
    render() {
        let elem = R("div", { style: { marginLeft: 5 } }, this.state.editing
            ? this.renderEditor()
            : this.props.text
                ? R("span", { onClick: this.handleTextClick, style: { cursor: "pointer" } }, this.props.text)
                : R("a", { onClick: this.handleTextClick, className: "btn btn-link btn-sm" }, "+ Add attribution"));
        if (this.props.text || this.state.editing) {
            elem = R("div", { className: "mb-3" }, R("label", { className: "text-muted" }, "Attribution"), elem);
        }
        return elem;
    }
}
AttributionComponent.defaultProps = { text: null };
// Advanced options control
class AdvancedOptionsComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.state = {
            expanded: false
        };
    }
    render() {
        if (!this.state.expanded) {
            return R("div", null, R("a", { className: "btn btn-link btn-sm", onClick: () => this.setState({ expanded: true }) }, "Advanced options..."));
        }
        return R("div", { className: "mb-3" }, R("label", { className: "text-muted" }, "Advanced"), R("div", null, R("span", { className: "text-muted" }, "Maximum Zoom Level: "), " ", R(NumberInputComponent_1.default, {
            small: true,
            style: { display: "inline-block" },
            placeholder: "None",
            value: this.props.design.maxZoom,
            onChange: (v) => this.props.onDesignChange(lodash_1.default.extend({}, this.props.design, { maxZoom: v }))
        })));
    }
}
