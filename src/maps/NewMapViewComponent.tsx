import mapboxgl from "mapbox-gl";
import { DataSource, Schema } from "mwater-expressions"
import React, { useEffect } from "react";
import { useRef } from "react";
import { JsonQLFilter } from "..";
import { default as LayerFactory } from "./LayerFactory";
import { MapDesign } from "./MapDesign";
import { MapDataSource } from "./maps";
import { mapSymbols } from "./mapSymbols";

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

  async function addLayers(map: mapboxgl.Map) {
    // Add symbols that markers layers require
    await addSymbolsToMap(map)

    for (const lv of props.design.layerViews) {
      const layer = LayerFactory.createLayer(lv.type)
      const defType = layer.getLayerDefinitionType()
      const layerDataSource = props.mapDataSource.getLayerDataSource(lv.id)

      if (defType == "VectorTile") {
        // Get source url
        const { expires, url } = await layerDataSource.getVectorTileUrl(lv.design, [])

        // Add source
        map.addSource(lv.id, {
          type: "vector",
          tiles: [url]
        })

        // Add layer
        const subLayers = layer.getVectorTile(lv.design, lv.id, props.schema, []).subLayers
        for (const sublayer of subLayers) {
          map.addLayer(sublayer)
        }
      }
      else {
        const tileUrl = props.mapDataSource.getLayerDataSource(lv.id).getTileUrl(lv.design, [])
        if (tileUrl) {
          map.addSource(lv.id, {
            type: "raster",
            tiles: [tileUrl]
          })

          map.addLayer({
            id: lv.id,
            type: "raster",
            source: lv.id
          })
        }
      }
    }
  }

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

    map.on("load", () => {
      // Add layers
      addLayers(map)
    })

    return () => {
      map.remove()
    }
  }, [])

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
    console.log(mapSymbol.value)
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