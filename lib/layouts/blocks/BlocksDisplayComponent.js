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

/*
Renders the complete layout of the blocks and also optionally a palette to the left
that can be used to drag new items into the layout. Palette is only displayed if onItemsChange is not null
*/
var AutoSizeComponent,
    BlocksDisplayComponent,
    ClipboardPaletteItemComponent,
    DecoratedBlockComponent,
    DraggableBlockComponent,
    HorizontalBlockComponent,
    PaletteItemComponent,
    PropTypes,
    R,
    React,
    RootBlockComponent,
    VerticalBlockComponent,
    _,
    blockUtils,
    getDefaultLayoutOptions,
    uuid,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

PropTypes = require('prop-types');
_ = require('lodash');
React = require('react');
R = React.createElement;
uuid = require('uuid');
DraggableBlockComponent = require("./DraggableBlockComponent");
DecoratedBlockComponent = require('../DecoratedBlockComponent');
PaletteItemComponent = require('./PaletteItemComponent');
ClipboardPaletteItemComponent = require('./ClipboardPaletteItemComponent');
blockUtils = require('./blockUtils');
AutoSizeComponent = require('react-library/lib/AutoSizeComponent');
HorizontalBlockComponent = require('./HorizontalBlockComponent');
getDefaultLayoutOptions = require('../../dashboards/layoutOptions').getDefaultLayoutOptions;

