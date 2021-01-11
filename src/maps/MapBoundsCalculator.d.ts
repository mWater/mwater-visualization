import { DataSource, Schema } from "mwater-expressions"
import { JsonQLFilter } from "../JsonQLFilter"
import { MapDesign } from "./MapDesign"

/** Calculates map bounds given layers by unioning together */
export default class MapBoundsCalculator {
  constructor(schema: Schema, dataSource: DataSource)

  /** Gets the bounds for the map. Null for whole world. Callback as { n:, s:, w:, e: } */
  getBounds(design: MapDesign, filters: JsonQLFilter[], callback: (error: any, bounds: { w: number, n: number, e: number, s: number } | null) => void): void
}