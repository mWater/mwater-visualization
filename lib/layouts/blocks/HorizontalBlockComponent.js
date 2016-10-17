var DraggableBlockComponent, H, HorizontalBlockComponent, R, React, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

DraggableBlockComponent = require("./DraggableBlockComponent");

module.exports = HorizontalBlockComponent = (function(superClass) {
  extend(HorizontalBlockComponent, superClass);

  HorizontalBlockComponent.propTypes = {
    block: React.PropTypes.object.isRequired,
    renderBlock: React.PropTypes.func.isRequired,
    onBlockDrop: React.PropTypes.func,
    onBlockRemove: React.PropTypes.func,
    onBlockUpdate: React.PropTypes.func
  };

  function HorizontalBlockComponent() {
    this.handleMouseUp = bind(this.handleMouseUp, this);
    this.handleMouseMove = bind(this.handleMouseMove, this);
    this.handleMouseDown = bind(this.handleMouseDown, this);
    HorizontalBlockComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      dragIndex: null,
      dragInitialX: null,
      dragXOffset: null,
      leftSize: null,
      rightSize: null
    };
  }

  HorizontalBlockComponent.prototype.componentWillUnmount = function() {
    document.removeEventListener("mousemove", this.handleMouseMove);
    return document.removeEventListener("mouseup", this.handleMouseUp);
  };

  HorizontalBlockComponent.prototype.handleMouseDown = function(index, ev) {
    ev.preventDefault();
    this.setState({
      dragIndex: index,
      leftSize: this.refs["block" + index].offsetWidth,
      rightSize: this.refs["block" + (index + 1)].offsetWidth
    });
    document.addEventListener("mousemove", this.handleMouseMove);
    return document.addEventListener("mouseup", this.handleMouseUp);
  };

  HorizontalBlockComponent.prototype.handleMouseMove = function(ev) {
    var dragXOffset;
    if (!this.state.dragInitialX) {
      this.setState({
        dragInitialX: ev.clientX
      });
      return;
    }
    dragXOffset = ev.clientX - this.state.dragInitialX;
    if (dragXOffset < -this.state.leftSize + 100) {
      dragXOffset = -this.state.leftSize + 100;
    }
    if (dragXOffset > this.state.rightSize - 100) {
      dragXOffset = this.state.rightSize - 100;
    }
    return this.setState({
      dragXOffset: dragXOffset
    });
  };

  HorizontalBlockComponent.prototype.handleMouseUp = function(ev) {
    var block, leftWeight, newLeftSize, newRightSize, rightWeight, weights;
    document.removeEventListener("mousemove", this.handleMouseMove);
    document.removeEventListener("mouseup", this.handleMouseUp);
    weights = this.props.block.weights || [];
    newLeftSize = this.state.leftSize + this.state.dragXOffset;
    newRightSize = this.state.rightSize - this.state.dragXOffset;
    leftWeight = weights[this.state.dragIndex] || 1;
    rightWeight = weights[this.state.dragIndex + 1] || 1;
    weights[this.state.dragIndex] = (leftWeight + rightWeight) * newLeftSize / (newLeftSize + newRightSize);
    weights[this.state.dragIndex + 1] = (leftWeight + rightWeight) * newRightSize / (newLeftSize + newRightSize);
    block = _.extend({}, this.props.block, {
      weights: weights
    });
    this.props.onBlockUpdate(block);
    return this.setState({
      dragIndex: null,
      dragInitialX: null,
      dragXOffset: null
    });
  };

  HorizontalBlockComponent.prototype.render = function() {
    var elem, i, index, j, percentages, ref, ref1, totalWeight, weight;
    totalWeight = 0;
    for (index = i = 0, ref = this.props.block.blocks.length; 0 <= ref ? i < ref : i > ref; index = 0 <= ref ? ++i : --i) {
      weight = (this.props.block.weights || [])[index] || 1;
      totalWeight += (this.props.block.weights || [])[index] || 1;
    }
    percentages = [];
    for (index = j = 0, ref1 = this.props.block.blocks.length; 0 <= ref1 ? j < ref1 : j > ref1; index = 0 <= ref1 ? ++j : --j) {
      weight = (this.props.block.weights || [])[index] || 1;
      percentages[index] = (weight * 100) / totalWeight;
    }
    if (this.props.onBlockUpdate != null) {
      elem = H.table({
        style: {
          width: "100%",
          tableLayout: "fixed",
          position: "relative",
          paddingTop: 5
        },
        className: "mwater-visualization-horizontal-block"
      }, H.tbody(null, H.tr(null, _.map(this.props.block.blocks, (function(_this) {
        return function(block, index) {
          return [
            index > 0 && (_this.props.onBlockUpdate != null) ? H.td({
              style: {
                width: 5,
                position: "relative",
                left: _this.state.dragXOffset
              },
              key: "splitter" + index,
              className: "mwater-visualization-horizontal-block-splitter " + (index - 1 === _this.state.dragIndex ? "active" : ""),
              onMouseDown: _this.handleMouseDown.bind(null, index - 1)
            }) : void 0, H.td({
              style: {
                width: percentages[index] + "%",
                verticalAlign: "top"
              },
              key: block.id,
              ref: "block" + index
            }, _this.props.renderBlock(block))
          ];
        };
      })(this)))));
      elem = R(DraggableBlockComponent, {
        block: this.props.block,
        onBlockDrop: this.props.onBlockDrop
      }, elem);
      return elem;
    } else {
      return H.div({
        className: "mwater-visualization-horizontal-block"
      }, _.map(this.props.block.blocks, (function(_this) {
        return function(block, index) {
          return [
            H.div({
              style: {
                width: percentages[index] + "%",
                verticalAlign: "top",
                display: "inline-block"
              },
              key: block.id,
              ref: "block" + index,
              className: "mwater-visualization-horizontal-block-item"
            }, _this.props.renderBlock(block))
          ];
        };
      })(this)));
    }
  };

  return HorizontalBlockComponent;

})(React.Component);
