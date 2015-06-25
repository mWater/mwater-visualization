_ = require 'lodash'

# Scopes widgets, applying scope that a widget specifies to itself and the filter to other
# widgets. Immutable.
module.exports = class WidgetScoper
  constructor: (scopeData) ->
    @scopeData = scopeData or {}

  # Applies a scope to a particular widget (id). Filter will be applied to all others
  applyScope: (widget, scope, filter) ->
    data = {}
    data[widget] = { scope: scope, filter: filter }
    scopeData = _.extend({}, @scopeData, data)
    return new WidgetScoper(scopeData)

  # Gets the scope of a widget
  getScope: (widget) ->
    if @scopeData[widget]
      return @scopeData[widget].scope

  getFilters: (widget) ->
    filters = []
    for key, value of @scopeData
      if key != widget
        filters.push(value.filter)

    return filters
