var BingLayer, H, L, LeafletMapComponent,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

H = React.DOM;

L = require('leaflet');

BingLayer = require('./BingLayer');

module.exports = LeafletMapComponent = (function(superClass) {
  extend(LeafletMapComponent, superClass);

  function LeafletMapComponent() {
    return LeafletMapComponent.__super__.constructor.apply(this, arguments);
  }

  LeafletMapComponent.propTypes = {
    baseLayerId: React.PropTypes.string.isRequired,
    initialCenter: React.PropTypes.object.isRequired,
    initialZoom: React.PropTypes.number.isRequired,
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    tileLayerUrl: React.PropTypes.string,
    utfGridLayerUrl: React.PropTypes.string,
    legend: React.PropTypes.node
  };

  LeafletMapComponent.prototype.componentDidMount = function() {
    var mapElem;
    mapElem = React.findDOMNode(this.refs.map);
    this.map = L.map(mapElem).setView(this.props.initialCenter, this.props.initialZoom);
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
    return this.updateLayers();
  };

  LeafletMapComponent.prototype.componentDidUpdate = function(prevProps) {
    return this.updateLayers(prevProps);
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

  LeafletMapComponent.prototype.updateLayers = function(prevProps) {
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
    if (!prevProps || this.props.tileLayerUrl !== prevProps.tileLayerUrl) {
      if (this.tileLayer) {
        this.map.removeLayer(this.tileLayer);
        this.tileLayer = null;
      }
      if (this.props.tileLayerUrl) {
        this.tileLayer = L.tileLayer(layer.tile);
        this.map._zoomAnimated = false;
        this.map.addLayer(this.tileLayer);
        this.map._zoomAnimated = true;
        leafletDataLayer._container.className += ' leaflet-zoom-hide';
      }
    }
    if (!prevProps || this.props.utfGridLayerUrl !== prevProps.utfGridLayerUrl) {
      if (this.utfGridLayer) {
        this.map.removeLayer(this.utfGridLayer);
        this.utfGridLayer = null;
      }
      if (this.props.utfGridLayerUrl) {
        this.utfGridLayer = new L.UtfGrid(this.props.utfGridLayerUrl, {
          useJsonP: false
        });
        this.map.addLayer(this.utfGridLayer);
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
