"use strict";

var _, uuid;

_ = require('lodash');
uuid = require('uuid'); // When block is dropped on it. side is top, left, bottom, right)
// returns new root block

exports.dropBlock = function (rootBlock, sourceBlock, targetBlock, side) {
  var blocks, index, ref; // Handle root case, only dropping on bottom

  if (targetBlock.type === "root" && rootBlock.id === targetBlock.id) {
    blocks = rootBlock.blocks.slice();
    blocks.push(sourceBlock);
    return _.extend({}, rootBlock, {
      blocks: blocks
    });
  } // If vertical


  if ((ref = rootBlock.type) === 'vertical' || ref === 'root') {
    blocks = rootBlock.blocks; // Find target block

    index = _.findIndex(blocks, {
      id: targetBlock.id
    });

    if (index >= 0) {
      blocks = blocks.slice(); // Add 

      switch (side) {
        case "top":
          blocks.splice(index, 0, sourceBlock);
          break;

        case "bottom":
          blocks.splice(index + 1, 0, sourceBlock);
          break;

        case "left":
          blocks.splice(index, 1, {
            id: uuid(),
            type: "horizontal",
            blocks: [sourceBlock, targetBlock]
          });
          break;

        case "right":
          blocks.splice(index, 1, {
            id: uuid(),
            type: "horizontal",
            blocks: [targetBlock, sourceBlock]
          });
      }

      return _.extend({}, rootBlock, {
        blocks: blocks
      });
    } else {
      // Recurse
      blocks = _.map(blocks, function (block) {
        return exports.dropBlock(block, sourceBlock, targetBlock, side);
      });
      return _.extend({}, rootBlock, {
        blocks: blocks
      });
    }
  } // If horizontal


  if (rootBlock.type === "horizontal") {
    blocks = rootBlock.blocks; // Find target block

    index = _.findIndex(blocks, {
      id: targetBlock.id
    });

    if (index >= 0) {
      blocks = blocks.slice(); // TODO splice into weights
      // TODO weights as map?
      // Add 

      switch (side) {
        case "left":
          blocks.splice(index, 0, sourceBlock);
          break;

        case "right":
          blocks.splice(index + 1, 0, sourceBlock);
          break;

        case "top":
          blocks.splice(index, 1, {
            id: uuid(),
            type: "vertical",
            blocks: [sourceBlock, targetBlock]
          });
          break;

        case "bottom":
          blocks.splice(index, 1, {
            id: uuid(),
            type: "vertical",
            blocks: [targetBlock, sourceBlock]
          });
      }

      return _.extend({}, rootBlock, {
        blocks: blocks
      });
    } else {
      // Recurse
      blocks = _.map(blocks, function (block) {
        return exports.dropBlock(block, sourceBlock, targetBlock, side);
      });
      return _.extend({}, rootBlock, {
        blocks: blocks
      });
    }
  }

  return rootBlock;
}; // Updates a block
// returns new root block


exports.updateBlock = function (rootBlock, block) {
  var blocks, ref; // If vertical or horizontal

  if ((ref = rootBlock.type) === 'vertical' || ref === 'horizontal' || ref === 'root') {
    blocks = rootBlock.blocks; // Update block

    blocks = _.map(blocks, function (b) {
      if (b.id === block.id) {
        return block;
      } else {
        return b;
      }
    }); // Recurse

    blocks = _.map(blocks, function (b) {
      return exports.updateBlock(b, block);
    });
    return _.extend({}, rootBlock, {
      blocks: blocks
    });
  }

  return rootBlock;
}; // When block is removed
// returns new root block


exports.removeBlock = function (rootBlock, block) {
  var blocks, ref; // If vertical or horizontal

  if ((ref = rootBlock.type) === 'vertical' || ref === 'horizontal' || ref === 'root') {
    blocks = rootBlock.blocks; // Remove blocks

    blocks = _.filter(blocks, function (b) {
      return b.id !== block.id;
    }); // TODO remove weight
    // Recurse

    blocks = _.compact(_.map(blocks, function (b) {
      return exports.removeBlock(b, block);
    })); // If empty and not root, return null

    if (blocks.length === 0 && rootBlock.type !== "root") {
      return null;
    }

    return _.extend({}, rootBlock, {
      blocks: blocks
    });
  }

  return rootBlock;
}; // Clean blocks, simplifying as needed


exports.cleanBlock = function (rootBlock) {
  var blocks, ref; // If vertical or horizontal

  if ((ref = rootBlock.type) === 'vertical' || ref === 'horizontal' || ref === 'root') {
    blocks = rootBlock.blocks; // Simplify

    if (blocks.length === 1 && rootBlock.type !== "root") {
      return blocks[0];
    } // Simplify nested blocks of same type (e.g. vertical inside root becomes a flat list)


    blocks = _.flatten(_.map(blocks, function (b) {
      var ref1;

      if (b.type === "horizontal" && rootBlock.type === "horizontal") {
        return b.blocks;
      }

      if (b.type === "vertical" && ((ref1 = rootBlock.type) === "root" || ref1 === "vertical")) {
        return b.blocks;
      }

      return b;
    })); // TODO # Truncate weights
    // weights = null
    // if rootBlock.type == "horizontal" and rootBlock.weights
    //   if rootBlock.weights.length > blocks.length
    //     weights = _.take(rootBlock.w)
    // Recurse

    blocks = _.map(blocks, function (b) {
      return exports.cleanBlock(b);
    });
    return _.extend({}, rootBlock, {
      blocks: blocks
    });
  }

  return rootBlock;
};