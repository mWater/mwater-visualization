var Widget;

module.exports = Widget = (function() {
  function Widget() {}

  Widget.prototype.createViewElement = function(options) {
    throw new Error("Not implemented");
  };

  Widget.prototype.createDesignerElement = function(options) {
    throw new Error("Not implemented");
  };

  return Widget;

})();
