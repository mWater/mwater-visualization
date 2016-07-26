React = require 'react'
H = React.DOM
R = React.createElement

HTML5Backend = require('react-dnd-html5-backend')
NestableDragDropContext = require  "react-library/lib/NestableDragDropContext"

BlockCreatorComponent = require './BlockCreatorComponent'
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

  renderPalette: ->
    H.td key: "palette", style: { width: "1%", verticalAlign: "top", height: "100%" }, 
      H.div className: "mwater-visualization-block-palette", style: { height: "100%" },
        R BlockCreatorComponent, block: { type: "text" },
          H.div className: "mwater-visualization-block-palette-item",
            H.div className: "icon",
              H.i className: "fa fa-font"
            H.div className: "title",
              "Text"
        R BlockCreatorComponent, block: { type: "image" },
          H.div className: "mwater-visualization-block-palette-item",
            H.div className: "icon",
              H.i className: "fa fa-picture-o"
            H.div className: "title",
              "Image"
        R BlockCreatorComponent, block: { type: "chart" },
          H.div className: "mwater-visualization-block-palette-item",
            H.div className: "icon",
              H.i className: "fa fa-bar-chart"
            H.div className: "title",
              "Chart"

  render: ->
    H.table style: { width: "100%", height: "100%" },
      H.tbody null,
        H.tr null,
          @renderPalette()
          H.td key: "design", style: { verticalAlign: "top", height: "100%" },
            @props.renderBlock(block: @props.design, orientation: "vertical", renderBlock: @props.renderBlock, onBlockDrop: @handleBlockDrop, onBlockRemove: @handleBlockRemove)

      # H.pre null, JSON.stringify(@props.design, null, 2)

module.exports = NestableDragDropContext(HTML5Backend)(BlocksDesignerComponent)

