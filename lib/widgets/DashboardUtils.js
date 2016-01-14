var LegoLayoutEngine, uuid;

uuid = require('node-uuid');

LegoLayoutEngine = require('./LegoLayoutEngine');

exports.addWidget = function(dashboardDesign, widgetType, widgetDesign, width, height) {
  var id, item, items, layout;
  dashboardDesign = dashboardDesign || {
    items: {}
  };
  layout = exports.findOpenLayout(dashboardDesign, width, height);
  item = {
    layout: layout,
    widget: {
      type: widgetType,
      design: widgetDesign
    }
  };
  id = uuid.v4();
  items = _.clone(dashboardDesign.items);
  items[id] = item;
  dashboardDesign = _.extend({}, dashboardDesign, {
    items: items
  });
  return dashboardDesign;
};

exports.findOpenLayout = function(dashboardDesign, width, height) {
  var layoutEngine, layouts;
  layoutEngine = new LegoLayoutEngine(100, 24);
  layouts = _.pluck(_.values(dashboardDesign.items), "layout");
  return layoutEngine.appendLayout(layouts, width, height);
};
