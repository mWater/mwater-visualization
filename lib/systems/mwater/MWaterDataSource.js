var DataSource, MWaterDataSource, superagent,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

superagent = require("superagent");

DataSource = require('../../DataSource');

module.exports = MWaterDataSource = (function(superClass) {
  extend(MWaterDataSource, superClass);

  function MWaterDataSource(apiUrl, client) {
    this.apiUrl = apiUrl;
    this.client = client;
  }

  MWaterDataSource.prototype.performQuery = function(query, cb) {
    return superagent.get(this.apiUrl + "jsonql").query({
      jsonql: JSON.stringify(query),
      client: this.client
    }).set({
      "Cache-Control": "max-age=30,must-revalidate"
    }).end((function(_this) {
      return function(err, res) {
        if (err) {
          return cb(err);
        }
        return cb(null, res.body);
      };
    })(this));
  };

  return MWaterDataSource;

})(DataSource);
