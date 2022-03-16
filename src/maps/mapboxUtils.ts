import { DataDrivenPropertyValueSpecification } from "maplibre-gl"
import { Axis } from "../axes/Axis"

/** Compile a color mapped axis to mapbox format case statement */
export function compileColorMapToMapbox(axis: Axis | null | undefined, defaultColor: string): DataDrivenPropertyValueSpecification<string> | string {
  let compiled: DataDrivenPropertyValueSpecification<string> | string

  if (axis && axis.colorMap) {
    const excludedValues = axis.excludedValues || []

    // Create match operator
    compiled = ["case"]
    for (let item of axis.colorMap) {
      // If value is numeric, cast to number as ST_AsMVT makes numeric types into strings
      if (typeof item.value == "number") {
        compiled.push(["==", ["to-number", ["get", "color"]], item.value])
      } else {
        compiled.push(["==", ["get", "color"], item.value])
      }
      compiled.push(excludedValues.includes(item.value) ? "transparent" : item.color)
    }
    // Else
    compiled.push(defaultColor)
  } else {
    compiled = defaultColor
  }

  return compiled
}
