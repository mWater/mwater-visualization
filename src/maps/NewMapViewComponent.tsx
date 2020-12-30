import mapboxgl from "mapbox-gl";
import { DataSource, Schema } from "mwater-expressions"
import React from "react";
import { useRef } from "react";
import { JsonQLFilter } from "..";
import { default as LayerFactory } from "./LayerFactory";
import { MapDesign } from "./MapDesign";
import { MapDataSource } from "./maps";

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

  function addLayers(map: mapboxgl.Map) {
    for (const lv of props.design.layerViews) {
      const layer = LayerFactory.createLayer(lv.type)
      map.addSource(lv.id, {
        type: "raster",
        tiles: [
          props.mapDataSource.getLayerDataSource(lv.id).getTileUrl(lv.design, [])
        ]
      })

      map.addLayer({
        id: lv.id,
        type: "raster",
        source: lv.id
      })
    }
  }

  function divRef(elem: HTMLDivElement | null) {
    if (elem != null) {
      const map = new mapboxgl.Map({
        accessToken: 'pk.eyJ1IjoiY2xheXRvbmdyYXNzaWNrIiwiYSI6ImNpcHk4MHMxZDB5NHVma20ya3k1dnp3bzQifQ.lMMb60WxiYfRF0V4Y3UTbQ',
        container: elem,
        style: 'mapbox://styles/mapbox/light-v10', // stylesheet location
        // center: [-74.5, 40], // starting position [lng, lat]
        // zoom: 4 // starting zoom
        bounds: props.design.bounds ? [props.design.bounds.w, props.design.bounds.s, props.design.bounds.e, props.design.bounds.n] : undefined        
      })
      mapRef.current = map

      // Speed up wheel scrolling
      map.scrollZoom.setWheelZoomRate(1/250)

      map.on("load", () => {
        // Add layers
        addLayers(map)
      })
    }
    else {
      mapRef.current!.remove()
    }
  }

  return <div style={{ width: props.width, height: props.width }} ref={divRef}/>
}

interface MapScope {
  name: string
  filter: JsonQLFilter
  data: { layerViewId: string, data: any }
}
