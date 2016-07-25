_ = require 'lodash'
uuid = require 'node-uuid'

# When block is dropped on it. side is top, left, bottom, right)
# returns new design
exports.dropBlock = (rootBlock, sourceBlock, targetBlock, side) ->
  # Handle root case, only dropping on bottom
  if targetBlock.type == "root" and rootBlock.id == targetBlock.id
    blocks = rootBlock.design.blocks.slice()
    blocks.push(sourceBlock)
    return _.extend({}, rootBlock, design: _.extend({}, rootBlock.design, blocks: blocks))

  # If vertical
  if rootBlock.type in ['vertical', 'root']
    blocks = rootBlock.design.blocks

    # Find target block
    index = _.findIndex(blocks, id: targetBlock.id)
    if index >= 0
      blocks = blocks.slice()

      # Add 
      switch side
        when "top"
          blocks.splice(index, 0, sourceBlock)

        when "bottom"
          blocks.splice(index + 1, 0, sourceBlock)

        when "left"
          blocks.splice(index, 1, { id: uuid.v4(), type: "horizontal", design: { blocks: [sourceBlock, targetBlock] } })

        when "right"
          blocks.splice(index, 1, { id: uuid.v4(), type: "horizontal", design: { blocks: [targetBlock, sourceBlock] } })

      return _.extend({}, rootBlock, design: _.extend({}, rootBlock.design, blocks: blocks))
    else
      # Recurse
      blocks = _.map(blocks, (block) -> exports.dropBlock(block, sourceBlock, targetBlock, side))
      return _.extend({}, rootBlock, design: _.extend({}, rootBlock.design, blocks: blocks))

  # If horizontal
  if rootBlock.type == "horizontal"
    blocks = rootBlock.design.blocks

    # Find target block
    index = _.findIndex(blocks, id: targetBlock.id)
    if index >= 0
      blocks = blocks.slice()

      # Add 
      switch side
        when "left"
          blocks.splice(index, 0, sourceBlock)

        when "right"
          blocks.splice(index + 1, 0, sourceBlock)

        when "top"
          blocks.splice(index, 1, { id: uuid.v4(), type: "vertical", design: { blocks: [sourceBlock, targetBlock] } })

        when "bottom"
          blocks.splice(index, 1, { id: uuid.v4(), type: "vertical", design: { blocks: [targetBlock, sourceBlock] } })

      return _.extend({}, rootBlock, design: _.extend({}, rootBlock.design, blocks: blocks))
    else
      # Recurse
      blocks = _.map(blocks, (block) -> exports.dropBlock(block, sourceBlock, targetBlock, side))
      return _.extend({}, rootBlock, design: _.extend({}, rootBlock.design, blocks: blocks))
      
  return rootBlock


# When block is removed
# returns new design
exports.removeBlock = (rootBlock, block) ->
  # If vertical or horizontal
  if rootBlock.type in ['vertical', 'horizontal', 'root']
    blocks = rootBlock.design.blocks

    # Remove blocks
    blocks = _.filter(blocks, (b) -> b.id != block.id)

    # Recurse
    blocks = _.compact(_.map(blocks, (b) -> exports.removeBlock(b, block)))

    # If empty and not root, return null
    if blocks.length == 0 and rootBlock.type != "root"
      return null

    return _.extend({}, rootBlock, design: _.extend({}, rootBlock.design, blocks: blocks))
  
  return rootBlock
