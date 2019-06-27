"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var DraggableBlockComponent,
    HorizontalBlockComponent,
    PropTypes,
    R,
    React,
    _,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

PropTypes = require('prop-types');
_ = require('lodash');
React = require('react');
R = React.createElement;
DraggableBlockComponent = require("./DraggableBlockComponent");

module.exports = HorizontalBlockComponent = function () {
  var HorizontalBlockComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2["default"])(HorizontalBlockComponent, _React$Component);

    function HorizontalBlockComponent(props) {
      var _this;

      (0, _classCallCheck2["default"])(this, HorizontalBlockComponent);
      _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(HorizontalBlockComponent).call(this, props));
      _this.handleMouseDown = _this.handleMouseDown.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleMouseMove = _this.handleMouseMove.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleMouseUp = _this.handleMouseUp.bind((0, _assertThisInitialized2["default"])(_this));
      _this.state = {
        dragIndex: null,
        // index of splitter being dragged
        dragInitialX: null,
        // Initial drag x
        dragXOffset: null,
        // Offset of drag (pixels dragged from start)
        leftSize: null,
        rightSize: null
      };
      _this.blockRefs = {};
      return _this;
    }

    (0, _createClass2["default"])(HorizontalBlockComponent, [{
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        // Remove listeners
        document.removeEventListener("mousemove", this.handleMouseMove);
        return document.removeEventListener("mouseup", this.handleMouseUp);
      }
    }, {
      key: "handleMouseDown",
      value: function handleMouseDown(index, ev) {
        boundMethodCheck(this, HorizontalBlockComponent); // Prevent html5 drag

        ev.preventDefault(); // Get sizes of two blocks

        this.setState({
          dragIndex: index,
          leftSize: this.blockRefs["block".concat(index)].offsetWidth,
          rightSize: this.blockRefs["block".concat(index + 1)].offsetWidth
        });
        document.addEventListener("mousemove", this.handleMouseMove);
        return document.addEventListener("mouseup", this.handleMouseUp);
      }
    }, {
      key: "handleMouseMove",
      value: function handleMouseMove(ev) {
        var dragXOffset;
        boundMethodCheck(this, HorizontalBlockComponent);

        if (!this.state.dragInitialX) {
          this.setState({
            dragInitialX: ev.clientX
          });
          return;
        }

        dragXOffset = ev.clientX - this.state.dragInitialX; // Can't make left block too small

        if (dragXOffset < -this.state.leftSize + 100) {
          dragXOffset = -this.state.leftSize + 100;
        } // Can't make right block too small


        if (dragXOffset > this.state.rightSize - 100) {
          dragXOffset = this.state.rightSize - 100;
        }

        return this.setState({
          dragXOffset: dragXOffset
        });
      }
    }, {
      key: "handleMouseUp",
      value: function handleMouseUp(ev) {
        var block, leftWeight, newLeftSize, newRightSize, rightWeight, weights;
        boundMethodCheck(this, HorizontalBlockComponent); // Remove listeners

        document.removeEventListener("mousemove", this.handleMouseMove);
        document.removeEventListener("mouseup", this.handleMouseUp); // Determine weights of two blocks

        weights = this.props.block.weights || [];
        newLeftSize = this.state.leftSize + this.state.dragXOffset;
        newRightSize = this.state.rightSize - this.state.dragXOffset; // Get current weights

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
      }
    }, {
      key: "render",
      value: function render() {
        var _this2 = this;

        var elem, i, index, j, percentages, ref, ref1, totalWeight, weight; // Calculate widths (percentages)

        totalWeight = 0;

        for (index = i = 0, ref = this.props.block.blocks.length; 0 <= ref ? i < ref : i > ref; index = 0 <= ref ? ++i : --i) {
          weight = (this.props.block.weights || [])[index] || 1;
          totalWeight += (this.props.block.weights || [])[index] || 1;
        }

        percentages = [];

        for (index = j = 0, ref1 = this.props.block.blocks.length; 0 <= ref1 ? j < ref1 : j > ref1; index = 0 <= ref1 ? ++j : --j) {
          weight = (this.props.block.weights || [])[index] || 1;
          percentages[index] = weight * 100 / totalWeight;
        }

        if (this.props.onBlockUpdate != null) {
          elem = R('table', {
            style: {
              width: "100%",
              tableLayout: "fixed",
              position: "relative",
              paddingTop: 5
            },
            className: "mwater-visualization-horizontal-block" // Add padding to allow dropping

          }, R('tbody', null, R('tr', null, _.map(this.props.block.blocks, function (block, index) {
            return [index > 0 && _this2.props.onBlockUpdate != null ? R('td', {
              style: {
                width: 5,
                position: "relative",
                left: _this2.state.dragXOffset
              },
              key: "splitter".concat(index),
              className: "mwater-visualization-horizontal-block-splitter ".concat(index - 1 === _this2.state.dragIndex ? "active" : ""),
              onMouseDown: _this2.handleMouseDown.bind(null, index - 1)
            }) : void 0, R('td', {
              style: {
                width: "".concat(percentages[index], "%"),
                verticalAlign: "top"
              },
              key: block.id,
              ref: function ref(c) {
                return _this2.blockRefs["block".concat(index)] = c;
              }
            }, _this2.props.renderBlock(block))];
          })))); // Allow dropping

          elem = R(DraggableBlockComponent, {
            block: this.props.block,
            onBlockDrop: this.props.onBlockDrop
          }, elem);
          return elem; // Simplify in this case for printing
        } else {
          return R('div', {
            className: "mwater-visualization-horizontal-block"
          }, _.map(this.props.block.blocks, function (block, index) {
            return [R('div', {
              style: {
                width: "".concat(percentages[index], "%"),
                verticalAlign: "top",
                display: "inline-block"
              },
              key: block.id,
              ref: "block".concat(index),
              className: "mwater-visualization-horizontal-block-item"
            }, _this2.props.renderBlock(block))];
          }));
        }
      }
    }]);
    return HorizontalBlockComponent;
  }(React.Component);

  ;
  HorizontalBlockComponent.propTypes = {
    block: PropTypes.object.isRequired,
    renderBlock: PropTypes.func.isRequired,
    onBlockDrop: PropTypes.func,
    // Called with (sourceBlock, targetBlock, side) when block is dropped on it. side is top, left, bottom, right
    onBlockRemove: PropTypes.func,
    // Called with (block) when block is removed
    onBlockUpdate: PropTypes.func // Called with (block) when block is updated

  };
  return HorizontalBlockComponent;
}.call(void 0); // handleAspectMouseDown: (ev) =>
//   # Get height of overall block
//   @setState(aspectDragY: ev.currentTarget.parentElement.offsetHeight, initialAspectDragY: ev.currentTarget.parentElement.offsetHeight)
//   document.addEventListener("mousemove", @handleMouseMove)
//   document.addEventListener("mouseup", @handleMouseUp)
// handleMouseMove: (ev) =>
//   if @state.initialClientY?
//     aspectDragY = @state.initialAspectDragY + ev.clientY - @state.initialClientY
//     if aspectDragY > 20
//       @setState(aspectDragY: aspectDragY)
//   else
//     @setState(initialClientY: ev.clientY)
// handleMouseUp: (ev) =>
//   # Remove listeners
//   document.removeEventListener("mousemove", @handleMouseMove)
//   document.removeEventListener("mouseup", @handleMouseUp)
//   # Fire new aspect ratio
//   @props.onAspectRatioChange(@props.aspectRatio / (@state.aspectDragY / @state.initialAspectDragY))
//   @setState(aspectDragY: null, initialAspectDragY: null, initialClientY: null)
// renderAspectDrag: ->
//   if @state.aspectDragY?
//     lineStyle = { 
//       position: "absolute"
//       borderTop: "solid 3px #38D"
//       top: @state.aspectDragY
//       left: 0
//       right: 0
//     }
//     return R 'div', style: lineStyle, key: "aspectDrag"
//   else
//     return null
// render: ->
//   elem = R 'div', className: "mwater-visualization-decorated-block", style: @props.style,
//     @props.children
//     @renderAspectDrag()
//     if not @props.isDragging and @props.connectMoveHandle?
//       @props.connectMoveHandle(R 'div', key: "move", className: "mwater-visualization-decorated-block-move",
//         R 'i', className: "fa fa-arrows")
//     if not @props.isDragging and @props.onBlockRemove?
//       R 'div', key: "remove", className: "mwater-visualization-decorated-block-remove", onClick: @props.onBlockRemove,
//         R 'i', className: "fa fa-times"
//     if not @props.isDragging and @props.onAspectRatioChange?
//       # TODO sometimes drags (onDragStart) and so doesn't work. Disable dragging?
//       R 'div', key: "aspect", className: "mwater-visualization-decorated-block-aspect", onMouseDown: @handleAspectMouseDown,
//         R 'i', className: "fa fa-arrows-v"
//     if not @props.isDragging and @props.connectResizeHandle?
//       @props.connectResizeHandle(R 'div', key: "resize", className: "mwater-visualization-decorated-block-resize",
//         R 'i', className: "fa fa-expand fa-rotate-90")
//   if @props.connectDragPreview
//     elem = @props.connectDragPreview(elem)
//   return elem