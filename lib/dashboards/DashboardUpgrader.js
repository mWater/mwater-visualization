var DashboardUpgrader, WidgetFactory, _, uuid;

_ = require('lodash');

uuid = require('node-uuid');

WidgetFactory = require('../widgets/WidgetFactory');

module.exports = DashboardUpgrader = (function() {
  function DashboardUpgrader() {}

  DashboardUpgrader.prototype.upgrade = function(design) {
    var convertBlock, i, id, item, items, len, li, lineItems, newItems, y;
    items = _.clone(design.items);
    newItems = {
      id: "root",
      type: "root",
      blocks: []
    };
    convertBlock = function(id, item) {
      var block, widget;
      widget = WidgetFactory.createWidget(item.widget.type);
      block = {
        type: "widget",
        widgetType: item.widget.type,
        design: item.widget.design,
        id: id
      };
      if (!widget.isAutoHeight()) {
        block.aspectRatio = item.layout.w / item.layout.h;
      }
      return block;
    };
    y = 0;
    while (_.keys(items).length > 0) {
      lineItems = [];
      for (id in items) {
        item = items[id];
        if (item.layout.y <= y && item.layout.y + item.layout.h > y) {
          lineItems.push(id);
        }
      }
      lineItems = _.sortBy(lineItems, function(id) {
        return items[id].layout.x;
      });
      if (lineItems.length > 1) {
        newItems.blocks.push({
          id: uuid.v4(),
          type: "horizontal",
          blocks: _.map(lineItems, function(li) {
            return convertBlock(li, items[li]);
          })
        });
        for (i = 0, len = lineItems.length; i < len; i++) {
          li = lineItems[i];
          delete items[li];
        }
      } else if (lineItems.length === 1) {
        newItems.blocks.push(convertBlock(lineItems[0], items[lineItems[0]]));
        delete items[lineItems[0]];
      }
      y += 1;
    }
    return {
      items: newItems,
      layout: "blocks",
      style: "default"
    };
  };

  return DashboardUpgrader;

})();


/*

Old style:

items: dashboard items, indexed by id. Each item contains:

 `layout`: layout-engine specific data for layout of item
 `widget`: details of the widget (see below)

`widget` contains:
 `type`: type string of the widget. Understandable by widget factory
 `version`: version of the widget. semver string
 `design`: design of the widget as a JSON object


New style:

id: id of block
type: "root"/"vertical"/"horizontal"/"widget"/"spacer"
widgetType: if a widget
aspectRatio: w/h if not autoHeight
design: widget design
weights: weights for proportioning horizontal blocks. Default is 1
blocks: other blocks if not a widget
 */
