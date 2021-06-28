import { assert } from 'chai';
import _ from 'lodash';
import TextWidget from '../../src/widgets/text/TextWidget';
import canonical from 'canonical-json';

const compare = (actual, expected) => assert.equal(canonical(actual), canonical(expected), "\n" + canonical(actual) + "\n" + canonical(expected));

describe("TextWidget", () => describe("getTOCEntries", function() {
  it("gets simple h1, h2", function() {
    const design = {
      items: [
        { type: "element", tag: "h1", items: ["first item"] },
        "random text",
        { type: "element", tag: "h2", items: ["second item"] }
     ]
    };

    return compare(new TextWidget().getTOCEntries(design), [
      { id: 0, text: "first item", level: 1 },
      { id: 1, text: "second item", level: 2 }
    ]);
  });

  return it("gets flattens text", function() {
    const design = {
      items: [
        { type: "element", tag: "h1", items: ["first ", { type: "element", tag: "b", items: ["item"] }] },
        { type: "element", tag: "h2", items: ["second item"] }
     ]
    };

    return compare(new TextWidget().getTOCEntries(design), [
      { id: 0, text: "first item", level: 1 },
      { id: 1, text: "second item", level: 2 }
    ]);
  });
}));
