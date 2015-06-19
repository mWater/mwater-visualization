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
    elems: React.PropTypes.array.isRequired,
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

  Container.prototype.dropMoveBlock = function(dropInfo) {
    var blocks, hoveredBlockRect, layouts, rectLayout, ref;
    this.setState({
      moveHover: null
    });
    blocks = this.props.blocks.slice();
    if (dropInfo.dragInfo.container === this) {
      blocks.splice(dropInfo.dragInfo.index, 1);
    }
    hoveredBlockRect = {
      x: dropInfo.x,
      y: dropInfo.y,
      width: dropInfo.dragInfo.bounds.width,
      height: dropInfo.dragInfo.bounds.height
    };
    layouts = _.pluck(blocks, "layout");
    ref = this.props.layoutEngine.insertRect(layouts, hoveredBlockRect), layouts = ref.layouts, rectLayout = ref.rectLayout;
    blocks = _.map(blocks, (function(_this) {
      return function(eb, i) {
        return {
          contents: eb.contents,
          layout: layouts[i]
        };
      };
    })(this));
    blocks.push({
      contents: dropInfo.dragInfo.contents,
      layout: rectLayout
    });
    return this.props.onLayoutUpdate(blocks);
  };

  Container.prototype.dropResizeBlock = function(dropInfo) {
    var blocks, hoveredBlockRect, layouts, rectLayout, ref;
    this.setState({
      resizeHover: null
    });
    blocks = this.props.blocks.slice();
    if (dropInfo.dragInfo.container === this) {
      blocks.splice(dropInfo.dragInfo.index, 1);
    }
    hoveredBlockRect = {
      x: dropInfo.dragInfo.bounds.x,
      y: dropInfo.dragInfo.bounds.y,
      width: dropInfo.width,
      height: dropInfo.height
    };
    layouts = _.pluck(blocks, "layout");
    ref = this.props.layoutEngine.insertRect(layouts, hoveredBlockRect), layouts = ref.layouts, rectLayout = ref.rectLayout;
    blocks = _.map(blocks, (function(_this) {
      return function(eb, i) {
        return {
          contents: eb.contents,
          layout: layouts[i]
        };
      };
    })(this));
    blocks.push({
      contents: dropInfo.dragInfo.contents,
      layout: rectLayout
    });
    return this.props.onLayoutUpdate(blocks);
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

  Container.prototype.renderBlock = function(block, elem, index) {
    var bounds, dragInfo, style;
    bounds = this.props.layoutEngine.getLayoutBounds(block.layout);
    style = {
      position: "absolute",
      left: bounds.x,
      top: bounds.y
    };
    dragInfo = {
      contents: block.contents,
      container: this,
      index: index,
      bounds: bounds
    };
    return H.div({
      style: style,
      key: "" + index
    }, React.createElement(MoveResizeBlock, {
      dragInfo: dragInfo
    }, React.cloneElement(elem, {
      width: bounds.width,
      height: bounds.height
    })));
  };

  Container.prototype.renderBlocks = function() {
    var blocks, elems, hoveredBlockRect, hoveredDragInfo, i, j, layouts, rectLayout, ref, ref1, renderElems;
    renderElems = [];
    hoveredDragInfo = null;
    hoveredBlockRect = null;
    if (this.state.moveHover) {
      hoveredDragInfo = this.state.moveHover.dragInfo;
      hoveredBlockRect = {
        x: this.state.moveHover.x,
        y: this.state.moveHover.y,
        width: this.state.moveHover.dragInfo.bounds.width,
        height: this.state.moveHover.dragInfo.bounds.height
      };
    }
    if (this.state.resizeHover) {
      hoveredDragInfo = this.state.resizeHover.dragInfo;
      hoveredBlockRect = {
        x: this.state.resizeHover.dragInfo.bounds.x,
        y: this.state.resizeHover.dragInfo.bounds.y,
        width: this.state.resizeHover.width,
        height: this.state.resizeHover.height
      };
    }
    blocks = this.props.blocks.slice();
    elems = this.props.elems.slice();
    if (hoveredDragInfo && hoveredDragInfo.container === this) {
      blocks.splice(hoveredDragInfo.index, 1);
      elems.splice(hoveredDragInfo.index, 1);
    }
    layouts = _.pluck(blocks, "layout");
    if (hoveredBlockRect) {
      ref = this.props.layoutEngine.insertRect(layouts, hoveredBlockRect), layouts = ref.layouts, rectLayout = ref.rectLayout;
    } else {
      rectLayout = null;
    }
    for (i = j = 0, ref1 = blocks.length; 0 <= ref1 ? j < ref1 : j > ref1; i = 0 <= ref1 ? ++j : --j) {
      renderElems.push(this.renderBlock({
        contents: blocks[i].contents,
        layout: layouts[i]
      }, elems[i], i));
    }
    if (rectLayout) {
      renderElems.push(this.renderPlaceholder(this.props.layoutEngine.getLayoutBounds(rectLayout)));
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
