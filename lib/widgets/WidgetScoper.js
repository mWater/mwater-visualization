"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var WidgetScoper, _;

_ = require('lodash'); // Scopes widgets, applying scope that a widget specifies to itself and the filter to other
// widgets. Immutable.
// Scope is a JSON object consisting of:
//  name: human-readable name for the scope/filter
//  filter: filter for other widgets in format { table: table id, jsonql: JsonQL with {alias} for the table name to filter by }
//  data: internal, opaque data that the widget understands. opaque

module.exports = WidgetScoper = /*#__PURE__*/function () {
  function WidgetScoper(scopes) {
    (0, _classCallCheck2["default"])(this, WidgetScoper);
    this.scopes = scopes || {};
  } // Applies a scope to a particular widget. Filter will be applied to all others


  (0, _createClass2["default"])(WidgetScoper, [{
    key: "applyScope",
    value: function applyScope(widgetId, scope) {
      var data, scopes;
      data = {};
      data[widgetId] = scope;
      scopes = _.extend({}, this.scopes, data);
      return new WidgetScoper(scopes);
    } // Gets the scope of a widget

  }, {
    key: "getScope",
    value: function getScope(widgetId) {
      if (this.scopes[widgetId]) {
        return this.scopes[widgetId];
      }
    } // Gets lookup of scopes by widget id

  }, {
    key: "getScopes",
    value: function getScopes() {
      return this.scopes;
    }
  }, {
    key: "getFilters",
    value: function getFilters(widgetId) {
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
    }
  }, {
    key: "reset",
    value: function reset() {
      return new WidgetScoper();
    }
  }]);
  return WidgetScoper;
}();