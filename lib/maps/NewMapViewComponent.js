"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewMapViewComponent = void 0;
var lodash_1 = __importDefault(require("lodash"));
var mapbox_gl_1 = __importDefault(require("mapbox-gl"));
var react_1 = __importStar(require("react"));
var react_2 = require("react");
var LayerFactory_1 = __importDefault(require("./LayerFactory"));
var mapSymbols_1 = require("./mapSymbols");
var ModalPopupComponent_1 = __importDefault(require("react-library/lib/ModalPopupComponent"));
var MapUtils_1 = require("./MapUtils");
require("mapbox-gl/dist/mapbox-gl.css");
var LayerSwitcherComponent_1 = require("./LayerSwitcherComponent");
var LegendComponent_1 = __importDefault(require("./LegendComponent"));
/** Component that displays just the map */
function NewMapViewComponent(props) {
    var _a = react_1.useState(), map = _a[0], setMap = _a[1];
    var divRef = react_2.useRef(null);
    /** Increments when a new user style is being generated. Indicates that
     * a change was made, so to discard current one
     */
    var userStyleIncrRef = react_2.useRef(0);
    /** Style of the base layer */
    var _b = react_1.useState(), baseStyle = _b[0], setBaseStyle = _b[1];
    /** Style of user layers */
    var _c = react_1.useState(), userStyle = _c[0], setUserStyle = _c[1];
    /** Busy incrementable counter. Is busy if > 0 */
    var _d = react_1.useState(0), busy = _d[0], setBusy = _d[1];
    /** Layer click handlers to attach */
    var _e = react_1.useState([]), layerClickHandlers = _e[0], setLayerClickHandlers = _e[1];
    /** Contents of popup if open */
    var _f = react_1.useState(), popupContents = _f[0], setPopupContents = _f[1];
    /** Date-time layers must have been created after on server. Used to support refreshing */
    var _g = react_1.useState(new Date().toISOString()), layersCreatedAfter = _g[0], setLayersCreatedAfter = _g[1];
    /** Date-time layers expire and must be recreated */
    var layersExpire = react_2.useRef();
    // State of legend
    var initialLegendDisplay = props.design.initialLegendDisplay || "open";
    var _h = react_1.useState(initialLegendDisplay == "closed" || (props.width < 500 && initialLegendDisplay == "closedIfSmall")), legendHidden = _h[0], setLegendHidden = _h[1];
    // Store handleClick function in a ref
    var handleLayerClickRef = react_2.useRef();
    /** Handle a click on a layer */
    function handleLayerClick(layerViewId, ev) {
        var layerView = props.design.layerViews.find(function (lv) { return lv.id == layerViewId; });
        // Create layer
        var layer = LayerFactory_1.default.createLayer(layerView.type);
        // Clean design (prevent ever displaying invalid/legacy designs)
        var design = layer.cleanDesign(layerView.design, props.schema);
        // Handle click of layer
        var results = layer.onGridClick(ev, {
            design: design,
            schema: props.schema,
            dataSource: props.dataSource,
            layerDataSource: props.mapDataSource.getLayerDataSource(layerViewId),
            scopeData: (props.scope && props.scope.data && props.scope.data.layerViewId == layerViewId) ? props.scope.data.data : undefined,
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
            var scope = void 0;
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
        return __awaiter(this, void 0, void 0, function () {
            function addLayer(layerView, filters, opacity) {
                return __awaiter(this, void 0, void 0, function () {
                    var layer, design, defType, layerDataSource, _a, expires, url, vectorTileDef, _i, _b, mapLayer, tileUrl;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                // TODO better way of hiding/showing layers?
                                if (!layerView.visible) {
                                    return [2 /*return*/];
                                }
                                layer = LayerFactory_1.default.createLayer(layerView.type);
                                design = layer.cleanDesign(layerView.design, props.schema);
                                // Ignore if invalid
                                if (layer.validateDesign(design, props.schema)) {
                                    return [2 /*return*/];
                                }
                                defType = layer.getLayerDefinitionType();
                                layerDataSource = props.mapDataSource.getLayerDataSource(layerView.id);
                                if (!(defType == "VectorTile")) return [3 /*break*/, 2];
                                return [4 /*yield*/, layerDataSource.getVectorTileUrl(layerView.design, filters, layersCreatedAfter)];
                            case 1:
                                _a = _c.sent(), expires = _a.expires, url = _a.url;
                                if (!earliestExpires || expires < earliestExpires) {
                                    earliestExpires = expires;
                                }
                                // Add source
                                newSources[layerView.id] = {
                                    type: "vector",
                                    tiles: [url]
                                };
                                vectorTileDef = layer.getVectorTile(layerView.design, layerView.id, props.schema, filters, opacity);
                                for (_i = 0, _b = vectorTileDef.mapLayers; _i < _b.length; _i++) {
                                    mapLayer = _b[_i];
                                    newLayers.push({ layerViewId: layerView.id, layer: mapLayer });
                                }
                                newClickHandlers = newClickHandlers.concat(vectorTileDef.mapLayersHandleClicks.map(function (mlid) { return ({ layerViewId: layerView.id, mapLayerId: mlid }); }));
                                return [3 /*break*/, 3];
                            case 2:
                                tileUrl = props.mapDataSource.getLayerDataSource(layerView.id).getTileUrl(layerView.design, []);
                                if (tileUrl) {
                                    newSources[layerView.id] = {
                                        type: "raster",
                                        tiles: [tileUrl]
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
                                _c.label = 3;
                            case 3: return [2 /*return*/];
                        }
                    });
                });
            }
            var currentUserStyleIncr, earliestExpires, compiledFilters, scopedCompiledFilters, newSources, newLayers, newClickHandlers, _i, _a, layerView, isScoping;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // Determine current userStyleIncr
                        userStyleIncrRef.current = userStyleIncrRef.current + 1;
                        currentUserStyleIncr = userStyleIncrRef.current;
                        earliestExpires = null;
                        compiledFilters = getCompiledFilters();
                        scopedCompiledFilters = props.scope ? compiledFilters.concat([props.scope.filter]) : compiledFilters;
                        newSources = {};
                        newLayers = [];
                        newClickHandlers = [];
                        setBusy(function (b) { return b + 1; });
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, , 7, 8]);
                        _i = 0, _a = props.design.layerViews;
                        _b.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        layerView = _a[_i];
                        isScoping = props.scope != null && props.scope.data.layerViewId == layerView.id;
                        // If layer is scoping, fade opacity and add extra filtered version
                        return [4 /*yield*/, addLayer(layerView, isScoping ? compiledFilters : scopedCompiledFilters, isScoping ? layerView.opacity * 0.3 : layerView.opacity)];
                    case 3:
                        // If layer is scoping, fade opacity and add extra filtered version
                        _b.sent();
                        if (!isScoping) return [3 /*break*/, 5];
                        return [4 /*yield*/, addLayer(layerView, scopedCompiledFilters, layerView.opacity)];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 2];
                    case 6:
                        // If incremented, abort update, as is stale
                        if (userStyleIncrRef.current != currentUserStyleIncr) {
                            return [2 /*return*/];
                        }
                        // Save expires
                        if (earliestExpires) {
                            layersExpire.current = earliestExpires;
                        }
                        setLayerClickHandlers(newClickHandlers);
                        setUserStyle({
                            version: 8,
                            sources: newSources,
                            layers: newLayers.map(function (nl) { return nl.layer; })
                        });
                        return [3 /*break*/, 8];
                    case 7:
                        setBusy(function (b) { return b - 1; });
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    }
    // Refresh periodically
    react_1.useEffect(function () {
        var interval = setInterval(function () {
            // If expired
            if (layersExpire.current && new Date().toISOString() > layersExpire.current) {
                // Set created after to now to force refresh
                setLayersCreatedAfter(new Date().toISOString());
                layersExpire.current = undefined;
            }
        }, 5 * 60 * 1000);
        return function () {
            clearInterval(interval);
        };
    });
    // Load map and symbols
    react_1.useEffect(function () {
        var m = new mapbox_gl_1.default.Map({
            container: divRef.current,
            accessToken: "pk.eyJ1IjoiY2xheXRvbmdyYXNzaWNrIiwiYSI6ImNpcHk4MHMxZDB5NHVma20ya3k1dnp3bzQifQ.lMMb60WxiYfRF0V4Y3UTbQ",
            bounds: props.design.bounds ? [props.design.bounds.w, props.design.bounds.s, props.design.bounds.e, props.design.bounds.n] : undefined,
            scrollZoom: props.scrollWheelZoom === false ? false : true,
            dragPan: props.dragging === false ? false : true,
            touchZoomRotate: props.touchZoom === false ? false : true
        });
        // Add zoom controls to the map.
        m.addControl(new mapbox_gl_1.default.NavigationControl({}), "top-left");
        // Speed up wheel scrolling
        m.scrollZoom.setWheelZoomRate(1 / 250);
        // Dynamically load symbols
        m.on("styleimagemissing", function (ev) {
            // Check if known
            var mapSymbol = mapSymbols_1.mapSymbols.find(function (s) { return s.value == ev.id; });
            if (mapSymbol) {
                m.loadImage(mapSymbol.url, function (err, image) {
                    if (image) {
                        m.addImage(mapSymbol.value, image, { sdf: true });
                    }
                });
            }
        });
        setMap(m);
        return function () {
            m.remove();
        };
    }, []);
    // Load base layer
    react_1.useEffect(function () {
        if (!map) {
            return;
        }
        var style;
        if (props.design.baseLayer == "cartodb_positron") {
            style = 'light-v10';
        }
        else if (props.design.baseLayer == "cartodb_dark_matter") {
            style = 'dark-v10';
        }
        else if (props.design.baseLayer == "bing_road") {
            style = 'streets-v11';
        }
        else if (props.design.baseLayer == "bing_aerial") {
            style = 'satellite-streets-v11';
        }
        if (!style) {
            setBaseStyle({
                version: 8,
                layers: [],
                sources: {}
            });
            return;
        }
        // Load style
        var styleUrl = "https://api.mapbox.com/styles/v1/mapbox/" + style + "?access_token=pk.eyJ1IjoiY2xheXRvbmdyYXNzaWNrIiwiYSI6ImNpcHk4MHMxZDB5NHVma20ya3k1dnp3bzQifQ.lMMb60WxiYfRF0V4Y3UTbQ";
        fetch(styleUrl).then(function (response) { return response.json(); }).then(function (styleData) {
            // Set style and update layers
            setBaseStyle(styleData);
        });
    }, [map, props.design.baseLayer]);
    // Update user layers
    react_1.useEffect(function () {
        updateUserStyle();
    }, [props.design.layerViews, props.scope, baseStyle, layersCreatedAfter]);
    // Update map style
    react_1.useEffect(function () {
        // Can't load until map, baseStyle and userStyle are present
        if (!map || !baseStyle || !userStyle) {
            return;
        }
        // Create background layer to simulate base layer opacity
        var baseLayerOpacityLayer = {
            id: "baseLayerOpacity",
            type: "background",
            paint: {
                "background-color": "white",
                "background-opacity": 1 - (props.design.baseLayerOpacity != null ? props.design.baseLayerOpacity : 1)
            }
        };
        // Create style
        var layers = baseStyle.layers || [];
        // Simulate base opacity
        if (props.design.baseLayerOpacity != null && props.design.baseLayerOpacity < 1) {
            layers = layers.concat([baseLayerOpacityLayer]);
        }
        layers = layers.concat(userStyle.layers || []);
        var style = __assign(__assign({}, baseStyle), { sources: __assign(__assign({}, baseStyle.sources), userStyle.sources), layers: layers });
        map.setStyle(style);
    }, [map, baseStyle, userStyle, props.design.baseLayerOpacity]);
    // Setup click handlers
    react_1.useEffect(function () {
        if (!map) {
            return;
        }
        var removes = [];
        var _loop_1 = function (clickHandler) {
            var onClick = function (ev) {
                if (ev.features && ev.features[0]) {
                    handleLayerClickRef.current(clickHandler.layerViewId, {
                        data: ev.features[0].properties,
                        event: ev
                    });
                }
            };
            map.on("click", clickHandler.mapLayerId, onClick);
            removes.push(function () { map.off("click", clickHandler.mapLayerId, onClick); });
        };
        for (var _i = 0, layerClickHandlers_1 = layerClickHandlers; _i < layerClickHandlers_1.length; _i++) {
            var clickHandler = layerClickHandlers_1[_i];
            _loop_1(clickHandler);
        }
        return function () {
            for (var _i = 0, removes_1 = removes; _i < removes_1.length; _i++) {
                var remove = removes_1[_i];
                remove();
            }
        };
    }, [map, layerClickHandlers]);
    // Capture movements on map to update bounds
    react_1.useEffect(function () {
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
            var bounds = map.getBounds();
            var design = __assign(__assign({}, props.design), { bounds: { n: bounds.getNorth(), e: bounds.getEast(), s: bounds.getSouth(), w: bounds.getWest() } });
            props.onDesignChange(design);
        }
        map.on("moveend", onMoveEnd);
        return function () { map.off("moveend", onMoveEnd); };
    }, [props.onDesignChange, props.zoomLocked, props.design, map]);
    function performAutoZoom() {
        props.mapDataSource.getBounds(props.design, getCompiledFilters(), function (error, bounds) {
            if (bounds) {
                map.fitBounds([bounds.w, bounds.s, bounds.e, bounds.n], { padding: 20 });
                // Also record if editable as part of bounds
                if (props.onDesignChange) {
                    props.onDesignChange(__assign(__assign({}, props.design), { bounds: bounds }));
                }
            }
        });
    }
    // Autozoom if filters or autozoom changed
    react_1.useEffect(function () {
        if (!map) {
            return;
        }
        // Autozoom
        if (props.design.autoBounds) {
            performAutoZoom();
        }
    }, [map, props.design.filters, props.design.globalFilters, props.extraFilters, props.design.autoBounds]);
    // Set initial bounds
    react_1.useEffect(function () {
        if (!map) {
            return;
        }
        if (!props.design.autoBounds && props.design.bounds) {
            map.fitBounds([props.design.bounds.w, props.design.bounds.s, props.design.bounds.e, props.design.bounds.n]);
        }
    }, [map]);
    // Update max zoom
    react_1.useEffect(function () {
        if (map) {
            map.setMaxZoom(props.design.maxZoom != null ? props.design.maxZoom : undefined);
        }
    }, [map, props.design.maxZoom]);
    function renderPopup() {
        if (!popupContents) {
            return null;
        }
        return react_1.default.createElement(ModalPopupComponent_1.default, { onClose: function () { return setPopupContents(null); }, showCloseX: true, size: "large" },
            react_1.default.createElement("div", { style: { height: "80vh" } }, popupContents),
            react_1.default.createElement("div", { style: { textAlign: "right", marginTop: 10 } },
                react_1.default.createElement("button", { className: "btn btn-default", onClick: function () { return setPopupContents(null); } }, "Close")));
    }
    function renderLegend() {
        if (legendHidden) {
            return react_1.default.createElement(HiddenLegend, { onShow: function () { return setLegendHidden(false); } });
        }
        else {
            return react_1.default.createElement(LegendComponent_1.default, { schema: props.schema, layerViews: props.design.layerViews, filters: getCompiledFilters(), zoom: map ? map.getZoom() : null, dataSource: props.dataSource, locale: props.locale, onHide: function () { return setLegendHidden(true); } });
        }
    }
    /** Render a spinner if loading */
    function renderBusy() {
        if (busy == 0) {
            return null;
        }
        return react_1.default.createElement("div", { key: "busy", style: {
                position: "absolute",
                top: 80,
                left: 9,
                backgroundColor: "white",
                border: "solid 1px #CCC",
                padding: 7,
                borderRadius: 5
            } },
            react_1.default.createElement("i", { className: "fa fa-spinner fa-spin" }));
    }
    // Overflow hidden because of problem of exceeding div
    return react_1.default.createElement("div", { style: { width: props.width, height: props.height, position: "relative" } },
        renderPopup(),
        props.onDesignChange != null && props.design.showLayerSwitcher ?
            react_1.default.createElement(LayerSwitcherComponent_1.LayerSwitcherComponent, { design: props.design, onDesignChange: props.onDesignChange })
            : null,
        react_1.default.createElement("div", { style: { width: props.width, height: props.height }, ref: divRef }),
        renderLegend(),
        renderBusy());
}
exports.NewMapViewComponent = NewMapViewComponent;
/** Legend display tab at bottom right */
function HiddenLegend(props) {
    var style = {
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
    return react_1.default.createElement("div", { style: style, onClick: props.onShow },
        react_1.default.createElement("i", { className: "fa fa-angle-double-left" }));
}
