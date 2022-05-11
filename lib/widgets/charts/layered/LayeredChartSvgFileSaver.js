"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const jquery_1 = __importDefault(require("jquery"));
const save_svg_as_png_1 = __importDefault(require("save-svg-as-png"));
const LayeredChartCompiler_1 = __importDefault(require("./LayeredChartCompiler"));
const billboard_js_1 = __importDefault(require("billboard.js"));
// Get the css rules corresponding to .c3 directly out of the document object
function getC3Css() {
    const css = [];
    if (document.styleSheets) {
        for (let sheet of document.styleSheets) {
            const rules = (sheet === null || sheet === void 0 ? void 0 : sheet.cssRules) || sheet.rules;
            if (rules) {
                for (let rule of rules) {
                    if (rule.cssText && rule.cssText.startsWith(".bb")) {
                        css.push(rule.cssText);
                    }
                }
            }
        }
    }
    return css.join("\n");
}
// Get the svg XML text straight from the DOM node, adding the css styling to it as a <style> element
function getC3String(c3Node) {
    // Log SVG with stylesheet info
    // First get the svg DOM node and make a copy as an XML doc
    const svgStr = c3Node.outerHTML;
    const xml = jquery_1.default.parseXML(svgStr);
    const svgNode = xml.documentElement;
    // Denote it as svg
    svgNode.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgNode.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    // Add a style element with the .c3 css rules for this page
    const styleNode = xml.createElement("style");
    styleNode.setAttribute("type", "text/css");
    let css = getC3Css();
    // few styles are defined as .c3 [selector]
    // which does not apply when exporting svg as parent element is not available
    css +=
        "svg { font-style: normal; font-variant: normal; font-weight: normal; font-stretch: normal; font-size: 10px; line-height: normal; font-family: sans-serif; -webkit-tap-highlight-color: transparent; }\n";
    css += "path, line { fill: none; stroke: rgb(0, 0, 0); }\n";
    css += "text { user-select: none; }\n";
    const cdata = xml.createCDATASection(css);
    styleNode.appendChild(cdata);
    svgNode.insertBefore(styleNode, svgNode.firstChild);
    // Serialize
    const svgFinalStr = new XMLSerializer().serializeToString(xml);
    return svgFinalStr;
}
// Creates the svg string and saves that to file
function saveSvgToFile(containerDiv, title) {
    const svgFinalStr = getC3String(containerDiv.firstChild);
    const blob = new Blob([svgFinalStr], { type: "image/svg+xml" });
    // Require at use as causes server problems
    const FileSaver = require("file-saver");
    return FileSaver.saveAs(blob, (title || "unnamed-chart") + ".svg");
}
// Saves svg files from layered charts
// design: design of the chart
// data: results from queries
// schema: the chart's schema
// format: "svg" or "png"
exports.default = {
    save(design, data, schema, format) {
        const compiler = new LayeredChartCompiler_1.default({ schema });
        const props = {
            design,
            data,
            width: 600,
            height: 600
        };
        const chartOptions = compiler.createChartOptions(props);
        const containerDiv = document.createElement("div");
        containerDiv.className += "bb";
        // BillboardJS legend calculations dont work properly when element is not visible
        // https://github.com/naver/billboard.js/issues/1015
        document.body.appendChild(containerDiv);
        chartOptions.bindto = containerDiv;
        const title = design.titleText;
        let chart = null;
        const onRender = () => {
            return lodash_1.default.defer(function () {
                if (format === "svg") {
                    saveSvgToFile(containerDiv, title);
                }
                else if (format === "png") {
                    // saveSvgAsPng does not include the styles for the svg element itself
                    // so set the styles inline
                    // see: https://github.com/exupero/saveSvgAsPng/issues/110
                    const el = jquery_1.default(containerDiv).find("svg")[0];
                    el.style.fontFamily = "sans-serif";
                    el.style.fontStyle = "normal";
                    el.style.fontVariant = "normal";
                    el.style.fontWeight = "normal";
                    el.style.fontStretch = "normal";
                    el.style.fontSize = "10px";
                    el.style.lineHeight = "normal";
                    const customStyle = document.createElement("style");
                    customStyle.type = "text/css";
                    customStyle.appendChild(document.createTextNode(`<![CDATA[
line, path {fill: none;stroke: rgb(0, 0, 0);}
]]>\
`));
                    el.appendChild(customStyle);
                    save_svg_as_png_1.default.saveSvgAsPng(el, `${title || "untitled"}.png`, {
                        selectorRemap(selector) {
                            if ([".bb path, .bb line", ".bb line, .bb path"].includes(selector)) {
                                return "path, line";
                            }
                            if (selector.indexOf(".bb ") === 0) {
                                return selector.substr(4);
                            }
                            else {
                                return selector;
                            }
                        },
                        backgroundColor: "#fff"
                    });
                }
                return chart.destroy();
            });
        };
        chartOptions.onrendered = lodash_1.default.debounce(lodash_1.default.once(onRender), 1000);
        // const c3 = require("c3")
        chart = billboard_js_1.default.generate(chartOptions);
        // Remove listener for window focus (https://github.com/c3js/c3/issues/2742)
        window.removeEventListener("focus", chart.internal.windowFocusHandler);
        chart.internal.windowFocusHandler = () => { };
        window.addEventListener("focus", chart.internal.windowFocusHandler);
    }
};
