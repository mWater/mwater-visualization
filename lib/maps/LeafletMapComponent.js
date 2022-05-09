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
const react_1 = __importStar(require("react"));
const react_dom_1 = __importDefault(require("react-dom"));
const LeafletLoading_1 = __importDefault(require("./LeafletLoading"));
const leaflet_1 = __importDefault(require("leaflet"));
let BingLayer = require("./BingLayer");
let UtfGridLayer = require("./UtfGridLayer");
const R = react_1.default.createElement;
const marker_icon_2x_png_1 = __importDefault(require("./marker-icon-2x.png"));
const marker_icon_png_1 = __importDefault(require("./marker-icon.png"));
const marker_shadow_png_1 = __importDefault(require("./marker-shadow.png"));
/** Leaflet map component that displays a base layer, a tile layer and an optional interactivity layer */
class LeafletMapComponent extends react_1.Component {
    constructor(props) {
        super(props);
    }
    /** Reloads all layers */
    reload() {
        // TODO reload JSON tiles
        if (this.tileLayers) {
            this.tileLayers.map((tileLayer) => tileLayer.redraw());
        }
    }
    /** Gets the underlying Leaflet map */
    getLeafletMap() {
        return this.map;
    }
    // Get bounds. Bounds are in { w, n, s, e } format
    getBounds() {
        const curBounds = this.map.getBounds();
        return {
            n: curBounds.getNorth(),
            e: curBounds.getEast(),
            s: curBounds.getSouth(),
            w: curBounds.getWest()
        };
    }
    /** Set bounds. Padding is optional fractional pad */
    setBounds(bounds, pad) {
        if (bounds) {
            // Ignore if same as current
            if (this.hasBounds) {
                const curBounds = this.map.getBounds();
                if (curBounds &&
                    curBounds.getWest() === bounds.w &&
                    curBounds.getEast() === bounds.e &&
                    curBounds.getNorth() === bounds.n &&
                    curBounds.getSouth() === bounds.s) {
                    return;
                }
            }
            // Check that bounds contain some actual area (hangs leaflet if not https://github.com/mWater/mwater-visualization/issues/127)
            let { n } = bounds;
            const { w } = bounds;
            const { s } = bounds;
            let { e } = bounds;
            if (n === s) {
                n += 0.001;
            }
            if (e === w) {
                e += 0.001;
            }
            let lBounds = new leaflet_1.default.LatLngBounds([
                [s, w],
                [n, e]
            ]);
            if (pad) {
                lBounds = lBounds.pad(pad);
            }
            this.map.fitBounds(lBounds, { animate: true });
        }
        else {
            // Fit world doesn't work sometimes. Make sure that entire left-right is included
            this.map.fitBounds([
                [-1, -180],
                [1, 180]
            ]);
        }
        this.hasBounds = true;
    }
    componentDidMount() {
        // Create map
        const mapOptions = {
            fadeAnimation: false,
            dragging: this.props.dragging,
            touchZoom: this.props.touchZoom,
            scrollWheelZoom: this.props.scrollWheelZoom,
            minZoom: 1,
            keyboard: this.props.keyboard
        };
        // Must not be null, or will not zoom
        if (this.props.maxZoom != null) {
            mapOptions.maxZoom = this.props.maxZoom;
        }
        if (this.props.minZoom != null) {
            mapOptions.minZoom = this.props.minZoom;
        }
        this.map = leaflet_1.default.map(this.mapElem, mapOptions);
        if (this.props.scaleControl) {
            leaflet_1.default.control.scale().addTo(this.map);
        }
        // Update legend on zoom
        this.map.on("zoomend", () => this.forceUpdate());
        // Update legend on first load
        this.map.on("load", () => {
            this.loaded = true;
            return this.forceUpdate();
        });
        // Fire onBoundsChange
        this.map.on("moveend", () => {
            if (this.props.onBoundsChange) {
                const bounds = this.map.getBounds();
                return this.props.onBoundsChange({
                    w: bounds.getWest(),
                    n: bounds.getNorth(),
                    e: bounds.getEast(),
                    s: bounds.getSouth()
                });
            }
        });
        this.setBounds(this.props.initialBounds || null);
        if (this.props.loadingSpinner) {
            const loadingControl = new LeafletLoading_1.default({
                separate: true
            });
            this.map.addControl(loadingControl);
        }
        // Update map with no previous properties
        return this.updateMap();
    }
    componentDidUpdate(prevProps) {
        return this.updateMap(prevProps);
    }
    componentWillUnmount() {
        var _a;
        return (_a = this.map) === null || _a === void 0 ? void 0 : _a.remove();
    }
    // Open a popup.
    // Options:
    //   contents: React element of contents
    //   location: lat/lng
    //   offset: x and y of offset
    openPopup(options) {
        const popupDiv = leaflet_1.default.DomUtil.create("div", "");
        return react_dom_1.default.render(options.contents, popupDiv, () => {
            let popup;
            return (popup = leaflet_1.default.popup({ minWidth: 100, offset: options.offset, autoPan: true })
                .setLatLng(options.location)
                .setContent(popupDiv)
                .openOn(this.map));
        });
    }
    updateMap(prevProps) {
        // Update size
        if (prevProps && (prevProps.width !== this.props.width || prevProps.height !== this.props.height)) {
            this.map.invalidateSize();
        }
        // Update maxZoom
        if (prevProps && prevProps.maxZoom !== this.props.maxZoom) {
            this.map.options.maxZoom = this.props.maxZoom;
            if (this.props.maxZoom && this.map.getZoom() > this.props.maxZoom) {
                this.map.setZoom(this.props.maxZoom);
            }
        }
        // Update attribution
        if (!prevProps || this.props.extraAttribution !== prevProps.extraAttribution) {
            if (this.baseLayer) {
                if (prevProps) {
                    this.baseLayer._map.attributionControl.removeAttribution(prevProps.extraAttribution);
                }
                this.baseLayer._map.attributionControl.addAttribution(this.props.extraAttribution);
            }
        }
        // Update popup
        if (prevProps && prevProps.popup && !this.props.popup) {
            // If existing popupDiv, unmount
            if (this.popupDiv) {
                react_dom_1.default.unmountComponentAtNode(this.popupDiv);
                this.popupDiv = null;
            }
            // Close popup
            this.map.removeLayer(this.popupLayer);
            this.popupLayer = null;
        }
        else if (prevProps && prevProps.popup && this.props.popup) {
            // Move location
            if (prevProps.popup.lat !== this.props.popup.lat || prevProps.popup.lng !== this.props.popup.lng) {
                this.popupLayer.setLatLng(leaflet_1.default.latLng(this.props.popup.lat, this.props.popup.lng));
            }
            // Re-render contents
            react_dom_1.default.render(this.props.popup.contents, this.popupDiv);
        }
        else if (this.props.popup) {
            // Create popup
            this.popupDiv = leaflet_1.default.DomUtil.create("div", "");
            react_dom_1.default.render(this.props.popup.contents, this.popupDiv);
            this.popupLayer = leaflet_1.default.popup({ minWidth: 100, autoPan: true, closeButton: false, closeOnClick: false })
                .setLatLng(leaflet_1.default.latLng(this.props.popup.lat, this.props.popup.lng))
                .setContent(this.popupDiv)
                .openOn(this.map);
        }
        // Update base layer
        if (!prevProps ||
            this.props.baseLayerId !== prevProps.baseLayerId ||
            this.props.baseLayerOpacity !== prevProps.baseLayerOpacity) {
            if (this.baseLayer) {
                this.map.removeLayer(this.baseLayer);
                this.baseLayer = null;
            }
            switch (this.props.baseLayerId) {
                case "bing_road":
                    this.baseLayer = new BingLayer("Ao26dWY2IC8PjorsJKFaoR85EPXCnCohrJdisCWXIULAXFo0JAXquGauppTMQbyU", {
                        type: "Road"
                    });
                    break;
                // @baseLayer = L.tileLayer('https://{s}.api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
                //   attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
                //   tileSize: 512,
                //   maxZoom: 21,
                //   maxNativeZoom: 19,
                //   subdomains: ["a", "b"],
                //   zoomOffset: -1,
                //   id: 'mapbox/streets-v11',
                //   accessToken: 'pk.eyJ1IjoiZ3Jhc3NpY2siLCJhIjoiY2ozMzU1N3ZoMDA3ZDJxbzh0aTRtOTRoeSJ9.fFWBZ88vbdezyhfw-I-fag'
                // })
                case "bing_aerial":
                    this.baseLayer = new BingLayer("Ao26dWY2IC8PjorsJKFaoR85EPXCnCohrJdisCWXIULAXFo0JAXquGauppTMQbyU", {
                        type: "AerialWithLabels"
                    });
                    break;
                case "cartodb_positron":
                    this.baseLayer = leaflet_1.default.tileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png", {
                        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://cartodb.com/attributions">CartoDB</a>',
                        maxZoom: 21
                    });
                    break;
                case "cartodb_dark_matter":
                    this.baseLayer = leaflet_1.default.tileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png", {
                        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://cartodb.com/attributions">CartoDB</a>',
                        maxZoom: 21
                    });
                    break;
            }
            if (this.baseLayer) {
                this.map.addLayer(this.baseLayer);
                if (this.props.baseLayerOpacity != null) {
                    this.baseLayer.setOpacity(this.props.baseLayerOpacity);
                }
                if (this.props.extraAttribution) {
                    this.baseLayer._map.attributionControl.addAttribution(this.props.extraAttribution);
                }
                // Base layers are always at back
                this.baseLayer.bringToBack();
            }
        }
        // Update layers
        if (!prevProps ||
            JSON.stringify(lodash_1.default.omit(this.props.layers, "onGridClick", "onGridHover", "onClick")) !==
                JSON.stringify(lodash_1.default.omit(prevProps.layers, "onGridClick", "onGridHover", "onClick"))) {
            // TODO naive
            // TODO This is naive. Could be more surgical about updates
            let geoJsonLayer, tileLayer, utfGridLayer;
            if (this.tileLayers) {
                for (tileLayer of this.tileLayers) {
                    this.map.removeLayer(tileLayer);
                }
                this.tileLayers = null;
            }
            if (this.utfGridLayers) {
                for (utfGridLayer of this.utfGridLayers) {
                    this.map.removeLayer(utfGridLayer);
                }
                this.utfGridLayers = null;
            }
            // Remove Geojson layers
            if (this.geoJsonLayers) {
                for (geoJsonLayer of this.geoJsonLayers) {
                    this.map.removeLayer(geoJsonLayer);
                }
                this.geoJsonLayers = null;
            }
            if (this.props.layers) {
                let layer;
                this.tileLayers = [];
                this.geoJsonLayers = [];
                for (layer of this.props.layers) {
                    // Handle Tile layer
                    if (layer.tileUrl) {
                        // Do not display if not visible
                        if (!layer.visible) {
                            continue;
                        }
                        const options = { opacity: layer.opacity };
                        // Putting null seems to make layer vanish
                        if (layer.minZoom) {
                            options.minZoom = layer.minZoom;
                        }
                        if (layer.maxZoom) {
                            options.maxZoom = layer.maxZoom;
                        }
                        tileLayer = leaflet_1.default.tileLayer(layer.tileUrl, options);
                        this.tileLayers.push(tileLayer);
                        this.map._zoomAnimated = false;
                        this.map.addLayer(tileLayer);
                        this.map._zoomAnimated = true;
                        tileLayer._container.className += " leaflet-zoom-hide";
                    }
                    else if (layer.geometry) {
                        geoJsonLayer = leaflet_1.default.geoJSON(layer.geometry, {
                            // Put in front
                            pane: "markerPane",
                            style: layer.style,
                            interactive: layer.nonInteractive ? false : true,
                            pointToLayer: (geojson, latlng) => {
                                if (layer.pointStyle) {
                                    return leaflet_1.default.circleMarker(latlng, lodash_1.default.extend({}, layer.pointStyle, { interactive: layer.nonInteractive ? false : true }));
                                }
                                else {
                                    return leaflet_1.default.marker(latlng, {
                                        icon: leaflet_1.default.icon({
                                            iconUrl: marker_icon_png_1.default,
                                            shadowUrl: marker_shadow_png_1.default,
                                            iconRetinaUrl: marker_icon_2x_png_1.default,
                                            iconSize: [25, 41],
                                            iconAnchor: [13, 41],
                                            popupAnchor: [1, -34],
                                            shadowSize: [41, 41],
                                            shadowAnchor: [13, 41]
                                        }),
                                        interactive: layer.nonInteractive ? false : true
                                    });
                                }
                            }
                        });
                        if (layer.onClick) {
                            geoJsonLayer.on("click", layer.onClick);
                        }
                        this.geoJsonLayers.push(geoJsonLayer);
                        this.map.addLayer(geoJsonLayer);
                    }
                }
                this.utfGridLayers = [];
                // Add grid layers in reverse order
                for (layer of this.props.layers.slice().reverse()) {
                    if (!layer.visible) {
                        continue;
                    }
                    if (layer.utfGridUrl) {
                        utfGridLayer = new UtfGridLayer(layer.utfGridUrl, {
                            useJsonP: false,
                            minZoom: layer.minZoom || undefined,
                            maxZoom: layer.maxZoom || undefined
                        });
                        this.map.addLayer(utfGridLayer);
                        this.utfGridLayers.push(utfGridLayer);
                        if (layer.onGridClick) {
                            ;
                            ((layer) => {
                                return utfGridLayer.on("click", (ev) => {
                                    return layer.onGridClick(ev);
                                });
                            })(layer);
                        }
                        if (layer.onGridHover) {
                            utfGridLayer.on("mouseout", (ev) => {
                                return layer.onGridHover(lodash_1.default.omit(ev, "data"));
                            });
                            utfGridLayer.on("mouseover", (ev) => {
                                return layer.onGridHover(ev);
                            });
                            return utfGridLayer.on("mousemove", (ev) => {
                                return layer.onGridHover(ev);
                            });
                        }
                    }
                }
            }
        }
    }
    render() {
        return R("div", null, this.props.legend && this.loaded
            ? // Inject zoom
                react_1.default.cloneElement(this.props.legend, { zoom: this.map.getZoom() })
            : undefined, R("div", {
            ref: (c) => {
                this.mapElem = c;
            },
            style: { width: this.props.width, height: this.props.height }
        }));
    }
}
exports.default = LeafletMapComponent;
LeafletMapComponent.defaultProps = {
    dragging: true,
    touchZoom: true,
    scrollWheelZoom: true,
    scaleControl: true,
    keyboard: true
};
