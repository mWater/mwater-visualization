"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var BingLayer, L, LeafletMapComponent, PropTypes, R, React, ReactDOM, UtfGridLayer, _;

PropTypes = require('prop-types');
_ = require('lodash');
React = require('react');
ReactDOM = require('react-dom');
R = React.createElement;
L = require('leaflet');
BingLayer = require('./BingLayer');
UtfGridLayer = require('./UtfGridLayer'); // Setup leaflet loading

window.L = L;

require('leaflet-loading'); // See https://github.com/PaulLeCam/react-leaflet/issues/255#issuecomment-261904061 for issue with CSS + webpack


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
}); // Leaflet map component that displays a base layer, a tile layer and an optional interactivity layer

module.exports = LeafletMapComponent = function () {
  var LeafletMapComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2["default"])(LeafletMapComponent, _React$Component);

    function LeafletMapComponent() {
      (0, _classCallCheck2["default"])(this, LeafletMapComponent);
      return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(LeafletMapComponent).apply(this, arguments));
    }

    (0, _createClass2["default"])(LeafletMapComponent, [{
      key: "reload",
      // Reload all tiles
      value: function reload() {
        var i, len, ref, results, tileLayer;
        ref = this.tileLayers; // TODO reload JSON tiles

        results = [];

        for (i = 0, len = ref.length; i < len; i++) {
          tileLayer = ref[i];
          results.push(tileLayer.redraw());
        }

        return results;
      } // Get underlying leaflet map

    }, {
      key: "getLeafletMap",
      value: function getLeafletMap() {
        return this.map;
      } // Get bounds. Bounds are in { w, n, s, e } format

    }, {
      key: "getBounds",
      value: function getBounds() {
        var curBounds;
        curBounds = this.map.getBounds();
        return {
          n: curBounds.getNorth(),
          e: curBounds.getEast(),
          s: curBounds.getSouth(),
          w: curBounds.getWest()
        };
      } // Set bounds. Bounds are in { w, n, s, e } format. Padding is optional

    }, {
      key: "setBounds",
      value: function setBounds(bounds, pad) {
        var curBounds, e, lBounds, n, s, w;

        if (bounds) {
          // Ignore if same as current
          if (this.hasBounds) {
            curBounds = this.map.getBounds();

            if (curBounds && curBounds.getWest() === bounds.w && curBounds.getEast() === bounds.e && curBounds.getNorth() === bounds.n && curBounds.getSouth() === bounds.s) {
              return;
            }
          } // Check that bounds contain some actual area (hangs leaflet if not https://github.com/mWater/mwater-visualization/issues/127)


          n = bounds.n;
          w = bounds.w;
          s = bounds.s;
          e = bounds.e;

          if (n === s) {
            n += 0.001;
          }

          if (e === w) {
            e += 0.001;
          }

          lBounds = new L.LatLngBounds([[s, w], [n, e]]);

          if (pad) {
            lBounds = lBounds.pad(pad);
          }

          this.map.fitBounds(lBounds, {
            animate: true
          });
        } else {
          // Fit world doesn't work sometimes. Make sure that entire left-right is included
          this.map.fitBounds([[-1, -180], [1, 180]]);
        }

        return this.hasBounds = true;
      }
    }, {
      key: "componentDidMount",
      value: function componentDidMount() {
        var _this = this;

        var loadingControl, mapOptions; // Create map

        mapOptions = {
          fadeAnimation: false,
          dragging: this.props.dragging,
          touchZoom: this.props.touchZoom,
          scrollWheelZoom: this.props.scrollWheelZoom,
          minZoom: 1,
          // Bing doesn't allow going to zero
          keyboard: this.props.keyboard
        }; // Must not be null, or will not zoom

        if (this.props.maxZoom != null) {
          mapOptions.maxZoom = this.props.maxZoom;
        }

        if (this.props.minZoom != null) {
          mapOptions.minZoom = this.props.minZoom;
        }

        this.map = L.map(this.mapElem, mapOptions);

        if (this.props.scaleControl) {
          L.control.scale().addTo(this.map);
        } // Update legend on zoom


        this.map.on("zoomend", function () {
          return _this.forceUpdate();
        }); // Update legend on first load

        this.map.on("load", function () {
          _this.loaded = true;
          return _this.forceUpdate();
        }); // Fire onBoundsChange

        this.map.on("moveend", function () {
          var bounds;

          if (_this.props.onBoundsChange) {
            bounds = _this.map.getBounds();
            return _this.props.onBoundsChange({
              w: bounds.getWest(),
              n: bounds.getNorth(),
              e: bounds.getEast(),
              s: bounds.getSouth()
            });
          }
        });
        this.setBounds(this.props.initialBounds);

        if (this.props.loadingSpinner) {
          loadingControl = L.Control.loading({
            separate: true
          });
          this.map.addControl(loadingControl);
        } // Update map with no previous properties


        return this.updateMap();
      }
    }, {
      key: "componentDidUpdate",
      value: function componentDidUpdate(prevProps) {
        return this.updateMap(prevProps);
      }
    }, {
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        var ref;
        return (ref = this.map) != null ? ref.remove() : void 0;
      } // Open a popup.
      // Options:
      //   contents: React element of contents
      //   location: lat/lng
      //   offset: x and y of offset

    }, {
      key: "openPopup",
      value: function openPopup(options) {
        var _this2 = this;

        var popupDiv;
        popupDiv = L.DomUtil.create('div', '');
        return ReactDOM.render(options.contents, popupDiv, function () {
          var popup;
          return popup = L.popup({
            minWidth: 100,
            offset: options.offset,
            autoPan: true
          }).setLatLng(options.location).setContent(popupDiv).openOn(_this2.map);
        });
      }
    }, {
      key: "updateMap",
      value: function updateMap(prevProps) {
        var geoJsonLayer, i, j, k, l, layer, len, len1, len2, len3, len4, m, options, ref, ref1, ref2, ref3, ref4, results, tileLayer, utfGridLayer; // Update size

        if (prevProps && (prevProps.width !== this.props.width || prevProps.height !== this.props.height)) {
          this.map.invalidateSize();
        } // Update maxZoom


        if (prevProps && prevProps.maxZoom !== this.props.maxZoom) {
          this.map.options.maxZoom = this.props.maxZoom;

          if (this.map.getZoom() > this.props.maxZoom) {
            this.map.setZoom(this.props.maxZoom);
          }
        } // Update attribution


        if (!prevProps || this.props.extraAttribution !== prevProps.extraAttribution) {
          if (this.baseLayer) {
            this.baseLayer._map.attributionControl.removeAttribution(prevProps.extraAttribution);

            this.baseLayer._map.attributionControl.addAttribution(this.props.extraAttribution);
          }
        } // Update popup


        if (prevProps && prevProps.popup && !this.props.popup) {
          // If existing popupDiv, unmount
          if (this.popupDiv) {
            ReactDOM.unmountComponentAtNode(this.popupDiv);
            this.popupDiv = null;
          } // Close popup


          this.map.removeLayer(this.popupLayer);
          this.popupLayer = null;
        } else if (prevProps && prevProps.popup && this.props.popup) {
          // Move location
          if (prevProps.popup.lat !== this.props.popup.lat || prevProps.popup.lng !== this.props.popup.lng) {
            this.popupLayer.setLatLng(L.latLng(this.props.popup.lat, this.props.popup.lng));
          } // Re-render contents


          ReactDOM.render(this.props.popup.contents, this.popupDiv);
        } else if (this.props.popup) {
          // Create popup
          this.popupDiv = L.DomUtil.create('div', '');
          ReactDOM.render(this.props.popup.contents, this.popupDiv);
          this.popupLayer = L.popup({
            minWidth: 100,
            autoPan: true,
            closeButton: false,
            closeOnClick: false
          }).setLatLng(L.latLng(this.props.popup.lat, this.props.popup.lng)).setContent(this.popupDiv).openOn(this.map);
        } // Update base layer


        if (!prevProps || this.props.baseLayerId !== prevProps.baseLayerId || this.props.baseLayerOpacity !== prevProps.baseLayerOpacity) {
          if (this.baseLayer) {
            this.map.removeLayer(this.baseLayer);
            this.baseLayer = null;
          }

          switch (this.props.baseLayerId) {
            case "bing_road":
              // @baseLayer = new BingLayer("Ao26dWY2IC8PjorsJKFaoR85EPXCnCohrJdisCWXIULAXFo0JAXquGauppTMQbyU", {type: "Road"})
              this.baseLayer = L.tileLayer('https://{s}.api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
                attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
                tileSize: 512,
                maxZoom: 18,
                subdomains: ["a", "b"],
                zoomOffset: -1,
                id: 'mapbox/streets-v11',
                accessToken: 'pk.eyJ1IjoiZ3Jhc3NpY2siLCJhIjoiY2ozMzU1N3ZoMDA3ZDJxbzh0aTRtOTRoeSJ9.fFWBZ88vbdezyhfw-I-fag'
              });
              break;

            case "bing_aerial":
              this.baseLayer = new BingLayer("Ao26dWY2IC8PjorsJKFaoR85EPXCnCohrJdisCWXIULAXFo0JAXquGauppTMQbyU", {
                type: "AerialWithLabels"
              });
              break;

            case "cartodb_positron":
              this.baseLayer = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://cartodb.com/attributions">CartoDB</a>'
              });
              break;

            case "cartodb_dark_matter":
              this.baseLayer = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://cartodb.com/attributions">CartoDB</a>'
              });
          }

          if (this.baseLayer) {
            this.map.addLayer(this.baseLayer);

            if (this.props.baseLayerOpacity != null) {
              this.baseLayer.setOpacity(this.props.baseLayerOpacity);
            }

            if (this.props.extraAttribution) {
              this.baseLayer._map.attributionControl.addAttribution(this.props.extraAttribution);
            } // Base layers are always at back


            this.baseLayer.bringToBack();
          }
        } // Update layers


        if (!prevProps || JSON.stringify(_.omit(this.props.layers, "onGridClick", "onGridHover", "onClick")) !== JSON.stringify(_.omit(prevProps.layers, "onGridClick", "onGridHover", "onClick"))) {
          // TODO naive
          // TODO This is naive. Could be more surgical about updates
          if (this.tileLayers) {
            ref = this.tileLayers;

            for (i = 0, len = ref.length; i < len; i++) {
              tileLayer = ref[i];
              this.map.removeLayer(tileLayer);
            }

            this.tileLayers = null;
          }

          if (this.utfGridLayers) {
            ref1 = this.utfGridLayers;

            for (j = 0, len1 = ref1.length; j < len1; j++) {
              utfGridLayer = ref1[j];
              this.map.removeLayer(utfGridLayer);
            }

            this.utfGridLayers = null;
          } // Remove Geojson layers


          if (this.geoJsonLayers) {
            ref2 = this.geoJsonLayers;

            for (k = 0, len2 = ref2.length; k < len2; k++) {
              geoJsonLayer = ref2[k];
              this.map.removeLayer(geoJsonLayer);
            }

            this.geoJsonLayers = null;
          }

          if (this.props.layers) {
            this.tileLayers = [];
            this.geoJsonLayers = [];
            ref3 = this.props.layers;

            for (l = 0, len3 = ref3.length; l < len3; l++) {
              layer = ref3[l]; // Handle Tile layer

              if (layer.tileUrl) {
                // Do not display if not visible
                if (!layer.visible) {
                  continue;
                }

                options = {
                  opacity: layer.opacity
                }; // Putting null seems to make layer vanish

                if (layer.minZoom) {
                  options.minZoom = layer.minZoom;
                }

                if (layer.maxZoom) {
                  options.maxZoom = layer.maxZoom;
                }

                tileLayer = L.tileLayer(layer.tileUrl, options);
                this.tileLayers.push(tileLayer); // TODO Hack for animated zooming

                this.map._zoomAnimated = false;
                this.map.addLayer(tileLayer);
                this.map._zoomAnimated = true;
                tileLayer._container.className += ' leaflet-zoom-hide';
              } else if (layer.geometry) {
                geoJsonLayer = L.geoJSON(layer.geometry, {
                  // Put in front
                  pane: "markerPane",
                  style: layer.style,
                  interactive: layer.nonInteractive ? false : true,
                  pointToLayer: function pointToLayer(geojson, latlng) {
                    if (layer.pointStyle) {
                      return L.circleMarker(latlng, _.extend({}, layer.pointStyle, {
                        interactive: layer.nonInteractive ? false : true
                      }));
                    } else {
                      return L.marker(latlng, {
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
            ref4 = this.props.layers.slice().reverse(); // Add grid layers in reverse order

            results = [];

            for (m = 0, len4 = ref4.length; m < len4; m++) {
              layer = ref4[m];

              if (!layer.visible) {
                continue;
              }

              if (layer.utfGridUrl) {
                utfGridLayer = new UtfGridLayer(layer.utfGridUrl, {
                  useJsonP: false,
                  minZoom: layer.minZoom || void 0,
                  maxZoom: layer.maxZoom || void 0
                });
                this.map.addLayer(utfGridLayer);
                this.utfGridLayers.push(utfGridLayer);

                if (layer.onGridClick) {
                  (function (layer) {
                    return utfGridLayer.on('click', function (ev) {
                      return layer.onGridClick(ev);
                    });
                  })(layer);
                }

                if (layer.onGridHover) {
                  results.push(function (layer) {
                    utfGridLayer.on('mouseout', function (ev) {
                      return layer.onGridHover(_.omit(ev, "data"));
                    });
                    utfGridLayer.on('mouseover', function (ev) {
                      return layer.onGridHover(ev);
                    });
                    return utfGridLayer.on('mousemove', function (ev) {
                      return layer.onGridHover(ev);
                    });
                  }(layer));
                } else {
                  results.push(void 0);
                }
              } else {
                results.push(void 0);
              }
            }

            return results;
          }
        }
      }
    }, {
      key: "render",
      value: function render() {
        var _this3 = this;

        // Inject zoom
        return R('div', null, this.props.legend && this.loaded ? React.cloneElement(this.props.legend, {
          zoom: this.map.getZoom()
        }) : void 0, R('div', {
          ref: function ref(c) {
            return _this3.mapElem = c;
          },
          style: {
            width: this.props.width,
            height: this.props.height
          }
        }));
      }
    }]);
    return LeafletMapComponent;
  }(React.Component);

  ;
  LeafletMapComponent.propTypes = {
    baseLayerId: PropTypes.string.isRequired,
    // "bing_road", "bing_aerial", "cartodb_positron", "cartodb_dark_matter", "white"
    baseLayerOpacity: PropTypes.number,
    // Optional opacity 0-1
    initialBounds: PropTypes.shape({
      w: PropTypes.number.isRequired,
      n: PropTypes.number.isRequired,
      e: PropTypes.number.isRequired,
      s: PropTypes.number.isRequired // Initial bounds. Fit world if none

    }),
    width: PropTypes.any,
    // Required width
    height: PropTypes.any,
    // Required height
    onBoundsChange: PropTypes.func,
    // Called with bounds in w, n, s, e format when bounds change
    // See .d.ts for docs on this
    layers: PropTypes.any,
    // List of layers
    // Legend. Will have zoom injected
    legend: PropTypes.node,
    // Legend element
    dragging: PropTypes.bool,
    // Whether the map be draggable with mouse/touch or not. Default true
    touchZoom: PropTypes.bool,
    // Whether the map can be zoomed by touch-dragging with two fingers. Default true
    scrollWheelZoom: PropTypes.bool,
    // Whether the map can be zoomed by using the mouse wheel. Default true
    keyboard: PropTypes.bool,
    // Whether the map responds to keyboard. Default true
    minZoom: PropTypes.number,
    // Minimum zoom level
    maxZoom: PropTypes.number,
    // Maximum zoom level
    extraAttribution: PropTypes.string,
    // User defined attributions
    loadingSpinner: PropTypes.bool,
    // True to add loading spinner
    scaleControl: PropTypes.bool,
    // True to show scale control
    popup: PropTypes.shape({
      // Set to display a Leaflet popup control
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
      contents: PropTypes.node.isRequired
    })
  };
  LeafletMapComponent.defaultProps = {
    dragging: true,
    touchZoom: true,
    scrollWheelZoom: true,
    scaleControl: true,
    keyboard: true
  };
  return LeafletMapComponent;
}.call(void 0);