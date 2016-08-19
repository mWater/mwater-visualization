var LayoutManager;

module.exports = LayoutManager = (function() {
  function LayoutManager() {}

  LayoutManager.prototype.renderLayout = function(options) {
    return null;
  };

  LayoutManager.prototype.isEmpty = function(items) {
    return true;
  };

  LayoutManager.prototype.getWidgetTypeAndDesign = function(items, widgetId) {
    return null;
  };

  LayoutManager.createLayoutManager = function(type) {
    var BlocksLayoutManager, GridLayoutManager;
    type = type || "grid";
    switch (type) {
      case "grid":
        GridLayoutManager = require('./grid/GridLayoutManager');
        return new GridLayoutManager();
      case "blocks":
        BlocksLayoutManager = require('./blocks/BlocksLayoutManager');
        return new BlocksLayoutManager();
      default:
        throw new Error("Unknown layout manager type " + type);
    }
    return {
      addWidget: function(items, widgetType, widgetDesign) {
        throw new Error("Not implemented");
      }
    };
  };

  return LayoutManager;

})();
