var BlocksLayoutManager, LayoutManager, R, React, _, uuid,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

R = React.createElement;

uuid = require('uuid');

LayoutManager = require('../LayoutManager');

module.exports = BlocksLayoutManager = (function(superClass) {
  extend(BlocksLayoutManager, superClass);

  function BlocksLayoutManager() {
    return BlocksLayoutManager.__super__.constructor.apply(this, arguments);
  }

  BlocksLayoutManager.prototype.renderLayout = function(options) {
    var BlocksDisplayComponent;
    BlocksDisplayComponent = require('./BlocksDisplayComponent');
    return R(BlocksDisplayComponent, {
      items: options.items || {
        id: "root",
        type: "root",
        blocks: []
      },
      onItemsChange: options.onItemsChange,
      style: options.style,
      renderWidget: options.renderWidget,
      disableMaps: options.disableMaps
    });
  };

  BlocksLayoutManager.prototype.isEmpty = function(items) {
    var ref;
    return !items || ((ref = items.blocks) != null ? ref.length : void 0) === 0;
  };

  BlocksLayoutManager.prototype.getWidgetTypeAndDesign = function(items, widgetId) {
    var block, i, len, ref, value;
    if (items.type === "widget" && items.id === widgetId) {
      return {
        type: items.widgetType,
        design: items.design
      };
    }
    if (items.blocks) {
      ref = items.blocks;
      for (i = 0, len = ref.length; i < len; i++) {
        block = ref[i];
        value = this.getWidgetTypeAndDesign(block, widgetId);
        if (value) {
          return value;
        }
      }
    }
    return null;
  };

  BlocksLayoutManager.prototype.getAllWidgets = function(items) {
    if (items.type === "widget") {
      return [
        {
          id: items.id,
          type: items.widgetType,
          design: items.design
        }
      ];
    }
    if (items.blocks) {
      return _.flatten(_.map(items.blocks, (function(_this) {
        return function(item) {
          return _this.getAllWidgets(item);
        };
      })(this)));
    }
    return [];
  };

  BlocksLayoutManager.prototype.addWidget = function(items, widgetType, widgetDesign) {
    items = items || {
      type: "root",
      id: "root",
      blocks: []
    };
    items.blocks.push({
      type: "widget",
      id: uuid(),
      widgetType: widgetType,
      design: widgetDesign,
      aspectRatio: 1.4
    });
    return items;
  };

  return BlocksLayoutManager;

})(LayoutManager);
