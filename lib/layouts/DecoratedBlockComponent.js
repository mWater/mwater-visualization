var DecoratedBlockComponent, H, R, React,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

R = React.createElement;

module.exports = DecoratedBlockComponent = (function(superClass) {
  extend(DecoratedBlockComponent, superClass);

  DecoratedBlockComponent.propTypes = {
    style: React.PropTypes.object,
    onBlockRemove: React.PropTypes.func.isRequired,
    connectMoveHandle: React.PropTypes.func,
    connectDragPreview: React.PropTypes.func,
    connectResizeHandle: React.PropTypes.func,
    aspectRatio: React.PropTypes.number,
    onAspectRatioChange: React.PropTypes.func
  };

  function DecoratedBlockComponent() {
    this.handleMouseUp = bind(this.handleMouseUp, this);
    this.handleMouseMove = bind(this.handleMouseMove, this);
    this.handleAspectMouseDown = bind(this.handleAspectMouseDown, this);
    DecoratedBlockComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      aspectDragY: null,
      initialAspectDragY: null,
      initialClientY: null
    };
  }

  DecoratedBlockComponent.prototype.componentWillUnmount = function() {
    document.removeEventListener("mousemove", this.handleMouseMove);
    return document.removeEventListener("mouseup", this.handleMouseUp);
  };

  DecoratedBlockComponent.prototype.handleAspectMouseDown = function(ev) {
    this.setState({
      aspectDragY: ev.currentTarget.parentElement.offsetHeight,
      initialAspectDragY: ev.currentTarget.parentElement.offsetHeight
    });
    document.addEventListener("mousemove", this.handleMouseMove);
    return document.addEventListener("mouseup", this.handleMouseUp);
  };

  DecoratedBlockComponent.prototype.handleMouseMove = function(ev) {
    var aspectDragY;
    if (this.state.initialClientY != null) {
      aspectDragY = this.state.initialAspectDragY + ev.clientY - this.state.initialClientY;
      if (aspectDragY > 20) {
        return this.setState({
          aspectDragY: aspectDragY
        });
      }
    } else {
      return this.setState({
        initialClientY: ev.clientY
      });
    }
  };

  DecoratedBlockComponent.prototype.handleMouseUp = function(ev) {
    document.removeEventListener("mousemove", this.handleMouseMove);
    document.removeEventListener("mouseup", this.handleMouseUp);
    this.props.onAspectRatioChange(this.props.aspectRatio / (this.state.aspectDragY / this.state.initialAspectDragY));
    return this.setState({
      aspectDragY: null,
      initialAspectDragY: null,
      initialClientY: null
    });
  };

  DecoratedBlockComponent.prototype.renderAspectDrag = function() {
    var lineStyle;
    if (this.state.aspectDragY != null) {
      lineStyle = {
        position: "absolute",
        borderTop: "solid 3px #38D",
        top: this.state.aspectDragY,
        left: 0,
        right: 0
      };
      return H.div({
        style: lineStyle,
        key: "aspectDrag"
      });
    } else {
      return null;
    }
  };

  DecoratedBlockComponent.prototype.render = function() {
    var elem;
    elem = H.div({
      className: "mwater-visualization-block",
      style: this.props.style
    }, this.props.children, this.renderAspectDrag(), !this.props.isDragging && (this.props.connectMoveHandle != null) ? this.props.connectMoveHandle(H.div({
      key: "move",
      className: "mwater-visualization-block-move"
    }, H.i({
      className: "fa fa-arrows"
    }))) : void 0, !this.props.isDragging && (this.props.onBlockRemove != null) ? H.div({
      key: "remove",
      className: "mwater-visualization-block-remove",
      onClick: this.props.onBlockRemove
    }, H.i({
      className: "fa fa-times"
    })) : void 0, !this.props.isDragging && (this.props.onAspectRatioChange != null) ? H.div({
      key: "aspect",
      className: "mwater-visualization-block-aspect",
      onMouseDown: this.handleAspectMouseDown
    }, H.i({
      className: "fa fa-arrows-v"
    })) : void 0, !this.props.isDragging && (this.props.connectResizeHandle != null) ? this.props.connectResizeHandle(H.div({
      key: "resize",
      className: "mwater-visualization-block-resize"
    }, H.i({
      className: "fa fa-expand fa-rotate-90"
    }))) : void 0);
    if (this.props.connectDragPreview) {
      elem = this.props.connectDragPreview(elem);
    }
    return elem;
  };

  return DecoratedBlockComponent;

})(React.Component);
