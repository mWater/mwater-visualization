import * as React from "react"
import { Schema, Expr } from "mwater-expressions"

declare class TableSelectComponent extends React.Component<{
  schema: Schema
  /** Current table id */
  value?: string | null
  onChange: (value: string | null) => void

  /** Some table select components (not the default) can also perform filtering. Include these props to enable this */
  filter?: Expr
  onFilterChange?: (expr: Expr) => void
}> {}

export = TableSelectComponent
