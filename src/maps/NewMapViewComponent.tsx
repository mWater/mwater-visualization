import mapboxgl from "mapbox-gl";
import { DataSource, Schema } from "mwater-expressions"
import React, { useEffect, useState } from "react";
import { useRef } from "react";
import { JsonQLFilter } from "..";
import { default as LayerFactory } from "./LayerFactory";
import { MapDesign } from "./MapDesign";
import { MapDataSource } from "./maps";
import { mapSymbols } from "./mapSymbols";

import 'mapbox-gl/dist/mapbox-gl.css'

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
  onScopeChange: (scope: MapScope) => void

  /** Whether the map be draggable with mouse/touch or not. Default true */
  dragging: boolean 

  /** Whether the map can be zoomed by touch-dragging with two fingers. Default true */
  touchZoom: boolean 

  /** Whether the map can be zoomed by using the mouse wheel. Default true */
  scrollWheelZoom: boolean

  /** Whether changes to zoom level should be persisted. Default false  */
  zoomLocked: boolean 
}) {
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const divRef = useRef<HTMLDivElement | null>(null)

  /** Current design (to detect if has changed) */
  const designRef = useRef<MapDesign>()

  /** Ids of layers present */
  const currentLayersRef = useRef<mapboxgl.AnyLayer[]>([])

  /** Ids of sources present */
  const currentSourcesRef = useRef<{ id: string, sourceData: mapboxgl.AnySourceData }[]>([])

  /** True when symbols have been added to map */
  const [symbolsAdded, setSymbolsAdded] = useState(false)

  // Store design in ref to detect changes
  useEffect(() => { designRef.current = props.design }, [props.design])

  /** Make layers of map match the design */
  async function updateLayers(map: mapboxgl.Map) {
    // TODO handle scoping
    // # If layer is scoping, fade opacity and add extra filtered version
    // isScoping = @props.scope and @props.scope.data.layerViewId == layerView.id 
    // TODO handle grid click

    // Sources to add
    const newSources: { id: string, sourceData: mapboxgl.AnySourceData }[] = []
    const newLayers: mapboxgl.AnyLayer[] = []

    for (const lv of props.design.layerViews) {
      // TODO better way of hiding/showing layers?
      if (!lv.visible) {
        continue
      }

      const layer = LayerFactory.createLayer(lv.type)

      // Clean design (prevent ever displaying invalid/legacy designs)
      const design = layer.cleanDesign(lv.design, props.schema)
  
      // Ignore if invalid
      if (layer.validateDesign(design, props.schema)) {
        continue
      }
  
      const defType = layer.getLayerDefinitionType()
      const layerDataSource = props.mapDataSource.getLayerDataSource(lv.id)

      if (defType == "VectorTile") {
        // TODO attempt to re-use sources
        // Get source url
        const { expires, url } = await layerDataSource.getVectorTileUrl(lv.design, [])

        // Add source
        newSources.push({ id: lv.id, sourceData: {
          type: "vector",
          tiles: [url]
        }})

        // Add layer
        const subLayers = layer.getVectorTile(lv.design, lv.id, props.schema, [], lv.opacity).subLayers
        for (const sublayer of subLayers) {
          newLayers.push(sublayer)
        }
      }
      else {
        const tileUrl = props.mapDataSource.getLayerDataSource(lv.id).getTileUrl(lv.design, [])
        if (tileUrl) {
          newSources.push({ id: lv.id, sourceData: {
            type: "raster",
            tiles: [tileUrl]
          }})

          newLayers.push({
            id: lv.id,
            type: "raster",
            source: lv.id
          })
        }
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
    const map = new mapboxgl.Map({
      accessToken: 'pk.eyJ1IjoiY2xheXRvbmdyYXNzaWNrIiwiYSI6ImNpcHk4MHMxZDB5NHVma20ya3k1dnp3bzQifQ.lMMb60WxiYfRF0V4Y3UTbQ',
      container: divRef.current!,
      style: 'mapbox://styles/mapbox/light-v10', // stylesheet location
      bounds: props.design.bounds ? [props.design.bounds.w, props.design.bounds.s, props.design.bounds.e, props.design.bounds.n] : undefined
    })
    mapRef.current = map

    // Speed up wheel scrolling
    map.scrollZoom.setWheelZoomRate(1/250)

    map.on("load", async () => {
      // Add symbols that markers layers require
      await addSymbolsToMap(map)
      setSymbolsAdded(true)
    })

    return () => {
      map.remove()
    }
  }, [])

  // Load layers on map
  useEffect(() => {
    // Can't load until added
    if (!symbolsAdded) {
      return
    }

    const map = mapRef.current
    if (!map) {
      return
    }

    updateLayers(map)
  }, [symbolsAdded, props.design])

  // Capture movements on map to update bounds
  useEffect(() => {
    const map = mapRef.current
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
  }, [props.onDesignChange, props.zoomLocked, props.design])

  // Overflow hidden because of problem of exceeding div
  return <div style={{ width: props.width, height: props.height, overflow: "hidden" }} ref={divRef}/>
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