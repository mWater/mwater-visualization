// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import _ from 'lodash';
import { expect } from 'chai';
import { assert } from 'chai';
import ColorSchemeFactory from '../src/ColorSchemeFactory';


describe("ColorSchemeFactory", () => describe("createColorScheme", function() {
  it("creates categorical color schemes and cycles", function() {
    const options = {
      type: 'schemeAccent',
      number: 10
    };
    const colors = ColorSchemeFactory.createColorScheme(options);

    expect(colors.length).to.equal(10);
    return expect(colors[1]).to.equal(colors[9]);
  });

  return it("creates sequential color schemes", function() {
    let colors;
    const options = {
      type: 'interpolateBlues',
      number: 10
    };
    return colors = ColorSchemeFactory.createColorScheme(options);
  });
}));
