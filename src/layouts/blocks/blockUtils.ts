// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import _ from 'lodash';
import uuid from 'uuid';

// When block is dropped on it. side is top, left, bottom, right)
// returns new root block
export function dropBlock(rootBlock, sourceBlock, targetBlock, side) {
  // Handle root case, only dropping on bottom
  let blocks, index;
  if ((targetBlock.type === "root") && (rootBlock.id === targetBlock.id)) {
    blocks = rootBlock.blocks.slice();
    blocks.push(sourceBlock);
    return _.extend({}, rootBlock, {blocks});
  }

  // If vertical
  if (['vertical', 'root'].includes(rootBlock.type)) {
    ({
      blocks
    } = rootBlock);

    // Find target block
    index = _.findIndex(blocks, {id: targetBlock.id});
    if (index >= 0) {
      blocks = blocks.slice();

      // Add 
      switch (side) {
        case "top":
          blocks.splice(index, 0, sourceBlock);
          break;

        case "bottom":
          blocks.splice(index + 1, 0, sourceBlock);
          break;

        case "left":
          blocks.splice(index, 1, { id: uuid(), type: "horizontal", blocks: [sourceBlock, targetBlock] });
          break;

        case "right":
          blocks.splice(index, 1, { id: uuid(), type: "horizontal", blocks: [targetBlock, sourceBlock] });
          break;
      }

      return _.extend({}, rootBlock, {blocks});
    } else {
      // Recurse
      blocks = _.map(blocks, block => exports.dropBlock(block, sourceBlock, targetBlock, side));
      return _.extend({}, rootBlock, {blocks});
    }
  }

  // If horizontal
  if (rootBlock.type === "horizontal") {
    ({
      blocks
    } = rootBlock);

    // Find target block
    index = _.findIndex(blocks, {id: targetBlock.id});
    if (index >= 0) {
      blocks = blocks.slice();

      // TODO splice into weights
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
          blocks.splice(index, 1, { id: uuid(), type: "vertical", blocks: [sourceBlock, targetBlock] });
          break;

        case "bottom":
          blocks.splice(index, 1, { id: uuid(), type: "vertical", blocks: [targetBlock, sourceBlock] });
          break;
      }

      return _.extend({}, rootBlock, {blocks});
    } else {
      // Recurse
      blocks = _.map(blocks, block => exports.dropBlock(block, sourceBlock, targetBlock, side));
      return _.extend({}, rootBlock, {blocks});
    }
  }
      
  return rootBlock;
}

// Updates a block
// returns new root block
export function updateBlock(rootBlock, block) {
  // If vertical or horizontal
  if (['vertical', 'horizontal', 'root'].includes(rootBlock.type)) {
    let {
      blocks
    } = rootBlock;

    // Update block
    blocks = _.map(blocks, function(b) { if (b.id === block.id) { return block; } else { return b; } });

    // Recurse
    blocks = _.map(blocks, b => exports.updateBlock(b, block));

    return _.extend({}, rootBlock, {blocks});
  }
  
  return rootBlock;
}

// When block is removed
// returns new root block
export function removeBlock(rootBlock, block) {
  // If vertical or horizontal
  if (['vertical', 'horizontal', 'root'].includes(rootBlock.type)) {
    let {
      blocks
    } = rootBlock;

    // Remove blocks
    blocks = _.filter(blocks, b => b.id !== block.id);

    // TODO remove weight

    // Recurse
    blocks = _.compact(_.map(blocks, b => exports.removeBlock(b, block)));

    // If empty and not root, return null
    if ((blocks.length === 0) && (rootBlock.type !== "root")) {
      return null;
    }

    return _.extend({}, rootBlock, {blocks});
  }
  
  return rootBlock;
}

// Clean blocks, simplifying as needed
export function cleanBlock(rootBlock) {
  // If vertical or horizontal
  if (['vertical', 'horizontal', 'root'].includes(rootBlock.type)) {
    let {
      blocks
    } = rootBlock;

    // Simplify
    if ((blocks.length === 1) && (rootBlock.type !== "root")) {
      return blocks[0];
    }

    // Simplify nested blocks of same type (e.g. vertical inside root becomes a flat list)
    blocks = _.flatten(_.map(blocks, function(b) { 
      if ((b.type === "horizontal") && (rootBlock.type === "horizontal")) {
        return b.blocks;
      }

      if ((b.type === "vertical") && ["root", "vertical"].includes(rootBlock.type)) {
        return b.blocks;
      }
        
      return b;
      }));

    // TODO # Truncate weights
    // weights = null
    // if rootBlock.type == "horizontal" and rootBlock.weights
    //   if rootBlock.weights.length > blocks.length
    //     weights = _.take(rootBlock.w)


    // Recurse
    blocks = _.map(blocks, b => exports.cleanBlock(b));

    return _.extend({}, rootBlock, {blocks});
  }
  
  return rootBlock;
}
