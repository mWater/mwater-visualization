_ = require 'lodash'
d3Scale = require 'd3-scale'
brewer = require 'd3-scale-chromatic'
c_c = require 'color-mixer'

rgbStringToHex = (rgbString) ->
  rgbArray = rgbString.substring(4,rgbString.length-1).split(',').map((item) -> parseInt(item))
  _color = new c_c.Color({rgb: rgbArray})
  _color.hex()

generateCategoricalSet = (set, number, reversed) ->
  (set[(if reversed then number - i - 1 else i) % set.length] for i in [0...number])

generateSequentialSet = (set, number, reversed) ->
  color = d3Scale.scaleLinear()
    .domain([0,number-1])
    .range([0,1])
  colors = (set(color((if reversed then number - i - 1 else i))) for i in [0...number])
  _.map colors, (color) -> rgbStringToHex(color)

module.exports = class ColorSchemeFactory
  # creates a color scheme
  # options:
  #   type: string (type of the color scheme)
  #   number: int (number of colors to be generated)
  #   reversed: true to reversed
  @createColorScheme: (options) ->
    switch options.type
      when 'schemeAccent' then generateCategoricalSet(brewer.schemeAccent, options.number, options.reversed)
      when 'schemeDark2' then generateCategoricalSet(brewer.schemeDark2, options.number, options.reversed)
      when 'schemePaired' then generateCategoricalSet(brewer.schemePaired, options.number, options.reversed)
      when 'schemePastel1' then generateCategoricalSet(brewer.schemePastel1, options.number, options.reversed)
      when 'schemePastel2' then generateCategoricalSet(brewer.schemePastel2, options.number, options.reversed)
      when 'schemeSet1' then generateCategoricalSet(brewer.schemeSet1, options.number, options.reversed)
      when 'schemeSet2' then generateCategoricalSet(brewer.schemeSet2, options.number, options.reversed)
      when 'schemeSet3' then generateCategoricalSet(brewer.schemeSet3, options.number, options.reversed)
      when 'interpolateBlues' then generateSequentialSet(brewer.interpolateBlues, options.number, options.reversed)
      when 'interpolateGreens' then generateSequentialSet(brewer.interpolateGreens, options.number, options.reversed)
      when 'interpolateGreys' then generateSequentialSet(brewer.interpolateGreys, options.number, options.reversed)
      when 'interpolateOranges' then generateSequentialSet(brewer.interpolateOranges, options.number, options.reversed)
      when 'interpolatePurples' then generateSequentialSet(brewer.interpolatePurples, options.number, options.reversed)
      when 'interpolateReds' then generateSequentialSet(brewer.interpolateReds, options.number, options.reversed)
      when 'interpolateBuGn' then generateSequentialSet(brewer.interpolateBuGn, options.number, options.reversed)
      when 'interpolateBuPu' then generateSequentialSet(brewer.interpolateBuPu, options.number, options.reversed)
      when 'interpolateGnBu' then generateSequentialSet(brewer.interpolateGnBu, options.number, options.reversed)
      when 'interpolateOrRd' then generateSequentialSet(brewer.interpolateOrRd, options.number, options.reversed)
      when 'interpolatePuBuGn' then generateSequentialSet(brewer.interpolatePuBuGn, options.number, options.reversed)
      when 'interpolatePuBu' then generateSequentialSet(brewer.interpolatePuBu, options.number, options.reversed)
      when 'interpolatePuRd' then generateSequentialSet(brewer.interpolatePuRd, options.number, options.reversed)
      when 'interpolateRdPu' then generateSequentialSet(brewer.interpolateRdPu, options.number, options.reversed)
      when 'interpolateYlGnBu' then generateSequentialSet(brewer.interpolateYlGnBu, options.number, options.reversed)
      when 'interpolateYlGn' then generateSequentialSet(brewer.interpolateYlGn, options.number, options.reversed)
      when 'interpolateYlOrBr' then generateSequentialSet(brewer.interpolateYlOrBr, options.number, options.reversed)
      when 'interpolateYlOrRd' then generateSequentialSet(brewer.interpolateYlOrRd, options.number, options.reversed)
      when 'interpolateBrBG' then generateSequentialSet(brewer.interpolateBrBG, options.number, options.reversed)
      when 'interpolatePRGn' then generateSequentialSet(brewer.interpolatePRGn, options.number, options.reversed)
      when 'interpolatePiYG' then generateSequentialSet(brewer.interpolatePiYG, options.number, options.reversed)
      when 'interpolatePuOr' then generateSequentialSet(brewer.interpolatePuOr, options.number, options.reversed)
      when 'interpolateRdBu' then generateSequentialSet(brewer.interpolateRdBu, options.number, options.reversed)
      when 'interpolateRdGy' then generateSequentialSet(brewer.interpolateRdGy, options.number, options.reversed)
      when 'interpolateRdYlBu' then generateSequentialSet(brewer.interpolateRdYlBu, options.number, options.reversed)
      when 'interpolateRdYlGn' then generateSequentialSet(brewer.interpolateRdYlGn, options.number, options.reversed)
      when 'interpolateSpectral' then generateSequentialSet(brewer.interpolateSpectral, options.number, options.reversed)
      else
        throw("Scheme type is not valid")

  # Create a color map for a series of categories. Null is treated specially and assumed to be last.
  @createColorMapForCategories: (categories, isCategorical) ->
    if isCategorical
      type = "schemeSet1"
    else
      type = "interpolateBlues"

    scheme = ColorSchemeFactory.createColorScheme({
      type: type
      # Null doesn't count to length
      number: if _.any(categories, (c) -> not c.value?) then categories.length - 1 else categories.length 
    })

    colorMap = _.map categories, (category, i) ->
      {
        value: category.value
        color: if category.value == null then "#aaaaaa" else scheme[i % scheme.length]
      }

    return colorMap
