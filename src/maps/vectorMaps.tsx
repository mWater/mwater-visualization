import _ from "lodash"
import maplibregl, { LayerSpecification, LngLatBoundsLike, MapLayerMouseEvent } from "maplibre-gl"
import { useEffect, useMemo, useState } from "react"
import { mapSymbols } from "./mapSymbols"

import "maplibre-gl/dist/maplibre-gl.css"
import "./NewMapViewComponent.css"
import React from "react"

/* Hooks and functions related to displaying a vector map */

let mapTilerApiKey = ""

/** This must be called to set the appropriate key before use. If it is not set, vector maps will not function.
 * Maps will fall back to leaflet if the key is not set or if set to ""
 */
export function setMapTilerApiKey(key: string) {
  mapTilerApiKey = key
}

export function getMapTilerApiKey(): string {
  return mapTilerApiKey
}

/** Check if vector maps are enabled by setting API key */
export function areVectorMapsEnabled() {
  return mapTilerApiKey !== ""
}

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
      loadStyle(`https://api.maptiler.com/maps/positron/style.json?key=${mapTilerApiKey}`)
    } else if (baseLayer == "cartodb_dark_matter") {
      loadStyle(`https://api.maptiler.com/maps/darkmatter/style.json?key=${mapTilerApiKey}`)
    } else if (baseLayer == "bing_road") {
      loadStyle(`https://api.maptiler.com/maps/streets/style.json?key=${mapTilerApiKey}`)
    } else if (baseLayer == "bing_aerial") {
      // Switched to Bing for superior aerial imagery
      loadBingBasemap("AerialWithLabels", 1).then(setBaseStyle)
      // loadStyle(`https://api.maptiler.com/maps/hybrid/style.json?key=${mapTilerApiKey}`)
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
    glyphs: baseStyle.glyphs || `https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=${mapTilerApiKey}`,
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

export function AttributionControl(props: { 
  baseLayer: BaseLayer
  extraText?: string 
}) {
  if (props.baseLayer == "blank") {
    return <div className="newmap-attribution-control">
      {props.extraText ? " " + props.extraText : null}
    </div>
  }

  if (props.baseLayer == "bing_aerial") {
    return (
      <div className="newmap-attribution-control">
        Copyright © 2022 Microsoft and its suppliers.
        {props.extraText ? " " + props.extraText : null}
      </div>
    )
  }

  return (
    <div className="newmap-attribution-control">
      <a href="https://www.maptiler.com/copyright/" target="_blank">
        &copy; MapTiler
      </a> 
      {" "}
      <a href="https://www.openstreetmap.org/about/" target="_blank">
        © OpenStreetMap
      </a>
      {props.extraText ? " " + props.extraText : null}
    </div>
  )
}

export function VectorMapLogo(props: {
  baseLayer: BaseLayer
}) {
  if (props.baseLayer == "blank") {
    return null
  }

  if (props.baseLayer == "bing_aerial") {
    return <img 
      src="https://dev.virtualearth.net/Branding/logo_powered_by.png" 
      style={{ position: "absolute", bottom: 38, left: 11, height: 22, zIndex: 1000, pointerEvents: "none" }} 
    />
  }

  return <img 
    src={require("./Maptiler-logo.png").default} 
    style={{ position: "absolute", bottom: 38, left: 11, height: 22, zIndex: 1000, pointerEvents: "none" }} 
  />
}

async function loadBingBasemap(basemapType: "AerialWithLabels", opacity: number): Promise<maplibregl.StyleSpecification> {
  // Load metadata
  const bingApiKey = "Ao26dWY2IC8PjorsJKFaoR85EPXCnCohrJdisCWXIULAXFo0JAXquGauppTMQbyU"

  const metadata = await fetch(`https://dev.virtualearth.net/REST/v1/Imagery/Metadata/${basemapType}?key=${bingApiKey}`).then((response) => response.json())
  const resource = metadata.resourceSets[0].resources[0]
  
  return {
    sources: {
      "bing_raster": {
        type: "raster",
        tiles: resource.imageUrlSubdomains.map((subdomain: string) => 
          resource.imageUrl.replace("{subdomain}", subdomain).replace("{culture}", "").replace("http:", "https:")),
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
  }
}
