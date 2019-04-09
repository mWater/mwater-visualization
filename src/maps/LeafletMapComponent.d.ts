import { ReactNode, Component } from "react"
import L from 'leaflet'

export interface Bounds {
  w: number
  n: number
  e: number
  s: number
}

export interface Layer {
  /** Url in leaflet format */
  tileUrl: string 
  /** Url of interactivity grid */
  utfGridUrl?: string
  /** Visibility */
  visible: boolean
  /** 0-1 */
  opacity: number 
  /** Function that is called when grid layer is clicked. Passed { data } */
  onGridClick?: (ev: { data: any }) => void
  /** Function that is called when grid layer is hovered. Passed { data } */
  onGridHover?: (ev: { data: any }) => void
  /** Minimum zoom level  */
  minZoom?: number 
  /** Maximum zoom level */
  maxZoom?: number 
}

interface Props {
  baseLayerId: "bing_road" | "bing_aerial" | "cartodb_positron" | "cartodb_dark_matter" | "white"
  /** Optional opacity 0-1 */
  baseLayerOpacity?: number
  
  /** Initial bounds. Fit world if none */
  initialBounds?: Bounds
  
  /**  Required width in any css units */
  width: any 
  /**  Required height in any css units */
  height: any 
  
  /** Called with bounds in w, n, s, e format when bounds change */
  onBoundsChange?: (bounds: { w: number, n: number, s: number, e: number }) => void
  
  /** List of layers */
  layers: Layer[]
  
  /** Legend. Will have zoom injected */
  legend?: ReactNode
  
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

  /** Minimum zoom level */
  minZoom?: number

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

export default class LeafletMapComponent extends Component<Props> {
  /** Reloads all layers */
  reload(): void

  /** Gets the underlying Leaflet map */
  getLeafletMap(): L.Map

  /** Set bounds. Padding is optional fractional pad */
  setBounds(bounds: Bounds | null, pad?: number): void
}
