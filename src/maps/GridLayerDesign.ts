import { Expr } from "mwater-expressions"
import { Axis } from "../axes/Axis"

/**
 * Layer that is composed of a grid (hex/square) colored by a value
 */
export default interface GridLayerDesign {
  /** Shape of grid */
  shape?: "square" | "hex"

  /**
   * Size units for the grid. Distance between centers.
   * "pixels": fixed pixels across
   * "meters": approximate meters across
   */
  sizeUnits?: "pixels" | "meters"

  /**
   * Size of the grid (from center to center)
   */
  size?: number

  /** table to get data from */
  table?: string

  /** expression to get geometry to map to a grid */
  geometryExpr: Expr
  
  /** color axis of how to color grid */
  colorAxis: Axis

  /** optional logical expression to filter by */
  filter?: Expr

  /** opacity of fill grid (0-1) */
  fillOpacity?: number

  /** Border of the polygons. Color means to color it the same as the color axis */
  borderStyle?: "none" | "color"

  // TODO
  // /** contains items: which is BlocksLayoutManager items. Will be displayed when the region is clicked. Only when region mode is "indirect" */
  // popup: any

  // /** customizable filtering for popup. See PopupFilterJoins.md. Only when region mode is "indirect"  */
  // popupFilterJoins: any
  
  /** minimum zoom level */
  minZoom?: number

  /** maximum zoom level */
  maxZoom?: number 
}