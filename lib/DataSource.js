var DataSource, _, async;

_ = require('lodash');

async = require('async');

module.exports = DataSource = (function() {
  function DataSource() {}

  DataSource.prototype.performQueries = function(queries, cb) {
    return async.map(_.pairs(queries), (function(_this) {
      return function(item, callback) {
        return _this.performQuery(item[1], function(err, rows) {
          return callback(err, [item[0], rows]);
        });
      };
    })(this), (function(_this) {
      return function(err, items) {
        if (err) {
          return cb(err);
        } else {
          return cb(null, _.object(items));
        }
      };
    })(this));
  };

  DataSource.prototype.performQuery = function(query, cb) {
    throw new Error("Not implemented");
  };

  return DataSource;

})();
