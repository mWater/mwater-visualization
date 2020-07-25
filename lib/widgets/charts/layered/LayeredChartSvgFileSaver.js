"use strict";

var $, LayeredChartCompiler, _, getC3Css, getC3String, saveSvgAsPng, saveSvgToFile;

_ = require('lodash');
$ = require('jquery');
saveSvgAsPng = require('save-svg-as-png');
LayeredChartCompiler = require('./LayeredChartCompiler'); // Get the css rules corresponding to .c3 directly out of the document object

getC3Css = function getC3Css() {
  var css, i, j, len, len1, ref, rule, rules, sheet;
  css = [];

  if (document.styleSheets) {
    ref = document.styleSheets;

    for (i = 0, len = ref.length; i < len; i++) {
      sheet = ref[i];
      rules = (sheet != null ? sheet.cssRules : void 0) || sheet.rules;

      if (rules) {
        for (j = 0, len1 = rules.length; j < len1; j++) {
          rule = rules[j];

          if (rule.cssText && rule.cssText.startsWith(".c3")) {
            css.push(rule.cssText);
          }
        }
      }
    }
  }

  return css.join('\n');
}; // Get the svg XML text straight from the DOM node, adding the css styling to it as a <style> element


getC3String = function getC3String(c3Node) {
  var cdata, css, styleNode, svgFinalStr, svgNode, svgStr, xml; // Log SVG with stylesheet info
  // First get the svg DOM node and make a copy as an XML doc

  svgStr = c3Node.outerHTML;
  xml = $.parseXML(svgStr);
  svgNode = xml.documentElement; // Denote it as svg

  svgNode.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svgNode.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink"); // Add a style element with the .c3 css rules for this page

  styleNode = xml.createElement("style");
  styleNode.setAttribute("type", "text/css");
  css = getC3Css(); // few styles are defined as .c3 [selector]
  // which does not apply when exporting svg as parent element is not available

  css += "svg { font-style: normal; font-variant: normal; font-weight: normal; font-stretch: normal; font-size: 10px; line-height: normal; font-family: sans-serif; -webkit-tap-highlight-color: transparent; }\n";
  css += "path, line { fill: none; stroke: rgb(0, 0, 0); }\n";
  css += "text { user-select: none; }\n";
  cdata = xml.createCDATASection(css);
  styleNode.appendChild(cdata);
  svgNode.insertBefore(styleNode, svgNode.firstChild); // Serialize

  svgFinalStr = new XMLSerializer().serializeToString(xml);
  return svgFinalStr;
}; // Creates the svg string and saves that to file


saveSvgToFile = function saveSvgToFile(containerDiv, title) {
  var FileSaver, blob, svgFinalStr;
  svgFinalStr = getC3String(containerDiv.firstChild);
  blob = new Blob([svgFinalStr], {
    type: "image/svg+xml"
  }); // Require at use as causes server problems

  FileSaver = require('file-saver');
  return FileSaver.saveAs(blob, (title || "unnamed-chart") + ".svg");
}; // Saves svg files from layered charts
// design: design of the chart
// data: results from queries
// schema: the chart's schema
// format: "svg" or "png"


module.exports = {
  save: function save(design, data, schema, format) {
    var c3, chart, chartOptions, compiler, containerDiv, onRender, props, title;
    compiler = new LayeredChartCompiler({
      schema: schema
    });
    props = {
      design: design,
      data: data,
      width: 600,
      height: 600
    };
    chartOptions = compiler.createChartOptions(props);
    containerDiv = document.createElement("div");
    containerDiv.className += "c3";
    chartOptions.bindto = containerDiv;
    title = design.titleText;
    chart = null;

    onRender = function onRender() {
      return _.defer(function () {
        var customStyle, el;

        if (format === "svg") {
          saveSvgToFile(containerDiv, title);
        } else if (format === "png") {
          // saveSvgAsPng does not include the styles for the svg element itself
          // so set the styles inline
          // see: https://github.com/exupero/saveSvgAsPng/issues/110
          el = $(containerDiv).find("svg")[0];
          el.style.fontFamily = "sans-serif";
          el.style.fontStyle = "normal";
          el.style.fontVariant = "normal";
          el.style.fontWeight = "normal";
          el.style.fontStretch = "normal";
          el.style.fontSize = "10px";
          el.style.lineHeight = "normal";
          customStyle = document.createElement('style');
          customStyle.type = 'text/css';
          customStyle.appendChild(document.createTextNode("<![CDATA[\nline, path {fill: none;stroke: rgb(0, 0, 0);}\n]]>"));
          el.appendChild(customStyle);
          saveSvgAsPng.saveSvgAsPng(el, "".concat(title || "untitled", ".png"), {
            selectorRemap: function selectorRemap(selector) {
              if (selector === ".c3 path, .c3 line" || selector === ".c3 line, .c3 path") {
                return "path, line";
              }

              if (selector.indexOf(".c3 ") === 0) {
                return selector.substr(4);
              } else {
                return selector;
              }
            },
            backgroundColor: "#fff"
          });
        }

        return chart.destroy();
      });
    };

    chartOptions.onrendered = _.debounce(_.once(onRender), 1000);
    c3 = require('c3');
    return chart = c3.generate(chartOptions);
  }
};