let BlocksLayoutManager;
import _ from 'lodash';
import React from 'react';
const R = React.createElement;
import uuid from 'uuid';
import LayoutManager from '../LayoutManager';

export default BlocksLayoutManager = class BlocksLayoutManager extends LayoutManager {
  // Renders the layout as a react element
  // options:
  //  items: opaque items object that layout manager understands
  //  onItemsChange: Called when items changes
  //  renderWidget: called with ({ id:, type:, design:, onDesignChange:, width:, height:  })
  //  style: style to use for layout. null for default
  //  layoutOptions: layout options to use
  //  disableMaps: true to disable maps
  //  clipboard: clipboard contents
  //  onClipboardChange: called when clipboard is changed
  //  cantPasteMesssage: message to display if clipboard can't be pasted into current dashboard
  renderLayout(options) {
    const BlocksDisplayComponent = require('./BlocksDisplayComponent');
    return R(BlocksDisplayComponent, {
      items: options.items || { id: "root", type: "root", blocks: [] },
      onItemsChange: options.onItemsChange,
      style: options.style,
      layoutOptions: options.layoutOptions,
      renderWidget: options.renderWidget,
      disableMaps: options.disableMaps,
      clipboard: options.clipboard,
      onClipboardChange: options.onClipboardChange,
      cantPasteMessage: options.cantPasteMessage
    }
    );
  }

  // Tests if dashboard has any items
  isEmpty(items) {
    return !items || (items.blocks?.length === 0);
  }

  // Gets { type, design } of a widget
  getWidgetTypeAndDesign(items, widgetId) { 
    if ((items.type === "widget") && (items.id === widgetId)) {
      return { type: items.widgetType, design: items.design };
    }

    if (items.blocks) {
      for (let block of items.blocks) {
        const value = this.getWidgetTypeAndDesign(block, widgetId);
        if (value) {
          return value;
        }
      }
    }
        
    return null;
  }

  // Gets all widgets in items as array of { id, type, design }
  getAllWidgets(items) {
    if (items.type === "widget") { 
      return [{ id: items.id, type: items.widgetType, design: items.design }];
    }

    if (items.blocks) {
      return _.flatten(_.map(items.blocks, item => this.getAllWidgets(item)));
    }
      
    return [];
  }

  // Add a widget, returning new items
  addWidget(items, widgetType, widgetDesign) {
    // Add to root block
    items = items || { type: "root", id: "root", blocks: [] };
    items.blocks.push({ type: "widget", id: uuid(), widgetType, design: widgetDesign, aspectRatio: 1.4 });

    return items;
  }
};
