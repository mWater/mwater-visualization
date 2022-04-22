import _ from "lodash"
import maplibregl, { LayerSpecification, LngLatBoundsLike, MapLayerMouseEvent } from "maplibre-gl"
import { useEffect, useMemo, useState } from "react"
import { mapSymbols } from "./mapSymbols"

import "maplibre-gl/dist/maplibre-gl.css"
import "./NewMapViewComponent.css"
import React from "react"

/* Hooks and functions related to displaying a vector map */

export type BaseLayer = "bing_road" | "bing_aerial" | "cartodb_positron" | "cartodb_dark_matter" | "blank"

/** Loads a vector map, refreshing the WebGL context as needed */
export function useVectorMap(options: {
  divRef: HTMLDivElement | null
  bounds?: LngLatBoundsLike
  scrollZoom?: boolean
  dragPan?: boolean
  touchZoomRotate?: boolean
}) {
  const { divRef, bounds, scrollZoom, dragPan, touchZoomRotate } = options

  // Maplibre map
  const [map, setMap] = useState<maplibregl.Map>()

  // Tracks if map div is visible
  const [mapDivVisible, setMapDivVisible] = useState(false)

  // Tracks if map has webgl context
  const [hasWebGLContext, setHasWebGLContext] = useState(false)

  // Increments to trigger a map reload
  const [mapReloadCount, setMapReloadCount] = useState(0)

  // Observe visibility of map
  useEffect(() => {
    if (!divRef) {
      return
    }
    
    const observer = new IntersectionObserver(function(entries) {
      setMapDivVisible(entries[0].isIntersecting)
    })
    observer.observe(divRef)
    return () => {
      observer.disconnect()
    }
  }, [divRef])

  // If map div is visible, and no webgl context, trigger map load
  useEffect(() => {
    if (mapDivVisible && !hasWebGLContext) {
      setMapReloadCount(rc => rc + 1)
    }
  }, [mapDivVisible, hasWebGLContext])

  // Load map and symbols
  useEffect(() => {
    // Don't enable if invisible
    if (!mapDivVisible || !divRef) {
      return
    }

    const m = new maplibregl.Map({
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
      }
    })

    setHasWebGLContext(true)

    // Add listener for losing context
    m.on("webglcontextlost", () => {
      console.warn("Lost WebGL context")
      setHasWebGLContext(false)
    })

    // Add zoom controls to the map.
    m.addControl(new maplibregl.NavigationControl({}), "top-left")

    // Add scale control
    const scale = new maplibregl.ScaleControl({
      unit: "metric"
    })
    m.addControl(scale)

    // Speed up wheel scrolling
    m.scrollZoom.setWheelZoomRate(1 / 250)

    // Dynamically load symbols
    m.on("styleimagemissing" as any, function (ev: { id: string }) {
      // Check if known
      const mapSymbol = mapSymbols.find((s) => s.value == ev.id)
      if (mapSymbol) {
        m.loadImage(mapSymbol.url, (err: any, image: any) => {
          if (image && !m.hasImage(mapSymbol.value)) {
            m.addImage(mapSymbol.value, image, { sdf: true })
          }
        })
      }
    })

    setMap(m)

    return () => {
      m.remove()
      setHasWebGLContext(false)
    }
  }, [mapReloadCount])

  return map
}

/** Sets cursor as pointer when over any layers with the specified ids */
export function useHoverCursor(map: maplibregl.Map | undefined, layerIds: string[]) {
  // Setup hover effect
  useEffect(() => {
    if (!map) {
      return
    }

    const removes: { (): void }[] = []

    for (const layerId of layerIds) {
      const onEnter = (ev: MapLayerMouseEvent) => {
        map.getCanvas().style.cursor = 'pointer'
      }
      const onLeave = (ev: MapLayerMouseEvent) => {
        map.getCanvas().style.cursor = ''
      }
      map.on("mouseenter", layerId, onEnter)
      map.on("mouseleave", layerId, onLeave)
      removes.push(() => {
        map.off("mouseenter", layerId, onEnter)
        map.off("mouseleave", layerId, onLeave)
      })
    }
    return () => {
      for (const remove of removes) {
        remove()
      }
    }
  }, [map, layerIds])
}

