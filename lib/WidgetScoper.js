var WidgetScoper, _;

_ = require('lodash');

module.exports = WidgetScoper = (function() {
  function WidgetScoper(scopeData) {
    this.scopeData = scopeData || {};
  }

  WidgetScoper.prototype.applyScope = function(widget, scope, filter) {
    var data, scopeData;
    data = {};
    data[widget] = {
      scope: scope,
      filter: filter
    };
    scopeData = _.extend({}, this.scopeData, data);
    return new WidgetScoper(scopeData);
  };

  WidgetScoper.prototype.getScope = function(widget) {
    if (this.scopeData[widget]) {
      return this.scopeData[widget].scope;
    }
  };

  WidgetScoper.prototype.getFilters = function(widget) {
    var filters, key, ref, value;
    filters = [];
    ref = this.scopeData;
    for (key in ref) {
      value = ref[key];
      if (key !== widget) {
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
