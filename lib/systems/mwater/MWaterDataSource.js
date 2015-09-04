var DataSource, LRU, MWaterDataSource,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

LRU = require("lru-cache");

DataSource = require('../../DataSource');

module.exports = MWaterDataSource = (function(superClass) {
  extend(MWaterDataSource, superClass);

  function MWaterDataSource(apiUrl, client) {
    this.apiUrl = apiUrl;
    this.client = client;
    this.cache = LRU({
      max: 50,
      maxAge: 1000 * 15 * 60
    });
  }

  MWaterDataSource.prototype.clearCache = function() {
    return this.cache.reset();
  };

  MWaterDataSource.prototype.performQuery = function(query, cb) {
    var cacheKey, cachedRows, url;
    cacheKey = JSON.stringify(query);
    cachedRows = this.cache.get(cacheKey);
    if (cachedRows) {
      return cb(null, cachedRows);
    }
    url = this.apiUrl + "jsonql?jsonql=" + encodeURIComponent(JSON.stringify(query));
    if (this.client) {
      url += "&client=" + this.client;
    }
    return $.getJSON(url, (function(_this) {
      return function(rows) {
        _this.cache.set(cacheKey, rows);
        return cb(null, rows);
      };
    })(this)).fail((function(_this) {
      return function(xhr) {
        return cb(new Error(xhr.responseText));
      };
    })(this));
  };

  return MWaterDataSource;

})(DataSource);
