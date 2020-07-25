"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var GridLayoutManager, LayoutManager, LegoLayoutEngine, R, React, _, uuid;

_ = require('lodash');
React = require('react');
R = React.createElement;
uuid = require('uuid');
LayoutManager = require('../LayoutManager');
LegoLayoutEngine = require('./LegoLayoutEngine');

module.exports = GridLayoutManager = /*#__PURE__*/function (_LayoutManager) {
  (0, _inherits2["default"])(GridLayoutManager, _LayoutManager);

  var _super = _createSuper(GridLayoutManager);

  function GridLayoutManager() {
    (0, _classCallCheck2["default"])(this, GridLayoutManager);
    return _super.apply(this, arguments);
  }

  (0, _createClass2["default"])(GridLayoutManager, [{
    key: "renderPalette",
    value: function renderPalette(width) {
      var PaletteItemComponent, createWidgetItem;
      PaletteItemComponent = require('./PaletteItemComponent');

      createWidgetItem = function createWidgetItem(type, design) {
        // Add unique id
        return function () {
          return {
            id: uuid(),
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

      return R('div', {
        className: "mwater-visualization-palette",
        style: {
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: 185
        }
      }, R(PaletteItemComponent, {
        createItem: createWidgetItem("Text", {
          style: "title"
        }),
        title: R('i', {
          className: "fa fa-font"
        }),
        subtitle: "Title"
      }), R(PaletteItemComponent, {
        createItem: createWidgetItem("Text", {}),
        title: R('i', {
          className: "fa fa-align-left"
        }),
        subtitle: "Text"
      }), R(PaletteItemComponent, {
        createItem: createWidgetItem("LayeredChart", {}),
        title: R('i', {
          className: "fa fa-bar-chart"
        }),
        subtitle: "Chart"
      }), R(PaletteItemComponent, {
        createItem: createWidgetItem("Image", {}),
        title: R('i', {
          className: "fa fa-image"
        }),
        subtitle: "Image"
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
        title: R('i', {
          className: "fa fa-map-o"
        }),
        subtitle: "Map"
      }), R(PaletteItemComponent, {
        createItem: createWidgetItem("TableChart", {}),
        title: R('i', {
          className: "fa fa-table"
        }),
        subtitle: "Table"
      }), R(PaletteItemComponent, {
        createItem: createWidgetItem("CalendarChart", {}),
        title: R('i', {
          className: "fa fa-calendar"
        }),
        subtitle: "Calendar"
      }), R(PaletteItemComponent, {
        createItem: createWidgetItem("ImageMosaicChart", {}),
        title: R('i', {
          className: "fa fa-th"
        }),
        subtitle: "Mosaic"
      }), R(PaletteItemComponent, {
        createItem: createWidgetItem("IFrame", {}),
        title: R('i', {
          className: "fa fa-youtube-play"
        }),
        subtitle: "Video"
      }));
    } // Renders the layout as a react element
    // options:
    //  width: width of layout
    //  items: opaque items object that layout manager understands
    //  onItemsChange: Called when items changes
    //  renderWidget: called with ({ id:, type:, design:, onDesignChange:, width:, height:  })

  }, {
    key: "renderLayout",
    value: function renderLayout(options) {
      var GridLayoutComponent;
      GridLayoutComponent = require('./GridLayoutComponent');

      if (options.onItemsChange != null) {
        return R('div', {
          style: {
            position: "relative",
            height: "100%",
            overflow: "hidden"
          }
        }, this.renderPalette(options.width), R('div', {
          style: {
            position: "absolute",
            left: 185,
            top: 0,
            right: 0,
            bottom: 0,
            overflow: "scroll"
          }
        }, R('div', {
          style: {
            position: "absolute",
            left: 20,
            top: 20,
            right: 20,
            bottom: 20
          }
        }, R(GridLayoutComponent, {
          width: options.width - 40 - 185,
          standardWidth: options.standardWidth - 40 - 185,
          // TODO 185? doc. needed?
          items: options.items,
          onItemsChange: options.onItemsChange,
          renderWidget: options.renderWidget
        }))));
      } else {
        return R('div', {
          style: {
            position: "relative",
            height: "100%",
            width: options.width,
            padding: 20
          }
        }, R(GridLayoutComponent, {
          width: options.width - 40,
          standardWidth: options.standardWidth - 40,
          items: options.items,
          onItemsChange: options.onItemsChange,
          renderWidget: options.renderWidget
        }));
      }
    } // Tests if dashboard has any items

  }, {
    key: "isEmpty",
    value: function isEmpty(items) {
      return _.isEmpty(items);
    } // Gets { type, design } of a widget

  }, {
    key: "getWidgetTypeAndDesign",
    value: function getWidgetTypeAndDesign(items, widgetId) {
      var ref;
      return (ref = items[widgetId]) != null ? ref.widget : void 0;
    } // Gets all widgets in items as array of { type, design }

  }, {
    key: "getAllWidgets",
    value: function getAllWidgets(items) {
      var id, item, widgets;
      widgets = [];

      for (id in items) {
        item = items[id];
        widgets.push({
          id: id,
          type: item.widget.type,
          design: item.widget.design
        });
      }

      return widgets;
    } // Add a widget to the items

  }, {
    key: "addWidget",
    value: function addWidget(items, widgetType, widgetDesign) {
      var id, item, layout; // Find place for new item

      layout = this.findOpenLayout(items, 12, 12); // Create item

      item = {
        layout: layout,
        widget: {
          type: widgetType,
          design: widgetDesign
        }
      };
      id = uuid(); // Add item

      items = _.clone(items);
      items[id] = item;
      return items;
    } // Find a layout that the new widget fits in. width and height are in 24ths

  }, {
    key: "findOpenLayout",
    value: function findOpenLayout(items, width, height) {
      var layoutEngine, layouts; // Create layout engine
      // TODO create from design
      // TODO uses fake width

      layoutEngine = new LegoLayoutEngine(100, 24); // Get existing layouts

      layouts = _.pluck(_.values(items), "layout"); // Find place for new item

      return layoutEngine.appendLayout(layouts, width, height);
    }
  }]);
  return GridLayoutManager;
}(LayoutManager);