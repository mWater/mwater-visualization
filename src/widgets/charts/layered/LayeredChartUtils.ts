// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
// Misc utils for layered charts

// Get possible types for axis of a layer
export function getAxisTypes(design: any, layer: any, axis: any) {
  // If categorical
  const layerType = layer.type || design.type

  switch (axis) {
    case "x":
      if (layerType === "bar") {
        return ["enum", "enumset", "text", "date", "boolean"]
      }

      // More broad
      return ["enum", "text", "number", "boolean", "date"]
    case "color":
      return ["enum", "text", "date", "boolean"]
    case "y":
      return ["number"]
  }
  return null
}
