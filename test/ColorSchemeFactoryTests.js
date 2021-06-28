_ = require 'lodash'
expect = require('chai').expect
assert = require('chai').assert
ColorSchemeFactory = require '../src/ColorSchemeFactory'


describe "ColorSchemeFactory", ->
  describe "createColorScheme", ->
    it "creates categorical color schemes and cycles", ->
      options =
        type: 'schemeAccent'
        number: 10
      colors = ColorSchemeFactory.createColorScheme(options)

      expect(colors.length).to.equal(10)
      expect(colors[1]).to.equal(colors[9])

    it "creates sequential color schemes", ->
      options =
        type: 'interpolateBlues'
        number: 10
      colors = ColorSchemeFactory.createColorScheme(options)
