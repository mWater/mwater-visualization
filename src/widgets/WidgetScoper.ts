import _ from "lodash"

// Scopes widgets, applying scope that a widget specifies to itself and the filter to other
// widgets. Immutable.
// Scope is a JSON object consisting of:
//  name: human-readable name for the scope/filter
//  filter: filter for other widgets in format { table: table id, jsonql: JsonQL with {alias} for the table name to filter by }
//  data: internal, opaque data that the widget understands. opaque
export default class WidgetScoper {
  scopes: any
  
  constructor(scopes?: any) {
    this.scopes = scopes || {}
  }

  // Applies a scope to a particular widget. Filter will be applied to all others
  applyScope(widgetId: any, scope: any) {
    const data = {}
    data[widgetId] = scope
    const scopes = _.extend({}, this.scopes, data)
    return new WidgetScoper(scopes)
  }

  // Gets the scope of a widget
  getScope(widgetId: any) {
    if (this.scopes[widgetId]) {
      return this.scopes[widgetId]
    }
  }

  // Gets lookup of scopes by widget id
  getScopes() {
    return this.scopes
  }

  getFilters(widgetId: any) {
    const filters = []
    for (let key in this.scopes) {
      const value = this.scopes[key]
      if (key !== widgetId && value && value.filter) {
        filters.push(value.filter)
      }
    }

    return filters
  }

  reset() {
    return new WidgetScoper()
  }
}
