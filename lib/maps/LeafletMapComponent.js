var BingLayer, H, L, LeafletMapComponent, PropTypes, React, ReactDOM, UtfGridLayer, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

ReactDOM = require('react-dom');

H = React.DOM;

L = require('leaflet');

BingLayer = require('./BingLayer');

UtfGridLayer = require('./UtfGridLayer');

window.L = L;

require('leaflet-loading');

module.exports = LeafletMapComponent = (function(superClass) {
  extend(LeafletMapComponent, superClass);

  function LeafletMapComponent() {
    return LeafletMapComponent.__super__.constructor.apply(this, arguments);
  }

  LeafletMapComponent.propTypes = {
    baseLayerId: PropTypes.string.isRequired,
    initialBounds: PropTypes.shape({
      w: PropTypes.number.isRequired,
      n: PropTypes.number.isRequired,
      e: PropTypes.number.isRequired,
      s: PropTypes.number.isRequired
    }),
    width: PropTypes.any,
    height: PropTypes.any,
    onBoundsChange: PropTypes.func,
    layers: PropTypes.arrayOf(PropTypes.shape({
      tileUrl: PropTypes.string,
      utfGridUrl: PropTypes.string,
      visible: PropTypes.bool,
      opacity: PropTypes.number,
      onGridClick: PropTypes.func,
      onGridHover: PropTypes.func,
      minZoom: PropTypes.number,
      maxZoom: PropTypes.number
    })).isRequired,
    legend: PropTypes.node,
    dragging: PropTypes.bool,
    touchZoom: PropTypes.bool,
    scrollWheelZoom: PropTypes.bool,
    maxZoom: PropTypes.number,
    extraAttribution: PropTypes.string,
    loadingSpinner: PropTypes.bool,
    scaleControl: PropTypes.bool,
    popup: PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
      contents: PropTypes.node.isRequired
    })
  };

  LeafletMapComponent.defaultProps = {
    dragging: true,
    touchZoom: true,
    scrollWheelZoom: true,
    scaleControl: true
  };

  LeafletMapComponent.prototype.reload = function() {
    var i, len, ref, results, tileLayer;
    ref = this.tileLayers;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      tileLayer = ref[i];
      results.push(tileLayer.redraw());
    }
    return results;
  };

  LeafletMapComponent.prototype.getBounds = function() {
    var curBounds;
    curBounds = this.map.getBounds();
    return {
      n: curBounds.getNorth(),
      e: curBounds.getEast(),
      s: curBounds.getSouth(),
      w: curBounds.getWest()
    };
  };

  LeafletMapComponent.prototype.setBounds = function(bounds, pad) {
    var curBounds, e, lBounds, n, s, w;
    if (bounds) {
      if (this.hasBounds) {
        curBounds = this.map.getBounds();
        if (curBounds && curBounds.getWest() === bounds.w && curBounds.getEast() === bounds.e && curBounds.getNorth() === bounds.n && curBounds.getSouth() === bounds.s) {
          return;
        }
      }
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
      this.map.fitBounds([[-1, -180], [1, 180]]);
    }
    return this.hasBounds = true;
  };

  LeafletMapComponent.prototype.componentDidMount = function() {
    var loadingControl, mapElem, mapOptions;
    mapElem = ReactDOM.findDOMNode(this.refs.map);
    mapOptions = {
      fadeAnimation: false,
      dragging: this.props.dragging,
      touchZoom: this.props.touchZoom,
      scrollWheelZoom: this.props.scrollWheelZoom,
      minZoom: 1
    };
    if (this.props.maxZoom != null) {
      mapOptions.maxZoom = this.props.maxZoom;
    }
    this.map = L.map(mapElem, mapOptions);
    if (this.props.scaleControl) {
      L.control.scale().addTo(this.map);
    }
    this.map.on("zoomend", (function(_this) {
      return function() {
        return _this.forceUpdate();
      };
    })(this));
    this.map.on("load", (function(_this) {
      return function() {
        _this.loaded = true;
        return _this.forceUpdate();
      };
    })(this));
    this.map.on("moveend", (function(_this) {
      return function() {
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
      };
    })(this));
    this.setBounds(this.props.initialBounds);
    if (this.props.loadingSpinner) {
      loadingControl = L.Control.loading({
        separate: true
      });
      this.map.addControl(loadingControl);
    }
    return this.updateMap();
  };

  LeafletMapComponent.prototype.componentDidUpdate = function(prevProps) {
    return this.updateMap(prevProps);
  };

  LeafletMapComponent.prototype.componentWillUnmount = function() {
    var ref;
    return (ref = this.map) != null ? ref.remove() : void 0;
  };

  LeafletMapComponent.prototype.openPopup = function(options) {
    var popupDiv;
    popupDiv = L.DomUtil.create('div', '');
    return ReactDOM.render(options.contents, popupDiv, (function(_this) {
      return function() {
        var popup;
        return popup = L.popup({
          minWidth: 100,
          offset: options.offset,
          autoPan: true
        }).setLatLng(options.location).setContent(popupDiv).openOn(_this.map);
      };
    })(this));
  };

  LeafletMapComponent.prototype.updateMap = function(prevProps) {
    var i, j, k, l, layer, len, len1, len2, len3, options, ref, ref1, ref2, ref3, results, tileLayer, utfGridLayer;
    if (prevProps && (prevProps.width !== this.props.width || prevProps.height !== this.props.height)) {
      this.map.invalidateSize();
    }
    if (prevProps && prevProps.maxZoom !== this.props.maxZoom) {
      this.map.options.maxZoom = this.props.maxZoom;
      if (this.map.getZoom() > this.props.maxZoom) {
        this.map.setZoom(this.props.maxZoom);
      }
    }
    if (!prevProps || this.props.extraAttribution !== prevProps.extraAttribution) {
      if (this.baseLayer) {
        this.baseLayer._map.attributionControl.removeAttribution(prevProps.extraAttribution);
        this.baseLayer._map.attributionControl.addAttribution(this.props.extraAttribution);
      }
    }
    if (prevProps && prevProps.popup && !this.props.popup) {
      if (this.popupDiv) {
        ReactDOM.unmountComponentAtNode(this.popupDiv);
        this.popupDiv = null;
      }
      this.map.removeLayer(this.popupLayer);
      this.popupLayer = null;
    } else if (prevProps && prevProps.popup && this.props.popup) {
      if (prevProps.popup.lat !== this.props.popup.lat || prevProps.popup.lng !== this.props.popup.lng) {
        this.popupLayer.setLatLng(L.latLng(this.props.popup.lat, this.props.popup.lng));
      }
      ReactDOM.render(this.props.popup.contents, this.popupDiv);
    } else if (this.props.popup) {
      this.popupDiv = L.DomUtil.create('div', '');
      ReactDOM.render(this.props.popup.contents, this.popupDiv);
      this.popupLayer = L.popup({
        minWidth: 100,
        offset: L.point(0, 0),
        autoPan: true,
        closeButton: false,
        closeOnClick: false
      }).setLatLng(L.latLng(this.props.popup.lat, this.props.popup.lng)).setContent(this.popupDiv).openOn(this.map);
    }
    if (!prevProps || this.props.baseLayerId !== prevProps.baseLayerId) {
      if (this.baseLayer) {
        this.map.removeLayer(this.baseLayer);
        this.baseLayer = null;
      }
      switch (this.props.baseLayerId) {
        case "bing_road":
          this.baseLayer = L.tileLayer('https://{s}.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZ3Jhc3NpY2siLCJhIjoiY2ozMzU1N3ZoMDA3ZDJxbzh0aTRtOTRoeSJ9.fFWBZ88vbdezyhfw-I-fag', {
            attribution: "MapBox and OpenStreetMap",
            subdomains: ["a", "b"]
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
      this.map.addLayer(this.baseLayer);
      if (this.props.extraAttribution) {
        this.baseLayer._map.attributionControl.addAttribution(this.props.extraAttribution);
      }
      this.baseLayer.bringToBack();
    }
    if (!prevProps || JSON.stringify(_.omit(this.props.layers, "onGridClick", "onGridHover")) !== JSON.stringify(_.omit(prevProps.layers, "onGridClick", "onGridHover"))) {
      if (this.tileLayers) {
        ref = this.tileLayers;
        for (i = 0, len = ref.length; i < len; i++) {
          tileLayer = ref[i];
          this.map.removeLayer(tileLayer);
        }
        this.tileLayer = null;
      }
      if (this.utfGridLayers) {
        ref1 = this.utfGridLayers;
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          utfGridLayer = ref1[j];
          this.map.removeLayer(utfGridLayer);
        }
        this.utfGridLayers = null;
      }
      if (this.props.layers) {
        this.tileLayers = [];
        ref2 = this.props.layers;
        for (k = 0, len2 = ref2.length; k < len2; k++) {
          layer = ref2[k];
          if (!layer.visible || !layer.tileUrl) {
            continue;
          }
          options = {
            opacity: layer.opacity
          };
          if (layer.minZoom) {
            options.minZoom = layer.minZoom;
          }
          if (layer.maxZoom) {
            options.maxZoom = layer.maxZoom;
          }
          tileLayer = L.tileLayer(layer.tileUrl, options);
          this.tileLayers.push(tileLayer);
          this.map._zoomAnimated = false;
          this.map.addLayer(tileLayer);
          this.map._zoomAnimated = true;
          tileLayer._container.className += ' leaflet-zoom-hide';
        }
        this.utfGridLayers = [];
        ref3 = this.props.layers.slice().reverse();
        results = [];
        for (l = 0, len3 = ref3.length; l < len3; l++) {
          layer = ref3[l];
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
              (function(_this) {
                return (function(layer) {
                  return utfGridLayer.on('click', function(ev) {
                    return layer.onGridClick(ev);
                  });
                });
              })(this)(layer);
            }
            if (layer.onGridHover) {
              results.push((function(_this) {
                return function(layer) {
                  utfGridLayer.on('mouseout', function(ev) {
                    return layer.onGridHover(_.omit(ev, "data"));
                  });
                  utfGridLayer.on('mouseover', function(ev) {
                    return layer.onGridHover(ev);
                  });
                  return utfGridLayer.on('mousemove', function(ev) {
                    return layer.onGridHover(ev);
                  });
                };
              })(this)(layer));
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
  };

  LeafletMapComponent.prototype.render = function() {
    return H.div(null, this.props.legend && this.loaded ? React.cloneElement(this.props.legend, {
      zoom: this.map.getZoom()
    }) : void 0, H.div({
      ref: "map",
      style: {
        width: this.props.width,
        height: this.props.height
      }
    }));
  };

  return LeafletMapComponent;

})(React.Component);
