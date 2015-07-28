_ = require 'lodash'

# Scopes widgets, applying scope that a widget specifies to itself and the filter to other
# widgets. Immutable.
# Scope is a JSON object consisting of:
#  name: human-readable name for the scope/filter
#  filter: expression that will be used to filter other widgets
#  data: internal, opaque data that the widget understands
module.exports = class WidgetScoper
  constructor: (scopes) ->
    @scopes = scopes or {}

  # Applies a scope to a particular widget. Filter will be applied to all others
  applyScope: (widgetId, scope) ->
    data = {}
    data[widgetId] = scope
    scopes = _.extend({}, @scopes, data)
    return new WidgetScoper(scopes)

  # Gets the scope of a widget
  getScope: (widgetId) ->
    if @scopes[widgetId]
      return @scopes[widgetId]

  # Gets lookup of scopes by widget id
  getScopes: -> @scopes

  getFilters: (widgetId) ->
    filters = []
    for key, value of @scopes
      if key != widgetId and value.filter
        filters.push(value.filter)

    return filters

  reset: ->
    return new WidgetScoper()