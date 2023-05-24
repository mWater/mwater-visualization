"use strict";
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
exports.VectorMapLogo = exports.AttributionControl = exports.useThrottledMapResize = exports.mergeBaseAndUserStyle = exports.useBaseStyle = exports.useStyleMap = exports.useHoverCursor = exports.useVectorMap = exports.areVectorMapsEnabled = exports.getMapTilerApiKey = exports.setMapTilerApiKey = void 0;
const lodash_1 = __importDefault(require("lodash"));
const maplibre_gl_1 = __importDefault(require("maplibre-gl"));
const react_1 = require("react");
const mapSymbols_1 = require("./mapSymbols");
require("maplibre-gl/dist/maplibre-gl.css");
require("./VectorMapViewComponent.css");
const react_2 = __importDefault(require("react"));
/* Hooks and functions related to displaying a vector map */
let mapTilerApiKey = "";
/** This must be called to set the appropriate key before use. If it is not set, vector maps will not function.
 * Maps will fall back to leaflet if the key is not set or if set to ""
 */
function setMapTilerApiKey(key) {
    mapTilerApiKey = key;
}
exports.setMapTilerApiKey = setMapTilerApiKey;
function getMapTilerApiKey() {
    return mapTilerApiKey;
}
exports.getMapTilerApiKey = getMapTilerApiKey;
/** Check if vector maps are enabled by setting API key */
function areVectorMapsEnabled() {
    return mapTilerApiKey !== "" && window.localStorage.getItem("maptech") != "mapnik";
}
exports.areVectorMapsEnabled = areVectorMapsEnabled;
/** Loads a vector map, refreshing the WebGL context as needed */
function useVectorMap(options) {
    const { divRef, bounds, scrollZoom, dragPan, touchZoomRotate } = options;
    // Maplibre map
    const [map, setMap] = (0, react_1.useState)();
    // Tracks if map div is visible
    const [mapDivVisible, setMapDivVisible] = (0, react_1.useState)(false);
    // Tracks if map has webgl context
    const [hasWebGLContext, setHasWebGLContext] = (0, react_1.useState)(false);
    // Increments to trigger a map reload
    const [mapReloadCount, setMapReloadCount] = (0, react_1.useState)(0);
    // Observe visibility of map
    (0, react_1.useEffect)(() => {
        if (!divRef) {
            return;
        }
        const observer = new IntersectionObserver(function (entries) {
            setMapDivVisible(entries[0].isIntersecting);
        });
        observer.observe(divRef);
        return () => {
            observer.disconnect();
        };
    }, [divRef]);
    // If map div is visible, and no webgl context, trigger map load
    (0, react_1.useEffect)(() => {
        if (mapDivVisible && !hasWebGLContext) {
            setMapReloadCount(rc => rc + 1);
        }
    }, [mapDivVisible, hasWebGLContext]);
    // Load map and symbols
    (0, react_1.useEffect)(() => {
        // Don't enable if invisible
        if (!mapDivVisible || !divRef) {
            return;
        }
        const m = new maplibre_gl_1.default.Map({
            container: divRef,
            bounds: bounds,
            scrollZoom: scrollZoom === false ? false : true,
            dragPan: dragPan === false ? false : true,
            touchZoomRotate: touchZoomRotate === false ? false : true,
            attributionControl: false,
            boxZoom: false,
            style: {
                version: 8,
                layers: [],
                sources: {}
            },
            // Prevent scrolling outside of world bounds
            maxBounds: [
                [-179.9, -85],
                [179.9, 85] // Northeast coordinates
            ],
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
    return map;
}
exports.useVectorMap = useVectorMap;
/** Sets cursor as pointer when over any layers with the specified ids */
function useHoverCursor(map, layerIds) {
    // Setup hover effect
    (0, react_1.useEffect)(() => {
        if (!map) {
            return;
        }
        const removes = [];
        for (const layerId of layerIds) {
            const onEnter = (ev) => {
                map.getCanvas().style.cursor = 'pointer';
            };
            const onLeave = (ev) => {
                map.getCanvas().style.cursor = '';
            };
            map.on("mouseenter", layerId, onEnter);
            map.on("mouseleave", layerId, onLeave);
            removes.push(() => {
                map.off("mouseenter", layerId, onEnter);
                map.off("mouseleave", layerId, onLeave);
            });
        }
        return () => {
            for (const remove of removes) {
                remove();
            }
        };
    }, [map, layerIds]);
}
exports.useHoverCursor = useHoverCursor;
/** Apply user style to a map with base style */
function useStyleMap(options) {
    const { map, baseLayer, baseLayerOpacity, userStyle } = options;
    // Load base style
    const baseStyle = useBaseStyle(baseLayer);
    // Update map style
    const style = (0, react_1.useMemo)(() => {
        return mergeBaseAndUserStyle(baseStyle, userStyle, baseLayerOpacity);
    }, [baseStyle, userStyle, baseLayerOpacity]);
    // Set map style
    (0, react_1.useEffect)(() => {
        // Can't load until map and style are present
        if (!map || !style) {
            return;
        }
        map.setStyle(style);
    }, [map, style]);
}
exports.useStyleMap = useStyleMap;
/** Loads a base style for the map */
function useBaseStyle(baseLayer) {
    // Load base layer
    const [baseStyle, setBaseStyle] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        function loadStyle(styleUrl) {
            // Load style
            fetch(styleUrl)
                .then((response) => response.json())
                .then((styleData) => {
                // Set style and update layers
                setBaseStyle(styleData);
            });
        }
        if (baseLayer == "cartodb_positron") {
            loadStyle(`https://api.maptiler.com/maps/positron/style.json?key=${mapTilerApiKey}`);
        }
        else if (baseLayer == "cartodb_dark_matter") {
            loadStyle(`https://api.maptiler.com/maps/darkmatter/style.json?key=${mapTilerApiKey}`);
        }
        else if (baseLayer == "bing_road") {
            loadStyle(`https://api.maptiler.com/maps/streets/style.json?key=${mapTilerApiKey}`);
        }
        else if (baseLayer == "bing_aerial") {
            // Switched to Bing for superior aerial imagery
            loadBingBasemap("AerialWithLabels", 1).then(setBaseStyle);
            // loadStyle(`https://api.maptiler.com/maps/hybrid/style.json?key=${mapTilerApiKey}`)
        }
        else if (baseLayer == "blank") {
            setBaseStyle({
                version: 8,
                layers: [],
                sources: {}
            });
        }
    }, [baseLayer]);
    return baseStyle;
}
exports.useBaseStyle = useBaseStyle;
/** Combines a base style and a user style */
function mergeBaseAndUserStyle(baseStyle, userStyle, baseLayerOpacity) {
    // Merge until baseStyle and userStyle are present
    if (!baseStyle || !userStyle) {
        return null;
    }
    // Create background layer to simulate base layer opacity
    const baseLayerOpacityLayer = {
        id: "baseLayerOpacity",
        type: "background",
        paint: {
            "background-color": "white",
            "background-opacity": 1 - (baseLayerOpacity != null ? baseLayerOpacity : 1)
        }
    };
    // Create style
    let layers = baseStyle.layers || [];
    // Simulate base opacity
    if (baseLayerOpacity != null && baseLayerOpacity < 1) {
        layers = layers.concat([baseLayerOpacityLayer]);
    }
    layers = layers.concat(userStyle.layers || []);
    const style = Object.assign(Object.assign({}, baseStyle), { sources: Object.assign(Object.assign({}, baseStyle.sources), userStyle.sources), glyphs: baseStyle.glyphs || `https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=${mapTilerApiKey}`, layers });
    return style;
}
exports.mergeBaseAndUserStyle = mergeBaseAndUserStyle;
/** Resizes map to width and height, throttling to avoid flicker and possibly bugs in maplibre when resizing too quickly */
function useThrottledMapResize(map, width, height) {
    // Throttle resize updates to avoid flicker
    const throttledResize = (0, react_1.useMemo)(() => {
        return lodash_1.default.debounce((map) => {
            map.resize();
        }, 250, { leading: false, trailing: true });
    }, []);
    (0, react_1.useEffect)(() => {
        if (map) {
            throttledResize(map);
        }
    }, [width, height, map]);
}
exports.useThrottledMapResize = useThrottledMapResize;
function AttributionControl(props) {
    if (props.baseLayer == "blank") {
        return react_2.default.createElement("div", { className: "newmap-attribution-control" }, props.extraText ? " " + props.extraText : null);
    }
    if (props.baseLayer == "bing_aerial") {
        return (react_2.default.createElement("div", { className: "newmap-attribution-control" },
            "Copyright \u00A9 2022 Microsoft and its suppliers.",
            props.extraText ? " " + props.extraText : null));
    }
    return (react_2.default.createElement("div", { className: "newmap-attribution-control" },
        react_2.default.createElement("a", { href: "https://www.maptiler.com/copyright/", target: "_blank" }, "\u00A9 MapTiler"),
        " ",
        react_2.default.createElement("a", { href: "https://www.openstreetmap.org/about/", target: "_blank" }, "\u00A9 OpenStreetMap"),
        props.extraText ? " " + props.extraText : null));
}
exports.AttributionControl = AttributionControl;
function VectorMapLogo(props) {
    if (props.baseLayer == "blank") {
        return null;
    }
    if (props.baseLayer == "bing_aerial") {
        return react_2.default.createElement("img", { src: "https://dev.virtualearth.net/Branding/logo_powered_by.png", style: { position: "absolute", bottom: 38, left: 11, height: 22, zIndex: 1000, pointerEvents: "none" } });
    }
    return react_2.default.createElement("img", { src: require("./Maptiler-logo.png").default, style: { position: "absolute", bottom: 38, left: 11, height: 22, zIndex: 1000, pointerEvents: "none" } });
}
exports.VectorMapLogo = VectorMapLogo;
function loadBingBasemap(basemapType, opacity) {
    return __awaiter(this, void 0, void 0, function* () {
        // Load metadata
        const bingApiKey = "Ao26dWY2IC8PjorsJKFaoR85EPXCnCohrJdisCWXIULAXFo0JAXquGauppTMQbyU";
        const metadata = yield fetch(`https://dev.virtualearth.net/REST/v1/Imagery/Metadata/${basemapType}?key=${bingApiKey}`).then((response) => response.json());
        const resource = metadata.resourceSets[0].resources[0];
        return {
            sources: {
                "bing_raster": {
                    type: "raster",
                    tiles: resource.imageUrlSubdomains.map((subdomain) => resource.imageUrl.replace("{subdomain}", subdomain).replace("{culture}", "").replace("http:", "https:")),
                    tileSize: resource.imageHeight,
                }
            },
            layers: [
                {
                    id: "bing_raster",
                    type: "raster",
                    source: "bing_raster",
                    paint: {
                        "raster-opacity": opacity
                    }
                }
            ],
            version: 8
        };
    });
}
