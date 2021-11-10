import _ from "lodash"
import uuid from "uuid"

/** Layout that does blocks that are stacked vertically or horizontally 
 * alternately. That is, first is vertical stack, which can contain horizontal 
 * stack, etc. */
export interface LayoutBlock {
  /** id of block */
  id: string

  type: "root" | "vertical" | "horizontal" | "widget" | "spacer"

  /** if a widget */
  widgetType?: string

  /** w/h if not autoHeight */
  aspectRatio?: number

  /** widget design */
  design?: any

  /** weights for proportioning horizontal blocks. Default is 1 */
  weights?: number[]

  /** other blocks if not a widget */
  blocks?: LayoutBlock[]
}

// When block is dropped on it. side is top, left, bottom, right)
// returns new root block
export function dropBlock(rootBlock: LayoutBlock, sourceBlock: LayoutBlock, targetBlock: LayoutBlock, side: "top" | "left" | "right" | "bottom"): LayoutBlock {
  // Handle root case, only dropping on bottom
  if (targetBlock.type === "root" && rootBlock.id === targetBlock.id) {
    const blocks = rootBlock.blocks!.slice()
    blocks.push(sourceBlock)
    return _.extend({}, rootBlock, { blocks })
  }

  // If vertical
  if (["vertical", "root"].includes(rootBlock.type)) {
    let blocks = rootBlock.blocks!

    // Find target block
    const index = _.findIndex(blocks, { id: targetBlock.id })
    if (index >= 0) {
      blocks = blocks.slice()

      // Add
      switch (side) {
        case "top":
          blocks.splice(index, 0, sourceBlock)
          break

        case "bottom":
          blocks.splice(index + 1, 0, sourceBlock)
          break

        case "left":
          blocks.splice(index, 1, { id: uuid(), type: "horizontal", blocks: [sourceBlock, targetBlock] })
          break

        case "right":
          blocks.splice(index, 1, { id: uuid(), type: "horizontal", blocks: [targetBlock, sourceBlock] })
          break
      }

      return _.extend({}, rootBlock, { blocks })
    } else {
      // Recurse
      blocks = _.map(blocks, (block) => exports.dropBlock(block, sourceBlock, targetBlock, side))
      return _.extend({}, rootBlock, { blocks })
    }
  }

  // If horizontal
  if (rootBlock.type === "horizontal") {
    let blocks = rootBlock.blocks!

    // Find target block
    const index = _.findIndex(blocks, { id: targetBlock.id })
    if (index >= 0) {
      blocks = blocks.slice()

      // TODO splice into weights
      // TODO weights as map?

      // Add
      switch (side) {
        case "left":
          blocks.splice(index, 0, sourceBlock)
          break

        case "right":
          blocks.splice(index + 1, 0, sourceBlock)
          break

        case "top":
          blocks.splice(index, 1, { id: uuid(), type: "vertical", blocks: [sourceBlock, targetBlock] })
          break

        case "bottom":
          blocks.splice(index, 1, { id: uuid(), type: "vertical", blocks: [targetBlock, sourceBlock] })
          break
      }

      return _.extend({}, rootBlock, { blocks })
    } else {
      // Recurse
      blocks = _.map(blocks, (block) => exports.dropBlock(block, sourceBlock, targetBlock, side))
      return _.extend({}, rootBlock, { blocks })
    }
  }

  return rootBlock
}

// Updates a block
// returns new root block
export function updateBlock(rootBlock: LayoutBlock, block: LayoutBlock): LayoutBlock {
  // If vertical or horizontal
  if (["vertical", "horizontal", "root"].includes(rootBlock.type)) {
    let { blocks } = rootBlock

    // Update block
    blocks = _.map(blocks!, function (b) {
      if (b.id === block.id) {
        return block
      } else {
        return b
      }
    })

    // Recurse
    blocks = _.map(blocks, (b) => exports.updateBlock(b, block))

    return _.extend({}, rootBlock, { blocks })
  }

  return rootBlock
}

// When block is removed
// returns new root block
export function removeBlock(rootBlock: LayoutBlock, block: LayoutBlock): LayoutBlock | null {
  // If vertical or horizontal
  if (["vertical", "horizontal", "root"].includes(rootBlock.type)) {
    let blocks = rootBlock.blocks!

    // Remove blocks
    blocks = _.filter(blocks, (b) => b.id !== block.id)

    // TODO remove weight

    // Recurse
    blocks = _.compact(_.map(blocks, (b) => exports.removeBlock(b, block)))

    // If empty and not root, return null
    if (blocks.length === 0 && rootBlock.type !== "root") {
      return null
    }

    return { ...rootBlock, blocks }
  }

  return rootBlock
}

// Clean blocks, simplifying as needed
export function cleanBlock(rootBlock: LayoutBlock): LayoutBlock {
  // If vertical or horizontal
  if (["vertical", "horizontal", "root"].includes(rootBlock.type)) {
    let blocks = rootBlock.blocks!

    // Simplify
    if (blocks.length === 1 && rootBlock.type !== "root") {
      return blocks[0]
    }

    // Simplify nested blocks of same type (e.g. vertical inside root becomes a flat list)
    blocks = _.flatten(
      _.map(blocks, function (b) {
        if (b.type === "horizontal" && rootBlock.type === "horizontal") {
          return b.blocks
        }

        if (b.type === "vertical" && ["root", "vertical"].includes(rootBlock.type)) {
          return b.blocks
        }

        return b
      })
    ) as LayoutBlock[]

    // TODO # Truncate weights
    // weights = null
    // if rootBlock.type == "horizontal" and rootBlock.weights
    //   if rootBlock.weights.length > blocks.length
    //     weights = _.take(rootBlock.w)

    // Recurse
    blocks = _.map(blocks, (b) => exports.cleanBlock(b))

    return _.extend({}, rootBlock, { blocks })
  }

  return rootBlock
}
