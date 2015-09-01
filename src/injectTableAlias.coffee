_ = require 'lodash'

# Recursively inject table alias tableAlias for `{alias}` 
injectTableAlias = (jsonql, tableAlias) ->
  # Handle empty
  if not jsonql
    return jsonql

  # Handle arrays
  if _.isArray(jsonql)
    return _.map(jsonql, (item) => injectTableAlias(item, tableAlias))

  # Handle non-objects by leaving alone
  if not _.isObject(jsonql)
    return jsonql

  # Handle field
  if jsonql.type == "field" and jsonql.tableAlias == "{alias}"
    return _.extend({}, jsonql, tableAlias: tableAlias)

  # Recurse object keys
  return _.mapValues(jsonql, (value) => injectTableAlias(value, tableAlias))

module.exports = injectTableAlias
