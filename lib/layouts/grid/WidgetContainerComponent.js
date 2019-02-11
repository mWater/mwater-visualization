"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var Container,
    DecoratedBlockComponent,
    DragSource,
    DropTarget,
    LayoutComponent,
    MoveLayoutComponent,
    MoveResizeLayoutComponent,
    PropTypes,
    R,
    React,
    ReactDOM,
    _,
    moveCollect,
    moveSpec,
    resizeCollect,
    resizeSpec,
    targetCollect,
    targetSpec,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
},
    indexOf = [].indexOf;

PropTypes = require('prop-types');
React = require('react');
ReactDOM = require('react-dom');
_ = require('lodash');
R = React.createElement;
DragSource = require('react-dnd').DragSource;
DropTarget = require('react-dnd').DropTarget;
DecoratedBlockComponent = require('../DecoratedBlockComponent');

LayoutComponent = function () {
  // Render a child element as draggable, resizable block, injecting handle connectors
  // to child element
  var LayoutComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2.default)(LayoutComponent, _React$Component);

    function LayoutComponent() {
      (0, _classCallCheck2.default)(this, LayoutComponent);
      return (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(LayoutComponent).apply(this, arguments));
    }

    (0, _createClass2.default)(LayoutComponent, [{
      key: "render",
      value: function render() {
        if (this.props.canDrag) {
          return React.cloneElement(React.Children.only(this.props.children), {
            connectMoveHandle: this.props.connectMoveHandle,
            connectResizeHandle: this.props.connectResizeHandle
          });
        } else {
          return this.props.children;
        }
      }
    }]);
    return LayoutComponent;
  }(React.Component);

  ;
  LayoutComponent.propTypes = {
    dragInfo: PropTypes.object.isRequired,
    // Opaque information to be used when a block is dragged
    canDrag: PropTypes.bool.isRequired // True if draggable

  };
  return LayoutComponent;
}.call(void 0);

moveSpec = {
  beginDrag: function beginDrag(props, monitor, component) {
    return props.dragInfo;
  },
  canDrag: function canDrag(props, monitor) {
    return props.canDrag;
  }
};

moveCollect = function moveCollect(connect, monitor) {
  return {
    connectMoveHandle: connect.dragSource()
  };
};

MoveLayoutComponent = DragSource("block-move", moveSpec, moveCollect)(LayoutComponent);
resizeSpec = {
  beginDrag: function beginDrag(props, monitor, component) {
    return props.dragInfo;
  },
  canDrag: function canDrag(props, monitor) {
    return props.canDrag;
  }
};

resizeCollect = function resizeCollect(connect, monitor) {
  return {
    connectResizeHandle: connect.dragSource()
  };
};

MoveResizeLayoutComponent = DragSource("block-resize", resizeSpec, resizeCollect)(MoveLayoutComponent);

