var LayeredChartCompiler, getC3Css, getC3String, saveSvgAsPng, saveSvgToFile;

saveSvgAsPng = require('save-svg-as-png');

LayeredChartCompiler = require('./LayeredChartCompiler');

getC3Css = (function(_this) {
  return function() {
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
  };
})(this);

getC3String = (function(_this) {
  return function(c3Node) {
    var cdata, css, styleNode, svgFinalStr, svgNode, svgStr, xml;
    svgStr = c3Node.outerHTML;
    xml = $.parseXML(svgStr);
    svgNode = xml.documentElement;
    svgNode.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgNode.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    styleNode = xml.createElement("style");
    styleNode.setAttribute("type", "text/css");
    css = getC3Css();
    css += "svg { font-style: normal; font-variant: normal; font-weight: normal; font-stretch: normal; font-size: 10px; line-height: normal; font-family: sans-serif; -webkit-tap-highlight-color: transparent; }\n";
    css += "path, line { fill: none; stroke: rgb(0, 0, 0); }\n";
    css += "text { user-select: none; }\n";
    cdata = xml.createCDATASection(css);
    styleNode.appendChild(cdata);
    svgNode.insertBefore(styleNode, svgNode.firstChild);
    svgFinalStr = new XMLSerializer().serializeToString(xml);
    return svgFinalStr;
  };
})(this);

saveSvgToFile = function(containerDiv, title) {
  var blob, filesaver, svgFinalStr;
  svgFinalStr = getC3String(containerDiv.firstChild);
  blob = new Blob([svgFinalStr], {
    type: "image/svg+xml"
  });
  filesaver = require('filesaver.js');
  return filesaver(blob, (title || "unnamed-chart") + ".svg");
};

module.exports = {
  save: function(design, data, schema, format) {
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
    onRender = (function(_this) {
      return function() {
        return _.defer(function() {
          var el;
          if (format === "svg") {
            saveSvgToFile(containerDiv, title);
          } else if (format === "png") {
            el = $(containerDiv).find("svg")[0];
            el.style.fontFamily = "sans-serif";
            el.style.fontStyle = "normal";
            el.style.fontVariant = "normal";
            el.style.fontWeight = "normal";
            el.style.fontStretch = "normal";
            el.style.fontSize = "10px";
            el.style.lineHeight = "normal";
            saveSvgAsPng.saveSvgAsPng(el, (title || "untitled") + ".png", {
              selectorRemap: function(selector) {
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
    })(this);
    chartOptions.onrendered = _.debounce(_.once(onRender), 1000);
    c3 = require('c3');
    return chart = c3.generate(chartOptions);
  }
};
