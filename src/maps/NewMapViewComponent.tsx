import _ from "lodash"
import mapboxgl from "mapbox-gl"
import { DataSource, Schema } from "mwater-expressions"
import React, { CSSProperties, ReactNode, useEffect, useState } from "react"
import { useRef } from "react"
import { JsonQLFilter } from ".."
import { default as LayerFactory } from "./LayerFactory"
import { MapDesign, MapLayerView } from "./MapDesign"
import { MapDataSource } from "./MapDataSource"
import { mapSymbols } from "./mapSymbols"
import ModalPopupComponent from 'react-library/lib/ModalPopupComponent'
import { getCompiledFilters as utilsGetCompiledFilters, getFilterableTables as utilsGetFilterableTables } from './MapUtils'

import 'mapbox-gl/dist/mapbox-gl.css'
import { LayerSwitcherComponent } from "./LayerSwitcherComponent"
import LegendComponent from "./LegendComponent"

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
  const [map, setMap] = useState<mapboxgl.Map>()
  const divRef = useRef<HTMLDivElement | null>(null)

  /** Current design (to detect if has changed) */
  const designRef = useRef<MapDesign>()

  /** Ids of layers present */
  const currentLayersRef = useRef<mapboxgl.AnyLayer[]>([])

  /** Ids of sources present */
  const currentSourcesRef = useRef<{ id: string, sourceData: mapboxgl.AnySourceData }[]>([])

  /** True when symbols have been added to map */
  const [symbolsAdded, setSymbolsAdded] = useState(false)

  const [popupContents, setPopupContents] = useState<ReactNode>()

  // State of legend
  const initialLegendDisplay = props.design.initialLegendDisplay || "open"
  const [legendHidden, setLegendHidden] = useState(initialLegendDisplay == "closed" || (props.width < 500 && initialLegendDisplay == "closedIfSmall"))

  // Store design in ref to detect changes
  useEffect(() => { designRef.current = props.design }, [props.design])

  /** Get filters from extraFilters combined with map filters */
  function getCompiledFilters() {
    return (props.extraFilters || []).concat(utilsGetCompiledFilters(props.design, props.schema, utilsGetFilterableTables(props.design, props.schema)))
  }

  /** Make layers of map match the design */
  async function updateLayers() {
    if (!map) {
      return
    }

    // Keep track of expires

    const compiledFilters = getCompiledFilters()

    // Determine scoped filters
    const scopedCompiledFilters = props.scope ? compiledFilters.concat([props.scope.filter]) : compiledFilters

    // Sources to add
    const newSources: { id: string, sourceData: mapboxgl.AnySourceData }[] = []
    const newLayers: mapboxgl.AnyLayer[] = []

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
        // TODO attempt to re-use sources
        // Get source url
        const { expires, url } = await layerDataSource.getVectorTileUrl(layerView.design, filters)

        // Add source
        newSources.push({ id: layerView.id, sourceData: {
          type: "vector",
          tiles: [url]
        }})

        // Add layer
        const subLayers = layer.getVectorTile(layerView.design, layerView.id, props.schema, filters, opacity).subLayers
        for (const sublayer of subLayers) {
          newLayers.push(sublayer)
        }
      }
      else {
        const tileUrl = props.mapDataSource.getLayerDataSource(layerView.id).getTileUrl(layerView.design, [])
        if (tileUrl) {
          newSources.push({ id: layerView.id, sourceData: {
            type: "raster",
            tiles: [tileUrl]
          }})

          newLayers.push({
            id: layerView.id,
            type: "raster",
            source: layerView.id,
            paint: {
              "raster-opacity": opacity
            }
          })
        }
      }
    }

    for (const layerView of props.design.layerViews) {
      const isScoping = props.scope != null && props.scope.data.layerViewId == layerView.id

      // If layer is scoping, fade opacity and add extra filtered version
      await addLayer(layerView, isScoping ? compiledFilters : scopedCompiledFilters, isScoping ? layerView.opacity * 0.3 : layerView.opacity)
      if (isScoping) {
        await addLayer(layerView, scopedCompiledFilters, layerView.opacity)
      }
    }

    // If design has changed, abort update
    if (props.design != designRef.current) {
      return
    }

    // If sources is unchanged TODO

    // Remove existing layers and sources
    for (const layer of currentLayersRef.current) {
      map.removeLayer(layer.id)
    }
    currentLayersRef.current = []

    for (const source of currentSourcesRef.current) {
      map.removeSource(source.id)
    }
    currentSourcesRef.current = []

    // Add sources and layers
    for (const source of newSources) {
      map.addSource(source.id, source.sourceData)
      currentSourcesRef.current.push(source)
    }

    for (const layer of newLayers) {
      map.addLayer(layer)
      currentLayersRef.current.push(layer)
    }
  }

  // Load map and symbols
  useEffect(() => {
    const m = new mapboxgl.Map({
      accessToken: 'pk.eyJ1IjoiY2xheXRvbmdyYXNzaWNrIiwiYSI6ImNpcHk4MHMxZDB5NHVma20ya3k1dnp3bzQifQ.lMMb60WxiYfRF0V4Y3UTbQ',
      container: divRef.current!,
      style: 'mapbox://styles/mapbox/light-v10', // stylesheet location
      bounds: props.design.bounds ? [props.design.bounds.w, props.design.bounds.s, props.design.bounds.e, props.design.bounds.n] : undefined,
      scrollZoom: props.scrollWheelZoom === false ? false : true,
      dragPan: props.dragging === false ? false : true,
      touchZoomRotate: props.touchZoom === false ? false : true
    })
    setMap(m)

    // Add zoom controls to the map.
    m.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-left")

    // Speed up wheel scrolling
    m.scrollZoom.setWheelZoomRate(1/250)

    m.on("load", async () => {
      // Add symbols that markers layers require
      await addSymbolsToMap(m)
      setSymbolsAdded(true)
    })

    return () => {
      m.remove()
    }
  }, [])

  // Load layers on map
  useEffect(() => {
    // Can't load until added
    if (!symbolsAdded) {
      return
    }

    if (!map) {
      return
    }

    updateLayers()
  }, [map, symbolsAdded, props.design.layerViews, props.scope])

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
  
      const design = { ...props.design, bounds: { n: bounds.getNorth(), e: bounds.getEast(), s: bounds.getSouth(), w: bounds.getWest() }}
      props.onDesignChange(design)
    }

    map.on("moveend", onMoveEnd)
    return () => { map.off("moveend", onMoveEnd) }
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

  // Update bounds if changed
  useEffect(() => {
    if (!map) {
      return
    }

    if (!props.design.autoBounds && props.design.bounds) {
      map.fitBounds([props.design.bounds.w, props.design.bounds.s, props.design.bounds.e, props.design.bounds.n])
    }
  }, [map, props.design.bounds])
  
  function handleGridClick(layerViewId: string, ev: any) {
    const layerView = props.design.layerViews.find(lv => lv.id == layerViewId)!

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
      scopeData: (props.scope && props.scope.data && props.scope.data.layerViewId == layerViewId) ? props.scope.data.data : undefined,
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
      }
      else {
        scope = null
      }

      props.onScopeChange(scope)
    }
  }

  function renderPopup() {
    if (!popupContents) {
      return null
    }

    return <ModalPopupComponent
      onClose={() => setPopupContents(null)}
      showCloseX
      size="large">
        { /* Render in fixed height div so that dashboard doesn't collapse to nothing */ }
        <div style={{ height: "80vh" }}>
          { popupContents }
        </div>
        <div style={{ textAlign: "right", marginTop: 10 }}>
          <button className="btn btn-default" onClick={() => setPopupContents(null)}>Close</button>
        </div>
    </ModalPopupComponent>
  }

  function renderLegend() {
    if (legendHidden) {
      return <HiddenLegend onShow={() => setLegendHidden(false)} />
    }
    else {
      return <LegendComponent
        schema={props.schema}
        layerViews={props.design.layerViews}
        filters={getCompiledFilters()}
        zoom={map ? map.getZoom() : null}
        dataSource={props.dataSource}
        locale={props.locale}
        onHide={() => setLegendHidden(true)}
      />
    }
  }

  // Overflow hidden because of problem of exceeding div
  return <div style={{ width: props.width, height: props.height, position: "relative" }}>
    { renderPopup() }
    { props.onDesignChange != null && props.design.showLayerSwitcher ?
      <LayerSwitcherComponent design={props.design}  onDesignChange={props.onDesignChange} />
      : null
    }
    <div style={{ width: props.width, height: props.height }} ref={divRef}/>
    { renderLegend() }
  </div>
}

interface MapScope {
  name: string
  filter: JsonQLFilter
  data: { layerViewId: string, data: any }
}

/** Add all symbols needed to the map */
function addSymbolsToMap(map: mapboxgl.Map) {
  const promises: Promise<null>[] = []

  for (const mapSymbol of mapSymbols) {
    promises.push(new Promise((resolve, reject) => {
      map.loadImage(mapSymbol.url, (err: any, image: any) => { 
        if (err) { 
          reject(err) 
        } 
        else {
          map.addImage(mapSymbol.value, image, { sdf: true })
          resolve(null) 
        }
      })
    }))
  }

  return Promise.all(promises)
}

/** Legend display tab at bottom right */
function HiddenLegend(props: {
  onShow: () => void
}) {
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

  return <div style={style} onClick={props.onShow}>
    <i className="fa fa-angle-double-left"/>
  </div>
}