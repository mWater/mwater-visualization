import { Expr } from "mwater-expressions"
import { Axis } from "../axes/Axis"
import { HoverOverItem } from "./maps"

/** Design for a markers layer */
export interface MarkersLayerDesign {
  /** table to get data from */
  table: string

  /** axes (see below) */
  axes: {
    /** where to place markers */
    geometry: Axis

    /** color axis (to split into series based on a color) */
    color?: Axis
  }

  /** optional logical expression to filter by */
  filter?: Expr

  /** color of layer (e.g. #FF8800). Color axis overrides */
  color?: string

  /** symbol to use for layer. e.g. "font-awesome/bell". Will be converted on server to proper uri. */
  symbol?: string

  /** size in pixels of the markers. Default 10. */
  markerSize?: number

  /** size of the lines in pixels. Default 3 */
  lineWidth?: number

  /** opacity of polygon fill (0-1). Default is 0.25 */
  polygonFillOpacity?: number

  /** color of polygon borders (defaults to color of fill) */
  polygonBorderColor?: string

  /** contains items: which is BlocksLayoutManager items. Will be displayed when the marker is clicked TODO */
  popup: { items: any }

  hoverOver: { items: HoverOverItem[] }

  /** customizable filtering for popup. See PopupFilterJoins.md TODO */
  popupFilterJoins: any

  /** minimum zoom level */
  minZoom?: number

  /** maximum zoom level */
  maxZoom?: number

  /** @deprecated LEGACY sublayers array that contains above design */
  sublayers?: any[]
}