/** Apply user style to a map with base style */
export function useStyleMap(options: {
  map: maplibregl.Map | undefined, 
  baseLayer: BaseLayer,
  baseLayerOpacity?: number | null,
  userStyle: maplibregl.StyleSpecification | null | undefined, 
}) {
  const { map, baseLayer, baseLayerOpacity, userStyle } = options

  // Load base style
  const baseStyle = useBaseStyle(baseLayer)

  // Update map style
  const style = useMemo(() => {
    return mergeBaseAndUserStyle(baseStyle, userStyle, baseLayerOpacity)
  }, [baseStyle, userStyle, baseLayerOpacity])

  // Set map style
  useEffect(() => {
    // Can't load until map and style are present
    if (!map || !style) {
      return
    }
    map.setStyle(style)
  }, [map, style])
}

/** Loads a base style for the map */
export function useBaseStyle(baseLayer: BaseLayer) {
  // Load base layer
  const [baseStyle, setBaseStyle] = useState<maplibregl.StyleSpecification | null>(null)

  useEffect(() => {
    function loadStyle(styleUrl: string) {
      // Load style
      fetch(styleUrl)
        .then((response) => response.json())
        .then((styleData: maplibregl.StyleSpecification) => {
          // Set style and update layers
          setBaseStyle(styleData)
        })
    }

    if (baseLayer == "cartodb_positron") {
      loadStyle("https://api.maptiler.com/maps/positron/style.json?key=wXgjrSOKxcDdRfpMMNYl")
    } else if (baseLayer == "cartodb_dark_matter") {
      loadStyle("https://api.maptiler.com/maps/darkmatter/style.json?key=wXgjrSOKxcDdRfpMMNYl")
    } else if (baseLayer == "bing_road") {
      loadStyle("https://api.maptiler.com/maps/streets/style.json?key=wXgjrSOKxcDdRfpMMNYl")
    } else if (baseLayer == "bing_aerial") {
      loadStyle("https://api.maptiler.com/maps/hybrid/style.json?key=wXgjrSOKxcDdRfpMMNYl")
    } else if (baseLayer == "blank") {
      setBaseStyle({
        version: 8,
        layers: [],
        sources: {}
      })
    }
  }, [baseLayer])

  return baseStyle
}

/** Combines a base style and a user style */
export function mergeBaseAndUserStyle(
  baseStyle: maplibregl.StyleSpecification | null | undefined, 
  userStyle: maplibregl.StyleSpecification | null | undefined, 
  baseLayerOpacity?: number | null) {
  // Merge until baseStyle and userStyle are present
  if (!baseStyle || !userStyle) {
    return null
  }

  // Create background layer to simulate base layer opacity
  const baseLayerOpacityLayer: LayerSpecification = {
    id: "baseLayerOpacity",
    type: "background",
    paint: {
      "background-color": "white",
      "background-opacity": 1 - (baseLayerOpacity != null ? baseLayerOpacity : 1)
    }
  }

  // Create style
  let layers = baseStyle.layers || []

  // Simulate base opacity
  if (baseLayerOpacity != null && baseLayerOpacity < 1) {
    layers = layers.concat([baseLayerOpacityLayer])
  }

  layers = layers.concat(userStyle.layers || [])

  const style: maplibregl.StyleSpecification = {
    ...baseStyle,
    sources: {
      ...baseStyle.sources,
      ...userStyle.sources
    },
    glyphs: baseStyle.glyphs || "https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=wXgjrSOKxcDdRfpMMNYl",
    layers
  }
  return style
}

/** Resizes map to width and height, throttling to avoid flicker and possibly bugs in maplibre when resizing too quickly */
export function useThrottledMapResize(map: maplibregl.Map | undefined, width: number, height: number) {
  // Throttle resize updates to avoid flicker
  const throttledResize = useMemo(() => {
    return _.debounce((map: maplibregl.Map) => {
      map.resize()
    }, 250, { leading: false, trailing: true })
  }, [])

  useEffect(() => {
    if (map) {
      throttledResize(map)
    }
  }, [width, height, map])
}

export function AttributionControl(props: { extraText?: string }) {
  return (
    <div className="newmap-attribution-control">
      <a href="https://www.maptiler.com/copyright/" target="_blank">
        &copy; MapTiler
      </a> 
      {" "}
      <a href="http://www.openstreetmap.org/about/" target="_blank">
        © OpenStreetMap
      </a>
      {props.extraText ? " " + props.extraText : null}
    </div>
  )
}

export function MapTilerLogo(props: {}) {
  return <img 
    src={require("./Maptiler-logo.png").default} 
    style={{ position: "absolute", bottom: 38, left: 11, height: 22, zIndex: 1000, pointerEvents: "none" }} 
  />
}