var LayeredChartCompiler, getC3Css, getC3String, saveAs, saveSvgToFile;

LayeredChartCompiler = require('./LayeredChartCompiler');

saveAs = require('filesaver.js');

getC3Css = (function(_this) {
  return function() {
    var css, i, j, len, len1, ref, rule, rules, sheet;
    css = [];
    ref = document.styleSheets;
    for (i = 0, len = ref.length; i < len; i++) {
      sheet = ref[i];
      rules = sheet.cssRules || sheet.rules;
      for (j = 0, len1 = rules.length; j < len1; j++) {
        rule = rules[j];
        if (rule.cssText && rule.cssText.startsWith(".c3")) {
          css.push(rule.cssText);
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
    cdata = xml.createCDATASection(css);
    styleNode.appendChild(cdata);
    svgNode.insertBefore(styleNode, svgNode.firstChild);
    svgFinalStr = new XMLSerializer().serializeToString(xml);
    return svgFinalStr;
  };
})(this);

saveSvgToFile = function(c3Node, title) {
  var blob, svgFinalStr;
  svgFinalStr = getC3String(c3Node);
  blob = new Blob([svgFinalStr], {
    type: "image/svg+xml"
  });
  return saveAs(blob, (title || "unnamed-chart") + ".svg");
};

module.exports = {
  save: function(design, data, schema) {
    var chartOptions, compiler, containerDiv, props, title;
    compiler = new LayeredChartCompiler({
      schema: schema
    });
    props = {
      design: design,
      data: data,
      width: 800,
      height: 800
    };
    chartOptions = compiler.createChartOptions(props);
    containerDiv = document.createElement("div");
    chartOptions.bindto = containerDiv;
    title = design.titleText;
    chartOptions.onrendered = (function(_this) {
      return function() {
        return _.defer(function() {
          return saveSvgToFile(containerDiv.firstChild, title);
        });
      };
    })(this);
    return c3.generate(chartOptions);
  }
};
