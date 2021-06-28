import * as React from "react"
import { Schema, Expr, DataSource, LiteralType } from "mwater-expressions"
import { Axis } from "./Axis"
import { JsonQLFilter } from "../index"

declare class AxisComponent extends React.Component<{
  schema: Schema
  dataSource: DataSource
  /** Table to use */
  table: string
  /** Optional types to limit to */
  types?: LiteralType[]
  aggrNeed: "none" | "optional" | "required"
  value?: Axis
  onChange: (axis: Axis) => void
  /** Makes this a required value */
  required?: boolean
  /** Shows the color map */
  showColorMap?: boolean
  /** Is the draw order reorderable */
  reorderable?: boolean
  /** Should a color map be automatically created from a default palette */
  autosetColors?: boolean
  /** True to allow excluding of values via checkboxes */
  allowExcludedValues?: boolean
  defaultColor?: string | null
  /** Show format control for numeric values */
  showFormat?: boolean
  /** Filters to apply */
  filters?: JsonQLFilter[]
}> {}

export = AxisComponent
