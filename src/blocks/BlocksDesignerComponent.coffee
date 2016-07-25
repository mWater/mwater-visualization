React = require 'react'
H = React.DOM
R = React.createElement

HTML5Backend = require('react-dnd-html5-backend')
NestableDragDropContext = require  "react-library/lib/NestableDragDropContext"

blockUtils = require './blockUtils'

class BlocksDesignerComponent extends React.Component
  @propTypes:
    design: React.PropTypes.object.isRequired
    onDesignChange: React.PropTypes.func.isRequired

    # renders a block. Passed (options)
    #  block: block to render
    #  orientation: "horizontal" or "vertical"
    #  renderBlock: own function
    #  onBlockDrop: called with (sourceBlock, targetBlock, side) when block is dropped on it. side is top, left, bottom, right
    #  onBlockRemove: called with (block) when block is removed
    renderBlock: React.PropTypes.func.isRequired 

  handleBlockDrop: (sourceBlock, targetBlock, side) =>
    # Remove source
    design = blockUtils.removeBlock(@props.design, sourceBlock)
    design = blockUtils.dropBlock(design, sourceBlock, targetBlock, side)
    @props.onDesignChange(design)

  handleBlockRemove: (block) =>
    design = blockUtils.removeBlock(@props.design, block)
    @props.onDesignChange(design)

  render: ->
    H.div null,
      @props.renderBlock(block: @props.design, orientation: "vertical", renderBlock: @props.renderBlock, onBlockDrop: @handleBlockDrop, onBlockRemove: @handleBlockRemove)
      H.pre null, JSON.stringify(@props.design, null, 2)

module.exports = NestableDragDropContext(HTML5Backend)(BlocksDesignerComponent)

