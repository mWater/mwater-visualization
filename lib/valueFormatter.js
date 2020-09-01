"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatValue = exports.getDefaultFormat = exports.getFormatOptions = exports.canFormatType = void 0;
var d3_format_1 = require("d3-format");
var utm_1 = require("utm");
/** Determine if can format type */
function canFormatType(type) {
    return type == "number" || type == "geometry";
}
exports.canFormatType = canFormatType;
/** Get available options for formatting a type. Null if not available */
function getFormatOptions(type) {
    if (type == "number") {
        return [
            { value: "", label: "Plain: 1234.567" },
            { value: ",", label: "Normal: 1,234.567" },
            { value: ",.0f", label: "Rounded: 1,234" },
            { value: ",.2f", label: "Two decimals: 1,234.56" },
            { value: "$,.2f", label: "Currency: $1,234.56" },
            { value: "$,.0f", label: "Currency rounded: $1,234" },
            { value: ".0%", label: "Percent rounded: 12%" },
            { value: ".2%", label: "Percent decimal: 12.34%" }
        ];
    }
    if (type == "geometry") {
        return [
            { value: "lat, lng", label: "Latitude, Longitude" },
            { value: "UTM", label: "UTM" }
        ];
    }
    return null;
}
exports.getFormatOptions = getFormatOptions;
/** Get default format */
function getDefaultFormat(type) {
    if (type == "number") {
        return ",";
    }
    if (type == "geometry") {
        return "lat, lng";
    }
    throw new Error("Not supported");
}
exports.getDefaultFormat = getDefaultFormat;
/** Format a value of a specified type as a string. For historical reasons,
 * LayeredCharts multiply by 100 before adding the % sign. Set legacyPercentFormat to true to replicate
 */
function formatValue(type, value, format, locale, legacyPercentFormat) {
    if (value == null) {
        return "";
    }
    // Default
    format = format != null ? format : getDefaultFormat(type);
    // Use d3 format if number
    if (type == "number") {
        // Do not convert % (d3Format multiplies by 100 which is annoying)
        if (format.match(/%/) && !legacyPercentFormat) {
            value = value / 100.0;
        }
        return d3_format_1.format(format)(value);
    }
    if (type == "geometry") {
        if (format == "UTM") {
            if (value.type == "Point") {
                var latitude = value.coordinates[1];
                var longitude = value.coordinates[0];
                if (latitude > 84 || latitude < -80) {
                    return "latitude out of range";
                }
                if (longitude > 180 || longitude < -180) {
                    return "longitude out of range";
                }
                var _a = utm_1.fromLatLon(latitude, longitude), easting = _a.easting, northing = _a.northing, zoneNum = _a.zoneNum, zoneLetter = _a.zoneLetter;
                return "" + zoneNum + zoneLetter + " " + easting.toFixed(0) + " " + northing.toFixed(0);
            }
            return value.type;
        }
        else {
            // Display as lat/lng if Point, otherwise type
            if (value.type == "Point") {
                return value.coordinates[1].toFixed(6) + ", " + value.coordinates[0].toFixed(6);
            }
            else {
                return value.type;
            }
        }
    }
    else {
        // Should not happen
        return value + "";
    }
}
exports.formatValue = formatValue;
