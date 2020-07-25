"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var DecoratedBlockComponent,
    PropTypes,
    R,
    React,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

PropTypes = require('prop-types');
React = require('react');
R = React.createElement; // Block decorated with drag/remove hover controls
// TODO make zero border

module.exports = DecoratedBlockComponent = function () {
  var DecoratedBlockComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(DecoratedBlockComponent, _React$Component);

    var _super = _createSuper(DecoratedBlockComponent);

    function DecoratedBlockComponent(props) {
      var _this;

      (0, _classCallCheck2["default"])(this, DecoratedBlockComponent);
      _this = _super.call(this, props);
      _this.handleAspectMouseDown = _this.handleAspectMouseDown.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleMouseMove = _this.handleMouseMove.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleMouseUp = _this.handleMouseUp.bind((0, _assertThisInitialized2["default"])(_this));
      _this.state = {
        aspectDragY: null,
        // y position of aspect ratio drag
        initialAspectDragY: null,
        // Initial y position of aspect ratio drag
        initialClientY: null // first y of mousemove (for calculating difference)

      };
      return _this;
    }

    (0, _createClass2["default"])(DecoratedBlockComponent, [{
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        // Remove listeners
        document.removeEventListener("mousemove", this.handleMouseMove);
        return document.removeEventListener("mouseup", this.handleMouseUp);
      }
    }, {
      key: "handleAspectMouseDown",
      value: function handleAspectMouseDown(ev) {
        boundMethodCheck(this, DecoratedBlockComponent); // Prevent html5 drag

        ev.preventDefault(); // Get height of overall block

        this.setState({
          aspectDragY: ev.currentTarget.parentElement.offsetHeight,
          initialAspectDragY: ev.currentTarget.parentElement.offsetHeight
        });
        document.addEventListener("mousemove", this.handleMouseMove);
        return document.addEventListener("mouseup", this.handleMouseUp);
      }
    }, {
      key: "handleMouseMove",
      value: function handleMouseMove(ev) {
        var aspectDragY;
        boundMethodCheck(this, DecoratedBlockComponent);

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
      }
    }, {
      key: "handleMouseUp",
      value: function handleMouseUp(ev) {
        boundMethodCheck(this, DecoratedBlockComponent); // Remove listeners

        document.removeEventListener("mousemove", this.handleMouseMove);
        document.removeEventListener("mouseup", this.handleMouseUp); // Fire new aspect ratio

        this.props.onAspectRatioChange(this.props.aspectRatio / (this.state.aspectDragY / this.state.initialAspectDragY));
        return this.setState({
          aspectDragY: null,
          initialAspectDragY: null,
          initialClientY: null
        });
      }
    }, {
      key: "renderAspectDrag",
      value: function renderAspectDrag() {
        var lineStyle;

        if (this.state.aspectDragY != null) {
          lineStyle = {
            position: "absolute",
            borderTop: "solid 3px #38D",
            top: this.state.aspectDragY,
            left: 0,
            right: 0
          };
          return R('div', {
            style: lineStyle,
            key: "aspectDrag"
          });
        } else {
          return null;
        }
      }
    }, {
      key: "render",
      value: function render() {
        var elem, preview;
        elem = R('div', {
          className: "mwater-visualization-decorated-block",
          style: this.props.style
        }, this.props.children, this.renderAspectDrag(), !this.props.isDragging && this.props.connectMoveHandle != null ? this.props.connectMoveHandle(R('div', {
          key: "move",
          className: "mwater-visualization-decorated-block-move"
        }, R('i', {
          className: "fa fa-arrows"
        }))) : void 0, !this.props.isDragging && this.props.onBlockRemove != null ? R('div', {
          key: "remove",
          className: "mwater-visualization-decorated-block-remove",
          onClick: this.props.onBlockRemove
        }, R('i', {
          className: "fa fa-times" // TODO sometimes drags (onDragStart) and so doesn't work. Disable dragging?

        })) : void 0, !this.props.isDragging && this.props.onAspectRatioChange != null ? R('div', {
          key: "aspect",
          className: "mwater-visualization-decorated-block-aspect",
          onMouseDown: this.handleAspectMouseDown
        }, R('i', {
          className: "fa fa-arrows-v"
        })) : void 0, !this.props.isDragging && this.props.connectResizeHandle != null ? this.props.connectResizeHandle(R('div', {
          key: "resize",
          className: "mwater-visualization-decorated-block-resize"
        }, R('i', {
          className: "fa fa-expand fa-rotate-90"
        }))) : void 0, this.props.connectDragPreview ? (preview = R('div', {
          style: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: "none"
          }
        }, " "), this.props.connectDragPreview(preview)) : void 0);
        return elem;
      }
    }]);
    return DecoratedBlockComponent;
  }(React.Component);

  ;
  DecoratedBlockComponent.propTypes = {
    style: PropTypes.object,
    // Style to add to outer div
    onBlockRemove: PropTypes.func.isRequired,
    // Called when block is removed
    connectMoveHandle: PropTypes.func,
    // the move handle connector
    connectDragPreview: PropTypes.func,
    // the drag preview connector
    connectResizeHandle: PropTypes.func,
    // Connects resize handle for dragging. Null to not render
    // Set to allow changing aspect ratio
    aspectRatio: PropTypes.number,
    onAspectRatioChange: PropTypes.func
  };
  return DecoratedBlockComponent;
}.call(void 0);