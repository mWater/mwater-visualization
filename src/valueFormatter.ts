import { LiteralType } from "mwater-expressions";
import { format as d3Format } from 'd3-format'
import { fromLatLon } from 'utm'

/** Option for list of format options */
export interface FormatOption {
  value: string
  label: string
}

/** Determine if can format type */
export function canFormatType(type: LiteralType): boolean {
  return type == "number" || type == "geometry"
}

/** Get available options for formatting a type. Null if not available */
export function getFormatOptions(type: LiteralType): FormatOption[] | null {
  if (type == "number") {
    return [
      { value: "", label: "Plain: 1234.567" },
      { value: ",", label: "Normal: 1,234.567" },
      { value: ",.0f", label: "Rounded: 1,234"  },
      { value: ",.2f", label: "Two decimals: 1,234.56" },
      { value: "$,.2f", label: "Currency: $1,234.56" },
      { value: "$,.0f", label: "Currency rounded: $1,234" },
      { value: ".0%", label: "Percent rounded: 12%" },
      { value: ".2%", label: "Percent decimal: 12.34%" }
    ]
  }

  if (type == "geometry") {
    return [
      { value: "lat, lng", label: "Latitude, Longitude" },
      { value: "UTM", label: "UTM" }
    ]
  }
  
  return null
}

/** Get default format */
export function getDefaultFormat(type: LiteralType): string {
  if (type == "number") {
    return ","
  }

  if (type == "geometry") {
    return "lat, lng"
  }

  throw new Error("Not supported")
}

export function formatValue(type: LiteralType, value: any, format: string | null | undefined, locale?: string): string {
  if (value == null) {
    return ""
  }

  // Default
  format = format != null ? format : getDefaultFormat(type)

  // Use d3 format if number
  if (type == "number") {
    // Do not convert % (d3Format multiplies by 100 which is annoying)
    if (format.match(/%/)) {
      value = value / 100.0
    }

    return d3Format(format)(value)
  }
  
  if (type == "geometry") {
    if (format == "UTM") {
      if (value.type == "Point") {
        const latitude = value.coordinates[1]
        const longitude = value.coordinates[0]

        if (latitude > 84 || latitude < -80) {
          return "latitude out of range"
        }
        if (longitude > 180 || longitude < -180) {
          return "longitude out of range"
        }

        const { easting, northing, zoneNum, zoneLetter } = fromLatLon(latitude, longitude)
        return `${zoneNum}${zoneLetter} ${easting.toFixed(0)} ${northing.toFixed(0)}`
      }
      return value.type
    }
    else {
      // Display as lat/lng if Point, otherwise type
      if (value.type == "Point") {
        return `${value.coordinates[1].toFixed(6)}, ${value.coordinates[0].toFixed(6)}`
      }
      else {
        return value.type
      }
    }
  }
  else {
    // Should not happen
    return value + ""
  }
}