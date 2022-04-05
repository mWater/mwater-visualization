import _ from "lodash"
import maplibregl, { LayerSpecification, MapLayerEventType, MapLayerMouseEvent } from "maplibre-gl"
import { DataSource, Schema } from "mwater-expressions"
import React, { CSSProperties, ReactNode, useEffect, useState } from "react"
import { useRef } from "react"
import { JsonQLFilter } from "../JsonQLFilter"
import { default as LayerFactory } from "./LayerFactory"
import { MapDesign, MapLayerView } from "./MapDesign"
import { MapDataSource } from "./MapDataSource"
import { mapSymbols } from "./mapSymbols"
import ModalPopupComponent from "react-library/lib/ModalPopupComponent"
import {
  getCompiledFilters as utilsGetCompiledFilters,
  getFilterableTables as utilsGetFilterableTables,
  MapScope
} from "./MapUtils"

import "maplibre-gl/dist/maplibre-gl.css"
import "./NewMapViewComponent.css"
import { LayerSwitcherComponent } from "./LayerSwitcherComponent"
import LegendComponent from "./LegendComponent"

type LayerClickHandlerEvent = maplibregl.MapMouseEvent & {
  features?: maplibregl.GeoJSONFeature[] | undefined
} //& maplibregl.EEventData

/** Component that displays just the map */
export function NewMapViewComponent(props: {
  schema: Schema
  dataSource: DataSource
  mapDataSource: MapDataSource

  design: MapDesign
  onDesignChange?: (design: MapDesign) => void

  /** Width in pixels */
  width: number

  /** Height in pixels */
  height: number

  /** Called with (tableId, rowId) when item is clicked */
  onRowClick?: (tableId: string, rowId: any) => void

  /** Extra filters to apply to view */
  extraFilters?: JsonQLFilter[]

  /** scope of the map (when a layer self-selects a particular scope) */
  scope?: MapScope

  /** called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details */
  onScopeChange: (scope: MapScope | null) => void

  /** Whether the map be draggable with mouse/touch or not. Default true */
  dragging?: boolean

  /** Whether the map can be zoomed by touch-dragging with two fingers. Default true */
  touchZoom?: boolean

  /** Whether the map can be zoomed by using the mouse wheel. Default true */
  scrollWheelZoom?: boolean

  /** Whether changes to zoom level should be persisted. Default false  */
  zoomLocked?: boolean

  /** Locale to use */
  locale: string
}) {
  const [map, setMap] = useState<maplibregl.Map>()
  const divRef = useRef<HTMLDivElement | null>(null)

  // Tracks if map div is visible
  const [mapDivVisible, setMapDivVisible] = useState(false)

  // Tracks if map has webgl context
  const [hasWebGLContext, setHasWebGLContext] = useState(false)

  // Increments to trigger a map reload
  const [mapReloadCount, setMapReloadCount] = useState(0)

  /** Increments when a new user style is being generated. Indicates that
   * a change was made, so to discard current one
   */
  const userStyleIncrRef = useRef(0)

  /** Style of the base layer */
  const [baseStyle, setBaseStyle] = useState<maplibregl.StyleSpecification>()

  /** Style of user layers */
  const [userStyle, setUserStyle] = useState<maplibregl.StyleSpecification>()

  /** Busy incrementable counter. Is busy if > 0 */
  const [busy, setBusy] = useState(0)

  /** Layer click handlers to attach */
  const [layerClickHandlers, setLayerClickHandlers] = useState<{ layerViewId: string; mapLayerId: string }[]>([])

  /** Contents of popup if open */
  const [popupContents, setPopupContents] = useState<ReactNode>()

  /** Date-time layers must have been created after on server. Used to support refreshing */
  const [layersCreatedAfter, setLayersCreatedAfter] = useState(new Date().toISOString())

  /** Date-time layers expire and must be recreated */
  const layersExpire = useRef<string>()

  // State of legend
  const initialLegendDisplay = props.design.initialLegendDisplay || "open"
  const [legendHidden, setLegendHidden] = useState(
    initialLegendDisplay == "closed" || (props.width < 500 && initialLegendDisplay == "closedIfSmall")
  )

  // Store handleClick function in a ref
  const handleLayerClickRef = useRef<(layerViewId: string, ev: { data: any; event: any }) => void>()

  /** Handle a click on a layer */
  function handleLayerClick(layerViewId: string, ev: { data: any; event: any }) {
    const layerView = props.design.layerViews.find((lv) => lv.id == layerViewId)!

    // Create layer
    const layer = LayerFactory.createLayer(layerView.type)

    // Clean design (prevent ever displaying invalid/legacy designs)
    const design = layer.cleanDesign(layerView.design, props.schema)

    // Handle click of layer
    const results = layer.onGridClick(ev, {
      design: design,
      schema: props.schema,
      dataSource: props.dataSource,
      layerDataSource: props.mapDataSource.getLayerDataSource(layerViewId),
      scopeData:
        props.scope && props.scope.data && props.scope.data.layerViewId == layerViewId
          ? props.scope.data.data
          : undefined,
      filters: getCompiledFilters()
    })

    if (!results) {
      return
    }

    // Handle popup first
    if (results.popup) {
      setPopupContents(results.popup)
    }

    // Handle onRowClick case
    if (results.row && props.onRowClick) {
      props.onRowClick(results.row.tableId, results.row.primaryKey)
    }

    // Handle scoping
    if (props.onScopeChange && _.has(results, "scope")) {
      let scope: MapScope | null
      if (results.scope) {
        // Encode layer view id into scope
        scope = {
          name: results.scope.name,
          filter: results.scope.filter,
          data: { layerViewId: layerViewId, data: results.scope.data }
        }
      } else {
        scope = null
      }

      props.onScopeChange(scope)
    }
  }

  // Store most up-to-date handleClick function in a ref
  handleLayerClickRef.current = handleLayerClick

  /** Get filters from extraFilters combined with map filters */
  function getCompiledFilters() {
    return (props.extraFilters || []).concat(
      utilsGetCompiledFilters(props.design, props.schema, utilsGetFilterableTables(props.design, props.schema))
    )
  }

  /** Determine user style */
  async function updateUserStyle() {
    // Determine current userStyleIncr
    userStyleIncrRef.current = userStyleIncrRef.current + 1
    const currentUserStyleIncr = userStyleIncrRef.current

    // Keep track of expires
    let earliestExpires: string | null = null

    const compiledFilters = getCompiledFilters()

    // Determine scoped filters
    const scopedCompiledFilters = props.scope ? compiledFilters.concat([props.scope.filter]) : compiledFilters

    // Sources to add
    const newSources: { [id: string]: maplibregl.SourceSpecification } = {}
    const newLayers: { layerViewId: string | null; layer: LayerSpecification }[] = []

    // Mapbox layers with click handlers. Each is in format
    let newClickHandlers: { layerViewId: string; mapLayerId: string }[] = []

    async function addLayer(layerView: MapLayerView, filters: JsonQLFilter[], opacity: number) {
      // TODO better way of hiding/showing layers?
      if (!layerView.visible) {
        return
      }

      const layer = LayerFactory.createLayer(layerView.type)

      // Clean design (prevent ever displaying invalid/legacy designs)
      const design = layer.cleanDesign(layerView.design, props.schema)

      // Ignore if invalid
      if (layer.validateDesign(design, props.schema)) {
        return
      }

      const defType = layer.getLayerDefinitionType()
      const layerDataSource = props.mapDataSource.getLayerDataSource(layerView.id)

      if (defType == "VectorTile") {
        // TODO attempt to re-use sources?

        // Get source url
        const { expires, url } = await layerDataSource.getVectorTileUrl(design, filters, layersCreatedAfter)
        if (!earliestExpires || expires < earliestExpires) {
          earliestExpires = expires
        }

        // Add source
        newSources[layerView.id] = {
          type: "vector",
          tiles: [url]
        }

        // Add layer
        const vectorTileDef = layer.getVectorTile(design, layerView.id, props.schema, filters, opacity)
        for (const mapLayer of vectorTileDef.mapLayers) {
          newLayers.push({ layerViewId: layerView.id, layer: mapLayer })
        }
        newClickHandlers = newClickHandlers.concat(
          vectorTileDef.mapLayersHandleClicks.map((mlid: any) => ({
            layerViewId: layerView.id,
            mapLayerId: mlid
          }))
        )
      } else {
        const tileUrl = props.mapDataSource.getLayerDataSource(layerView.id).getTileUrl(design, [])
        if (tileUrl) {
          // Replace "{s}" with "a", "b", "c"
          let tiles: string[] = []

          if (tileUrl.includes("{s}")) {
            tiles = [tileUrl.replace("{s}", "a"), tileUrl.replace("{s}", "b"), tileUrl.replace("{s}", "c")]
          } else {
            tiles = [tileUrl]
          }

          newSources[layerView.id] = {
            type: "raster",
            tiles,
            tileSize: 256
          }

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
          })
        }
      }
    }

    setBusy((b) => b + 1)

    try {
      for (const layerView of props.design.layerViews) {
        const isScoping = props.scope != null && props.scope.data.layerViewId == layerView.id

        // If layer is scoping, fade opacity and add extra filtered version
        await addLayer(
          layerView,
          isScoping ? compiledFilters : scopedCompiledFilters,
          isScoping ? layerView.opacity * 0.3 : layerView.opacity
        )
        if (isScoping) {
          await addLayer(layerView, scopedCompiledFilters, layerView.opacity)
        }
      }

      // If incremented, abort update, as is stale
      if (userStyleIncrRef.current != currentUserStyleIncr) {
        return
      }

      // Save expires
      if (earliestExpires) {
        layersExpire.current = earliestExpires
      }

      setLayerClickHandlers(newClickHandlers)

      setUserStyle({
        version: 8,
        sources: newSources,
        layers: newLayers.map((nl) => nl.layer)
      })
    } finally {
      setBusy((b) => b - 1)
    }
  }

  // Refresh periodically
  useEffect(() => {
    const interval = setInterval(() => {
      // If expired
      if (layersExpire.current && new Date().toISOString() > layersExpire.current) {
        // Set created after to now to force refresh
        setLayersCreatedAfter(new Date().toISOString())
        layersExpire.current = undefined
      }
    }, 5 * 60 * 1000)
    return () => {
      clearInterval(interval)
    }
  })

  // Observe visibility of map
  useEffect(() => {
    if (!divRef.current) {
      return
    }
    
    const observer = new IntersectionObserver(function(entries) {
      setMapDivVisible(entries[0].isIntersecting)
    })
    observer.observe(divRef.current)
    return () => {
      observer.disconnect()
    }
  }, [])

  // If map div is visible, and no webgl context, trigger map load
  useEffect(() => {
    if (mapDivVisible && !hasWebGLContext) {
      setMapReloadCount(rc => rc + 1)
    }
  }, [mapDivVisible, hasWebGLContext])

  // Load map and symbols
  useEffect(() => {
    // Don't enable if invisible
    if (!mapDivVisible) {
      return
    }

    const m = new maplibregl.Map({
      container: divRef.current!,
      bounds: props.design.bounds
        ? [props.design.bounds.w, props.design.bounds.s, props.design.bounds.e, props.design.bounds.n]
        : undefined,
      scrollZoom: props.scrollWheelZoom === false ? false : true,
      dragPan: props.dragging === false ? false : true,
      touchZoomRotate: props.touchZoom === false ? false : true,
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

  // Load base layer
  useEffect(() => {
    if (!map) {
      return
    }

    function loadStyle(styleUrl: string) {
      // Load style
      fetch(styleUrl)
        .then((response) => response.json())
        .then((styleData: maplibregl.StyleSpecification) => {
          // Set style and update layers
          setBaseStyle(styleData)
        })
    }

    if (props.design.baseLayer == "cartodb_positron") {
      loadStyle("https://api.maptiler.com/maps/positron/style.json?key=wXgjrSOKxcDdRfpMMNYl")
    } else if (props.design.baseLayer == "cartodb_dark_matter") {
      loadStyle("https://api.maptiler.com/maps/darkmatter/style.json?key=wXgjrSOKxcDdRfpMMNYl")
    } else if (props.design.baseLayer == "bing_road") {
      loadStyle("https://api.maptiler.com/maps/streets/style.json?key=wXgjrSOKxcDdRfpMMNYl")
    } else if (props.design.baseLayer == "bing_aerial") {
      loadStyle("https://api.maptiler.com/maps/hybrid/style.json?key=wXgjrSOKxcDdRfpMMNYl")
    } else if (props.design.baseLayer == "blank") {
      setBaseStyle({
        version: 8,
        layers: [],
        sources: {}
      })
    }
  }, [map, props.design.baseLayer])

  // Update user layers
  useEffect(() => {
    updateUserStyle()
  }, [props.design.layerViews, props.scope, baseStyle, layersCreatedAfter, props.extraFilters, props.design.filters, props.design.globalFilters])

  // Update map style
  useEffect(() => {
    // Can't load until map, baseStyle and userStyle are present
    if (!map || !baseStyle || !userStyle) {
      return
    }

    // Create background layer to simulate base layer opacity
    const baseLayerOpacityLayer: LayerSpecification = {
      id: "baseLayerOpacity",
      type: "background",
      paint: {
        "background-color": "white",
        "background-opacity": 1 - (props.design.baseLayerOpacity != null ? props.design.baseLayerOpacity : 1)
      }
    }

    // Create style
    let layers = baseStyle.layers || []

    // Simulate base opacity
    if (props.design.baseLayerOpacity != null && props.design.baseLayerOpacity < 1) {
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

    map.setStyle(style)
  }, [map, baseStyle, userStyle, props.design.baseLayerOpacity])

  // Setup click handlers
  useEffect(() => {
    if (!map) {
      return
    }

    const removes: { (): void }[] = []

    for (const clickHandler of layerClickHandlers) {
      const onClick = (ev: MapLayerMouseEvent) => {
        if (ev.features && ev.features[0]) {
          handleLayerClickRef.current!(clickHandler.layerViewId, {
            data: ev.features![0].properties,
            event: ev
          })
        }
      }
      map.on("click", clickHandler.mapLayerId, onClick)
      removes.push(() => {
        map.off("click", clickHandler.mapLayerId, onClick)
      })
    }
    return () => {
      for (const remove of removes) {
        remove()
      }
    }
  }, [map, layerClickHandlers])

  // Setup hover effect
  useEffect(() => {
    if (!map || !userStyle) {
      return
    }

    const removes: { (): void }[] = []

    for (const layer of userStyle.layers) {
      const onEnter = (ev: MapLayerMouseEvent) => {
        map.getCanvas().style.cursor = 'pointer'
      }
      const onLeave = (ev: MapLayerMouseEvent) => {
        map.getCanvas().style.cursor = ''
      }
      map.on("mouseenter", layer.id, onEnter)
      map.on("mouseleave", layer.id, onLeave)
      removes.push(() => {
        map.off("mouseenter", layer.id, onEnter)
        map.off("mouseleave", layer.id, onLeave)
      })
    }
    return () => {
      for (const remove of removes) {
        remove()
      }
    }
  }, [map, userStyle])
  
  // Capture movements on map to update bounds
  useEffect(() => {
    if (!map) {
      return
    }

    function onMoveEnd() {
      // Ignore if readonly
      if (props.onDesignChange == null) {
        return
      }
      if (props.zoomLocked) {
        return
      }
      // Ignore if autoBounds
      if (props.design.autoBounds) {
        return
      }
      const bounds = map!.getBounds()

      const design = {
        ...props.design,
        bounds: { n: bounds.getNorth(), e: bounds.getEast(), s: bounds.getSouth(), w: bounds.getWest() }
      }
      props.onDesignChange(design)
    }

    map.on("moveend", onMoveEnd)
    return () => {
      map.off("moveend", onMoveEnd)
    }
  }, [props.onDesignChange, props.zoomLocked, props.design, map])

  function performAutoZoom() {
    props.mapDataSource.getBounds(props.design, getCompiledFilters(), (error, bounds) => {
      if (bounds) {
        map!.fitBounds([bounds.w, bounds.s, bounds.e, bounds.n], { padding: 20 })

        // Also record if editable as part of bounds
        if (props.onDesignChange) {
          props.onDesignChange({ ...props.design, bounds })
        }
      }
    })
  }

  // Autozoom if filters or autozoom changed
  useEffect(() => {
    if (!map) {
      return
    }

    // Autozoom
    if (props.design.autoBounds) {
      performAutoZoom()
    }
  }, [map, props.design.filters, props.design.globalFilters, props.extraFilters, props.design.autoBounds])

  // Set initial bounds
  useEffect(() => {
    if (!map) {
      return
    }

    if (!props.design.autoBounds && props.design.bounds) {
      map.fitBounds([props.design.bounds.w, props.design.bounds.s, props.design.bounds.e, props.design.bounds.n])
    }
  }, [map])

  // Update max zoom
  useEffect(() => {
    if (map) {
      map.setMaxZoom(props.design.maxZoom != null ? props.design.maxZoom : undefined)
    }
  }, [map, props.design.maxZoom])

  function renderPopup() {
    if (!popupContents) {
      return null
    }

    return (
      <ModalPopupComponent onClose={() => setPopupContents(null)} showCloseX size="x-large">
        {/* Render in fixed height div so that dashboard doesn't collapse to nothing */}
        <div style={{ height: "80vh" }}>{popupContents}</div>
        <div style={{ textAlign: "right", marginTop: 10 }}>
          <button className="btn btn-secondary" onClick={() => setPopupContents(null)}>
            Close
          </button>
        </div>
      </ModalPopupComponent>
    )
  }

  function renderLegend() {
    if (legendHidden) {
      return <HiddenLegend onShow={() => setLegendHidden(false)} />
    } else {
      return (
        <LegendComponent
          schema={props.schema}
          layerViews={props.design.layerViews}
          filters={getCompiledFilters()}
          zoom={map ? map.getZoom() : null}
          dataSource={props.dataSource}
          locale={props.locale}
          onHide={() => setLegendHidden(true)}
        />
      )
    }
  }

  /** Render a spinner if loading */
  function renderBusy() {
    if (busy == 0) {
      return null
    }

    return (
      <div
        key="busy"
        style={{
          position: "absolute",
          top: 100,
          left: 9,
          backgroundColor: "white",
          border: "solid 1px #CCC",
          padding: 7,
          borderRadius: 5
        }}
      >
        <i className="fa fa-spinner fa-spin" />
      </div>
    )
  }

  // Overflow hidden because of problem of exceeding div
  return (
    <div style={{ width: props.width, height: props.height, position: "relative" }}>
      {renderPopup()}
      {props.onDesignChange != null && props.design.showLayerSwitcher ? (
        <LayerSwitcherComponent design={props.design} onDesignChange={props.onDesignChange} />
      ) : null}
      <div style={{ width: props.width, height: props.height }} ref={divRef} />
      {renderLegend()}
      {renderBusy()}
      <AttributionControl extraText={props.design.attribution} />
      <MapTilerLogo />
    </div>
  )
}

/** Legend display tab at bottom right */
function HiddenLegend(props: { onShow: () => void }) {
  const style: CSSProperties = {
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
  }

  return (
    <div style={style} onClick={props.onShow}>
      <i className="fa fa-angle-double-left" />
    </div>
  )
}

function AttributionControl(props: { extraText?: string }) {
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

function MapTilerLogo(props: {}) {
  return <img 
    src={require("./Maptiler-logo.png").default} 
    style={{ position: "absolute", bottom: 38, left: 11, height: 22, zIndex: 1000, pointerEvents: "none" }} 
  />
}