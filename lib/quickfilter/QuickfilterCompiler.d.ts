import { Schema } from "mwater-expressions"
import { JsonQLFilter } from "../JsonQLFilter"
import { Quickfilter } from "./Quickfilter"

/** Compiles quickfilter values into filters */
export default class QuickfilterCompiler {
  constructor(schema: Schema)

  /** design is array of quickfilters (see README.md)
   * values is array of values 
   * locks is array of locked quickfilters. Overrides values
   * Returns array of filters { table: table id, jsonql: JsonQL with {alias} for the table name to filter by }
   * See README for values
   */
  compile(design: Quickfilter[], values: any[], locks: any[]): JsonQLFilter[]
}