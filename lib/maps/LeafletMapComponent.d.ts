import { ReactNode } from "react";

export default class LeafletMapComponent {
  baseLayerId: "bing_road" | "bing_aerial" | "cartodb_positron" | "cartodb_dark_matter" | "white"
  /** Optional opacity 0-1 */
  baseLayerOpacity?: number
  
  /** Initial bounds. Fit world if none */
  initialBounds?: { 
    w: number
    n: number
    e: number
    s: number
  }
  
  /**  Required width in any css units */
  width: any 
  /**  Required height in any css units */
  height: any 
  
  /** Called with bounds in w, n, s, e format when bounds change */
  onBoundsChange: (bounds: { w: number, n: number, s: number, e: number }) => void
  
  /** List of layers */
  layers: Array<{
    /** Url in leaflet format */
    tileUrl: string 
    /** Url of interactivity grid */
    utfGridUrl?: string
    /** Visibility */
    visible: boolean
    /** 0-1 */
    opacity: number 
    /** Function that is called when grid layer is clicked. Passed { data } */
    onGridClick?: (data: any) => void
    /** Function that is called when grid layer is hovered. Passed { data } */
    onGridHover?: (data: any) => void
    /** Minimum zoom level  */
    minZoom?: number 
    /** Maximum zoom level */
    maxZoom?: number 
    }>
  
  /** Legend. Will have zoom injected */
  legend: ReactNode
  
  /** Whether the map be draggable with mouse/touch or not. Default true */
  dragging?: boolean         
  /** Whether the map can be zoomed by touch-dragging with two fingers. Default true */
  touchZoom?: boolean         
  /** Whether the map can be zoomed by using the mouse wheel. Default true */
  scrollWheelZoom?: boolean   
  /** Whether the map responds to keyboard. Default true */
  keyboard?: boolean          
  
  /** Maximum zoom level */
  maxZoom?: number
  /** User defined attributions */
  extraAttribution?: string 
  
  /** True to add loading spinner */
  loadingSpinner?: boolean       
  
  /** True to show scale control */
  scaleControl?: boolean
  
  /** Set to display a Leaflet popup control */
  popup?: {         
    lat: number
    lng: number
    contents: ReactNode
  }
}
