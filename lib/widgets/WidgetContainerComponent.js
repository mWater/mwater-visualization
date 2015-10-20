var Container, DragDropContainer, DragDropContext, DragSource, DropTarget, H, HTML5Backend, LayoutComponent, MoveLayoutComponent, MoveResizeLayoutComponent, React, ReactDOM, _, moveCollect, moveSpec, resizeCollect, resizeSpec, targetCollect, targetSpec,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

React = require('react');

ReactDOM = require('react-dom');

_ = require('lodash');

H = React.DOM;

DragSource = require('react-dnd').DragSource;

DropTarget = require('react-dnd').DropTarget;

DragDropContext = require('react-dnd').DragDropContext;

HTML5Backend = require('react-dnd-html5-backend');

LayoutComponent = (function(superClass) {
  extend(LayoutComponent, superClass);

  function LayoutComponent() {
    return LayoutComponent.__super__.constructor.apply(this, arguments);
  }

  LayoutComponent.propTypes = {
    dragInfo: React.PropTypes.object.isRequired
  };

  LayoutComponent.prototype.render = function() {
    return React.cloneElement(React.Children.only(this.props.children), {
      connectMoveHandle: this.props.connectMoveHandle,
      connectResizeHandle: this.props.connectResizeHandle
    });
  };

  return LayoutComponent;

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

MoveLayoutComponent = DragSource("block-move", moveSpec, moveCollect)(LayoutComponent);

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

MoveResizeLayoutComponent = DragSource("block-resize", resizeSpec, resizeCollect)(MoveLayoutComponent);

Container = (function(superClass) {
  extend(Container, superClass);

  Container.propTypes = {
    layoutEngine: React.PropTypes.object.isRequired,
    layouts: React.PropTypes.object.isRequired,
    elems: React.PropTypes.object.isRequired,
    width: React.PropTypes.number.isRequired,
    connectDropTarget: React.PropTypes.func.isRequired,
    onLayoutUpdate: React.PropTypes.func.isRequired
  };

  function Container(props) {
    this.renderLayout = bind(this.renderLayout, this);
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
    return this.setState({
      resizeHover: hoverInfo
    });
  };

  Container.prototype.dropLayout = function(id, droppedRect) {
    var droppedLayout, layouts;
    this.setState({
      moveHover: null,
      resizeHover: null
    });
    droppedLayout = this.props.layoutEngine.rectToLayout(droppedRect);
    layouts = _.clone(this.props.layouts);
    layouts[id] = droppedLayout;
    layouts = this.props.layoutEngine.performLayout(layouts, id);
    return this.props.onLayoutUpdate(layouts);
  };

  Container.prototype.dropMoveLayout = function(dropInfo) {
    var droppedRect;
    droppedRect = {
      x: dropInfo.x,
      y: dropInfo.y,
      width: dropInfo.dragInfo.bounds.width,
      height: dropInfo.dragInfo.bounds.height
    };
    return this.dropLayout(dropInfo.dragInfo.id, droppedRect);
  };

  Container.prototype.dropResizeLayout = function(dropInfo) {
    var droppedRect;
    droppedRect = {
      x: dropInfo.dragInfo.bounds.x,
      y: dropInfo.dragInfo.bounds.y,
      width: dropInfo.width,
      height: dropInfo.height
    };
    return this.dropLayout(dropInfo.dragInfo.id, droppedRect);
  };

  Container.prototype.componentWillReceiveProps = function(nextProps) {
    if (!nextProps.isOver && (this.state.moveHover || this.state.resizeHover)) {
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
        border: "dashed 3px #AAA",
        borderRadius: 5,
        padding: 5,
        position: "absolute"
      }
    });
  };

  Container.prototype.renderLayout = function(id, layout, visible) {
    var bounds, dragInfo, style;
    if (visible == null) {
      visible = true;
    }
    bounds = this.props.layoutEngine.getLayoutBounds(layout);
    style = {
      position: "absolute",
      left: bounds.x,
      top: bounds.y
    };
    if (!visible) {
      style.display = "none";
    }
    dragInfo = {
      id: id,
      bounds: bounds
    };
    return H.div({
      style: style,
      key: id
    }, React.createElement(MoveResizeLayoutComponent, {
      dragInfo: dragInfo
    }, React.cloneElement(this.props.elems[id], {
      width: bounds.width,
      height: bounds.height
    })));
  };

  Container.prototype.calculateLayouts = function(props, state) {
    var hoveredDragInfo, hoveredLayout, hoveredRect, layouts;
    hoveredDragInfo = null;
    hoveredLayout = null;
    if (state.moveHover) {
      hoveredDragInfo = state.moveHover.dragInfo;
      hoveredRect = {
        x: state.moveHover.x,
        y: state.moveHover.y,
        width: state.moveHover.dragInfo.bounds.width,
        height: state.moveHover.dragInfo.bounds.height
      };
      hoveredLayout = props.layoutEngine.rectToLayout(hoveredRect);
    }
    if (state.resizeHover) {
      hoveredDragInfo = state.resizeHover.dragInfo;
      hoveredRect = {
        x: state.resizeHover.dragInfo.bounds.x,
        y: state.resizeHover.dragInfo.bounds.y,
        width: state.resizeHover.width,
        height: state.resizeHover.height
      };
      hoveredLayout = props.layoutEngine.rectToLayout(hoveredRect);
    }
    layouts = _.clone(props.layouts);
    if (hoveredDragInfo) {
      layouts[hoveredDragInfo.id] = hoveredLayout;
    }
    layouts = props.layoutEngine.performLayout(layouts, hoveredDragInfo ? hoveredDragInfo.id : void 0);
    return layouts;
  };

  Container.prototype.renderLayouts = function(layouts) {
    var hover, i, id, ids, layout, len, ref, renderElems;
    renderElems = [];
    hover = this.state.moveHover || this.state.resizeHover;
    ids = [];
    for (id in layouts) {
      ids.push(id);
    }
    ref = _.sortBy(ids);
    for (i = 0, len = ref.length; i < len; i++) {
      id = ref[i];
      layout = layouts[id];
      if (!hover || id !== hover.dragInfo.id) {
        renderElems.push(this.renderLayout(id, layout));
      } else {
        renderElems.push(this.renderLayout(id, layout, false));
        renderElems.push(this.renderPlaceholder(this.props.layoutEngine.getLayoutBounds(layout)));
      }
    }
    return renderElems;
  };

  Container.prototype.shouldComponentUpdate = function(nextProps, nextState) {
    var layouts, nextLayouts;
    if (this.props.width !== nextProps.width) {
      return true;
    }
    if (this.props.layoutEngine !== nextProps.layoutEngine) {
      return true;
    }
    layouts = this.calculateLayouts(this.props, this.state);
    nextLayouts = this.calculateLayouts(nextProps, nextState);
    if (!_.isEqual(layouts, nextLayouts)) {
      return true;
    }
    if (!_.isEqual(this.props.elems, nextProps.elems)) {
      return true;
    }
    return false;
  };

  Container.prototype.render = function() {
    var layouts, style;
    layouts = this.calculateLayouts(this.props, this.state);
    style = {
      width: this.props.width,
      height: this.props.layoutEngine.calculateHeight(layouts),
      position: "relative"
    };
    return this.props.connectDropTarget(H.div({
      style: style
    }, this.renderLayouts(layouts)));
  };

  return Container;

})(React.Component);

