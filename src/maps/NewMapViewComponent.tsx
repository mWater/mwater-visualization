import _ from "lodash"
import { LayerSpecification, MapLayerEventType, MapLayerMouseEvent } from "maplibre-gl"
import { DataSource, Schema } from "mwater-expressions"
import React, { CSSProperties, ReactNode, useEffect, useMemo, useState } from "react"
import { useRef } from "react"
import { JsonQLFilter } from "../JsonQLFilter"
import { default as LayerFactory } from "./LayerFactory"
import { MapBounds, MapDesign, MapLayerView } from "./MapDesign"
import { MapDataSource } from "./MapDataSource"
import ModalPopupComponent from "react-library/lib/ModalPopupComponent"
import { useStableCallback } from "react-library/lib/useStableCallback"
import {
  getCompiledFilters as utilsGetCompiledFilters,
  getFilterableTables as utilsGetFilterableTables,
  MapScope
} from "./MapUtils"

import "maplibre-gl/dist/maplibre-gl.css"
import "./NewMapViewComponent.css"
import { LayerSwitcherComponent } from "./LayerSwitcherComponent"
import LegendComponent from "./LegendComponent"
import { AttributionControl, VectorMapLogo, mergeBaseAndUserStyle, useBaseStyle, useHoverCursor, useStyleMap, useThrottledMapResize, useVectorMap } from "./vectorMaps"

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

  /** Increment to force refresh */
  refreshTrigger?: number

  /** Optional callback that gets updated MapLibre map each render. Used to allow
   * external zooming/panning.
   */
  onMapUpdate?: (map: maplibregl.Map) => void
}) {
  const [mapDiv, setMapDiv] = useState<HTMLDivElement | null>(null)

  /** Last published bounds, to avoid recentering when self-changed bounds */
  const boundsRef = useRef<MapBounds>()

  /** Increments when a new user style is being generated. Indicates that
   * a change was made, so to discard current one
   */
  const userStyleIncrRef = useRef(0)

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

  // Load map
  const map = useVectorMap({
    divRef: mapDiv,
    bounds: props.design.bounds
      ? [props.design.bounds.w, props.design.bounds.s, props.design.bounds.e, props.design.bounds.n]
      : undefined,
      scrollZoom: props.scrollWheelZoom,
      dragPan: props.dragging,
      touchZoomRotate: props.touchZoom,
  })

  // Pass map upwards
  if (map && props.onMapUpdate) {
    props.onMapUpdate(map)
  }

  useThrottledMapResize(map, props.width, props.height)

  /** Handle a click on a layer */
  const handleLayerClick = useStableCallback((layerViewId: string, ev: { data: any; event: any }) => {
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
  })

  // Debounced version of handleLayerClick to prevent multiple popups
  const handleLayerClickDebounced = useMemo(() => {
    return _.debounce(handleLayerClick, 250, { leading: true, trailing: false })
  }, [handleLayerClick])
  
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
      console.log(defType, layerView.type)
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
        newClickHandlers = 
          vectorTileDef.mapLayersHandleClicks.map((mlid: any) => ({
            layerViewId: layerView.id,
            mapLayerId: mlid
          })).concat(newClickHandlers)
        
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

  // Update user layers
  useEffect(() => {
    updateUserStyle()
  }, [props.design.layerViews, props.scope, layersCreatedAfter, props.extraFilters, props.design.filters, props.design.globalFilters, props.refreshTrigger])

  // Style map
  useStyleMap({
    map,
    userStyle,
    baseLayer: props.design.baseLayer,
    baseLayerOpacity: props.design.baseLayerOpacity,
  })

  // Setup click handlers
  useEffect(() => {
    if (!map) {
      return
    }

    const removes: { (): void }[] = []

    for (const clickHandler of layerClickHandlers) {
      const onClick = (ev: MapLayerMouseEvent) => {
        if (ev.features && ev.features[0]) {
          handleLayerClickDebounced(clickHandler.layerViewId, {
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

  // Get user style layer ids
  const userLayerIds = useMemo(() => {
    if (!userStyle) {
      return []
    }
    return userStyle.layers.map((l) => l.id)
  }, [userStyle])

  // Setup hover effect
  useHoverCursor(map, userLayerIds)

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
      const mapBounds = { n: bounds.getNorth(), e: bounds.getEast(), s: bounds.getSouth(), w: bounds.getWest() }

      const design = {
        ...props.design,
        bounds: mapBounds
      }
      // Record bounds to prevent repeated application
      boundsRef.current = mapBounds
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

  // Autozoom if autozoom changed
  useEffect(() => {
    if (!map) {
      return
    }

    // Autozoom
    if (props.design.autoBounds) {
      performAutoZoom()
    }
  }, [map, props.design.autoBounds])

  // Set initial bounds
  useEffect(() => {
    if (!map) {
      return
    }

    if (!props.design.autoBounds && props.design.bounds) {
      // If we set the new bounds, do not update map bounds
      if (boundsRef.current == null || 
        props.design.bounds.n != boundsRef.current.n ||
        props.design.bounds.e != boundsRef.current.e ||
        props.design.bounds.s != boundsRef.current.s ||
        props.design.bounds.w != boundsRef.current.w) {
        map.fitBounds([props.design.bounds.w, props.design.bounds.s, props.design.bounds.e, props.design.bounds.n])
      }
    }
  }, [map, props.design.autoBounds, props.design.bounds])

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

  const [zoom, setZoom] = useState(map?.getZoom())

  useEffect(() =>  {
    const handleZoom = () => setZoom(map?.getZoom())
    if(map) {
      map.on('zoomend', handleZoom)
    }

    return () => {
      map?.off('zoomend', handleZoom)
    }
  }, [map])

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
      <div style={{ width: props.width, height: props.height }} ref={setMapDiv} />
      {renderLegend()}
      {renderBusy()}
      <AttributionControl 
        baseLayer={props.design.baseLayer}
        extraText={props.design.attribution} />
      <VectorMapLogo 
        baseLayer={props.design.baseLayer}
      />
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
