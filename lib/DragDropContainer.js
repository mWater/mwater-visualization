var Block, Container, DragDropContainer, DragDropContext, DragSource, DropTarget, H, HTML5Backend, MoveBlock, MoveResizeBlock, React, moveCollect, moveSpec, resizeCollect, resizeSpec, targetCollect, targetSpec,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

React = require('react');

H = React.DOM;

DragSource = require('react-dnd').DragSource;

DropTarget = require('react-dnd').DropTarget;

DragDropContext = require('react-dnd').DragDropContext;

HTML5Backend = require('react-dnd/modules/backends/HTML5');

Block = (function(superClass) {
  extend(Block, superClass);

  function Block() {
    return Block.__super__.constructor.apply(this, arguments);
  }

  Block.propTypes = {
    dragInfo: React.PropTypes.object.isRequired
  };

  Block.prototype.render = function() {
    return React.cloneElement(React.Children.only(this.props.children), {
      connectMoveHandle: this.props.connectMoveHandle,
      connectResizeHandle: this.props.connectResizeHandle
    });
  };

  return Block;

})(React.Component);

moveSpec = {
  beginDrag: function(props, monitor, component) {
    return props.dragInfo;
  }
};

moveCollect = function(connect, monitor) {
  return {
    connectMoveHandle: connect.dragSource()
  };
};

MoveBlock = DragSource("block-move", moveSpec, moveCollect)(Block);

resizeSpec = {
  beginDrag: function(props, monitor, component) {
    return props.dragInfo;
  }
};

resizeCollect = function(connect, monitor) {
  return {
    connectResizeHandle: connect.dragSource()
  };
};

MoveResizeBlock = DragSource("block-resize", resizeSpec, resizeCollect)(MoveBlock);

Container = (function(superClass) {
  extend(Container, superClass);

  Container.propTypes = {
    layoutEngine: React.PropTypes.object.isRequired,
    blocks: React.PropTypes.array.isRequired,
    elems: React.PropTypes.object.isRequired,
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    connectDropTarget: React.PropTypes.func.isRequired,
    onLayoutUpdate: React.PropTypes.func.isRequired
  };

  function Container(props) {
    this.renderBlock = bind(this.renderBlock, this);
    Container.__super__.constructor.apply(this, arguments);
    this.state = {
      moveHover: null,
      resizeHover: null
    };
  }

  Container.prototype.setMoveHover = function(hoverInfo) {
    return this.setState({
      moveHover: hoverInfo
    });
  };

  Container.prototype.setResizeHover = function(hoverInfo) {
    console.log(hoverInfo);
    return this.setState({
      resizeHover: hoverInfo
    });
  };

  Container.prototype.dropBlock = function(block, droppedBlockRect) {
    var blockLookup, blocks, droppedBlockLayout, key, layouts, value;
    this.setState({
      moveHover: null,
      resizeHover: null
    });
    blockLookup = _.indexBy(this.props.blocks, "id");
    droppedBlockLayout = this.props.layoutEngine.rectToLayout(droppedBlockRect);
    blockLookup[block.id] = _.extend({}, block, {
      layout: droppedBlockLayout
    });
    layouts = _.mapValues(blockLookup, function(b) {
      return b.layout;
    });
    layouts = this.props.layoutEngine.performLayout(layouts, block.id);
    blocks = [];
    for (key in layouts) {
      value = layouts[key];
      blocks.push(_.extend({}, blockLookup[key], {
        layout: value
      }));
    }
    return this.props.onLayoutUpdate(blocks);
  };

  Container.prototype.dropMoveBlock = function(dropInfo) {
    var droppedBlockRect;
    droppedBlockRect = {
      x: dropInfo.x,
      y: dropInfo.y,
      width: dropInfo.dragInfo.bounds.width,
      height: dropInfo.dragInfo.bounds.height
    };
    return this.dropBlock(dropInfo.dragInfo.block, droppedBlockRect);
  };

  Container.prototype.dropResizeBlock = function(dropInfo) {
    var droppedBlockRect;
    droppedBlockRect = {
      x: dropInfo.dragInfo.bounds.x,
      y: dropInfo.dragInfo.bounds.y,
      width: dropInfo.width,
      height: dropInfo.height
    };
    return this.dropBlock(dropInfo.dragInfo.block, droppedBlockRect);
  };

  Container.prototype.componentWillReceiveProps = function(nextProps) {
    if (!nextProps.isOver) {
      return _.defer((function(_this) {
        return function() {
          return _this.setState({
            moveHover: null,
            resizeHover: null
          });
        };
      })(this));
    }
  };

  Container.prototype.renderPlaceholder = function(bounds) {
    return H.div({
      key: "placeholder",
      style: {
        position: "absolute",
        left: bounds.x,
        top: bounds.y,
        width: bounds.width,
        height: bounds.height,
        border: "dashed 3px #DDD",
        borderRadius: 5,
        padding: 5,
        position: "absolute"
      }
    });
  };

  Container.prototype.renderBlock = function(block) {
    var bounds, dragInfo, style;
    bounds = this.props.layoutEngine.getLayoutBounds(block.layout);
    style = {
      position: "absolute",
      left: bounds.x,
      top: bounds.y
    };
    dragInfo = {
      block: block,
      bounds: bounds
    };
    return H.div({
      style: style,
      key: block.id
    }, React.createElement(MoveResizeBlock, {
      dragInfo: dragInfo
    }, React.cloneElement(this.props.elems[block.id], {
      width: bounds.width,
      height: bounds.height
    })));
  };

  Container.prototype.renderBlocks = function() {
    var block, blockLookup, blocks, hoveredBlockLayout, hoveredBlockRect, hoveredDragInfo, i, key, layouts, len, renderElems, value;
    renderElems = [];
    hoveredDragInfo = null;
    hoveredBlockLayout = null;
    if (this.state.moveHover) {
      hoveredDragInfo = this.state.moveHover.dragInfo;
      hoveredBlockRect = {
        x: this.state.moveHover.x,
        y: this.state.moveHover.y,
        width: this.state.moveHover.dragInfo.bounds.width,
        height: this.state.moveHover.dragInfo.bounds.height
      };
      hoveredBlockLayout = this.props.layoutEngine.rectToLayout(hoveredBlockRect);
    }
    if (this.state.resizeHover) {
      hoveredDragInfo = this.state.resizeHover.dragInfo;
      hoveredBlockRect = {
        x: this.state.resizeHover.dragInfo.bounds.x,
        y: this.state.resizeHover.dragInfo.bounds.y,
        width: this.state.resizeHover.width,
        height: this.state.resizeHover.height
      };
      hoveredBlockLayout = this.props.layoutEngine.rectToLayout(hoveredBlockRect);
    }
    blockLookup = _.indexBy(this.props.blocks, "id");
    if (hoveredDragInfo) {
      blockLookup[hoveredDragInfo.block.id] = _.extend({}, hoveredDragInfo.block, {
        layout: hoveredBlockLayout
      });
    }
    layouts = _.mapValues(blockLookup, function(b) {
      return b.layout;
    });
    layouts = this.props.layoutEngine.performLayout(layouts, hoveredDragInfo ? hoveredDragInfo.block.id : void 0);
    blocks = [];
    for (key in layouts) {
      value = layouts[key];
      blocks.push(_.extend({}, blockLookup[key], {
        layout: value
      }));
    }
    for (i = 0, len = blocks.length; i < len; i++) {
      block = blocks[i];
      if (!hoveredBlockLayout || block.id !== hoveredDragInfo.block.id) {
        renderElems.push(this.renderBlock(block));
      } else {
        renderElems.push(this.renderPlaceholder(this.props.layoutEngine.getLayoutBounds(hoveredBlockLayout)));
      }
    }
    return renderElems;
  };

  Container.prototype.render = function() {
    var style;
    style = {
      width: this.props.width,
      height: this.props.height,
      position: "relative"
    };
    return this.props.connectDropTarget(H.div({
      style: style
    }, this.renderBlocks()));
  };

  return Container;

})(React.Component);

