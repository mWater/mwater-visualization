var DragSource, DraggableBlockComponent, DropTarget, H, R, React, blockSourceSpec, blockTargetSpec, collectSource, collectTarget, getDropSide,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

R = React.createElement;

DragSource = require('react-dnd').DragSource;

DropTarget = require('react-dnd').DropTarget;

DraggableBlockComponent = (function(superClass) {
  extend(DraggableBlockComponent, superClass);

  DraggableBlockComponent.propTypes = {
    block: React.PropTypes.object.isRequired,
    onBlockDrop: React.PropTypes.func.isRequired,
    style: React.PropTypes.object,
    onlyBottom: React.PropTypes.bool,
    isDragging: React.PropTypes.bool.isRequired,
    isOver: React.PropTypes.bool.isRequired,
    connectDragSource: React.PropTypes.func.isRequired,
    connectDropTarget: React.PropTypes.func.isRequired,
    connectDragPreview: React.PropTypes.func.isRequired
  };

  function DraggableBlockComponent(props) {
    DraggableBlockComponent.__super__.constructor.call(this, props);
    this.state = {
      hoverSide: null
    };
  }

  DraggableBlockComponent.prototype.renderHover = function() {
    var lineStyle;
    lineStyle = {
      position: "absolute"
    };
    if (this.props.isOver) {
      switch (this.state.hoverSide) {
        case "left":
          lineStyle.borderLeft = "solid 3px #38D";
          lineStyle.top = 0;
          lineStyle.bottom = 0;
          lineStyle.left = 0;
          break;
        case "right":
          lineStyle.borderRight = "solid 3px #38D";
          lineStyle.top = 0;
          lineStyle.right = 0;
          lineStyle.bottom = 0;
          break;
        case "top":
          lineStyle.borderTop = "solid 3px #38D";
          lineStyle.top = 0;
          lineStyle.left = 0;
          lineStyle.right = 0;
          break;
        case "bottom":
          lineStyle.borderBottom = "solid 3px #38D";
          lineStyle.bottom = 0;
          lineStyle.left = 0;
          lineStyle.right = 0;
      }
      return H.div({
        style: lineStyle
      });
    } else {
      return null;
    }
  };

  DraggableBlockComponent.prototype.render = function() {
    var style;
    style = {};
    if (this.props.isDragging) {
      style.visibility = "hidden";
    }
    return this.props.connectDropTarget(H.div({
      style: this.props.style
    }, H.div({
      style: {
        position: "relative"
      }
    }, this.renderHover(), React.cloneElement(React.Children.only(this.props.children), {
      connectMoveHandle: this.props.connectDragSource,
      connectDragPreview: this.props.connectDragPreview
    }))));
  };

  return DraggableBlockComponent;

})(React.Component);

getDropSide = function(monitor, component) {
  var blockComponent, clientOffset, fractionX, fractionY, hoverBoundingRect, hoverClientX, hoverClientY, pos;
  blockComponent = component.getDecoratedComponentInstance();
  hoverBoundingRect = ReactDOM.findDOMNode(blockComponent).getBoundingClientRect();
  clientOffset = monitor.getClientOffset();
  hoverClientX = clientOffset.x - hoverBoundingRect.left;
  hoverClientY = clientOffset.y - hoverBoundingRect.top;
  fractionX = hoverClientX / (hoverBoundingRect.right - hoverBoundingRect.left);
  fractionY = hoverClientY / (hoverBoundingRect.bottom - hoverBoundingRect.top);
  if (fractionX > fractionY) {
    if ((1 - fractionX) > fractionY) {
      pos = "top";
    } else {
      pos = "right";
    }
  } else {
    if ((1 - fractionX) > fractionY) {
      pos = "left";
    } else {
      pos = "bottom";
    }
  }
  return pos;
};

blockTargetSpec = {
  hover: function(props, monitor, component) {
    var hoveringId, myId, side;
    hoveringId = monitor.getItem().block.id;
    myId = props.block.id;
    if (hoveringId === myId) {
      return;
    }
    if (props.onlyBottom) {
      side = "bottom";
    } else {
      side = getDropSide(monitor, component);
    }
    return component.getDecoratedComponentInstance().setState({
      hoverSide: side
    });
  },
  canDrop: function(props, monitor) {
    var hoveringId, myId;
    hoveringId = monitor.getItem().block.id;
    myId = props.block.id;
    if (hoveringId === myId) {
      return false;
    }
    return true;
  },
  drop: function(props, monitor, component) {
    var side;
    if (monitor.didDrop()) {
      return;
    }
    side = component.getDecoratedComponentInstance().state.hoverSide;
    props.onBlockDrop(monitor.getItem().block, props.block, side);
  }
};

blockSourceSpec = {
  beginDrag: function(props, monitor, component) {
    return {
      block: props.block
    };
  },
  isDragging: function(props, monitor) {
    return props.block.id === monitor.getItem().block.id;
  }
};

collectTarget = function(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver({
      shallow: true
    }),
    canDrop: monitor.canDrop()
  };
};

collectSource = function(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging()
  };
};

module.exports = _.flow(DragSource("block", blockSourceSpec, collectSource), DropTarget("block", blockTargetSpec, collectTarget))(DraggableBlockComponent);