Container = function () {
  // Container contains layouts to layout. It renders widgets at the correct location.
  var Container =
  /*#__PURE__*/
  function (_React$Component2) {
    (0, _inherits2.default)(Container, _React$Component2);

    function Container(props) {
      var _this;

      (0, _classCallCheck2.default)(this, Container);
      _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(Container).call(this, props));
      _this.handleRemove = _this.handleRemove.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleWidgetDesignChange = _this.handleWidgetDesignChange.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this))); // Render a particular layout. Allow visible to be false so that 
      // dragged elements can retain state

      _this.renderItem = _this.renderItem.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.state = {
        moveHover: null,
        resizeHover: null
      };
      return _this;
    }

    (0, _createClass2.default)(Container, [{
      key: "setMoveHover",
      value: function setMoveHover(hoverInfo) {
        return this.setState({
          moveHover: hoverInfo
        });
      }
    }, {
      key: "setResizeHover",
      value: function setResizeHover(hoverInfo) {
        return this.setState({
          resizeHover: hoverInfo
        });
      }
    }, {
      key: "dropLayout",
      value: function dropLayout(id, droppedRect, widget) {
        var droppedLayout, item, items, layouts; // Stop hover

        this.setState({
          moveHover: null,
          resizeHover: null
        }); // Convert rect to layout

        droppedLayout = this.props.layoutEngine.rectToLayout(droppedRect); // Insert dropped layout

        items = _.clone(this.props.items);
        items[id] = {
          layout: droppedLayout,
          widget: widget
        };
        layouts = {};

        for (id in items) {
          item = items[id];
          layouts[id] = item.layout;
        } // Perform layout


        layouts = this.props.layoutEngine.performLayout(layouts, id); // Update item layouts

        items = _.mapValues(items, function (item, id) {
          return _.extend({}, item, {
            layout: layouts[id]
          });
        });
        return this.props.onItemsChange(items);
      } // Called when a block is dropped

    }, {
      key: "dropMoveLayout",
      value: function dropMoveLayout(dropInfo) {
        var droppedRect; // Get rectangle of dropped block

        droppedRect = {
          x: dropInfo.x,
          y: dropInfo.y,
          width: dropInfo.dragInfo.bounds.width,
          // width and height are from drop info
          height: dropInfo.dragInfo.bounds.height
        };
        return this.dropLayout(dropInfo.dragInfo.id, droppedRect, dropInfo.dragInfo.widget);
      }
    }, {
      key: "dropResizeLayout",
      value: function dropResizeLayout(dropInfo) {
        var droppedRect; // Get rectangle of hovered block

        droppedRect = {
          x: dropInfo.dragInfo.bounds.x,
          y: dropInfo.dragInfo.bounds.y,
          width: dropInfo.width,
          height: dropInfo.height
        };
        return this.dropLayout(dropInfo.dragInfo.id, droppedRect, dropInfo.dragInfo.widget);
      }
    }, {
      key: "componentWillReceiveProps",
      value: function componentWillReceiveProps(nextProps) {
        var _this2 = this;

        // Reset hover if not over
        if (!nextProps.isOver && (this.state.moveHover || this.state.resizeHover)) {
          // Defer to prevent "Cannot dispatch in the middle of a dispatch." error
          return _.defer(function () {
            return _this2.setState({
              moveHover: null,
              resizeHover: null
            });
          });
        }
      }
    }, {
      key: "handleRemove",
      value: function handleRemove(id) {
        var items;
        boundMethodCheck(this, Container); // Update item layouts

        items = _.omit(this.props.items, id);
        return this.props.onItemsChange(items);
      }
    }, {
      key: "handleWidgetDesignChange",
      value: function handleWidgetDesignChange(id, widgetDesign) {
        var item, items, widget;
        boundMethodCheck(this, Container);
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
      }
    }, {
      key: "renderPlaceholder",
      value: function renderPlaceholder(bounds) {
        return R('div', {
          key: "placeholder",
          style: (0, _defineProperty2.default)({
            position: "absolute",
            left: bounds.x,
            top: bounds.y,
            width: bounds.width,
            height: bounds.height,
            border: "dashed 3px #AAA",
            borderRadius: 5,
            padding: 5
          }, "position", "absolute")
        });
      }
    }, {
      key: "renderItem",
      value: function renderItem(id, item, layout) {
        var visible = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
        var bounds, dragInfo, elem, style;
        boundMethodCheck(this, Container); // Calculate bounds

        bounds = this.props.layoutEngine.getLayoutBounds(layout); // Position absolutely

        style = {
          position: "absolute",
          left: bounds.x,
          top: bounds.y
        };

        if (!visible) {
          style.display = "none";
        } // Create dragInfo which is all the info needed to drop the layout


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
          standardWidth: (bounds.width - 10) / this.props.width * this.props.standardWidth
        }); // Render decorated if editable

        if (this.props.onItemsChange) {
          elem = React.createElement(DecoratedBlockComponent, {
            // style: { width: bounds.width, height: bounds.height }
            onBlockRemove: this.handleRemove.bind(null, id)
          }, elem);
        } else {
          elem = R('div', {
            className: "mwater-visualization-block-view" // style: { width: bounds.width, height: bounds.height },

          }, elem);
        } // Clone element, injecting width, height, standardWidth and enclosing in a dnd block


        return R('div', {
          style: style,
          key: id
        }, React.createElement(MoveResizeLayoutComponent, {
          dragInfo: dragInfo,
          canDrag: this.props.onItemsChange != null
        }, elem));
      } // Calculate a lookup of layouts incorporating hover info

    }, {
      key: "calculateLayouts",
      value: function calculateLayouts(props, state) {
        var hoveredDragInfo, hoveredLayout, hoveredRect, id, item, layouts, ref; // Get hovered block if present

        hoveredDragInfo = null;
        hoveredLayout = null; // Layout of hovered block

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
        } // Add hovered layout


        if (hoveredDragInfo) {
          layouts[hoveredDragInfo.id] = hoveredLayout;
        } // Perform layout


        layouts = props.layoutEngine.performLayout(layouts, hoveredDragInfo ? hoveredDragInfo.id : void 0);
        return layouts;
      }
    }, {
      key: "renderItems",
      value: function renderItems(items) {
        var hover, i, id, ids, item, layouts, len, ref, ref1, renderElems;
        layouts = this.calculateLayouts(this.props, this.state);
        renderElems = [];
        hover = this.state.moveHover || this.state.resizeHover; // Render blocks in their adjusted position

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
            // Render it anyway so that its state is retained
            if (item) {
              renderElems.push(this.renderItem(id, item, layouts[id], false));
            }

            renderElems.push(this.renderPlaceholder(this.props.layoutEngine.getLayoutBounds(layouts[id])));
          }
        }

        return renderElems;
      } // This gets called 100s of times when dragging

    }, {
      key: "shouldComponentUpdate",
      value: function shouldComponentUpdate(nextProps, nextState) {
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
      }
    }, {
      key: "render",
      value: function render() {
        var style; // Determine height using layout engine

        style = {
          width: this.props.width,
          height: "100%",
          // @props.layoutEngine.calculateHeight(layouts)
          position: "relative"
        }; // Connect as a drop target

        return this.props.connectDropTarget(R('div', {
          style: style
        }, this.renderItems(this.props.items)));
      }
    }]);
    return Container;
  }(React.Component);

  ;
  Container.propTypes = {
    layoutEngine: PropTypes.object.isRequired,
    items: PropTypes.object.isRequired,
    // Lookup of id -> { widget:, layout: }
    onItemsChange: PropTypes.func,
    // Called with lookup of id -> { widget:, layout: }
    renderWidget: PropTypes.func.isRequired,
    // Renders a widget
    width: PropTypes.number.isRequired,
    // width in pixels
    standardWidth: PropTypes.number.isRequired,
    // width in pixels of a standard container that all other widths should scale to look like. Usually 1440
    connectDropTarget: PropTypes.func.isRequired // Injected by react-dnd wrapper

  };
  return Container;
}.call(void 0);

targetSpec = {
  drop: function drop(props, monitor, component) {
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
  hover: function hover(props, monitor, component) {
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

targetCollect = function targetCollect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    clientOffset: monitor.getClientOffset()
  };
};

module.exports = DropTarget(["block-move", "block-resize"], targetSpec, targetCollect)(Container);