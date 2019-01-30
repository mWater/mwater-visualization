import { Schema, JsonQL } from "mwater-expressions";
import { Axis } from "./Axis";

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
  cleanAxis(options: { axis: Axis, table?: string | null, aggrNeed?: AggrNeed, types?: string[] }): Axis

  /** Checks whether an axis is valid 
    options:
     axis: axis to validate
  */
  validateAxis(options: { axis: Axis }): string | null

  /**
   * Compile an axis to JsonQL
   */
  compileAxis(options: { axis: Axis, tableAlias: string }): JsonQL
}

export = AxisBuilder