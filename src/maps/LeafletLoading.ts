// @ts-nocheck
import "./LeafletLoading.css"
import L from "leaflet"

// FROM: https://github.com/ebrelsford/Leaflet.loading
/*

Copyright (c) 2013 Eric Brelsford

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

/*
 * L.Control.Loading is a control that shows a loading indicator when tiles are
 * loading or when map-related AJAX requests are taking place.
 */

export default L.Control.extend({
  options: {
    delayIndicator: null,
    position: "topleft",
    separate: false,
    zoomControl: null,
    spinjs: false,
    spin: {
      lines: 7,
      length: 3,
      width: 3,
      radius: 5,
      rotate: 13,
      top: "83%"
    }
  },

  initialize: function (options: any) {
    L.setOptions(this, options)
    this._dataLoaders = {}

    // Try to set the zoom control this control is attached to from the
    // options
    if (this.options.zoomControl !== null) {
      this.zoomControl = this.options.zoomControl
    }
  },

  onAdd: function (map: any) {
    if (this.options.spinjs && typeof Spinner !== "function") {
      return console.error(
        "Leaflet.loading cannot load because you didn't load spin.js (http://fgnass.github.io/spin.js/), even though you set it in options."
      )
    }
    this._addLayerListeners(map)
    this._addMapListeners(map)

    // Try to set the zoom control this control is attached to from the map
    // the control is being added to
    if (!this.options.separate && !this.zoomControl) {
      if (map.zoomControl) {
        this.zoomControl = map.zoomControl
      } else if (map.zoomsliderControl) {
        this.zoomControl = map.zoomsliderControl
      }
    }

    // Create the loading indicator
    var classes = "leaflet-control-loading"
    var container
    if (this.zoomControl && !this.options.separate) {
      // If there is a zoom control, hook into the bottom of it
      container = this.zoomControl._container
      // These classes are no longer used as of Leaflet 0.6
      classes += " leaflet-bar-part-bottom leaflet-bar-part last"

      // Loading control will be added to the zoom control. So the visible last element is not the
      // last dom element anymore. So add the part-bottom class.
      L.DomUtil.addClass(this._getLastControlButton(), "leaflet-bar-part-bottom")
    } else {
      // Otherwise, create a container for the indicator
      container = L.DomUtil.create("div", "leaflet-control-zoom leaflet-bar")
    }
    this._indicator = L.DomUtil.create("a", classes, container)
    if (this.options.spinjs) {
      this._spinner = new Spinner(this.options.spin).spin()
      this._indicator.appendChild(this._spinner.el)
    }
    return container
  },

  onRemove: function (map: any) {
    this._removeLayerListeners(map)
    this._removeMapListeners(map)
  },

  removeFrom: function (map: any) {
    if (this.zoomControl && !this.options.separate) {
      // Override Control.removeFrom() to avoid clobbering the entire
      // _container, which is the same as zoomControl's
      this._container.removeChild(this._indicator)
      this._map = null
      this.onRemove(map)
      return this
    } else {
      // If this control is separate from the zoomControl, call the
      // parent method so we don't leave behind an empty container
      // REMOVED AS THIS METHOD DOESN'T EXIST
      // return L.Control.prototype.removeFrom.call(this, map);
    }
  },

  addLoader: function (id: any) {
    this._dataLoaders[id] = true
    if (this.options.delayIndicator && !this.delayIndicatorTimeout) {
      // If we are delaying showing the indicator and we're not
      // already waiting for that delay, set up a timeout.
      var that = this
      this.delayIndicatorTimeout = setTimeout(function () {
        that.updateIndicator()
        that.delayIndicatorTimeout = null
      }, this.options.delayIndicator)
    } else {
      // Otherwise show the indicator immediately
      this.updateIndicator()
    }
  },

  removeLoader: function (id: any) {
    delete this._dataLoaders[id]
    this.updateIndicator()

    // If removing this loader means we're in no danger of loading,
    // clear the timeout. This prevents old delays from instantly
    // triggering the indicator.
    if (this.options.delayIndicator && this.delayIndicatorTimeout && !this.isLoading()) {
      clearTimeout(this.delayIndicatorTimeout)
      this.delayIndicatorTimeout = null
    }
  },

  updateIndicator: function () {
    if (this.isLoading()) {
      this._showIndicator()
    } else {
      this._hideIndicator()
    }
  },

  isLoading: function () {
    return this._countLoaders() > 0
  },

  _countLoaders: function () {
    var size = 0,
      key
    for (key in this._dataLoaders) {
      if (this._dataLoaders.hasOwnProperty(key)) size++
    }
    return size
  },

  _showIndicator: function () {
    // Show loading indicator
    L.DomUtil.addClass(this._indicator, "is-loading")

    // If zoomControl exists, make the zoom-out button not last
    if (!this.options.separate) {
      if (this.zoomControl instanceof L.Control.Zoom) {
        L.DomUtil.removeClass(this._getLastControlButton(), "leaflet-bar-part-bottom")
      } else if (typeof L.Control.Zoomslider === "function" && this.zoomControl instanceof L.Control.Zoomslider) {
        L.DomUtil.removeClass(this.zoomControl._ui.zoomOut, "leaflet-bar-part-bottom")
      }
    }
  },

  _hideIndicator: function () {
    // Hide loading indicator
    L.DomUtil.removeClass(this._indicator, "is-loading")

    // If zoomControl exists, make the zoom-out button last
    if (!this.options.separate) {
      if (this.zoomControl instanceof L.Control.Zoom) {
        L.DomUtil.addClass(this._getLastControlButton(), "leaflet-bar-part-bottom")
      } else if (typeof L.Control.Zoomslider === "function" && this.zoomControl instanceof L.Control.Zoomslider) {
        L.DomUtil.addClass(this.zoomControl._ui.zoomOut, "leaflet-bar-part-bottom")
      }
    }
  },

  _getLastControlButton: function () {
    var container = this.zoomControl._container,
      index = container.children.length - 1

    // Find the last visible control button that is not our loading
    // indicator
    while (index > 0) {
      var button = container.children[index]
      if (!(this._indicator === button || button.offsetWidth === 0 || button.offsetHeight === 0)) {
        break
      }
      index--
    }

    return container.children[index]
  },

  _handleLoading: function (e: any) {
    this.addLoader(this.getEventId(e))
  },

  _handleBaseLayerChange: function (e: any) {
    var that = this

    // Check for a target 'layer' that contains multiple layers, such as
    // L.LayerGroup. This will happen if you have an L.LayerGroup in an
    // L.Control.Layers.
    if (e.layer && e.layer.eachLayer && typeof e.layer.eachLayer === "function") {
      e.layer.eachLayer(function (layer: any) {
        that._handleBaseLayerChange({ layer: layer })
      })
    } else {
      // If we're changing to a canvas layer, don't handle loading
      // as canvas layers will not fire load events.
      if (!(L.TileLayer.Canvas && e.layer instanceof L.TileLayer.Canvas)) {
        that._handleLoading(e)
      }
    }
  },

  _handleLoad: function (e: any) {
    this.removeLoader(this.getEventId(e))
  },

  getEventId: function (e: any) {
    if (e.id) {
      return e.id
    } else if (e.layer) {
      return e.layer._leaflet_id
    }
    return e.target._leaflet_id
  },

  _layerAdd: function (e: any) {
    if (!e.layer || !e.layer.on) return
    try {
      e.layer.on(
        {
          loading: this._handleLoading,
          load: this._handleLoad
        },
        this
      )
    } catch (exception) {
      console.warn("L.Control.Loading: Tried and failed to add " + " event handlers to layer", e.layer)
      console.warn("L.Control.Loading: Full details", exception)
    }
    if (e.layer._loading) this._handleLoading({ type: "loading", target: e.layer })
  },

  _layerRemove: function (e: any) {
    if (!e.layer || !e.layer.off) return
    try {
      e.layer.off(
        {
          loading: this._handleLoading,
          load: this._handleLoad
        },
        this
      )
    } catch (exception) {
      console.warn("L.Control.Loading: Tried and failed to remove " + "event handlers from layer", e.layer)
      console.warn("L.Control.Loading: Full details", exception)
    }
  },

  _addLayerListeners: function (map: any) {
    // Add listeners for begin and end of load to any layers already on the
    // map
    map.eachLayer(function (layer: any) {
      if (!layer.on) return
      layer.on(
        {
          loading: this._handleLoading,
          load: this._handleLoad
        },
        this
      )
    }, this)

    // When a layer is added to the map, add listeners for begin and end
    // of load
    map.on("layeradd", this._layerAdd, this)
    map.on("layerremove", this._layerRemove, this)
  },

  _removeLayerListeners: function (map: any) {
    // Remove listeners for begin and end of load from all layers
    map.eachLayer(function (layer: any) {
      if (!layer.off) return
      layer.off(
        {
          loading: this._handleLoading,
          load: this._handleLoad
        },
        this
      )
    }, this)

    // Remove layeradd/layerremove listener from map
    map.off("layeradd", this._layerAdd, this)
    map.off("layerremove", this._layerRemove, this)
  },

  _addMapListeners: function (map: any) {
    // Add listeners to the map for (custom) dataloading and dataload
    // events, eg, for AJAX calls that affect the map but will not be
    // reflected in the above layer events.
    map.on(
      {
        baselayerchange: this._handleBaseLayerChange,
        dataloading: this._handleLoading,
        dataload: this._handleLoad,
        layerremove: this._handleLoad
      },
      this
    )
  },

  _removeMapListeners: function (map: any) {
    map.off(
      {
        baselayerchange: this._handleBaseLayerChange,
        dataloading: this._handleLoading,
        dataload: this._handleLoad,
        layerremove: this._handleLoad
      },
      this
    )
  }
})
