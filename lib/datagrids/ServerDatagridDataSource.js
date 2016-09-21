var DatagridDataSource, ServerDatagridDataSource, querystring,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

querystring = require('querystring');

DatagridDataSource = require('./DatagridDataSource');

module.exports = ServerDatagridDataSource = (function(superClass) {
  extend(ServerDatagridDataSource, superClass);

  function ServerDatagridDataSource(options) {
    this.options = options;
  }

  ServerDatagridDataSource.prototype.getRows = function(design, offset, limit, filters, callback) {
    var query, url;
    query = {
      client: this.options.client,
      share: this.options.share,
      filters: JSON.stringify(filters),
      rev: this.options.rev,
      offset: offset,
      limit: limit
    };
    url = this.options.apiUrl + ("datagrids/" + this.options.datagridId + "/data?") + querystring.stringify(query);
    return $.getJSON(url, (function(_this) {
      return function(data) {
        return callback(null, data);
      };
    })(this)).fail((function(_this) {
      return function(xhr) {
        console.log(xhr.responseText);
        return callback(new Error(xhr.responseText));
      };
    })(this));
  };

  return ServerDatagridDataSource;

})(DatagridDataSource);
