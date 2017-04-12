_ = require 'lodash'
assert = require('chai').assert

ItemsHtmlConverter = require '../../src/richtext/ItemsHtmlConverter'

canonical = require 'canonical-json'
compare = (actual, expected) -> assert.equal canonical(actual), canonical(expected), "\n" + canonical(actual) + "\n" + canonical(expected)

describe "ItemsHtmlConverter", ->
  describe "convertItemsToHtml", ->
    before ->
      @convert = (items, html) ->
        assert.equal new ItemsHtmlConverter({ xyzzy: "magic" }).convertItemsToHtml(items), html

    it "converts and escapes text", ->
      @convert(["test", "<>"], "test&lt;&gt;")

    it "converts simple element", ->
      @convert(["test", { type: "element", tag: "h1", items: ["x"] }], "test<h1>x</h1>")

    it "converts style", ->
      @convert([{ type: "element", tag: "h1", items: ["x"], style: { "font-weight": "bold" } }], "<h1 style=\"font-weight: bold;\">x</h1>")

    it "replaces named strings", ->
      @convert(["test {{xyzzy}} here"], "test magic here")

    it "ignores unknown named strings", ->
      @convert(["test {{unknown}} here"], "test {{unknown}} here")
