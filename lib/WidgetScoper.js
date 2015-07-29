var WidgetScoper, _;

_ = require('lodash');

module.exports = WidgetScoper = (function() {
  function WidgetScoper(scopes) {
    this.scopes = scopes || {};
  }

  WidgetScoper.prototype.applyScope = function(widgetId, scope) {
    var data, scopes;
    data = {};
    data[widgetId] = scope;
    scopes = _.extend({}, this.scopes, data);
    return new WidgetScoper(scopes);
  };

  WidgetScoper.prototype.getScope = function(widgetId) {
    if (this.scopes[widgetId]) {
      return this.scopes[widgetId];
    }
  };

  WidgetScoper.prototype.getScopes = function() {
    return this.scopes;
  };

  WidgetScoper.prototype.getFilters = function(widgetId) {
    var filters, key, ref, value;
    filters = [];
    ref = this.scopes;
    for (key in ref) {
      value = ref[key];
      if (key !== widgetId && value && value.filter) {
        filters.push(value.filter);
      }
    }
    return filters;
  };

  WidgetScoper.prototype.reset = function() {
    return new WidgetScoper();
  };

  return WidgetScoper;

})();
