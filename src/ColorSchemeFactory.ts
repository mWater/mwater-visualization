import _ from "lodash"
import * as d3Scale from "d3-scale"
import * as brewer from "d3-scale-chromatic"
import c_c from "color-mixer"

function rgbStringToHex(rgbString: any) {
  const rgbArray = rgbString
    .substring(4, rgbString.length - 1)
    .split(",")
    .map((item: any) => parseInt(item))
  const _color = new c_c.Color({ rgb: rgbArray })
  return _color.hex()
}

function generateCategoricalSet(set: any, number: any, reversed: any) {
  return __range__(0, number, false).map((i) => set[(reversed ? number - i - 1 : i) % set.length])
}

function generateSequentialSet(set: any, number: any, reversed: any) {
  const color = d3Scale
    .scaleLinear()
    .domain([0, number - 1])
    .range([0, 1])
  const colors = __range__(0, number, false).map((i) => set(color(reversed ? number - i - 1 : i)))
  return _.map(colors, (color) => rgbStringToHex(color))
}

export default class ColorSchemeFactory {
  // creates a color scheme
  // options:
  //   type: string (type of the color scheme)
  //   number: int (number of colors to be generated)
  //   reversed: true to reversed
  static createColorScheme(options: any) {
    switch (options.type) {
      case "schemeAccent":
        return generateCategoricalSet(brewer.schemeAccent, options.number, options.reversed)
      case "schemeDark2":
        return generateCategoricalSet(brewer.schemeDark2, options.number, options.reversed)
      case "schemePaired":
        return generateCategoricalSet(brewer.schemePaired, options.number, options.reversed)
      case "schemePastel1":
        return generateCategoricalSet(brewer.schemePastel1, options.number, options.reversed)
      case "schemePastel2":
        return generateCategoricalSet(brewer.schemePastel2, options.number, options.reversed)
      case "schemeSet1":
        return generateCategoricalSet(brewer.schemeSet1, options.number, options.reversed)
      case "schemeSet2":
        return generateCategoricalSet(brewer.schemeSet2, options.number, options.reversed)
      case "schemeSet3":
        return generateCategoricalSet(brewer.schemeSet3, options.number, options.reversed)
      case "interpolateBlues":
        return generateSequentialSet(brewer.interpolateBlues, options.number, options.reversed)
      case "interpolateGreens":
        return generateSequentialSet(brewer.interpolateGreens, options.number, options.reversed)
      case "interpolateGreys":
        return generateSequentialSet(brewer.interpolateGreys, options.number, options.reversed)
      case "interpolateOranges":
        return generateSequentialSet(brewer.interpolateOranges, options.number, options.reversed)
      case "interpolatePurples":
        return generateSequentialSet(brewer.interpolatePurples, options.number, options.reversed)
      case "interpolateReds":
        return generateSequentialSet(brewer.interpolateReds, options.number, options.reversed)
      case "interpolateBuGn":
        return generateSequentialSet(brewer.interpolateBuGn, options.number, options.reversed)
      case "interpolateBuPu":
        return generateSequentialSet(brewer.interpolateBuPu, options.number, options.reversed)
      case "interpolateGnBu":
        return generateSequentialSet(brewer.interpolateGnBu, options.number, options.reversed)
      case "interpolateOrRd":
        return generateSequentialSet(brewer.interpolateOrRd, options.number, options.reversed)
      case "interpolatePuBuGn":
        return generateSequentialSet(brewer.interpolatePuBuGn, options.number, options.reversed)
      case "interpolatePuBu":
        return generateSequentialSet(brewer.interpolatePuBu, options.number, options.reversed)
      case "interpolatePuRd":
        return generateSequentialSet(brewer.interpolatePuRd, options.number, options.reversed)
      case "interpolateRdPu":
        return generateSequentialSet(brewer.interpolateRdPu, options.number, options.reversed)
      case "interpolateYlGnBu":
        return generateSequentialSet(brewer.interpolateYlGnBu, options.number, options.reversed)
      case "interpolateYlGn":
        return generateSequentialSet(brewer.interpolateYlGn, options.number, options.reversed)
      case "interpolateYlOrBr":
        return generateSequentialSet(brewer.interpolateYlOrBr, options.number, options.reversed)
      case "interpolateYlOrRd":
        return generateSequentialSet(brewer.interpolateYlOrRd, options.number, options.reversed)
      case "interpolateBrBG":
        return generateSequentialSet(brewer.interpolateBrBG, options.number, options.reversed)
      case "interpolatePRGn":
        return generateSequentialSet(brewer.interpolatePRGn, options.number, options.reversed)
      case "interpolatePiYG":
        return generateSequentialSet(brewer.interpolatePiYG, options.number, options.reversed)
      case "interpolatePuOr":
        return generateSequentialSet(brewer.interpolatePuOr, options.number, options.reversed)
      case "interpolateRdBu":
        return generateSequentialSet(brewer.interpolateRdBu, options.number, options.reversed)
      case "interpolateRdGy":
        return generateSequentialSet(brewer.interpolateRdGy, options.number, options.reversed)
      case "interpolateRdYlBu":
        return generateSequentialSet(brewer.interpolateRdYlBu, options.number, options.reversed)
      case "interpolateRdYlGn":
        return generateSequentialSet(brewer.interpolateRdYlGn, options.number, options.reversed)
      case "interpolateSpectral":
        return generateSequentialSet(brewer.interpolateSpectral, options.number, options.reversed)
      default:
        throw "Scheme type is not valid"
    }
  }

  // Create a color map for a series of categories. Null is treated specially and assumed to be last.
  static createColorMapForCategories(categories: any, isCategorical: any) {
    let type
    if (isCategorical) {
      type = "schemeSet1"
    } else {
      type = "interpolateBlues"
    }

    const scheme = ColorSchemeFactory.createColorScheme({
      type,
      // Null doesn't count to length
      number: _.any(categories, (c) => c.value == null) ? categories.length - 1 : categories.length
    })

    const colorMap = _.map(categories, (category, i) => ({
      value: category.value,
      color: category.value === null ? "#aaaaaa" : scheme[i % scheme.length]
    }))

    return colorMap
  }
}

function __range__(left: any, right: any, inclusive: any) {
  let range = []
  let ascending = left < right
  let end = !inclusive ? right : ascending ? right + 1 : right - 1
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i)
  }
  return range
}
