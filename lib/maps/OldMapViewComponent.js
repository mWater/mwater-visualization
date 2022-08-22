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
const LeafletMapComponent_1 = __importDefault(require("./LeafletMapComponent"));
const LayerFactory_1 = __importDefault(require("./LayerFactory"));
const ModalPopupComponent_1 = __importDefault(require("react-library/lib/ModalPopupComponent"));
const MapUtils = __importStar(require("./MapUtils"));
const LayerSwitcherComponent_1 = require("./LayerSwitcherComponent");
const LegendComponent_1 = __importDefault(require("./LegendComponent"));
// Component that displays just the map
class OldMapViewComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleBoundsChange = (bounds) => {
            // Ignore if readonly
            if (this.props.onDesignChange == null) {
                return;
            }
            if (this.props.zoomLocked) {
                return;
            }
            // Ignore if autoBounds
            if (this.props.design.autoBounds) {
                return;
            }
            const design = lodash_1.default.extend({}, this.props.design, { bounds });
            return this.props.onDesignChange(design);
        };
        this.handleGridClick = (layerViewId, ev) => {
            var _a, _b;
            const layerView = lodash_1.default.findWhere(this.props.design.layerViews, { id: layerViewId });
            // Create layer
            const layer = LayerFactory_1.default.createLayer(layerView.type);
            // Clean design (prevent ever displaying invalid/legacy designs)
            const design = layer.cleanDesign(layerView.design, this.props.schema);
            // Handle click of layer
            const results = layer.onGridClick(ev, {
                design,
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                layerDataSource: this.props.mapDataSource.getLayerDataSource(layerViewId),
                scopeData: ((_b = (_a = this.props.scope) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.layerViewId) === layerViewId ? this.props.scope.data.data : undefined,
                filters: this.getCompiledFilters()
            });
            if (!results) {
                return;
            }
            // Handle popup first
            if (results.popup) {
                this.setState({ popupContents: results.popup });
            }
            // Handle onRowClick case
            if (results.row && this.props.onRowClick) {
                this.props.onRowClick(results.row.tableId, results.row.primaryKey);
            }
            // Handle scoping
            if (this.props.onScopeChange && lodash_1.default.has(results, "scope")) {
                let scope;
                if (results.scope) {
                    // Encode layer view id into scope
                    scope = {
                        name: results.scope.name,
                        filter: results.scope.filter,
                        data: { layerViewId, data: results.scope.data }
                    };
                }
                else {
                    scope = null;
                }
                return this.props.onScopeChange(scope);
            }
        };
        const initialLegendDisplay = props.design.initialLegendDisplay || "open";
        this.state = {
            popupContents: null,
            legendHidden: initialLegendDisplay === "closed" || (props.width < 500 && initialLegendDisplay === "closedIfSmall")
        };
    }
    componentDidMount() {
        // Autozoom
        if (this.props.design.autoBounds) {
            return this.performAutoZoom();
        }
    }
    componentDidUpdate(prevProps) {
        var _a;
        if (this.props.design.autoBounds) {
            // Autozoom if filters or autozoom changed
            if (!lodash_1.default.isEqual(this.props.design.filters, prevProps.design.filters) ||
                !lodash_1.default.isEqual(this.props.design.globalFilters, prevProps.design.globalFilters) ||
                !lodash_1.default.isEqual(this.props.extraFilters, prevProps.extraFilters) ||
                !prevProps.design.autoBounds) {
                return this.performAutoZoom();
            }
        }
        else {
            // Update bounds
            if (!lodash_1.default.isEqual(this.props.design.bounds, prevProps.design.bounds)) {
                return (_a = this.leafletMap) === null || _a === void 0 ? void 0 : _a.setBounds(this.props.design.bounds);
            }
        }
    }
    performAutoZoom() {
        return this.props.mapDataSource.getBounds(this.props.design, this.getCompiledFilters(), (error, bounds) => {
            var _a;
            if (bounds) {
                (_a = this.leafletMap) === null || _a === void 0 ? void 0 : _a.setBounds(bounds, 0.2);
                // Also record if editable as part of bounds
                if (this.props.onDesignChange != null) {
                    return this.props.onDesignChange(lodash_1.default.extend({}, this.props.design, { bounds }));
                }
            }
        });
    }
    // Get filters from extraFilters combined with map filters
    getCompiledFilters() {
        return (this.props.extraFilters || []).concat(MapUtils.getCompiledFilters(this.props.design, this.props.schema, MapUtils.getFilterableTables(this.props.design, this.props.schema)));
    }
    renderLegend() {
        if (this.state.legendHidden) {
            return R(HiddenLegend, { onShow: () => this.setState({ legendHidden: false }) });
        }
        else {
            return R(LegendComponent_1.default, {
                schema: this.props.schema,
                layerViews: this.props.design.layerViews,
                filters: this.getCompiledFilters(),
                dataSource: this.props.dataSource,
                locale: this.context.locale,
                onHide: () => this.setState({ legendHidden: true }),
                zoom: null
            });
        }
    }
    renderPopup() {
        if (!this.state.popupContents) {
            return null;
        }
        return R(ModalPopupComponent_1.default, {
            onClose: () => this.setState({ popupContents: null }),
            showCloseX: true,
            size: "x-large"
        }, 
        // Render in fixed height div so that dashboard doesn't collapse to nothing
        R("div", { style: { height: "80vh" } }, this.state.popupContents), R("div", { style: { textAlign: "right", marginTop: 10 } }, R("button", { className: "btn btn-secondary", onClick: () => this.setState({ popupContents: null }) }, "Close")));
    }
    render() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        let design, scopedCompiledFilters;
        const compiledFilters = this.getCompiledFilters();
        // Determine scoped filters
        if (this.props.scope) {
            scopedCompiledFilters = compiledFilters.concat([this.props.scope.filter]);
        }
        else {
            scopedCompiledFilters = compiledFilters;
        }
        // Convert to leaflet layers, if layers are valid
        const leafletLayers = [];
        for (let index = 0; index < this.props.design.layerViews.length; index++) {
            // Create layer
            const layerView = this.props.design.layerViews[index];
            const layer = LayerFactory_1.default.createLayer(layerView.type);
            // Clean design (prevent ever displaying invalid/legacy designs)
            design = layer.cleanDesign(layerView.design, this.props.schema);
            // Ignore if invalid
            if (layer.validateDesign(design, this.props.schema)) {
                continue;
            }
            // Get layer data source
            const layerDataSource = this.props.mapDataSource.getLayerDataSource(layerView.id);
            // If layer is scoping, fade opacity and add extra filtered version
            const isScoping = this.props.scope && this.props.scope.data.layerViewId === layerView.id;
            // Create leafletLayer
            let leafletLayer = {
                tileUrl: layerDataSource.getTileUrl(design, isScoping ? compiledFilters : scopedCompiledFilters),
                utfGridUrl: (_a = layerDataSource.getUtfGridUrl(design, isScoping ? compiledFilters : scopedCompiledFilters)) !== null && _a !== void 0 ? _a : undefined,
                visible: layerView.visible,
                opacity: isScoping ? layerView.opacity * 0.3 : layerView.opacity,
                minZoom: (_b = layer.getMinZoom(design)) !== null && _b !== void 0 ? _b : undefined,
                maxZoom: (_c = layer.getMaxZoom(design)) !== null && _c !== void 0 ? _c : undefined,
                onGridClick: this.handleGridClick.bind(null, layerView.id)
            };
            leafletLayers.push(leafletLayer);
            // Add scoped layer if scoping
            if (isScoping) {
                leafletLayer = {
                    tileUrl: layerDataSource.getTileUrl(design, scopedCompiledFilters),
                    utfGridUrl: (_d = layerDataSource.getUtfGridUrl(design, scopedCompiledFilters)) !== null && _d !== void 0 ? _d : undefined,
                    visible: layerView.visible,
                    opacity: layerView.opacity,
                    minZoom: (_e = layer.getMinZoom(design)) !== null && _e !== void 0 ? _e : undefined,
                    maxZoom: (_f = layer.getMaxZoom(design)) !== null && _f !== void 0 ? _f : undefined,
                    onGridClick: this.handleGridClick.bind(null, layerView.id)
                };
                leafletLayers.push(leafletLayer);
            }
        }
        return R("div", { style: { width: this.props.width, height: this.props.height, position: "relative" } }, this.renderPopup(), this.props.onDesignChange && this.props.design.showLayerSwitcher
            ? R(LayerSwitcherComponent_1.LayerSwitcherComponent, {
                design: this.props.design,
                onDesignChange: this.props.onDesignChange
            })
            : undefined, R(LeafletMapComponent_1.default, {
            ref: (c) => {
                this.leafletMap = c;
            },
            initialBounds: this.props.design.bounds,
            baseLayerId: this.props.design.baseLayer,
            baseLayerOpacity: (_g = this.props.design.baseLayerOpacity) !== null && _g !== void 0 ? _g : undefined,
            layers: leafletLayers,
            width: this.props.width,
            height: this.props.height,
            legend: this.renderLegend(),
            dragging: this.props.dragging,
            touchZoom: this.props.touchZoom,
            scrollWheelZoom: this.props.scrollWheelZoom,
            onBoundsChange: this.handleBoundsChange,
            extraAttribution: this.props.design.attribution,
            loadingSpinner: true,
            maxZoom: (_h = this.props.design.maxZoom) !== null && _h !== void 0 ? _h : undefined
        }));
    }
}
exports.default = OldMapViewComponent;
OldMapViewComponent.contextTypes = { locale: prop_types_1.default.string };
// Legend display tab at bottom right
class HiddenLegend extends react_1.default.Component {
    render() {
        const style = {
            zIndex: 1000,
            backgroundColor: "white",
            position: "absolute",
            bottom: 34,
            right: 0,
            fontSize: 14,
            color: "#337ab7",
            cursor: "pointer",
            paddingTop: 4,
            paddingBottom: 3,
            paddingLeft: 3,
            paddingRight: 3,
            borderRadius: "4px 0px 0px 4px",
            border: "solid 1px #AAA",
            borderRight: "none"
        };
        return R("div", { style, onClick: this.props.onShow }, R("i", { className: "fa fa-angle-double-left" }));
    }
}