BlocksDisplayComponent = function () {
  var BlocksDisplayComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(BlocksDisplayComponent, _React$Component);

    var _super = _createSuper(BlocksDisplayComponent);

    function BlocksDisplayComponent() {
      var _this;

      (0, _classCallCheck2["default"])(this, BlocksDisplayComponent);
      _this = _super.apply(this, arguments);
      _this.handleBlockDrop = _this.handleBlockDrop.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleBlockRemove = _this.handleBlockRemove.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleBlockUpdate = _this.handleBlockUpdate.bind((0, _assertThisInitialized2["default"])(_this));
      _this.renderBlock = _this.renderBlock.bind((0, _assertThisInitialized2["default"])(_this));
      return _this;
    }

    (0, _createClass2["default"])(BlocksDisplayComponent, [{
      key: "handleBlockDrop",
      value: function handleBlockDrop(sourceBlock, targetBlock, side) {
        var items;
        boundMethodCheck(this, BlocksDisplayComponent); // Remove source from items

        items = blockUtils.removeBlock(this.props.items, sourceBlock); // Remove source from target also

        targetBlock = blockUtils.removeBlock(targetBlock, sourceBlock);
        items = blockUtils.dropBlock(items, sourceBlock, targetBlock, side);
        items = blockUtils.cleanBlock(items);
        return this.props.onItemsChange(items);
      }
    }, {
      key: "handleBlockRemove",
      value: function handleBlockRemove(block) {
        var items;
        boundMethodCheck(this, BlocksDisplayComponent);
        items = blockUtils.removeBlock(this.props.items, block);
        items = blockUtils.cleanBlock(items);
        return this.props.onItemsChange(items);
      }
    }, {
      key: "handleBlockUpdate",
      value: function handleBlockUpdate(block) {
        var items;
        boundMethodCheck(this, BlocksDisplayComponent);
        items = blockUtils.updateBlock(this.props.items, block);
        items = blockUtils.cleanBlock(items);
        return this.props.onItemsChange(items);
      }
    }, {
      key: "renderBlock",
      value: function renderBlock(block) {
        var _this2 = this;

        var collapseColumns = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        var elem;
        boundMethodCheck(this, BlocksDisplayComponent);
        elem = null;

        switch (block.type) {
          case "root":
            return R(RootBlockComponent, {
              key: block.id,
              block: block,
              collapseColumns: collapseColumns,
              renderBlock: this.renderBlock,
              onBlockDrop: this.props.onItemsChange != null ? this.handleBlockDrop : void 0,
              onBlockRemove: this.props.onItemsChange != null ? this.handleBlockRemove : void 0
            });

          case "vertical":
            return R(VerticalBlockComponent, {
              key: block.id,
              block: block,
              collapseColumns: collapseColumns,
              renderBlock: this.renderBlock,
              onBlockDrop: this.props.onItemsChange != null ? this.handleBlockDrop : void 0,
              onBlockRemove: this.props.onItemsChange != null ? this.handleBlockRemove : void 0
            });

          case "horizontal":
            return R(HorizontalBlockComponent, {
              key: block.id,
              block: block,
              collapseColumns: collapseColumns,
              renderBlock: this.renderBlock,
              onBlockDrop: this.props.onItemsChange != null ? this.handleBlockDrop : void 0,
              onBlockRemove: this.props.onItemsChange != null ? this.handleBlockRemove : void 0,
              onBlockUpdate: this.props.onItemsChange != null ? this.handleBlockUpdate : void 0
            });

          case "spacer":
            elem = R(AutoSizeComponent, {
              injectWidth: true,
              key: block.id
            }, function (size) {
              return R('div', {
                id: block.id,
                style: {
                  width: size.width,
                  height: block.aspectRatio != null ? size.width / block.aspectRatio : void 0
                }
              });
            });

            if (this.props.onItemsChange) {
              elem = R(DraggableBlockComponent, {
                key: block.id,
                block: block,
                onBlockDrop: this.handleBlockDrop
              }, R(DecoratedBlockComponent, {
                key: block.id,
                aspectRatio: block.aspectRatio,
                onAspectRatioChange: block.aspectRatio != null ? function (aspectRatio) {
                  return _this2.props.onItemsChange(blockUtils.updateBlock(_this2.props.items, _.extend({}, block, {
                    aspectRatio: aspectRatio
                  })));
                } : void 0,
                onBlockRemove: this.props.onItemsChange ? this.handleBlockDrop.bind(null, block) : void 0
              }, elem));
            }

            break;

          case "widget":
            elem = R(AutoSizeComponent, {
              injectWidth: true,
              key: block.id
            }, function (size) {
              return _this2.props.renderWidget({
                id: block.id,
                type: block.widgetType,
                design: block.design,
                onDesignChange: _this2.props.onItemsChange ? function (design) {
                  return _this2.props.onItemsChange(blockUtils.updateBlock(_this2.props.items, _.extend({}, block, {
                    design: design
                  })));
                } : void 0,
                width: size.width,
                height: block.aspectRatio != null ? size.width / block.aspectRatio : void 0
              });
            });

            if (this.props.onItemsChange) {
              elem = R(DraggableBlockComponent, {
                key: block.id,
                block: block,
                onBlockDrop: this.handleBlockDrop
              }, R(DecoratedBlockComponent, {
                key: block.id,
                aspectRatio: block.aspectRatio,
                onAspectRatioChange: block.aspectRatio != null ? function (aspectRatio) {
                  return _this2.props.onItemsChange(blockUtils.updateBlock(_this2.props.items, _.extend({}, block, {
                    aspectRatio: aspectRatio
                  })));
                } : void 0,
                onBlockRemove: this.props.onItemsChange ? this.handleBlockDrop.bind(null, block) : void 0
              }, elem));
            }

            break;

          default:
            throw new Error("Unknown block type ".concat(block.type));
        } // Wrap block in padding


        return R('div', {
          key: block.id,
          className: "mwater-visualization-block mwater-visualization-block-".concat(block.type)
        }, elem);
      }
    }, {
      key: "createBlockItem",
      value: function createBlockItem(block) {
        // Add unique id
        return function () {
          return {
            block: _.extend({}, block, {
              id: uuid()
            })
          };
        };
      }
    }, {
      key: "renderPalette",
      value: function renderPalette() {
        return R('div', {
          key: "palette",
          style: {
            width: 141,
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0
          }
        }, R('div', {
          className: "mwater-visualization-palette",
          style: {
            height: "100%"
          }
        }, R(PaletteItemComponent, {
          createItem: this.createBlockItem({
            type: "widget",
            widgetType: "Text",
            design: {
              style: "title"
            }
          }),
          title: R('i', {
            className: "fa fa-font"
          }),
          subtitle: "Title"
        }), R(PaletteItemComponent, {
          createItem: this.createBlockItem({
            type: "widget",
            widgetType: "Text",
            design: {}
          }),
          title: R('i', {
            className: "fa fa-align-left"
          }),
          subtitle: "Text"
        }), R(PaletteItemComponent, {
          createItem: this.createBlockItem({
            type: "widget",
            aspectRatio: 1.4,
            widgetType: "Image",
            design: {}
          }),
          title: R('i', {
            className: "fa fa-picture-o"
          }),
          subtitle: "Image"
        }), R(PaletteItemComponent, {
          createItem: this.createBlockItem({
            type: "widget",
            aspectRatio: 1.4,
            widgetType: "LayeredChart",
            design: {}
          }),
          title: R('i', {
            className: "fa fa-bar-chart"
          }),
          subtitle: "Chart"
        }), !this.props.disableMaps ? R(PaletteItemComponent, {
          createItem: this.createBlockItem({
            type: "widget",
            aspectRatio: 1.4,
            widgetType: "Map",
            design: {
              baseLayer: "bing_road",
              layerViews: [],
              filters: {},
              bounds: {
                w: -40,
                n: 25,
                e: 40,
                s: -25
              }
            }
          }),
          title: R('i', {
            className: "fa fa-map-o"
          }),
          subtitle: "Map"
        }) : void 0, R(PaletteItemComponent, {
          createItem: this.createBlockItem({
            type: "widget",
            aspectRatio: 1.4,
            widgetType: "TableChart",
            design: {}
          }),
          title: R('i', {
            className: "fa fa-table"
          }),
          subtitle: "Table"
        }), R(PaletteItemComponent, {
          createItem: this.createBlockItem({
            type: "widget",
            widgetType: "PivotChart",
            design: {}
          }),
          title: R('img', {
            width: 24,
            height: 24,
            src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAb0lEQVRIx91VQQrAIAwzo/7/ydllG0MQS21EzMW2ICFtoyBZlLDn/LOgySPAG1xFDDmBtZI6efoMvODozkyL2IlTCOisfS2KrqG0RXus6fkEVBIw08khE62aQY0ogMdEswqwYouwvQ8s+4M576m4Ae/tET/u1taEAAAAAElFTkSuQmCC"
          }),
          subtitle: "Pivot"
        }), R(PaletteItemComponent, {
          createItem: this.createBlockItem({
            type: "widget",
            aspectRatio: 1.4,
            widgetType: "CalendarChart",
            design: {}
          }),
          title: R('i', {
            className: "fa fa-calendar"
          }),
          subtitle: "Calendar"
        }), R(PaletteItemComponent, {
          createItem: this.createBlockItem({
            type: "widget",
            aspectRatio: 1.4,
            widgetType: "ImageMosaicChart",
            design: {}
          }),
          title: R('i', {
            className: "fa fa-th"
          }),
          subtitle: "Mosaic"
        }), R(PaletteItemComponent, {
          createItem: this.createBlockItem({
            type: "spacer",
            aspectRatio: 1.4
          }),
          title: R('i', {
            className: "fa fa-square-o"
          }),
          subtitle: "Spacer"
        }), R(PaletteItemComponent, {
          createItem: this.createBlockItem({
            type: "widget",
            aspectRatio: 16.0 / 9.0,
            widgetType: "IFrame",
            design: {}
          }),
          title: R('i', {
            className: "fa fa-youtube-play"
          }),
          subtitle: "Video"
        }), R(PaletteItemComponent, {
          createItem: this.createBlockItem({
            type: "widget",
            widgetType: "TOC",
            design: {
              numbering: false,
              borderWeight: 2,
              header: "Contents"
            }
          }),
          title: R('i', {
            className: "fa fa-list-ol"
          }),
          subtitle: "TOC"
        }), this.props.onClipboardChange ? R(ClipboardPaletteItemComponent, {
          clipboard: this.props.clipboard,
          onClipboardChange: this.props.onClipboardChange,
          cantPasteMessage: this.props.cantPasteMessage
        }) : void 0));
      }
    }, {
      key: "render",
      value: function render() {
        var _this3 = this;

        var innerParentStyle, layoutOptions;
        layoutOptions = this.props.layoutOptions || getDefaultLayoutOptions();

        if (this.props.onItemsChange) {
          innerParentStyle = {};
          innerParentStyle.maxWidth = layoutOptions.maximumWidth || void 0;
          return R('div', {
            style: {
              width: "100%",
              height: "100%",
              overflow: "hidden",
              position: "relative"
            }
          }, this.renderPalette(), R('div', {
            style: {
              position: "absolute",
              left: 141,
              top: 0,
              bottom: 0,
              right: 0,
              overflow: "auto"
            },
            className: "mwater-visualization-block-parent-outer mwater-visualization-block-parent-outer-".concat(this.props.style || "default", " mwater-visualization-block-editing")
          }, R('div', {
            key: "inner",
            className: "mwater-visualization-block-parent-inner mwater-visualization-block-parent-inner-".concat(this.props.style || "default"),
            style: innerParentStyle
          }, this.renderBlock(this.props.items))));
        } else {
          return R(AutoSizeComponent, {
            injectWidth: true,
            injectHeight: true
          }, function (size) {
            var outerParentStyle, scale;
            outerParentStyle = {
              width: "100%",
              height: "100%",
              overflowX: "auto"
            };
            innerParentStyle = {}; // Remove padding if small

            if (size.width < 600) {
              innerParentStyle.padding = "0px";
            } // Scroll/scale


            innerParentStyle.maxWidth = layoutOptions.maximumWidth || void 0;

            if (layoutOptions.belowMinimumWidth === "scroll") {
              innerParentStyle.minWidth = layoutOptions.minimumWidth || void 0;
            } else {
              if (layoutOptions.minimumWidth != null && size.width < layoutOptions.minimumWidth) {
                scale = size.width / layoutOptions.minimumWidth;
                outerParentStyle.transform = "scale(".concat(scale, ")");
                outerParentStyle.width = size.width / scale;
                outerParentStyle.height = size.height / scale;
                outerParentStyle.transformOrigin = "top left";
              }
            }

            return R('div', {
              style: outerParentStyle,
              className: "mwater-visualization-block-parent-outer mwater-visualization-block-parent-outer-".concat(_this3.props.style || "default", " mwater-visualization-block-viewing")
            }, R('div', {
              key: "inner",
              className: "mwater-visualization-block-parent-inner mwater-visualization-block-parent-inner-".concat(_this3.props.style || "default"),
              style: innerParentStyle
            }, _this3.renderBlock(_this3.props.items, layoutOptions.collapseColumnsWidth != null && size.width <= layoutOptions.collapseColumnsWidth)));
          });
        }
      }
    }]);
    return BlocksDisplayComponent;
  }(React.Component);

  ;
  BlocksDisplayComponent.propTypes = {
    items: PropTypes.object.isRequired,
    onItemsChange: PropTypes.func,
    style: PropTypes.string,
    // Stylesheet to use. null for default
    layoutOptions: PropTypes.object,
    // layout options to use
    // Renders a widget. Passed (options)
    //  id: id of widget
    //  type: type of the widget
    //  design: design of the widget
    //  onDesignChange: called with new design of widget
    //  width: width to render. null for auto
    //  height: height to render. null for auto
    renderWidget: PropTypes.func.isRequired,
    // True to prevent maps
    disableMaps: PropTypes.bool,
    // Including onClipboardChange adds a clipboard palette item that can be used to copy and paste widgets
    clipboard: PropTypes.object,
    onClipboardChange: PropTypes.func,
    cantPasteMessage: PropTypes.string // Set if can't paste current contents (usually because missing extra tables)

  };
  return BlocksDisplayComponent;
}.call(void 0);

