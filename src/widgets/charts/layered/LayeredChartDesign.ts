import { Expr } from "mwater-expressions"
import { Axis } from "../../../axes/Axis"
import { TextWidgetDesign } from "../../text/TextWidgetDesign"

/** Design for a layered chart */
export interface LayeredChartDesign {
  version: number

  /** Type of chart (overall) */
  type: "bar" | "line" | "spline" | "scatter" | "area" | "pie" | "donut"

  /** array of layers */
  layers: LayeredChartDesignLayer[]

  /** (deprecated by headerItems) title text @deprecated */
  titleText?: string

  /** text of x axis label, display default value if "", display nothing if null */
  xAxisLabelText: string | null

  /** text of y axis label, display default value if "", display nothing if null */
  yAxisLabelText: string | null

  /** true to flip axes */
  transpose?: boolean

  /** true to stack all  */
  stacked?: boolean

  /** true to stack proportionally (100 %). Only applicable if stacked */
  proportional?: boolean

  /** true to show labels on values */
  labels?: boolean

  /** text widget design to display in header (replaces title) */
  header?: TextWidgetDesign

  /** text widget design to display in header */
  footer?: TextWidgetDesign

  /** array of { value:, label:, color: } thresholds to draw on y-axis. Only for non-polar. Color takes effect if y > threshold */
  yThresholds?: { value: number; label: string; color: string }[]

  /** order of pie/donut charts. Default is "desc" (if undefined). Can be "desc", "asc", "natural" */
  polarOrder?: "desc" | "asc" | "natural"

  /** True to hide percentage for pie/donut */
  hidePercentage?: boolean

  /** optional maximum for y axis */
  yMax?: number

  /** optional minimum for y axis */
  yMin?: number

  /** true to show popout lines for small values */
  popoutSmallValues?: boolean
}

export interface LayeredChartDesignLayer {
  /** bar/line/spline/scatter/area/pie/donut (overrides main one) */
  type: "bar" | "line" | "spline" | "scatter" | "area" | "pie" | "donut"

  /** table of layer */
  table: string

  /** label for layer (optional) */
  name?: string

  /** axes (see below) */
  axes: {
    x?: Axis
    y?: Axis
    /** color axis (to split into series based on a color) */
    color?: Axis
  }

  /** true to stack. Defaults true if multiple layers and has color index. */
  stacked?: boolean

  /** optional logical expression to filter by */
  filter?: Expr

  /** color of layer (e.g. #FF8800) */
  color?: string

  /** true to use running total of values */
  cumulative?: boolean

  /** true if has a color map for x-axis */
  xColorMap?: boolean

  /** Optional type of trendline */
  trendline?: "linear"
}
