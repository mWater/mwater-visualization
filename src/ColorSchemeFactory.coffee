_ = require 'lodash'
d3 = require 'd3-scale'
brewer = require 'd3-scale-chromatic'
c_c = require 'color-mixer'

rgbStringToHex = (rgbString) ->
  rgbArray = rgbString.substring(4,rgbString.length-1).split(',').map((item) -> parseInt(item))
  _color = new c_c.Color({rgb: rgbArray})
  _color.hex()

generateCategoricalSet = (set, number) ->
  (set[i % set.length ] for i in [1..number])

generateSequentialSet = (set, number) ->
  color = d3.scaleLinear()
    .domain([0,number-1])
    .range([0,1])
  colors = (set(color(i)) for i in [0..(number-1)])
  _.map colors, (color) -> rgbStringToHex(color)

module.exports = class ColorSchemeFactory
  # creates a color scheme
  # options:
  #   type: string (type of the color scheme)
  #   number: int (number of colors to be generated)
  @createColorScheme: (options) ->
    switch options.type
      when 'schemeAccent' then return generateCategoricalSet(brewer.schemeAccent, options.number)
      when 'schemeDark2' then return generateCategoricalSet(brewer.schemeDark2, options.number)
      when 'schemePaired' then return generateCategoricalSet(brewer.schemePaired, options.number)
      when 'schemePastel1' then return generateCategoricalSet(brewer.schemePastel1, options.number)
      when 'schemePastel2' then return generateCategoricalSet(brewer.schemePastel2, options.number)
      when 'schemeSet1' then return generateCategoricalSet(brewer.schemeSet1, options.number)
      when 'schemeSet2' then return generateCategoricalSet(brewer.schemeSet2, options.number)
      when 'schemeSet3' then return generateCategoricalSet(brewer.schemeSet3, options.number)
      when 'interpolateBlues' then return generateSequentialSet(brewer.interpolateBlues, options.number)
      when 'interpolateGreens' then return generateSequentialSet(brewer.interpolateGreens, options.number)
      when 'interpolateGreys' then return generateSequentialSet(brewer.interpolateGreys, options.number)
      when 'interpolateOranges' then return generateSequentialSet(brewer.interpolateOranges, options.number)
      when 'interpolatePurples' then return generateSequentialSet(brewer.interpolatePurples, options.number)
      when 'interpolateReds' then return generateSequentialSet(brewer.interpolateReds, options.number)
      when 'interpolateBuGn' then return generateSequentialSet(brewer.interpolateBuGn, options.number)
      when 'interpolateBuPu' then return generateSequentialSet(brewer.interpolateBuPu, options.number)
      when 'interpolateGnBu' then return generateSequentialSet(brewer.interpolateGnBu, options.number)
      when 'interpolateOrRd' then return generateSequentialSet(brewer.interpolateOrRd, options.number)
      when 'interpolatePuBuGn' then return generateSequentialSet(brewer.interpolatePuBuGn, options.number)
      when 'interpolatePuBu' then return generateSequentialSet(brewer.interpolatePuBu, options.number)
      when 'interpolatePuRd' then return generateSequentialSet(brewer.interpolatePuRd, options.number)
      when 'interpolateRdPu' then return generateSequentialSet(brewer.interpolateRdPu, options.number)
      when 'interpolateYlGnBu' then return generateSequentialSet(brewer.interpolateYlGnBu, options.number)
      when 'interpolateYlGn' then return generateSequentialSet(brewer.interpolateYlGn, options.number)
      when 'interpolateYlOrBr' then return generateSequentialSet(brewer.interpolateYlOrBr, options.number)
      when 'interpolateYlOrRd' then return generateSequentialSet(brewer.interpolateYlOrRd, options.number)
      when 'interpolateBrBG' then return generateSequentialSet(brewer.interpolateBrBG, options.number)
      when 'interpolatePRGn' then return generateSequentialSet(brewer.interpolatePRGn, options.number)
      when 'interpolatePiYG' then return generateSequentialSet(brewer.interpolatePiYG, options.number)
      when 'interpolatePuOr' then return generateSequentialSet(brewer.interpolatePuOr, options.number)
      when 'interpolateRdBu' then return generateSequentialSet(brewer.interpolateRdBu, options.number)
      when 'interpolateRdGy' then return generateSequentialSet(brewer.interpolateRdGy, options.number)
      when 'interpolateRdYlBu' then return generateSequentialSet(brewer.interpolateRdYlBu, options.number)
      when 'interpolateRdYlGn' then return generateSequentialSet(brewer.interpolateRdYlGn, options.number)
      when 'interpolateSpectral' then return generateSequentialSet(brewer.interpolateSpectral, options.number)
      else
        throw("Scheme type is not valid")
