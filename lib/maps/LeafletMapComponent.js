var BingLayer, H, L, LeafletMapComponent, UtfGridLayer,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

H = React.DOM;

L = require('leaflet');

BingLayer = require('./BingLayer');

UtfGridLayer = require('./UtfGridLayer');

module.exports = LeafletMapComponent = (function(superClass) {
  extend(LeafletMapComponent, superClass);

  function LeafletMapComponent() {
    return LeafletMapComponent.__super__.constructor.apply(this, arguments);
  }

  LeafletMapComponent.propTypes = {
    baseLayerId: React.PropTypes.string.isRequired,
    initialBounds: React.PropTypes.shape({
      w: React.PropTypes.number.isRequired,
      n: React.PropTypes.number.isRequired,
      e: React.PropTypes.number.isRequired,
      s: React.PropTypes.number.isRequired
    }),
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    onBoundsChange: React.PropTypes.func,
    layers: React.PropTypes.arrayOf(React.PropTypes.shape({
      tileUrl: React.PropTypes.string,
      utfGridUrl: React.PropTypes.string,
      visible: React.PropTypes.bool,
      opacity: React.PropTypes.number,
      onGridClick: React.PropTypes.func,
      minZoom: React.PropTypes.number,
      maxZoom: React.PropTypes.number
    })).isRequired,
    legend: React.PropTypes.node
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

  LeafletMapComponent.prototype.componentDidMount = function() {
    var e, mapElem, n, s, w;
    mapElem = React.findDOMNode(this.refs.map);
    this.map = L.map(mapElem, {
      fadeAnimation: false
    });
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
    if (this.props.initialBounds) {
      n = this.props.initialBounds.n;
      w = this.props.initialBounds.w;
      s = this.props.initialBounds.s;
      e = this.props.initialBounds.e;
      if (n === s) {
        n += 0.001;
      }
      if (e === w) {
        e += 0.001;
      }
      this.map.fitBounds(new L.LatLngBounds([[n, w], [s, e]]));
    } else {
      this.map.fitBounds([[-1, -180], [1, 180]]);
    }
    this.legendControl = L.control({
      position: 'bottomright'
    });
    this.legendControl.onAdd = (function(_this) {
      return function(map) {
        _this.legendDiv = L.DomUtil.create('div', '');
        return _this.legendDiv;
      };
    })(this);
    this.legendControl.addTo(this.map);
    return this.updateMap();
  };

  LeafletMapComponent.prototype.componentDidUpdate = function(prevProps) {
    return this.updateMap(prevProps);
  };

  LeafletMapComponent.prototype.componentWillUnmount = function() {
    if (this.legendDiv) {
      React.unmountComponentAtNode(this.legendDiv);
    }
    return this.map.remove();
  };

  LeafletMapComponent.prototype.openPopup = function(options) {
    var popupDiv;
    popupDiv = L.DomUtil.create('div', '');
    return React.render(options.contents, popupDiv, (function(_this) {
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
    var i, j, k, l, layer, len, len1, len2, len3, ref, ref1, ref2, ref3, tileLayer, utfGridLayer;
    if (prevProps && (prevProps.width !== this.props.width || prevProps.height !== this.props.height)) {
      this.map.invalidateSize();
    }
    if (!prevProps || this.props.baseLayerId !== prevProps.baseLayerId) {
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
        case "bing_aerial":
          this.baseLayer = new BingLayer("Ao26dWY2IC8PjorsJKFaoR85EPXCnCohrJdisCWXIULAXFo0JAXquGauppTMQbyU", {
            type: "AerialWithLabels"
          });
      }
      this.map.addLayer(this.baseLayer);
      this.baseLayer.bringToBack();
    }
    if (!prevProps || JSON.stringify(_.omit(this.props.layers, "onGridClick")) !== JSON.stringify(_.omit(prevProps.layers, "onGridClick"))) {
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
          tileLayer = L.tileLayer(layer.tileUrl, {
            minZoom: layer.minZoom,
            maxZoom: layer.maxZoom
          });
          this.tileLayers.push(tileLayer);
          this.map._zoomAnimated = false;
          this.map.addLayer(tileLayer);
          this.map._zoomAnimated = true;
          tileLayer._container.className += ' leaflet-zoom-hide';
        }
        this.utfGridLayers = [];
        ref3 = this.props.layers;
        for (l = 0, len3 = ref3.length; l < len3; l++) {
          layer = ref3[l];
          if (!layer.visible) {
            continue;
          }
          if (layer.utfGridUrl) {
            utfGridLayer = new UtfGridLayer(layer.utfGridUrl, {
              useJsonP: false,
              minZoom: layer.minZoom,
              maxZoom: layer.maxZoom
            });
            this.map.addLayer(utfGridLayer);
            this.utfGridLayers.push(utfGridLayer);
            if (layer.onGridClick) {
              utfGridLayer.on('click', (function(_this) {
                return function(ev) {
                  return layer.onGridClick({
                    data: ev.data
                  });
                };
              })(this));
            }
          }
        }
      }
    }
    if (this.props.legend) {
      return React.render(this.props.legend, this.legendDiv);
    } else if (this.legendDiv) {
      return React.unmountComponentAtNode(this.legendDiv);
    }
  };

  LeafletMapComponent.prototype.render = function() {
    return H.div({
      ref: "map",
      style: {
        width: this.props.width,
        height: this.props.height
      }
    });
  };

  return LeafletMapComponent;

})(React.Component);
