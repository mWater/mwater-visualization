import _ from 'lodash';
import { assert } from 'chai';
import ItemsHtmlConverter from '../../src/richtext/ItemsHtmlConverter';
import canonical from 'canonical-json';
const compare = (actual, expected) => assert.equal(canonical(actual), canonical(expected), "\n" + canonical(actual) + "\n" + canonical(expected));

describe("ItemsHtmlConverter", () => describe("convertItemsToHtml", function() {
  before(function() {
    return this.convert = (items, html) => assert.equal(new ItemsHtmlConverter({ xyzzy: "magic" }).convertItemsToHtml(items), html);
  });

  it("converts and escapes text", function() {
    return this.convert(["test", "<>"], "test&lt;&gt;");
  });

  it("converts simple element", function() {
    return this.convert(["test", { type: "element", tag: "h1", items: ["x"] }], "test<h1>x</h1>");
  });

  it("converts style", function() {
    return this.convert([{ type: "element", tag: "h1", items: ["x"], style: { "font-weight": "bold" } }], "<h1 style=\"font-weight: bold;\">x</h1>");
  });

  it("replaces named strings", function() {
    return this.convert(["test {{xyzzy}} here"], "test magic here");
  });

  return it("ignores unknown named strings", function() {
    return this.convert(["test {{unknown}} here"], "test {{unknown}} here");
  });
}));
