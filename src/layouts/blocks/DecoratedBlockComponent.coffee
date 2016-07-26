React = require 'react'
H = React.DOM
R = React.createElement

# Block decorated with drag/close hover controls
module.exports = class DecoratedBlockComponent extends React.Component
  @propTypes:
    onBlockRemove: React.PropTypes.func.isRequired # Called when block is removed

    connectDragSource: React.PropTypes.func.isRequired # the drag source connector, supplied by React DND
    connectDragPreview: React.PropTypes.func.isRequired # the drag preview connector, supplied by React DND

  render: ->
    elem = H.div className: "mwater-visualization-block",
      if not @props.isDragging
        @props.connectDragSource(H.div key: "move", className: "mwater-visualization-block-move",
          H.i className: "fa fa-ellipsis-h")

      if not @props.isDragging
        H.div key: "remove", className: "mwater-visualization-block-remove", onClick: @props.onBlockRemove,
          H.i className: "fa fa-times"

      @props.connectDragPreview(React.Children.only(@props.children))

    return elem
