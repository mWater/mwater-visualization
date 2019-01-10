var AutoSizeComponent, BlocksDisplayComponent, ClipboardPaletteItemComponent, DecoratedBlockComponent, DraggableBlockComponent, HorizontalBlockComponent, PaletteItemComponent, PropTypes, R, React, RootBlockComponent, VerticalBlockComponent, _, blockUtils, uuid,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

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


/*
Renders the complete layout of the blocks and also optionally a palette to the left
that can be used to drag new items into the layout. Palette is only displayed if onItemsChange is not null
 */

BlocksDisplayComponent = (function(superClass) {
  extend(BlocksDisplayComponent, superClass);

  function BlocksDisplayComponent() {
    this.renderBlock = bind(this.renderBlock, this);
    this.handleBlockUpdate = bind(this.handleBlockUpdate, this);
    this.handleBlockRemove = bind(this.handleBlockRemove, this);
    this.handleBlockDrop = bind(this.handleBlockDrop, this);
    return BlocksDisplayComponent.__super__.constructor.apply(this, arguments);
  }

  BlocksDisplayComponent.propTypes = {
    items: PropTypes.object.isRequired,
    onItemsChange: PropTypes.func,
    style: PropTypes.string,
    renderWidget: PropTypes.func.isRequired,
    disableMaps: PropTypes.bool,
    clipboard: PropTypes.object,
    onClipboardChange: PropTypes.func,
    cantPasteMessage: PropTypes.string
  };

  BlocksDisplayComponent.prototype.handleBlockDrop = function(sourceBlock, targetBlock, side) {
    var items;
    items = blockUtils.removeBlock(this.props.items, sourceBlock);
    targetBlock = blockUtils.removeBlock(targetBlock, sourceBlock);
    items = blockUtils.dropBlock(items, sourceBlock, targetBlock, side);
    items = blockUtils.cleanBlock(items);
    return this.props.onItemsChange(items);
  };

  BlocksDisplayComponent.prototype.handleBlockRemove = function(block) {
    var items;
    items = blockUtils.removeBlock(this.props.items, block);
    items = blockUtils.cleanBlock(items);
    return this.props.onItemsChange(items);
  };

  BlocksDisplayComponent.prototype.handleBlockUpdate = function(block) {
    var items;
    items = blockUtils.updateBlock(this.props.items, block);
    items = blockUtils.cleanBlock(items);
    return this.props.onItemsChange(items);
  };

  BlocksDisplayComponent.prototype.renderBlock = function(block) {
    var elem;
    elem = null;
    switch (block.type) {
      case "root":
        return R(RootBlockComponent, {
          key: block.id,
          block: block,
          renderBlock: this.renderBlock,
          onBlockDrop: this.props.onItemsChange != null ? this.handleBlockDrop : void 0,
          onBlockRemove: this.props.onItemsChange != null ? this.handleBlockRemove : void 0
        });
      case "vertical":
        return R(VerticalBlockComponent, {
          key: block.id,
          block: block,
          renderBlock: this.renderBlock,
          onBlockDrop: this.props.onItemsChange != null ? this.handleBlockDrop : void 0,
          onBlockRemove: this.props.onItemsChange != null ? this.handleBlockRemove : void 0
        });
      case "horizontal":
        return R(HorizontalBlockComponent, {
          key: block.id,
          block: block,
          renderBlock: this.renderBlock,
          onBlockDrop: this.props.onItemsChange != null ? this.handleBlockDrop : void 0,
          onBlockRemove: this.props.onItemsChange != null ? this.handleBlockRemove : void 0,
          onBlockUpdate: this.props.onItemsChange != null ? this.handleBlockUpdate : void 0
        });
      case "spacer":
        elem = R(AutoSizeComponent, {
          injectWidth: true,
          key: block.id
        }, (function(_this) {
          return function(size) {
            return R('div', {
              id: block.id,
              style: {
                width: size.width,
                height: block.aspectRatio != null ? size.width / block.aspectRatio : void 0
              }
            });
          };
        })(this));
        if (this.props.onItemsChange) {
          elem = R(DraggableBlockComponent, {
            key: block.id,
            block: block,
            onBlockDrop: this.handleBlockDrop
          }, R(DecoratedBlockComponent, {
            key: block.id,
            aspectRatio: block.aspectRatio,
            onAspectRatioChange: block.aspectRatio != null ? (function(_this) {
              return function(aspectRatio) {
                return _this.props.onItemsChange(blockUtils.updateBlock(_this.props.items, _.extend({}, block, {
                  aspectRatio: aspectRatio
                })));
              };
            })(this) : void 0,
            onBlockRemove: (this.props.onItemsChange ? this.handleBlockDrop.bind(null, block) : void 0)
          }, elem));
        }
        break;
      case "widget":
        elem = R(AutoSizeComponent, {
          injectWidth: true,
          key: block.id
        }, (function(_this) {
          return function(size) {
            return _this.props.renderWidget({
              id: block.id,
              type: block.widgetType,
              design: block.design,
              onDesignChange: _this.props.onItemsChange ? function(design) {
                return _this.props.onItemsChange(blockUtils.updateBlock(_this.props.items, _.extend({}, block, {
                  design: design
                })));
              } : void 0,
              width: size.width,
              standardWidth: size.width,
              height: block.aspectRatio != null ? size.width / block.aspectRatio : void 0
            });
          };
        })(this));
        if (this.props.onItemsChange) {
          elem = R(DraggableBlockComponent, {
            key: block.id,
            block: block,
            onBlockDrop: this.handleBlockDrop
          }, R(DecoratedBlockComponent, {
            key: block.id,
            aspectRatio: block.aspectRatio,
            onAspectRatioChange: block.aspectRatio != null ? (function(_this) {
              return function(aspectRatio) {
                return _this.props.onItemsChange(blockUtils.updateBlock(_this.props.items, _.extend({}, block, {
                  aspectRatio: aspectRatio
                })));
              };
            })(this) : void 0,
            onBlockRemove: (this.props.onItemsChange ? this.handleBlockDrop.bind(null, block) : void 0)
          }, elem));
        }
        break;
      default:
        throw new Error("Unknown block type " + block.type);
    }
    return R('div', {
      key: block.id,
      className: "mwater-visualization-block mwater-visualization-block-" + block.type
    }, elem);
  };

  BlocksDisplayComponent.prototype.createBlockItem = function(block) {
    return function() {
      return {
        block: _.extend({}, block, {
          id: uuid()
        })
      };
    };
  };

  BlocksDisplayComponent.prototype.renderPalette = function() {
    return R('div', {
      key: "palette",
      style: {
        width: 185,
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
  };

  BlocksDisplayComponent.prototype.render = function() {
    if (this.props.onItemsChange) {
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
          left: 185,
          top: 0,
          bottom: 0,
          right: 0,
          overflow: "auto"
        },
        className: "mwater-visualization-block-parent-outer mwater-visualization-block-parent-outer-" + (this.props.style || "default") + " mwater-visualization-block-editing"
      }, R('div', {
        key: "inner",
        className: "mwater-visualization-block-parent-inner mwater-visualization-block-parent-inner-" + (this.props.style || "default")
      }, this.renderBlock(this.props.items))));
    } else {
      return R('div', {
        style: {
          width: "100%",
          height: "100%",
          overflowX: "auto"
        },
        className: "mwater-visualization-block-parent-outer mwater-visualization-block-parent-outer-" + (this.props.style || "default") + " mwater-visualization-block-viewing"
      }, R('div', {
        key: "inner",
        className: "mwater-visualization-block-parent-inner mwater-visualization-block-parent-inner-" + (this.props.style || "default")
      }, this.renderBlock(this.props.items)));
    }
  };

  return BlocksDisplayComponent;

})(React.Component);

