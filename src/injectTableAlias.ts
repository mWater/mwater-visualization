// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import _ from "lodash"

// Recursively inject table alias tableAlias for `{alias}`
function injectTableAlias(jsonql, tableAlias) {
  // Handle empty
  if (!jsonql) {
    return jsonql
  }

  // Handle arrays
  if (_.isArray(jsonql)) {
    return _.map(jsonql, (item) => injectTableAlias(item, tableAlias))
  }

  // Handle non-objects by leaving alone
  if (!_.isObject(jsonql)) {
    return jsonql
  }

  // Handle field
  if (jsonql.type === "field" && jsonql.tableAlias === "{alias}") {
    return _.extend({}, jsonql, { tableAlias })
  }

  // Recurse object keys
  return _.mapValues(jsonql, (value) => injectTableAlias(value, tableAlias))
}

export default injectTableAlias
