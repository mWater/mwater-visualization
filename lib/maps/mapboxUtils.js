"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileColorToMapbox = exports.compileColorMapToMapbox = void 0;
/** Compile a color mapped axis to mapbox format case statement */
function compileColorMapToMapbox(axis, defaultColor) {
    let compiled;
    if (axis && axis.colorMap && axis.colorMap.length > 0) {
        const excludedValues = axis.excludedValues || [];
        // Create match operator
        compiled = ["case"];
        for (let item of axis.colorMap) {
            // If value is numeric, cast to number as ST_AsMVT makes numeric types into strings
            // However, to-number makes null into 0, so check for that first
            if (typeof item.value == "number") {
                compiled.push(["all", ["has", "color"], ["==", ["to-number", ["get", "color"]], item.value]]);
            }
            else {
                compiled.push(["==", ["get", "color"], item.value]);
            }
            compiled.push(excludedValues.includes(item.value) ? "transparent" : item.color);
        }
        // Else
        compiled.push(defaultColor);
    }
    else {
        compiled = defaultColor;
    }
    return compiled;
}
exports.compileColorMapToMapbox = compileColorMapToMapbox;
/** Compile a color that is transparent if excluded to mapbox format case statement */
function compileColorToMapbox(color, excludedValues) {
    let compiled;
    if (excludedValues) {
        // Create match operator
        compiled = ["case"];
        for (let value of excludedValues) {
            // If value is numeric, cast to number as ST_AsMVT makes numeric types into strings
            // However, to-number makes null into 0, so check for that first
            if (typeof value == "number") {
                compiled.push(["all", ["has", "color"], ["==", ["to-number", ["get", "color"]], value]]);
            }
            else {
                compiled.push(["==", ["get", "color"], value]);
            }
            compiled.push("transparent");
        }
        // Else
        compiled.push(color);
        // Handle simple case
        if (compiled.length == 2) {
            compiled = color;
        }
    }
    else {
        compiled = color;
    }
    return compiled;
}
exports.compileColorToMapbox = compileColorToMapbox;
