var CachingDataSource, DataSource, LRU,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

DataSource = require('mwater-expressions').DataSource;

LRU = require("lru-cache");

module.exports = CachingDataSource = (function(superClass) {
  extend(CachingDataSource, superClass);

  function CachingDataSource(options) {
    this.perform = options.perform;
    this.cache = LRU({
      max: 50,
      maxAge: 1000 * 15 * 60
    });
  }

  CachingDataSource.prototype.performQuery = function(query, cb) {
    var cacheKey, cachedRows;
    cacheKey = JSON.stringify(query);
    cachedRows = this.cache.get(cacheKey);
    if (cachedRows) {
      return cb(null, cachedRows);
    }
    return this.perform(query, (function(_this) {
      return function(err, rows) {
        if (!err) {
          _this.cache.set(cacheKey, rows);
        }
        return cb(err, rows);
      };
    })(this));
  };

  return CachingDataSource;

})(DataSource);
