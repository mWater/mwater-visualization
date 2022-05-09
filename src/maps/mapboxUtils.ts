import { DataDrivenPropertyValueSpecification } from "maplibre-gl"
import { Axis } from "../axes/Axis"

/** Compile a color mapped axis to mapbox format case statement */
export function compileColorMapToMapbox(axis: Axis | null | undefined, defaultColor: string): DataDrivenPropertyValueSpecification<string> | string {
  let compiled: DataDrivenPropertyValueSpecification<string> | string

  if (axis && axis.colorMap && axis.colorMap.length > 0) {
    const excludedValues = axis.excludedValues || []

    // Create match operator
    compiled = ["case"]
    for (let item of axis.colorMap) {
      // If value is numeric, cast to number as ST_AsMVT makes numeric types into strings
      // However, to-number makes null into 0, so check for that first
      if (typeof item.value == "number") {
        compiled.push(["all", ["has", "color"], ["==", ["to-number", ["get", "color"]], item.value]])
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

/** Compile a color that is transparent if excluded to mapbox format case statement */
export function compileColorToMapbox(color: string, excludedValues?: any[]): DataDrivenPropertyValueSpecification<string> | string {
  let compiled: DataDrivenPropertyValueSpecification<string> | string

  if (excludedValues) {
    // Create match operator
    compiled = ["case"]
    for (let value of excludedValues) {
      // If value is numeric, cast to number as ST_AsMVT makes numeric types into strings
      if (typeof value == "number") {
        compiled.push(["==", ["to-number", ["get", "color"]], value])
      } else {
        compiled.push(["==", ["get", "color"], value])
      }
      compiled.push("transparent")
    }
    // Else
    compiled.push(color)

    // Handle simple case
    if (compiled.length == 2) {
      compiled = color
    }
  } else {
    compiled = color
  }

  return compiled
}
