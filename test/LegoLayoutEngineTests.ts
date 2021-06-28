// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import { assert } from 'chai';
import _ from 'lodash';
import LegoLayoutEngine from '../src/layouts/grid/LegoLayoutEngine';

describe("LegoLayoutEngine", function() {
  before(function() {
    // 6 blocks across, each 10 px
    return this.le = new LegoLayoutEngine(60, 6);
  });

  it("snaps to grid", function() {
    const rectLayout = this.le.rectToLayout({ x: 11, y: 19, width: 32, height: 42 });
    return assert.deepEqual(rectLayout, { x: 1, y: 2, w: 3, h: 4 });
});

  it("shifts existing to right if room", function() {
    const existing = { x: 1, y: 2, w: 1, h: 1 };
    const newOne = { x: 1, y: 2, w: 3, h: 4 };

    let layouts = {
      existing,
      newOne
    };

    layouts = this.le.performLayout(layouts, "newOne");
    return assert.deepEqual(layouts, {
      existing: { x: 4, y: 2, w: 1, h: 1 },
      newOne: { x: 1, y: 2, w: 3, h: 4 }
    });
});

  it("shifts existing to down if no room", function() {
    const existing = { x: 1, y: 2, w: 5, h: 1 };
    const newOne = { x: 1, y: 2, w: 3, h: 4 };

    let layouts = {
      existing,
      newOne
    };

    layouts = this.le.performLayout(layouts, "newOne");
    return assert.deepEqual(layouts, {
      existing: { x: 0, y: 6, w: 5, h: 1 },  // Moves to left
      newOne: { x: 1, y: 2, w: 3, h: 4 }
    });
});

  it("calculates height", function() {
    const existing = { x: 1, y: 2, w: 5, h: 1 };

    const layouts = {
      existing
    };

    const height = this.le.calculateHeight(layouts);
    return assert.equal(height, 40);
  });

  return it("appends layout", function() {
    const existing = { x: 1, y: 2, w: 5, h: 1 };

    const layouts = [existing];

    const newOne = this.le.appendLayout(layouts, 4, 3);
    return assert.deepEqual(newOne, { x: 0, y: 3, w: 4, h: 3 });
});
});

