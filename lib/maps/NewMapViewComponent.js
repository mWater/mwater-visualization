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
exports.NewMapViewComponent = void 0;
const lodash_1 = __importDefault(require("lodash"));
const maplibre_gl_1 = __importDefault(require("maplibre-gl"));
const react_1 = __importStar(require("react"));
const react_2 = require("react");
const LayerFactory_1 = __importDefault(require("./LayerFactory"));
const mapSymbols_1 = require("./mapSymbols");
const ModalPopupComponent_1 = __importDefault(require("react-library/lib/ModalPopupComponent"));
const MapUtils_1 = require("./MapUtils");
require("maplibre-gl/dist/maplibre-gl.css");
require("./NewMapViewComponent.css");
const LayerSwitcherComponent_1 = require("./LayerSwitcherComponent");
const LegendComponent_1 = __importDefault(require("./LegendComponent"));
/** Component that displays just the map */
function NewMapViewComponent(props) {
    const [map, setMap] = react_1.useState();
    const divRef = react_2.useRef(null);
    // Tracks if map div is visible
    const [mapDivVisible, setMapDivVisible] = react_1.useState(false);
    // Tracks if map has webgl context
    const [hasWebGLContext, setHasWebGLContext] = react_1.useState(false);
    // Increments to trigger a map reload
    const [mapReloadCount, setMapReloadCount] = react_1.useState(0);
    /** Last published bounds, to avoid recentering when self-changed bounds */
    const boundsRef = react_2.useRef();
    /** Increments when a new user style is being generated. Indicates that
     * a change was made, so to discard current one
     */
    const userStyleIncrRef = react_2.useRef(0);
    /** Style of the base layer */
    const [baseStyle, setBaseStyle] = react_1.useState();
    /** Style of user layers */
    const [userStyle, setUserStyle] = react_1.useState();
    /** Busy incrementable counter. Is busy if > 0 */
    const [busy, setBusy] = react_1.useState(0);
    /** Layer click handlers to attach */
    const [layerClickHandlers, setLayerClickHandlers] = react_1.useState([]);
    /** Contents of popup if open */
    const [popupContents, setPopupContents] = react_1.useState();
    /** Date-time layers must have been created after on server. Used to support refreshing */
    const [layersCreatedAfter, setLayersCreatedAfter] = react_1.useState(new Date().toISOString());
    /** Date-time layers expire and must be recreated */
    const layersExpire = react_2.useRef();
    // State of legend
    const initialLegendDisplay = props.design.initialLegendDisplay || "open";
    const [legendHidden, setLegendHidden] = react_1.useState(initialLegendDisplay == "closed" || (props.width < 500 && initialLegendDisplay == "closedIfSmall"));
    // Store handleClick function in a ref
    const handleLayerClickRef = react_2.useRef();
    /** Handle a click on a layer */
    function handleLayerClick(layerViewId, ev) {
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
    }
    // Store most up-to-date handleClick function in a ref
    handleLayerClickRef.current = handleLayerClick;
    /** Get filters from extraFilters combined with map filters */
    function getCompiledFilters() {
        return (props.extraFilters || []).concat(MapUtils_1.getCompiledFilters(props.design, props.schema, MapUtils_1.getFilterableTables(props.design, props.schema)));
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
                        newClickHandlers = newClickHandlers.concat(vectorTileDef.mapLayersHandleClicks.map((mlid) => ({
                            layerViewId: layerView.id,
                            mapLayerId: mlid
                        })));
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
    react_1.useEffect(() => {
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
    // Observe visibility of map
    react_1.useEffect(() => {
        if (!divRef.current) {
            return;
        }
        const observer = new IntersectionObserver(function (entries) {
            setMapDivVisible(entries[0].isIntersecting);
        });
        observer.observe(divRef.current);
        return () => {
            observer.disconnect();
        };
    }, []);
    // If map div is visible, and no webgl context, trigger map load
    react_1.useEffect(() => {
        if (mapDivVisible && !hasWebGLContext) {
            setMapReloadCount(rc => rc + 1);
        }
    }, [mapDivVisible, hasWebGLContext]);
    // Load map and symbols
    react_1.useEffect(() => {
        // Don't enable if invisible
        if (!mapDivVisible) {
            return;
        }
        const m = new maplibre_gl_1.default.Map({
            container: divRef.current,
            bounds: props.design.bounds
                ? [props.design.bounds.w, props.design.bounds.s, props.design.bounds.e, props.design.bounds.n]
                : undefined,
            scrollZoom: props.scrollWheelZoom === false ? false : true,
            dragPan: props.dragging === false ? false : true,
            touchZoomRotate: props.touchZoom === false ? false : true,
            attributionControl: false,
            boxZoom: false,
            style: {
                version: 8,
                layers: [],
                sources: {}
            }
        });
        setHasWebGLContext(true);
        // Add listener for losing context
        m.on("webglcontextlost", () => {
            console.warn("Lost WebGL context");
            setHasWebGLContext(false);
        });
        // Add zoom controls to the map.
        m.addControl(new maplibre_gl_1.default.NavigationControl({}), "top-left");
        // Add scale control
        const scale = new maplibre_gl_1.default.ScaleControl({
            unit: "metric"
        });
        m.addControl(scale);
        // Speed up wheel scrolling
        m.scrollZoom.setWheelZoomRate(1 / 250);
        // Dynamically load symbols
        m.on("styleimagemissing", function (ev) {
            // Check if known
            const mapSymbol = mapSymbols_1.mapSymbols.find((s) => s.value == ev.id);
            if (mapSymbol) {
                m.loadImage(mapSymbol.url, (err, image) => {
                    if (image && !m.hasImage(mapSymbol.value)) {
                        m.addImage(mapSymbol.value, image, { sdf: true });
                    }
                });
            }
        });
        setMap(m);
        return () => {
            m.remove();
            setHasWebGLContext(false);
        };
    }, [mapReloadCount]);
    // Load base layer
    react_1.useEffect(() => {
        if (!map) {
            return;
        }
        function loadStyle(styleUrl) {
            // Load style
            fetch(styleUrl)
                .then((response) => response.json())
                .then((styleData) => {
                // Set style and update layers
                setBaseStyle(styleData);
            });
        }
        if (props.design.baseLayer == "cartodb_positron") {
            loadStyle("https://api.maptiler.com/maps/positron/style.json?key=wXgjrSOKxcDdRfpMMNYl");
        }
        else if (props.design.baseLayer == "cartodb_dark_matter") {
            loadStyle("https://api.maptiler.com/maps/darkmatter/style.json?key=wXgjrSOKxcDdRfpMMNYl");
        }
        else if (props.design.baseLayer == "bing_road") {
            loadStyle("https://api.maptiler.com/maps/streets/style.json?key=wXgjrSOKxcDdRfpMMNYl");
        }
        else if (props.design.baseLayer == "bing_aerial") {
            loadStyle("https://api.maptiler.com/maps/hybrid/style.json?key=wXgjrSOKxcDdRfpMMNYl");
        }
        else if (props.design.baseLayer == "blank") {
            setBaseStyle({
                version: 8,
                layers: [],
                sources: {}
            });
        }
    }, [map, props.design.baseLayer]);
    // Update user layers
    react_1.useEffect(() => {
        updateUserStyle();
    }, [props.design.layerViews, props.scope, baseStyle, layersCreatedAfter, props.extraFilters, props.design.filters, props.design.globalFilters]);
    // Update map style
    react_1.useEffect(() => {
        // Can't load until map, baseStyle and userStyle are present
        if (!map || !baseStyle || !userStyle) {
            return;
        }
        // Create background layer to simulate base layer opacity
        const baseLayerOpacityLayer = {
            id: "baseLayerOpacity",
            type: "background",
            paint: {
                "background-color": "white",
                "background-opacity": 1 - (props.design.baseLayerOpacity != null ? props.design.baseLayerOpacity : 1)
            }
        };
        // Create style
        let layers = baseStyle.layers || [];
        // Simulate base opacity
        if (props.design.baseLayerOpacity != null && props.design.baseLayerOpacity < 1) {
            layers = layers.concat([baseLayerOpacityLayer]);
        }
        layers = layers.concat(userStyle.layers || []);
        const style = Object.assign(Object.assign({}, baseStyle), { sources: Object.assign(Object.assign({}, baseStyle.sources), userStyle.sources), glyphs: baseStyle.glyphs || "https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=wXgjrSOKxcDdRfpMMNYl", layers });
        map.setStyle(style);
    }, [map, baseStyle, userStyle, props.design.baseLayerOpacity]);
    // Setup click handlers
    react_1.useEffect(() => {
        if (!map) {
            return;
        }
        const removes = [];
        for (const clickHandler of layerClickHandlers) {
            const onClick = (ev) => {
                if (ev.features && ev.features[0]) {
                    handleLayerClickRef.current(clickHandler.layerViewId, {
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
    // Setup hover effect
    react_1.useEffect(() => {
        if (!map || !userStyle) {
            return;
        }
        const removes = [];
        for (const layer of userStyle.layers) {
            const onEnter = (ev) => {
                map.getCanvas().style.cursor = 'pointer';
            };
            const onLeave = (ev) => {
                map.getCanvas().style.cursor = '';
            };
            map.on("mouseenter", layer.id, onEnter);
            map.on("mouseleave", layer.id, onLeave);
            removes.push(() => {
                map.off("mouseenter", layer.id, onEnter);
                map.off("mouseleave", layer.id, onLeave);
            });
        }
        return () => {
            for (const remove of removes) {
                remove();
            }
        };
    }, [map, userStyle]);
    // Capture movements on map to update bounds
    react_1.useEffect(() => {
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
        props.mapDataSource.getBounds(props.design, getCompiledFilters(), (error, bounds) => {
            if (bounds) {
                map.fitBounds([bounds.w, bounds.s, bounds.e, bounds.n], { padding: 20 });
                // Also record if editable as part of bounds
                if (props.onDesignChange) {
                    props.onDesignChange(Object.assign(Object.assign({}, props.design), { bounds }));
                }
            }
        });
    }
    // Autozoom if filters or autozoom changed
    react_1.useEffect(() => {
        if (!map) {
            return;
        }
        // Autozoom
        if (props.design.autoBounds) {
            performAutoZoom();
        }
    }, [map, props.design.filters, props.design.globalFilters, props.extraFilters, props.design.autoBounds]);
    // Set initial bounds
    react_1.useEffect(() => {
        if (!map) {
            return;
        }
        if (!props.design.autoBounds && props.design.bounds) {
            // If we set the new bounds, do not update map bounds
            if (props.design.bounds != boundsRef.current) {
                map.fitBounds([props.design.bounds.w, props.design.bounds.s, props.design.bounds.e, props.design.bounds.n]);
            }
        }
    }, [map, props.design.autoBounds, props.design.bounds]);
    // Update max zoom
    react_1.useEffect(() => {
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
        react_1.default.createElement("div", { style: { width: props.width, height: props.height }, ref: divRef }),
        renderLegend(),
        renderBusy(),
        react_1.default.createElement(AttributionControl, { extraText: props.design.attribution }),
        react_1.default.createElement(MapTilerLogo, null)));
}
exports.NewMapViewComponent = NewMapViewComponent;
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
function AttributionControl(props) {
    return (react_1.default.createElement("div", { className: "newmap-attribution-control" },
        react_1.default.createElement("a", { href: "https://www.maptiler.com/copyright/", target: "_blank" }, "\u00A9 MapTiler"),
        " ",
        react_1.default.createElement("a", { href: "http://www.openstreetmap.org/about/", target: "_blank" }, "\u00A9 OpenStreetMap"),
        props.extraText ? " " + props.extraText : null));
}
function MapTilerLogo(props) {
    return react_1.default.createElement("img", { src: require("./Maptiler-logo.png").default, style: { position: "absolute", bottom: 38, left: 11, height: 22, zIndex: 1000, pointerEvents: "none" } });
}
