var GridLayoutComponent, GridLayoutManager, H, LayoutManager, LegoLayoutEngine, PaletteItemComponent, R, React, WidgetComponent, WidgetContainerComponent, _, uuid,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

uuid = require('node-uuid');

LayoutManager = require('../LayoutManager');

LegoLayoutEngine = require('./LegoLayoutEngine');

WidgetContainerComponent = require('./WidgetContainerComponent');

PaletteItemComponent = require('./PaletteItemComponent');

module.exports = GridLayoutManager = (function(superClass) {
  extend(GridLayoutManager, superClass);

  function GridLayoutManager() {
    return GridLayoutManager.__super__.constructor.apply(this, arguments);
  }

  GridLayoutManager.prototype.renderPalette = function(width) {
    var createWidgetItem;
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
    }));
  };

  GridLayoutManager.prototype.renderLayout = function(options) {
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

GridLayoutComponent = (function(superClass) {
  extend(GridLayoutComponent, superClass);

  function GridLayoutComponent() {
    return GridLayoutComponent.__super__.constructor.apply(this, arguments);
  }

  GridLayoutComponent.propTypes = {
    width: React.PropTypes.number.isRequired,
    standardWidth: React.PropTypes.number.isRequired,
    items: React.PropTypes.any,
    onItemsChange: React.PropTypes.func,
    renderWidget: React.PropTypes.func.isRequired
  };

  GridLayoutComponent.prototype.renderPageBreaks = function(layoutEngine, layouts) {
    var elems, height, i, j, number, pageHeight, ref;
    height = layoutEngine.calculateHeight(layouts);
    pageHeight = this.props.width / 7.5 * 10;
    number = Math.floor(height / pageHeight);
    elems = [];
    if (number > 0) {
      for (i = j = 1, ref = number; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
        elems.push(H.div({
          className: "mwater-visualization-page-break",
          style: {
            position: "absolute",
            top: i * pageHeight
          }
        }));
      }
    }
    return elems;
  };

  GridLayoutComponent.prototype.render = function() {
    var layoutEngine, layouts, style;
    layoutEngine = new LegoLayoutEngine(this.props.width, 24);
    layouts = _.mapValues(this.props.items, "layout");
    style = {
      height: "100%",
      position: "relative"
    };
    return H.div({
      style: style
    }, R(WidgetContainerComponent, {
      layoutEngine: layoutEngine,
      items: this.props.items,
      onItemsChange: this.props.onItemsChange,
      renderWidget: this.props.renderWidget,
      width: this.props.width,
      standardWidth: this.props.standardWidth
    }), this.renderPageBreaks(layoutEngine, layouts));
  };

  return GridLayoutComponent;

})(React.Component);

WidgetComponent = (function(superClass) {
  extend(WidgetComponent, superClass);

  function WidgetComponent() {
    return WidgetComponent.__super__.constructor.apply(this, arguments);
  }

  WidgetComponent.prototype.render = function() {
    if (this.props.onDesignChange) {
      return R(DecoratedBlockComponent, {
        connectMoveHandle: this.props.connectMoveHandle,
        connectResizeHandle: this.props.connectResizeHandle,
        onBlockRemove: this.props.onBlockRemove
      }, this.props.renderWidget({
        id: this.props.id,
        type: this.props.type,
        design: this.props.design,
        onDesignChange: this.props.onDesignChange,
        width: this.props.width - 10,
        height: this.props.height - 10
      }));
    } else {
      return H.div({
        className: "mwater-visualization-block-view"
      }, this.props.renderWidget({
        id: this.props.id,
        type: this.props.type,
        design: this.props.design,
        onDesignChange: this.props.onDesignChange,
        width: this.props.width - 10,
        height: this.props.height - 10
      }));
    }
  };

  return WidgetComponent;

})(React.Component);
