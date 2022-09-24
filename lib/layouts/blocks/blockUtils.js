"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanBlock = exports.removeBlock = exports.updateBlock = exports.dropBlock = void 0;
const lodash_1 = __importDefault(require("lodash"));
const uuid_1 = __importDefault(require("uuid"));
// When block is dropped on it. side is top, left, bottom, right)
// returns new root block
function dropBlock(rootBlock, sourceBlock, targetBlock, side) {
    // Handle root case, only dropping on bottom
    if (targetBlock.type === "root" && rootBlock.id === targetBlock.id) {
        const blocks = rootBlock.blocks.slice();
        blocks.push(sourceBlock);
        return lodash_1.default.extend({}, rootBlock, { blocks });
    }
    // If vertical
    if (["vertical", "root"].includes(rootBlock.type)) {
        let blocks = rootBlock.blocks;
        // Find target block
        const index = lodash_1.default.findIndex(blocks, { id: targetBlock.id });
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
                    blocks.splice(index, 1, { id: uuid_1.default(), type: "horizontal", blocks: [sourceBlock, targetBlock] });
                    break;
                case "right":
                    blocks.splice(index, 1, { id: uuid_1.default(), type: "horizontal", blocks: [targetBlock, sourceBlock] });
                    break;
            }
            return lodash_1.default.extend({}, rootBlock, { blocks });
        }
        else {
            // Recurse
            blocks = lodash_1.default.map(blocks, (block) => dropBlock(block, sourceBlock, targetBlock, side));
            return lodash_1.default.extend({}, rootBlock, { blocks });
        }
    }
    // If horizontal
    if (rootBlock.type === "horizontal") {
        let blocks = rootBlock.blocks;
        // Find target block
        const index = lodash_1.default.findIndex(blocks, { id: targetBlock.id });
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
                    blocks.splice(index, 1, { id: uuid_1.default(), type: "vertical", blocks: [sourceBlock, targetBlock] });
                    break;
                case "bottom":
                    blocks.splice(index, 1, { id: uuid_1.default(), type: "vertical", blocks: [targetBlock, sourceBlock] });
                    break;
            }
            return lodash_1.default.extend({}, rootBlock, { blocks });
        }
        else {
            // Recurse
            blocks = lodash_1.default.map(blocks, (block) => dropBlock(block, sourceBlock, targetBlock, side));
            return lodash_1.default.extend({}, rootBlock, { blocks });
        }
    }
    return rootBlock;
}
exports.dropBlock = dropBlock;
// Updates a block
// returns new root block
function updateBlock(rootBlock, block) {
    // If vertical or horizontal
    if (["vertical", "horizontal", "root"].includes(rootBlock.type)) {
        let { blocks } = rootBlock;
        // Update block
        blocks = lodash_1.default.map(blocks, function (b) {
            if (b.id === block.id) {
                return block;
            }
            else {
                return b;
            }
        });
        // Recurse
        blocks = lodash_1.default.map(blocks, (b) => updateBlock(b, block));
        return lodash_1.default.extend({}, rootBlock, { blocks });
    }
    return rootBlock;
}
exports.updateBlock = updateBlock;
// When block is removed
// returns new root block
function removeBlock(rootBlock, block) {
    // If vertical or horizontal
    if (["vertical", "horizontal", "root"].includes(rootBlock.type)) {
        let blocks = rootBlock.blocks;
        // Remove blocks
        blocks = lodash_1.default.filter(blocks, (b) => b.id !== block.id);
        // TODO remove weight
        // Recurse
        blocks = lodash_1.default.compact(lodash_1.default.map(blocks, (b) => removeBlock(b, block)));
        // If empty and not root, return null
        if (blocks.length === 0 && rootBlock.type !== "root") {
            return null;
        }
        return Object.assign(Object.assign({}, rootBlock), { blocks });
    }
    return rootBlock;
}
exports.removeBlock = removeBlock;
// Clean blocks, simplifying as needed
function cleanBlock(rootBlock) {
    // If vertical or horizontal
    if (["vertical", "horizontal", "root"].includes(rootBlock.type)) {
        let blocks = rootBlock.blocks;
        // Simplify
        if (blocks.length === 1 && rootBlock.type !== "root") {
            return blocks[0];
        }
        // Simplify nested blocks of same type (e.g. vertical inside root becomes a flat list)
        blocks = lodash_1.default.flatten(lodash_1.default.map(blocks, function (b) {
            if (b.type === "horizontal" && rootBlock.type === "horizontal") {
                return b.blocks;
            }
            if (b.type === "vertical" && ["root", "vertical"].includes(rootBlock.type)) {
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
        blocks = lodash_1.default.map(blocks, (b) => cleanBlock(b));
        return lodash_1.default.extend({}, rootBlock, { blocks });
    }
    return rootBlock;
}
exports.cleanBlock = cleanBlock;
