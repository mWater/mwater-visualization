var WidgetFactory;

module.exports = WidgetFactory = (function() {
  function WidgetFactory() {}

  WidgetFactory.prototype.createWidget = function(type, version, design) {
    throw new Error("Not implemented");
  };

  return WidgetFactory;

})();
