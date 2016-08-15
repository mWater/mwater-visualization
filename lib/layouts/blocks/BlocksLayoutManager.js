var BlocksLayoutManager, H, LayoutManager, R, React, _, uuid,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

uuid = require('node-uuid');

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
      renderWidget: options.renderWidget
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

  return BlocksLayoutManager;

})(LayoutManager);