targetSpec = {
  drop: function(props, monitor, component) {
    if (monitor.getItemType() === "block-move") {
      component.dropMoveBlock({
        dragInfo: monitor.getItem(),
        x: monitor.getClientOffset().x - (monitor.getInitialClientOffset().x - monitor.getInitialSourceClientOffset().x),
        y: monitor.getClientOffset().y - (monitor.getInitialClientOffset().y - monitor.getInitialSourceClientOffset().y)
      });
    }
    if (monitor.getItemType() === "block-resize") {
      return component.dropResizeBlock({
        dragInfo: monitor.getItem(),
        width: monitor.getItem().bounds.width + monitor.getDifferenceFromInitialOffset().x,
        height: monitor.getItem().bounds.height + monitor.getDifferenceFromInitialOffset().y
      });
    }
  },
  hover: function(props, monitor, component) {
    if (monitor.getItemType() === "block-move") {
      component.setMoveHover({
        dragInfo: monitor.getItem(),
        x: monitor.getClientOffset().x - (monitor.getInitialClientOffset().x - monitor.getInitialSourceClientOffset().x),
        y: monitor.getClientOffset().y - (monitor.getInitialClientOffset().y - monitor.getInitialSourceClientOffset().y)
      });
    }
    if (monitor.getItemType() === "block-resize") {
      return component.setResizeHover({
        dragInfo: monitor.getItem(),
        width: monitor.getItem().bounds.width + monitor.getDifferenceFromInitialOffset().x,
        height: monitor.getItem().bounds.height + monitor.getDifferenceFromInitialOffset().y
      });
    }
  }
};

targetCollect = function(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    clientOffset: monitor.getClientOffset()
  };
};

module.exports = DragDropContainer = DragDropContext(HTML5Backend)(DropTarget(["block-move", "block-resize"], targetSpec, targetCollect)(Container));
