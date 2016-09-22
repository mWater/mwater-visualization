var ColorSchemeFactory, brewer, c_c, d3, generateCategoricalSet, generateSequentialSet, rgbStringToHex;

d3 = require('d3-scale');

brewer = require('d3-scale-chromatic');

c_c = require('color-mixer');

rgbStringToHex = function(rgbString) {
  var _color, rgbArray;
  rgbArray = rgbString.substring(4, rgbString.length - 1).split(',').map(function(item) {
    return parseInt(item);
  });
  _color = new c_c.Color({
    rgb: rgbArray
  });
  return _color.hex();
};

generateCategoricalSet = function(set, number) {
  var i, j, ref, results;
  results = [];
  for (i = j = 1, ref = number; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
    results.push(set[i % set.length]);
  }
  return results;
};

generateSequentialSet = function(set, number) {
  var color, colors, i;
  color = d3.scaleLinear().domain([0, number - 1]).range([0, 1]);
  colors = (function() {
    var j, ref, results;
    results = [];
    for (i = j = 0, ref = number - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      results.push(set(color(i)));
    }
    return results;
  })();
  return _.map(colors, function(color) {
    return rgbStringToHex(color);
  });
};

module.exports = ColorSchemeFactory = (function() {
  function ColorSchemeFactory() {}

  ColorSchemeFactory.createColorScheme = function(options) {
    switch (options.type) {
      case 'schemeAccent':
        return generateCategoricalSet(brewer.schemeAccent, options.number);
      case 'schemeDark2':
        return generateCategoricalSet(brewer.schemeDark2, options.number);
      case 'schemePaired':
        return generateCategoricalSet(brewer.schemePaired, options.number);
      case 'schemePastel1':
        return generateCategoricalSet(brewer.schemePastel1, options.number);
      case 'schemePastel2':
        return generateCategoricalSet(brewer.schemePastel2, options.number);
      case 'schemeSet1':
        return generateCategoricalSet(brewer.schemeSet1, options.number);
      case 'schemeSet2':
        return generateCategoricalSet(brewer.schemeSet2, options.number);
      case 'schemeSet3':
        return generateCategoricalSet(brewer.schemeSet3, options.number);
      case 'interpolateBlues':
        return generateSequentialSet(brewer.interpolateBlues, options.number);
      case 'interpolateGreens':
        return generateSequentialSet(brewer.interpolateGreens, options.number);
      case 'interpolateGreys':
        return generateSequentialSet(brewer.interpolateGreys, options.number);
      case 'interpolateOranges':
        return generateSequentialSet(brewer.interpolateOranges, options.number);
      case 'interpolatePurples':
        return generateSequentialSet(brewer.interpolatePurples, options.number);
      case 'interpolateReds':
        return generateSequentialSet(brewer.interpolateReds, options.number);
      case 'interpolateBuGn':
        return generateSequentialSet(brewer.interpolateBuGn, options.number);
      case 'interpolateBuPu':
        return generateSequentialSet(brewer.interpolateBuPu, options.number);
      case 'interpolateGnBu':
        return generateSequentialSet(brewer.interpolateGnBu, options.number);
      case 'interpolateOrRd':
        return generateSequentialSet(brewer.interpolateOrRd, options.number);
      case 'interpolatePuBuGn':
        return generateSequentialSet(brewer.interpolatePuBuGn, options.number);
      case 'interpolatePuBu':
        return generateSequentialSet(brewer.interpolatePuBu, options.number);
      case 'interpolatePuRd':
        return generateSequentialSet(brewer.interpolatePuRd, options.number);
      case 'interpolateRdPu':
        return generateSequentialSet(brewer.interpolateRdPu, options.number);
      case 'interpolateYlGnBu':
        return generateSequentialSet(brewer.interpolateYlGnBu, options.number);
      case 'interpolateYlGn':
        return generateSequentialSet(brewer.interpolateYlGn, options.number);
      case 'interpolateYlOrBr':
        return generateSequentialSet(brewer.interpolateYlOrBr, options.number);
      case 'interpolateYlOrRd':
        return generateSequentialSet(brewer.interpolateYlOrRd, options.number);
      case 'interpolateBrBG':
        return generateSequentialSet(brewer.interpolateBrBG, options.number);
      case 'interpolatePRGn':
        return generateSequentialSet(brewer.interpolatePRGn, options.number);
      case 'interpolatePiYG':
        return generateSequentialSet(brewer.interpolatePiYG, options.number);
      case 'interpolatePuOr':
        return generateSequentialSet(brewer.interpolatePuOr, options.number);
      case 'interpolateRdBu':
        return generateSequentialSet(brewer.interpolateRdBu, options.number);
      case 'interpolateRdGy':
        return generateSequentialSet(brewer.interpolateRdGy, options.number);
      case 'interpolateRdYlBu':
        return generateSequentialSet(brewer.interpolateRdYlBu, options.number);
      case 'interpolateRdYlGn':
        return generateSequentialSet(brewer.interpolateRdYlGn, options.number);
      case 'interpolateSpectral':
        return generateSequentialSet(brewer.interpolateSpectral, options.number);
      default:
        throw "Scheme type is not valid";
    }
  };

  return ColorSchemeFactory;

})();
