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
const bootstrap_1 = __importDefault(require("react-library/lib/bootstrap"));
class MapDesignerComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleAttributionChange = (text) => {
            const design = lodash_1.default.extend({}, this.props.design, { attribution: text });
            return this.props.onDesignChange(design);
        };
        this.handleAutoBoundsChange = (value) => {
            const design = lodash_1.default.extend({}, this.props.design, { autoBounds: value });
            return this.props.onDesignChange(design);
        };
        this.handleShowLayerSwitcherChange = (value) => {
            const design = lodash_1.default.extend({}, this.props.design, { showLayerSwitcher: value });
            return this.props.onDesignChange(design);
        };
        this.handleConvertToClusterMap = () => {
            return this.props.onDesignChange(MapUtils.convertToClusterMap(this.props.design));
        };
        this.handleInitialLegendDisplayChange = (value) => {
            const design = lodash_1.default.extend({}, this.props.design, { initialLegendDisplay: value });
            return this.props.onDesignChange(design);
        };
    }
    static initClass() {
        this.childContextTypes = { activeTables: prop_types_1.default.arrayOf(prop_types_1.default.string.isRequired) };
        // List of tables (ids) being used. Use this to present an initially short list to select from
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
        }, R("span", { className: "text-muted" }, "Show Layer Switcher ", R(PopoverHelpComponent_1.default, { placement: "left" }, "Show a control in the map allowing switching layers"))), R(bootstrap_1.default.FormGroup, { label: "Initial Legend Display", labelMuted: true }, R(bootstrap_1.default.Select, {
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
            : undefined, R(AttributionComponent, {
            text: this.props.design.attribution,
            onTextChange: this.handleAttributionChange
        }), R("br"), R(AdvancedOptionsComponent, {
            design: this.props.design,
            onDesignChange: this.props.onDesignChange
        }));
    }
    render() {
        const filters = (this.props.filters || []).concat(MapUtils.getCompiledFilters(this.props.design, this.props.schema, MapUtils.getFilterableTables(this.props.design, this.props.schema)));
        return R("div", { style: { padding: 5 } }, R(TabbedComponent_1.default, {
            initialTabId: "layers",
            tabs: [
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
            ]
        }));
    }
}
exports.default = MapDesignerComponent;
MapDesignerComponent.initClass();
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
    static initClass() {
        this.defaultProps = { text: null };
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
            elem = R("div", { className: "form-group" }, R("label", { className: "text-muted" }, "Attribution"), elem);
        }
        return elem;
    }
}
AttributionComponent.initClass();
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
            return R("div", null, R("a", { className: "btn btn-link btn-xs", onClick: () => this.setState({ expanded: true }) }, "Advanced options..."));
        }
        return R("div", { className: "form-group" }, R("label", { className: "text-muted" }, "Advanced"), R("div", null, R("span", { className: "text-muted" }, "Maximum Zoom Level: "), " ", R(NumberInputComponent_1.default, {
            small: true,
            style: { display: "inline-block" },
            placeholder: "None",
            value: this.props.design.maxZoom,
            onChange: (v) => this.props.onDesignChange(lodash_1.default.extend({}, this.props.design, { maxZoom: v }))
        })));
    }
}
