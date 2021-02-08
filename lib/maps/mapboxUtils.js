"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileColorMapToMapbox = void 0;
/** Compile a color mapped axis to mapbox format case statement */
function compileColorMapToMapbox(axis, defaultColor) {
    var compiled;
    if (axis && axis.colorMap) {
        var excludedValues = axis.excludedValues || [];
        // Create match operator
        compiled = ["case"];
        for (var _i = 0, _a = axis.colorMap; _i < _a.length; _i++) {
            var item = _a[_i];
            // If value is numeric, cast to number as ST_AsMVT makes numeric types into strings
            if (typeof (item.value) == "number") {
                compiled.push(["==", ["to-number", ["get", "color"]], item.value]);
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
