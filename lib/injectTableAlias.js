var _, injectTableAlias;

_ = require('lodash');

injectTableAlias = function(jsonql, tableAlias) {
  if (!jsonql) {
    return jsonql;
  }
  if (_.isArray(jsonql)) {
    return _.map(jsonql, (function(_this) {
      return function(item) {
        return injectTableAlias(item, tableAlias);
      };
    })(this));
  }
  if (!_.isObject(jsonql)) {
    return jsonql;
  }
  if (jsonql.type === "field" && jsonql.tableAlias === "{alias}") {
    return _.extend({}, jsonql, {
      tableAlias: tableAlias
    });
  }
  return _.mapValues(jsonql, (function(_this) {
    return function(value) {
      return injectTableAlias(value, tableAlias);
    };
  })(this));
};

module.exports = injectTableAlias;
