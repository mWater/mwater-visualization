// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let DecoratedBlockComponent;
import PropTypes from 'prop-types';
import React from 'react';
const R = React.createElement;

// Block decorated with drag/remove hover controls
// TODO make zero border
export default DecoratedBlockComponent = (function() {
  DecoratedBlockComponent = class DecoratedBlockComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        style: PropTypes.object,   // Style to add to outer div
        onBlockRemove: PropTypes.func.isRequired, // Called when block is removed
  
        connectMoveHandle: PropTypes.func,   // the move handle connector
        connectDragPreview: PropTypes.func,   // the drag preview connector
        connectResizeHandle: PropTypes.func, // Connects resize handle for dragging. Null to not render
  
        // Set to allow changing aspect ratio
        aspectRatio: PropTypes.number,
        onAspectRatioChange: PropTypes.func
      };
    }

    constructor(props) {
      super(props);

      this.state = {
        aspectDragY: null,   // y position of aspect ratio drag
        initialAspectDragY: null,   // Initial y position of aspect ratio drag
        initialClientY: null    // first y of mousemove (for calculating difference)
      };
    }

    componentWillUnmount() {
      // Remove listeners
      document.removeEventListener("mousemove", this.handleMouseMove);
      return document.removeEventListener("mouseup", this.handleMouseUp);
    }

    handleAspectMouseDown = ev => {
      // Prevent html5 drag
      ev.preventDefault();

      // Get height of overall block
      this.setState({aspectDragY: ev.currentTarget.parentElement.offsetHeight, initialAspectDragY: ev.currentTarget.parentElement.offsetHeight});

      document.addEventListener("mousemove", this.handleMouseMove);
      return document.addEventListener("mouseup", this.handleMouseUp);
    };

    handleMouseMove = ev => {
      if (this.state.initialClientY != null) {
        const aspectDragY = (this.state.initialAspectDragY + ev.clientY) - this.state.initialClientY;
        if (aspectDragY > 20) {
          return this.setState({aspectDragY});
        }
      } else {
        return this.setState({initialClientY: ev.clientY});
      }
    };

    handleMouseUp = ev => {
      // Remove listeners
      document.removeEventListener("mousemove", this.handleMouseMove);
      document.removeEventListener("mouseup", this.handleMouseUp);

      // Fire new aspect ratio
      this.props.onAspectRatioChange(this.props.aspectRatio / (this.state.aspectDragY / this.state.initialAspectDragY));
      return this.setState({aspectDragY: null, initialAspectDragY: null, initialClientY: null});
    };

    renderAspectDrag() {
      if (this.state.aspectDragY != null) {
        const lineStyle = { 
          position: "absolute",
          borderTop: "solid 3px #38D",
          top: this.state.aspectDragY,
          left: 0,
          right: 0
        };
        return R('div', {style: lineStyle, key: "aspectDrag"});
      } else {
        return null;
      }
    }

    render() {
      const elem = R('div', {className: "mwater-visualization-decorated-block", style: this.props.style},
        this.props.children,
    
        this.renderAspectDrag(),

        !this.props.isDragging && (this.props.connectMoveHandle != null) ?
          this.props.connectMoveHandle(R('div', {key: "move", className: "mwater-visualization-decorated-block-move"},
            R('i', {className: "fa fa-arrows"}))) : undefined,

        !this.props.isDragging && (this.props.onBlockRemove != null) ?
          R('div', {key: "remove", className: "mwater-visualization-decorated-block-remove", onClick: this.props.onBlockRemove},
            R('i', {className: "fa fa-times"})) : undefined,

        !this.props.isDragging && (this.props.onAspectRatioChange != null) ?
          // TODO sometimes drags (onDragStart) and so doesn't work. Disable dragging?
          R('div', {key: "aspect", className: "mwater-visualization-decorated-block-aspect", onMouseDown: this.handleAspectMouseDown},
            R('i', {className: "fa fa-arrows-v"})) : undefined,

        !this.props.isDragging && (this.props.connectResizeHandle != null) ?
          this.props.connectResizeHandle(R('div', {key: "resize", className: "mwater-visualization-decorated-block-resize"},
            R('i', {className: "fa fa-expand fa-rotate-90"}))) : undefined,

        (() => {
        if (this.props.connectDragPreview) {
          const preview = R('div', {style: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none"}}, " ");
          return this.props.connectDragPreview(preview);
        }
      })()
      );

      return elem;
    }
  };
  DecoratedBlockComponent.initClass();
  return DecoratedBlockComponent;
})();
