"use strict";

var _, _injectTableAlias;

_ = require('lodash'); // Recursively inject table alias tableAlias for `{alias}` 

_injectTableAlias = function injectTableAlias(jsonql, tableAlias) {
  // Handle empty
  if (!jsonql) {
    return jsonql;
  } // Handle arrays


  if (_.isArray(jsonql)) {
    return _.map(jsonql, function (item) {
      return _injectTableAlias(item, tableAlias);
    });
  } // Handle non-objects by leaving alone


  if (!_.isObject(jsonql)) {
    return jsonql;
  } // Handle field


  if (jsonql.type === "field" && jsonql.tableAlias === "{alias}") {
    return _.extend({}, jsonql, {
      tableAlias: tableAlias
    });
  } // Recurse object keys


  return _.mapValues(jsonql, function (value) {
    return _injectTableAlias(value, tableAlias);
  });
};

module.exports = _injectTableAlias;