"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var DragSource, DraggableBlockComponent, DropTarget, PropTypes, R, React, ReactDOM, _, blockSourceSpec, blockTargetSpec, collectSource, collectTarget, getDropSide;

_ = require('lodash');
PropTypes = require('prop-types');
React = require('react');
ReactDOM = require('react-dom');
R = React.createElement;
DragSource = require('react-dnd').DragSource;
DropTarget = require('react-dnd').DropTarget;

DraggableBlockComponent = function () {
  // Block which can be dragged around in block layout.
  var DraggableBlockComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2.default)(DraggableBlockComponent, _React$Component);

    function DraggableBlockComponent(props) {
      var _this;

      (0, _classCallCheck2.default)(this, DraggableBlockComponent);
      _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(DraggableBlockComponent).call(this, props));
      _this.state = {
        hoverSide: null
      };
      return _this;
    }

    (0, _createClass2.default)(DraggableBlockComponent, [{
      key: "renderHover",
      value: function renderHover() {
        var lineStyle;
        lineStyle = {
          position: "absolute"
        }; // Show

        if (this.props.isOver) {
          // style.backgroundColor = "#DDF"
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

          return R('div', {
            style: lineStyle
          });
        } else {
          return null;
        }
      }
    }, {
      key: "render",
      value: function render() {
        var style;
        style = {}; // Hide if dragging

        if (this.props.isDragging) {
          style.visibility = "hidden";
        }

        return this.props.connectDropTarget(R('div', {
          style: this.props.style
        }, R('div', {
          style: {
            position: "relative"
          }
        }, this.renderHover(), React.cloneElement(React.Children.only(this.props.children), {
          connectMoveHandle: this.props.connectDragSource,
          connectDragPreview: this.props.connectDragPreview
        }))));
      }
    }]);
    return DraggableBlockComponent;
  }(React.Component);

  ;
  DraggableBlockComponent.propTypes = {
    block: PropTypes.object.isRequired,
    // Block to display
    onBlockDrop: PropTypes.func.isRequired,
    // Called with (sourceBlock, targetBlock, side) when block is dropped on it. side is top, left, bottom, right
    style: PropTypes.object,
    // Merge in style
    onlyBottom: PropTypes.bool,
    // True to only allow dropping at bottom (root block)
    // Injected by React-dnd
    isDragging: PropTypes.bool.isRequired,
    // internally used for tracking if an item is being dragged
    isOver: PropTypes.bool.isRequired,
    // internally used to check if an item is over the current component
    connectDragSource: PropTypes.func.isRequired,
    // the drag source connector, supplied by React DND
    connectDropTarget: PropTypes.func.isRequired,
    // the drop target connector, supplied by React DND
    connectDragPreview: PropTypes.func.isRequired // the drag preview connector, supplied by React DND

  };
  return DraggableBlockComponent;
}.call(void 0); // Gets the drop side (top, left, right, bottom)


getDropSide = function getDropSide(monitor, component) {
  var blockComponent, clientOffset, fractionX, fractionY, hoverBoundingRect, hoverClientX, hoverClientY, pos; // Get underlying component

  blockComponent = component.getDecoratedComponentInstance(); // Get bounds of component

  hoverBoundingRect = ReactDOM.findDOMNode(blockComponent).getBoundingClientRect();
  clientOffset = monitor.getClientOffset(); // Get position within hovered item

  hoverClientX = clientOffset.x - hoverBoundingRect.left;
  hoverClientY = clientOffset.y - hoverBoundingRect.top; // Determine if over is more left, right, top or bottom

  fractionX = hoverClientX / (hoverBoundingRect.right - hoverBoundingRect.left);
  fractionY = hoverClientY / (hoverBoundingRect.bottom - hoverBoundingRect.top);

  if (fractionX > fractionY) {
    // top or right
    if (1 - fractionX > fractionY) {
      // top or left
      pos = "top";
    } else {
      pos = "right"; // bottom or left
    }
  } else {
    if (1 - fractionX > fractionY) {
      // top or left
      pos = "left";
    } else {
      pos = "bottom";
    }
  }

  return pos;
};

blockTargetSpec = {
  // Called when an block hovers over this component
  hover: function hover(props, monitor, component) {
    var hoveringId, myId, side; // Hovering over self does nothing

    hoveringId = monitor.getItem().block.id;
    myId = props.block.id;

    if (hoveringId === myId) {
      return;
    }

    if (props.onlyBottom) {
      side = "bottom";
    } else {
      side = getDropSide(monitor, component);
    } // Set the state


    return component.getDecoratedComponentInstance().setState({
      hoverSide: side
    });
  },
  canDrop: function canDrop(props, monitor) {
    var hoveringId, myId;
    hoveringId = monitor.getItem().block.id;
    myId = props.block.id;

    if (hoveringId === myId) {
      return false;
    }

    return true;
  },
  drop: function drop(props, monitor, component) {
    var side;

    if (monitor.didDrop()) {
      return;
    }

    side = component.getDecoratedComponentInstance().state.hoverSide;
    props.onBlockDrop(monitor.getItem().block, props.block, side);
  }
};
blockSourceSpec = {
  beginDrag: function beginDrag(props, monitor, component) {
    return {
      block: props.block
    };
  },
  isDragging: function isDragging(props, monitor) {
    return props.block.id === monitor.getItem().block.id;
  }
};

collectTarget = function collectTarget(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver({
      shallow: true
    }),
    canDrop: monitor.canDrop()
  };
};

collectSource = function collectSource(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging()
  };
};

module.exports = _.flow(DragSource("block", blockSourceSpec, collectSource), DropTarget("block", blockTargetSpec, collectTarget))(DraggableBlockComponent);