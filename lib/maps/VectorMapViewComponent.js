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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorMapViewComponent = void 0;
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importStar(require("react"));
const react_2 = require("react");
const LayerFactory_1 = __importDefault(require("./LayerFactory"));
const ModalPopupComponent_1 = __importDefault(require("react-library/lib/ModalPopupComponent"));
const useStableCallback_1 = require("react-library/lib/useStableCallback");
const MapUtils_1 = require("./MapUtils");
require("maplibre-gl/dist/maplibre-gl.css");
require("./VectorMapViewComponent.css");
const LayerSwitcherComponent_1 = require("./LayerSwitcherComponent");
const LegendComponent_1 = __importDefault(require("./LegendComponent"));
const vectorMaps_1 = require("./vectorMaps");
/** Component that displays just the map, using vector tile technology */
function VectorMapViewComponent(props) {
    const [mapDiv, setMapDiv] = (0, react_1.useState)(null);
    /** Last published bounds, to avoid recentering when self-changed bounds */
    const boundsRef = (0, react_2.useRef)();
    /** Increments when a new user style is being generated. Indicates that
     * a change was made, so to discard current one
     */
    const userStyleIncrRef = (0, react_2.useRef)(0);
    /** Style of user layers */
    const [userStyle, setUserStyle] = (0, react_1.useState)();
    /** Busy incrementable counter. Is busy if > 0 */
    const [busy, setBusy] = (0, react_1.useState)(0);
    /** Layer click handlers to attach */
    const [layerClickHandlers, setLayerClickHandlers] = (0, react_1.useState)([]);
    /** Contents of popup if open */
    const [popupContents, setPopupContents] = (0, react_1.useState)();
    /** Date-time layers must have been created after on server. Used to support refreshing */
    const [layersCreatedAfter, setLayersCreatedAfter] = (0, react_1.useState)(new Date().toISOString());
    /** Date-time layers expire and must be recreated */
    const layersExpire = (0, react_2.useRef)();
    // State of legend
    const initialLegendDisplay = props.design.initialLegendDisplay || "open";
    const [legendHidden, setLegendHidden] = (0, react_1.useState)(initialLegendDisplay == "closed" || (props.width < 500 && initialLegendDisplay == "closedIfSmall"));
    // Load map
    const map = (0, vectorMaps_1.useVectorMap)({
        divRef: mapDiv,
        bounds: props.design.bounds
            ? [props.design.bounds.w, props.design.bounds.s, props.design.bounds.e, props.design.bounds.n]
            : undefined,
        scrollZoom: props.scrollWheelZoom,
        dragPan: props.dragging,
        touchZoomRotate: props.touchZoom,
    });
    // Pass map upwards
    if (map && props.onMapUpdate) {
        props.onMapUpdate(map);
    }
    (0, vectorMaps_1.useThrottledMapResize)(map, props.width, props.height);
    /** Handle a click on a layer */
    const handleLayerClick = (0, useStableCallback_1.useStableCallback)((layerViewId, ev) => {
        const layerView = props.design.layerViews.find((lv) => lv.id == layerViewId);
        // Create layer
        const layer = LayerFactory_1.default.createLayer(layerView.type);
        // Clean design (prevent ever displaying invalid/legacy designs)
        const design = layer.cleanDesign(layerView.design, props.schema);
        // Handle click of layer
        const results = layer.onGridClick(ev, {
            design: design,
            schema: props.schema,
            dataSource: props.dataSource,
            layerDataSource: props.mapDataSource.getLayerDataSource(layerViewId),
            scopeData: props.scope && props.scope.data && props.scope.data.layerViewId == layerViewId
                ? props.scope.data.data
                : undefined,
            filters: getCompiledFilters()
        });
        if (!results) {
            return;
        }
        // Handle popup first
        if (results.popup) {
            setPopupContents(results.popup);
        }
        // Handle onRowClick case
        if (results.row && props.onRowClick) {
            props.onRowClick(results.row.tableId, results.row.primaryKey);
        }
        // Handle scoping
        if (props.onScopeChange && lodash_1.default.has(results, "scope")) {
            let scope;
            if (results.scope) {
                // Encode layer view id into scope
                scope = {
                    name: results.scope.name,
                    filter: results.scope.filter,
                    data: { layerViewId: layerViewId, data: results.scope.data }
                };
            }
            else {
                scope = null;
            }
            props.onScopeChange(scope);
        }
    });
    // Debounced version of handleLayerClick to prevent multiple popups
    const handleLayerClickDebounced = (0, react_1.useMemo)(() => {
        return lodash_1.default.debounce(handleLayerClick, 250, { leading: true, trailing: false });
    }, [handleLayerClick]);
    /** Get filters from extraFilters combined with map filters */
    function getCompiledFilters() {
        return (props.extraFilters || []).concat((0, MapUtils_1.getCompiledFilters)(props.design, props.schema, (0, MapUtils_1.getFilterableTables)(props.design, props.schema)));
    }
    /** Determine user style */
    function updateUserStyle() {
        return __awaiter(this, void 0, void 0, function* () {
            // Determine current userStyleIncr
            userStyleIncrRef.current = userStyleIncrRef.current + 1;
            const currentUserStyleIncr = userStyleIncrRef.current;
            // Keep track of expires
            let earliestExpires = null;
            const compiledFilters = getCompiledFilters();
            // Determine scoped filters
            const scopedCompiledFilters = props.scope ? compiledFilters.concat([props.scope.filter]) : compiledFilters;
            // Sources to add
            const newSources = {};
            const newLayers = [];
            // Mapbox layers with click handlers. Each is in format
            let newClickHandlers = [];
            function addLayer(layerView, filters, opacity) {
                return __awaiter(this, void 0, void 0, function* () {
                    // TODO better way of hiding/showing layers?
                    if (!layerView.visible) {
                        return;
                    }
                    const layer = LayerFactory_1.default.createLayer(layerView.type);
                    // Clean design (prevent ever displaying invalid/legacy designs)
                    const design = layer.cleanDesign(layerView.design, props.schema);
                    // Ignore if invalid
                    if (layer.validateDesign(design, props.schema)) {
                        return;
                    }
                    const defType = layer.getLayerDefinitionType();
                    console.log(defType, layerView.type);
                    const layerDataSource = props.mapDataSource.getLayerDataSource(layerView.id);
                    if (defType == "VectorTile") {
                        // TODO attempt to re-use sources?
                        // Get source url
                        const { expires, url } = yield layerDataSource.getVectorTileUrl(design, filters, layersCreatedAfter);
                        if (!earliestExpires || expires < earliestExpires) {
                            earliestExpires = expires;
                        }
                        // Add source
                        newSources[layerView.id] = {
                            type: "vector",
                            tiles: [url]
                        };
                        // Add layer
                        const vectorTileDef = layer.getVectorTile(design, layerView.id, props.schema, filters, opacity);
                        for (const mapLayer of vectorTileDef.mapLayers) {
                            newLayers.push({ layerViewId: layerView.id, layer: mapLayer });
                        }
                        newClickHandlers =
                            vectorTileDef.mapLayersHandleClicks.map((mlid) => ({
                                layerViewId: layerView.id,
                                mapLayerId: mlid
                            })).concat(newClickHandlers);
                    }
                    else {
                        const tileUrl = props.mapDataSource.getLayerDataSource(layerView.id).getTileUrl(design, []);
                        if (tileUrl) {
                            // Replace "{s}" with "a", "b", "c"
                            let tiles = [];
                            if (tileUrl.includes("{s}")) {
                                tiles = [tileUrl.replace("{s}", "a"), tileUrl.replace("{s}", "b"), tileUrl.replace("{s}", "c")];
                            }
                            else {
                                tiles = [tileUrl];
                            }
                            newSources[layerView.id] = {
                                type: "raster",
                                tiles,
                                tileSize: 256
                            };
                            newLayers.push({
                                layerViewId: layerView.id,
                                layer: {
                                    id: layerView.id,
                                    type: "raster",
                                    source: layerView.id,
                                    paint: {
                                        "raster-opacity": opacity
                                    }
                                }
                            });
                        }
                    }
                });
            }
            setBusy((b) => b + 1);
            try {
                for (const layerView of props.design.layerViews) {
                    const isScoping = props.scope != null && props.scope.data.layerViewId == layerView.id;
                    // If layer is scoping, fade opacity and add extra filtered version
                    yield addLayer(layerView, isScoping ? compiledFilters : scopedCompiledFilters, isScoping ? layerView.opacity * 0.3 : layerView.opacity);
                    if (isScoping) {
                        yield addLayer(layerView, scopedCompiledFilters, layerView.opacity);
                    }
                }
                // If incremented, abort update, as is stale
                if (userStyleIncrRef.current != currentUserStyleIncr) {
                    return;
                }
                // Save expires
                if (earliestExpires) {
                    layersExpire.current = earliestExpires;
                }
                setLayerClickHandlers(newClickHandlers);
                setUserStyle({
                    version: 8,
                    sources: newSources,
                    layers: newLayers.map((nl) => nl.layer)
                });
            }
            finally {
                setBusy((b) => b - 1);
            }
        });
    }
    // Refresh periodically
    (0, react_1.useEffect)(() => {
        const interval = setInterval(() => {
            // If expired
            if (layersExpire.current && new Date().toISOString() > layersExpire.current) {
                // Set created after to now to force refresh
                setLayersCreatedAfter(new Date().toISOString());
                layersExpire.current = undefined;
            }
        }, 5 * 60 * 1000);
        return () => {
            clearInterval(interval);
        };
    });
    // Update user layers
    (0, react_1.useEffect)(() => {
        updateUserStyle();
    }, [props.design.layerViews, props.scope, layersCreatedAfter, props.extraFilters, props.design.filters, props.design.globalFilters, props.refreshTrigger]);
    // Style map
    (0, vectorMaps_1.useStyleMap)({
        map,
        userStyle,
        baseLayer: props.design.baseLayer,
        baseLayerOpacity: props.design.baseLayerOpacity,
    });
    // Setup click handlers
    (0, react_1.useEffect)(() => {
        if (!map) {
            return;
        }
        const removes = [];
        for (const clickHandler of layerClickHandlers) {
            const onClick = (ev) => {
                if (ev.features && ev.features[0]) {
                    handleLayerClickDebounced(clickHandler.layerViewId, {
                        data: ev.features[0].properties,
                        event: ev
                    });
                }
            };
            map.on("click", clickHandler.mapLayerId, onClick);
            removes.push(() => {
                map.off("click", clickHandler.mapLayerId, onClick);
            });
        }
        return () => {
            for (const remove of removes) {
                remove();
            }
        };
    }, [map, layerClickHandlers]);
    // Get user style layer ids
    const userLayerIds = (0, react_1.useMemo)(() => {
        if (!userStyle) {
            return [];
        }
        return userStyle.layers.map((l) => l.id);
    }, [userStyle]);
    // Setup hover effect
    (0, vectorMaps_1.useHoverCursor)(map, userLayerIds);
    // Capture movements on map to update bounds
    (0, react_1.useEffect)(() => {
        if (!map) {
            return;
        }
        function onMoveEnd() {
            // Ignore if readonly
            if (props.onDesignChange == null) {
                return;
            }
            if (props.zoomLocked) {
                return;
            }
            // Ignore if autoBounds
            if (props.design.autoBounds) {
                return;
            }
            const bounds = map.getBounds();
            const mapBounds = { n: bounds.getNorth(), e: bounds.getEast(), s: bounds.getSouth(), w: bounds.getWest() };
            const design = Object.assign(Object.assign({}, props.design), { bounds: mapBounds });
            // Record bounds to prevent repeated application
            boundsRef.current = mapBounds;
            props.onDesignChange(design);
        }
        map.on("moveend", onMoveEnd);
        return () => {
            map.off("moveend", onMoveEnd);
        };
    }, [props.onDesignChange, props.zoomLocked, props.design, map]);
    function performAutoZoom() {
        setBusy((b) => b + 1);
        props.mapDataSource.getBounds(props.design, getCompiledFilters(), (error, bounds) => {
            setBusy((b) => b - 1);
            if (bounds) {
                map.fitBounds([bounds.w, bounds.s, bounds.e, bounds.n], { padding: 20 });
                // Also record if editable as part of bounds
                if (props.onDesignChange) {
                    props.onDesignChange(Object.assign(Object.assign({}, props.design), { bounds }));
                }
            }
        });
    }
    // Autozoom if autozoom changed
    (0, react_1.useEffect)(() => {
        if (!map) {
            return;
        }
        // Autozoom
        if (props.design.autoBounds) {
            performAutoZoom();
        }
    }, [map, props.extraFilters, props.design.autoBounds]);
    // Set initial bounds
    (0, react_1.useEffect)(() => {
        if (!map) {
            return;
        }
        if (!props.design.autoBounds && props.design.bounds) {
            // If we set the new bounds, do not update map bounds
            if (boundsRef.current == null ||
                props.design.bounds.n != boundsRef.current.n ||
                props.design.bounds.e != boundsRef.current.e ||
                props.design.bounds.s != boundsRef.current.s ||
                props.design.bounds.w != boundsRef.current.w) {
                map.fitBounds([props.design.bounds.w, props.design.bounds.s, props.design.bounds.e, props.design.bounds.n]);
            }
        }
    }, [map, props.design.autoBounds, props.design.bounds]);
    // Update max zoom
    (0, react_1.useEffect)(() => {
        if (map) {
            map.setMaxZoom(props.design.maxZoom != null ? props.design.maxZoom : undefined);
        }
    }, [map, props.design.maxZoom]);
    function renderPopup() {
        if (!popupContents) {
            return null;
        }
        return (react_1.default.createElement(ModalPopupComponent_1.default, { onClose: () => setPopupContents(null), showCloseX: true, size: "x-large" },
            react_1.default.createElement("div", { style: { height: "80vh" } }, popupContents),
            react_1.default.createElement("div", { style: { textAlign: "right", marginTop: 10 } },
                react_1.default.createElement("button", { className: "btn btn-secondary", onClick: () => setPopupContents(null) }, "Close"))));
    }
    const [zoom, setZoom] = (0, react_1.useState)(map === null || map === void 0 ? void 0 : map.getZoom());
    (0, react_1.useEffect)(() => {
        const handleZoom = () => setZoom(map === null || map === void 0 ? void 0 : map.getZoom());
        if (map) {
            map.on('zoomend', handleZoom);
        }
        return () => {
            map === null || map === void 0 ? void 0 : map.off('zoomend', handleZoom);
        };
    }, [map]);
    function renderLegend() {
        if (legendHidden) {
            return react_1.default.createElement(HiddenLegend, { onShow: () => setLegendHidden(false) });
        }
        else {
            return (react_1.default.createElement(LegendComponent_1.default, { schema: props.schema, layerViews: props.design.layerViews, filters: getCompiledFilters(), zoom: map ? map.getZoom() : null, dataSource: props.dataSource, locale: props.locale, onHide: () => setLegendHidden(true) }));
        }
    }
    /** Render a spinner if loading */
    function renderBusy() {
        if (busy == 0) {
            return null;
        }
        return (react_1.default.createElement("div", { key: "busy", style: {
                position: "absolute",
                top: 100,
                left: 9,
                backgroundColor: "white",
                border: "solid 1px #CCC",
                padding: 7,
                borderRadius: 5
            } },
            react_1.default.createElement("i", { className: "fa fa-spinner fa-spin" })));
    }
    // Overflow hidden because of problem of exceeding div
    return (react_1.default.createElement("div", { style: { width: props.width, height: props.height, position: "relative" } },
        renderPopup(),
        props.onDesignChange != null && props.design.showLayerSwitcher ? (react_1.default.createElement(LayerSwitcherComponent_1.LayerSwitcherComponent, { design: props.design, onDesignChange: props.onDesignChange })) : null,
        react_1.default.createElement("div", { style: { width: props.width, height: props.height }, ref: setMapDiv }),
        renderLegend(),
        renderBusy(),
        react_1.default.createElement(vectorMaps_1.AttributionControl, { baseLayer: props.design.baseLayer, extraText: props.design.attribution }),
        react_1.default.createElement(vectorMaps_1.VectorMapLogo, { baseLayer: props.design.baseLayer })));
}
exports.VectorMapViewComponent = VectorMapViewComponent;
/** Legend display tab at bottom right */
function HiddenLegend(props) {
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
    return (react_1.default.createElement("div", { style: style, onClick: props.onShow },
        react_1.default.createElement("i", { className: "fa fa-angle-double-left" })));
}
