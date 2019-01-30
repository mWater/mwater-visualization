import { Expr } from "mwater-expressions";
import { Axis } from "src/axes/Axis";

/**
 * Layer that is composed of regions colored. Now extended to any other regions as well, so name
 * is legacy, as is adminRegionExpr field.
 */
interface ChoroplethLayerDesign {
  /**
   * Mode of map made from regions. 
   * "plain": no axes, just displays regions
   * "indirect": default. Uses a table that has a region id in it. axes are from the table
   * "direct": axes are non-aggregate and based on the regions table
   */
  regionMode?: "plain" | "indirect" | "direct"

  /** null for "admin_regions" (default). id of region table if not using admin regions (e.g. regions.catchments) */
  regionsTable: string | null

  /** _id of overall region. Null for whole world. */
  scope: string | number | null

  /** level of scope. Default is 0 (entire country for admin regions) if scope is set */
  scopeLevel: number | null

  /** region level to disaggregate to */
  detailLevel: number

  /** table to get data from for regionMode = "indirect" */
  table?: string | null

  /** expression to get admin region id for calculations. Only if regionMode = "indirect" */
  adminRegionExpr: Expr
  
  /** axes (see below) */
  axes: {
    /** color axis. If in region mode "indirect", aggregate on table, if in region mode "direct", from region table, non-aggregate */
    color: Axis

    /** overrides the nameLabels to display text on each region. If in region mode "indirect", aggregate on table, if in region mode "direct", from region table, non-aggregate */
    label: Axis
  }

  /** optional logical expression to filter by. Only when region mode is "indirect" */
  filter: Expr

  /** default color (e.g. #FF8800). Color axis overrides. Only in plain mode */
  color?: string | null

  /** opacity of fill of regions (0-1) */
  fillOpacity: number

  /** true to display name labels on regions */
  displayNames: boolean

  /** contains items: which is BlocksLayoutManager items. Will be displayed when the region is clicked. Only when region mode is "indirect" */
  popup: any

  /** customizable filtering for popup. See PopupFilterJoins.md. Only when region mode is "indirect"  */
  popupFilterJoins: any

  /** minimum zoom level */
  minZoom?: number

  /** maximum zoom level */
  maxZoom?: number 
}

export = ChoroplethLayerDesign