import _ from "lodash"
import $ from "jquery"
import saveSvgAsPng from "save-svg-as-png"
import LayeredChartCompiler from "./LayeredChartCompiler"
import { Schema } from "mwater-expressions"

// Get the css rules corresponding to .c3 directly out of the document object
function getC3Css() {
  const css = []
  if (document.styleSheets) {
    for (let sheet of document.styleSheets) {
      const rules = sheet?.cssRules || sheet.rules
      if (rules) {
        for (let rule of rules) {
          if (rule.cssText && rule.cssText.startsWith(".c3")) {
            css.push(rule.cssText)
          }
        }
      }
    }
  }
  return css.join("\n")
}

// Get the svg XML text straight from the DOM node, adding the css styling to it as a <style> element
function getC3String(c3Node: any) {
  // Log SVG with stylesheet info
  // First get the svg DOM node and make a copy as an XML doc
  const svgStr = c3Node.outerHTML
  const xml = $.parseXML(svgStr)
  const svgNode = xml.documentElement
  // Denote it as svg
  svgNode.setAttribute("xmlns", "http://www.w3.org/2000/svg")
  svgNode.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink")
  // Add a style element with the .c3 css rules for this page
  const styleNode = xml.createElement("style")
  styleNode.setAttribute("type", "text/css")
  let css = getC3Css()

  // few styles are defined as .c3 [selector]
  // which does not apply when exporting svg as parent element is not available
  css +=
    "svg { font-style: normal; font-variant: normal; font-weight: normal; font-stretch: normal; font-size: 10px; line-height: normal; font-family: sans-serif; -webkit-tap-highlight-color: transparent; }\n"
  css += "path, line { fill: none; stroke: rgb(0, 0, 0); }\n"
  css += "text { user-select: none; }\n"
  const cdata = xml.createCDATASection(css)
  styleNode.appendChild(cdata)
  svgNode.insertBefore(styleNode, svgNode.firstChild)
  // Serialize
  const svgFinalStr = new XMLSerializer().serializeToString(xml)
  return svgFinalStr
}

// Creates the svg string and saves that to file
function saveSvgToFile(containerDiv: any, title: any) {
  const svgFinalStr = getC3String(containerDiv.firstChild)
  const blob = new Blob([svgFinalStr], { type: "image/svg+xml" })
  // Require at use as causes server problems
  const FileSaver = require("file-saver")
  return FileSaver.saveAs(blob, (title || "unnamed-chart") + ".svg")
}

// Saves svg files from layered charts
// design: design of the chart
// data: results from queries
// schema: the chart's schema
// format: "svg" or "png"
export default {
  save(design: any, data: any, schema: Schema, format: any) {
    const compiler = new LayeredChartCompiler({ schema })
    const props = {
      design,
      data,
      width: 600,
      height: 600
    }
    const chartOptions = compiler.createChartOptions(props)
    const containerDiv = document.createElement("div")
    containerDiv.className += "c3"
    chartOptions.bindto = containerDiv
    const title = design.titleText
    let chart: any = null
    const onRender = () => {
      return _.defer(function () {
        if (format === "svg") {
          saveSvgToFile(containerDiv, title)
        } else if (format === "png") {
          // saveSvgAsPng does not include the styles for the svg element itself
          // so set the styles inline
          // see: https://github.com/exupero/saveSvgAsPng/issues/110
          const el = $(containerDiv).find("svg")[0]
          el.style.fontFamily = "sans-serif"
          el.style.fontStyle = "normal"
          el.style.fontVariant = "normal"
          el.style.fontWeight = "normal"
          el.style.fontStretch = "normal"
          el.style.fontSize = "10px"
          el.style.lineHeight = "normal"

          const customStyle = document.createElement("style")
          customStyle.type = "text/css"
          customStyle.appendChild(
            document.createTextNode(
              `<![CDATA[
line, path {fill: none;stroke: rgb(0, 0, 0);}
]]>\
`
            )
          )

          el.appendChild(customStyle)

          saveSvgAsPng.saveSvgAsPng(el, `${title || "untitled"}.png`, {
            selectorRemap(selector: any) {
              if ([".c3 path, .c3 line", ".c3 line, .c3 path"].includes(selector)) {
                return "path, line"
              }
              if (selector.indexOf(".c3 ") === 0) {
                return selector.substr(4)
              } else {
                return selector
              }
            },
            backgroundColor: "#fff"
          })
        }
        return chart.destroy()
      })
    }
    chartOptions.onrendered = _.debounce(_.once(onRender), 1000)
    const c3 = require("c3")
    chart = c3.generate(chartOptions)

    // Remove listener for window focus (https://github.com/c3js/c3/issues/2742)
    window.removeEventListener("focus", chart.internal.windowFocusHandler)
    chart.internal.windowFocusHandler = () => {}
    window.addEventListener("focus", chart.internal.windowFocusHandler)

  }
}
