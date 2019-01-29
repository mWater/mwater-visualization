import { Expr } from "mwater-expressions";
import { Axis } from "src/axes/Axis";

/**
 * Layer that is composed of administrative regions colored. Now extended to any other regions as well, so name
 * is legacy, as is adminRegionExpr field.
 */
interface ChoroplethLayerDesign {
  /** null for "admin_regions" (default). id of region table if not using admin regions (e.g. regions.catchments) */
  regionsTable: string | null

  /** _id of overall admin region. Null for whole world. */
  scope: number | null

  /** admin level of scope. Default is 0 (entire country) if scope is set */
  scopeLevel: number | null

  /** admin level to disaggregate to */
  detailLevel: number

  /** table to get data from */
  table?: string

  /** expression to get admin region id for calculations */
  adminRegionExpr: Expr
  
  /** axes (see below) */
  axes: {
    /** color axis */
    color: Axis
    /** overrides the nameLabels to display text on each region */
    label: Axis
  }

  /** optional logical expression to filter by */
  filter: Expr

  /** default color (e.g. #FF8800). Color axis overrides */
  color?: string

  /** opacity of fill of regions (0-1) */
  fillOpacity: number

  /** true to display name labels on admin regions */
  displayNames: boolean

  /** contains items: which is BlocksLayoutManager items. Will be displayed when the region is clicked */
  popup: any

  /** customizable filtering for popup. See PopupFilterJoins.md */
  popupFilterJoins: any

  /** minimum zoom level */
  minZoom?: number

  /** maximum zoom level */
  maxZoom?: number 
}

export = ChoroplethLayerDesign