module.exports = BlocksDisplayComponent;

RootBlockComponent = function () {
  var RootBlockComponent = /*#__PURE__*/function (_React$Component2) {
    (0, _inherits2["default"])(RootBlockComponent, _React$Component2);

    var _super2 = _createSuper(RootBlockComponent);

    function RootBlockComponent() {
      (0, _classCallCheck2["default"])(this, RootBlockComponent);
      return _super2.apply(this, arguments);
    }

    (0, _createClass2["default"])(RootBlockComponent, [{
      key: "render",
      value: function render() {
        var _this4 = this;

        var elem;
        elem = R('div', {
          key: "root"
        }, _.map(this.props.block.blocks, function (block) {
          return _this4.props.renderBlock(block, _this4.props.collapseColumns);
        })); // If draggable

        if (this.props.onBlockDrop != null) {
          return R(DraggableBlockComponent, {
            block: this.props.block,
            onBlockDrop: this.props.onBlockDrop,
            style: {
              height: "100%"
            },
            onlyBottom: true
          }, elem);
        } else {
          return elem;
        }
      }
    }]);
    return RootBlockComponent;
  }(React.Component);

  ;
  RootBlockComponent.propTypes = {
    block: PropTypes.object.isRequired,
    collapseColumns: PropTypes.bool,
    renderBlock: PropTypes.func.isRequired,
    onBlockDrop: PropTypes.func,
    // Called with (sourceBlock, targetBlock, side) when block is dropped on it. side is top, left, bottom, right
    onBlockRemove: PropTypes.func // Called with (block) when block is removed

  };
  return RootBlockComponent;
}.call(void 0);

VerticalBlockComponent = function () {
  var VerticalBlockComponent = /*#__PURE__*/function (_React$Component3) {
    (0, _inherits2["default"])(VerticalBlockComponent, _React$Component3);

    var _super3 = _createSuper(VerticalBlockComponent);

    function VerticalBlockComponent() {
      (0, _classCallCheck2["default"])(this, VerticalBlockComponent);
      return _super3.apply(this, arguments);
    }

    (0, _createClass2["default"])(VerticalBlockComponent, [{
      key: "render",
      value: function render() {
        var _this5 = this;

        return R('div', null, _.map(this.props.block.blocks, function (block) {
          return _this5.props.renderBlock(block, _this5.props.collapseColumns);
        }));
      }
    }]);
    return VerticalBlockComponent;
  }(React.Component);

  ;
  VerticalBlockComponent.propTypes = {
    block: PropTypes.object.isRequired,
    collapseColumns: PropTypes.bool,
    renderBlock: PropTypes.func.isRequired,
    onBlockDrop: PropTypes.func,
    // Called with (sourceBlock, targetBlock, side) when block is dropped on it. side is top, left, bottom, right
    onBlockRemove: PropTypes.func // Called with (block) when block is removed

  };
  return VerticalBlockComponent;
}.call(void 0);