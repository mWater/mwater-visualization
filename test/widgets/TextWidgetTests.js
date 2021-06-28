assert = require('chai').assert
_ = require 'lodash'

TextWidget = require '../../src/widgets/text/TextWidget'

canonical = require 'canonical-json'

compare = (actual, expected) ->
  assert.equal canonical(actual), canonical(expected), "\n" + canonical(actual) + "\n" + canonical(expected)

describe "TextWidget", ->
  describe "getTOCEntries", ->
    it "gets simple h1, h2", ->
      design = {
        items: [
          { type: "element", tag: "h1", items: ["first item"] }
          "random text"
          { type: "element", tag: "h2", items: ["second item"] }
       ]
      }

      compare(new TextWidget().getTOCEntries(design), [
        { id: 0, text: "first item", level: 1 }
        { id: 1, text: "second item", level: 2 }
      ])

    it "gets flattens text", ->
      design = {
        items: [
          { type: "element", tag: "h1", items: ["first ", { type: "element", tag: "b", items: ["item"] }] }
          { type: "element", tag: "h2", items: ["second item"] }
       ]
      }

      compare(new TextWidget().getTOCEntries(design), [
        { id: 0, text: "first item", level: 1 }
        { id: 1, text: "second item", level: 2 }
      ])