targetSpec = {
  drop: function(props, monitor, component) {
    var rect;
    if (monitor.getItemType() === "block-move") {
      rect = ReactDOM.findDOMNode(component).getBoundingClientRect();
      component.dropMoveLayout({
        dragInfo: monitor.getItem(),
        x: monitor.getClientOffset().x - (monitor.getInitialClientOffset().x - monitor.getInitialSourceClientOffset().x) - rect.left,
        y: monitor.getClientOffset().y - (monitor.getInitialClientOffset().y - monitor.getInitialSourceClientOffset().y) - rect.top
      });
    }
    if (monitor.getItemType() === "block-resize") {
      component.dropResizeLayout({
        dragInfo: monitor.getItem(),
        width: monitor.getItem().bounds.width + monitor.getDifferenceFromInitialOffset().x,
        height: monitor.getItem().bounds.height + monitor.getDifferenceFromInitialOffset().y
      });
    }
  },
  hover: function(props, monitor, component) {
    var rect;
    if (monitor.getItemType() === "block-move") {
      rect = ReactDOM.findDOMNode(component).getBoundingClientRect();
      component.setMoveHover({
        dragInfo: monitor.getItem(),
        x: monitor.getClientOffset().x - (monitor.getInitialClientOffset().x - monitor.getInitialSourceClientOffset().x) - rect.left,
        y: monitor.getClientOffset().y - (monitor.getInitialClientOffset().y - monitor.getInitialSourceClientOffset().y) - rect.top
      });
    }
    if (monitor.getItemType() === "block-resize") {
      component.setResizeHover({
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
