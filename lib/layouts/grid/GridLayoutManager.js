var GridLayoutManager, H, LayoutManager, R, React, _, uuid,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

uuid = require('node-uuid');

LayoutManager = require('../LayoutManager');

module.exports = GridLayoutManager = (function(superClass) {
  extend(GridLayoutManager, superClass);

  function GridLayoutManager() {
    return GridLayoutManager.__super__.constructor.apply(this, arguments);
  }

  GridLayoutManager.prototype.renderPalette = function(width) {
    var PaletteItemComponent, createWidgetItem;
    PaletteItemComponent = require('./PaletteItemComponent');
    createWidgetItem = function(type, design) {
      return function() {
        return {
          id: uuid.v4(),
          widget: {
            type: type,
            design: design
          },
          bounds: {
            x: 0,
            y: 0,
            width: width / 3,
            height: width / 4
          }
        };
      };
    };
    return H.div({
      className: "mwater-visualization-palette",
      style: {
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0
      }
    }, R(PaletteItemComponent, {
      createItem: createWidgetItem("Text", {
        style: "title"
      }),
      title: H.i({
        className: "fa fa-font"
      }),
      subtitle: "Title"
    }), R(PaletteItemComponent, {
      createItem: createWidgetItem("Text", {}),
      title: H.i({
        className: "fa fa-align-left"
      }),
      subtitle: "Text"
    }), R(PaletteItemComponent, {
      createItem: createWidgetItem("LayeredChart", {}),
      title: H.i({
        className: "fa fa-bar-chart"
      }),
      subtitle: "Chart"
    }), R(PaletteItemComponent, {
      createItem: createWidgetItem("Map", {
        baseLayer: "bing_road",
        layerViews: [],
        filters: {},
        bounds: {
          w: -40,
          n: 25,
          e: 40,
          s: -25
        }
      }),
      title: H.i({
        className: "fa fa-map-o"
      }),
      subtitle: "Map"
    }), R(PaletteItemComponent, {
      createItem: createWidgetItem("TableChart", {}),
      title: H.i({
        className: "fa fa-table"
      }),
      subtitle: "Table"
    }), R(PaletteItemComponent, {
      createItem: createWidgetItem("CalendarChart", {}),
      title: H.i({
        className: "fa fa-calendar"
      }),
      subtitle: "Calendar"
    }), R(PaletteItemComponent, {
      createItem: createWidgetItem("ImageMosaicChart", {}),
      title: H.i({
        className: "fa fa-th"
      }),
      subtitle: "Mosaic"
    }), R(PaletteItemComponent, {
      createItem: createWidgetItem("IFrame", {}),
      title: H.i({
        className: "fa fa-youtube-play"
      }),
      subtitle: "Video"
    }), R(PaletteItemComponent, {
      createItem: createWidgetItem("Image", {}),
      title: H.i({
        className: "fa fa-image"
      }),
      subtitle: "Image"
    }));
  };

  GridLayoutManager.prototype.renderLayout = function(options) {
    var GridLayoutComponent;
    GridLayoutComponent = require('./GridLayoutComponent');
    if (options.onItemsChange != null) {
      return H.div({
        style: {
          position: "relative",
          height: "100%"
        }
      }, this.renderPalette(options.width), H.div({
        style: {
          position: "absolute",
          left: 108,
          top: 0,
          right: 0,
          bottom: 0
        }
      }, R(GridLayoutComponent, {
        width: options.width - 108,
        standardWidth: options.standardWidth - 108,
        items: options.items,
        onItemsChange: options.onItemsChange,
        renderWidget: options.renderWidget
      })));
    } else {
      return H.div({
        style: {
          position: "relative",
          height: "100%"
        }
      }, R(GridLayoutComponent, {
        width: options.width,
        standardWidth: options.standardWidth,
        items: options.items,
        onItemsChange: options.onItemsChange,
        renderWidget: options.renderWidget
      }));
    }
  };

  GridLayoutManager.prototype.isEmpty = function(items) {
    return _.isEmpty(items);
  };

  GridLayoutManager.prototype.getWidgetTypeAndDesign = function(items, widgetId) {
    var ref;
    return (ref = items[widgetId]) != null ? ref.widget : void 0;
  };

  return GridLayoutManager;

})(LayoutManager);
