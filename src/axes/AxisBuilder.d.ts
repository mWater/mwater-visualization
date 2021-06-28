import { Schema } from "mwater-expressions"
import { Axis } from "./Axis"
import { JsonQLExpr } from "jsonql"

type AggrNeed = "none" | "optional" | "required"

declare class AxisBuilder {
  constructor(options: { schema: Schema })

  /** Clean an axis with respect to a specific table
    options:
     axis: axis to clean
     table: table that axis is to be for
     aggrNeed is "none", "optional" or "required"
     types: optional list of types to require it to be one of
  */
  cleanAxis(options: { axis: Axis | null; table?: string | null; aggrNeed?: AggrNeed; types?: string[] }): Axis

  /** Checks whether an axis is valid 
    options:
     axis: axis to validate
  */
  validateAxis(options: { axis: Axis | null }): string | null

  /**
   * Compile an axis to JsonQL
   */
  compileAxis(options: { axis: Axis; tableAlias: string }): JsonQLExpr

  /** Get all categories for a given axis type given the known values
   * Returns array of { value, label }
   */
  getCategories(axis: Axis, values: any[], locale?: string): { value: any; label: string }[]
}

export = AxisBuilder
