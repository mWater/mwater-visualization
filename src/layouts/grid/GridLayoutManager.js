let GridLayoutManager;
import _ from 'lodash';
import React from 'react';
const R = React.createElement;

import uuid from 'uuid';
import LayoutManager from '../LayoutManager';
import LegoLayoutEngine from './LegoLayoutEngine';
import AutoSizeComponent from 'react-library/lib/AutoSizeComponent';

export default GridLayoutManager = class GridLayoutManager extends LayoutManager {
  renderPalette(width) {
    const PaletteItemComponent = require('./PaletteItemComponent');

    const createWidgetItem = (type, design) => // Add unique id
    () => ({
      id: uuid(),
      widget: { type, design },
      bounds: { x: 0, y: 0, width: width/3, height: width/4 }
    });

    return R('div', {className: "mwater-visualization-palette", style: { position: "absolute", top: 0, left: 0, bottom: 0, width: 185 }},
      R(PaletteItemComponent, { 
        createItem: createWidgetItem("Text", { style: "title" }),
        title: R('i', {className: "fa fa-font"}),
        subtitle: "Title"
      }
      ),
      R(PaletteItemComponent, { 
        createItem: createWidgetItem("Text", {}),
        title: R('i', {className: "fa fa-align-left"}),
        subtitle: "Text"
      }
      ),
      R(PaletteItemComponent, {
        createItem: createWidgetItem("LayeredChart", {}),
        title: R('i', {className: "fa fa-bar-chart"}),
        subtitle: "Chart"
      }
      ),
      R(PaletteItemComponent, {
        createItem: createWidgetItem("Image", {}),
        title: R('i', {className: "fa fa-image"}),
        subtitle: "Image"
      }
      ),
      R(PaletteItemComponent, {
        createItem: createWidgetItem("Map", { baseLayer: "bing_road", layerViews: [], filters: {}, bounds: { w: -40, n: 25, e: 40, s: -25 } }),
        title: R('i', {className: "fa fa-map-o"}),
        subtitle: "Map"
      }
      ),
      R(PaletteItemComponent, {
        createItem: createWidgetItem("TableChart", {}),
        title: R('i', {className: "fa fa-table"}),
        subtitle: "Table"
      }
      ),
      R(PaletteItemComponent, {
        createItem: createWidgetItem("CalendarChart", {}),
        title: R('i', {className: "fa fa-calendar"}),
        subtitle: "Calendar"
      }
      ),
      R(PaletteItemComponent, {
        createItem: createWidgetItem("ImageMosaicChart", {}),
        title: R('i', {className: "fa fa-th"}),
        subtitle: "Mosaic"
      }
      ),
      R(PaletteItemComponent, {
        createItem: createWidgetItem("IFrame", {}),
        title: R('i', {className: "fa fa-youtube-play"}),
        subtitle: "Video"
      }
      )
    );
  }

  // Renders the layout as a react element
  // options:
  //  items: opaque items object that layout manager understands
  //  onItemsChange: Called when items changes
  //  renderWidget: called with ({ id:, type:, design:, onDesignChange:, width:, height:  })
  renderLayout(options) {
    const GridLayoutComponent = require('./GridLayoutComponent');

    return R(AutoSizeComponent, { injectWidth: true, injectHeight: true }, 
      size => {
        if (options.onItemsChange != null) {
          return R('div', {style: { position: "relative", height: "100%", overflow: "hidden" }}, 
            this.renderPalette(size.width),
            R('div', {style: { position: "absolute", left: 185, top: 0, right: 0, bottom: 0, overflow: "scroll" }},
              R('div', {style: { position: "absolute", left: 20, top: 20, right: 20, bottom: 20 }},
                R(GridLayoutComponent, { 
                  width: size.width - 40 - 185,
                  items: options.items,
                  onItemsChange: options.onItemsChange,
                  renderWidget: options.renderWidget
                }
                )
              )
            )
          );
        } else {
          return R('div', {style: { position: "relative", height: "100%", width: size.width, padding: 20 }},
            R(GridLayoutComponent, { 
              width: size.width - 40,
              items: options.items,
              onItemsChange: options.onItemsChange,
              renderWidget: options.renderWidget
            }
            )
          );
        }
    });
  }

  // Tests if dashboard has any items
  isEmpty(items) {
    return _.isEmpty(items);
  }

  // Gets { type, design } of a widget
  getWidgetTypeAndDesign(items, widgetId) { 
    return items[widgetId]?.widget;
  }

  // Gets all widgets in items as array of { type, design }
  getAllWidgets(items) {
    const widgets = [];
    for (let id in items) {
      const item = items[id];
      widgets.push({ id, type: item.widget.type, design: item.widget.design });
    } 

    return widgets;
  }

  // Add a widget to the items
  addWidget(items, widgetType, widgetDesign) {
    // Find place for new item
    const layout = this.findOpenLayout(items, 12, 12);

    // Create item
    const item = {
      layout,
      widget: {
        type: widgetType,
        design: widgetDesign
      }
    };

    const id = uuid();

    // Add item
    items = _.clone(items);
    items[id] = item;

    return items;
  }

  // Find a layout that the new widget fits in. width and height are in 24ths
  findOpenLayout(items, width, height) {
    // Create layout engine
    // TODO create from design
    // TODO uses fake width
    const layoutEngine = new LegoLayoutEngine(100, 24);

    // Get existing layouts
    const layouts = _.pluck(_.values(items), "layout");

    // Find place for new item
    return layoutEngine.appendLayout(layouts, width, height);
  }
};
