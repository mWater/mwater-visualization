// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let LeafletMapComponent
import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
import ReactDOM from "react-dom"
const R = React.createElement
import L from "leaflet"
import BingLayer from "./BingLayer"
import UtfGridLayer from "./UtfGridLayer"
import LeafletLoading from "./LeafletLoading"

// See https://github.com/PaulLeCam/react-leaflet/issues/255#issuecomment-261904061 for issue with CSS + webpack
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png").default,
  iconUrl: require("leaflet/dist/images/marker-icon.png").default,
  shadowUrl: require("leaflet/dist/images/marker-shadow.png").default
})

// Leaflet map component that displays a base layer, a tile layer and an optional interactivity layer
export default LeafletMapComponent = (function () {
  LeafletMapComponent = class LeafletMapComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        baseLayerId: PropTypes.string.isRequired, // "bing_road", "bing_aerial", "cartodb_positron", "cartodb_dark_matter", "white"
        baseLayerOpacity: PropTypes.number, // Optional opacity 0-1

        initialBounds: PropTypes.shape({
          w: PropTypes.number.isRequired,
          n: PropTypes.number.isRequired,
          e: PropTypes.number.isRequired,
          s: PropTypes.number.isRequired
        }), // Initial bounds. Fit world if none

        width: PropTypes.any, // Required width
        height: PropTypes.any, // Required height

        onBoundsChange: PropTypes.func, // Called with bounds in w, n, s, e format when bounds change

        // See .d.ts for docs on this
        layers: PropTypes.any, // List of layers

        // Legend. Will have zoom injected
        legend: PropTypes.node, // Legend element

        dragging: PropTypes.bool, // Whether the map be draggable with mouse/touch or not. Default true
        touchZoom: PropTypes.bool, // Whether the map can be zoomed by touch-dragging with two fingers. Default true
        scrollWheelZoom: PropTypes.bool, // Whether the map can be zoomed by using the mouse wheel. Default true
        keyboard: PropTypes.bool, // Whether the map responds to keyboard. Default true

        minZoom: PropTypes.number, // Minimum zoom level
        maxZoom: PropTypes.number, // Maximum zoom level
        extraAttribution: PropTypes.string, // User defined attributions

        loadingSpinner: PropTypes.bool, // True to add loading spinner

        scaleControl: PropTypes.bool, // True to show scale control

        popup: PropTypes.shape({
          // Set to display a Leaflet popup control
          lat: PropTypes.number.isRequired,
          lng: PropTypes.number.isRequired,
          contents: PropTypes.node.isRequired
        })
      }

      this.defaultProps = {
        dragging: true,
        touchZoom: true,
        scrollWheelZoom: true,
        scaleControl: true,
        keyboard: true
      }
    }

    // Reload all tiles
    reload() {
      // TODO reload JSON tiles
      return this.tileLayers.map((tileLayer) => tileLayer.redraw())
    }

    // Get underlying leaflet map
    getLeafletMap() {
      return this.map
    }

    // Get bounds. Bounds are in { w, n, s, e } format
    getBounds() {
      const curBounds = this.map.getBounds()
      return {
        n: curBounds.getNorth(),
        e: curBounds.getEast(),
        s: curBounds.getSouth(),
        w: curBounds.getWest()
      }
    }

    // Set bounds. Bounds are in { w, n, s, e } format. Padding is optional
    setBounds(bounds, pad) {
      if (bounds) {
        // Ignore if same as current
        if (this.hasBounds) {
          const curBounds = this.map.getBounds()
          if (
            curBounds &&
            curBounds.getWest() === bounds.w &&
            curBounds.getEast() === bounds.e &&
            curBounds.getNorth() === bounds.n &&
            curBounds.getSouth() === bounds.s
          ) {
            return
          }
        }

        // Check that bounds contain some actual area (hangs leaflet if not https://github.com/mWater/mwater-visualization/issues/127)
        let { n } = bounds
        const { w } = bounds
        const { s } = bounds
        let { e } = bounds
        if (n === s) {
          n += 0.001
        }
        if (e === w) {
          e += 0.001
        }

        let lBounds = new L.LatLngBounds([
          [s, w],
          [n, e]
        ])
        if (pad) {
          lBounds = lBounds.pad(pad)
        }

        this.map.fitBounds(lBounds, { animate: true })
      } else {
        // Fit world doesn't work sometimes. Make sure that entire left-right is included
        this.map.fitBounds([
          [-1, -180],
          [1, 180]
        ])
      }

      return (this.hasBounds = true)
    }

    componentDidMount() {
      // Create map
      const mapOptions = {
        fadeAnimation: false,
        dragging: this.props.dragging,
        touchZoom: this.props.touchZoom,
        scrollWheelZoom: this.props.scrollWheelZoom,
        minZoom: 1, // Bing doesn't allow going to zero
        keyboard: this.props.keyboard
      }

      // Must not be null, or will not zoom
      if (this.props.maxZoom != null) {
        mapOptions.maxZoom = this.props.maxZoom
      }

      if (this.props.minZoom != null) {
        mapOptions.minZoom = this.props.minZoom
      }

      this.map = L.map(this.mapElem, mapOptions)

      if (this.props.scaleControl) {
        L.control.scale().addTo(this.map)
      }

      // Update legend on zoom
      this.map.on("zoomend", () => this.forceUpdate())

      // Update legend on first load
      this.map.on("load", () => {
        this.loaded = true
        return this.forceUpdate()
      })

      // Fire onBoundsChange
      this.map.on("moveend", () => {
        if (this.props.onBoundsChange) {
          const bounds = this.map.getBounds()
          return this.props.onBoundsChange({
            w: bounds.getWest(),
            n: bounds.getNorth(),
            e: bounds.getEast(),
            s: bounds.getSouth()
          })
        }
      })

      this.setBounds(this.props.initialBounds)

      if (this.props.loadingSpinner) {
        const loadingControl = new LeafletLoading({
          separate: true
        })
        this.map.addControl(loadingControl)
      }

      // Update map with no previous properties
      return this.updateMap()
    }

    componentDidUpdate(prevProps) {
      return this.updateMap(prevProps)
    }

    componentWillUnmount() {
      return this.map?.remove()
    }

    // Open a popup.
    // Options:
    //   contents: React element of contents
    //   location: lat/lng
    //   offset: x and y of offset
    openPopup(options) {
      const popupDiv = L.DomUtil.create("div", "")
      return ReactDOM.render(options.contents, popupDiv, () => {
        let popup
        return (popup = L.popup({ minWidth: 100, offset: options.offset, autoPan: true })
          .setLatLng(options.location)
          .setContent(popupDiv)
          .openOn(this.map))
      })
    }

    updateMap(prevProps) {
      // Update size
      if (prevProps && (prevProps.width !== this.props.width || prevProps.height !== this.props.height)) {
        this.map.invalidateSize()
      }

      // Update maxZoom
      if (prevProps && prevProps.maxZoom !== this.props.maxZoom) {
        this.map.options.maxZoom = this.props.maxZoom
        if (this.map.getZoom() > this.props.maxZoom) {
          this.map.setZoom(this.props.maxZoom)
        }
      }

      // Update attribution
      if (!prevProps || this.props.extraAttribution !== prevProps.extraAttribution) {
        if (this.baseLayer) {
          this.baseLayer._map.attributionControl.removeAttribution(prevProps.extraAttribution)
          this.baseLayer._map.attributionControl.addAttribution(this.props.extraAttribution)
        }
      }

      // Update popup
      if (prevProps && prevProps.popup && !this.props.popup) {
        // If existing popupDiv, unmount
        if (this.popupDiv) {
          ReactDOM.unmountComponentAtNode(this.popupDiv)
          this.popupDiv = null
        }

        // Close popup
        this.map.removeLayer(this.popupLayer)
        this.popupLayer = null
      } else if (prevProps && prevProps.popup && this.props.popup) {
        // Move location
        if (prevProps.popup.lat !== this.props.popup.lat || prevProps.popup.lng !== this.props.popup.lng) {
          this.popupLayer.setLatLng(L.latLng(this.props.popup.lat, this.props.popup.lng))
        }

        // Re-render contents
        ReactDOM.render(this.props.popup.contents, this.popupDiv)
      } else if (this.props.popup) {
        // Create popup
        this.popupDiv = L.DomUtil.create("div", "")
        ReactDOM.render(this.props.popup.contents, this.popupDiv)

        this.popupLayer = L.popup({ minWidth: 100, autoPan: true, closeButton: false, closeOnClick: false })
          .setLatLng(L.latLng(this.props.popup.lat, this.props.popup.lng))
          .setContent(this.popupDiv)
          .openOn(this.map)
      }

      // Update base layer
      if (
        !prevProps ||
        this.props.baseLayerId !== prevProps.baseLayerId ||
        this.props.baseLayerOpacity !== prevProps.baseLayerOpacity
      ) {
        if (this.baseLayer) {
          this.map.removeLayer(this.baseLayer)
          this.baseLayer = null
        }

        switch (this.props.baseLayerId) {
          case "bing_road":
            this.baseLayer = new BingLayer("Ao26dWY2IC8PjorsJKFaoR85EPXCnCohrJdisCWXIULAXFo0JAXquGauppTMQbyU", {
              type: "Road"
            })
            break
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
            })
            break
          case "cartodb_positron":
            this.baseLayer = L.tileLayer(
              "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",
              {
                attribution:
                  '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://cartodb.com/attributions">CartoDB</a>',
                maxZoom: 21
              }
            )
            break
          case "cartodb_dark_matter":
            this.baseLayer = L.tileLayer(
              "https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png",
              {
                attribution:
                  '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://cartodb.com/attributions">CartoDB</a>',
                maxZoom: 21
              }
            )
            break
        }

        if (this.baseLayer) {
          this.map.addLayer(this.baseLayer)
          if (this.props.baseLayerOpacity != null) {
            this.baseLayer.setOpacity(this.props.baseLayerOpacity)
          }

          if (this.props.extraAttribution) {
            this.baseLayer._map.attributionControl.addAttribution(this.props.extraAttribution)
          }

          // Base layers are always at back
          this.baseLayer.bringToBack()
        }
      }

      // Update layers
      if (
        !prevProps ||
        JSON.stringify(_.omit(this.props.layers, "onGridClick", "onGridHover", "onClick")) !==
          JSON.stringify(_.omit(prevProps.layers, "onGridClick", "onGridHover", "onClick"))
      ) {
        // TODO naive
        // TODO This is naive. Could be more surgical about updates
        let geoJsonLayer, tileLayer, utfGridLayer
        if (this.tileLayers) {
          for (tileLayer of this.tileLayers) {
            this.map.removeLayer(tileLayer)
          }
          this.tileLayers = null
        }

        if (this.utfGridLayers) {
          for (utfGridLayer of this.utfGridLayers) {
            this.map.removeLayer(utfGridLayer)
          }
          this.utfGridLayers = null
        }

        // Remove Geojson layers
        if (this.geoJsonLayers) {
          for (geoJsonLayer of this.geoJsonLayers) {
            this.map.removeLayer(geoJsonLayer)
          }
          this.geoJsonLayers = null
        }

        if (this.props.layers) {
          let layer
          this.tileLayers = []
          this.geoJsonLayers = []

          for (layer of this.props.layers) {
            // Handle Tile layer
            if (layer.tileUrl) {
              // Do not display if not visible
              if (!layer.visible) {
                continue
              }

              const options = { opacity: layer.opacity }

              // Putting null seems to make layer vanish
              if (layer.minZoom) {
                options.minZoom = layer.minZoom
              }
              if (layer.maxZoom) {
                options.maxZoom = layer.maxZoom
              }

              tileLayer = L.tileLayer(layer.tileUrl, options)
              this.tileLayers.push(tileLayer)

              // TODO Hack for animated zooming
              this.map._zoomAnimated = false
              this.map.addLayer(tileLayer)
              this.map._zoomAnimated = true
              tileLayer._container.className += " leaflet-zoom-hide"
            } else if (layer.geometry) {
              geoJsonLayer = L.geoJSON(layer.geometry, {
                // Put in front
                pane: "markerPane",
                style: layer.style,
                interactive: layer.nonInteractive ? false : true,
                pointToLayer: (geojson, latlng) => {
                  if (layer.pointStyle) {
                    return L.circleMarker(
                      latlng,
                      _.extend({}, layer.pointStyle, { interactive: layer.nonInteractive ? false : true })
                    )
                  } else {
                    return L.marker(latlng, { interactive: layer.nonInteractive ? false : true })
                  }
                }
              })
              if (layer.onClick) {
                geoJsonLayer.on("click", layer.onClick)
              }
              this.geoJsonLayers.push(geoJsonLayer)
              this.map.addLayer(geoJsonLayer)
            }
          }

          this.utfGridLayers = []
          // Add grid layers in reverse order
          return (() => {
            const result = []
            for (layer of this.props.layers.slice().reverse()) {
              if (!layer.visible) {
                continue
              }

              if (layer.utfGridUrl) {
                utfGridLayer = new UtfGridLayer(layer.utfGridUrl, {
                  useJsonP: false,
                  minZoom: layer.minZoom || undefined,
                  maxZoom: layer.maxZoom || undefined
                })

                this.map.addLayer(utfGridLayer)
                this.utfGridLayers.push(utfGridLayer)

                if (layer.onGridClick) {
                  ;((layer) => {
                    return utfGridLayer.on("click", (ev) => {
                      return layer.onGridClick(ev)
                    })
                  })(layer)
                }

                if (layer.onGridHover) {
                  result.push(
                    ((layer) => {
                      utfGridLayer.on("mouseout", (ev) => {
                        return layer.onGridHover(_.omit(ev, "data"))
                      })
                      utfGridLayer.on("mouseover", (ev) => {
                        return layer.onGridHover(ev)
                      })
                      return utfGridLayer.on("mousemove", (ev) => {
                        return layer.onGridHover(ev)
                      })
                    })(layer)
                  )
                } else {
                  result.push(undefined)
                }
              } else {
                result.push(undefined)
              }
            }
            return result
          })()
        }
      }
    }

    render() {
      return R(
        "div",
        null,
        this.props.legend && this.loaded
          ? // Inject zoom
            React.cloneElement(this.props.legend, { zoom: this.map.getZoom() })
          : undefined,
        R("div", {
          ref: (c) => {
            return (this.mapElem = c)
          },
          style: { width: this.props.width, height: this.props.height }
        })
      )
    }
  }
  LeafletMapComponent.initClass()
  return LeafletMapComponent
})()
