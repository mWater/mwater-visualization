"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLayoutOptions = exports.getDefaultLayoutOptions = void 0;
/** Get default layout options for a theme */
function getDefaultLayoutOptions(theme) {
    theme = theme || "default";
    return {
        collapseColumnsWidth: 600,
        minimumWidth: theme == "story" ? 400 : 1000,
        belowMinimumWidth: "scroll",
        maximumWidth: theme == "story" ? 1000 : 1600,
        hideQuickfiltersWidth: 600
    };
}
exports.getDefaultLayoutOptions = getDefaultLayoutOptions;
function getLayoutOptions(design) {
    return design.layoutOptions || getDefaultLayoutOptions(design.style);
}
exports.getLayoutOptions = getLayoutOptions;