module.exports = BlocksDisplayComponent;

RootBlockComponent = (function(superClass) {
  extend(RootBlockComponent, superClass);

  function RootBlockComponent() {
    return RootBlockComponent.__super__.constructor.apply(this, arguments);
  }

  RootBlockComponent.propTypes = {
    block: PropTypes.object.isRequired,
    renderBlock: PropTypes.func.isRequired,
    onBlockDrop: PropTypes.func,
    onBlockRemove: PropTypes.func
  };

  RootBlockComponent.prototype.render = function() {
    var elem;
    elem = R('div', {
      key: "root"
    }, _.map(this.props.block.blocks, (function(_this) {
      return function(block) {
        return _this.props.renderBlock(block);
      };
    })(this)));
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
  };

  return RootBlockComponent;

})(React.Component);

VerticalBlockComponent = (function(superClass) {
  extend(VerticalBlockComponent, superClass);

  function VerticalBlockComponent() {
    return VerticalBlockComponent.__super__.constructor.apply(this, arguments);
  }

  VerticalBlockComponent.propTypes = {
    block: PropTypes.object.isRequired,
    renderBlock: PropTypes.func.isRequired,
    onBlockDrop: PropTypes.func,
    onBlockRemove: PropTypes.func
  };

  VerticalBlockComponent.prototype.render = function() {
    return R('div', null, _.map(this.props.block.blocks, (function(_this) {
      return function(block) {
        return _this.props.renderBlock(block);
      };
    })(this)));
  };

  return VerticalBlockComponent;

})(React.Component);
