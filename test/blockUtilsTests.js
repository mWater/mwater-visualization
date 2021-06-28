// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import _ from 'lodash';
import { assert } from 'chai';
import canonical from 'canonical-json';
import * as blockUtils from '../src/layouts/blocks/blockUtils';

function compare(actual, expected) {
  return assert.equal(
    canonical(actual),
    canonical(expected),
    "\n" + canonical(actual) + "\n" + canonical(expected) + "\n"
  );
}

describe("blockUtils", function() {
  it("updates nested block", function() {
    const design = {
      id: "root",
      type: "root",
      blocks: [
        { id: "a", type: "a" },
        { id: "b", type: "b" },
        { id: "c", type: "horizontal", blocks: [{ id: "d", type: "d" }, { id: "e", type: "e" }] }
      ]
    };

    const newDesign = blockUtils.updateBlock(design, { id: "d", type: "xyz" });
    return compare(newDesign, {
      id: "root",
      type: "root",
      blocks: [
        { id: "a", type: "a" },
        { id: "b", type: "b" },
        { id: "c", type: "horizontal", blocks: [{ id: "d", type: "xyz" }, { id: "e", type: "e" }] }
      ]
    });
  });

  it("removes nested block", function() {
    const design = {
      id: "root",
      type: "root",
      blocks: [
        { id: "a", type: "a" },
        { id: "b", type: "b" },
        { id: "c", type: "horizontal", blocks: [{ id: "d", type: "d" }, { id: "e", type: "e" }] }
      ]
    };

    const newDesign = blockUtils.removeBlock(design, { id: "d", type: "d" });
    return compare(newDesign, {
      id: "root",
      type: "root",
      blocks: [
        { id: "a", type: "a" },
        { id: "b", type: "b" },
        { id: "c", type: "horizontal", blocks: [{ id: "e", type: "e" }] }
      ]
    });
  });

  it("removes empty horizontal", function() {
    const design = {
      id: "root",
      type: "root",
      blocks: [
        { id: "a", type: "a" },
        { id: "b", type: "b" },
        { id: "c", type: "horizontal", blocks: [{ id: "d", type: "d" }] }
      ]
    };

    const newDesign = blockUtils.removeBlock(design, { id: "d", type: "d" });
    return compare(newDesign, {
      id: "root",
      type: "root",
      blocks: [
        { id: "a", type: "a" },
        { id: "b", type: "b" }
      ]
    });
  });

  it("simplifies vertical inside root", function() {
    const design = {
      id: "root",
      type: "root",
      blocks: [
        { id: "a", type: "a" },
        { id: "b", type: "b" },
        { id: "c", type: "vertical", blocks: [{ id: "d", type: "d" }, { id: "e", type: "e" }] }
      ]
    };

    const newDesign = blockUtils.cleanBlock(design);
    return compare(newDesign, {
      id: "root",
      type: "root",
      blocks: [
        { id: "a", type: "a" },
        { id: "b", type: "b" },
        { id: "d", type: "d" },
        { id: "e", type: "e" }
      ]
    });
  });


  it("removes empty vertical");

  it("simplifies horizontal with one child", function() {
    const design = {
      id: "root",
      type: "root",
      blocks: [
        { id: "a", type: "a" },
        { id: "b", type: "b" },
        { id: "c", type: "horizontal", blocks: [{ id: "d", type: "d" }] }
      ]
    };

    const newDesign = blockUtils.cleanBlock(design);
    return compare(newDesign, {
      id: "root",
      type: "root",
      blocks: [
        { id: "a", type: "a" },
        { id: "b", type: "b" },
        { id: "d", type: "d" }
      ]
    });
  });

  it("simplifies vertical with one child", function() {
    const design = {
      id: "root",
      type: "root",
      blocks: [
        { id: "a", type: "a" },
        { id: "b", type: "b" },
        { id: "c", type: "vertical", blocks: [{ id: "d", type: "d" }] }
      ]
    };

    const newDesign = blockUtils.cleanBlock(design);
    return compare(newDesign, {
      id: "root",
      type: "root",
      blocks: [
        { id: "a", type: "a" },
        { id: "b", type: "b" },
        { id: "d", type: "d" }
      ]
    });
  });


  describe("in vertical", function() {
    before(function() {
      return this.design = {
        id: "root",
        type: "root",
        blocks: [
          { id: "a", type: "a" },
          { id: "b", type: "b" }
        ]
      };});

    it("adds left", function() {
      const newDesign = blockUtils.dropBlock(this.design, { id: "new", type: "new" }, this.design.blocks[0], "left");

      compare(newDesign.blocks[0].type, "horizontal");
      return compare(newDesign.blocks[0].blocks, [
        { id: "new", type: "new" },
        { id: "a", type: "a" }
      ]);
    });

    it("adds right", function() {
      const newDesign = blockUtils.dropBlock(this.design, { id: "new", type: "new" }, this.design.blocks[0], "right");

      compare(newDesign.blocks[0].type, "horizontal");
      return compare(newDesign.blocks[0].blocks, [
        { id: "a", type: "a" },
        { id: "new", type: "new" }
      ]);
    });

    it("adds top", function() {
      const newDesign = blockUtils.dropBlock(this.design, { id: "new", type: "new" }, this.design.blocks[0], "top");

      return compare(newDesign.blocks, [
        { id: "new", type: "new" },
        { id: "a", type: "a" },
        { id: "b", type: "b" }
      ]);
    });

    return it("adds bottom", function() {
      const newDesign = blockUtils.dropBlock(this.design, { id: "new", type: "new" }, this.design.blocks[0], "bottom");

      return compare(newDesign.blocks, [
        { id: "a", type: "a" },
        { id: "new", type: "new" },
        { id: "b", type: "b" }
      ]);
    });
  });

  return describe("in horizontal", function() {
    before(function() {
      return this.design = {
        id: "horizontal",
        type: "horizontal",
        blocks: [
          { id: "a", type: "a" },
          { id: "b", type: "b" }
        ]
      };});

    it("adds top", function() {
      const newDesign = blockUtils.dropBlock(this.design, { id: "new", type: "new" }, this.design.blocks[0], "top");

      compare(newDesign.blocks[0].type, "vertical");
      return compare(newDesign.blocks[0].blocks, [
        { id: "new", type: "new" },
        { id: "a", type: "a" }
      ]);
    });

    it("adds bottom", function() {
      const newDesign = blockUtils.dropBlock(this.design, { id: "new", type: "new" }, this.design.blocks[0], "bottom");

      compare(newDesign.blocks[0].type, "vertical");
      return compare(newDesign.blocks[0].blocks, [
        { id: "a", type: "a" },
        { id: "new", type: "new" }
      ]);
    });

    it("adds left", function() {
      const newDesign = blockUtils.dropBlock(this.design, { id: "new", type: "new" }, this.design.blocks[0], "left");

      return compare(newDesign.blocks, [
        { id: "new", type: "new" },
        { id: "a", type: "a" },
        { id: "b", type: "b" }
      ]);
    });

    return it("adds right", function() {
      const newDesign = blockUtils.dropBlock(this.design, { id: "new", type: "new" }, this.design.blocks[0], "right");

      return compare(newDesign.blocks, [
        { id: "a", type: "a" },
        { id: "new", type: "new" },
        { id: "b", type: "b" }
      ]);
    });
  });
});
