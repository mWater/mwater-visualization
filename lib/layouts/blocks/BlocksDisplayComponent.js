var AutoSizeComponent, BlocksDisplayComponent, DecoratedBlockComponent, DraggableBlockComponent, H, HTML5Backend, HorizontalBlockComponent, NestableDragDropContext, PaletteItemComponent, R, React, RootBlockComponent, VerticalBlockComponent, blockUtils, uuid,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

R = React.createElement;

uuid = require('node-uuid');

HTML5Backend = require('react-dnd-html5-backend');

NestableDragDropContext = require("react-library/lib/NestableDragDropContext");

DraggableBlockComponent = require("./DraggableBlockComponent");

DecoratedBlockComponent = require('../DecoratedBlockComponent');

PaletteItemComponent = require('./PaletteItemComponent');

blockUtils = require('./blockUtils');

AutoSizeComponent = require('react-library/lib/AutoSizeComponent');

BlocksDisplayComponent = (function(superClass) {
  extend(BlocksDisplayComponent, superClass);

  function BlocksDisplayComponent() {
    this.renderBlock = bind(this.renderBlock, this);
    this.handleBlockRemove = bind(this.handleBlockRemove, this);
    this.handleBlockDrop = bind(this.handleBlockDrop, this);
    return BlocksDisplayComponent.__super__.constructor.apply(this, arguments);
  }

  BlocksDisplayComponent.propTypes = {
    items: React.PropTypes.object.isRequired,
    onItemsChange: React.PropTypes.func,
    renderWidget: React.PropTypes.func.isRequired
  };

  BlocksDisplayComponent.prototype.handleBlockDrop = function(sourceBlock, targetBlock, side) {
    var items;
    items = blockUtils.removeBlock(this.props.items, sourceBlock);
    items = blockUtils.dropBlock(items, sourceBlock, targetBlock, side);
    return this.props.onItemsChange(items);
  };

  BlocksDisplayComponent.prototype.handleBlockRemove = function(block) {
    var items;
    items = blockUtils.removeBlock(this.props.items, block);
    return this.props.onItemsChange(items);
  };

  BlocksDisplayComponent.prototype.renderBlock = function(block) {
    var elem;
    switch (block.type) {
      case "root":
        return R(RootBlockComponent, {
          key: block.id,
          block: block,
          renderBlock: this.renderBlock,
          onBlockDrop: this.handleBlockDrop,
          onBlockRemove: this.handleBlockRemove
        });
      case "vertical":
        return R(VerticalBlockComponent, {
          key: block.id,
          block: block,
          renderBlock: this.renderBlock,
          onBlockDrop: this.handleBlockDrop,
          onBlockRemove: this.handleBlockRemove
        });
      case "horizontal":
        return R(HorizontalBlockComponent, {
          key: block.id,
          block: block,
          renderBlock: this.renderBlock,
          onBlockDrop: this.handleBlockDrop,
          onBlockRemove: this.handleBlockRemove
        });
      case "widget":
        elem = R(AutoSizeComponent, {
          injectWidth: true
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
              height: block.aspectRatio != null ? size.width / block.aspectRatio : void 0
            });
          };
        })(this));
        if (this.props.onItemsChange) {
          return R(DraggableBlockComponent, {
            key: block.id,
            block: block,
            onBlockDrop: this.handleBlockDrop
          }, R(DecoratedBlockComponent, {
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
        } else {
          return elem;
        }
        break;
      default:
        throw new Error("Unknown block type " + block.type);
    }
  };

  BlocksDisplayComponent.prototype.createBlockItem = function(block) {
    return function() {
      return {
        block: _.extend({}, block, {
          id: uuid.v4()
        })
      };
    };
  };

  BlocksDisplayComponent.prototype.renderPalette = function() {
    return H.td({
      key: "palette",
      style: {
        width: 102,
        verticalAlign: "top",
        height: "100%"
      }
    }, H.div({
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
      title: H.i({
        className: "fa fa-font"
      }),
      subtitle: "Title"
    }), R(PaletteItemComponent, {
      createItem: this.createBlockItem({
        type: "widget",
        widgetType: "Text",
        design: {}
      }),
      title: H.i({
        className: "fa fa-align-left"
      }),
      subtitle: "Text"
    }), R(PaletteItemComponent, {
      createItem: this.createBlockItem({
        type: "widget",
        aspectRatio: 1.4,
        widgetType: "LayeredChart",
        design: {}
      }),
      title: H.i({
        className: "fa fa-bar-chart"
      }),
      subtitle: "Chart"
    }), R(PaletteItemComponent, {
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
      title: H.i({
        className: "fa fa-map-o"
      }),
      subtitle: "Map"
    }), R(PaletteItemComponent, {
      createItem: this.createBlockItem({
        type: "widget",
        aspectRatio: 1.4,
        widgetType: "TableChart",
        design: {}
      }),
      title: H.i({
        className: "fa fa-table"
      }),
      subtitle: "Table"
    }), R(PaletteItemComponent, {
      createItem: this.createBlockItem({
        type: "widget",
        aspectRatio: 1.4,
        widgetType: "CalendarChart",
        design: {}
      }),
      title: H.i({
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
      title: H.i({
        className: "fa fa-th"
      }),
      subtitle: "Mosaic"
    })));
  };

  BlocksDisplayComponent.prototype.render = function() {
    return H.table({
      style: {
        width: "100%",
        height: "100%",
        tableLayout: "fixed"
      }
    }, H.tbody(null, H.tr(null, this.props.onItemsChange ? this.renderPalette() : void 0, H.td({
      key: "design",
      style: {
        verticalAlign: "top",
        height: "100%"
      }
    }, this.renderBlock(this.props.items)))));
  };

  return BlocksDisplayComponent;

})(React.Component);

