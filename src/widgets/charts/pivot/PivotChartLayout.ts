import { PivotChartSegment } from "./PivotChartDesign"

/** Layout for a compiled pivot chart to display */
export interface PivotChartLayout {
  rows: PivotChartLayoutRow[]
  /** To put in light striping */
  striping?: "columns" | "rows" 

  /** true if row limit exceeded */
  tooManyRows?: boolean
  /** true if column limit exceeded */
  tooManyColumns?: boolean
}

export interface PivotChartLayoutRow {
  row: PivotChartLayoutRow
  cells: PivotChartLayoutCell[]
}
  
export interface PivotChartLayoutCell {
  /**
   * row: part of rows, has section as row segment id
   * column: part of columns, has section as column segment id
   * intersection: part of intersections, has section as intersection path
   * blank: filler cells at top left
   */
  type: "row" | "column" | "blank" | "intersection"

  /**
   * value: data-driven value
   * label: label row/column
   * valueLabel: header for values (rows and columns that have value and label)
   * filler: intersection cells that have no data but fill space for row label
   */
  subtype: "value" | "filler" | "label" | "valueLabel"

  /** Text content of the cell */
  text?: string

  align: "left" | "center" | "right"

  /** section id of either a segment or intersection or blank area. Always a rectangle. 
   * Id is like intersection id if intersection, id of segment if segment */
  section: string
  
  /** true if cell is on top edge of section */
  sectionTop: boolean

  /** true if cell is on bottom edge of section */
  sectionBottom: boolean

  /** true if cell is on left edge of section */
  sectionLeft: boolean

  /** true if cell is on right edge of section */
  sectionRight: boolean

  /** segment if a row or column cell */
  segment?: PivotChartSegment
  
  /** weight of border (0 = none, 1 = light, 2 = medium, 3 = heavy) */
  borderLeft: number

  /** weight of border (0 = none, 1 = light, 2 = medium, 3 = heavy) */
  borderRight: number

  /** weight of border (0 = none, 1 = light, 2 = medium, 3 = heavy) */
  borderTop: number

  /** weight of border (0 = none, 1 = light, 2 = medium, 3 = heavy) */
  borderBottom: number
  
  /** true if bold */
  bold?: boolean

  /** true if italic */
  italic?: boolean

  /** number of units to indent cell */
  indent?: number
  
  /** background color of cell */
  backgroundColor?: string
  
  /** if spans more than one row. Next n-1 cells below will be type "skip" */
  rowSpan?: number

  /** if spans more than one column. Next n-1 cells will be type "skip" */
  columnSpan?: number

  /** true if should skip cell because of row/column span */
  skip?: boolean
  
  /** true if cell is a placeholder that needs to be configured */
  unconfigured?: boolean

  /** true if cell is unconfigured and can be turned into a summary */
  summarize?: boolean
}