var Container, DecoratedBlockComponent, DragDropContext, DragSource, DropTarget, H, HTML5Backend, LayoutComponent, MoveLayoutComponent, MoveResizeLayoutComponent, React, ReactDOM, _, moveCollect, moveSpec, resizeCollect, resizeSpec, targetCollect, targetSpec,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

React = require('react');

ReactDOM = require('react-dom');

_ = require('lodash');

H = React.DOM;

DragSource = require('react-dnd').DragSource;

DropTarget = require('react-dnd').DropTarget;

DragDropContext = require('react-dnd').DragDropContext;

HTML5Backend = require('react-dnd-html5-backend');

DecoratedBlockComponent = require('../DecoratedBlockComponent');

LayoutComponent = (function(superClass) {
  extend(LayoutComponent, superClass);

  function LayoutComponent() {
    return LayoutComponent.__super__.constructor.apply(this, arguments);
  }

  LayoutComponent.propTypes = {
    dragInfo: React.PropTypes.object.isRequired,
    canDrag: React.PropTypes.bool.isRequired
  };

  LayoutComponent.prototype.render = function() {
    if (this.props.canDrag) {
      return React.cloneElement(React.Children.only(this.props.children), {
        connectMoveHandle: this.props.connectMoveHandle,
        connectResizeHandle: this.props.connectResizeHandle
      });
    } else {
      return this.props.children;
    }
  };

  return LayoutComponent;

})(React.Component);

moveSpec = {
  beginDrag: function(props, monitor, component) {
    return props.dragInfo;
  },
  canDrag: function(props, monitor) {
    return props.canDrag;
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
  },
  canDrag: function(props, monitor) {
    return props.canDrag;
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
    items: React.PropTypes.object.isRequired,
    onItemsChange: React.PropTypes.func,
    renderWidget: React.PropTypes.func.isRequired,
    width: React.PropTypes.number.isRequired,
    standardWidth: React.PropTypes.number.isRequired,
    connectDropTarget: React.PropTypes.func.isRequired
  };

  function Container(props) {
    this.renderItem = bind(this.renderItem, this);
    this.handleWidgetDesignChange = bind(this.handleWidgetDesignChange, this);
    this.handleRemove = bind(this.handleRemove, this);
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

  Container.prototype.dropLayout = function(id, droppedRect, widget) {
    var droppedLayout, item, items, layouts;
    this.setState({
      moveHover: null,
      resizeHover: null
    });
    droppedLayout = this.props.layoutEngine.rectToLayout(droppedRect);
    items = _.clone(this.props.items);
    items[id] = {
      layout: droppedLayout,
      widget: widget
    };
    layouts = {};
    for (id in items) {
      item = items[id];
      layouts[id] = item.layout;
    }
    layouts = this.props.layoutEngine.performLayout(layouts, id);
    items = _.mapValues(items, (function(_this) {
      return function(item, id) {
        return _.extend({}, item, {
          layout: layouts[id]
        });
      };
    })(this));
    return this.props.onItemsChange(items);
  };

  Container.prototype.dropMoveLayout = function(dropInfo) {
    var droppedRect;
    droppedRect = {
      x: dropInfo.x,
      y: dropInfo.y,
      width: dropInfo.dragInfo.bounds.width,
      height: dropInfo.dragInfo.bounds.height
    };
    return this.dropLayout(dropInfo.dragInfo.id, droppedRect, dropInfo.dragInfo.widget);
  };

  Container.prototype.dropResizeLayout = function(dropInfo) {
    var droppedRect;
    droppedRect = {
      x: dropInfo.dragInfo.bounds.x,
      y: dropInfo.dragInfo.bounds.y,
      width: dropInfo.width,
      height: dropInfo.height
    };
    return this.dropLayout(dropInfo.dragInfo.id, droppedRect, dropInfo.dragInfo.widget);
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

  Container.prototype.handleRemove = function(id) {
    var items;
    items = _.omit(this.props.items, id);
    return this.props.onItemsChange(items);
  };

  Container.prototype.handleWidgetDesignChange = function(id, widgetDesign) {
    var item, items, widget;
    widget = this.props.items[id].widget;
    widget = _.extend({}, widget, {
      design: widgetDesign
    });
    item = this.props.items[id];
    item = _.extend({}, item, {
      widget: widget
    });
    items = _.clone(this.props.items);
    items[id] = item;
    return this.props.onItemsChange(items);
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

  Container.prototype.renderItem = function(id, item, layout, visible) {
    var bounds, dragInfo, elem, style;
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
      bounds: bounds,
      widget: item.widget
    };
    elem = this.props.renderWidget({
      id: id,
      type: item.widget.type,
      design: item.widget.design,
      onDesignChange: this.props.onItemsChange != null ? this.handleWidgetDesignChange.bind(null, id) : void 0,
      width: bounds.width - 10,
      height: bounds.height - 10,
      standardWidth: ((bounds.width - 10) / this.props.width) * this.props.standardWidth
    });
    if (this.props.onItemsChange) {
      elem = React.createElement(DecoratedBlockComponent, {
        onBlockRemove: this.handleRemove.bind(null, id)
      }, elem);
    } else {
      elem = H.div({
        className: "mwater-visualization-block-view"
      }, elem);
    }
    return H.div({
      style: style,
      key: id
    }, React.createElement(MoveResizeLayoutComponent, {
      dragInfo: dragInfo,
      canDrag: this.props.onItemsChange != null
    }, elem));
  };

  Container.prototype.calculateLayouts = function(props, state) {
    var hoveredDragInfo, hoveredLayout, hoveredRect, id, item, layouts, ref;
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
    layouts = {};
    ref = props.items;
    for (id in ref) {
      item = ref[id];
      layouts[id] = item.layout;
    }
    if (hoveredDragInfo) {
      layouts[hoveredDragInfo.id] = hoveredLayout;
    }
    layouts = props.layoutEngine.performLayout(layouts, hoveredDragInfo ? hoveredDragInfo.id : void 0);
    return layouts;
  };

  Container.prototype.renderItems = function(items) {
    var hover, i, id, ids, item, layouts, len, ref, ref1, renderElems;
    layouts = this.calculateLayouts(this.props, this.state);
    renderElems = [];
    hover = this.state.moveHover || this.state.resizeHover;
    ids = [];
    for (id in items) {
      ids.push(id);
    }
    if (hover && (ref = hover.dragInfo.id, indexOf.call(ids, ref) < 0)) {
      ids.push(hover.dragInfo.id);
    }
    ref1 = _.sortBy(ids);
    for (i = 0, len = ref1.length; i < len; i++) {
      id = ref1[i];
      item = items[id];
      if (!hover || id !== hover.dragInfo.id) {
        renderElems.push(this.renderItem(id, item, layouts[id]));
      } else {
        if (item) {
          renderElems.push(this.renderItem(id, item, layouts[id], false));
        }
        renderElems.push(this.renderPlaceholder(this.props.layoutEngine.getLayoutBounds(layouts[id])));
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
    var style;
    style = {
      width: this.props.width,
      height: "100%",
      position: "relative"
    };
    return this.props.connectDropTarget(H.div({
      style: style
    }, this.renderItems(this.props.items)));
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

module.exports = DropTarget(["block-move", "block-resize"], targetSpec, targetCollect)(Container);