module.exports = NestableDragDropContext(HTML5Backend)(BlocksDisplayComponent);

RootBlockComponent = (function(superClass) {
  extend(RootBlockComponent, superClass);

  function RootBlockComponent() {
    return RootBlockComponent.__super__.constructor.apply(this, arguments);
  }

  RootBlockComponent.propTypes = {
    block: React.PropTypes.object.isRequired,
    renderBlock: React.PropTypes.func.isRequired,
    onBlockDrop: React.PropTypes.func.isRequired,
    onBlockRemove: React.PropTypes.func.isRequired
  };

  RootBlockComponent.prototype.render = function() {
    return R(DraggableBlockComponent, {
      block: this.props.block,
      onBlockDrop: this.props.onBlockDrop,
      style: {
        height: "100%",
        padding: 30
      },
      onlyBottom: true
    }, H.div(null, _.map(this.props.block.blocks, (function(_this) {
      return function(block) {
        return _this.props.renderBlock(block);
      };
    })(this))));
  };

  return RootBlockComponent;

})(React.Component);

VerticalBlockComponent = (function(superClass) {
  extend(VerticalBlockComponent, superClass);

  function VerticalBlockComponent() {
    return VerticalBlockComponent.__super__.constructor.apply(this, arguments);
  }

  VerticalBlockComponent.propTypes = {
    block: React.PropTypes.object.isRequired,
    renderBlock: React.PropTypes.func.isRequired,
    onBlockDrop: React.PropTypes.func.isRequired,
    onBlockRemove: React.PropTypes.func.isRequired
  };

  VerticalBlockComponent.prototype.render = function() {
    return H.div(null, _.map(this.props.block.blocks, (function(_this) {
      return function(block) {
        return _this.props.renderBlock(block);
      };
    })(this)));
  };

  return VerticalBlockComponent;

})(React.Component);

HorizontalBlockComponent = (function(superClass) {
  extend(HorizontalBlockComponent, superClass);

  function HorizontalBlockComponent() {
    return HorizontalBlockComponent.__super__.constructor.apply(this, arguments);
  }

  HorizontalBlockComponent.propTypes = {
    block: React.PropTypes.object.isRequired,
    renderBlock: React.PropTypes.func.isRequired,
    onBlockDrop: React.PropTypes.func.isRequired,
    onBlockRemove: React.PropTypes.func.isRequired
  };

  HorizontalBlockComponent.prototype.render = function() {
    return H.table({
      style: {
        width: "100%",
        tableLayout: "fixed"
      }
    }, H.tbody(null, H.tr(null, _.map(this.props.block.blocks, (function(_this) {
      return function(block) {
        return H.td({
          style: {
            width: (100 / _this.props.block.blocks.length) + "%",
            verticalAlign: "top"
          },
          key: block.id
        }, _this.props.renderBlock(block));
      };
    })(this)))));
  };

  return HorizontalBlockComponent;

})(React.Component);
