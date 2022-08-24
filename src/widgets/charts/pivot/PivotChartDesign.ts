import { Expr } from "mwater-expressions"
import { Axis } from "../../../axes/Axis"
import { TextWidgetDesign } from "../../text/TextWidgetDesign"

export interface PivotChartDesign {
  version: number
  
  /** text widget design to display in header */
  header: TextWidgetDesign

  /** text widget design to display in header */
  footer: TextWidgetDesign

  /** table of pivot chart */
  table: string

  /** array of segments that make up rows */
  rows: PivotChartSegment[]
  
  /** array of segments that make up columns */
  columns: PivotChartSegment[] 
  
  /** lookup of intersection id (e.g. "rowid:columnid" or "rowid,rowid:columnid,columnid" etc.) to intersection */
  intersections: { [intersectionId: string]: PivotChartIntersection } 

  /** optional logical expression to filter by */
  filter?: Expr

  /** to put in light striping */
  striping?: "columns" | "rows" 
}

/**
 * Segments are the building block of pivot tables. Each is either on the row or column axis. They represent one 
 * expression (enum/text) that is analyzed.
 * Segments can be nested to allow sub-division and are ordered.
 */
export interface PivotChartSegment {
  /** id of segment */
  id: string

  /** optional label of segment */
  label?: string
  
  /** enum/text axis that determines values. Optional. */
  valueAxis?: Axis | null

  /** Limit date-type and enum fields to values actually present */
  valueAxisOnlyValuesPresent?: boolean

  /** array of child segments if any. Optional */
  children?: PivotChartSegment[]

  /** optional aggregate ordering expression */
  orderExpr?: Expr

  orderDir?: "asc" | "desc"

  /** color of filler for intersections that are filler type */
  fillerColor?: string

  /** optional logical expression to filter by (filters all intersections related to it) */
  filter?: Expr

  /** true if bold (values and label) */
  bold?: boolean

  /** true if italic */
  italic?: boolean

  /** true if label alone is bold (only when has valueAxis and label) */
  valueLabelBold?: boolean

  /** weight of border before segment (0 = none, 1 = light, 2 = medium (default), 3 = heavy) */
  borderBefore?: 0 | 1 | 2 | 3 

  /** weight of border within segment (0 = none, 1 = light (default), 2 = medium, 3 = heavy) */
  borderWithin?: 0 | 1 | 2 | 3

  /** weight of border after segment (0 = none, 1 = light, 2 = medium (default), 3 = heavy) */ 
  borderAfter?: 0 | 1 | 2 | 3 
}

/** These compose the data area of the table. There is an intersection for each possible
 * combination that makes sense of segments that form a rectangle. An intersection is 
 * id-ed by "rowid:columnid" or "rowid,rowid:columnid,columnid" etc. depending on its component 
 * ids.
 */
export interface PivotChartIntersection {
  /** axis that determines value to display in cells. Must be aggregate */
  valueAxis?: Axis | null

  /** optional logical expression to filter by */
  filter?: Expr

  /** color axis for background of cells */
  backgroundColorAxis?: Axis | null

  /** fractional background opacity */
  backgroundColorOpacity?: number

  /** color of background if no color axis */
  backgroundColor?: string

  /** array of conditional colors that override axis and background color 
   * Each contains: { condition: aggregate boolean expression, color: color value }
   */
  backgroundColorConditions?: { condition: Expr, color: string }[]

  /** true if bold */
  bold?: boolean

  /** true if italic */
  italic?: boolean
}